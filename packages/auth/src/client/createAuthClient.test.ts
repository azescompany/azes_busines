/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/client/createAuthClient.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Auth client lifecycle and API bridge unit tests
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it, vi } from 'vitest';

import { createWebAuthAdapter } from '../adapters/web/createWebAuthAdapter.js';
import { createNativeAuthAdapter } from '../adapters/native/createNativeAuthAdapter.js';
import { createMemorySecureStorage } from '../storage/memorySecureStorage.js';
import { connectAuthToApi } from './connectApi.js';
import { createAuthClient } from './createAuthClient.js';

describe('createAuthClient', () => {
  it('establishes and clears a session without exposing tokens in snapshots', async () => {
    const client = createAuthClient(createWebAuthAdapter());

    await client.establishSession({
      tokens: { accessToken: 'access-secret', refreshToken: 'refresh-secret' },
      subject: { id: 'user-1' },
    });

    const snapshot = await client.getSessionSnapshot();
    expect(snapshot.isAuthenticated).toBe(true);
    expect(snapshot.subjectId).toBe('user-1');
    expect(Object.keys(snapshot)).not.toContain('accessToken');
    expect(Object.keys(snapshot)).not.toContain('refreshToken');
    expect(Object.keys(snapshot)).not.toContain('tokens');

    const token = await client.getAccessToken();
    expect(token === 'access-secret').toBe(true);

    await client.clearSession();
    expect((await client.getSessionSnapshot()).isAuthenticated).toBe(false);
    expect(await client.getAccessToken()).toBeNull();
  });

  it('notifies subscribers on session changes', async () => {
    const client = createAuthClient(createWebAuthAdapter());
    const listener = vi.fn();
    client.subscribe(listener);

    await client.establishSession({
      tokens: { accessToken: 't' },
      subject: { id: 's' },
    });

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ isAuthenticated: true, subjectId: 's' }),
    );
  });
});

describe('connectAuthToApi', () => {
  it('registers and clears token getter / refresh handler', async () => {
    const client = createAuthClient(createWebAuthAdapter());
    await client.establishSession({ tokens: { accessToken: 'wired-token' } });

    let getter: (() => Promise<string | null>) | null = null;
    let refresh: (() => Promise<boolean>) | null = null;

    const connection = connectAuthToApi(client, {
      setAccessTokenGetter: (g) => {
        getter = async () => (await g()) ?? null;
      },
      clearAccessTokenGetter: () => {
        getter = null;
      },
      setAccessTokenRefreshHandler: (handler) => {
        refresh = handler;
      },
    });

    expect(getter).not.toBeNull();
    expect(await getter!()).toBe('wired-token');
    expect(refresh).not.toBeNull();

    connection.disconnect();
    expect(getter).toBeNull();
    expect(refresh).toBeNull();
  });
});

describe('web adapter storage boundary', () => {
  it('does not write tokens to subject storage', async () => {
    const bag = new Map<string, string>();
    const subjectStorage = {
      getItem: (key: string) => bag.get(key) ?? null,
      setItem: (key: string, value: string) => {
        bag.set(key, value);
      },
      removeItem: (key: string) => {
        bag.delete(key);
      },
    };

    const adapter = createWebAuthAdapter({ subjectStorage });
    await adapter.setSession({
      tokens: { accessToken: 'must-not-persist', refreshToken: 'nor-this' },
      subject: { id: 'subj' },
    });

    expect([...bag.values()].join('|')).toBe('subj');
    expect([...bag.values()].some((v) => v.includes('must-not-persist'))).toBe(false);
  });
});

describe('native adapter', () => {
  it('persists session via injected secure storage and clears on logout', async () => {
    const secure = createMemorySecureStorage();
    const adapter = createNativeAuthAdapter({ secureStorage: secure });
    const client = createAuthClient(adapter);

    await client.establishSession({
      tokens: { accessToken: 'native-access', refreshToken: 'native-refresh' },
      subject: { id: 'n1' },
    });

    const rehydrated = createAuthClient(createNativeAuthAdapter({ secureStorage: secure }));
    expect(await rehydrated.getAccessToken()).toBe('native-access');

    await client.clearSession();
    const afterClear = createAuthClient(createNativeAuthAdapter({ secureStorage: secure }));
    expect(await afterClear.getAccessToken()).toBeNull();
  });

  it('refresh failure clears session and reports false', async () => {
    const adapter = createNativeAuthAdapter({
      secureStorage: createMemorySecureStorage(),
      refreshSession: async () => null,
    });
    const client = createAuthClient(adapter);
    await client.establishSession({ tokens: { accessToken: 'old' } });

    const ok = await client.refresh();
    expect(ok).toBe(false);
    expect(await client.getAccessToken()).toBeNull();
  });
});
