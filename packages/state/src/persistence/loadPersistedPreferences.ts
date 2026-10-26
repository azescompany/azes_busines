/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/state/src/persistence/loadPersistedPreferences.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Hydrate preferences from a persistence adapter
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  preferencesInitialState,
  type PreferencesState,
  type ThemePreference,
} from '../slices/preferences/preferencesSlice';
import { PREFERENCES_PERSIST_KEY, type PersistenceAdapter } from './types';

const THEMES: ReadonlySet<string> = new Set(['light', 'dark', 'system']);

function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && THEMES.has(value);
}

/**
 * Reads persisted preferences for store hydration.
 * Invalid or missing payloads fall back to defaults (no throw).
 */
export async function loadPersistedPreferences(
  adapter: PersistenceAdapter,
): Promise<PreferencesState> {
  const raw = await adapter.getItem(PREFERENCES_PERSIST_KEY);
  if (raw == null || raw === '') {
    return preferencesInitialState;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed == null || typeof parsed !== 'object') {
      return preferencesInitialState;
    }
    const theme = (parsed as { theme?: unknown }).theme;
    if (!isThemePreference(theme)) {
      return preferencesInitialState;
    }
    return { theme };
  } catch {
    return preferencesInitialState;
  }
}

export async function persistPreferences(
  adapter: PersistenceAdapter,
  preferences: PreferencesState,
): Promise<void> {
  await adapter.setItem(PREFERENCES_PERSIST_KEY, JSON.stringify(preferences));
}
