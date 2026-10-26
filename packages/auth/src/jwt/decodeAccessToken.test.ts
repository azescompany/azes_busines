/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/jwt/decodeAccessToken.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Unit tests for access JWT claim decode helpers
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import {
  decodeAccessToken,
  getAccessTokenExpiryMs,
  roleFlagsFromClaims,
  toAuthSubjectFromClaims,
} from './decodeAccessToken.js';

function encodePayload(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `hdr.${b64}.sig`;
}

describe('decodeAccessToken', () => {
  it('decodes a valid Caspian-shaped payload', () => {
    const token = encodePayload({
      UserId: 'user-42',
      FullName: 'Ada Lovelace',
      RoleId: '1',
      role: 'Admin',
      OrganizationId: 'org-9',
      exp: 1_700_000_000,
    });
    const claims = decodeAccessToken(token);
    expect(claims).toMatchObject({
      UserId: 'user-42',
      FullName: 'Ada Lovelace',
      RoleId: '1',
      role: 'Admin',
      OrganizationId: 'org-9',
      exp: 1_700_000_000,
    });
  });

  it('returns null for malformed tokens', () => {
    expect(decodeAccessToken('')).toBeNull();
    expect(decodeAccessToken('not-a-jwt')).toBeNull();
    expect(decodeAccessToken('a.!!!.b')).toBeNull();
  });
});

describe('roleFlagsFromClaims', () => {
  it('maps RoleId 1–4 and ignores the role string', () => {
    expect(roleFlagsFromClaims({ RoleId: '1', role: 'User' })).toEqual({
      isAdmin: true,
      isSuperAdmin: false,
      isUser: false,
      isEvaluation: false,
    });
    expect(roleFlagsFromClaims({ RoleId: '2' }).isSuperAdmin).toBe(true);
    expect(roleFlagsFromClaims({ RoleId: '3' }).isUser).toBe(true);
    expect(roleFlagsFromClaims({ RoleId: '4' }).isEvaluation).toBe(true);
    expect(roleFlagsFromClaims({ role: 'Admin' }).isAdmin).toBe(false);
  });
});

describe('subject and expiry', () => {
  it('builds subject from UserId and expiry from exp', () => {
    const claims = { UserId: 'u-1', exp: 1_700_000_000 };
    expect(toAuthSubjectFromClaims(claims)).toEqual({ id: 'u-1' });
    expect(toAuthSubjectFromClaims({})).toBeUndefined();

    const token = encodePayload(claims);
    expect(getAccessTokenExpiryMs(token)).toBe(1_700_000_000_000);
    expect(getAccessTokenExpiryMs('bad')).toBeNull();
  });

  it('builds subject from standard sub when UserId is absent', () => {
    expect(toAuthSubjectFromClaims({ sub: 'academy-user-1' })).toEqual({
      id: 'academy-user-1',
    });
    expect(toAuthSubjectFromClaims({ UserId: 'legacy', sub: 'ignored' })).toEqual({
      id: 'legacy',
    });
  });
});
