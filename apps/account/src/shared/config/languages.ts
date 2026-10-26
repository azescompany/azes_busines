/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/shared/config/languages.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Account language menu options (endonyms + short codes)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { LOCALE_META, type SupportedLocale } from '@azes/i18n';

export type AccountLanguageOption = {
  code: SupportedLocale;
  label: string;
  shortLabel: string;
};

export const ACCOUNT_LANGUAGES: readonly AccountLanguageOption[] = LOCALE_META.map((meta) => ({
  code: meta.code,
  label: meta.label,
  shortLabel: meta.shortLabel,
}));
