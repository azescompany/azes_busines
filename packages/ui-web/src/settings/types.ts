/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/settings/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-05
 * ║ Purpose: Runtime UI settings model, option lists and defaults
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { AZES_FONT_PRESET_IDS, type AzesFontPresetId } from '../theme/createAzesTheme';
import { DEFAULT_PRIMARY } from '../theme/brand';

export const AZES_SETTINGS_VERSION = 1;
export const AZES_SETTINGS_STORAGE_KEY = 'azes.settings.v1';
/** Cookie mirror of `AZES_SETTINGS_STORAGE_KEY` for cross-port (account ↔ admin). */
export const AZES_SETTINGS_COOKIE = 'azes-settings';

export const AZES_NAV_LAYOUTS = ['vertical', 'mini', 'horizontal'] as const;
/** Order = settings card order; contrast first (default). */
export const AZES_NAV_COLORS = ['contrast', 'integrated'] as const;
export const AZES_DENSITIES = ['comfortable', 'compact'] as const;
export const AZES_DIRECTIONS = ['ltr', 'rtl'] as const;
export const AZES_CONTAINERS = ['fluid', 'fixed'] as const;
/** Order = settings card order; auto-hide first (default). */
export const AZES_HEADER_MODES = ['autoHide', 'fixed'] as const;

export type AzesNavLayout = (typeof AZES_NAV_LAYOUTS)[number];
export type AzesNavColor = (typeof AZES_NAV_COLORS)[number];
export type AzesSettingsDensity = (typeof AZES_DENSITIES)[number];
export type AzesSettingsDirection = (typeof AZES_DIRECTIONS)[number];
export type AzesContainer = (typeof AZES_CONTAINERS)[number];
export type AzesHeaderMode = (typeof AZES_HEADER_MODES)[number];

/** Persisted UI preferences. Color scheme is owned by MUI `useColorScheme`, not by this model. */
export type AzesSettings = {
  version: typeof AZES_SETTINGS_VERSION;
  /** Brand seed name or a contrast-safe 6-digit hex. */
  primary: string;
  navLayout: AzesNavLayout;
  navColor: AzesNavColor;
  density: AzesSettingsDensity;
  direction: AzesSettingsDirection;
  fontFamily: AzesFontPresetId;
  container: AzesContainer;
  /** Sticky chrome: always pinned (`fixed`) or hide/show on scroll (`autoHide`). */
  headerMode: AzesHeaderMode;
};

export type AzesSettingsKey = Exclude<keyof AzesSettings, 'version'>;
export type AzesSettingsPatch = Partial<Omit<AzesSettings, 'version'>>;

export const AZES_SETTINGS_KEYS: readonly AzesSettingsKey[] = [
  'primary',
  'navLayout',
  'navColor',
  'density',
  'direction',
  'fontFamily',
  'container',
  'headerMode',
];

export const DEFAULT_AZES_SETTINGS: AzesSettings = {
  version: AZES_SETTINGS_VERSION,
  primary: DEFAULT_PRIMARY,
  /** Default chrome: mini rail + horizontal menus toolbar together. */
  navLayout: 'horizontal',
  navColor: 'contrast',
  density: 'comfortable',
  direction: 'ltr',
  fontFamily: 'inter',
  container: 'fluid',
  headerMode: 'autoHide',
};

export const AZES_SETTINGS_OPTIONS = {
  navLayout: AZES_NAV_LAYOUTS,
  navColor: AZES_NAV_COLORS,
  density: AZES_DENSITIES,
  direction: AZES_DIRECTIONS,
  fontFamily: AZES_FONT_PRESET_IDS,
  container: AZES_CONTAINERS,
  headerMode: AZES_HEADER_MODES,
} as const;

/**
 * Controls hidden by default (option still exists for later use).
 * - `direction`: needs approved Emotion RTL cache (ADR-015).
 * - `navLayout`: product chrome is fixed to horizontal+mini; re-enable when needed.
 */
export const DEFAULT_HIDDEN_SETTINGS_CONTROLS: readonly AzesSettingsKey[] = [
  'direction',
  'navLayout',
];
