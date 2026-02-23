const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

/**
 * Authentication middleware - validates JWT tokens
 */
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, env.jwt.secret);

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new UnauthorizedError('Token expired'));
        }
        if (error.name === 'JsonWebTokenError') {
            return next(new UnauthorizedError('Invalid token'));
        }
        next(error);
    }
};

/**
 * Authorization middleware - checks user role
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new UnauthorizedError('Authentication required'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError('Insufficient permissions'));
        }
        next();
    };
};

module.exports = { authenticate, authorize };
