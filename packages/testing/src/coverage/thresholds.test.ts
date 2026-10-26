/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/testing/src/coverage/thresholds.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Coverage threshold export smoke test
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { coverageThresholds } from './thresholds.js';

describe('coverageThresholds', () => {
  it('exports a baseline gate', () => {
    expect(coverageThresholds.lines).toBeGreaterThan(0);
    expect(coverageThresholds.functions).toBeGreaterThan(0);
  });
});
