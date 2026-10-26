/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/menu/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Public entry for @azes/ui-web/menu
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export { AzesMenu, type AzesMenuProps } from './AzesMenu';
export { useAzesMenu, type UseAzesMenuOptions } from './useAzesMenu';
export type {
  AzesMenuActionItem,
  AzesMenuDividerItem,
  AzesMenuHeaderItem,
  AzesMenuItem,
  AzesMenuPlacement,
  AzesMenuSelectionMode,
  AzesMenuTriggerAriaProps,
  AzesMenuWidth,
} from './types';
export { isAzesMenuActionItem } from './types';
export {
  getMenuDividerSx,
  getMenuHeaderSx,
  getMenuItemSx,
  getMenuListSx,
  getMenuPaperSx,
  getMenuSectionHeaderSx,
  resolveMenuWidthPx,
} from './menuStyles';
