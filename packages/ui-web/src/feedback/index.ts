/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/feedback/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-10
 * ║ Purpose: Public entry for @azes/ui-web/feedback (snackbar + dialog)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export {
  AzesSnackbarProvider,
  useAzesSnackbar,
  useOptionalAzesSnackbar,
  type AzesSnackbarProviderProps,
} from './AzesSnackbarProvider';
export type {
  AzesSnackbarApi,
  AzesSnackbarItem,
  AzesSnackbarSeverity,
  AzesSnackbarShowInput,
} from './types';
export {
  AzesDialogProvider,
  closeDialog,
  DEFAULT_AZES_DIALOG_LABELS,
  openDialog,
  useAzesDialog,
  useOptionalAzesDialog,
  type AzesConfirmDialogOptions,
  type AzesDangerDialogOptions,
  type AzesDialogApi,
  type AzesDialogAutoFocus,
  type AzesDialogLabels,
  type AzesDialogMaxWidth,
  type AzesDialogOptions,
  type AzesDialogProviderProps,
  type AzesDialogVariant,
  type AzesNotifyDialogOptions,
  type AzesNotifyVariant,
} from '../dialog';
