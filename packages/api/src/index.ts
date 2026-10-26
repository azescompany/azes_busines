/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Public entry point for @azes/api (hand-written surface)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export {
  clearAccessTokenGetter,
  setAccessTokenGetter,
  type AccessTokenGetter,
} from './client/auth-token';
export {
  setAccessTokenRefreshHandler,
  tryRefreshAccessToken,
  type AccessTokenRefreshHandler,
} from './client/auth-refresh';
export {
  DEFAULT_SESSION_INVALIDATED_MESSAGE,
  setAuthSessionInvalidatedHandler,
  setPaymentRequiredHandler,
  type AuthSessionInvalidatedHandler,
  type AuthSessionInvalidatedReason,
  type PaymentRequiredHandler,
  type PaymentRequiredReason,
} from './client/auth-status';
export {
  getOrCreateDeviceMeta,
  seedDeviceId,
  type DeviceMeta,
  type DeviceDigestFn,
  type SeedDeviceIdOptions,
} from './client/device-meta';
export {
  refreshAccessTokens,
  type RefreshAccessTokensBody,
  type RefreshAccessTokensResult,
} from './client/refresh-tokens';
export {
  AzesApiError,
  getAzesApiErrorMessage,
  isAzesApiError,
  messageFromAzesApiErrorBody,
  type AzesApiErrorBody,
} from './client/errors';
export {
  azesMutator,
  type AzesMutatorConfig,
  type AzesMutatorResponseType,
} from './client/mutator';
export { configureApi, getApiConfig, resolveRequestUrl, type ApiRuntimeConfig } from './config/env';
export { apiQueryDefaultOptions } from './config/query-defaults';
export { apiQueryKeys, type ApiQueryKey } from './query/keys';
export {
  invalidateAdminQueries,
  invalidateAdminResourceQueries,
  invalidateAllApiQueries,
  invalidateResourceQueries,
} from './mutations/invalidate';
