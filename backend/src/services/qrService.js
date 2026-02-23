const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * QR Service - Factory Pattern
 * Supports multiple QR string generation strategies:
 * 1. HMAC-based: UUID + HMAC SHA256 signature
 * 2. JWT-based: Signed JWT token with booking info
 */

// Strategy Interface
class QRStrategy {
    generate(bookingData) {
        throw new Error('generate() must be implemented');
    }
    verify(qrString) {
        throw new Error('verify() must be implemented');
    }
}

// HMAC Strategy
class HMACQRStrategy extends QRStrategy {
    generate(bookingData) {
        const { bookingId, source, destination } = bookingData;
        const payload = `${bookingId}:${source}:${destination}:${Date.now()}`;
        const signature = crypto
            .createHmac('sha256', env.qrHmacSecret)
            .update(payload)
            .digest('hex');
        return `${Buffer.from(payload).toString('base64')}.${signature}`;
    }

    verify(qrString) {
        try {
            const [encodedPayload, signature] = qrString.split('.');
            const payload = Buffer.from(encodedPayload, 'base64').toString();
            const expectedSignature = crypto
                .createHmac('sha256', env.qrHmacSecret)
                .update(payload)
                .digest('hex');

            if (signature !== expectedSignature) {
                return { valid: false, reason: 'Invalid signature' };
            }

            const [bookingId, source, destination, timestamp] = payload.split(':');
            return { valid: true, data: { bookingId, source, destination, timestamp } };
        } catch (error) {
            return { valid: false, reason: 'Malformed QR string' };
        }
    }
}

// JWT Strategy
class JWTQRStrategy extends QRStrategy {
    generate(bookingData) {
        const { bookingId, source, destination } = bookingData;
        return jwt.sign(
            { bookingId, source, destination },
            env.qrHmacSecret,
            { expiresIn: '24h' }
        );
    }

    verify(qrString) {
        try {
            const decoded = jwt.verify(qrString, env.qrHmacSecret);
            return { valid: true, data: decoded };
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return { valid: false, reason: 'QR expired' };
            }
            return { valid: false, reason: 'Invalid QR' };
        }
    }
}

// Factory
class QRFactory {
    static create(type = 'hmac') {
        switch (type) {
            case 'jwt':
                return new JWTQRStrategy();
            case 'hmac':
            default:
                return new HMACQRStrategy();
        }
    }
}

class QRService {
    constructor() {
        this.strategy = QRFactory.create('hmac');
    }

    setStrategy(type) {
        this.strategy = QRFactory.create(type);
        logger.info(`QR strategy changed to: ${type}`);
    }

    generateQR(bookingData) {
        return this.strategy.generate(bookingData);
    }

    verifyQR(qrString) {
        return this.strategy.verify(qrString);
    }
}

module.exports = new QRService();
