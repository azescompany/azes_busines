/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/side-panel/AzesSidePanel.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Declarative panel that portals body/footer into the host
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useEffect, useLayoutEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useSidePanelApi, useSidePanelPortal } from './AzesSidePanelProvider';
import type { AzesSidePanelId, AzesSidePanelWidth } from './registry';

export type AzesSidePanelProps = {
  id: AzesSidePanelId;
  title: ReactNode;
  subtitle?: ReactNode;
  width?: AzesSidePanelWidth;
  footer?: ReactNode;
  isDirty?: boolean;
  /** Called after the panel is dismissed (Esc/backdrop/close/switch). */
  onClose?: () => void;
  /**
   * When true, keep children mounted while inactive (hidden). Default false —
   * inactive panels render nothing.
   */
  keepMounted?: boolean;
  children: ReactNode;
};

export function AzesSidePanel({
  id,
  title,
  subtitle,
  width = 'md',
  footer,
  isDirty = false,
  onClose,
  keepMounted = false,
  children,
}: AzesSidePanelProps) {
  const api = useSidePanelApi();
  const portal = useSidePanelPortal();
  const isActive = api.activeId === id;
  const { register, unregister } = api;

  useLayoutEffect(() => {
    register({
      id,
      title,
      subtitle,
      width,
      isDirty,
      onCloseRequest: onClose,
    });
  }, [register, id, title, subtitle, width, isDirty, onClose]);

  useEffect(() => {
    return () => {
      unregister(id);
    };
  }, [unregister, id]);

  if (!isActive && !keepMounted) {
    return null;
  }

  const show = isActive;
  const body =
    show && portal.bodyEl ? (
      createPortal(children, portal.bodyEl)
    ) : keepMounted ? (
      <div hidden={!show} aria-hidden={!show}>
        {children}
      </div>
    ) : null;

  const footerNode =
    show && portal.footerEl && footer != null ? createPortal(footer, portal.footerEl) : null;

  return (
    <>
      {body}
      {footerNode}
    </>
  );
}
