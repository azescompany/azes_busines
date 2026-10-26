/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/validation/src/primitives.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Shared Zod primitives for forms/client validation
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { z } from 'zod';

/** Non-empty trimmed string (forms). */
export const nonEmptyString = z.string().trim().min(1);

/** Email format for client forms — does not replace OpenAPI string formats. */
export const emailString = z.string().trim().email();

/** Positive integer page index starting at 1. */
export const pageNumber = z.coerce.number().int().min(1);

/** Page size with a safe upper bound for client lists. */
export const pageSize = z.coerce.number().int().min(1).max(100);

export const paginationInput = z.object({
  page: pageNumber.default(1),
  pageSize: pageSize.default(20),
});

export type PaginationInput = z.infer<typeof paginationInput>;
