/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/launcher/components/LauncherScatterGrid/spiralConfig.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Spiral Bloom timing/geometry constants (single source)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type SpiralIntensity = 'full' | 'soft';

export const SPIRAL = {
  DURATION_MS: 1500,
  STAGGER_MAX_MS: 700,
  SWIRL_TURNS: 1.25,
  SPIN_DEG: 540,
  R_EXTRA_FACTOR: 0.75,
  SCALE_START: 0.35,
  OVERSHOOT_SCALE: 1.06,
  EASE_OUT: 'cubic-bezier(0.16, 1, 0.3, 1)',
  EASE_ROTATE: 'cubic-bezier(0.22, 1, 0.36, 1)',
  EASE_OVERSHOOT: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
  /** Path samples including start (t=0) and end (t=1). */
  KEYFRAME_STEPS: 6,
  /** Progress stamps for path samples (length = KEYFRAME_STEPS + 1). */
  KEYFRAME_T: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1] as const,
  FADE_MS: 150,
  /** Mobile (≤3 cols) multipliers / overrides. */
  MOBILE: {
    SPIN_FACTOR: 0.6,
    R_EXTRA_FACTOR: 0.6,
    DURATION_MS: 1200,
    KEYFRAME_T: [0, 0.33, 0.66, 1] as const,
  },
  /** Soft intensity (scroll-in secondary sections). */
  SOFT: {
    DURATION_FACTOR: 0.72,
    STAGGER_FACTOR: 0.55,
    SWIRL_FACTOR: 0.55,
    SPIN_FACTOR: 0.55,
    R_EXTRA_FACTOR: 0.7,
  },
} as const;

export type SpiralResolved = {
  durationMs: number;
  staggerMaxMs: number;
  swirlTurns: number;
  spinDeg: number;
  rExtraFactor: number;
  scaleStart: number;
  overshootScale: number;
  keyframeT: readonly number[];
};

export function resolveSpiralConfig(intensity: SpiralIntensity, mobile: boolean): SpiralResolved {
  const soft = intensity === 'soft';
  const spinBase = SPIRAL.SPIN_DEG * (mobile ? SPIRAL.MOBILE.SPIN_FACTOR : 1);
  const rExtraBase = mobile ? SPIRAL.MOBILE.R_EXTRA_FACTOR : SPIRAL.R_EXTRA_FACTOR;
  const durationBase = mobile ? SPIRAL.MOBILE.DURATION_MS : SPIRAL.DURATION_MS;
  const keyframeT = mobile ? SPIRAL.MOBILE.KEYFRAME_T : SPIRAL.KEYFRAME_T;

  return {
    durationMs: Math.round(durationBase * (soft ? SPIRAL.SOFT.DURATION_FACTOR : 1)),
    staggerMaxMs: Math.round(SPIRAL.STAGGER_MAX_MS * (soft ? SPIRAL.SOFT.STAGGER_FACTOR : 1)),
    swirlTurns: SPIRAL.SWIRL_TURNS * (soft ? SPIRAL.SOFT.SWIRL_FACTOR : 1),
    spinDeg: Math.round(spinBase * (soft ? SPIRAL.SOFT.SPIN_FACTOR : 1)),
    rExtraFactor: rExtraBase * (soft ? SPIRAL.SOFT.R_EXTRA_FACTOR : 1),
    scaleStart: SPIRAL.SCALE_START,
    overshootScale: SPIRAL.OVERSHOOT_SCALE,
    keyframeT,
  };
}
