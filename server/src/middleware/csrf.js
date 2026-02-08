import { randomBytes } from 'crypto';
import { AppError } from '../utils/AppError.js';

/**
 * Simple CSRF protection middleware
 * Generates and validates CSRF tokens for state-changing requests
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf-token';

/**
 * Generate a CSRF token and set it as a cookie
 */
export function generateCsrfToken(req, res, next) {
  // Only generate if cookie-based auth is being used
  if (req.cookies && req.cookies.jwt) {
    const token = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');

    // Set CSRF token as a non-httpOnly cookie so client can read it
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    req.csrfToken = token;
  }

  next();
}

/**
 * Validate CSRF token for state-changing requests (POST, PUT, DELETE, PATCH)
 */
export function validateCsrfToken(req, res, next) {
  // Only validate CSRF for cookie-based auth
  // Skip for header-based auth (backward compatibility)
  if (!req.cookies || !req.cookies.jwt) {
    return next();
  }

  // Skip CSRF validation for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const tokenFromHeader = req.get(CSRF_HEADER);
  const tokenFromCookie = req.cookies[CSRF_COOKIE];

  if (!tokenFromHeader || !tokenFromCookie) {
    return next(AppError.forbidden('CSRF token missing'));
  }

  if (tokenFromHeader !== tokenFromCookie) {
    return next(AppError.forbidden('CSRF token validation failed'));
  }

  next();
}

/**
 * Endpoint to get CSRF token
 */
export function getCsrfToken(req, res) {
  res.json({ csrfToken: req.csrfToken || null });
}
