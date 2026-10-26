/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/i18n/createShowcaseI18n.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Showcase app i18n — showcase namespace (en/az/ru), default az
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

import showcaseAz from './locales/az/showcase.json';
import showcaseEn from './locales/en/showcase.json';
import showcaseRu from './locales/ru/showcase.json';

export const SHOWCASE_I18N_APP_ID = 'azes-ui';
export const SHOWCASE_NAMESPACE = 'showcase';

/** Locale preference key: `azes.i18n.locale.azes-ui`. */
export async function createShowcaseI18n(
  options: Omit<CreateI18nOptions, 'appId' | 'resources' | 'ns'> = {},
) {
  const instance = await createI18nInstance({
    ...options,
    appId: SHOWCASE_I18N_APP_ID,
    fallbackLng: options.fallbackLng ?? DEFAULT_LOCALE,
    defaultNS: SHOWCASE_NAMESPACE,
    ns: ['common', SHOWCASE_NAMESPACE],
    resources: {
      en: { [SHOWCASE_NAMESPACE]: showcaseEn },
      az: { [SHOWCASE_NAMESPACE]: showcaseAz },
      ru: { [SHOWCASE_NAMESPACE]: showcaseRu },
    },
  });

  // Persist resolved language on first boot (empty preference → default az).
  const storage = options.storage === undefined ? createWebLocaleStorage() : options.storage;
  if (storage) {
    await writePreferredLocale(
      storage,
      instance.language || DEFAULT_LOCALE,
      localeStorageKey(SHOWCASE_I18N_APP_ID),
    );
  }

  return instance;
}
