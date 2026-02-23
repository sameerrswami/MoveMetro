const Redis = require('ioredis');
const logger = require('../utils/logger');
const env = require('./env');

let redisClient = null;

const connectRedis = () => {
    try {
        const isTest = process.env.NODE_ENV === 'test' || env.nodeEnv === 'test';

        redisClient = new Redis({
            host: env.redis.host,
            port: env.redis.port,
            maxRetriesPerRequest: isTest ? 1 : 3,
            retryStrategy(times) {
                if (isTest && times > 1) return null; // Don't retry in tests
                const delay = Math.min(times * 200, 3000);
                return delay;
            },
            lazyConnect: true,
            showFriendlyErrorStack: true
        });

        redisClient.on('connect', () => {
            logger.info('Redis connected successfully');
        });

        redisClient.on('error', (err) => {
            if (!isTest) {
                logger.error(`Redis error: ${err.message}`);
            }
        });

        redisClient.on('close', () => {
            if (!isTest) {
                logger.warn('Redis connection closed');
            }
        });

        redisClient.connect().catch((err) => {
            if (!isTest) {
                logger.error(`Redis connection failed: ${err.message}`);
            }
        });

        return redisClient;
    } catch (error) {
        logger.error(`Redis initialization error: ${error.message}`);
        return null;
    }
};

const getRedisClient = () => {
    if (!redisClient) {
        return connectRedis();
    }
    return redisClient;
};

const disconnectRedis = async () => {
    if (redisClient) {
        try {
            await redisClient.quit();
        } catch (err) {
            // Ignore error on disconnect
        }
        redisClient = null;
    }
};

module.exports = { connectRedis, getRedisClient, disconnectRedis };
