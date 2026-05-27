/**
 * Phase 102 — Plan 02 RED scaffold
 *
 * Covers OBS-01, OBS-03, OBS-04.
 *
 * Asserts the `posthogClient` wrapper module (Plan 02 will create
 * `src/services/posthogClient.js`) initialises posthog-js with the exact
 * config the phase requires:
 *
 *   - autocapture: false                       (OBS-01 PII discipline)
 *   - capture_exceptions: { ... }              (OBS-04 — new API, not the
 *                                               legacy enable_exception_autocapture)
 *   - session_recording.maskAllInputs: true    (OBS-03 PII)
 *   - session_recording does NOT enable        (OBS-03 perf — Phaser canvas;
 *     captureCanvas                             posthog-js #3273)
 *   - api_host defaults to eu.i.posthog.com    (UK user, EU residency)
 *   - opt_out_capturing_by_default: true       (no age-gate → COPPA-safe default)
 *   - init is a no-op when VITE_POSTHOG_KEY    (graceful degradation)
 *     is unset
 *
 * RED state: the module `../posthogClient.js` does NOT exist yet — the import
 * at the top throws MODULE_NOT_FOUND. That IS the RED signal; Plan 02 will
 * create the module and turn this file GREEN.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock posthog-js BEFORE the SUT import so we can spy on init/opt_out_* calls.
// posthog-js is NOT yet installed (Plan 02) — vi.mock returns a stub regardless.
vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    captureException: vi.fn(),
    opt_in_capturing: vi.fn(),
    opt_out_capturing: vi.fn(),
    has_opted_out_capturing: vi.fn(() => true),
  },
}));

describe('posthogClient (OBS-01, OBS-03, OBS-04)', () => {
  let posthog;
  let initPostHog;
  const ORIGINAL_ENV = { ...import.meta.env };

  beforeEach(async () => {
    vi.resetModules();
    // Default a key so init runs; individual tests override.
    import.meta.env.VITE_POSTHOG_KEY = 'phc_test_key';
    delete import.meta.env.VITE_POSTHOG_HOST;
    posthog = (await import('posthog-js')).default;
    posthog.init.mockClear();
    // Plan 02 must export `initPostHog` (named) from src/services/posthogClient.js.
    // Until then this import throws and every test below fails RED.
    ({ initPostHog } = await import('../posthogClient.js'));
  });

  afterEach(() => {
    Object.keys(ORIGINAL_ENV).forEach((k) => {
      import.meta.env[k] = ORIGINAL_ENV[k];
    });
  });

  it('OBS-01: init() calls posthog.init with autocapture: false', () => {
    initPostHog();
    expect(posthog.init).toHaveBeenCalledTimes(1);
    const [, config] = posthog.init.mock.calls[0];
    expect(config.autocapture).toBe(false);
  });

  it('OBS-04: init() passes capture_exceptions as the new object form (NOT enable_exception_autocapture)', () => {
    initPostHog();
    const [, config] = posthog.init.mock.calls[0];
    expect(config.capture_exceptions).toEqual({
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    });
    // Legacy API MUST NOT appear — posthog-js v1.275+ deprecated it.
    expect(config).not.toHaveProperty('enable_exception_autocapture');
  });

  it('OBS-03: init() sets session_recording.maskAllInputs: true', () => {
    initPostHog();
    const [, config] = posthog.init.mock.calls[0];
    expect(config.session_recording).toBeDefined();
    expect(config.session_recording.maskAllInputs).toBe(true);
  });

  it('OBS-03 perf gate: init() does NOT enable session_recording.captureCanvas (Phaser canvas, 120→25fps regression risk)', () => {
    initPostHog();
    const [, config] = posthog.init.mock.calls[0];
    // Either omit captureCanvas entirely or set it to false — never true.
    expect(config.session_recording?.captureCanvas).not.toBe(true);
  });

  it('init() defaults api_host to https://eu.i.posthog.com when VITE_POSTHOG_HOST is unset (UK user / EU residency)', () => {
    delete import.meta.env.VITE_POSTHOG_HOST;
    initPostHog();
    const [, config] = posthog.init.mock.calls[0];
    expect(config.api_host).toBe('https://eu.i.posthog.com');
  });

  it('init() is a no-op (does NOT call posthog.init) when VITE_POSTHOG_KEY is missing (graceful degradation)', async () => {
    delete import.meta.env.VITE_POSTHOG_KEY;
    vi.resetModules();
    posthog.init.mockClear();
    const mod = await import('../posthogClient.js');
    mod.initPostHog();
    expect(posthog.init).not.toHaveBeenCalled();
  });

  it('OBS-07 default: init() sets opt_out_capturing_by_default: true (no age-gate exists, default opt-OUT for ALL users)', () => {
    initPostHog();
    const [, config] = posthog.init.mock.calls[0];
    expect(config.opt_out_capturing_by_default).toBe(true);
  });

  // RED gate from Plan 01 removed — Plan 102-02 lands posthogClient.js + posthog-js install.
  // All assertions above pass with the real implementation in src/services/posthogClient.js.
});
