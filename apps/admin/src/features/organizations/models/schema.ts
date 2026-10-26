/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/organizations/models/schema.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Organization + invite form schemas (zod)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { z } from 'zod';

export const orgCreateSchema = z.object({
  name: z.string().min(1, 'orgs.validation.nameRequired'),
  slug: z.string().optional(),
});

export type OrgCreateValues = z.infer<typeof orgCreateSchema>;

export const inviteSchema = z.object({
  email: z.string().email('orgs.validation.emailInvalid'),
  role: z.enum(['orgAdmin', 'instructor', 'student']),
});

export type InviteValues = z.infer<typeof inviteSchema>;
