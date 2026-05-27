/**
 * Telemetry middleware — Phase 102, Plan 02 SKELETON.
 *
 * This file is intentionally a no-op pass-through that ONLY enforces the
 * `state.settings.telemetryOptOut === true` short-circuit and the resilience
 * `try/catch` envelope. Plan 102-03 fills in `ACTION_EVENT_MAP` (the canonical
 * domain.action event vocabulary) and the per-action payload extractors.
 *
 * Why ship a skeleton now? So Plan 03 only edits this file (and its tests) —
 * never `store.js`. That keeps the middleware-registration commit and the
 * event-vocabulary commit independent (smaller diffs, easier to revert).
 *
 * Contract (Plan 03 will assert these, see
 * src/store/middleware/__tests__/telemetryMiddleware.test.js):
 *   - Reads state.settings.telemetryOptOut; when true, returns the next(action)
 *     result immediately WITHOUT touching posthog.capture (OBS-07 wire-gate).
 *   - When opted-IN, looks up ACTION_EVENT_MAP[action.type] and calls
 *     posthog.capture(eventName, extractor(action.payload, state)).
 *   - Catches any throw inside an extractor so telemetry NEVER crashes the app.
 */
import { getPostHog } from '../../services/posthogClient.js';

// Plan 03 fills this in with the 8 canonical learning-loop events
// (quest.started, quest.completed, fsrs.reviewed, zone.entered,
//  lesson.completed, teaching.started, teaching.completed, dashboard.viewed).
// Exported so the Plan 03 test can introspect the vocabulary directly.
export const ACTION_EVENT_MAP = {};

// Plan 03 fills this in with per-action property extractors that return ONLY
// enum/ID values — NEVER free-text (questTitle, arabicText, npcName forbidden).
const PROPERTY_EXTRACTORS = {};

/**
 * Redux middleware. Pass-through skeleton — fires no events yet.
 * Wired into the store middleware chain in src/store/store.js so Plan 03
 * does not need to touch store configuration.
 */
export const telemetryMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  try {
    // OBS-07 belt+braces: short-circuit at the middleware layer even though
    // posthog.opt_out_capturing() is also called from the settings toggle.
    const state = store.getState();
    const optedOut = state?.settings?.telemetryOptOut === true;
    if (optedOut) return result;

    // Plan 03 vocabulary lookup — empty map for now.
    const eventName = ACTION_EVENT_MAP[action.type];
    if (!eventName) return result;

    const extractor = PROPERTY_EXTRACTORS[action.type];
    const props = extractor ? extractor(action.payload, state) : {};
    getPostHog().capture(eventName, props);
  } catch (_err) {
    // Telemetry must never crash the app. Swallow.
  }

  return result;
};

/**
 * Initialise the EventBus -> PostHog relay. Plan 03 wires the Phaser-side
 * EventBus events (e.g. EVENTS.ZONE_ENTERED) to posthog.capture here so the
 * Phaser scenes don't need to import posthog directly.
 *
 * Skeleton: no-op for now. Called from main.jsx after initPostHog().
 *
 * @param {object} _store — Redux store (Plan 03 will read state for cross-cutting props)
 */
export const initTelemetryEventBusRelay = (_store) => {
  // TODO Plan 03: EventBus.on(EVENTS.ZONE_ENTERED, (payload) => {
  //   if (_store.getState()?.settings?.telemetryOptOut) return;
  //   getPostHog().capture('zone.entered', { zone_id: payload.zoneId });
  // });
};
