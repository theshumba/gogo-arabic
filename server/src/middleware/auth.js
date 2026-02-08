import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

/**
 * Authentication middleware
 * Supports both cookie-based (preferred) and header-based JWT authentication
 * for backward compatibility during migration
 */
export function authenticate(req, res, next) {
  let token;

  // First, try to get token from httpOnly cookie (preferred method)
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // Fallback to Authorization header for backward compatibility
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7);
  }

  if (!token) {
    return next(AppError.unauthorized('No authentication token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Token has expired'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(AppError.unauthorized('Invalid token'));
    }
    return next(AppError.unauthorized('Authentication failed'));
  }
}

/**
 * Optional authentication middleware
 * Attaches userId if token is present, but doesn't fail if missing
 */
export function optionalAuth(req, res, next) {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7);
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
    } catch (err) {
      // Silently fail for optional auth
    }
  }

  next();
}
