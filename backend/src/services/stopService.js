const { Stop } = require('../models');
const { NotFoundError, ConflictError } = require('../utils/errors');
const cacheManager = require('../cache/cacheManager');
const logger = require('../utils/logger');

class StopService {
    async createStop({ name, code }) {
        try {
            const normalizedCode = code.toUpperCase().trim();
            const existing = await Stop.findOne({ where: { code: normalizedCode } });
            if (existing) {
                throw new ConflictError(`Stop with code ${code} already exists`);
            }

            const stop = await Stop.create({ name, code: normalizedCode });

            logger.info(`Stop created: ${name} (${normalizedCode})`);
            return stop;
        } catch (error) {
            if (error instanceof ConflictError) throw error;
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new ConflictError(`Stop with code ${code} already exists`);
            }
            throw error;
        }
    }

    async getStopById(id) {
        const stop = await Stop.findByPk(id);
        if (!stop) {
            throw new NotFoundError(`Stop with id ${id} not found`);
        }
        return stop;
    }

    async getStopByCode(code) {
        const stop = await Stop.findOne({ where: { code: code.toUpperCase() } });
        if (!stop) {
            throw new NotFoundError(`Stop with code ${code} not found`);
        }
        return stop;
    }

    async getAllStops() {
        return Stop.findAll({ order: [['name', 'ASC']] });
    }

    async updateStop(id, updates) {
        const stop = await Stop.findByPk(id);
        if (!stop) {
            throw new NotFoundError(`Stop with id ${id} not found`);
        }

        if (updates.code) {
            updates.code = updates.code.toUpperCase().trim();
        }

        await stop.update(updates);

        // Invalidate caches
        await cacheManager.invalidateAllRoutes();

        logger.info(`Stop updated: ${stop.name} (${stop.code})`);
        return stop;
    }

    async deleteStop(id) {
        const stop = await Stop.findByPk(id);
        if (!stop) {
            throw new NotFoundError(`Stop with id ${id} not found`);
        }

        await stop.destroy();

        await cacheManager.invalidateAllRoutes();
        logger.info(`Stop deleted: ${stop.name} (${stop.code})`);
        return stop;
    }
}

module.exports = new StopService();
