const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { createBookingValidator, verifyQRValidator } = require('../validators/bookingValidator');
const validate = require('../middleware/validate');

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a new booking
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sourceStopId, destinationStopId]
 *             properties:
 *               sourceStopId: { type: string }
 *               destinationStopId: { type: string }
 *               mode: { type: string, enum: [OPTIMAL, SHORTEST_TIME, MINIMUM_STOPS, MINIMUM_TRANSFERS] }
 *     responses:
 *       201: { description: Booking created }
 */
router.post('/', createBookingValidator, validate, bookingController.createBooking);

/**
 * @swagger
 * /api/v1/bookings/verify-qr:
 *   post:
 *     tags: [Bookings]
 *     summary: Verify QR code
 *     security: [{ bearerAuth: [] }]
 */
router.post('/verify-qr', verifyQRValidator, validate, bookingController.verifyQR);

router.get('/my', bookingController.getUserBookings);
router.get('/:id', bookingController.getBooking);
router.get('/user/:userId', bookingController.getUserBookings);
router.patch('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
