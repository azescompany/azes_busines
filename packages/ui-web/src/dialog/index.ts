/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/dialog/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Public entry for the global AzesDialog system
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export {
  AzesDialogProvider,
  useAzesDialog,
  useOptionalAzesDialog,
  type AzesDialogProviderProps,
} from './AzesDialogProvider';
export { closeDialog, openDialog, registerDialogBridge } from './dialogBridge';
export {
  DEFAULT_AZES_DIALOG_LABELS,
  type AzesConfirmDialogOptions,
  type AzesDangerDialogOptions,
  type AzesDialogApi,
  type AzesDialogAutoFocus,
  type AzesDialogLabels,
  type AzesDialogMaxWidth,
  type AzesDialogOptions,
  type AzesDialogVariant,
  type AzesNotifyDialogOptions,
  type AzesNotifyVariant,
} from './types';
export { getDialogBackdropSx, getDialogPaperSx, resolveDialogTone } from './dialogStyles';
