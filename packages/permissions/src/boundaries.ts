/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/permissions/src/boundaries.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Documented frontend vs backend authorization boundary
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const PERMISSIONS_BOUNDARY = [
  'Frontend resource.action checks gate UX and navigation only.',
  'Backend authorization is authoritative for all mutations and data access.',
  'Never treat a client-side grant list as a security boundary.',
] as const;
