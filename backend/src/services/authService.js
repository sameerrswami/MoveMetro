const jwt = require('jsonwebtoken');
const { User } = require('../models');
const env = require('../config/env');
const { UnauthorizedError, ConflictError } = require('../utils/errors');
const logger = require('../utils/logger');

class AuthService {
    async register({ name, email, password }) {
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: normalizedEmail } });
        if (existingUser) {
            throw new ConflictError('Email already registered');
        }

        const user = await User.create({
            name,
            email: normalizedEmail,
            password_hash: password, // Sequelize hook will hash it
        });

        logger.info(`User registered: ${normalizedEmail}`);

        const tokens = this._generateTokens(user);

        return {
            user: user.toSafeJSON(),
            ...tokens,
        };
    }

    async login({ email, password }) {
        const user = await User.scope('withPassword').findOne({
            where: { email: email.toLowerCase().trim() }
        });

        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new UnauthorizedError('Invalid email or password');
        }

        logger.info(`User logged in: ${email}`);
        const tokens = this._generateTokens(user);

        return {
            user: user.toSafeJSON(),
            ...tokens,
        };
    }

    async refreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, env.jwt.refreshSecret);
            const user = await User.findByPk(decoded.id);
            if (!user) {
                throw new UnauthorizedError('User not found');
            }

            const tokens = this._generateTokens(user);
            return tokens;
        } catch (error) {
            throw new UnauthorizedError('Invalid refresh token');
        }
    }

    _generateTokens(user) {
        const payload = { id: user.id, email: user.email, role: user.role };

        const accessToken = jwt.sign(payload, env.jwt.secret, {
            expiresIn: env.jwt.expiresIn,
        });

        const refreshToken = jwt.sign(payload, env.jwt.refreshSecret, {
            expiresIn: env.jwt.refreshExpiresIn,
        });

        return { accessToken, refreshToken };
    }
}

module.exports = new AuthService();
