/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/state/src/store/rootReducer.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Combine foundation slices into the AZES root reducer
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { combineReducers } from '@reduxjs/toolkit';
import { preferencesReducer } from '../slices/preferences/preferencesSlice';

export const rootReducer = combineReducers({
  preferences: preferencesReducer,
});
