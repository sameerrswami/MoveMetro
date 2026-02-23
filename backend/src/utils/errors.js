class AppError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409, 'CONFLICT');
    }
}

class NoPathError extends AppError {
    constructor(source, destination) {
        super(`No path exists between ${source} and ${destination}`, 404, 'NO_PATH_FOUND');
        this.source = source;
        this.destination = destination;
    }
}

class SameStopError extends AppError {
    constructor() {
        super('Source and destination cannot be the same stop', 400, 'SAME_STOP');
    }
}

class DuplicateBookingError extends AppError {
    constructor() {
        super('Duplicate booking detected (idempotency key already used)', 409, 'DUPLICATE_BOOKING');
    }
}

module.exports = {
    AppError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    NoPathError,
    SameStopError,
    DuplicateBookingError,
};
