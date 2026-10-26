/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/validation/src/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Public API for @azes/validation
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export { z } from 'zod';

export { VALIDATION_CONVENTIONS } from './conventions.js';
export {
  parseWithSchema,
  type ParseFailure,
  type ParseResult,
  type ParseSuccess,
} from './parse.js';
export {
  emailString,
  nonEmptyString,
  pageNumber,
  pageSize,
  paginationInput,
  type PaginationInput,
} from './primitives.js';
