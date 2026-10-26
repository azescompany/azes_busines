/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/i18n/src/index.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-15
 * ║ Purpose: i18n factory, formatting, and boundary tests
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { changeAppLocale, createI18nInstance, loadNamespace } from './createI18nInstance';
import { formatCurrency, formatNumber } from './format/intl';
import * as i18nApi from './index';
import {
  LOCALE_PREFERENCE_KEY,
  localeStorageKey,
  readPreferredLocale,
  writePreferredLocale,
} from './localePreference';

describe('@azes/i18n', () => {
  it('exports foundation surface', () => {
    expect(i18nApi.createI18nInstance).toBeTypeOf('function');
    expect(i18nApi.DEFAULT_LOCALE).toBe('az');
    expect(i18nApi.SUPPORTED_LOCALES[0]).toBe('az');
    expect(i18nApi.SUPPORTED_LOCALES).toContain('en');
    expect(i18nApi.useTranslation).toBeTypeOf('function');
    expect(i18nApi.formatDate).toBeTypeOf('function');
    expect(i18nApi.localeStorageKey('Admin')).toBe('azes.i18n.locale.admin');
  });

  it('creates an instance with fallback and pluralization', async () => {
    const instance = await createI18nInstance({
      useReact: false,
      lng: 'en',
      resources: {
        en: {
          common: {
            items_one: '{{count}} item',
            items_other: '{{count}} items',
          },
        },
      },
    });

    expect(instance.t('common:save')).toBe('Save');
    expect(instance.t('common:items', { count: 1 })).toBe('1 item');
    expect(instance.t('common:items', { count: 3 })).toBe('3 items');
  });

  it('defaults to az when no lng is provided', async () => {
    const instance = await createI18nInstance({ useReact: false, storage: null });
    expect(instance.language).toBe('az');
    expect(instance.t('common:save')).toMatch(/yadda saxla/i);
  });

  it('ships az common auth copy and scopes preference per appId', async () => {
    const bag = new Map<string, string>();
    const storage = {
      getItem: async (key: string) => bag.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        bag.set(key, value);
      },
    };

    const admin = await createI18nInstance({
      useReact: false,
      appId: 'admin',
      storage,
      lng: 'az',
    });
    expect(admin.t('common:auth.sessionOtherDevice')).toMatch(/başqa cihazdan/i);

    await changeAppLocale(admin, 'en');
    expect(bag.get(localeStorageKey('admin'))).toBe('en');
    expect(bag.get(LOCALE_PREFERENCE_KEY)).toBeUndefined();
  });

  it('lazy-loads namespaces on demand', async () => {
    const instance = await createI18nInstance({ useReact: false });
    await loadNamespace(instance, 'app', async () => ({ hello: 'Hello' }));
    expect(instance.t('app:hello')).toBe('Hello');
  });

  it('formats numbers/currency via Intl', () => {
    expect(formatNumber(1234.5, 'en')).toContain('1');
    expect(formatCurrency(10, 'USD', 'en')).toContain('10');
  });

  it('reads and writes locale preference via adapter', async () => {
    const bag = new Map<string, string>();
    const storage = {
      getItem: async (key: string) => bag.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        bag.set(key, value);
      },
    };
    expect(await readPreferredLocale(storage, 'en')).toBe('en');
    await writePreferredLocale(storage, 'az', localeStorageKey('account'));
    expect(bag.get(localeStorageKey('account'))).toBe('az');
  });

  it('does not depend on api, state, auth, or ui packages', () => {
    const packageJsonPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };
    const deps = { ...packageJson.dependencies, ...packageJson.peerDependencies };
    expect(deps.i18next).toBeDefined();
    expect(deps['@azes/api']).toBeUndefined();
    expect(deps['@azes/state']).toBeUndefined();
    expect(deps['@azes/auth']).toBeUndefined();
    expect(deps['@azes/ui-web']).toBeUndefined();
  });
});
