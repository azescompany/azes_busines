/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/chromeMetrics.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-06
 * ║ Updated: 2026-10-06
 * ║ Purpose: Density-immune spacing for header + menus toolbar chrome
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Theme } from '@mui/material/styles';

/**
 * Header / menus-toolbar metrics stay on the comfortable 8px rhythm even when
 * theme density (spacing base) is compact — chrome must not reflow with Density.
 */
export function chromeInlinePadding(theme: Theme) {
  const l = theme.azes.layout;
  return {
    xs: `${l.pagePaddingXs}px`,
    md: `${l.pagePaddingMd}px`,
    lg: `${l.pagePaddingLg}px`,
  } as const;
}

/** Fixed control size inside header / menus toolbar (matches Apps waffle). */
export const CHROME_ICON_BUTTON_PX = 40;
