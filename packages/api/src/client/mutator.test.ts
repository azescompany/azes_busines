/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/client/mutator.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Unit tests for mutator auth/device/status policy
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setAccessTokenRefreshHandler } from './auth-refresh';
import { setAuthSessionInvalidatedHandler, setPaymentRequiredHandler } from './auth-status';
import { clearAccessTokenGetter, setAccessTokenGetter } from './auth-token';
import { __resetDeviceMetaCacheForTests, __setDeviceDigestForTests } from './device-meta';
import { AzesApiError, isAzesApiError } from './errors';
import { azesMutator } from './mutator';
import { refreshAccessTokens } from './refresh-tokens';
import { configureApi } from '../config/env';

function installMemoryLocalStorage(): void {
  const map = new Map<string, string>();
  vi.stubGlobal('localStorage', {
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
  } satisfies Storage);
}

beforeEach(() => {
  installMemoryLocalStorage();
  vi.stubGlobal('navigator', {
    userAgent: 'TestUA/1.0',
    platform: 'Win32',
    language: 'en-US',
  });
  __setDeviceDigestForTests(async () => 'device-test');
});

afterEach(() => {
  clearAccessTokenGetter();
  setAccessTokenRefreshHandler(null);
  setAuthSessionInvalidatedHandler(null);
  setPaymentRequiredHandler(null);
  __setDeviceDigestForTests(null);
  __resetDeviceMetaCacheForTests();
  configureApi({ baseUrl: '', timeoutMs: 30_000 });
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, status = 200, statusText = 'OK'): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('azesMutator', () => {
  it('returns JSON data on success and injects bearer token + device headers', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    setAccessTokenGetter(() => 'token-123');
    __setDeviceDigestForTests(async () => 'device-abc');

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const data = await azesMutator<{ ok: boolean }>({
      url: '/v1/ping',
      method: 'GET',
    });

    expect(data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('https://api.test/v1/ping');
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBe('Bearer token-123');
    expect(headers.get('X-Device-Id')).toBe('device-abc');
    expect(headers.get('DeviceId')).toBe('device-abc');
  });

  it('enriches JSON mutation bodies without overwriting caller deviceId', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    __setDeviceDigestForTests(async () => 'device-xyz');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await azesMutator({
      url: '/v1/items',
      method: 'POST',
      data: { name: 'n', deviceId: 'caller-device' },
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual(
      expect.objectContaining({
        name: 'n',
        deviceId: 'caller-device',
        userAgent: expect.any(String),
        platform: expect.any(String),
        language: expect.any(String),
      }),
    );
  });

  it('normalizes HTTP failures to AzesApiError', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ message: 'nope' }, 404, 'Not Found')),
    );

    await expect(azesMutator({ url: '/missing', method: 'GET' })).rejects.toSatisfy(
      (error: unknown) =>
        isAzesApiError(error) && error.status === 404 && error instanceof AzesApiError,
    );
  });

  it('returns blob bodies when responseType is blob', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    const payload = new Blob(['report'], { type: 'application/pdf' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(payload, {
          status: 200,
          headers: { 'Content-Type': 'application/pdf' },
        }),
      ),
    );

    const data = await azesMutator<Blob>({
      url: '/v1/report',
      method: 'POST',
      data: { id: 1 },
      responseType: 'blob',
    });

    expect(data).toBeInstanceOf(Blob);
    expect(await data.text()).toBe('report');
  });

  it('retries once after a successful token refresh on 401', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    let token = 'stale';
    setAccessTokenGetter(() => token);
    setAccessTokenRefreshHandler(async () => {
      token = 'fresh';
      return true;
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'expired' }, 401, 'Unauthorized'))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const data = await azesMutator<{ ok: boolean }>({ url: '/secure', method: 'GET' });
    expect(data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondInit = fetchMock.mock.calls[1]?.[1] as RequestInit;
    expect(new Headers(secondInit.headers).get('Authorization')).toBe('Bearer fresh');
  });

  it('single-flights parallel 401 refreshes', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    setAccessTokenGetter(() => 't');
    const refresh = vi.fn(async () => {
      await new Promise((r) => setTimeout(r, 20));
      return true;
    });
    setAccessTokenRefreshHandler(refresh);

    let call = 0;
    const fetchMock = vi.fn().mockImplementation(() => {
      call += 1;
      // First wave: two parallel 401s; after shared refresh: successes.
      if (call <= 2) {
        return Promise.resolve(jsonResponse({}, 401, 'Unauthorized'));
      }
      return Promise.resolve(jsonResponse({ ok: true }));
    });
    vi.stubGlobal('fetch', fetchMock);

    await Promise.all([
      azesMutator({ url: '/a', method: 'GET' }),
      azesMutator({ url: '/b', method: 'GET' }),
    ]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(call).toBeGreaterThanOrEqual(4);
  });

  it('does not refresh when skipAuthRefresh is set', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    const refresh = vi.fn(async () => true);
    setAccessTokenRefreshHandler(refresh);
    const invalidated = vi.fn();
    setAuthSessionInvalidatedHandler(invalidated);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 401, 'Unauthorized')));

    await expect(
      azesMutator({
        url: '/api/v1/accounts/refresh-token',
        method: 'POST',
        data: {},
        skipAuthRefresh: true,
      }),
    ).rejects.toSatisfy((e: unknown) => isAzesApiError(e) && (e as AzesApiError).status === 401);
    expect(refresh).not.toHaveBeenCalled();
    expect(invalidated).not.toHaveBeenCalled();
  });

  it('invalidates session when 401 refresh fails (last-device wins)', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    setAccessTokenGetter(() => 'stale');
    setAccessTokenRefreshHandler(async () => false);
    const invalidated = vi.fn();
    setAuthSessionInvalidatedHandler(invalidated);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ message: 'other device' }, 401, 'Unauthorized')),
    );

    await expect(azesMutator({ url: '/api/v1/menus', method: 'GET' })).rejects.toSatisfy(
      (e: unknown) => isAzesApiError(e) && (e as AzesApiError).status === 401,
    );
    expect(invalidated).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401, message: 'other device' }),
    );
  });

  it('invalidates session when refresh succeeds but retry is still 401', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    setAccessTokenGetter(() => 't');
    setAccessTokenRefreshHandler(async () => true);
    const invalidated = vi.fn();
    setAuthSessionInvalidatedHandler(invalidated);
    // Fresh Response per call — body can only be read once.
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(jsonResponse({ message: 'session gone' }, 401, 'Unauthorized')),
        ),
    );

    await expect(azesMutator({ url: '/api/v1/menus', method: 'GET' })).rejects.toSatisfy(
      (e: unknown) => isAzesApiError(e) && (e as AzesApiError).status === 401,
    );
    expect(invalidated).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401, message: 'session gone' }),
    );
  });

  it('refreshAccessTokens uses raw fetch without mutator refresh recursion', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    const refresh = vi.fn(async () => true);
    setAccessTokenRefreshHandler(refresh);
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, 401, 'Unauthorized'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(refreshAccessTokens({ refreshToken: 'r', deviceId: 'd1' })).rejects.toSatisfy(
      (e: unknown) => isAzesApiError(e) && (e as AzesApiError).status === 401,
    );
    expect(refresh).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/api/v1/auth/refresh',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'r', deviceId: 'd1' }),
      }),
    );
  });

  it('refreshAccessTokens rejects when deviceId is missing', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(refreshAccessTokens({ refreshToken: 'r', deviceId: '' })).rejects.toSatisfy(
      (e: unknown) => isAzesApiError(e) && (e as AzesApiError).status === 0,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('omits Authorization Bearer on AZES auth login', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    setAccessTokenGetter(() => 'stale-jwt');
    __setDeviceDigestForTests(async () => 'device-azes');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ accessToken: 'a' }));
    vi.stubGlobal('fetch', fetchMock);

    await azesMutator({
      url: '/api/v1/auth/login',
      method: 'POST',
      data: { username: 'local.dev', password: 'x' },
      headers: { Authorization: 'Bearer stale-jwt' },
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBeNull();
  });

  it('calls invalidation handler on 403 for authenticated URLs (legacy / session kill)', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    const invalidated = vi.fn();
    setAuthSessionInvalidatedHandler(invalidated);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ message: 'other device' }, 403, 'Forbidden')),
    );

    await expect(azesMutator({ url: '/api/v1/accounts/me', method: 'GET' })).rejects.toSatisfy(
      (e: unknown) => isAzesApiError(e) && (e as AzesApiError).status === 403,
    );
    expect(invalidated).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403, message: 'other device' }),
    );
  });

  it('does not invalidate session on AZES RBAC 403 FORBIDDEN', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    const invalidated = vi.fn();
    setAuthSessionInvalidatedHandler(invalidated);
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
            403,
            'Forbidden',
          ),
        ),
    );

    await expect(azesMutator({ url: '/api/v1/me/dashboard', method: 'GET' })).rejects.toSatisfy(
      (e: unknown) => isAzesApiError(e) && (e as AzesApiError).status === 403,
    );
    expect(invalidated).not.toHaveBeenCalled();
  });

  it('does not call invalidation handler on 403 for login', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    const invalidated = vi.fn();
    setAuthSessionInvalidatedHandler(invalidated);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 403, 'Forbidden')));

    await expect(
      azesMutator({ url: '/api/v1/accounts/login', method: 'POST', data: { userName: 'a' } }),
    ).rejects.toSatisfy((e: unknown) => isAzesApiError(e) && (e as AzesApiError).status === 403);
    expect(invalidated).not.toHaveBeenCalled();
  });

  it('omits Authorization Bearer on login even when a token getter is registered', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    setAccessTokenGetter(() => 'stale-jwt');
    __setDeviceDigestForTests(async () => 'device-login');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ accessToken: 'a' }));
    vi.stubGlobal('fetch', fetchMock);

    await azesMutator({
      url: '/api/v1/accounts/login',
      method: 'POST',
      data: { userName: 'admin', password: 'x' },
      headers: { Authorization: 'Bearer stale-jwt' },
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBeNull();
    expect(headers.get('X-Device-Id')).toBe('device-login');
    expect(headers.get('DeviceId')).toBe('device-login');
  });

  it('calls payment handler on 402', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    const payment = vi.fn();
    setPaymentRequiredHandler(payment);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, 402, 'Payment Required')));

    await expect(azesMutator({ url: '/api/v1/billing', method: 'GET' })).rejects.toSatisfy(
      (e: unknown) => isAzesApiError(e) && (e as AzesApiError).status === 402,
    );
    expect(payment).toHaveBeenCalledWith(expect.objectContaining({ status: 402 }));
  });

  it('does not invalidate on network errors', async () => {
    configureApi({ baseUrl: 'https://api.test' });
    const invalidated = vi.fn();
    setAuthSessionInvalidatedHandler(invalidated);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));

    await expect(azesMutator({ url: '/v1/x', method: 'GET' })).rejects.toSatisfy(
      (e: unknown) => isAzesApiError(e) && (e as AzesApiError).status === 0,
    );
    expect(invalidated).not.toHaveBeenCalled();
  });
});
