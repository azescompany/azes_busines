/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/feedback/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Global snackbar message contracts
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { ReactNode } from 'react';

export type AzesSnackbarSeverity = 'success' | 'info' | 'warning' | 'error' | 'default';

export type AzesSnackbarShowInput = {
  message: ReactNode;
  severity?: AzesSnackbarSeverity;
  /** `null` keeps the snack open until dismissed. Default: 4000. */
  autoHideDuration?: number | null;
  action?: ReactNode;
};

export type AzesSnackbarItem = {
  id: string;
  message: ReactNode;
  severity: AzesSnackbarSeverity;
  autoHideDuration: number | null;
  action?: ReactNode;
};

export type AzesSnackbarApi = {
  show: (input: ReactNode | AzesSnackbarShowInput) => string;
  success: (message: ReactNode) => string;
  info: (message: ReactNode) => string;
  warning: (message: ReactNode) => string;
  error: (message: ReactNode) => string;
  close: (id?: string) => void;
};
