const { Booking, Stop, User, sequelize } = require('../models');
const { getSequelize } = require('../config/db');
const PathOptimizer = require('../engine/PathOptimizer');
const qrService = require('./qrService');
const walletService = require('./walletService');
const env = require('../config/env');

const {
    NotFoundError,
    SameStopError,
    NoPathError,
    DuplicateBookingError,
    ValidationError,
} = require('../utils/errors');
const { bookingCounter } = require('../utils/metrics');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

class BookingService {
    constructor() {
        this.pathOptimizer = new PathOptimizer();
    }

    async createBooking({ userId, sourceStopId, destinationStopId, mode, idempotencyKey }) {
        const db = getSequelize();

        // Check idempotency
        if (idempotencyKey) {
            const existing = await Booking.findOne({ where: { idempotency_key: idempotencyKey } });
            if (existing) {
                logger.info(`Duplicate booking prevented by idempotency key: ${idempotencyKey}`);
                return existing; // IDEMPOTENCY: Return the existing booking instead of throwing error if it's already created
            }
        }

        // Validate stops exist
        const sourceStop = await Stop.findByPk(sourceStopId);
        if (!sourceStop) throw new NotFoundError(`Source stop with id ${sourceStopId} not found`);

        const destStop = await Stop.findByPk(destinationStopId);
        if (!destStop) throw new NotFoundError(`Destination stop with id ${destinationStopId} not found`);

        // Prevent same-stop booking
        if (sourceStopId === destinationStopId) throw new SameStopError();

        // Compute optimal path
        const pathResult = this.pathOptimizer.findOptimalPath(
            sourceStopId,
            destinationStopId,
            { mode: mode || 'OPTIMAL', transferPenalty: env.transferPenalty }
        );

        if (!pathResult) throw new NoPathError(sourceStop.code, destStop.code);

        // Calculate Fare
        const baseFare = 20;
        const perStopFare = 5;
        const interchangePenalty = 10;
        const fare = baseFare + (pathResult.totalStops * perStopFare) + (pathResult.totalTransfers * interchangePenalty);

        // Check and Deduct Wallet Balance (Atomic-like check)
        const balance = await walletService.getBalance(userId);
        if (parseFloat(balance) < fare) {
            throw new ValidationError(`Insufficient balance. Fare: ₹${fare}, Wallet: ₹${balance}`);
        }

        // Enrich route snapshot
        const stopIds = pathResult.path;
        const pathStops = await Stop.findAll({ where: { id: { [Op.in]: stopIds } } });
        const stopMap = {};
        pathStops.forEach((s) => {

            stopMap[s.id] = {
                name: s.name,
                code: s.code,
                latitude: s.latitude,
                longitude: s.longitude
            };
        });


        const routeSnapshot = {
            path: pathResult.path.map((id) => ({
                stopId: id,
                ...(stopMap[id] || {}),
            })),
            segments: pathResult.segments,
            algorithm: this.pathOptimizer.getStrategyName(),
            mode: mode || 'OPTIMAL',
            fare: fare,
            computedAt: new Date().toISOString(),
        };


        // Generate QR string (we pass a temporary ID or wait until we have a real one)
        // For production grade, we should generate the QR with the final booking ID.
        // Since we use UUIDs, we can generate one now.
        const bookingId = uuidv4();
        const qrString = qrService.generateQR({
            bookingId: bookingId,
            source: sourceStop.code,
            destination: destStop.code,
        });

        const t = await db.transaction();
        try {
            const booking = await Booking.create({
                id: bookingId,
                user_id: userId,
                source_stop_id: sourceStopId,
                destination_stop_id: destinationStopId,
                total_travel_time: pathResult.totalTime,
                total_stops: pathResult.totalStops,
                total_transfers: pathResult.totalTransfers,
                route_snapshot: routeSnapshot,
                qr_string: qrString,
                status: 'ACTIVE',
                idempotency_key: idempotencyKey,
            }, { transaction: t });

            // Deduct from wallet
            await walletService.deductBalance(
                userId,
                routeSnapshot.fare,
                `Metro Booking: ${sourceStop.name} -> ${destStop.name}`,
                booking.id,
                t
            );

            await t.commit();


            bookingCounter.inc({ status: 'ACTIVE' });
            logger.info(`Booking created: ${booking.id} | ${sourceStop.code} -> ${destStop.code}`);

            // Return with populated stops
            return this.getBookingById(booking.id);
        } catch (error) {
            await t.rollback();
            logger.error(`Booking creation failed: ${error.message}`);
            if (error.name === 'SequelizeUniqueConstraintError') throw new DuplicateBookingError();
            throw error;
        }
    }

    async getBookingById(bookingId) {
        const booking = await Booking.findByPk(bookingId, {
            include: [
                { model: Stop, as: 'sourceStop', attributes: ['name', 'code'] },
                { model: Stop, as: 'destinationStop', attributes: ['name', 'code'] },
                { model: User, as: 'user', attributes: ['name', 'email'] },
            ],
        });

        if (!booking) throw new NotFoundError(`Booking with id ${bookingId} not found`);
        return booking;
    }

    async getUserBookings(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;

        const { count, rows: bookings } = await Booking.findAndCountAll({
            where: { user_id: userId },
            include: [
                { model: Stop, as: 'sourceStop', attributes: ['name', 'code'] },
                { model: Stop, as: 'destinationStop', attributes: ['name', 'code'] },
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset,
        });

        return {
            bookings,
            pagination: {
                page,
                limit,
                total: count,
                pages: Math.ceil(count / limit),
            },
        };
    }

    async cancelBooking(bookingId, userId) {
        const booking = await Booking.findByPk(bookingId);
        if (!booking) throw new NotFoundError(`Booking with id ${bookingId} not found`);

        if (booking.user_id !== userId) {
            throw new ValidationError('You can only cancel your own bookings');
        }

        if (booking.status === 'CANCELLED') {
            throw new ValidationError('Booking is already cancelled');
        }

        await booking.update({ status: 'CANCELLED' });

        bookingCounter.inc({ status: 'CANCELLED' });
        logger.info(`Booking cancelled: ${bookingId}`);
        return booking;
    }

    async verifyQR(qrString) {
        return qrService.verifyQR(qrString);
    }

    async getUserStats(userId) {
        const stats = await Booking.findAll({
            where: { user_id: userId },
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status']
        });

        const result = {
            total: 0,
            ACTIVE: 0,
            CANCELLED: 0,
            COMPLETED: 0
        };

        stats.forEach(s => {
            const status = s.get('status');
            const count = parseInt(s.get('count'));
            result[status] = count;
            result.total += count;
        });

        return result;
    }
}

module.exports = new BookingService();
