/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Organization + Track DTOs (M1b)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type OrganizationDto = {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'disabled';
  parentOrganizationId: string | null;
  createdBy: string | null;
  createdAt: number;
  updatedAt: number;
  /** Present on list responses when counts are computed. */
  orgAdminCount?: number;
  memberCount?: number;
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
