/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/permissions/src/parse.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Parse and validate resource.action permission strings
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Permission, PermissionParts } from './types.js';

const PERMISSION_PATTERN = /^([a-z][a-z0-9_-]*)\.([a-z][a-z0-9_-]*)$/i;

export function isPermission(value: string): value is Permission {
  return PERMISSION_PATTERN.test(value);
}

export function parsePermission(value: string): PermissionParts | null {
  const match = PERMISSION_PATTERN.exec(value);
  if (!match) {
    return null;
  }
  const resource = match[1];
  const action = match[2];
  if (!resource || !action) {
    return null;
  }
  return { resource, action };
}

export function permissionOf(resource: string, action: string): Permission {
  const value = `${resource}.${action}`;
  if (!isPermission(value)) {
    throw new Error('Invalid permission: expected resource.action with alphanumeric segments');
  }
  return value;
}
