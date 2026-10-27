/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/shared/adminChrome/useNotify.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Thin snackbar helper over useAzesSnackbar
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useAzesSnackbar } from '@azes/ui-web/feedback';
import { useMemo } from 'react';

export function useNotify() {
  const snack = useAzesSnackbar();
  return useMemo(
    () => ({
      success: (message: string) => snack.success(message),
      error: (message: string) => snack.error(message),
      warning: (message: string) => snack.warning(message),
      info: (message: string) => snack.info(message),
    }),
    [snack],
  );
}
