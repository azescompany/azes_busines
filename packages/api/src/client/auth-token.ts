/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/client/auth-token.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Pluggable access-token getter (auth adapters plug in later)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type AccessTokenGetter = () =>
  string | null | undefined | Promise<string | null | undefined>;

let accessTokenGetter: AccessTokenGetter = () => null;

/** Register how the HTTP mutator obtains a bearer token (Phase 8 auth adapters). */
export function setAccessTokenGetter(getter: AccessTokenGetter): void {
  accessTokenGetter = getter;
}

export function clearAccessTokenGetter(): void {
  accessTokenGetter = () => null;
}

export async function resolveAccessToken(): Promise<string | null> {
  const value = await accessTokenGetter();
  return value ?? null;
}
