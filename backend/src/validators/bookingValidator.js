const { body } = require('express-validator');

const createBookingValidator = [
    body('sourceStopId')
        .notEmpty().withMessage('Source stop ID is required')
        .isUUID().withMessage('Invalid source stop ID format'),
    body('destinationStopId')
        .notEmpty().withMessage('Destination stop ID is required')
        .isUUID().withMessage('Invalid destination stop ID format'),
    body('mode')
        .optional()
        .isIn(['OPTIMAL', 'SHORTEST_TIME', 'MINIMUM_STOPS', 'MINIMUM_TRANSFERS'])
        .withMessage('Invalid optimization mode'),
];

const verifyQRValidator = [
    body('qrString').notEmpty().withMessage('QR string is required'),
];

module.exports = { createBookingValidator, verifyQRValidator };
