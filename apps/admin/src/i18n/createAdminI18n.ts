/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/i18n/createAdminI18n.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Admin-scoped i18n instance (en/az/ru), default az
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  createI18nInstance,
  createWebLocaleStorage,
  DEFAULT_LOCALE,
  localeStorageKey,
  writePreferredLocale,
  type CreateI18nOptions,
} from '@azes/i18n';

import adminAz from './locales/az/admin.json';
import adminEn from './locales/en/admin.json';
import adminRu from './locales/ru/admin.json';

export const ADMIN_I18N_APP_ID = 'admin';
export const ADMIN_NAMESPACE = 'admin';

export async function createAdminI18n(
  options: Omit<CreateI18nOptions, 'appId' | 'resources' | 'ns'> = {},
) {
  const instance = await createI18nInstance({
    ...options,
    appId: ADMIN_I18N_APP_ID,
    fallbackLng: options.fallbackLng ?? DEFAULT_LOCALE,
    defaultNS: ADMIN_NAMESPACE,
    ns: ['common', ADMIN_NAMESPACE],
    resources: {
      en: { [ADMIN_NAMESPACE]: adminEn },
      az: { [ADMIN_NAMESPACE]: adminAz },
      ru: { [ADMIN_NAMESPACE]: adminRu },
    },
  });

  const storage = options.storage === undefined ? createWebLocaleStorage() : options.storage;
  if (storage) {
    await writePreferredLocale(
      storage,
      instance.language || DEFAULT_LOCALE,
      localeStorageKey(ADMIN_I18N_APP_ID),
    );
  }

  return instance;
}
