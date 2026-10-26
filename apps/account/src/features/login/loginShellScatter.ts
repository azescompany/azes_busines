/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/loginShellScatter.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Typed asymmetric scatter poses for login success cards
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type ScatterCardId = 'listings' | 'stats' | 'agent' | 'map' | 'deals';

export type ScatterPose = {
  id: ScatterCardId;
  /** Idle fan rotate (deg). */
  fanRotate: number;
  /** Idle stack depth (higher = nearer). */
  fanDepth: number;
  /** Final translate X (CSS length; vw/%/clamp). */
  tx: string;
  /** Final translate Y. */
  ty: string;
  /** Final rotate. */
  rot: string;
  /** Final scale. */
  scale: string;
  /** Card width at rest / scatter. */
  width: string;
};

/**
 * Asymmetric map — corners/edges, sizes vary, center safe zone (~36×32%) empty.
 * Positions use vw/vh so they stay inside typical viewports with card size padding.
 */
export const LOGIN_SHELL_SCATTER: readonly ScatterPose[] = [
  {
    id: 'listings',
    fanRotate: -8,
    fanDepth: 5,
    tx: 'clamp(-42vw, -34vw, -22vw)',
    ty: 'clamp(-34vh, -28vh, -18vh)',
    rot: '-7deg',
    scale: '1.05',
    width: 'clamp(14rem, 28vw, 22rem)',
  },
  {
    id: 'stats',
    fanRotate: 5,
    fanDepth: 4,
    tx: 'clamp(18vw, 30vw, 38vw)',
    ty: 'clamp(-36vh, -26vh, -16vh)',
    rot: '5deg',
    scale: '0.95',
    width: 'clamp(13rem, 26vw, 20rem)',
  },
  {
    id: 'agent',
    fanRotate: -3,
    fanDepth: 3,
    tx: 'clamp(-40vw, -32vw, -20vw)',
    ty: 'clamp(12vh, 22vh, 30vh)',
    rot: '-4deg',
    scale: '0.88',
    width: 'clamp(11rem, 18vw, 15rem)',
  },
  {
    id: 'map',
    fanRotate: 7,
    fanDepth: 2,
    tx: 'clamp(16vw, 28vw, 36vw)',
    ty: 'clamp(10vh, 20vh, 28vh)',
    rot: '6deg',
    scale: '0.9',
    width: 'clamp(11rem, 20vw, 16rem)',
  },
  {
    id: 'deals',
    fanRotate: 2,
    fanDepth: 1,
    tx: 'clamp(-8vw, 0vw, 8vw)',
    ty: 'clamp(26vh, 32vh, 38vh)',
    rot: '2deg',
    scale: '0.82',
    width: 'clamp(12rem, 24vw, 18rem)',
  },
] as const;

/**
 * Compact / phone success map — 3 cards, tighter vw/vh, smaller widths,
 * center kept clear for logo + welcome.
 */
export const LOGIN_SHELL_SCATTER_COMPACT: readonly ScatterPose[] = [
  {
    id: 'listings',
    fanRotate: -6,
    fanDepth: 3,
    tx: 'clamp(-38vw, -28vw, -18vw)',
    ty: 'clamp(-30vh, -22vh, -14vh)',
    rot: '-6deg',
    scale: '0.92',
    width: 'clamp(9.5rem, 42vw, 14rem)',
  },
  {
    id: 'stats',
    fanRotate: 5,
    fanDepth: 2,
    tx: 'clamp(14vw, 26vw, 34vw)',
    ty: 'clamp(-28vh, -20vh, -12vh)',
    rot: '5deg',
    scale: '0.88',
    width: 'clamp(9rem, 40vw, 13rem)',
  },
  {
    id: 'map',
    fanRotate: 2,
    fanDepth: 1,
    tx: 'clamp(-10vw, 0vw, 10vw)',
    ty: 'clamp(18vh, 26vh, 34vh)',
    rot: '3deg',
    scale: '0.85',
    width: 'clamp(8.5rem, 38vw, 12rem)',
  },
] as const;

/** Center safe zone as fractions of viewport (for unit tests). */
export const LOGIN_SHELL_SAFE_ZONE = {
  xMin: 0.32,
  xMax: 0.68,
  yMin: 0.34,
  yMax: 0.66,
} as const;

export function poseById(id: ScatterCardId): ScatterPose {
  const pose = LOGIN_SHELL_SCATTER.find((p) => p.id === id);
  if (!pose) throw new Error(`Unknown scatter card: ${id}`);
  return pose;
}
