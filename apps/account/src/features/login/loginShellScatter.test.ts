/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/loginShellScatter.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Scatter pose map — ids, sizes, safe-zone intent
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import {
  LOGIN_SHELL_SAFE_ZONE,
  LOGIN_SHELL_SCATTER,
  LOGIN_SHELL_SCATTER_COMPACT,
  poseById,
} from './loginShellScatter.js';

describe('loginShellScatter', () => {
  it('defines five unique card poses with CSS length tokens', () => {
    expect(LOGIN_SHELL_SCATTER).toHaveLength(5);
    const ids = LOGIN_SHELL_SCATTER.map((p) => p.id);
    expect(new Set(ids).size).toBe(5);
    for (const pose of LOGIN_SHELL_SCATTER) {
      expect(pose.tx).toMatch(/vw|%|clamp/);
      expect(pose.ty).toMatch(/vh|%|clamp/);
      expect(pose.width).toMatch(/clamp|rem|vw/);
      expect(pose.rot).toMatch(/deg/);
    }
  });

  it('defines compact phone poses (3 cards)', () => {
    expect(LOGIN_SHELL_SCATTER_COMPACT).toHaveLength(3);
    for (const pose of LOGIN_SHELL_SCATTER_COMPACT) {
      expect(pose.width).toMatch(/clamp|rem|vw/);
    }
  });

  it('keeps a defined center safe zone for logo/welcome', () => {
    expect(LOGIN_SHELL_SAFE_ZONE.xMin).toBeLessThan(LOGIN_SHELL_SAFE_ZONE.xMax);
    expect(LOGIN_SHELL_SAFE_ZONE.yMin).toBeLessThan(LOGIN_SHELL_SAFE_ZONE.yMax);
    expect(LOGIN_SHELL_SAFE_ZONE.xMax - LOGIN_SHELL_SAFE_ZONE.xMin).toBeGreaterThan(0.2);
    expect(LOGIN_SHELL_SAFE_ZONE.yMax - LOGIN_SHELL_SAFE_ZONE.yMin).toBeGreaterThan(0.2);
  });

  it('resolves poses by id', () => {
    expect(poseById('listings').fanDepth).toBeGreaterThan(poseById('deals').fanDepth);
  });
});
