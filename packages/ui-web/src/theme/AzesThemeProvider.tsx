/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/AzesThemeProvider.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-09-29
 * ║ Updated: 2026-10-15
 * ║ Purpose: Memoized MUI theme provider with CssBaseline for web apps
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useMemo, type ReactNode } from 'react';

import {
  getAzesColorSchemeStorageKey,
  getAzesModeStorageKey,
  readStoredPrimary,
  resolveBrandPrimary,
} from './brand';
import { createAzesCrossPortStorageManager } from './crossPortStorage';
import { DEFAULT_AZES_DENSITY, type AzesDensity } from './density';
import { createAzesTheme, type AzesDirection, type AzesFontPresetId } from './createAzesTheme';

const crossPortStorageManager = createAzesCrossPortStorageManager();

export type AzesThemeProviderProps = {
  /** Hex or brand seed. When omitted, a stored primary is used in the browser. */
  primary?: string;
  /** Optional override. When omitted, secondary/focus/link follow primary harmony. */
  secondary?: string;
  /** Control sizing preset. Default `comfortable`. */
  density?: AzesDensity;
  /** Body font stack preset. Default `default`. */
  fontFamily?: AzesFontPresetId;
  /** Text direction. Default `ltr`. */
  direction?: AzesDirection;
  /** When true (default), tint canvas/paper toward the primary hue. */
  tintSurfaces?: boolean;
  children: ReactNode;
};

export function AzesThemeProvider({
  primary,
  secondary,
  density = DEFAULT_AZES_DENSITY,
  fontFamily,
  direction = 'ltr',
  tintSurfaces,
  children,
}: AzesThemeProviderProps) {
  const resolvedPrimary = resolveBrandPrimary(primary ?? readStoredPrimary());
  const modeStorageKey = getAzesModeStorageKey();
  const colorSchemeStorageKey = getAzesColorSchemeStorageKey();
  const theme = useMemo(
    () =>
      createAzesTheme({
        primary: resolvedPrimary,
        secondary,
        density,
        fontFamily,
        direction,
        tintSurfaces,
      }),
    [resolvedPrimary, secondary, density, fontFamily, direction, tintSurfaces],
  );

  return (
    <MuiThemeProvider
      theme={theme}
      defaultMode="system"
      modeStorageKey={modeStorageKey}
      colorSchemeStorageKey={colorSchemeStorageKey}
      storageManager={crossPortStorageManager}
      disableTransitionOnChange
    >
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
