const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const apiLimiter = rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        errorCode: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        timestamp: new Date().toISOString(),
    },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: {
        errorCode: 'AUTH_RATE_LIMIT',
        message: 'Too many authentication attempts. Please try again later.',
        timestamp: new Date().toISOString(),
    },
});

module.exports = { apiLimiter, authLimiter };
