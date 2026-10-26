/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/menu/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Public item / placement types for AzesMenu
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { ReactNode } from 'react';

export type AzesMenuPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

export type AzesMenuWidth = 'auto' | 'sm' | 'md';

export type AzesMenuSelectionMode = 'none' | 'single';

export type AzesMenuActionItem = {
  type?: 'item';
  id: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  endAdornment?: ReactNode;
  shortcut?: string;
  /** Meaningful when `selectionMode="single"`. */
  selected?: boolean;
  disabled?: boolean;
  danger?: boolean;
  href?: string;
  onSelect?: () => void | Promise<void>;
  /** Default true. */
  closeOnSelect?: boolean;
};

export type AzesMenuDividerItem = { type: 'divider'; id?: string };

export type AzesMenuHeaderItem = {
  type: 'header';
  id: string;
  label: ReactNode;
};

export type AzesMenuItem = AzesMenuActionItem | AzesMenuDividerItem | AzesMenuHeaderItem;

export type AzesMenuTriggerAriaProps = {
  id: string;
  'aria-haspopup': 'menu';
  'aria-expanded': boolean;
  'aria-controls'?: string;
};

export function isAzesMenuActionItem(item: AzesMenuItem): item is AzesMenuActionItem {
  return item.type !== 'divider' && item.type !== 'header';
}
