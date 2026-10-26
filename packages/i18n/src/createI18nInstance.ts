/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/i18n/src/createI18nInstance.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Factory for shared i18next instances (web/next/native)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import i18n, { type i18n as I18nInstance, type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  DEFAULT_LOCALE,
  DEFAULT_NAMESPACE,
  resolveSupportedLocale,
  type SupportedLocale,
} from './config/constants';
import { bundledResources, type LocaleResources } from './config/resources';
import {
  createWebLocaleStorage,
  localeStorageKey,
  readPreferredLocale,
  writePreferredLocale,
  type LocalePreferenceStorage,
} from './localePreference';

function mergeResources(base: LocaleResources, extra?: Resource): Resource {
  if (!extra) {
    return structuredClone(base) as Resource;
  }

  const merged = structuredClone(base) as Resource;
  for (const [lng, namespaces] of Object.entries(extra)) {
    const existing = { ...((merged[lng] ?? {}) as Record<string, object>) };
    const incoming = namespaces as Record<string, object>;
    for (const [ns, catalog] of Object.entries(incoming)) {
      existing[ns] = {
        ...((existing[ns] ?? {}) as object),
        ...(catalog as object),
      };
    }
    merged[lng] = existing;
  }
  return merged;
}

export type CreateI18nOptions = {
  lng?: SupportedLocale | string;
  fallbackLng?: string;
  /**
   * Product id (`admin`, `account`, …). Scopes locale preference storage so each
   * app keeps its own language choice even on the same browser profile.
   */
  appId?: string;
  /** Override preference storage (tests / native). Default: `localStorage` when present. */
  storage?: LocalePreferenceStorage | null;
  /** Merge app namespaces/locales without baking product copy into this package. */
  resources?: Resource;
  /** Additional default namespaces to preload (lazy load the rest via `loadNamespaces`). */
  defaultNS?: string;
  ns?: string[];
  /** When false, skip react-i18next binding (rare; prefer default true). */
  useReact?: boolean;
};

/**
 * Creates a configured i18next instance with AZES defaults.
 * Apps pass extra `resources` for product namespaces; keep shared keys minimal.
 */
export async function createI18nInstance(options: CreateI18nOptions = {}): Promise<I18nInstance> {
  const {
    fallbackLng = DEFAULT_LOCALE,
    resources,
    defaultNS = DEFAULT_NAMESPACE,
    ns = [DEFAULT_NAMESPACE],
    useReact = true,
    appId,
    storage = createWebLocaleStorage(),
  } = options;

  const preferenceKey = appId ? localeStorageKey(appId) : undefined;
  let lng = options.lng;
  if (!lng && storage && preferenceKey) {
    lng = await readPreferredLocale(storage, fallbackLng, preferenceKey);
  }
  const resolvedLng = resolveSupportedLocale(lng, resolveSupportedLocale(fallbackLng));

  const instance = i18n.createInstance();

  const initOptions = {
    lng: resolvedLng,
    fallbackLng,
    defaultNS,
    ns,
    resources: mergeResources(bundledResources, resources),
    interpolation: { escapeValue: false },
    returnNull: false,
    react: { useSuspense: false },
  };

  if (useReact) {
    await instance.use(initReactI18next).init(initOptions);
  } else {
    const { react: _react, ...rest } = initOptions;
    await instance.init(rest);
  }

  // Persist language changes for this app only.
  if (storage && preferenceKey) {
    instance.on('languageChanged', (next) => {
      void writePreferredLocale(storage, next, preferenceKey);
    });
  }

  return instance;
}

/**
 * Lazy-load additional namespaces into an existing instance.
 * Pass a loader that returns translation JSON for the active language.
 */
export async function loadNamespace(
  instance: I18nInstance,
  namespace: string,
  loader: (lng: string, ns: string) => Promise<Record<string, unknown>>,
): Promise<void> {
  const lng = instance.language || DEFAULT_LOCALE;
  if (instance.hasResourceBundle(lng, namespace)) {
    return;
  }
  const data = await loader(lng, namespace);
  instance.addResourceBundle(lng, namespace, data, true, true);
  if (!instance.options.ns?.includes(namespace)) {
    await instance.loadNamespaces(namespace);
  }
}

/** Change language and return the resolved supported code. */
export async function changeAppLocale(
  instance: I18nInstance,
  locale: string,
): Promise<SupportedLocale> {
  const next = resolveSupportedLocale(locale);
  await instance.changeLanguage(next);
  return next;
}
