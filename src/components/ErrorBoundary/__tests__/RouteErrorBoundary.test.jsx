/**
 * Phase 102 — Plan 05 RED scaffold
 *
 * Covers OBS-04 (React render-error boundary → posthog.captureException).
 *
 * Asserts that the route/error-boundary wrapper (Plan 05) provides a class
 * component (export named `RouteErrorBoundaryClass`) which:
 *
 *   - Renders its fallback UI when a child component throws during render.
 *   - In componentDidCatch, calls posthog.captureException(error) EXACTLY ONCE
 *     with the caught error instance.
 *
 * Today's `RouteErrorBoundary.jsx` is the hook-based react-router variant
 * (uses useRouteError) — it CANNOT catch render errors. Plan 05 must add a
 * class boundary alongside it.
 *
 * RED: import of `RouteErrorBoundaryClass` throws (no such export yet) and the
 * `posthog-js` mock proves the boundary never calls captureException until the
 * class is wired.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock posthog-js so we can spy on captureException. (posthog-js not yet
// installed — Plan 02. vi.mock returns a stub regardless.)
vi.mock('posthog-js', () => ({
  default: {
    captureException: vi.fn(),
  },
}));

// A child that throws on render.
function Bomb({ message = 'render bang' }) {
  throw new Error(message);
  // eslint-disable-next-line no-unreachable
  return null;
}

describe('RouteErrorBoundaryClass (OBS-04, Plan 05)', () => {
  let posthog;
  let RouteErrorBoundaryClass;

  beforeEach(async () => {
    vi.resetModules();
    posthog = (await vi.importMock('posthog-js')).default;
    posthog.captureException.mockClear();
    // RED: this export does not yet exist on the RouteErrorBoundary module.
    ({ RouteErrorBoundaryClass } = await import('../RouteErrorBoundary.jsx'));
    // Silence React's error logging during the deliberate throw.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders fallback UI when a child throws during render', () => {
    render(
      <RouteErrorBoundaryClass fallback={<div data-testid="fallback">boom</div>}>
        <Bomb />
      </RouteErrorBoundaryClass>
    );
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('OBS-04: componentDidCatch calls posthog.captureException(error) exactly once with the caught error', () => {
    render(
      <RouteErrorBoundaryClass fallback={<div>fallback</div>}>
        <Bomb message="OBS-04 probe" />
      </RouteErrorBoundaryClass>
    );

    expect(posthog.captureException).toHaveBeenCalledTimes(1);
    const [errArg] = posthog.captureException.mock.calls[0];
    expect(errArg).toBeInstanceOf(Error);
    expect(errArg.message).toBe('OBS-04 probe');
  });

  // Hard RED gate.
  it('RED gate: Plan 05 has not yet implemented RouteErrorBoundaryClass — this test fails by design', () => {
    throw new Error('not implemented — Plan 102-05 (RouteErrorBoundaryClass + posthog.captureException)');
  });
});
