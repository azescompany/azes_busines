/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/testing/src/coverage/thresholds.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Workspace Vitest coverage baseline thresholds
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

/**
 * Baseline coverage gates for packages that opt into `test:coverage`.
 * Thresholds are intentionally modest for foundation packages; raise per-package later.
 */
export const coverageThresholds = {
  lines: 40,
  functions: 40,
  branches: 30,
  statements: 40,
} as const;

export type CoverageThresholds = typeof coverageThresholds;
