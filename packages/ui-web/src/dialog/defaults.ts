/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/dialog/defaults.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Resolve variant defaults for AzesDialog options
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type {
  AzesDialogAutoFocus,
  AzesDialogLabels,
  AzesDialogOptions,
  AzesDialogVariant,
} from './types';

export type ResolvedDialogOptions = Required<
  Pick<
    AzesDialogOptions,
    | 'variant'
    | 'title'
    | 'hideCancel'
    | 'closeOnBackdrop'
    | 'maxWidth'
    | 'autoFocus'
    | 'fullScreenOnMobile'
    | 'showCloseButton'
    | 'hideFooter'
    | 'paddingless'
  >
> &
  AzesDialogOptions & {
    confirmLabel: AzesDialogOptions['confirmLabel'];
    cancelLabel: AzesDialogOptions['cancelLabel'];
  };

export function isNotifyVariant(
  variant: AzesDialogVariant,
): variant is 'info' | 'success' | 'warning' | 'error' {
  return (
    variant === 'info' || variant === 'success' || variant === 'warning' || variant === 'error'
  );
}

export function isAlertDialogVariant(variant: AzesDialogVariant): boolean {
  return variant === 'danger' || variant === 'error';
}

function defaultCloseOnBackdrop(variant: AzesDialogVariant): boolean {
  if (variant === 'danger' || variant === 'error') {
    return false;
  }
  return true;
}

function defaultHideCancel(variant: AzesDialogVariant): boolean {
  return isNotifyVariant(variant);
}

function defaultAutoFocus(variant: AzesDialogVariant): AzesDialogAutoFocus {
  return variant === 'danger' ? 'cancel' : 'confirm';
}

function defaultConfirmLabel(variant: AzesDialogVariant, labels: AzesDialogLabels): string {
  if (isNotifyVariant(variant)) {
    return labels.ok;
  }
  if (variant === 'danger') {
    return labels.delete;
  }
  return labels.confirm;
}

export function resolveDialogOptions(
  options: AzesDialogOptions,
  labels: AzesDialogLabels,
): ResolvedDialogOptions {
  const variant = options.variant ?? 'confirm';
  return {
    ...options,
    variant,
    title: options.title,
    hideCancel: options.hideCancel ?? defaultHideCancel(variant),
    closeOnBackdrop: options.closeOnBackdrop ?? defaultCloseOnBackdrop(variant),
    maxWidth: options.maxWidth ?? 'xs',
    autoFocus: options.autoFocus ?? defaultAutoFocus(variant),
    confirmLabel: options.confirmLabel ?? defaultConfirmLabel(variant, labels),
    cancelLabel: options.cancelLabel ?? labels.cancel,
    fullScreenOnMobile: options.fullScreenOnMobile ?? false,
    showCloseButton: options.showCloseButton ?? false,
    hideFooter: options.hideFooter ?? false,
    paddingless: options.paddingless ?? false,
  };
}

export function createDialogId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `azes-dialog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
