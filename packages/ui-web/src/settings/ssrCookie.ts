/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/settings/ssrCookie.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-16
 * ║ Updated: 2026-10-16
 * ║ Purpose: React-free parse of azes-settings cookie for Next RSC layouts
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { migrateAzesSettings, sanitizeSettingsPatch } from './parse';
import { AZES_SETTINGS_COOKIE, type AzesSettingsPatch } from './types';

export { AZES_SETTINGS_COOKIE };

/**
 * Decode a cookie value that may be URI-encoded (browser write) or plain JSON
 * (some server cookie APIs already decode).
 */
function decodeCookieRaw(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * Build an `initialSettings` patch from the `azes-settings` (+ prefsScope) cookie
 * body for SSR. Empty / invalid → `{}` so app defaults apply.
 *
 * Safe for React Server Components (no React, no DOM).
 */
export function settingsPatchFromCookieRaw(raw: string | null | undefined): AzesSettingsPatch {
  if (raw == null || raw === '') return {};
  const decoded = decodeCookieRaw(raw).trim();
  if (!decoded) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(decoded);
  } catch {
    return {};
  }
  return sanitizeSettingsPatch(migrateAzesSettings(parsed));
}
