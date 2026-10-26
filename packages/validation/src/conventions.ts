/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/validation/src/conventions.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Documented Zod conventions vs OpenAPI-generated contracts
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

/**
 * Client Zod schemas complement OpenAPI — they do not replace `@azes/api` types.
 * Use Zod for forms, query params, and UX-side checks. Generated OpenAPI models
 * remain the transport contract source of truth.
 */
export const VALIDATION_CONVENTIONS = [
  'Do not re-implement OpenAPI response/request models as Zod solely to duplicate types.',
  'Prefer Zod for form input, search params, and client-only shapes.',
  'When a form mirrors an API body, keep the Zod schema thin and align field names with OpenAPI.',
  'Never hand-edit packages/api/generated — regenerate from OpenAPI instead.',
] as const;
