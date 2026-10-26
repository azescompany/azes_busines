/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/dialog/dialogBridge.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Imperative open/close bridge for non-React callers (no state)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AzesDialogOptions } from './types';

type OpenHandler = (options: AzesDialogOptions) => Promise<boolean>;
type CloseHandler = () => void;

let openHandler: OpenHandler | null = null;
let closeHandler: CloseHandler | null = null;

/** Registered by `AzesDialogProvider` on mount; cleared on unmount. */
export function registerDialogBridge(handlers: {
  open: OpenHandler | null;
  close: CloseHandler | null;
}): void {
  openHandler = handlers.open;
  closeHandler = handlers.close;
}

/**
 * Open a dialog from outside React (e.g. API middleware). Resolves `false` when
 * no provider is mounted. Does not store dialog state.
 */
export function openDialog(options: AzesDialogOptions): Promise<boolean> {
  if (!openHandler) {
    return Promise.resolve(false);
  }
  return openHandler(options);
}

/** Dismiss the active dialog as cancel (`false`), if a provider is mounted. */
export function closeDialog(): void {
  closeHandler?.();
}
