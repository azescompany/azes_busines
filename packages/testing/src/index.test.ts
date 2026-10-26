/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/testing/src/index.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Root export smoke for @azes/testing
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { coverageThresholds } from './index.js';

describe('@azes/testing', () => {
  it('re-exports coverage thresholds', () => {
    expect(coverageThresholds.statements).toBe(coverageThresholds.lines);
  });
});
