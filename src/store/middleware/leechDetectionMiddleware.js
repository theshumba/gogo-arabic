/**
 * leechDetectionMiddleware.js — FSRS Leech Detection and Interval Adjustment
 *
 * After every vocabulary card review (vocabulary/updateFsrsCard), checks if the
 * updated card has become a leech (lapses >= LEECH_THRESHOLD). If so, applies
 * a 50% shorter interval to make it appear more frequently in review sessions.
 *
 * CRITICAL #8 — Tier idempotency:
 * Previously, every review of an already-leeched card re-applied the 50%
 * penalty, collapsing the interval geometrically (10 reviews → original/1024).
 * Once a card became a leech, the player was locked into reviewing it every
 * session forever, even after answering it correctly.
 *
 * Fix: track `leechPenalizedAtLapses` on the card metadata. Only apply the
 * penalty when `card.lapses > (card.leechPenalizedAtLapses ?? -1)` — i.e., on
 * the lapse-count transition that pushed the card across (or further past)
 * the leech threshold. A correct review (`reps++` but no `lapses++`) no longer
 * re-halves the interval; a fresh lapse on an already-leeched card does.
 *
 * Uses a _leechPenalty flag on the dispatched action to prevent infinite loops:
 * the second dispatch (with the adjusted card) carries `_leechPenalty: true` in
 * its payload, which this middleware ignores. The flag is NOT stored in Redux state
 * because the reducer only destructures { wordId, card, log }.
 */

import { isLeech, applyLeechIntervalPenalty } from '../../services/leechDetection.js';

/**
 * Middleware that auto-flags leech cards and adjusts their review interval.
 *
 * Listens for: vocabulary/updateFsrsCard
 * Side effect: dispatches another updateFsrsCard with halved interval when leech detected
 */
export const leechDetectionMiddleware = (store) => (next) => (action) => {
  // Skip the penalty re-dispatch to prevent infinite loops
  if (
    action.type === 'vocabulary/updateFsrsCard' &&
    action.payload?._leechPenalty === true
  ) {
    return next(action);
  }

  const result = next(action);

  if (action.type === 'vocabulary/updateFsrsCard') {
    const wordId = action.payload?.wordId;
    if (!wordId) return result;

    // Read updated card from state
    const state = store.getState();
    const cardData = state.vocabulary?.fsrsCards?.[wordId];

    if (cardData?.card && isLeech(cardData.card)) {
      const card = cardData.card;
      const currentLapses = card.lapses ?? 0;
      const previouslyPenalizedAt = card.leechPenalizedAtLapses ?? -1;

      // Tier idempotency guard: only penalize if a NEW lapse has been recorded
      // since the last penalty for this card. Without this guard, every review
      // of an already-leeched card would re-halve the interval.
      if (currentLapses <= previouslyPenalizedAt) {
        return result;
      }

      // Apply 50% shorter interval and stamp the lapse tier we penalized at,
      // so future reviews at this same lapse count do not re-trigger.
      const penalizedCard = {
        ...applyLeechIntervalPenalty(card),
        leechPenalizedAtLapses: currentLapses,
      };
      store.dispatch({
        type: 'vocabulary/updateFsrsCard',
        payload: { wordId, card: penalizedCard, log: cardData.log, _leechPenalty: true },
      });
    }
  }

  return result;
};
