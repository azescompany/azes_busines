/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/dialog/AzesDialogProvider.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Context queue host for promise-based AzesDialog API
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { AzesDialogHost } from './AzesDialogHost';
import { createDialogId, resolveDialogOptions, type ResolvedDialogOptions } from './defaults';
import { registerDialogBridge } from './dialogBridge';
import {
  DEFAULT_AZES_DIALOG_LABELS,
  type AzesConfirmDialogOptions,
  type AzesDangerDialogOptions,
  type AzesDialogApi,
  type AzesDialogLabels,
  type AzesDialogOptions,
  type AzesNotifyDialogOptions,
  type QueuedDialogEntry,
} from './types';

const DialogApiContext = createContext<AzesDialogApi | null>(null);

type ActiveDialog = {
  id: string;
  options: AzesDialogOptions;
  resolved: ResolvedDialogOptions;
  resolve: (value: boolean) => void;
};

export type AzesDialogProviderProps = {
  children: ReactNode;
  /** App i18n labels for default buttons / status text. */
  labels?: Partial<AzesDialogLabels>;
  /**
   * When true (default), dismiss active + queued dialogs as cancel on
   * `hashchange` / `popstate` (SPA route changes).
   */
  closeOnRouteChange?: boolean;
};

/**
 * App-wide dialog queue. Mount once (included in `AzesUiProvider`).
 * Use `useAzesDialog()` from feature code — do not mount a second host.
 */
export function AzesDialogProvider({
  children,
  labels: labelsProp,
  closeOnRouteChange = true,
}: AzesDialogProviderProps) {
  const labels = useMemo<AzesDialogLabels>(
    () => ({ ...DEFAULT_AZES_DIALOG_LABELS, ...labelsProp }),
    [labelsProp],
  );

  const queueRef = useRef<QueuedDialogEntry[]>([]);
  const activeRef = useRef<ActiveDialog | null>(null);
  const confirmingRef = useRef(false);
  const [active, setActive] = useState<ActiveDialog | null>(null);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const present = useCallback(
    (entry: QueuedDialogEntry | null) => {
      if (!entry) {
        activeRef.current = null;
        setActive(null);
        setOpen(false);
        setConfirming(false);
        confirmingRef.current = false;
        setErrorMessage(null);
        return;
      }
      const next: ActiveDialog = {
        id: entry.id,
        options: entry.options,
        resolved: resolveDialogOptions(entry.options, labels),
        resolve: entry.resolve,
      };
      activeRef.current = next;
      setActive(next);
      setOpen(true);
      setConfirming(false);
      confirmingRef.current = false;
      setErrorMessage(null);
    },
    [labels],
  );

  const presentNext = useCallback(() => {
    const next = queueRef.current.shift() ?? null;
    present(next);
  }, [present]);

  const settleActive = useCallback(
    (value: boolean) => {
      const current = activeRef.current;
      if (!current) return;
      // Clear before resolve so nested open() during resolve enqueues cleanly.
      activeRef.current = null;
      setOpen(false);
      setConfirming(false);
      confirmingRef.current = false;
      setErrorMessage(null);
      current.resolve(value);
      // Defer next so MUI exit transition can start; still one-at-a-time.
      window.setTimeout(() => {
        if (!activeRef.current) {
          presentNext();
        }
      }, 0);
    },
    [presentNext],
  );

  const enqueue = useCallback(
    (options: AzesDialogOptions): Promise<boolean> =>
      new Promise<boolean>((resolve) => {
        const entry: QueuedDialogEntry = {
          id: createDialogId(),
          options,
          resolve,
        };
        if (!activeRef.current) {
          present(entry);
          return;
        }
        queueRef.current.push(entry);
      }),
    [present],
  );

  const close = useCallback(() => {
    if (confirmingRef.current) return;
    if (!activeRef.current) {
      // Reject any queued items as cancel.
      const pending = queueRef.current.splice(0);
      for (const item of pending) {
        item.resolve(false);
      }
      return;
    }
    settleActive(false);
  }, [settleActive]);

  const handleConfirm = useCallback(() => {
    const current = activeRef.current;
    if (!current || confirmingRef.current) return;

    const onConfirm = current.resolved.onConfirm;
    if (!onConfirm) {
      settleActive(true);
      return;
    }

    setConfirming(true);
    confirmingRef.current = true;
    setErrorMessage(null);

    void (async () => {
      try {
        await onConfirm();
        // Only settle if this dialog is still active (race-safe).
        if (activeRef.current?.id === current.id) {
          settleActive(true);
        }
      } catch (err) {
        if (activeRef.current?.id !== current.id) return;
        const message = err instanceof Error && err.message ? err.message : labels.errorOccurred;
        setErrorMessage(message);
        setConfirming(false);
        confirmingRef.current = false;
      }
    })();
  }, [labels.errorOccurred, settleActive]);

  const api = useMemo<AzesDialogApi>(
    () => ({
      confirm: (options: AzesConfirmDialogOptions) =>
        enqueue({ ...options, variant: options.variant ?? 'confirm' }),
      danger: (options: AzesDangerDialogOptions) => enqueue({ ...options, variant: 'danger' }),
      notify: async (options: AzesNotifyDialogOptions) => {
        await enqueue({
          ...options,
          variant: options.variant ?? 'info',
          hideCancel: true,
        });
      },
      open: (options: AzesDialogOptions) => enqueue(options),
      close,
    }),
    [close, enqueue],
  );

  useLayoutEffect(() => {
    registerDialogBridge({
      open: (options) => enqueue(options),
      close,
    });
    return () => {
      registerDialogBridge({ open: null, close: null });
      const pending = queueRef.current.splice(0);
      const current = activeRef.current;
      activeRef.current = null;
      if (current) {
        current.resolve(false);
      }
      for (const item of pending) {
        item.resolve(false);
      }
    };
  }, [close, enqueue]);

  useEffect(() => {
    if (!closeOnRouteChange || typeof window === 'undefined') return;

    const onRoute = () => {
      close();
    };
    window.addEventListener('hashchange', onRoute);
    window.addEventListener('popstate', onRoute);
    return () => {
      window.removeEventListener('hashchange', onRoute);
      window.removeEventListener('popstate', onRoute);
    };
  }, [close, closeOnRouteChange]);

  // Re-resolve default labels when app i18n labels change while a dialog is open.
  useEffect(() => {
    const current = activeRef.current;
    if (!current) return;
    const next: ActiveDialog = {
      ...current,
      resolved: resolveDialogOptions(current.options, labels),
    };
    activeRef.current = next;
    setActive(next);
  }, [labels]);

  return (
    <DialogApiContext.Provider value={api}>
      {children}
      <AzesDialogHost
        open={open}
        options={active?.resolved ?? null}
        labels={labels}
        confirming={confirming}
        errorMessage={errorMessage}
        onCancel={close}
        onConfirm={handleConfirm}
      />
    </DialogApiContext.Provider>
  );
}

/** Imperative global dialog API (must be under `AzesDialogProvider` / `AzesUiProvider`). */
export function useAzesDialog(): AzesDialogApi {
  const api = useContext(DialogApiContext);
  if (!api) {
    throw new Error('useAzesDialog must be used inside <AzesDialogProvider> or <AzesUiProvider>.');
  }
  return api;
}

/** Optional variant for library code that may render outside the provider. */
export function useOptionalAzesDialog(): AzesDialogApi | null {
  return useContext(DialogApiContext);
}
