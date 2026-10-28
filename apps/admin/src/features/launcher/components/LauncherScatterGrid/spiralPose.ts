/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/launcher/components/LauncherScatterGrid/spiralPose.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Pure Spiral Bloom pose / stagger math (testable)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { SpiralResolved } from './spiralConfig.js';

export type SpiralPoseInput = {
  cols: number;
  rows: number;
  trackPx: number;
  gapPx: number;
  count: number;
  config: SpiralResolved;
};

export type SpiralPathPoint = { x: number; y: number };

export type SpiralPose = {
  index: number;
  /** Final cell offset from grid center (world). */
  dx: number;
  dy: number;
  rFinal: number;
  thetaFinal: number;
  rStart: number;
  thetaStart: number;
  /** Relative translates for CSS path keyframes (last ≈ 0,0). */
  path: SpiralPathPoint[];
  delayMs: number;
  spinDeg: number;
  scaleStart: number;
  overshootScale: number;
};

function easeOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) ** 3;
}

function easeInOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

function cellPitch(trackPx: number, gapPx: number): number {
  return trackPx + gapPx;
}

/**
 * Compute per-tile spiral path (relative to final cell) + wave stagger.
 * Final sample is identity translate (sx=sy≈0).
 */
export function computeSpiralPoses(input: SpiralPoseInput): SpiralPose[] {
  const { cols, rows, trackPx, gapPx, count, config } = input;
  if (count <= 0) return [];

  const pitch = cellPitch(trackPx, gapPx);
  const centerCol = (Math.min(count, cols) - 1) / 2;
  const centerRow = (rows - 1) / 2;
  const gridW = Math.max(0, Math.min(count, cols) - 1) * pitch;
  const gridH = Math.max(0, rows - 1) * pitch;
  const diagonal = Math.hypot(gridW, gridH) || pitch;
  const rExtra = diagonal * config.rExtraFactor;
  const swirl = config.swirlTurns * Math.PI * 2;
  const keyframeT = config.keyframeT;

  const drafts: Array<
    Omit<SpiralPose, 'delayMs' | 'path'> & { orderScore: number; path: SpiralPathPoint[] }
  > = [];

  for (let index = 0; index < count; index += 1) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const dx = (col - centerCol) * pitch;
    const dy = (row - centerRow) * pitch;
    const rFinal = Math.hypot(dx, dy);
    const thetaFinal = rFinal < 1e-6 ? 0 : Math.atan2(dy, dx);
    const rStart = rFinal + rExtra;
    const swirlJitter = ((index % 5) - 2) * 0.08;
    const thetaStart = thetaFinal + swirl + swirlJitter;

    const path: SpiralPathPoint[] = keyframeT.map((t) => {
      const r = rStart + (rFinal - rStart) * easeOutCubic(t);
      const theta = thetaStart + (thetaFinal - thetaStart) * easeInOutCubic(t);
      const wx = r * Math.cos(theta);
      const wy = r * Math.sin(theta);
      return { x: wx - dx, y: wy - dy };
    });

    // Force exact identity at end (float safety).
    const last = path[path.length - 1];
    if (last) {
      last.x = 0;
      last.y = 0;
    }

    const thetaNorm = ((thetaFinal % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const orderScore = rFinal * 2.5 + thetaNorm;

    drafts.push({
      index,
      dx,
      dy,
      rFinal,
      thetaFinal,
      rStart,
      thetaStart,
      path,
      orderScore,
      spinDeg: config.spinDeg,
      scaleStart: config.scaleStart,
      overshootScale: config.overshootScale,
    });
  }

  const ranked = [...drafts].sort((a, b) => a.orderScore - b.orderScore);
  const n = ranked.length;
  const delayByIndex = new Map<number, number>();
  ranked.forEach((pose, rank) => {
    const t = n <= 1 ? 0 : rank / (n - 1);
    const delayMs = Math.round(t ** 0.85 * config.staggerMaxMs);
    delayByIndex.set(pose.index, delayMs);
  });

  return drafts.map(({ orderScore: _o, ...rest }) => ({
    ...rest,
    delayMs: delayByIndex.get(rest.index) ?? 0,
  }));
}

/** First path point radius from final cell (≈ r_start when center tile). */
export function pathStartRadius(pose: SpiralPose): number {
  const p0 = pose.path[0];
  if (!p0) return 0;
  return Math.hypot(p0.x + pose.dx, p0.y + pose.dy);
}
