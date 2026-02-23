const { body } = require('express-validator');

const registerValidator = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
];

const loginValidator = [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const refreshTokenValidator = [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

module.exports = { registerValidator, loginValidator, refreshTokenValidator };
