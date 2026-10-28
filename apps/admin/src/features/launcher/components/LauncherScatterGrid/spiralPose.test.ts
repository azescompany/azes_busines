/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/launcher/components/LauncherScatterGrid/spiralPose.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Unit tests for Spiral Bloom pose math
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { resolveSpiralConfig } from './spiralConfig.js';
import { computeSpiralPoses, pathStartRadius } from './spiralPose.js';

const baseConfig = resolveSpiralConfig('full', false);

describe('computeSpiralPoses', () => {
  it('ends at identity translate (sx=sy=0)', () => {
    const poses = computeSpiralPoses({
      cols: 4,
      rows: 3,
      trackPx: 96,
      gapPx: 16,
      count: 12,
      config: baseConfig,
    });
    expect(poses).toHaveLength(12);
    for (const pose of poses) {
      const last = pose.path[pose.path.length - 1];
      expect(last?.x).toBe(0);
      expect(last?.y).toBe(0);
    }
  });

  it('starts near r_start (orbit radius)', () => {
    const poses = computeSpiralPoses({
      cols: 3,
      rows: 2,
      trackPx: 88,
      gapPx: 8,
      count: 6,
      config: baseConfig,
    });
    for (const pose of poses) {
      const startR = pathStartRadius(pose);
      expect(startR).toBeCloseTo(pose.rStart, 5);
    }
  });

  it('stagger delays are monotone along spiral order', () => {
    const poses = computeSpiralPoses({
      cols: 5,
      rows: 4,
      trackPx: 104,
      gapPx: 16,
      count: 20,
      config: baseConfig,
    });
    const byOrder = [...poses].sort((a, b) => {
      const score = (p: (typeof poses)[0]) =>
        p.rFinal * 2.5 + (((p.thetaFinal % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2));
      return score(a) - score(b);
    });
    for (let i = 1; i < byOrder.length; i += 1) {
      expect(byOrder[i]!.delayMs).toBeGreaterThanOrEqual(byOrder[i - 1]!.delayMs);
    }
  });

  it('returns empty for count 0', () => {
    expect(
      computeSpiralPoses({
        cols: 3,
        rows: 1,
        trackPx: 88,
        gapPx: 8,
        count: 0,
        config: baseConfig,
      }),
    ).toEqual([]);
  });

  it('soft config shortens duration and stagger', () => {
    const soft = resolveSpiralConfig('soft', false);
    expect(soft.durationMs).toBeLessThan(baseConfig.durationMs);
    expect(soft.staggerMaxMs).toBeLessThan(baseConfig.staggerMaxMs);
  });
});
