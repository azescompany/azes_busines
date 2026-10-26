/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/client/refresh-tokens.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-19
 * ║ Purpose: Raw refresh-token HTTP (AZES /api/v1/auth/refresh)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { resolveRequestUrl } from '../config/env';
import { AzesApiError } from './errors';

export type RefreshAccessTokensBody = {
  refreshToken: string;
  /** Device fingerprint — required by AZES auth contract. */
  deviceId: string;
};

export type RefreshAccessTokensResult = {
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresIn?: number | null;
  tokenType?: string | null;
};

/**
 * POST /api/v1/auth/refresh via raw `fetch` (not `azesMutator`).
 * Avoids device body enrich and 401→refresh recursion.
 */
export async function refreshAccessTokens(
  body: RefreshAccessTokensBody,
  signal?: AbortSignal,
): Promise<RefreshAccessTokensResult> {
  const refreshToken = body.refreshToken?.trim();
  const deviceId = body.deviceId?.trim();
  if (!refreshToken || !deviceId) {
    throw new AzesApiError({
      message: 'Refresh requires both refreshToken and deviceId',
      status: 0,
      statusText: 'RefreshBodyIncomplete',
      url: '/api/v1/auth/refresh',
      body: null,
    });
  }

  const url = resolveRequestUrl('/api/v1/auth/refresh');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken, deviceId }),
    signal,
  });

  const contentType = response.headers.get('content-type') ?? '';
  let parsed: unknown = null;
  if (response.status !== 204) {
    if (contentType.includes('application/json')) {
      parsed = await response.json();
    } else {
      const text = await response.text();
      parsed = text.length > 0 ? text : null;
    }
  }

  if (!response.ok) {
    throw new AzesApiError({
      message: `API request failed with ${response.status} ${response.statusText}`,
      status: response.status,
      statusText: response.statusText,
      url,
      body: parsed,
    });
  }

  return (parsed ?? {}) as RefreshAccessTokensResult;
}
