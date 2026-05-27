/**
 * Phase 102 — Plan 05 GREEN
 *
 * Covers OBS-04 (React render-error boundary → posthog.captureException).
 *
 * Asserts that the route/error-boundary wrapper provides a class component
 * (named export `RouteErrorBoundaryClass`) which:
 *
 *   - Renders its `fallback` prop when a child component throws during render.
 *   - In componentDidCatch, calls posthog.captureException(error) EXACTLY ONCE
 *     with the caught error instance.
 *
 * The hook-based `RouteErrorBoundary` (default export) remains the react-router
 * `errorElement` and uses `useRouteError()` — that's a router error reporter, not
 * a render-error boundary. This class is the render-error boundary alongside it.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostHogProvider, PostHogErrorBoundary } from '@posthog/react';

// Mock posthog-js so we can spy on captureException. The same mock instance is
// also handed to <PostHogProvider client={posthog}> in the PostHogErrorBoundary
// test below — that boundary reads `client.captureException` off React context,
// so the wire-up flows through the same spy.
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

  it('OBS-04: PostHogErrorBoundary from @posthog/react also forwards to posthog.captureException (defence-in-depth wrap in main.jsx)', () => {
    render(
      <PostHogProvider client={posthog}>
        <PostHogErrorBoundary fallback={<div data-testid="ph-fallback">ph-fallback</div>}>
          <Bomb message="OBS-04 PostHogErrorBoundary probe" />
        </PostHogErrorBoundary>
      </PostHogProvider>
    );

    // PostHogErrorBoundary reads client.captureException(error, extraProps) off
    // its React context. Because we pass the same mocked posthog instance into
    // <PostHogProvider client={posthog}>, the call lands on the same spy.
    expect(posthog.captureException).toHaveBeenCalledTimes(1);
    const [errArg] = posthog.captureException.mock.calls[0];
    expect(errArg).toBeInstanceOf(Error);
    expect(errArg.message).toBe('OBS-04 PostHogErrorBoundary probe');
    // Fallback rendered without crashing the test tree.
    expect(screen.getByTestId('ph-fallback')).toBeInTheDocument();
  });
});
