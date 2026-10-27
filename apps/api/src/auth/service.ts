/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/service.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-27
 * ║ Purpose: Login / refresh / logout / me session logic
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { EntitlementRepository } from '../access/entitlementRepository.js';
import {
  resolveEffectiveAccess,
  type ResolveAccessContext,
  type ModuleEntitlementSummary,
  type ScopeSummary,
} from '../access/effectiveAccess.js';
import { ApiHttpError } from '../errors.js';
import type { MenuRepository } from '../menu/repository.js';
import type { AuthNavItem } from './navCatalog.js';
import { normalizeRoles, primaryRole } from './permissions.js';
import { normalizeUsername, verifyPassword } from './password.js';
import type { AuthRepository } from './repository.js';
import {
  createRefreshSecret,
  hashRefreshToken,
  newId,
  nowSec,
  signAccessToken,
  verifyAccessToken,
} from './tokens.js';
import {
  ACCESS_TOKEN_TTL_SEC,
  REFRESH_TOKEN_TTL_SEC,
  type TokenPairResponse,
  type UserStatus,
} from './types.js';

export type MeResponse = {
  userId: string;
  username: string;
  roles: string[];
  role: string;
  orgId: string | null;
  permissions: string[];
  /** Role-filtered Academy primary nav (id + path + i18nKey). */
  nav: AuthNavItem[];
  activeTracks: { id: string; name: string; slug: string }[];
  status: UserStatus;
  /** Platform module entitlement + subscription summary (Phase 06 additive). */
  modules: ModuleEntitlementSummary[];
  /** Scope summary for active membership (Phase 06 additive). */
  scopeSummary: ScopeSummary | null;
  /** Incremented when access-relevant data changes (Phase 06 additive). */
  accessVersion: number;
};

export type LoginInput = {
  username: string;
  password: string;
  deviceId: string;
  userAgent: string;
  platform: string;
  language: string;
};

export type RefreshInput = {
  refreshToken: string;
  deviceId: string;
};

export type LogoutInput = {
  refreshToken?: string;
  accessToken?: string;
};

export async function issueTokenPair(
  repo: AuthRepository,
  params: {
    userId: string;
    roles: string[];
    orgId: string | null;
    permissions?: string[];
    userAgent: string | null;
    jwtSecret: string;
  },
): Promise<TokenPairResponse> {
  const sessionId = newId();
  const refreshSecret = createRefreshSecret();
  const tokenHash = await hashRefreshToken(refreshSecret);
  const createdAt = nowSec();

  await repo.createRefreshSession({
    id: sessionId,
    userId: params.userId,
    tokenHash,
    expiresAt: createdAt + REFRESH_TOKEN_TTL_SEC,
    createdAt,
    userAgent: params.userAgent,
  });

  const roles = normalizeRoles(params.roles);
  // `permissions` still emitted for client compat (AC-D05 deprecate window) —
  // server authz must not treat the claim as authoritative.
  const accessToken = await signAccessToken(
    {
      sub: params.userId,
      sid: sessionId,
      roles,
      orgId: params.orgId,
      permissions: params.permissions,
    },
    params.jwtSecret,
  );

  return {
    accessToken,
    refreshToken: refreshSecret,
    expiresIn: ACCESS_TOKEN_TTL_SEC,
    tokenType: 'Bearer',
  };
}

export async function loginWithPassword(
  repo: AuthRepository,
  jwtSecret: string,
  input: LoginInput,
  menuRepo?: MenuRepository | null,
  entitlementRepo?: EntitlementRepository | null,
): Promise<TokenPairResponse> {
  void input.deviceId;
  void input.platform;
  void input.language;

  const usernameNormalized = normalizeUsername(input.username);
  const user = await repo.findUserByUsername(usernameNormalized);
  if (!user) {
    throw new ApiHttpError(401, 'INVALID_CREDENTIALS', 'Invalid username or password');
  }

  const passwordOk = await verifyPassword(input.password, user.passwordHash);
  if (!passwordOk) {
    throw new ApiHttpError(401, 'INVALID_CREDENTIALS', 'Invalid username or password');
  }

  if (user.status !== 'active') {
    throw new ApiHttpError(403, 'ACCOUNT_DISABLED', 'Account is not active');
  }

  const roles = await repo.getUserRoles(user.id);
  const accessCtx: ResolveAccessContext = {
    orgId: user.orgId ?? null,
    userId: user.id,
    menuRepo,
    entitlementRepo,
    bypassEntitlementFilter: false, // Will be resolved inside effectiveAccess
  };
  const effective = await resolveEffectiveAccess(roles, accessCtx);
  return issueTokenPair(repo, {
    userId: user.id,
    roles,
    orgId: user.orgId ?? null,
    permissions: effective.permissions,
    userAgent: input.userAgent || null,
    jwtSecret,
  });
}

export async function refreshTokens(
  repo: AuthRepository,
  jwtSecret: string,
  input: RefreshInput,
  menuRepo?: MenuRepository | null,
  entitlementRepo?: EntitlementRepository | null,
): Promise<TokenPairResponse> {
  void input.deviceId;

  const tokenHash = await hashRefreshToken(input.refreshToken);
  const session = await repo.findRefreshSessionByHash(tokenHash);
  if (!session) {
    throw new ApiHttpError(401, 'TOKEN_REVOKED', 'Refresh token is invalid or revoked');
  }

  const now = nowSec();

  // Reuse of an already-rotated/revoked refresh token → revoke all sessions for user.
  if (session.revokedAt != null) {
    await repo.revokeAllSessionsForUser(session.userId, now);
    throw new ApiHttpError(401, 'TOKEN_REVOKED', 'Refresh token is invalid or revoked');
  }

  if (session.expiresAt < now) {
    await repo.revokeSession(session.id, now);
    throw new ApiHttpError(401, 'TOKEN_EXPIRED', 'Refresh token has expired');
  }

  const user = await repo.findUserById(session.userId);
  if (!user) {
    throw new ApiHttpError(401, 'TOKEN_REVOKED', 'Refresh token is invalid or revoked');
  }
  if (user.status !== 'active') {
    throw new ApiHttpError(403, 'ACCOUNT_DISABLED', 'Account is not active');
  }

  const roles = await repo.getUserRoles(user.id);
  const accessCtx: ResolveAccessContext = {
    orgId: user.orgId ?? null,
    userId: user.id,
    menuRepo,
    entitlementRepo,
    bypassEntitlementFilter: false,
  };
  const effective = await resolveEffectiveAccess(roles, accessCtx);
  const newSessionId = newId();
  const refreshSecret = createRefreshSecret();
  const newHash = await hashRefreshToken(refreshSecret);
  const createdAt = now;

  const rotated = await repo.rotateRefreshSession({
    oldSessionId: session.id,
    revokedAt: now,
    newSession: {
      id: newSessionId,
      userId: user.id,
      tokenHash: newHash,
      expiresAt: createdAt + REFRESH_TOKEN_TTL_SEC,
      createdAt,
      userAgent: session.userAgent,
    },
  });

  if (!rotated) {
    // Parallel refresh race — winner keeps the new session; loser gets revoked.
    throw new ApiHttpError(401, 'TOKEN_REVOKED', 'Refresh token is invalid or revoked');
  }

  const accessToken = await signAccessToken(
    {
      sub: user.id,
      sid: newSessionId,
      roles: normalizeRoles(roles),
      orgId: user.orgId ?? null,
      permissions: effective.permissions,
    },
    jwtSecret,
  );

  return {
    accessToken,
    refreshToken: refreshSecret,
    expiresIn: ACCESS_TOKEN_TTL_SEC,
    tokenType: 'Bearer',
  };
}

/**
 * Resolve the authenticated user from a Bearer access JWT (Phase 2F).
 * Validates signature/exp, refresh-session row still active, and user status.
 * Phase 06: uses unified Effective Access Resolver for permissions/nav/modules/scope/accessVersion.
 */
export async function getMeFromAccessToken(
  repo: AuthRepository,
  jwtSecret: string,
  accessToken: string,
  menuRepo?: MenuRepository | null,
  entitlementRepo?: EntitlementRepository | null,
): Promise<MeResponse> {
  let claims;
  try {
    claims = await verifyAccessToken(accessToken, jwtSecret);
  } catch {
    throw new ApiHttpError(401, 'TOKEN_REVOKED', 'Access token is invalid or expired');
  }

  const now = nowSec();
  const session = await repo.findRefreshSessionById(claims.sid);
  if (!session || session.revokedAt != null) {
    throw new ApiHttpError(401, 'TOKEN_REVOKED', 'Access token is invalid or revoked');
  }
  if (session.expiresAt < now) {
    await repo.revokeSession(session.id, now);
    throw new ApiHttpError(401, 'TOKEN_EXPIRED', 'Refresh token has expired');
  }

  const user = await repo.findUserById(claims.sub);
  if (!user) {
    throw new ApiHttpError(401, 'TOKEN_REVOKED', 'Access token is invalid or revoked');
  }
  if (user.status !== 'active') {
    throw new ApiHttpError(403, 'ACCOUNT_DISABLED', 'Account is not active');
  }

  const roles = normalizeRoles(await repo.getUserRoles(user.id));
  const orgId = user.orgId ?? null;
  const accessCtx: ResolveAccessContext = {
    orgId,
    userId: user.id,
    menuRepo,
    entitlementRepo,
    bypassEntitlementFilter: roles.includes('superAdmin'),
  };

  const effective = await resolveEffectiveAccess(roles, accessCtx);

  return {
    userId: user.id,
    username: user.usernameNormalized,
    roles,
    role: primaryRole(roles),
    orgId,
    permissions: effective.permissions,
    nav: effective.nav,
    activeTracks: [],
    status: user.status,
    modules: effective.modules,
    scopeSummary: effective.scopeSummary,
    accessVersion: effective.accessVersion,
  };
}

export async function logoutSession(
  repo: AuthRepository,
  jwtSecret: string,
  input: LogoutInput,
): Promise<{ ok: true }> {
  const now = nowSec();

  if (input.refreshToken) {
    const tokenHash = await hashRefreshToken(input.refreshToken);
    const session = await repo.findActiveRefreshSessionByHash(tokenHash);
    if (session) {
      await repo.revokeSession(session.id, now);
    }
    return { ok: true };
  }

  if (input.accessToken) {
    try {
      const claims = await verifyAccessToken(input.accessToken, jwtSecret);
      await repo.revokeSession(claims.sid, now);
    } catch {
      // Idempotent logout — invalid access still succeeds
    }
    return { ok: true };
  }

  throw new ApiHttpError(
    400,
    'VALIDATION_ERROR',
    'Provide refreshToken in body or Authorization Bearer access token',
  );
}
