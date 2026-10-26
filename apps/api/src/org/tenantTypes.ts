/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/tenantTypes.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Tenant membership + invitation DTOs (TAGET M1)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type MembershipRole = 'orgAdmin' | 'instructor' | 'student' | 'guest';
export type InviteRole = 'orgAdmin' | 'instructor' | 'student';
export type MembershipStatus = 'active' | 'disabled' | 'revoked';
export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export type MembershipDto = {
  id: string;
  orgId: string;
  orgName: string;
  orgSlug: string;
  orgStatus: 'active' | 'disabled';
  userId: string;
  username: string;
  role: MembershipRole;
  status: MembershipStatus;
  createdAt: number;
  updatedAt: number;
};

export type MeOrganizationDto = {
  orgId: string;
  name: string;
  slug: string;
  status: 'active' | 'disabled';
  role: MembershipRole;
  membershipStatus: MembershipStatus;
  isActive: boolean;
};

export type InvitationDto = {
  id: string;
  orgId: string;
  email: string;
  role: InviteRole;
  status: InvitationStatus;
  expiresAt: number;
  acceptedAt: number | null;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
};

export type InvitationCreatedDto = InvitationDto & {
  /** Plaintext token — returned once on create; never stored. */
  token: string;
};
