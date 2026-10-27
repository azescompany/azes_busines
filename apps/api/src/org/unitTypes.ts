/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/unitTypes.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Organization Unit DTOs (AC-D02 A / Phase 03)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type UnitKind = 'branch' | 'department' | 'team' | 'other';
export type UnitStatus = 'active' | 'disabled';
export type UnitMembershipRole = 'manager' | 'member';
export type UnitMembershipStatus = 'active' | 'disabled';

export type OrganizationUnitDto = {
  id: string;
  orgId: string;
  parentUnitId: string | null;
  name: string;
  code: string;
  kind: UnitKind;
  status: UnitStatus;
  createdAt: number;
  updatedAt: number;
};

export type UnitMembershipDto = {
  id: string;
  orgId: string;
  unitId: string;
  userId: string;
  role: UnitMembershipRole;
  status: UnitMembershipStatus;
  createdAt: number;
  updatedAt: number;
};
