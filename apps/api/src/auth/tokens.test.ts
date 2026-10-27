/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/tokens.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-27
 * ║ Purpose: JWT + refresh hash unit tests
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import {
  createRefreshSecret,
  hashRefreshToken,
  signAccessToken,
  verifyAccessToken,
} from './tokens.js';

const SECRET = 'test-jwt-access-secret-32chars-min!!';

describe('tokens', () => {
  it('signs and verifies access JWT claims', async () => {
    const token = await signAccessToken(
      { sub: 'user-1', sid: 'sess-1', roles: ['member'], orgId: null },
      SECRET,
    );
    const claims = await verifyAccessToken(token, SECRET);
    expect(claims).toEqual({
      sub: 'user-1',
      sid: 'sess-1',
      roles: ['member'],
      orgId: null,
    });
  });

  it('still emits permissions claim for client compat (non-authoritative)', async () => {
    const token = await signAccessToken(
      {
        sub: 'user-1',
        sid: 'sess-1',
        roles: ['member'],
        orgId: 'org-1',
        permissions: ['catalog.read', 'dashboard.read'],
      },
      SECRET,
    );
    const claims = await verifyAccessToken(token, SECRET);
    expect(claims).toEqual({
      sub: 'user-1',
      sid: 'sess-1',
      roles: ['member'],
      orgId: 'org-1',
      permissions: ['catalog.read', 'dashboard.read'],
    });
  });

  it('hashes refresh secrets deterministically', async () => {
    const secret = createRefreshSecret();
    const a = await hashRefreshToken(secret);
    const b = await hashRefreshToken(secret);
    expect(a).toBe(b);
    expect(a).not.toBe(secret);
  });
});
