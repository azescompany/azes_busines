/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/menu/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Menu RBAC DTOs (TAGET M1.5)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type MenuDto = {
  id: string;
  app: string;
  code: string;
  path: string;
  i18nKey: string;
  iconKey: string | null;
  sortOrder: number;
  status: 'active' | 'disabled';
  permissionCodes: string[];
};

export type MenuNavItem = {
  id: string;
  path: string;
  i18nKey: string;
  iconKey: string | null;
};

export type RoleName = 'superAdmin' | 'orgAdmin' | 'instructor' | 'student' | 'guest';
