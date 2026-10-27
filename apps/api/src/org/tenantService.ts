/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/tenantService.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-27
 * ║ Purpose: Tenant membership / invite / active-org business logic
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { assertNotProtectedPlatformRole } from '../access/delegation.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { claimHasPermission, normalizeRoles } from '../auth/permissions.js';
import type { AuthRepository } from '../auth/repository.js';
import { issueTokenPair } from '../auth/service.js';
import { newId, nowSec } from '../auth/tokens.js';
import type { TokenPairResponse } from '../auth/types.js';
import { ApiHttpError } from '../errors.js';
import type { MenuRepository } from '../menu/repository.js';
import type { EntitlementRepository } from '../access/entitlementRepository.js';
import { resolveEffectiveAccess, type ResolveAccessContext } from '../access/effectiveAccess.js';
import type { TenantRepository } from './tenantRepository.js';
import type {
  InvitationCreatedDto,
  InvitationDto,
  InviteRole,
  MeOrganizationDto,
  MembershipDto,
  MembershipRole,
  MembershipStatus,
} from './tenantTypes.js';

const PLATFORM_ROLES = new Set(['superAdmin']);

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function createInviteToken(): string {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function hashInviteToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return bytesToBase64Url(new Uint8Array(digest));
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Merge platform roles with the active membership role.
 *
 * AC-D07: LMS invite/membership roles (`instructor` / `student` / `guest`) are
 * grant-channel roles for Academy — they must not be rewritten into ERP
 * `orgAdmin` / `member` here. ERP admin remains explicit `orgAdmin` (or later
 * permission profiles). Static `ROLE_PERMISSIONS` already omits `org.manage*`
 * from LMS roles.
 */
export function composeRolesForActiveOrg(
  currentRoles: readonly string[],
  membershipRole: MembershipRole | null,
): string[] {
  const platform = normalizeRoles(currentRoles).filter((r) => PLATFORM_ROLES.has(r));
  if (membershipRole) {
    return normalizeRoles([...platform, membershipRole]);
  }
  return platform.length > 0 ? platform : normalizeRoles(currentRoles);
}

export async function listMyOrganizations(
  tenant: TenantRepository,
  userId: string,
): Promise<MeOrganizationDto[]> {
  return tenant.listMembershipsForUser(userId);
}

type OrgActor = {
  sub: string;
  roles: readonly string[];
  orgId: string | null;
  permissions?: readonly string[];
};

export async function assertCanManageOrg(
  tenant: TenantRepository,
  user: OrgActor,
  orgId: string,
): Promise<void> {
  if (claimHasPermission(user, 'org.manage_all')) return;
  if (!claimHasPermission(user, 'org.manage')) {
    throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
  }
  const membership = await tenant.getMembership(orgId, user.sub);
  if (!membership || membership.status !== 'active') {
    throw new ApiHttpError(403, 'FORBIDDEN', 'Cross-organization access denied');
  }
  if (user.orgId !== orgId && !claimHasPermission(user, 'org.manage_all')) {
    throw new ApiHttpError(403, 'FORBIDDEN', 'Active organization mismatch');
  }
}

/**
 * Switch active organization.
 *
 * - `userId` must come from trusted JWT `sub` (never client body identity).
 * - `orgId` is the *target* org from the request body, but only accepted when
 *   the user has an **active** `organization_memberships` row (SuperAdmin may
 *   switch without membership for platform ops).
 * - Persists `users.org_id` as the active pointer and re-issues JWT with that
 *   `orgId` claim. Membership table remains source of truth for access.
 */
export async function setActiveOrganization(params: {
  authRepo: AuthRepository;
  tenant: TenantRepository;
  menuRepo?: MenuRepository | null;
  entitlementRepo?: EntitlementRepository | null;
  userId: string;
  orgId: string;
  jwtSecret: string;
  userAgent?: string | null;
}): Promise<TokenPairResponse & { orgId: string; role: string }> {
  const { authRepo, tenant, userId, orgId, jwtSecret } = params;
  const user = await authRepo.findUserById(userId);
  if (!user || user.status !== 'active') {
    throw new ApiHttpError(403, 'ACCOUNT_DISABLED', 'Account is not active');
  }

  const currentRoles = await authRepo.getUserRoles(userId);
  const accessCtx: ResolveAccessContext = {
    orgId: user.orgId ?? null,
    userId,
    menuRepo: params.menuRepo,
    entitlementRepo: params.entitlementRepo,
    bypassEntitlementFilter: false,
  };
  const effectiveBefore = await resolveEffectiveAccess(currentRoles, accessCtx);
  const isSuper = effectiveBefore.permissions.includes('org.manage_all');
  const membership = await tenant.getMembership(orgId, userId);

  if (!membership || membership.status !== 'active') {
    if (!isSuper) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Not a member of this organization');
    }
  }

  const org = await tenant.getOrganizationMeta(orgId);
  if (!org || org.status !== 'active') {
    throw new ApiHttpError(404, 'NOT_FOUND', 'Organization not found');
  }

  const membershipRole = (membership?.role ?? null) as MembershipRole | null;
  const nextRoles = composeRolesForActiveOrg(currentRoles, membershipRole);

  // Active pointer only — does not create membership.
  await authRepo.setUserOrgId(userId, orgId);
  await authRepo.setUserRoles(userId, nextRoles);
  await tenant.noteActiveOrganization?.(userId, orgId);

  const newAccessCtx: ResolveAccessContext = {
    orgId,
    userId,
    menuRepo: params.menuRepo,
    entitlementRepo: params.entitlementRepo,
    bypassEntitlementFilter: false,
  };
  const effective = await resolveEffectiveAccess(nextRoles, newAccessCtx);
  const tokens = await issueTokenPair(authRepo, {
    userId,
    roles: nextRoles,
    orgId,
    permissions: effective.permissions,
    userAgent: params.userAgent ?? null,
    jwtSecret,
  });

  return {
    ...tokens,
    orgId,
    role: membershipRole ?? (isSuper ? 'superAdmin' : 'guest'),
  };
}

export async function createOrgInvitation(params: {
  tenant: TenantRepository;
  actor: { sub: string; roles: string[]; orgId: string | null };
  orgId: string;
  email: string;
  role: InviteRole;
}): Promise<InvitationCreatedDto> {
  await assertCanManageOrg(params.tenant, params.actor, params.orgId);
  assertNotProtectedPlatformRole(params.role);
  // AC-D07: invite roles are LMS channel or orgAdmin — never invent ERP manage_all.
  const org = await params.tenant.getOrganizationMeta(params.orgId);
  if (!org) throw new ApiHttpError(404, 'NOT_FOUND', 'Organization not found');

  const token = createInviteToken();
  const tokenHash = await hashInviteToken(token);
  const invitation = await params.tenant.createInvitation({
    orgId: params.orgId,
    email: normalizeEmail(params.email),
    role: params.role,
    createdBy: params.actor.sub,
    tokenHash,
  });
  return { ...invitation, token };
}

export async function acceptInvitation(params: {
  authRepo: AuthRepository;
  tenant: TenantRepository;
  token: string;
  password: string;
  username?: string;
  jwtSecret: string;
  userAgent?: string | null;
}): Promise<TokenPairResponse & { orgId: string; userId: string }> {
  const tokenHash = await hashInviteToken(params.token);
  const invitation = await params.tenant.findInvitationByTokenHash(tokenHash);
  if (!invitation) {
    throw new ApiHttpError(404, 'NOT_FOUND', 'Invitation not found');
  }
  if (invitation.status !== 'pending') {
    throw new ApiHttpError(409, 'CONFLICT', 'Invitation is no longer pending');
  }
  if (invitation.expiresAt < nowSec()) {
    throw new ApiHttpError(410, 'GONE', 'Invitation has expired');
  }

  const password = params.password.trim();
  if (password.length < 8) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Password must be at least 8 characters');
  }

  const username = normalizeUsername(params.username ?? invitation.email.split('@')[0] ?? '');
  if (!username || username.length < 3) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Username is too short');
  }

  let user = await params.authRepo.findUserByUsername(username);
  const ts = nowSec();

  if (user) {
    if (user.status === 'disabled') {
      throw new ApiHttpError(403, 'ACCOUNT_DISABLED', 'Account is not active');
    }
    const passwordOk = await verifyPassword(password, user.passwordHash);
    if (!passwordOk) {
      throw new ApiHttpError(401, 'INVALID_CREDENTIALS', 'Invalid username or password');
    }
  } else {
    const passwordHash = await hashPassword(password);
    user = await params.authRepo.createUser({
      id: newId(),
      usernameNormalized: username,
      passwordHash,
      status: 'active',
      orgId: invitation.orgId,
      createdAt: ts,
      updatedAt: ts,
    });
  }

  await params.tenant.upsertMembership({
    orgId: invitation.orgId,
    userId: user.id,
    role: invitation.role,
    status: 'active',
    username: user.usernameNormalized,
  });
  await params.tenant.markInvitationAccepted(invitation.id);

  const currentRoles = await params.authRepo.getUserRoles(user.id);
  const nextRoles = composeRolesForActiveOrg(currentRoles, invitation.role);
  await params.authRepo.setUserOrgId(user.id, invitation.orgId);
  await params.authRepo.setUserRoles(user.id, nextRoles);
  await params.tenant.noteActiveOrganization?.(user.id, invitation.orgId);

  const accessCtx: ResolveAccessContext = {
    orgId: invitation.orgId,
    userId: user.id,
    menuRepo: null,
    entitlementRepo: null,
    bypassEntitlementFilter: false,
  };
  const effective = await resolveEffectiveAccess(nextRoles, accessCtx);
  const tokens = await issueTokenPair(params.authRepo, {
    userId: user.id,
    roles: nextRoles,
    orgId: invitation.orgId,
    permissions: effective.permissions,
    userAgent: params.userAgent ?? null,
    jwtSecret: params.jwtSecret,
  });

  return { ...tokens, orgId: invitation.orgId, userId: user.id };
}

export async function listOrgMembers(
  tenant: TenantRepository,
  actor: { sub: string; roles: string[]; orgId: string | null },
  orgId: string,
): Promise<MembershipDto[]> {
  await assertCanManageOrg(tenant, actor, orgId);
  return tenant.listMembers(orgId);
}

export async function updateOrgMember(
  tenant: TenantRepository,
  actor: { sub: string; roles: string[]; orgId: string | null },
  orgId: string,
  targetUserId: string,
  patch: { role?: MembershipRole; status?: MembershipStatus },
): Promise<MembershipDto> {
  await assertCanManageOrg(tenant, actor, orgId);
  if (targetUserId === actor.sub && patch.status === 'revoked') {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Cannot revoke your own membership');
  }
  if (patch.role) {
    assertNotProtectedPlatformRole(patch.role);
  }
  return tenant.updateMembership(orgId, targetUserId, patch);
}

export async function listOrgInvitations(
  tenant: TenantRepository,
  actor: { sub: string; roles: string[]; orgId: string | null },
  orgId: string,
): Promise<InvitationDto[]> {
  await assertCanManageOrg(tenant, actor, orgId);
  return tenant.listInvitations(orgId);
}
