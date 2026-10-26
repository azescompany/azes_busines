/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/state/src/boundaries.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Documented MUST NOT enter Redux rules (enforced in review)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

/**
 * Client/global state may live in Redux. Server/cache state must not.
 * Keep this list in sync with docs/architecture/state-architecture.md.
 */
export const MUST_NOT_ENTER_REDUX = [
  'API response cache / server entities',
  'TanStack Query loading, error, or mutation cache state',
  'Derived data that can be computed from queries or selectors',
  'Ephemeral local component state that never crosses routes',
  'Secrets and tokens in plain persisted storage (use @azes/auth adapters)',
] as const;

export const REDUX_MAY_OWN = [
  'Global preferences (e.g. theme preference)',
  'Application-level UI chrome state',
  'Cross-route client workflows',
  'Selected workspace/organization (when product requires it)',
  'Session/client markers that are not API entity caches (auth Phase 8)',
] as const;
