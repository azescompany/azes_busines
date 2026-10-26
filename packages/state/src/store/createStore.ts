/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/state/src/store/createStore.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Store factory with RTK defaults + optional persistence
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { configureStore, type Middleware } from '@reduxjs/toolkit';
import { persistPreferences } from '../persistence/loadPersistedPreferences';
import type { PersistenceAdapter } from '../persistence/types';
import type { PreferencesState } from '../slices/preferences/preferencesSlice';
import { rootReducer } from './rootReducer';
import type { RootState } from './types';

export type CreateAzesStoreOptions = {
  /** Partial preloaded state (e.g. after `loadPersistedPreferences`). */
  preloadedState?: Partial<RootState>;
  /**
   * When set, preferences are written to the adapter after each change.
   * Use `createWebStorageAdapter` on web; memory adapter for tests.
   * Native secure/async adapters belong with app/auth wiring (Phase 8+).
   */
  persistence?: PersistenceAdapter;
  /** Extra middleware (serializableCheck stays enabled by default). */
  middleware?: Middleware[];
};

function createPersistenceMiddleware(adapter: PersistenceAdapter): Middleware {
  return (storeApi) => (next) => (action) => {
    const result = next(action);
    const preferences = (storeApi.getState() as RootState).preferences;
    void persistPreferences(adapter, preferences);
    return result;
  };
}

/**
 * Creates a typed AZES Redux store for client/global state only.
 * Do not place TanStack Query / API caches in this store.
 */
export function createAzesStore(options: CreateAzesStoreOptions = {}) {
  const { preloadedState, persistence, middleware: extraMiddleware = [] } = options;

  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => {
      const defaults = getDefaultMiddleware({
        serializableCheck: true,
        immutableCheck: true,
      });

      if (persistence && extraMiddleware.length > 0) {
        return defaults.concat(createPersistenceMiddleware(persistence), ...extraMiddleware);
      }
      if (persistence) {
        return defaults.concat(createPersistenceMiddleware(persistence));
      }
      if (extraMiddleware.length > 0) {
        return defaults.concat(...extraMiddleware);
      }
      return defaults;
    },
  });
}

export type AzesStore = ReturnType<typeof createAzesStore>;
export type AppDispatch = AzesStore['dispatch'];
export type { PreferencesState };
