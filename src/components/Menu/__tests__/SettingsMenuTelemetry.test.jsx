/**
 * Phase 102 — Plan 02 / Plan 04 RED scaffold
 *
 * Covers OBS-07 (Telemetry opt-in/out toggle in Settings).
 *
 * Asserts the wiring once Plan 02 (settingsSlice.telemetryOptOut) and Plan 04
 * (SettingsMenu Telemetry toggle) land:
 *
 *   - Default state: settings.telemetryOptOut === true
 *     (no age-gate exists → opt-OUT for ALL users per RESEARCH Pitfall 7).
 *   - Toggling opt-IN dispatches a reducer setting telemetryOptOut: false AND
 *     calls posthog.opt_in_capturing() at the SDK layer (belt + braces).
 *   - Toggling opt-OUT dispatches a reducer setting telemetryOptOut: true AND
 *     calls posthog.opt_out_capturing().
 *
 * RED: the `setTelemetryOptOut` action does NOT exist on settingsSlice yet,
 * and SettingsMenu has no Telemetry section yet. Plan 02 + Plan 04 wire both.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock posthog-js (not installed until Plan 02 — vi.mock stubs regardless).
vi.mock('posthog-js', () => ({
  default: {
    opt_in_capturing: vi.fn(),
    opt_out_capturing: vi.fn(),
    has_opted_out_capturing: vi.fn(() => true),
  },
}));

// Stub framer-motion the same way every other Menu test does.
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => ({ children, ...props }) => <div {...props}>{children}</div>,
  }),
  AnimatePresence: ({ children }) => children,
}));

describe('SettingsMenu telemetry toggle (OBS-07)', () => {
  let posthog;
  let settingsSlice;

  beforeEach(async () => {
    vi.resetModules();
    posthog = (await vi.importMock('posthog-js')).default;
    posthog.opt_in_capturing.mockClear();
    posthog.opt_out_capturing.mockClear();
    settingsSlice = await import('../../../store/slices/settingsSlice.js');
  });

  it('OBS-07 default: settingsSlice initialState.telemetryOptOut === true (opt-OUT for ALL users — no age-gate)', () => {
    // RED: settingsSlice.initialState has no telemetryOptOut key yet.
    const reducer = settingsSlice.default;
    const initial = reducer(undefined, { type: '@@INIT' });
    expect(initial).toHaveProperty('telemetryOptOut');
    expect(initial.telemetryOptOut).toBe(true);
  });

  it('OBS-07 opt-IN: dispatching setTelemetryOptOut(false) flips telemetryOptOut to false', () => {
    // RED: setTelemetryOptOut action does not exist yet.
    const { setTelemetryOptOut } = settingsSlice;
    const reducer = settingsSlice.default;
    const next = reducer({ telemetryOptOut: true }, setTelemetryOptOut(false));
    expect(next.telemetryOptOut).toBe(false);
  });

  it('OBS-07 opt-OUT: dispatching setTelemetryOptOut(true) flips telemetryOptOut to true', () => {
    const { setTelemetryOptOut } = settingsSlice;
    const reducer = settingsSlice.default;
    const next = reducer({ telemetryOptOut: false }, setTelemetryOptOut(true));
    expect(next.telemetryOptOut).toBe(true);
  });

  it('OBS-07 SDK belt+braces opt-IN: the SettingsMenu toggle handler calls posthog.opt_in_capturing()', async () => {
    // Plan 04 will export a `handleTelemetryToggle` helper (or the
    // SettingsMenu component will wire it inline). Either way, opting in
    // MUST call posthog.opt_in_capturing() in addition to the slice update.
    //
    // RED: this import resolves to today's SettingsMenu which has no
    // telemetry handler — the helper export is absent.
    const mod = await import('../SettingsMenu.jsx');
    expect(typeof mod.handleTelemetryToggle).toBe('function');
    mod.handleTelemetryToggle(true); // user opted IN
    expect(posthog.opt_in_capturing).toHaveBeenCalledTimes(1);
  });

  it('OBS-07 SDK belt+braces opt-OUT: the SettingsMenu toggle handler calls posthog.opt_out_capturing()', async () => {
    const mod = await import('../SettingsMenu.jsx');
    expect(typeof mod.handleTelemetryToggle).toBe('function');
    mod.handleTelemetryToggle(false); // user opted OUT
    expect(posthog.opt_out_capturing).toHaveBeenCalledTimes(1);
  });

  // Hard RED gate.
  it('RED gate: Plans 02/04 have not yet wired telemetry opt-in/out — this test fails by design', () => {
    throw new Error('not implemented — Plan 102-02 (settingsSlice.telemetryOptOut) + Plan 102-04 (SettingsMenu Telemetry section)');
  });
});
