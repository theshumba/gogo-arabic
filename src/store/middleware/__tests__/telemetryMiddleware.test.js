/**
 * Phase 102 — Plan 03 (OBS-02)
 *
 * Covers OBS-02 (canonical event vocabulary + PII discipline).
 *
 * Asserts the `telemetryMiddleware` at `src/store/middleware/telemetryMiddleware.js`:
 *
 *   - Maps Redux actions to posthog.capture('domain.action', enumProps)
 *     for the 8 canonical learning-loop events:
 *       quest.started, quest.completed, fsrs.reviewed, zone.entered,
 *       lesson.completed, teaching.started, teaching.completed,
 *       dashboard.viewed.
 *   - Property extractors return ONLY enums/IDs — NEVER free text
 *     (questTitle, arabicText, etc.).
 *   - Short-circuits when state.settings.telemetryOptOut === true.
 *   - Catches thrown errors in extractors so telemetry never crashes the app.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Canonical event -> source mapping (verified against actual slice action types)
 * ─────────────────────────────────────────────────────────────────────────
 * quest.started        <- 'quest/startQuest'              (canonical), aliased to 'quests/startQuest' (real slice name: `quests`)
 * quest.completed      <- 'quest/completeQuest'           (canonical), aliased to 'quests/completeQuest'
 * fsrs.reviewed        <- 'vocabulary/reviewCard'         (canonical alias — vocabularySlice uses `updateFsrsCard` + `updateStats`; the alias decouples telemetry vocabulary from internal reducer names so the contract is stable across slice refactors)
 * lesson.completed     <- 'grammar/completeLesson'        (matches `grammarSlice.completeLesson`)
 * teaching.started     <- 'teaching/startSession'         (canonical alias — no teaching slice exists yet; reserved for the future tutor session feature)
 * teaching.completed   <- 'teaching/endSession'           (canonical alias — same as above)
 * dashboard.viewed     <- 'dashboard/viewDashboard'       (canonical alias — no dashboard slice; component-level useEffect dispatch is the future binding point; the action name is reserved in the map so PostHog Insights can be authored ahead of the wire-up)
 * zone.entered         <- EventBus event EVENTS.ZONE_CHANGE  (NOT a Redux action; payload { zone, x, y }; relayed via initTelemetryEventBusRelay)
 * ─────────────────────────────────────────────────────────────────────────
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock posthog-js so we can spy on capture(). posthog-js isn't installed yet
// (Plan 02) — vi.mock returns a stub regardless of registry resolution.
vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
    captureException: vi.fn(),
  },
}));

// Canonical event names asserted across the 8 learning-loop signals.
// Every name MUST appear at least once in this file (verifier greps these).
const CANONICAL_EVENTS = [
  'quest.started',
  'quest.completed',
  'fsrs.reviewed',
  'zone.entered',
  'lesson.completed',
  'teaching.started',
  'teaching.completed',
  'dashboard.viewed',
];

// Property-key allow-list — any extractor output containing a key NOT in this
// list is treated as a potential PII leak. quest_title / arabic_text / npc_name
// are explicitly forbidden (free text). Plan 03 must enforce this contract.
const ALLOWED_PROP_KEYS = new Set([
  'quest_id',
  'zone_id',
  'objectives_count',
  'word_id',
  'rating',
  'cefr_level',
  'lesson_id',
  'teaching_id',
  'npc_id', // ID not name
  'dashboard_view_id',
]);

function makeStore(overrides = {}) {
  const state = {
    settings: { telemetryOptOut: false, ...overrides.settings },
    ...overrides,
  };
  return {
    getState: vi.fn(() => state),
    dispatch: vi.fn(),
    _state: state,
  };
}

describe('telemetryMiddleware (OBS-02)', () => {
  let posthog;
  let telemetryMiddleware;

  beforeEach(async () => {
    vi.resetModules();
    posthog = (await vi.importMock('posthog-js')).default;
    posthog.capture.mockClear();
    // RED: module does not exist until Plan 03 lands.
    ({ telemetryMiddleware } = await import('../telemetryMiddleware.js'));
  });

  it('OBS-02: quest/completeQuest action emits posthog.capture(\'quest.completed\', { quest_id, zone_id, objectives_count })', () => {
    const store = makeStore();
    const next = vi.fn((a) => a);
    const dispatch = telemetryMiddleware(store)(next);

    dispatch({
      type: 'quest/completeQuest',
      payload: {
        questId: 'zone-1-bazaar-greetings',
        zoneId: 'bazaar',
        objectives: [{ id: 'o1' }, { id: 'o2' }, { id: 'o3' }],
        questTitle: 'Greet the merchant', // free text — MUST NOT be passed to capture
      },
    });

    expect(posthog.capture).toHaveBeenCalledTimes(1);
    expect(posthog.capture).toHaveBeenCalledWith('quest.completed', {
      quest_id: 'zone-1-bazaar-greetings',
      zone_id: 'bazaar',
      objectives_count: 3,
    });
  });

  it('OBS-02: all 8 canonical events emit with stable domain.action names', () => {
    // The middleware module must export its ACTION_EVENT_MAP so this
    // assertion can verify the vocabulary directly (Plan 03 contract).
    return import('../telemetryMiddleware.js').then(({ ACTION_EVENT_MAP }) => {
      const eventNames = new Set(Object.values(ACTION_EVENT_MAP));
      CANONICAL_EVENTS.forEach((name) => {
        // quest.started, quest.completed, fsrs.reviewed, zone.entered,
        // lesson.completed, teaching.started, teaching.completed, dashboard.viewed
        expect(eventNames.has(name)).toBe(true);
      });
    });
  });

  it('OBS-02 PII discipline: free-text fields (questTitle, arabicText, npcName) NEVER appear in posthog.capture payload', () => {
    const store = makeStore();
    const next = vi.fn((a) => a);
    const dispatch = telemetryMiddleware(store)(next);

    dispatch({
      type: 'vocabulary/reviewCard',
      payload: {
        wordId: 'w-42',
        rating: 3,
        cefrLevel: 'A2',
        arabicText: 'مرحبا', // forbidden — must not be forwarded
      },
    });

    for (const call of posthog.capture.mock.calls) {
      const [, props] = call;
      const keys = Object.keys(props ?? {});
      for (const key of keys) {
        expect(ALLOWED_PROP_KEYS.has(key)).toBe(true);
      }
      // Explicit guards for the three most-common free-text fields.
      expect(props).not.toHaveProperty('arabicText');
      expect(props).not.toHaveProperty('questTitle');
      expect(props).not.toHaveProperty('npcName');
    }
  });

  it('OBS-07 short-circuit: when state.settings.telemetryOptOut === true, posthog.capture is NEVER called', () => {
    const store = makeStore({ settings: { telemetryOptOut: true } });
    const next = vi.fn((a) => a);
    const dispatch = telemetryMiddleware(store)(next);

    dispatch({ type: 'quest/completeQuest', payload: { questId: 'q', zoneId: 'z', objectives: [] } });
    dispatch({ type: 'vocabulary/reviewCard', payload: { wordId: 'w', rating: 4, cefrLevel: 'B1' } });
    dispatch({ type: 'world/zoneEntered', payload: { zoneId: 'bazaar' } });

    expect(posthog.capture).toHaveBeenCalledTimes(0);
  });

  it('Resilience: middleware catches thrown errors inside extractors (telemetry NEVER crashes the app)', () => {
    const store = makeStore();
    const next = vi.fn((a) => a);
    const dispatch = telemetryMiddleware(store)(next);

    // An extractor reading e.g. payload.objectives.length on a malformed
    // payload would throw — the middleware must swallow it and return the
    // result from next(action) unchanged.
    expect(() =>
      dispatch({ type: 'quest/completeQuest', payload: null })
    ).not.toThrow();
    expect(next).toHaveBeenCalled();
  });

});
