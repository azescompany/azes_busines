/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/loginSchema.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Zod schema for the account login form
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { nonEmptyString, z } from '@azes/validation';

export const loginSchema = z.object({
  userName: nonEmptyString.max(200, 'Username is too long'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
