/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/state/src/slices/preferences/selectors.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Typed selectors for preferences slice
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { RootState } from '../../store/types';

export const selectPreferences = (state: RootState) => state.preferences;
export const selectThemePreference = (state: RootState) => state.preferences.theme;
