const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Validation middleware - checks express-validator results
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map((e) => e.msg);
        throw new ValidationError(messages.join(', '));
    }
    next();
};

module.exports = validate;
