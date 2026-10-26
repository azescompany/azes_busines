/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-09
 * ║ Purpose: Public API for @azes/auth
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type { AuthAdapter, AuthExpireListener } from './contracts/adapter.js';
export type { AuthSecureStorage } from './contracts/storage.js';
export type { AuthTokens } from './contracts/tokens.js';
export type {
  AuthProfile,
  AuthSession,
  AuthSessionSnapshot,
  AuthSubject,
} from './contracts/session.js';

export {
  createAuthClient,
  type AuthClient,
  type AuthSessionListener,
} from './client/createAuthClient.js';
export {
  connectAuthToApi,
  type AuthApiBridge,
  type AuthApiConnection,
} from './client/connectApi.js';

export {
  createWebAuthAdapter,
  type WebAuthAdapterOptions,
} from './adapters/web/createWebAuthAdapter.js';
export {
  createNativeAuthAdapter,
  notifyNativeAuthDeepLink,
  notifyNativeAuthForeground,
  type NativeAuthAdapterOptions,
} from './adapters/native/createNativeAuthAdapter.js';

export { createMemorySecureStorage } from './storage/memorySecureStorage.js';

export {
  AuthProvider,
  useAuthClient,
  useAuthSession,
  useAuthSessionReady,
  type AuthProviderProps,
} from './react/AuthProvider.js';

export {
  decodeAccessToken,
  getAccessTokenExpiryMs,
  roleFlagsFromClaims,
  toAuthSubjectFromClaims,
  type AzesJwtClaims,
  type AzesRoleFlags,
} from './jwt/decodeAccessToken.js';
export { sessionFromTokens } from './session/sessionFromTokens.js';

export {
  clearDeviceIdCookie,
  createDocumentCookieStore,
  readAccessTokenCookieForRefresh,
  readDeviceIdCookie,
  resolveDefaultWebTokenCookieOptions,
  WEB_DEVICE_ID_COOKIE,
  WEB_TOKEN_COOKIE_NAMES,
  writeDeviceIdCookie,
  type WebTokenCookieOptions,
  type WebTokenCookieStore,
} from './cookies/webTokenCookies.js';
