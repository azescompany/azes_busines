/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-27
 * ║ Purpose: Organization + Track DTOs (M1b + M5.0-lite subscription)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type OrganizationDto = {
  id: string;
  name: string;
  slug: string;
  /** M5.0-lite — optional on legacy memory seeds; always set on create/list from DB. */
  description?: string | null;
  colorCode?: string;
  subscriptionStatus?: 'active' | 'blocked';
  trialEndsAt?: number | null;
  /** AC-D08 — optional read-only subscription mode. */
  subscriptionReadOnly?: boolean;
  status: 'active' | 'disabled';
  parentOrganizationId: string | null;
  createdBy: string | null;
  createdAt: number;
  updatedAt: number;
  /** Present on list responses when counts are computed. */
  orgAdminCount?: number;
  memberCount?: number;
};

export type PlatformUserDto = {
  id: string;
  username: string;
  orgId: string;
  orgName: string;
  orgColorCode: string;
  roleName: string;
  status: 'active' | 'disabled' | 'pending';
  createdAt: number;
};

export type PlatformRoleDto = {
  id: string;
  name: string;
  createdAt: number;
  system: boolean;
};

export type OrgAdminDto = {
  id: string;
  username: string;
  orgId: string;
  orgName: string;
  status: 'active' | 'disabled' | 'pending';
  createdAt: number;
};

export type PlatformOverviewDto = {
  organizationCount: number;
  activeOrganizationCount: number;
  userCount: number;
  instructorCount: number;
  studentCount: number;
  orgAdminCount: number;
  publishedCourseCount: number;
  trackCount: number;
};

export type TrackDto = {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt: number;
  updatedAt: number;
};
