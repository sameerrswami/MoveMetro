const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

/**
 * Global error handler middleware.
 * Returns standardized error responses.
 */
const errorHandler = (err, req, res, _next) => {
    // Log the error
    if (err.isOperational) {
        logger.warn(`Operational error: ${err.message}`, {
            errorCode: err.errorCode,
            statusCode: err.statusCode,
            path: req.path,
        });
    } else {
        logger.error(`Unexpected error: ${err.message}`, {
            stack: err.stack,
            path: req.path,
        });
    }

    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        const messages = err.errors.map((e) => e.message);
        return res.status(400).json({
            errorCode: 'VALIDATION_ERROR',
            message: messages.join(', '),
            timestamp: new Date().toISOString(),
        });
    }

    // Handle Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0]?.path || 'unknown';
        return res.status(409).json({
            errorCode: 'DUPLICATE_KEY',
            message: `Duplicate value for field: ${field}`,
            timestamp: new Date().toISOString(),
        });
    }

    // Handle Sequelize foreign key constraint error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            errorCode: 'FOREIGN_KEY_CONSTRAINT',
            message: 'Referenced resource does not exist',
            timestamp: new Date().toISOString(),
        });
    }

    // Handle operational AppErrors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            errorCode: err.errorCode,
            message: err.message,
            timestamp: new Date().toISOString(),
        });
    }

    // Default 500 error
    return res.status(500).json({
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
        timestamp: new Date().toISOString(),
    });
};

module.exports = errorHandler;
