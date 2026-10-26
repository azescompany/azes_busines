/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/config/appMeta.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: App metadata unit test for @azes/account
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { appMeta } from './appMeta.js';

describe('appMeta', () => {
  it('identifies the shell', () => {
    expect(appMeta.packageName).toBe('@azes/account');
    expect(appMeta.platform).toBe('web-vite');
    expect(appMeta.name.length).toBeGreaterThan(0);
  });
});
