/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/session/sessionFromTokens.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Unit tests for sessionFromTokens
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { createAuthClient } from '../client/createAuthClient.js';
import { createWebAuthAdapter } from '../adapters/web/createWebAuthAdapter.js';
import { sessionFromTokens } from './sessionFromTokens.js';

function encodePayload(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `hdr.${b64}.sig`;
}

describe('sessionFromTokens', () => {
  it('sets subject from UserId and keeps tokens out of the snapshot', async () => {
    const access = encodePayload({
      UserId: 'user-99',
      FullName: 'Grace Hopper',
      RoleId: '2',
      role: 'SuperAdmin',
      OrganizationId: 'org-1',
      exp: 1_800_000_000,
    });
    const session = sessionFromTokens(access, 'refresh-secret');

    expect(session.subject).toEqual({ id: 'user-99' });
    expect(session.profile).toEqual({
      fullName: 'Grace Hopper',
      organizationId: 'org-1',
      roleId: '2',
      role: 'SuperAdmin',
    });
    expect(session.tokens.accessToken).toBe(access);
    expect(session.tokens.refreshToken).toBe('refresh-secret');
    expect(session.tokens.expiresAt).toBe(1_800_000_000_000);

    const client = createAuthClient(createWebAuthAdapter());
    await client.establishSession(session);
    const snapshot = await client.getSessionSnapshot();
    expect(snapshot.subjectId).toBe('user-99');
    expect(snapshot.fullName).toBe('Grace Hopper');
    expect(snapshot.roleId).toBe('2');
    expect(Object.keys(snapshot)).not.toContain('accessToken');
    expect(Object.keys(snapshot)).not.toContain('refreshToken');
    expect(JSON.stringify(snapshot)).not.toContain(access);
    expect(JSON.stringify(snapshot)).not.toContain('refresh-secret');
  });
});
