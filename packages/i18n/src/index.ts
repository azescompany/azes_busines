/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/i18n/src/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Public API for @azes/i18n
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export {
  DEFAULT_LOCALE,
  DEFAULT_NAMESPACE,
  LOCALE_META,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  resolveSupportedLocale,
  type LocaleMeta,
  type SupportedLocale,
} from './config/constants';
export { bundledResources, type LocaleResources } from './config/resources';
export {
  changeAppLocale,
  createI18nInstance,
  loadNamespace,
  type CreateI18nOptions,
} from './createI18nInstance';
export { formatCurrency, formatDate, formatNumber } from './format/intl';
export {
  LOCALE_PREFERENCE_KEY,
  createWebLocaleStorage,
  localeStorageKey,
  readPreferredLocale,
  writePreferredLocale,
  type LocalePreferenceStorage,
} from './localePreference';

export { I18nextProvider, useTranslation, Trans } from 'react-i18next';
export type { TFunction, i18n as I18nInstance } from 'i18next';
