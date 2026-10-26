/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/state/src/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Public API for @azes/state (no deep imports)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export { MUST_NOT_ENTER_REDUX, REDUX_MAY_OWN } from './boundaries';

export {
  createAzesStore,
  type AppDispatch,
  type AzesStore,
  type CreateAzesStoreOptions,
} from './store/createStore';
export { rootReducer } from './store/rootReducer';
export type { RootState } from './store/types';
export {
  preferencesInitialState,
  preferencesReducer,
  resetPreferences,
  setTheme,
  type PreferencesState,
  type ThemePreference,
} from './slices/preferences/preferencesSlice';
export { selectPreferences, selectThemePreference } from './slices/preferences/selectors';

export { useAppDispatch, useAppSelector } from './hooks/reduxHooks';
export { AzesStoreProvider, type AzesStoreProviderProps } from './provider/AzesStoreProvider';

export type { PersistenceAdapter } from './persistence/types';
export { PREFERENCES_PERSIST_KEY } from './persistence/types';
export { createMemoryStorageAdapter } from './persistence/memoryStorage';
export { createWebStorageAdapter } from './persistence/webStorage';
export {
  loadPersistedPreferences,
  persistPreferences,
} from './persistence/loadPersistedPreferences';
