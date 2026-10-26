/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/adapters/shared/sessionJson.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Serialize/parse AuthSession without throwing on corrupt data
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AuthSession } from '../../contracts/session.js';

export function serializeSession(session: AuthSession): string {
  return JSON.stringify(session);
}

export function parseSession(raw: string | null): AuthSession | null {
  if (raw == null || raw === '') {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed == null || typeof parsed !== 'object') {
      return null;
    }
    const tokens = (parsed as { tokens?: unknown }).tokens;
    if (tokens == null || typeof tokens !== 'object') {
      return null;
    }
    const accessToken = (tokens as { accessToken?: unknown }).accessToken;
    if (typeof accessToken !== 'string' || accessToken.length === 0) {
      return null;
    }

    const refreshToken = (tokens as { refreshToken?: unknown }).refreshToken;
    const expiresAt = (tokens as { expiresAt?: unknown }).expiresAt;
    const subject = (parsed as { subject?: unknown }).subject;

    const session: AuthSession = {
      tokens: {
        accessToken,
        ...(typeof refreshToken === 'string' ? { refreshToken } : {}),
        ...(typeof expiresAt === 'number' ? { expiresAt } : {}),
      },
    };

    if (subject != null && typeof subject === 'object') {
      const id = (subject as { id?: unknown }).id;
      if (typeof id === 'string' && id.length > 0) {
        session.subject = { id };
      }
    }

    return session;
  } catch {
    return null;
  }
}
