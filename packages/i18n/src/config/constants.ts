/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/i18n/src/config/constants.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-15
 * ║ Purpose: Shared locale defaults for AZES i18n
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const DEFAULT_LOCALE = 'az' as const;
export const DEFAULT_NAMESPACE = 'common' as const;

/** Platform-supported locales. Apps may ship extra namespaces per locale. */
export const SUPPORTED_LOCALES = ['az', 'en', 'ru'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocaleMeta = {
  code: SupportedLocale;
  /** Native endonym shown in the language menu. */
  label: string;
  /** Compact badge (app bar). */
  shortLabel: string;
  /** Flag emoji for the language menu. */
  flag: string;
};

export const LOCALE_META: readonly LocaleMeta[] = [
  { code: 'az', label: 'Azərbaycan', shortLabel: 'AZ', flag: '🇦🇿' },
  { code: 'en', label: 'English', shortLabel: 'EN', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', shortLabel: 'RU', flag: '🇷🇺' },
] as const;

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function resolveSupportedLocale(
  value: string | null | undefined,
  fallback: SupportedLocale = DEFAULT_LOCALE,
): SupportedLocale {
  if (value && isSupportedLocale(value)) {
    return value;
  }
  return fallback;
}
