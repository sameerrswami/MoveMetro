// Mock env before requiring qrService
jest.mock('../../src/config/env', () => ({
    qrHmacSecret: 'test-secret-key-for-qr-testing',
    jwt: {
        secret: 'test-jwt-secret',
        refreshSecret: 'test-refresh-secret',
        expiresIn: '15m',
        refreshExpiresIn: '7d',
    },
}));

describe('QR Service', () => {
    let qrService;

    beforeEach(() => {
        jest.resetModules();
        qrService = require('../../src/services/qrService');
    });

    test('generates HMAC QR string', () => {
        const qr = qrService.generateQR({
            bookingId: 'booking-123',
            source: 'RJVCHK',
            destination: 'HZKHS',
        });

        expect(qr).toBeTruthy();
        expect(typeof qr).toBe('string');
        expect(qr).toContain('.');
    });

    test('verifies valid HMAC QR string', () => {
        const qr = qrService.generateQR({
            bookingId: 'booking-456',
            source: 'KSHGT',
            destination: 'RJVCHK',
        });

        const result = qrService.verifyQR(qr);
        expect(result.valid).toBe(true);
        expect(result.data.bookingId).toBe('booking-456');
        expect(result.data.source).toBe('KSHGT');
        expect(result.data.destination).toBe('RJVCHK');
    });

    test('rejects tampered QR string', () => {
        const qr = qrService.generateQR({
            bookingId: 'booking-789',
            source: 'RJVCHK',
            destination: 'AIIMS',
        });

        // Tamper with the signature
        const tampered = qr.slice(0, -5) + 'XXXXX';
        const result = qrService.verifyQR(tampered);
        expect(result.valid).toBe(false);
    });

    test('rejects malformed QR string', () => {
        const result = qrService.verifyQR('not-a-valid-qr-string');
        expect(result.valid).toBe(false);
    });

    test('can switch to JWT strategy', () => {
        qrService.setStrategy('jwt');

        const qr = qrService.generateQR({
            bookingId: 'booking-jwt-123',
            source: 'SMPBD',
            destination: 'HUDACC',
        });

        expect(qr).toBeTruthy();
        expect(typeof qr).toBe('string');

        const result = qrService.verifyQR(qr);
        expect(result.valid).toBe(true);
        expect(result.data.bookingId).toBe('booking-jwt-123');

        // Switch back
        qrService.setStrategy('hmac');
    });

    test('generates unique QR strings for different bookings', () => {
        const qr1 = qrService.generateQR({ bookingId: 'b1', source: 'A', destination: 'B' });
        const qr2 = qrService.generateQR({ bookingId: 'b2', source: 'A', destination: 'B' });
        expect(qr1).not.toBe(qr2);
    });
});
