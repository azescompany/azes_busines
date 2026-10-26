/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/settings/store.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-15
 * ║ Purpose: External settings store with reducer, persistence and cross-tab sync
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { AZES_PRIMARY_STORAGE_KEY, persistPrimary } from '../theme/brand';
import {
  azesPrefsKey,
  configureAzesPrefsScope,
  readAzesUiSync,
  readCrossPortPref,
  readDocumentCookie,
  writeCrossPortPref,
  writeDocumentCookie,
} from '../theme/crossPortStorage';
import { isValidPrimary, parseAzesSettings, sanitizeSettingsPatch } from './parse';
import {
  AZES_SETTINGS_COOKIE,
  AZES_SETTINGS_STORAGE_KEY,
  AZES_SETTINGS_VERSION,
  DEFAULT_AZES_SETTINGS,
  type AzesSettings,
  type AzesSettingsPatch,
} from './types';

export type AzesSettingsAction =
  | { type: 'set'; patch: AzesSettingsPatch }
  | { type: 'reset'; defaults: AzesSettings }
  | { type: 'hydrate'; state: AzesSettings };

export function settingsReducer(state: AzesSettings, action: AzesSettingsAction): AzesSettings {
  switch (action.type) {
    case 'set': {
      const patch = sanitizeSettingsPatch(action.patch);
      const changed = (Object.keys(patch) as (keyof AzesSettingsPatch)[]).some(
        (key) => patch[key] !== state[key],
      );
      return changed ? { ...state, ...patch } : state;
    }
    case 'reset':
      return action.defaults;
    case 'hydrate':
      return sameSettings(state, action.state) ? state : action.state;
  }
}

function sameSettings(a: AzesSettings, b: AzesSettings): boolean {
  return (Object.keys(a) as (keyof AzesSettings)[]).every((key) => a[key] === b[key]);
}

export type AzesSettingsStorageMode = 'local' | 'none';

export type AzesSettingsStoreOptions = {
  /** App defaults merged over `DEFAULT_AZES_SETTINGS`. */
  defaults?: AzesSettingsPatch;
  /** Values that always win. Their drawer controls are hidden. */
  locked?: AzesSettingsPatch;
  /** SSR: values read from a cookie on the server. */
  initialSettings?: AzesSettingsPatch;
  storage?: AzesSettingsStorageMode;
  storageKey?: string;
  /**
   * Style-prefs namespace (`caspian` isolates marketplace from shared shells).
   * Configures module scope before cookie reads. Omit for shared unscoped keys.
   */
  prefsScope?: string | null;
};

export type AzesSettingsStore = {
  /** Effective settings (user choices with locked values applied). Stable until a change. */
  getState: () => AzesSettings;
  /** Settings without browser storage. Used as the SSR snapshot. */
  getServerState: () => AzesSettings;
  subscribe: (listener: () => void) => () => void;
  set: (patch: AzesSettingsPatch) => void;
  reset: () => void;
  /** Re-read browser storage (cross-tab sync). */
  rehydrate: () => void;
  /** Attach the `storage` event listener. Returns a disconnect function. */
  connect: () => () => void;
  readonly lockedKeys: readonly (keyof AzesSettingsPatch)[];
};

export function createAzesSettingsStore(options: AzesSettingsStoreOptions = {}): AzesSettingsStore {
  if (options.prefsScope !== undefined) {
    configureAzesPrefsScope(options.prefsScope);
  }

  const settingsStorageKey = azesPrefsKey(AZES_SETTINGS_STORAGE_KEY);
  const settingsCookieName = azesPrefsKey(AZES_SETTINGS_COOKIE);
  const primaryKey = azesPrefsKey(AZES_PRIMARY_STORAGE_KEY);
  const storageKey = options.storageKey ?? settingsStorageKey;
  const useStorage = (options.storage ?? 'local') === 'local' && typeof window !== 'undefined';
  const locked = sanitizeSettingsPatch(options.locked);
  const lockedKeys = Object.keys(locked) as (keyof AzesSettingsPatch)[];

  const defaults: AzesSettings = {
    ...DEFAULT_AZES_SETTINGS,
    ...sanitizeSettingsPatch(options.defaults),
    version: AZES_SETTINGS_VERSION,
  };
  const serverBase: AzesSettings = {
    ...defaults,
    ...sanitizeSettingsPatch(options.initialSettings),
  };

  function readStoredUserState(): AzesSettings {
    if (!useStorage) return serverBase;
    // local / settings cookies first, then compact `azes-ui` primary wins (cross-port truth).
    let raw = readCrossPortPref(storageKey);
    if (storageKey === settingsStorageKey) {
      const shortCookie = readDocumentCookie(settingsCookieName);
      if (shortCookie && shortCookie !== raw) {
        raw = shortCookie;
        writeCrossPortPref(storageKey, shortCookie);
      }
    }
    let state = raw
      ? parseAzesSettings(raw, serverBase)
      : (() => {
          const legacyPrimary = readCrossPortPref(primaryKey);
          return isValidPrimary(legacyPrimary)
            ? { ...serverBase, primary: legacyPrimary }
            : serverBase;
        })();

    const syncPrimary = readAzesUiSync().primary;
    if (syncPrimary && isValidPrimary(syncPrimary) && syncPrimary !== state.primary) {
      state = { ...state, primary: syncPrimary };
    }
    return state;
  }

  function persistSettingsBlob(next: AzesSettings): void {
    const serialized = JSON.stringify(next);
    writeCrossPortPref(storageKey, serialized);
    // Stable short cookie name (scoped when prefsScope is set).
    if (storageKey === settingsStorageKey) {
      writeDocumentCookie(settingsCookieName, serialized);
    }
  }

  const applyLocked = (state: AzesSettings): AzesSettings =>
    lockedKeys.length === 0 ? state : { ...state, ...locked };

  let userState = readStoredUserState();
  let effective = applyLocked(userState);
  const serverEffective = applyLocked(serverBase);
  const listeners = new Set<() => void>();

  function commit(next: AzesSettings, persist: boolean): void {
    if (next === userState) return;
    userState = next;
    effective = applyLocked(next);
    if (persist && useStorage) {
      persistSettingsBlob(next);
      persistPrimary(effective.primary);
    }
    listeners.forEach((listener) => listener());
  }

  const store: AzesSettingsStore = {
    lockedKeys,
    getState: () => effective,
    getServerState: () => serverEffective,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set(patch) {
      const unlocked = { ...patch };
      for (const key of lockedKeys) delete unlocked[key];
      commit(settingsReducer(userState, { type: 'set', patch: unlocked }), true);
    },
    reset() {
      commit(settingsReducer(userState, { type: 'reset', defaults }), true);
    },
    rehydrate() {
      commit(settingsReducer(userState, { type: 'hydrate', state: readStoredUserState() }), false);
    },
    connect() {
      if (!useStorage) return () => undefined;
      const onStorage = (event: StorageEvent) => {
        if (event.key === storageKey) store.rehydrate();
      };
      // Cross-port (account↔admin): cookie is shared; rehydrate when tab regains focus.
      const onCrossPortSync = () => {
        store.rehydrate();
      };
      const onVisible = () => {
        if (document.visibilityState === 'visible') onCrossPortSync();
      };
      window.addEventListener('storage', onStorage);
      window.addEventListener('focus', onCrossPortSync);
      document.addEventListener('visibilitychange', onVisible);
      return () => {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('focus', onCrossPortSync);
        document.removeEventListener('visibilitychange', onVisible);
      };
    },
  };
  return store;
}
