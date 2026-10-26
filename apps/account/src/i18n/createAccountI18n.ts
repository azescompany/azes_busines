/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/i18n/createAccountI18n.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-15
 * ║ Purpose: Account-scoped i18n instance (en/az/ru) + unique locale preference
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createI18nInstance, DEFAULT_LOCALE, type CreateI18nOptions } from '@azes/i18n';

import accountAz from './locales/az/account.json';
import accountEn from './locales/en/account.json';
import accountRu from './locales/ru/account.json';

export const ACCOUNT_I18N_APP_ID = 'account';
export const ACCOUNT_NAMESPACE = 'account';

export function createAccountI18n(
  options: Omit<CreateI18nOptions, 'appId' | 'resources' | 'ns'> = {},
) {
  return createI18nInstance({
    ...options,
    appId: ACCOUNT_I18N_APP_ID,
    fallbackLng: options.fallbackLng ?? DEFAULT_LOCALE,
    defaultNS: ACCOUNT_NAMESPACE,
    ns: ['common', ACCOUNT_NAMESPACE],
    resources: {
      en: { [ACCOUNT_NAMESPACE]: accountEn },
      az: { [ACCOUNT_NAMESPACE]: accountAz },
      ru: { [ACCOUNT_NAMESPACE]: accountRu },
    },
  });
}
