/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/crossPortStorage.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-15
 * ║ Purpose: Cross-port cookie ↔ localStorage preference bridge
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AZES_MODE_STORAGE_KEY, brandSeeds } from './brand';
import {
  AZES_UI_SYNC_COOKIE,
  azesPrefsKey,
  configureAzesPrefsScope,
  createAzesCrossPortStorageManager,
  patchAzesUiSync,
  readAzesUiSync,
  readCrossPortPref,
  readDocumentCookie,
  writeCrossPortPref,
  writeDocumentCookie,
} from './crossPortStorage';
import { createAzesSettingsStore } from '../settings/store';
import {
  AZES_SETTINGS_COOKIE,
  AZES_SETTINGS_STORAGE_KEY,
  DEFAULT_AZES_SETTINGS,
} from '../settings/types';

function clearCookies(): void {
  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0]?.trim();
    if (name) {
      document.cookie = `${name}=;path=/;max-age=0`;
    }
  }
}

describe('crossPortStorage', () => {
  beforeEach(() => {
    configureAzesPrefsScope(null);
    window.localStorage.clear();
    clearCookies();
  });

  afterEach(() => {
    configureAzesPrefsScope(null);
    window.localStorage.clear();
    clearCookies();
  });

  it('reads cookie when localStorage is empty and seeds localStorage', () => {
    writeDocumentCookie(AZES_MODE_STORAGE_KEY, 'dark');
    expect(window.localStorage.getItem(AZES_MODE_STORAGE_KEY)).toBeNull();
    expect(readCrossPortPref(AZES_MODE_STORAGE_KEY)).toBe('dark');
    expect(window.localStorage.getItem(AZES_MODE_STORAGE_KEY)).toBe('dark');
  });

  it('cookie wins over stale localStorage (cross-port)', () => {
    window.localStorage.setItem(AZES_MODE_STORAGE_KEY, 'light');
    writeDocumentCookie(AZES_MODE_STORAGE_KEY, 'dark');
    expect(readCrossPortPref(AZES_MODE_STORAGE_KEY)).toBe('dark');
    expect(window.localStorage.getItem(AZES_MODE_STORAGE_KEY)).toBe('dark');
  });

  it('writes both localStorage and cookie', () => {
    writeCrossPortPref(AZES_MODE_STORAGE_KEY, 'light');
    expect(window.localStorage.getItem(AZES_MODE_STORAGE_KEY)).toBe('light');
    expect(readDocumentCookie(AZES_MODE_STORAGE_KEY)).toBe('light');
  });

  it('storage manager mirrors mode for MUI ThemeProvider', () => {
    const createManager = createAzesCrossPortStorageManager();
    const manager = createManager({ key: AZES_MODE_STORAGE_KEY, storageWindow: window });
    manager.set('dark');
    expect(manager.get('system')).toBe('dark');
    expect(readDocumentCookie(AZES_MODE_STORAGE_KEY)).toBe('dark');
  });

  it('storage manager get prefers cookie over stale local', () => {
    const createManager = createAzesCrossPortStorageManager();
    const manager = createManager({ key: AZES_MODE_STORAGE_KEY, storageWindow: window });
    window.localStorage.setItem(AZES_MODE_STORAGE_KEY, 'light');
    writeDocumentCookie(AZES_MODE_STORAGE_KEY, 'dark');
    expect(manager.get('system')).toBe('dark');
    expect(window.localStorage.getItem(AZES_MODE_STORAGE_KEY)).toBe('dark');
  });

  it('azes-ui sync cookie bridges primary across ports', () => {
    window.localStorage.setItem(
      AZES_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        ...DEFAULT_AZES_SETTINGS,
        primary: brandSeeds.indigo,
      }),
    );
    patchAzesUiSync({ primary: brandSeeds.rose, mode: 'dark' });

    expect(readAzesUiSync()).toEqual({ primary: brandSeeds.rose, mode: 'dark' });
    expect(readDocumentCookie(AZES_UI_SYNC_COOKIE)).toContain(brandSeeds.rose);

    const store = createAzesSettingsStore();
    expect(store.getState().primary).toBe(brandSeeds.rose);
  });

  it('settings store prefers settings cookie over stale localStorage', () => {
    const stale = JSON.stringify({ ...DEFAULT_AZES_SETTINGS, primary: brandSeeds.teal });
    const fresh = JSON.stringify({ ...DEFAULT_AZES_SETTINGS, primary: 'violet' });
    window.localStorage.setItem(AZES_SETTINGS_STORAGE_KEY, stale);
    writeDocumentCookie(AZES_SETTINGS_STORAGE_KEY, fresh);
    writeDocumentCookie(AZES_SETTINGS_COOKIE, fresh);

    expect(readCrossPortPref(AZES_SETTINGS_STORAGE_KEY)).toBe(fresh);

    const store = createAzesSettingsStore();
    expect(store.getState().primary).toBe('violet');
  });

  it('settings store hydrates primary from azes-settings cookie (cross-port)', () => {
    const payload = {
      ...DEFAULT_AZES_SETTINGS,
      primary: brandSeeds.red,
      density: 'compact' as const,
    };
    writeDocumentCookie(AZES_SETTINGS_COOKIE, JSON.stringify(payload));
    expect(window.localStorage.getItem(AZES_SETTINGS_STORAGE_KEY)).toBeNull();

    const store = createAzesSettingsStore();
    expect(store.getState().primary).toBe(brandSeeds.red);
    expect(store.getState().density).toBe('compact');
    expect(window.localStorage.getItem(AZES_SETTINGS_STORAGE_KEY)).toBeTruthy();
  });

  it('settings store persists azes-settings cookie for the other port', () => {
    const store = createAzesSettingsStore();
    store.set({ primary: 'red' });
    const cookie = readDocumentCookie(AZES_SETTINGS_COOKIE);
    expect(cookie).toBeTruthy();
    const parsed = JSON.parse(cookie ?? '{}') as { primary?: string };
    expect(parsed.primary).toBe('red');
  });

  it('prefsScope isolates marketplace sync from shared unscoped keys', () => {
    patchAzesUiSync({ primary: brandSeeds.indigo, mode: 'light' });
    expect(readDocumentCookie(AZES_UI_SYNC_COOKIE)).toContain(brandSeeds.indigo);

    configureAzesPrefsScope('caspian');
    patchAzesUiSync({ primary: brandSeeds.rose, mode: 'dark' });

    expect(azesPrefsKey(AZES_UI_SYNC_COOKIE)).toBe('azes-ui.caspian');
    expect(readDocumentCookie('azes-ui.caspian')).toContain(brandSeeds.rose);
    // Shared unscoped cookie unchanged while marketplace writes scoped keys.
    expect(readDocumentCookie(AZES_UI_SYNC_COOKIE)).toContain(brandSeeds.indigo);
    expect(readAzesUiSync()).toEqual({ primary: brandSeeds.rose, mode: 'dark' });

    const marketStore = createAzesSettingsStore({ prefsScope: 'caspian' });
    expect(marketStore.getState().primary).toBe(brandSeeds.rose);
    marketStore.set({ density: 'compact' });
    expect(readDocumentCookie(azesPrefsKey(AZES_SETTINGS_COOKIE))).toContain('compact');
    // Must not overwrite the shared account/admin settings cookie.
    expect(readDocumentCookie(AZES_SETTINGS_COOKIE)).toBeNull();

    configureAzesPrefsScope(null);
    expect(readAzesUiSync()).toEqual({ primary: brandSeeds.indigo, mode: 'light' });
    expect(readDocumentCookie(AZES_UI_SYNC_COOKIE)).toContain(brandSeeds.indigo);
  });
});
