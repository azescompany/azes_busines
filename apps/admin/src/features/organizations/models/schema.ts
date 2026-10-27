/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/organizations/models/schema.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Organization + invite + user create form schemas (zod)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { z } from 'zod';

import { ORG_COLOR_PALETTE } from './orgColors.js';

export const orgCreateSchema = z.object({
  name: z.string().min(1, 'orgs.validation.nameRequired'),
  description: z.string().optional(),
  colorCode: z.enum(ORG_COLOR_PALETTE).optional(),
  subscriptionStatus: z.enum(['active', 'blocked']).optional(),
  slug: z.string().optional(),
});

export type OrgCreateValues = z.infer<typeof orgCreateSchema>;

export const inviteSchema = z.object({
  email: z.string().email('orgs.validation.emailInvalid'),
  role: z.enum(['orgAdmin', 'instructor', 'student']),
});

export type InviteValues = z.infer<typeof inviteSchema>;

export const userCreateSchema = z.object({
  username: z.string().min(3, 'users.validation.usernameRequired'),
  password: z.string().min(8, 'users.validation.passwordRequired'),
  orgId: z.string().min(1, 'users.validation.orgRequired'),
  roleName: z.string().optional(),
});

export type UserCreateValues = z.infer<typeof userCreateSchema>;
