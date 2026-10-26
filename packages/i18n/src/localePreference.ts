/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/i18n/src/localePreference.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Per-app locale preference storage (unique key per product)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type LocalePreferenceStorage = {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
};

/** Legacy global key (kept for migration). Prefer `localeStorageKey(appId)`. */
export const LOCALE_PREFERENCE_KEY = 'azes.i18n.locale';

/** Per-product key so account / admin / realestate preferences never collide. */
export function localeStorageKey(appId: string): string {
  const id = appId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-');
  return `azes.i18n.locale.${id || 'app'}`;
}

export async function readPreferredLocale(
  storage: LocalePreferenceStorage,
  fallback: string,
  storageKey: string = LOCALE_PREFERENCE_KEY,
): Promise<string> {
  const value = await storage.getItem(storageKey);
  if (value && value.length > 0) {
    return value;
  }
  // One-time bridge from the legacy unscoped key when using a scoped key.
  if (storageKey !== LOCALE_PREFERENCE_KEY) {
    const legacy = await storage.getItem(LOCALE_PREFERENCE_KEY);
    if (legacy && legacy.length > 0) {
      return legacy;
    }
  }
  return fallback;
}

export async function writePreferredLocale(
  storage: LocalePreferenceStorage,
  locale: string,
  storageKey: string = LOCALE_PREFERENCE_KEY,
): Promise<void> {
  await storage.setItem(storageKey, locale);
}

export function createWebLocaleStorage(): LocalePreferenceStorage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}
