/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/settings/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-11
 * ║ Purpose: Public entry point for @azes/ui-web/settings (+ favicon sync exports)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import '../theme/mui-augment';

export {
  AZES_UI_SYNC_COOKIE,
  azesPrefsKey,
  configureAzesPrefsCookie,
  configureAzesPrefsScope,
  getAzesPrefsScope,
  patchAzesUiSync,
  readAzesUiSync,
  type AzesPrefsCookieOptions,
  type AzesUiSync,
  type AzesUiSyncMode,
} from '../theme/crossPortStorage';

export {
  applyAzesFavicon,
  createAzesFaviconHtmlPlugin,
  syncAzesFaviconFromPrefs,
} from '../theme/azesFavicon';

export {
  AzesSettingsProvider,
  AzesUiProvider,
  useAzesSettings,
  useAzesSettingsActions,
  useIsSettingsControlVisible,
  useOptionalAzesSettings,
  useOptionalAzesSettingsActions,
  type AzesSettingsActions,
  type AzesSettingsProviderProps,
  type AzesUiProviderProps,
} from './AzesSettingsProvider';
export {
  AzesSettingsButton,
  AzesSettingsControl,
  AzesSettingsDrawer,
  AzesSettingsSection,
  DEFAULT_AZES_SETTINGS_LABELS,
  type AzesSettingsButtonProps,
  type AzesSettingsControlProps,
  type AzesSettingsDrawerProps,
  type AzesSettingsLabels,
  type AzesSettingsSectionProps,
} from './AzesSettingsDrawer';
export {
  createAzesSettingsStore,
  settingsReducer,
  type AzesSettingsAction,
  type AzesSettingsStorageMode,
  type AzesSettingsStore,
  type AzesSettingsStoreOptions,
} from './store';
export {
  isValidPrimary,
  migrateAzesSettings,
  parseAzesSettings,
  sanitizeSettingsPatch,
} from './parse';
export {
  AZES_CONTAINERS,
  AZES_DENSITIES,
  AZES_DIRECTIONS,
  AZES_HEADER_MODES,
  AZES_NAV_COLORS,
  AZES_NAV_LAYOUTS,
  AZES_SETTINGS_COOKIE,
  AZES_SETTINGS_KEYS,
  AZES_SETTINGS_OPTIONS,
  AZES_SETTINGS_STORAGE_KEY,
  AZES_SETTINGS_VERSION,
  DEFAULT_AZES_SETTINGS,
  DEFAULT_HIDDEN_SETTINGS_CONTROLS,
  type AzesContainer,
  type AzesHeaderMode,
  type AzesNavColor,
  type AzesNavLayout,
  type AzesSettings,
  type AzesSettingsDensity,
  type AzesSettingsDirection,
  type AzesSettingsKey,
  type AzesSettingsPatch,
} from './types';
