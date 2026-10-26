/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/state/src/store/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Shared RootState typing (dispatch typed from store factory)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { rootReducer } from './rootReducer';

export type RootState = ReturnType<typeof rootReducer>;
