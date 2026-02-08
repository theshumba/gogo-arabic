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
 * Register a new user
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
      message: 'Registration successful',
      token, // Return token for backward compatibility with header-based auth
      user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Login existing user
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
      message: 'Login successful',
      token, // Return token for backward compatibility with header-based auth
      user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Logout user by clearing cookie
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

    res.json({ message: 'Logout successful' });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify if user is authenticated
 */
export async function verifyAuth(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return next(AppError.unauthorized('User not found'));
    }

    res.json({ authenticated: true, user });
  } catch (err) {
    next(err);
  }
}
