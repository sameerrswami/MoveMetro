const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');
const { cacheHitCounter, cacheMissCounter } = require('../utils/metrics');

/**
 * CacheManager - Redis-based distributed cache with LRU eviction.
 * Supports TTL, cache invalidation by pattern, and graceful fallback.
 */
class CacheManager {
    constructor() {
        this.defaultTTL = 3600; // 1 hour
        this.routeCacheTTL = 1800; // 30 minutes for route results
        this.graphCacheTTL = 7200; // 2 hours for graph data
    }

    _getClient() {
        return getRedisClient();
    }

    async get(key, type = 'general') {
        try {
            const client = this._getClient();
            if (!client) return null;

            const data = await client.get(key);
            if (data) {
                cacheHitCounter.inc({ type });
                return JSON.parse(data);
            }
            cacheMissCounter.inc({ type });
            return null;
        } catch (error) {
            logger.error(`Cache GET error for key ${key}: ${error.message}`);
            return null;
        }
    }

    async set(key, value, ttl = null, type = 'general') {
        try {
            const client = this._getClient();
            if (!client) return false;

            const serialized = JSON.stringify(value);
            const expiry = ttl || this.defaultTTL;

            await client.setex(key, expiry, serialized);
            return true;
        } catch (error) {
            logger.error(`Cache SET error for key ${key}: ${error.message}`);
            return false;
        }
    }

    async del(key) {
        try {
            const client = this._getClient();
            if (!client) return false;

            await client.del(key);
            return true;
        } catch (error) {
            logger.error(`Cache DEL error for key ${key}: ${error.message}`);
            return false;
        }
    }

    async invalidatePattern(pattern) {
        try {
            const client = this._getClient();
            if (!client) return false;

            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(...keys);
                logger.info(`Invalidated ${keys.length} cache keys matching ${pattern}`);
            }
            return true;
        } catch (error) {
            logger.error(`Cache invalidation error for pattern ${pattern}: ${error.message}`);
            return false;
        }
    }

    // Route-specific cache methods
    async getRouteCache(source, dest, mode) {
        const key = `route:${source}:${dest}:${mode}`;
        return this.get(key, 'route');
    }

    async setRouteCache(source, dest, mode, result) {
        const key = `route:${source}:${dest}:${mode}`;
        return this.set(key, result, this.routeCacheTTL, 'route');
    }

    async invalidateAllRoutes() {
        return this.invalidatePattern('route:*');
    }

    async invalidateGraphCache() {
        return this.invalidatePattern('graph:*');
    }

    async flush() {
        try {
            const client = this._getClient();
            if (!client) return false;
            await client.flushdb();
            logger.info('Cache flushed');
            return true;
        } catch (error) {
            logger.error(`Cache flush error: ${error.message}`);
            return false;
        }
    }
}

module.exports = new CacheManager();
