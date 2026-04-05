import WorldState from '../models/WorldState.js';
import logger from '../utils/logger.js';

/**
 * Save world state with additive merge.
 * Client flags are OR'd with server flags — flags are never removed, only added.
 *
 * @route POST /api/v1/world/state
 * @auth Required
 */
export async function saveWorldState(req, res, next) {
  try {
    const { flags, factionControl, zoneEvents } = req.body;

    // Load existing state for merge
    let existing = await WorldState.findOne({ userId: req.userId });

    if (!existing) {
      // First save — create fresh
      existing = await WorldState.create({
        userId: req.userId,
        flags: flags || {},
        factionControl: factionControl || {},
        zoneEvents: zoneEvents || [],
        lastUpdated: new Date(),
      });
      return res.json({ success: true, data: existing });
    }

    // Additive merge: OR client flags with server flags
    if (flags) {
      for (const [key, value] of Object.entries(flags)) {
        existing.flags.set(key, value);
      }
    }

    if (factionControl) {
      for (const [key, value] of Object.entries(factionControl)) {
        existing.factionControl.set(key, value);
      }
    }

    if (zoneEvents) {
      // Append new events, deduplicate by eventId
      const existingIds = new Set(existing.zoneEvents.map(e => e.eventId));
      for (const event of zoneEvents) {
        if (!existingIds.has(event.eventId)) {
          existing.zoneEvents.push(event);
          existingIds.add(event.eventId);
        }
      }
    }

    existing.lastUpdated = new Date();
    await existing.save();

    res.json({ success: true, data: existing });
  } catch (err) {
    logger.error('saveWorldState error:', { error: err.message, userId: req.userId });
    next(err);
  }
}

/**
 * Load world state for the authenticated user.
 *
 * @route GET /api/v1/world/state
 * @auth Required
 */
export async function getWorldState(req, res, next) {
  try {
    const worldState = await WorldState.findOne({ userId: req.userId });

    // Return empty state if none exists (new user)
    if (!worldState) {
      return res.json({
        success: true,
        data: {
          userId: req.userId,
          flags: {},
          factionControl: {},
          zoneEvents: [],
          lastUpdated: null,
        },
      });
    }

    res.json({ success: true, data: worldState });
  } catch (err) {
    logger.error('getWorldState error:', { error: err.message, userId: req.userId });
    next(err);
  }
}
