/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/hooks/useLoginSuccessTransition.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Timeline controller — auto hold + fallback redirect
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLoginSuccessTransition } from './useLoginSuccessTransition.js';

const timing = {
  collapseLeadMs: 100,
  expandDurationMs: 200,
  scatterDurationMs: 200,
  logoRiseDurationMs: 100,
  enterStaggerMs: 20,
  welcomeDelayMs: 50,
  holdDurationMs: 500,
  holdReducedMs: 50,
  exitDurationMs: 40,
  redirectHoldMs: 20,
  reducedMotionMs: 40,
  mobileCollapseMs: 40,
  fallbackRedirectMs: 800,
};

describe('useLoginSuccessTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('redirects via fallback timer even if motion never finishes', async () => {
    const onRedirect = vi.fn();
    const { result } = renderHook(() =>
      useLoginSuccessTransition({
        timing,
        reducedMotion: false,
        onRedirect,
      }),
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.phase).toBe('collapsing');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(timing.fallbackRedirectMs + 20);
    });
    expect(onRedirect).toHaveBeenCalled();
    expect(result.current.phase).toBe('redirecting');
  });

  it('auto-holds then redirects on reduced-motion path', async () => {
    const onRedirect = vi.fn();
    const { result } = renderHook(() =>
      useLoginSuccessTransition({
        timing,
        reducedMotion: true,
        onRedirect,
      }),
    );

    act(() => {
      result.current.start();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(
        timing.reducedMotionMs +
          timing.welcomeDelayMs +
          timing.holdReducedMs +
          timing.exitDurationMs +
          timing.redirectHoldMs +
          20,
      );
    });
    expect(onRedirect).toHaveBeenCalled();
  });
});
