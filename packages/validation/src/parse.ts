/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/validation/src/parse.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Typed safe-parse helpers for Zod schemas
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { z } from 'zod';

export type ParseSuccess<T> = { success: true; data: T };
export type ParseFailure = {
  success: false;
  error: z.ZodError;
  fieldErrors: Record<string, string[]>;
};
export type ParseResult<T> = ParseSuccess<T> | ParseFailure;

function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join('.') : '_root';
    const existing = fieldErrors[path] ?? [];
    existing.push(issue.message);
    fieldErrors[path] = existing;
  }
  return fieldErrors;
}

/**
 * Safe parse returning a flat field-error map for forms.
 * Prefer this over throwing ZodError at UI boundaries.
 */
export function parseWithSchema<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  input: unknown,
): ParseResult<z.infer<TSchema>> {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error,
    fieldErrors: toFieldErrors(result.error),
  };
}
