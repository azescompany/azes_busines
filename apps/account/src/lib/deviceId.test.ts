/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/lib/deviceId.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-05
 * ║ Updated: 2026-10-05
 * ║ Purpose: Unit tests for masked device-id formatting
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { maskDeviceId } from './deviceId.js';

describe('maskDeviceId', () => {
  it('formats a long hex id with a redacted middle segment', () => {
    expect(maskDeviceId('a1b2c3d4e5f607182930aabbccddeeff')).toBe('A1B2-C3D4-••••-0718');
  });

  it('pads short ids deterministically', () => {
    expect(maskDeviceId('dead')).toBe('DEAD-0000-••••-0000');
  });
});
