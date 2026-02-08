import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

/**
 * Helper function to generate JWT and set cookie
 */
function setAuthCookie(res, userId) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  // Set httpOnly cookie (secure in production)
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
}

/**
 * Register a new user account
 *
 * @route POST /api/v1/auth/register
 * @body {Object} { name: string, email: string, password: string }
 * @auth Not required
 * @returns {Object} { success: true, data: { user: User, token: string }, message: string }
 * @description Creates new user, sets httpOnly JWT cookie and CSRF token cookie
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return next(AppError.conflict('Email already registered'));
    }

    // Create user with default inventory
    const user = await User.create({
      name,
      email,
      password,
      inventory: ['thobe_white'],
    });

    // Generate JWT and set cookie
    const token = setAuthCookie(res, user._id);

    // Generate and set CSRF token cookie
    const csrfToken = randomBytes(32).toString('hex');
    res.cookie('csrf-token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token, // Return token for backward compatibility with header-based auth
        user,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Login existing user with email and password
 *
 * @route POST /api/v1/auth/login
 * @body {Object} { email: string, password: string }
 * @auth Not required
 * @returns {Object} { success: true, data: { user: User, token: string }, message: string }
 * @description Authenticates user, sets httpOnly JWT cookie and CSRF token cookie
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(AppError.unauthorized('Invalid credentials'));
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(AppError.unauthorized('Invalid credentials'));
    }

    // Generate JWT and set cookie
    const token = setAuthCookie(res, user._id);

    // Generate and set CSRF token cookie
    const csrfToken = randomBytes(32).toString('hex');
    res.cookie('csrf-token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token, // Return token for backward compatibility with header-based auth
        user,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Logout user by clearing authentication cookies
 *
 * @route POST /api/v1/auth/logout
 * @auth Not required (but will clear cookies if present)
 * @returns {Object} { success: true, message: string }
 * @description Clears JWT and CSRF token cookies
 */
export async function logout(req, res, next) {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });

    // Also clear CSRF cookie on logout
    res.clearCookie('csrf-token', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify if the current session is authenticated
 *
 * @route GET /api/v1/auth/verify
 * @auth Required - JWT token
 * @returns {Object} { success: true, data: { authenticated: boolean, user: User } }
 * @description Checks if JWT token is valid and returns user data
 */
export async function verifyAuth(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return next(AppError.unauthorized('User not found'));
    }

    res.json({
      success: true,
      data: {
        authenticated: true,
        user,
      },
    });
  } catch (err) {
    next(err);
  }
}
