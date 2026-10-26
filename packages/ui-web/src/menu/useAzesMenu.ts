/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/menu/useAzesMenu.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Controlled/uncontrolled open state helper for AzesMenu
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useCallback, useState, type MouseEvent } from 'react';

export type UseAzesMenuOptions = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function useAzesMenu(options: UseAzesMenuOptions = {}) {
  const controlled = options.open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(Boolean(options.defaultOpen));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = controlled ? Boolean(options.open) : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean, anchor?: HTMLElement | null) => {
      if (!controlled) {
        setUncontrolledOpen(next);
      }
      if (next && anchor) {
        setAnchorEl(anchor);
      }
      if (!next) {
        setAnchorEl(null);
      }
      options.onOpenChange?.(next);
    },
    [controlled, options],
  );

  const openMenu = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      setOpen(true, event.currentTarget);
    },
    [setOpen],
  );

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const toggle = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (open) {
        setOpen(false);
      } else {
        setOpen(true, event.currentTarget);
      }
    },
    [open, setOpen],
  );

  return {
    open,
    close,
    toggle,
    openMenu,
    anchorEl,
    setAnchorEl,
    anchorProps: {
      onClick: toggle,
    },
  };
}
