/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/hooks/useLoginSuccessTransition.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Single timeline controller for login success → redirect
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export type LoginSuccessPhase =
  | 'idle'
  | 'collapsing'
  | 'expanding'
  | 'scattering'
  | 'settled'
  | 'hold'
  | 'exiting'
  | 'redirecting';

export type LoginSuccessTiming = {
  collapseLeadMs: number;
  expandDurationMs: number;
  scatterDurationMs: number;
  logoRiseDurationMs: number;
  enterStaggerMs: number;
  welcomeDelayMs: number;
  holdDurationMs: number;
  holdReducedMs: number;
  exitDurationMs: number;
  redirectHoldMs: number;
  reducedMotionMs: number;
  mobileCollapseMs: number;
  fallbackRedirectMs: number;
};

export type UseLoginSuccessTransitionOptions = {
  timing: LoginSuccessTiming;
  reducedMotion: boolean;
  onRedirect: () => void;
};

async function waitAnimations(animations: Animation[]): Promise<void> {
  if (animations.length === 0) return;
  await Promise.all(
    animations.map(async (animation) => {
      try {
        await animation.finished;
      } catch {
        // cancelled / superseded — ignore
      }
    }),
  );
}

export function useLoginSuccessTransition({
  timing,
  reducedMotion,
  onRedirect,
}: UseLoginSuccessTransitionOptions) {
  const [phase, setPhase] = useState<LoginSuccessPhase>('idle');
  const timersRef = useRef<number[]>([]);
  const redirectedRef = useRef(false);
  const abortedRef = useRef(false);
  const layerRef = useRef<HTMLElement | null>(null);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const runRedirect = useCallback(() => {
    if (redirectedRef.current || abortedRef.current) return;
    redirectedRef.current = true;
    clearTimers();
    setPhase('redirecting');
    onRedirect();
  }, [clearTimers, onRedirect]);

  const collectLayerAnimations = useCallback(() => {
    const el = layerRef.current;
    if (!el || typeof el.getAnimations !== 'function') return [] as Animation[];
    return el.getAnimations({ subtree: true });
  }, []);

  const start = useCallback(() => {
    clearTimers();
    redirectedRef.current = false;
    abortedRef.current = false;
    setPhase('collapsing');

    schedule(runRedirect, timing.fallbackRedirectMs);

    const holdMs = reducedMotion ? timing.holdReducedMs : timing.holdDurationMs;

    if (reducedMotion) {
      schedule(() => {
        setPhase('settled');
        schedule(() => {
          setPhase('hold');
          schedule(() => {
            setPhase('exiting');
            schedule(runRedirect, timing.exitDurationMs + timing.redirectHoldMs);
          }, holdMs);
        }, timing.welcomeDelayMs);
      }, timing.reducedMotionMs);
      return;
    }

    schedule(() => setPhase('expanding'), timing.collapseLeadMs);

    // Scatter + logo rise start together shortly into the expand.
    const scatterAt = timing.collapseLeadMs + Math.round(timing.expandDurationMs * 0.2);
    schedule(() => setPhase('scattering'), scatterAt);

    const motionBudget =
      scatterAt +
      timing.scatterDurationMs +
      timing.enterStaggerMs * 4 +
      Math.max(timing.logoRiseDurationMs, Math.round(timing.scatterDurationMs * 0.25));

    schedule(async () => {
      setPhase('settled');
      const anims = collectLayerAnimations();
      try {
        await Promise.race([
          waitAnimations(anims),
          new Promise<void>((resolve) => {
            window.setTimeout(resolve, Math.round(motionBudget * 1.5));
          }),
        ]);
      } catch {
        // ignore
      }
      if (abortedRef.current || redirectedRef.current) return;
      setPhase('hold');
      schedule(() => {
        if (abortedRef.current || redirectedRef.current) return;
        setPhase('exiting');
        schedule(runRedirect, timing.exitDurationMs + timing.redirectHoldMs);
      }, holdMs);
    }, motionBudget);
  }, [clearTimers, schedule, runRedirect, timing, reducedMotion, collectLayerAnimations]);

  useEffect(() => {
    return () => {
      abortedRef.current = true;
      clearTimers();
      const el = layerRef.current;
      if (el && typeof el.getAnimations === 'function') {
        for (const a of el.getAnimations({ subtree: true })) {
          try {
            a.cancel();
          } catch {
            // ignore
          }
        }
      }
    };
  }, [clearTimers]);

  return {
    phase,
    start,
    layerRef,
    isBusy: phase !== 'idle',
    isRedirecting: phase === 'redirecting',
  };
}
