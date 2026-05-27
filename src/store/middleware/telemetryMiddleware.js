/**
 * Telemetry middleware — Phase 102, Plan 03 (OBS-02).
 *
 * Single source of truth for the canonical 8-event learning-loop vocabulary.
 * Every event name follows the `domain.action` convention. Every property
 * extractor returns ONLY enum/ID fields — free text (questTitle, arabicText,
 * npcName, lessonTitle) is FORBIDDEN at this PII boundary.
 *
 * Two source surfaces:
 *   1. Redux actions (7 of the 8 events) — handled by the middleware below
 *      via ACTION_EVENT_MAP + PROP_EXTRACTORS.
 *   2. Phaser EventBus (zone.entered) — handled by initTelemetryEventBusRelay
 *      which subscribes to EVENTS.ZONE_CHANGE (existing emitter at
 *      `src/game/systems/ZoneTransition.js:43`). We reuse the existing
 *      ZONE_CHANGE event name rather than introduce ZONE_ENTERED to avoid
 *      breaking other listeners (NextObjectiveIndicator, GameplayStats,
 *      useZoneEvents).
 *
 * PII discipline: extractor outputs are constrained to an explicit allow-list
 * (see ALLOWED_PROP_KEYS in the test). Extractors NEVER spread `action.payload`
 * and NEVER include free-text fields.
 *
 * Resilience: every capture is wrapped in try/catch so telemetry can never
 * crash the app. DEV builds get a console.warn; production stays silent.
 *
 * Opt-out: the middleware short-circuits on `state.settings.telemetryOptOut`
 * BEFORE looking up the event or calling the extractor. The EventBus relay
 * applies the same gate. PostHog's own `opt_out_capturing()` (called from the
 * settings toggle) is the wire-layer belt-and-braces fallback.
 */
import { getPostHog } from '../../services/posthogClient.js';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';

/**
 * Redux action.type → canonical event name.
 *
 * Aliases are intentional: the actual slice name is `quests` (not `quest`),
 * but the telemetry vocabulary uses the domain-singular `quest.*`. Both
 * action strings are registered so the middleware works whether the
 * dispatcher uses the canonical alias or the real slice name. Future
 * refactors of slice names won't break PostHog Insights.
 *
 * `teaching/*` and `dashboard/*` have no current slice — they're reserved
 * so the event vocabulary is complete and stable for downstream tooling.
 *
 * Exported for the test to introspect the vocabulary directly.
 */
export const ACTION_EVENT_MAP = Object.freeze({
  // quest.* — canonical alias + real slice action name
  'quest/startQuest': 'quest.started',
  'quests/startQuest': 'quest.started',
  'quest/completeQuest': 'quest.completed',
  'quests/completeQuest': 'quest.completed',

  // fsrs.* — vocabulary domain (canonical alias decouples from slice internals)
  'vocabulary/reviewCard': 'fsrs.reviewed',

  // lesson.* — grammar slice
  'grammar/completeLesson': 'lesson.completed',

  // teaching.* — reserved (no slice exists yet)
  'teaching/startSession': 'teaching.started',
  'teaching/endSession': 'teaching.completed',

  // dashboard.* — reserved (no slice exists yet)
  'dashboard/viewDashboard': 'dashboard.viewed',

  // zone.entered — sourced from the Phaser EventBus (EVENTS.ZONE_CHANGE), not
  // from Redux. The synthetic `eventbus/zoneEntered` key is here so the
  // canonical 8-event vocabulary is complete in one inspectable map (tools,
  // tests, and PostHog Insights authors can read the full event list from
  // Object.values(ACTION_EVENT_MAP)). The middleware will never see this as
  // an action.type from Redux — the actual capture path lives in
  // initTelemetryEventBusRelay below.
  'eventbus/zoneEntered': 'zone.entered',
});

/**
 * Canonical-event-name → property extractor.
 *
 * Each extractor returns ONLY enum/ID fields. Forbidden keys (questTitle,
 * arabicText, lessonTitle, npcName, translation) are not extracted —
 * extractors NEVER spread the payload.
 *
 * Keyed by canonical event name (not action.type) so multiple action aliases
 * (e.g. quest/startQuest + quests/startQuest) share one extractor.
 */
const PROP_EXTRACTORS = Object.freeze({
  'quest.started': (action) => ({
    quest_id: action.payload?.questId,
    zone_id: action.payload?.zoneId,
  }),
  'quest.completed': (action) => ({
    quest_id: action.payload?.questId,
    zone_id: action.payload?.zoneId,
    objectives_count: action.payload?.objectives?.length ?? 0,
  }),
  'fsrs.reviewed': (action) => ({
    word_id: action.payload?.wordId,
    rating: action.payload?.rating,
    cefr_level: action.payload?.cefrLevel,
  }),
  'lesson.completed': (action) => ({
    lesson_id: action.payload?.lessonId,
    cefr_level: action.payload?.cefrLevel,
  }),
  'teaching.started': (action) => ({
    teaching_id: action.payload?.sessionId,
    npc_id: action.payload?.npcId,
  }),
  'teaching.completed': (action) => ({
    teaching_id: action.payload?.sessionId,
    npc_id: action.payload?.npcId,
  }),
  'dashboard.viewed': () => ({}),
});

/**
 * Read the opt-out flag without throwing if state is malformed.
 */
function isOptedOut(state) {
  return state?.settings?.telemetryOptOut === true;
}

/**
 * Redux middleware: maps action.type → canonical event → posthog.capture.
 *
 * Wired into the store middleware chain by `src/store/store.js` (Plan 02).
 * Plan 03 only edits THIS file + its test — never store.js.
 */
export const telemetryMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  try {
    // OBS-07 short-circuit (belt+braces with posthog.opt_out_capturing()).
    if (isOptedOut(store.getState())) return result;

    const eventName = ACTION_EVENT_MAP[action.type];
    if (!eventName) return result;

    const extractor = PROP_EXTRACTORS[eventName];
    const props = extractor ? extractor(action) : {};
    getPostHog().capture(eventName, props);
  } catch (err) {
    // Telemetry must NEVER crash the app. Swallow + warn (DEV only).
    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[telemetry] capture failed', err);
    }
  }

  return result;
};

/**
 * Subscribe to the Phaser EventBus so zone-entry signals reach PostHog
 * without Phaser scenes importing posthog directly.
 *
 * We reuse the existing EVENTS.ZONE_CHANGE event (emitted by
 * ZoneTransition.js with payload `{ zone, x, y }`) rather than introduce
 * a new ZONE_ENTERED constant. Map payload.zone → zone_id at the boundary
 * so the PostHog property name follows the snake_case `*_id` convention.
 *
 * Called from main.jsx (Plan 02 already invokes this — it was a no-op until now).
 *
 * @param {object} store — Redux store, read for opt-out state on every relay.
 */
export const initTelemetryEventBusRelay = (store) => {
  EventBus.on(EVENTS.ZONE_CHANGE, (payload) => {
    try {
      if (isOptedOut(store?.getState?.())) return;
      getPostHog().capture('zone.entered', { zone_id: payload?.zone });
    } catch (err) {
      if (import.meta.env?.DEV) {
        // eslint-disable-next-line no-console
        console.warn('[telemetry] zone.entered failed', err);
      }
    }
  });
};
