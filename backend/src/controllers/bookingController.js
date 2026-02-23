const bookingService = require('../services/bookingService');

class BookingController {
    async createBooking(req, res, next) {
        try {
            const idempotencyKey = req.headers['x-idempotency-key'] || req.body.idempotencyKey;

            const booking = await bookingService.createBooking({
                userId: req.user.id,
                sourceStopId: req.body.sourceStopId,
                destinationStopId: req.body.destinationStopId,
                mode: req.body.mode,
                idempotencyKey,
            });

            res.status(201).json({
                success: true,
                message: 'Booking created successfully',
                data: booking,
            });
        } catch (error) {
            next(error);
        }
    }

    async getBooking(req, res, next) {
        try {
            const booking = await bookingService.getBookingById(req.params.id);
            res.status(200).json({ success: true, data: booking });
        } catch (error) {
            next(error);
        }
    }

    async getUserBookings(req, res, next) {
        try {
            const userId = req.params.userId || req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const result = await bookingService.getUserBookings(userId, page, limit);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async cancelBooking(req, res, next) {
        try {
            const booking = await bookingService.cancelBooking(req.params.id, req.user.id);
            res.status(200).json({
                success: true,
                message: 'Booking cancelled',
                data: booking,
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyQR(req, res, next) {
        try {
            const result = await bookingService.verifyQR(req.body.qrString);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BookingController();
