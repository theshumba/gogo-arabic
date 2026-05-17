import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  character: z.object({
    bodyType: z.string().optional(),
    skinTone: z.string().optional(),
    outfit: z.string().optional(),
    headwear: z.string().nullable().optional(),
  }).optional(),
  settings: z.object({
    volumeAmbience: z.number().min(0).max(1).optional(),
    volumeSFX: z.number().min(0).max(1).optional(),
    volumeWords: z.number().min(0).max(1).optional(),
    showTransliteration: z.boolean().optional(),
    showDiacritics: z.boolean().optional(),
    keyboardMode: z.string().optional(),
    difficulty: z.string().optional(),
  }).optional(),
}).strict();

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
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(AppError.badRequest('Invalid profile data'));
    }
    const updates = parsed.data;

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

/**
 * Get the authenticated user's player settings
 *
 * @route GET /api/v1/user/settings
 * @auth Required
 * @returns {Object} { success: true, data: { settings, syncVersion } }
 */
export async function getSettings(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return next(AppError.notFound('User not found'));

    res.json({
      success: true,
      data: { settings: user.playerSettings || {}, syncVersion: user.syncVersion },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Save (last-write-wins merge) the authenticated user's player settings
 *
 * @route POST /api/v1/user/settings
 * @body {Object} Partial or full playerSettings object (validated by playerSettingsSchema)
 * @auth Required
 * @returns {Object} { success: true, data: { settings, syncVersion } }
 */
export async function saveSettings(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return next(AppError.notFound('User not found'));

    // req.body already validated + stripped by validate(playerSettingsSchema) middleware
    user.playerSettings = { ...(user.playerSettings || {}), ...req.body };
    user.syncVersion = (user.syncVersion || 0) + 1;
    user.lastSyncedAt = new Date();
    user.markModified('playerSettings');
    await user.save();

    res.json({
      success: true,
      data: { settings: user.playerSettings, syncVersion: user.syncVersion },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get historical weekly progress snapshots for the authenticated user.
 *
 * @route GET /api/v1/user/progress/snapshots?weeks=52
 * @auth Required
 * @returns {Object} { success: true, data: snapshot[] }
 */
export async function getProgressSnapshots(req, res, next) {
  try {
    const weeks = Math.min(parseInt(req.query.weeks, 10) || 52, 104);
    const user = await User.findById(req.userId).select('snapshots');
    if (!user) return next(AppError.notFound('User not found'));

    const all = user.snapshots ?? [];
    const recent = all.slice(-weeks);

    res.json({ success: true, data: recent });
  } catch (err) {
    next(err);
  }
}

/**
 * Append a new weekly progress snapshot (append-only — one per weekId).
 *
 * Security:
 *   - Body is validated by progressSnapshotSchema (.strict()) at the route
 *     level — unknown fields, out-of-range numbers, non-enum cefrLevel,
 *     malformed weekId/takenAt are all rejected before this controller
 *     runs. A 100KB hard cap is enforced by snapshotSizeGuard on the route.
 *   - userId is taken from req.userId (authenticate middleware); the body
 *     cannot spoof another user's snapshot.
 *
 * @route POST /api/v1/user/progress/snapshots
 * @body { weekId, takenAt, vocabCount, vocabMastered, cefrLevel,
 *         achievements, playtimeMinutes, zonesUnlocked }
 * @auth Required
 * @returns {Object} { success: true, data: snapshot }
 */
export async function saveProgressSnapshot(req, res, next) {
  try {
    // All fields below are validated + defaulted by progressSnapshotSchema.
    const {
      weekId, takenAt, vocabCount, vocabMastered,
      cefrLevel, achievements, playtimeMinutes, zonesUnlocked,
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return next(AppError.notFound('User not found'));

    // Append-only: skip if weekId already exists
    const alreadyExists = (user.snapshots ?? []).some((s) => s.weekId === weekId);
    if (alreadyExists) {
      const existing = user.snapshots.find((s) => s.weekId === weekId);
      return res.json({ success: true, data: existing });
    }

    const snapshot = {
      weekId,
      takenAt: new Date(takenAt),
      vocabCount,
      vocabMastered,
      cefrLevel,
      achievements,
      playtimeMinutes,
      zonesUnlocked,
    };

    user.snapshots.push(snapshot);
    await user.save();

    res.status(201).json({ success: true, data: snapshot });
  } catch (err) {
    next(err);
  }
}
