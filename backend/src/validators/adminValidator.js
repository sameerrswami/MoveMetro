const { body, param } = require('express-validator');

const createStopValidator = [
    body('name').trim().notEmpty().withMessage('Stop name is required'),
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Stop code is required')
        .matches(/^[A-Za-z0-9_-]+$/)
        .withMessage('Code must be alphanumeric'),
];

const createRouteValidator = [
    body('name').trim().notEmpty().withMessage('Route name is required'),
    body('color').trim().notEmpty().withMessage('Route color is required'),
    body('stops').optional().isArray().withMessage('Stops must be an array'),
    body('stops.*.stopId').optional().isUUID().withMessage('Invalid stop ID format'),
];

const uploadRoutesValidator = [
    body('routes').isArray({ min: 1 }).withMessage('Routes array is required'),
    body('routes.*.name').trim().notEmpty().withMessage('Route name is required'),
    body('routes.*.color').trim().notEmpty().withMessage('Route color is required'),
    body('routes.*.stops').isArray({ min: 2 }).withMessage('At least 2 stops required per route'),
];

module.exports = { createStopValidator, createRouteValidator, uploadRoutesValidator };
