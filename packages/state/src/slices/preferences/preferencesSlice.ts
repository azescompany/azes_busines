/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/state/src/slices/preferences/preferencesSlice.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Client preferences slice (theme) — not server/API state
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemePreference = 'light' | 'dark' | 'system';

export type PreferencesState = {
  theme: ThemePreference;
};

export const preferencesInitialState: PreferencesState = {
  theme: 'system',
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: preferencesInitialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload;
    },
    resetPreferences() {
      return preferencesInitialState;
    },
  },
});

export const { setTheme, resetPreferences } = preferencesSlice.actions;
export const preferencesReducer = preferencesSlice.reducer;
