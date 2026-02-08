import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

/**
 * Get the authenticated user's profile
 *
 * @route GET /api/v1/user/profile
 * @auth Required - JWT token
 * @returns {Object} { success: true, data: User }
 * @description Returns full user profile including game progress
 */
export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return next(AppError.notFound('User not found'));
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update the authenticated user's profile
 *
 * @route PUT /api/v1/user/profile
 * @body {Object} { name?: string, character?: Object, settings?: Object }
 * @auth Required - JWT token
 * @returns {Object} { success: true, data: User }
 * @description Updates allowed profile fields (name, character, settings only)
 */
export async function updateProfile(req, res, next) {
  try {
    const allowed = ['name', 'character', 'settings'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(AppError.notFound('User not found'));
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}
