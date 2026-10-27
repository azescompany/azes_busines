/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/shared/adminChrome/useDirtyLeaveGuard.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: beforeunload + dialog confirm when form is dirty
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useAzesDialog } from '@azes/ui-web/feedback';
import { useCallback, useEffect } from 'react';

export function useDirtyLeaveGuard(dirty: boolean, labels: { title: string; description: string }) {
  const dialog = useAzesDialog();

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const confirmLeave = useCallback(async () => {
    if (!dirty) return true;
    return dialog.confirm({
      title: labels.title,
      description: labels.description,
    });
  }, [dirty, dialog, labels.description, labels.title]);

  return { confirmLeave };
}
