/**
 * relationshipDecayMiddleware.js — Daily NPC friendship decay
 *
 * Triggers on dailyGoals/startSession.
 * Computes days since last decay and applies 1 point/day decay to all
 * tracked NPC friendships, dispatching adjustFriendship for each affected NPC.
 *
 * Guards:
 *   - Runs at most once per UTC calendar day
 *   - Skips NPCs with friendship at 0 (already at floor)
 *   - Re-entrancy guard prevents cascades
 */

import { decayRelationships } from '../../utils/npcRelationshipEngine.js';
import { adjustFriendship, setLastDecayDate } from '../slices/npcSlice.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function daysBetween(fromKey, toKey) {
  const from = new Date(fromKey + 'T00:00:00Z').getTime();
  const to   = new Date(toKey   + 'T00:00:00Z').getTime();
  return Math.max(0, Math.floor((to - from) / 86400000));
}

// ── Legacy test helpers (kept as no-ops for API compatibility) ────────────────
// The "last decay date" now lives in the persisted `state.npc.lastDecayDate`
// field. Tests that need to seed it should dispatch `setLastDecayDate(date)`
// against their test store. These helpers used to mutate module-level state.

export function _resetDecayState(_date = null) {
  // Module state was removed — this is a no-op kept for API compatibility.
}

export function _getDecayState() {
  return { lastDecayDate: null };
}

// ── Re-entrancy guard ─────────────────────────────────────────────────────────
// Still module-scoped — its purpose is to prevent the synchronous
// adjustFriendship cascade from re-entering THIS middleware within the same
// dispatch tick; unrelated to the "once per real day" persistence fix.

let _isProcessingDecay = false;

// ── Middleware ────────────────────────────────────────────────────────────────

export const relationshipDecayMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type !== 'dailyGoals/startSession' || _isProcessingDecay) return result;

  // Read the persisted last-decay date from Redux state instead of a
  // module-level variable. Before this fix, the module-level
  // `_lastDecayDate` reset on every page reload, so the middleware applied
  // a full day of friendship decay every cold start — multiple times per
  // real day on a heavy-use session.
  const state = store.getState();
  const lastDecayDate = state.npc?.lastDecayDate ?? null;
  const todayKey = getDayKey();
  if (lastDecayDate === todayKey) return result; // already ran today

  const daysSince = lastDecayDate ? daysBetween(lastDecayDate, todayKey) : 1;
  if (daysSince <= 0) {
    store.dispatch(setLastDecayDate(todayKey));
    return result;
  }

  const friendships = state.npc?.friendship ?? {};
  if (Object.keys(friendships).length === 0) {
    store.dispatch(setLastDecayDate(todayKey));
    return result;
  }

  _isProcessingDecay = true;
  try {
    const decayed = decayRelationships(friendships, daysSince);

    for (const [npcId, newValue] of Object.entries(decayed)) {
      const oldValue = friendships[npcId] ?? 0;
      const delta    = newValue - oldValue;
      if (delta < 0 && oldValue > 0) {
        store.dispatch(adjustFriendship({ npcId, delta, reason: 'daily_decay' }));
      }
    }

    store.dispatch(setLastDecayDate(todayKey));
  } finally {
    _isProcessingDecay = false;
  }

  return result;
};
