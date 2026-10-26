/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/dialog/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Public types for the global AzesDialog queue API
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { ReactNode } from 'react';

export type AzesDialogVariant =
  'confirm' | 'danger' | 'info' | 'success' | 'warning' | 'error' | 'custom';

export type AzesNotifyVariant = 'info' | 'success' | 'warning' | 'error';

export type AzesDialogMaxWidth = 'xs' | 'sm' | 'md' | 'lg';

export type AzesDialogAutoFocus = 'confirm' | 'cancel';

/** Default button / status labels (injected from app i18n). */
export type AzesDialogLabels = {
  confirm: string;
  cancel: string;
  ok: string;
  delete: string;
  errorOccurred: string;
  retry: string;
  confirming: string;
  /** Accessible label for optional header close (X) button. */
  close: string;
};

export const DEFAULT_AZES_DIALOG_LABELS: AzesDialogLabels = {
  confirm: 'Confirm',
  cancel: 'Cancel',
  ok: 'OK',
  delete: 'Delete',
  errorOccurred: 'Something went wrong',
  retry: 'Try again',
  confirming: 'Working…',
  close: 'Close',
};

export type AzesDialogOptions = {
  variant?: AzesDialogVariant;
  title: ReactNode;
  description?: ReactNode;
  /** Override default variant icon; `false` hides the icon. */
  icon?: ReactNode | false;
  content?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  hideCancel?: boolean;
  onConfirm?: () => void | Promise<unknown>;
  closeOnBackdrop?: boolean;
  maxWidth?: AzesDialogMaxWidth;
  autoFocus?: AzesDialogAutoFocus;
  /** Full-viewport dialog below the `sm` breakpoint. Default `false`. */
  fullScreenOnMobile?: boolean;
  /** Show an X control in the title row. Default `false`. */
  showCloseButton?: boolean;
  /** Hide the action footer (custom content owns its own actions). Default `false`. */
  hideFooter?: boolean;
  /** Remove DialogContent padding (edge-to-edge gallery layouts). Default `false`. */
  paddingless?: boolean;
};

export type AzesConfirmDialogOptions = Omit<AzesDialogOptions, 'variant'> & {
  variant?: 'confirm';
};

export type AzesDangerDialogOptions = Omit<AzesDialogOptions, 'variant'> & {
  variant?: 'danger';
};

export type AzesNotifyDialogOptions = Omit<
  AzesDialogOptions,
  'variant' | 'hideCancel' | 'cancelLabel' | 'onConfirm' | 'autoFocus'
> & {
  variant?: AzesNotifyVariant;
};

export type AzesDialogApi = {
  confirm: (options: AzesConfirmDialogOptions) => Promise<boolean>;
  danger: (options: AzesDangerDialogOptions) => Promise<boolean>;
  notify: (options: AzesNotifyDialogOptions) => Promise<void>;
  open: (options: AzesDialogOptions) => Promise<boolean>;
  close: () => void;
};

export type QueuedDialogEntry = {
  id: string;
  options: AzesDialogOptions;
  resolve: (value: boolean) => void;
};
