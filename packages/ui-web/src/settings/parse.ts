/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/settings/parse.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-05
 * ║ Purpose: Field-level validation and version migration for stored settings
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { brandSeeds } from '../theme/brand';
import { resolveAzesFontPresetId } from '../theme/createAzesTheme';
import { isPrimaryContrastSafe } from '../theme/palette';
import {
  AZES_CONTAINERS,
  AZES_DENSITIES,
  AZES_DIRECTIONS,
  AZES_HEADER_MODES,
  AZES_NAV_COLORS,
  AZES_NAV_LAYOUTS,
  AZES_SETTINGS_VERSION,
  DEFAULT_AZES_SETTINGS,
  type AzesSettings,
  type AzesSettingsPatch,
} from './types';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function oneOf<T extends string>(options: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value);
}

/** A brand seed name, or a hex that passes contrast checks in both schemes. */
export function isValidPrimary(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (Object.prototype.hasOwnProperty.call(brandSeeds, value)) return true;
  return isPrimaryContrastSafe(value);
}

/** Keep only valid fields from an untrusted object. Unknown keys and bad values are dropped. */
export function sanitizeSettingsPatch(input: unknown): AzesSettingsPatch {
  if (!isRecord(input)) return {};
  const patch: AzesSettingsPatch = {};
  if (isValidPrimary(input.primary)) patch.primary = input.primary;
  if (oneOf(AZES_NAV_LAYOUTS, input.navLayout)) patch.navLayout = input.navLayout;
  if (oneOf(AZES_NAV_COLORS, input.navColor)) patch.navColor = input.navColor;
  if (oneOf(AZES_DENSITIES, input.density)) patch.density = input.density;
  if (oneOf(AZES_DIRECTIONS, input.direction)) patch.direction = input.direction;
  if (typeof input.fontFamily === 'string') {
    patch.fontFamily = resolveAzesFontPresetId(input.fontFamily);
  }
  if (oneOf(AZES_CONTAINERS, input.container)) patch.container = input.container;
  if (oneOf(AZES_HEADER_MODES, input.headerMode)) patch.headerMode = input.headerMode;
  return patch;
}

/** Upgrade older stored shapes to the current version. Returns an untrusted record. */
export function migrateAzesSettings(input: unknown): UnknownRecord {
  if (!isRecord(input)) return {};
  const version = typeof input.version === 'number' ? input.version : 0;
  if (version === 0) {
    // Pre-versioned Theme Lab shape used `compactLayout: boolean`.
    const { compactLayout, ...rest } = input;
    return {
      ...rest,
      density: rest.density ?? (compactLayout === true ? 'compact' : undefined),
      version: AZES_SETTINGS_VERSION,
    };
  }
  return input;
}

/** Parse stored JSON. Invalid JSON or fields fall back to `base` field by field. */
export function parseAzesSettings(
  raw: string | null | undefined,
  base: AzesSettings = DEFAULT_AZES_SETTINGS,
): AzesSettings {
  if (!raw) return base;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return base;
  }
  return {
    ...base,
    ...sanitizeSettingsPatch(migrateAzesSettings(parsed)),
    version: AZES_SETTINGS_VERSION,
  };
}
