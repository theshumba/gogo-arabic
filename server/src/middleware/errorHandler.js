import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Centralized error handling middleware
 * Handles both operational errors (AppError) and unexpected errors
 */
export function errorHandler(err, req, res, next) {
  let error = err;

  // Convert non-AppError errors to AppError
  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    error = new AppError(message, statusCode, false);
  }

  // Log error
  const logData = {
    method: req.method,
    path: req.path,
    statusCode: error.statusCode,
    message: error.message,
    userId: req.userId || null,
    ip: req.ip,
  };

  if (error.statusCode >= 500) {
    logger.error('Server error', {
      ...logData,
      stack: err.stack,
    });
  } else {
    logger.warn('Client error', logData);
  }

  // Send response
  const response = {
    status: error.status,
    message: error.message,
  };

  // Only include stack trace in development
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  // Don't expose internal error details in production
  if (!error.isOperational && process.env.NODE_ENV === 'production') {
    response.message = 'Internal server error';
  }

  res.status(error.statusCode).json(response);
}

/**
 * Catch-all for unhandled routes
 */
export function notFoundHandler(req, res, next) {
  next(AppError.notFound(`Route ${req.method} ${req.path} not found`));
}
