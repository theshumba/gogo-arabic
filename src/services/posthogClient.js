/**
 * PostHog SDK wrapper — Phase 102, Plan 02 (OBS-01, OBS-03, OBS-04, OBS-07).
 *
 * Centralises the canonical posthog.init() config so every consumer
 * (`main.jsx`, telemetry middleware, settings toggle) imports from one place.
 *
 * Behavioural contract (asserted by `src/services/__tests__/posthogClient.test.js`):
 *   - autocapture: false                — emit only canonical learning-loop events
 *   - capture_exceptions: object form   — new API; legacy `enable_exception_autocapture`
 *                                          MUST NOT appear (deprecated since posthog-js v1.275)
 *   - session_recording.maskAllInputs   — PII discipline (OBS-03)
 *   - captureCanvas omitted             — Phaser canvas would 120→25fps (#3273)
 *   - api_host defaults to eu.i…        — UK user / EU data residency
 *   - opt_out_capturing_by_default      — no age-gate exists → opt-OUT for ALL users
 *                                          (belt+braces with settings.telemetryOptOut)
 *   - init is a no-op when key missing  — graceful degradation while PostHog setup is deferred
 *   - idempotent (second init() call is a no-op)
 */
import posthog from 'posthog-js';

let _initialized = false;

/**
 * Initialise the PostHog SDK. Safe to call multiple times — second call is a no-op.
 * Graceful no-op when VITE_POSTHOG_KEY is empty/undefined (deferred-setup path).
 *
 * MUST run BEFORE the first `store.dispatch(...)` in main.jsx so boot-time events
 * are not lost (see RESEARCH Pitfall 5).
 */
export function initPostHog() {
  if (_initialized) return;

  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) return; // graceful degradation — PostHog project not yet provisioned

  const apiHost = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com';

  posthog.init(key, {
    // OBS-01 — only canonical events, no autocapture noise
    autocapture: false,
    // Pageviews/leaves are SPA-safe (Router triggers history changes)
    capture_pageview: true,
    capture_pageleave: true,
    // OBS-04 — new exception-capture API (object form, posthog-js >= 1.275)
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
    // OBS-03 — mask every input field; do NOT capture canvas (Phaser performance gate)
    session_recording: {
      maskAllInputs: true,
      // captureCanvas intentionally omitted — see RESEARCH correction 5
    },
    api_host: apiHost,
    // OBS-07 — default opt-OUT for ALL users (no age-gate exists per planning_context correction 1)
    opt_out_capturing_by_default: true,
    // Pin to a stable defaults snapshot so future SDK upgrades don't quietly change behaviour
    defaults: '2026-01-30',
  });

  _initialized = true;
}

/**
 * Return the posthog singleton so other modules can call `posthog.capture()` /
 * `posthog.captureException()` without re-importing the npm package directly.
 * Plan 03 (telemetryMiddleware) and Plan 04 (settings toggle SDK calls) use this.
 */
export function getPostHog() {
  return posthog;
}

/**
 * SDK-level opt-IN. Belt+braces with the Redux slice toggle:
 * the middleware short-circuits when settings.telemetryOptOut===true; this
 * call ensures even buffered/queued events are wire-blocked too.
 */
export function optInTelemetry() {
  posthog.opt_in_capturing();
}

/**
 * SDK-level opt-OUT. Mirror of optInTelemetry().
 */
export function optOutTelemetry() {
  posthog.opt_out_capturing();
}
