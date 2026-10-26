/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/password.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: PBKDF2 password hash unit tests
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { hashPassword, normalizeUsername, verifyPassword } from './password.js';

describe('password', () => {
  it('hashes and verifies a password', async () => {
    const encoded = await hashPassword('LocalDevPass123!');
    expect(encoded.startsWith('pbkdf2$')).toBe(true);
    await expect(verifyPassword('LocalDevPass123!', encoded)).resolves.toBe(true);
    await expect(verifyPassword('wrong', encoded)).resolves.toBe(false);
  });

  it('normalizes usernames', () => {
    expect(normalizeUsername('  Local.Dev ')).toBe('local.dev');
  });
});
