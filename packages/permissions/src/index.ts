/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/permissions/src/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Public API for @azes/permissions
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export { PERMISSIONS_BOUNDARY } from './boundaries.js';
export { createPermissionChecker, type PermissionChecker } from './checker.js';
export { isPermission, parsePermission, permissionOf } from './parse.js';
export type { Permission, PermissionParts } from './types.js';
