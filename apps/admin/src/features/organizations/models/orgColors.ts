/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/organizations/models/orgColors.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Allowed org color palette (mirrors API ORG_COLOR_PALETTE)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const ORG_COLOR_PALETTE = [
  '#2563EB',
  '#16A34A',
  '#CA8A04',
  '#DC2626',
  '#9333EA',
  '#0891B2',
  '#EA580C',
  '#DB2777',
] as const;

export type OrgColorCode = (typeof ORG_COLOR_PALETTE)[number];
