import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/AppError.js';

/**
 * Rate limiter configuration
 */

// Global rate limiter - 100 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_GLOBAL || '100', 10),
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again later',
  handler: (req, res, next) => {
    next(AppError.tooManyRequests('Too many requests from this IP, please try again later'));
  },
});

// Auth rate limiter - 5 attempts per 15 minutes per IP (stricter for login/register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_AUTH || '5', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count successful requests too
  message: 'Too many authentication attempts, please try again later',
  handler: (req, res, next) => {
    next(AppError.tooManyRequests('Too many authentication attempts, please try again later'));
  },
});

// API rate limiter - 60 requests per minute per user (for authenticated endpoints)
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_API || '60', 10),
  standardHeaders: true,
  legacyHeaders: false,
  // Use userId if authenticated, otherwise fall back to IP
  keyGenerator: (req) => {
    return req.userId ? `user:${req.userId}` : `ip:${req.ip}`;
  },
  message: 'Too many API requests, please slow down',
  handler: (req, res, next) => {
    next(AppError.tooManyRequests('Too many API requests, please slow down'));
  },
});

// Shop rate limiter - prevent rapid purchase attempts
export const shopLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_SHOP || '10', 10),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.userId ? `shop:${req.userId}` : `shop:${req.ip}`;
  },
  message: 'Too many purchase attempts, please slow down',
  handler: (req, res, next) => {
    next(AppError.tooManyRequests('Too many purchase attempts, please slow down'));
  },
});
