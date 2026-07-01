/**
 * Centralized Error Handler Middleware
 * Handles all errors in a consistent format
 */

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error.message = 'Resource not found';
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        error.message = messages.join('. ');
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    // JWT errors are handled in auth middleware

    // Default error response
    res.status(err.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
