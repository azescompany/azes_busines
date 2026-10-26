/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/client/mutator.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-20
 * ║ Purpose: Orval mutator — Bearer, device headers/body, 401/403/402 policy
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { tryRefreshAccessToken } from './auth-refresh';
import { notifyAuthSessionInvalidated, notifyPaymentRequired } from './auth-status';
import { resolveAccessToken } from './auth-token';
import { getOrCreateDeviceMeta } from './device-meta';
import { AzesApiError, messageFromAzesApiErrorBody } from './errors';
import { getApiConfig, resolveRequestUrl } from '../config/env';

export type AzesMutatorResponseType = 'json' | 'blob' | 'text';

export type AzesMutatorConfig = {
  url: string;
  method?: string;
  params?: Record<string, unknown>;
  data?: unknown;
  /** Portable header init (avoid DOM-only `HeadersInit` for RN typecheck). */
  headers?: Record<string, string> | [string, string][] | Headers;
  signal?: AbortSignal;
  /** Orval may request blob for file downloads (e.g. report generation). */
  responseType?: AzesMutatorResponseType;
  /**
   * When true, a 401 does not trigger refresh (refresh-token call itself).
   * Prefer `refreshAccessTokens()` which sets this flag.
   */
  skipAuthRefresh?: boolean;
};

function isLoginUrl(url: string): boolean {
  return (
    /\/api\/v1\/auth\/login(?:\?|$)/i.test(url) ||
    /\/api\/v1\/accounts\/login(?:\?|$)/i.test(url) ||
    /\/accounts\/login(?:\?|$)/i.test(url)
  );
}

function isRefreshTokenUrl(url: string): boolean {
  return (
    /\/api\/v1\/auth\/refresh(?:\?|$)/i.test(url) ||
    /\/api\/v1\/accounts\/refresh-token(?:\?|$)/i.test(url) ||
    /\/accounts\/refresh-token(?:\?|$)/i.test(url)
  );
}

/** Login / refresh must not carry a leftover Bearer (prod parity; avoids 400 on auth). */
function isAnonymousAuthUrl(url: string): boolean {
  return isLoginUrl(url) || isRefreshTokenUrl(url);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof FormData)
  );
}

async function parseBody(
  response: Response,
  responseType?: AzesMutatorResponseType,
): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  if (responseType === 'blob') {
    return response.blob();
  }

  if (responseType === 'text') {
    return response.text();
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
}

function buildUrl(path: string, params?: Record<string, unknown>): string {
  const resolved = resolveRequestUrl(path);
  if (!params) {
    return resolved;
  }

  const isAbsolute = /^https?:\/\//i.test(resolved);
  const url = isAbsolute ? new URL(resolved) : new URL(resolved, 'http://azes.invalid');

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }
    url.searchParams.set(key, String(value));
  }

  return isAbsolute ? url.toString() : `${url.pathname}${url.search}`;
}

async function applyAuthHeader(headers: Headers, requestUrl: string): Promise<void> {
  // Anonymous auth endpoints: never send Authorization (even if a cookie JWT exists).
  if (isAnonymousAuthUrl(requestUrl)) {
    headers.delete('Authorization');
    return;
  }

  // Single source of truth: never leave a stale/empty Authorization hanging around.
  const existing = headers.get('Authorization')?.trim();
  if (existing) {
    return;
  }
  headers.delete('Authorization');
  const raw = (await resolveAccessToken())?.trim();
  if (!raw) {
    return;
  }
  const token = raw.replace(/^Bearer\s+/i, '');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
}

async function applyDeviceHeaders(headers: Headers): Promise<void> {
  const device = await getOrCreateDeviceMeta();
  // Keep X-Device-Id and DeviceId identical (prod / backend expect both).
  const deviceId =
    headers.get('X-Device-Id')?.trim() || headers.get('DeviceId')?.trim() || device.deviceId;
  headers.set('X-Device-Id', deviceId);
  headers.set('DeviceId', deviceId);
}

async function enrichJsonBody(method: string, data: unknown): Promise<unknown> {
  const upper = method.toUpperCase();
  if (upper !== 'POST' && upper !== 'PUT' && upper !== 'PATCH') {
    return data;
  }
  if (!isPlainObject(data)) {
    return data;
  }
  const device = await getOrCreateDeviceMeta();
  // Caller-supplied fields win over device defaults.
  return {
    deviceId: device.deviceId,
    userAgent: device.userAgent,
    platform: device.platform,
    language: device.language,
    ...data,
  };
}

async function executeOnce<TData>(config: AzesMutatorConfig, signal: AbortSignal): Promise<TData> {
  const headers = new Headers(config.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json, text/plain, */*');
  }

  const method = config.method ?? 'GET';
  const data = await enrichJsonBody(method, config.data);
  const hasJsonBody = data !== undefined && !(data instanceof FormData);
  if (hasJsonBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  await applyAuthHeader(headers, config.url);
  await applyDeviceHeaders(headers);

  const url = buildUrl(config.url, config.params);

  const response = await fetch(url, {
    method,
    headers,
    body: hasJsonBody
      ? JSON.stringify(data)
      : (data as string | Blob | FormData | ArrayBuffer | null | undefined),
    signal,
  });

  const body = await parseBody(response, config.responseType);

  if (!response.ok) {
    const fallback = `API request failed with ${response.status} ${response.statusText}`;
    throw new AzesApiError({
      message: messageFromAzesApiErrorBody(body, fallback),
      status: response.status,
      statusText: response.statusText,
      url,
      body,
    });
  }

  return body as TData;
}

function isSessionAuthUrl(requestUrl: string, errorUrl: string): boolean {
  return !isLoginUrl(requestUrl) && !isLoginUrl(errorUrl);
}

/** AZES `{ error: { code } }` or flat `{ code }` — used to separate RBAC from session kill. */
function apiErrorCode(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const record = body as Record<string, unknown>;
  const nested = record.error;
  if (nested && typeof nested === 'object') {
    const code = (nested as Record<string, unknown>).code;
    if (typeof code === 'string' && code.trim()) return code.trim();
  }
  if (typeof record.code === 'string' && record.code.trim()) {
    return record.code.trim();
  }
  return undefined;
}

/**
 * RBAC / resource denials must not wipe the JWT session.
 * Legacy Caspian 403s without a code still invalidate (other-device / disabled).
 */
function isRbacForbidden403(error: AzesApiError): boolean {
  return apiErrorCode(error.body) === 'FORBIDDEN';
}

async function applyStatusSideEffects(error: AzesApiError, requestUrl: string): Promise<void> {
  if (
    error.status === 403 &&
    isSessionAuthUrl(requestUrl, error.url) &&
    !isRbacForbidden403(error)
  ) {
    await notifyAuthSessionInvalidated(error);
    return;
  }
  if (error.status === 402) {
    await notifyPaymentRequired(error);
  }
}

/**
 * Last-device-wins: 401 after a failed refresh (or retry still 401) means this device
 * lost the session — force logout to Account login.
 */
async function invalidateAfterFailedAuth(error: AzesApiError, requestUrl: string): Promise<void> {
  if (!isSessionAuthUrl(requestUrl, error.url)) {
    return;
  }
  await notifyAuthSessionInvalidated(error);
}

/**
 * Orval mutator used by generated clients.
 * Returns response data (not the Response object) so generated hooks stay typed.
 * On 401, attempts a single-flight auth refresh then retries once (unless skipAuthRefresh).
 * If refresh fails or the retry is still 401 → session invalidation (other device / expired).
 */
export async function azesMutator<TData>(config: AzesMutatorConfig): Promise<TData> {
  const { timeoutMs } = getApiConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (config.signal) {
    if (config.signal.aborted) {
      controller.abort();
    } else {
      config.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  const signal = controller.signal;
  const url = buildUrl(config.url, config.params);

  try {
    try {
      return await executeOnce<TData>(config, signal);
    } catch (error) {
      if (error instanceof AzesApiError && error.status === 401 && !config.skipAuthRefresh) {
        const refreshed = await tryRefreshAccessToken();
        if (refreshed) {
          try {
            return await executeOnce<TData>(config, signal);
          } catch (retryError) {
            if (retryError instanceof AzesApiError && retryError.status === 401) {
              await invalidateAfterFailedAuth(retryError, config.url);
            } else if (retryError instanceof AzesApiError) {
              await applyStatusSideEffects(retryError, config.url);
            }
            throw retryError;
          }
        }
        // Refresh failed (other device took the session, or refresh token dead).
        await invalidateAfterFailedAuth(error, config.url);
        throw error;
      }

      if (error instanceof AzesApiError) {
        await applyStatusSideEffects(error, config.url);
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof AzesApiError) {
      throw error;
    }

    throw new AzesApiError({
      message: error instanceof Error ? error.message : 'API request failed',
      status: 0,
      statusText: 'NETWORK_ERROR',
      url,
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export default azesMutator;
