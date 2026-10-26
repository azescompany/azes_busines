/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/client/device-meta.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-11
 * ║ Purpose: Unit tests for atomic device fingerprint helper
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __resetDeviceMetaCacheForTests,
  __setDeviceDigestForTests,
  getOrCreateDeviceMeta,
  seedDeviceId,
} from './device-meta';

function installMemoryLocalStorage(): Storage {
  const map = new Map<string, string>();
  const storage = {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    key: (index: number) => [...map.keys()][index] ?? null,
  } satisfies Storage;
  vi.stubGlobal('localStorage', storage);
  return storage;
}

beforeEach(() => {
  installMemoryLocalStorage();
  vi.stubGlobal('navigator', {
    userAgent: 'TestUA/1.0',
    platform: 'Win32',
    language: 'en-US',
  });
});

afterEach(() => {
  __setDeviceDigestForTests(null);
  __resetDeviceMetaCacheForTests();
  vi.unstubAllGlobals();
});

describe('getOrCreateDeviceMeta', () => {
  it('hashes userAgent|platform|language and persists full meta + bare mirrors', async () => {
    __setDeviceDigestForTests(async (raw) => {
      expect(raw).toBe('TestUA/1.0|Win32|en-US');
      return 'deadbeef';
    });

    const first = await getOrCreateDeviceMeta();
    expect(first).toEqual({
      deviceId: 'deadbeef',
      userAgent: 'TestUA/1.0',
      platform: 'Win32',
      language: 'en-US',
    });
    expect(localStorage.getItem('azes.device.id')).toBe('deadbeef');
    expect(localStorage.getItem('app_device_id')).toBe('deadbeef');
    expect(JSON.parse(localStorage.getItem('azes.device.meta') ?? '{}')).toMatchObject({
      v: 1,
      deviceId: 'deadbeef',
      userAgent: 'TestUA/1.0',
    });

    __setDeviceDigestForTests(async () => 'should-not-run');
    const second = await getOrCreateDeviceMeta();
    expect(second.deviceId).toBe('deadbeef');
  });

  it('pins stored full meta even when navigator drifts (prevents login 400)', async () => {
    localStorage.setItem(
      'azes.device.meta',
      JSON.stringify({
        v: 1,
        deviceId: 'pinned-id',
        userAgent: 'PinnedUA/9',
        platform: 'Win32',
        language: 'en-US',
      }),
    );
    vi.stubGlobal('navigator', {
      userAgent: 'DriftedUA/10',
      platform: 'Win32',
      language: 'az-AZ',
    });
    const digest = vi.fn(async () => 'new-hash');
    __setDeviceDigestForTests(digest);

    const meta = await getOrCreateDeviceMeta();
    expect(meta).toEqual({
      deviceId: 'pinned-id',
      userAgent: 'PinnedUA/9',
      platform: 'Win32',
      language: 'en-US',
    });
    expect(digest).not.toHaveBeenCalled();
  });

  it('promotes legacy bare id only when it still matches current fingerprint', async () => {
    __setDeviceDigestForTests(async () => 'matching-id');
    localStorage.setItem('azes.device.id', 'matching-id');

    const meta = await getOrCreateDeviceMeta();
    expect(meta.deviceId).toBe('matching-id');
    expect(meta.userAgent).toBe('TestUA/1.0');
    expect(JSON.parse(localStorage.getItem('azes.device.meta') ?? '{}').deviceId).toBe(
      'matching-id',
    );
  });

  it('discards orphan bare id that no longer matches navigator fingerprint', async () => {
    localStorage.setItem('azes.device.id', 'orphan-from-prod-copy');
    localStorage.setItem('app_device_id', 'orphan-from-prod-copy');
    __setDeviceDigestForTests(async () => 'fresh-consistent');

    const meta = await getOrCreateDeviceMeta();
    expect(meta.deviceId).toBe('fresh-consistent');
    expect(localStorage.getItem('azes.device.id')).toBe('fresh-consistent');
    expect(localStorage.getItem('app_device_id')).toBe('fresh-consistent');
  });
});

describe('seedDeviceId', () => {
  it('overwrites memory + full storage so cross-port handoff matches login device', async () => {
    localStorage.setItem('azes.device.id', 'old-admin-device');
    const seeded = seedDeviceId('login-device', {
      userAgent: 'LoginUA',
      platform: 'Win32',
      language: 'en-US',
    });
    expect(seeded.deviceId).toBe('login-device');
    expect(localStorage.getItem('azes.device.id')).toBe('login-device');
    expect(localStorage.getItem('app_device_id')).toBe('login-device');
    expect((await getOrCreateDeviceMeta()).userAgent).toBe('LoginUA');
  });

  it('pins registered userAgent when options override navigator (DevTools emulation)', async () => {
    const seeded = seedDeviceId('prod-device', {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36',
      platform: 'Win32',
      language: 'en-US',
    });
    expect(seeded.userAgent).toContain('Windows NT 10.0');
    expect(seeded.userAgent).not.toContain('Android');
    const meta = await getOrCreateDeviceMeta();
    expect(meta.userAgent).toBe(seeded.userAgent);
    expect(meta.deviceId).toBe('prod-device');
  });
});
