/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/side-panel/AzesSidePanelProvider.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Context state for one-at-a-time AzesSidePanel host
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useOptionalAzesDialog } from '../dialog/AzesDialogProvider';
import { AzesSidePanelHost } from './AzesSidePanelHost';
import type { AzesSidePanelId } from './registry';
import {
  DEFAULT_AZES_SIDE_PANEL_DISCARD_LABELS,
  DEFAULT_AZES_SIDE_PANEL_HOST_LABELS,
  type AzesSidePanelApi,
  type AzesSidePanelCloseOptions,
  type AzesSidePanelDiscardLabels,
  type AzesSidePanelHostLabels,
  type AzesSidePanelRegistration,
} from './types';

const SidePanelApiContext = createContext<AzesSidePanelApi | null>(null);
const SidePanelHostLabelsContext = createContext<AzesSidePanelHostLabels>(
  DEFAULT_AZES_SIDE_PANEL_HOST_LABELS,
);
const SidePanelPortalContext = createContext<{
  bodyEl: HTMLElement | null;
  footerEl: HTMLElement | null;
  setBodyEl: (el: HTMLElement | null) => void;
  setFooterEl: (el: HTMLElement | null) => void;
} | null>(null);

export type AzesSidePanelProviderProps = {
  children: ReactNode;
  /** Labels for dirty-guard confirm when switching/closing panels. */
  discardLabels?: Partial<AzesSidePanelDiscardLabels>;
  /** Host chrome labels (close button). */
  hostLabels?: Partial<AzesSidePanelHostLabels>;
  /** When false, skip mounting the drawer host (tests that only need the API). Default true. */
  mountHost?: boolean;
};

export function AzesSidePanelProvider({
  children,
  discardLabels: discardLabelsProp,
  hostLabels: hostLabelsProp,
  mountHost = true,
}: AzesSidePanelProviderProps) {
  const dialog = useOptionalAzesDialog();
  const discardLabels = useMemo(
    () => ({ ...DEFAULT_AZES_SIDE_PANEL_DISCARD_LABELS, ...discardLabelsProp }),
    [discardLabelsProp],
  );
  const hostLabels = useMemo(
    () => ({ ...DEFAULT_AZES_SIDE_PANEL_HOST_LABELS, ...hostLabelsProp }),
    [hostLabelsProp],
  );

  const registrationsRef = useRef(new Map<AzesSidePanelId, AzesSidePanelRegistration>());
  const [activeId, setActiveId] = useState<AzesSidePanelId | null>(null);
  const [bodyEl, setBodyEl] = useState<HTMLElement | null>(null);
  const [footerEl, setFooterEl] = useState<HTMLElement | null>(null);
  const [, bump] = useState(0);

  const getRegistration = useCallback(
    (id: AzesSidePanelId) => registrationsRef.current.get(id),
    [],
  );

  const confirmDiscardIfNeeded = useCallback(
    async (id: AzesSidePanelId | null): Promise<boolean> => {
      if (!id) return true;
      const reg = registrationsRef.current.get(id);
      if (!reg?.isDirty) return true;
      if (!dialog) return true;
      return dialog.confirm({
        title: discardLabels.title,
        description: discardLabels.description,
        confirmLabel: discardLabels.confirm,
        cancelLabel: discardLabels.cancel,
      });
    },
    [dialog, discardLabels],
  );

  const close = useCallback(
    async (options?: AzesSidePanelCloseOptions) => {
      const current = activeId;
      if (!current) return;
      if (!options?.discard) {
        const ok = await confirmDiscardIfNeeded(current);
        if (!ok) return;
      }
      registrationsRef.current.get(current)?.onCloseRequest?.();
      setActiveId(null);
    },
    [activeId, confirmDiscardIfNeeded],
  );

  const open = useCallback(
    async (id: AzesSidePanelId) => {
      if (activeId === id) return;
      if (activeId) {
        const ok = await confirmDiscardIfNeeded(activeId);
        if (!ok) return;
        registrationsRef.current.get(activeId)?.onCloseRequest?.();
      }
      setActiveId(id);
    },
    [activeId, confirmDiscardIfNeeded],
  );

  const toggle = useCallback(
    async (id: AzesSidePanelId) => {
      if (activeId === id) {
        await close();
        return;
      }
      await open(id);
    },
    [activeId, close, open],
  );

  const register = useCallback((registration: AzesSidePanelRegistration) => {
    registrationsRef.current.set(registration.id, registration);
    bump((n) => n + 1);
  }, []);

  const unregister = useCallback((id: AzesSidePanelId) => {
    registrationsRef.current.delete(id);
    setActiveId((current) => (current === id ? null : current));
    bump((n) => n + 1);
  }, []);

  const api = useMemo<AzesSidePanelApi>(
    () => ({
      activeId,
      open,
      close,
      closeAll: close,
      toggle,
      register,
      unregister,
      getRegistration,
    }),
    [activeId, close, getRegistration, open, register, toggle, unregister],
  );

  const portal = useMemo(() => ({ bodyEl, footerEl, setBodyEl, setFooterEl }), [bodyEl, footerEl]);

  return (
    <SidePanelApiContext.Provider value={api}>
      <SidePanelPortalContext.Provider value={portal}>
        <SidePanelHostLabelsContext.Provider value={hostLabels}>
          {children}
          {mountHost ? <AzesSidePanelHost /> : null}
        </SidePanelHostLabelsContext.Provider>
      </SidePanelPortalContext.Provider>
    </SidePanelApiContext.Provider>
  );
}

export function useSidePanelState(): Pick<
  AzesSidePanelApi,
  'activeId' | 'close' | 'closeAll' | 'open' | 'toggle'
> {
  const api = useContext(SidePanelApiContext);
  if (!api) {
    throw new Error(
      'useSidePanelState must be used inside <AzesSidePanelProvider> or <AzesUiProvider>.',
    );
  }
  return {
    activeId: api.activeId,
    open: api.open,
    close: api.close,
    closeAll: api.closeAll,
    toggle: api.toggle,
  };
}

export function useSidePanel(id: AzesSidePanelId): {
  isOpen: boolean;
  open: () => Promise<void>;
  close: (options?: AzesSidePanelCloseOptions) => Promise<void>;
  toggle: () => Promise<void>;
} {
  const api = useContext(SidePanelApiContext);
  if (!api) {
    throw new Error(
      'useSidePanel must be used inside <AzesSidePanelProvider> or <AzesUiProvider>.',
    );
  }
  return {
    isOpen: api.activeId === id,
    open: () => api.open(id),
    close: (options) => api.close(options),
    toggle: () => api.toggle(id),
  };
}

/** Internal: full API for Host / AzesSidePanel. */
export function useSidePanelApi(): AzesSidePanelApi {
  const api = useContext(SidePanelApiContext);
  if (!api) {
    throw new Error('Side panel internals require <AzesSidePanelProvider> or <AzesUiProvider>.');
  }
  return api;
}

export function useSidePanelPortal() {
  const portal = useContext(SidePanelPortalContext);
  if (!portal) {
    throw new Error('Side panel portal requires <AzesSidePanelProvider> or <AzesUiProvider>.');
  }
  return portal;
}

export function useSidePanelHostLabels(): AzesSidePanelHostLabels {
  return useContext(SidePanelHostLabelsContext);
}

export function useOptionalSidePanelApi(): AzesSidePanelApi | null {
  return useContext(SidePanelApiContext);
}
