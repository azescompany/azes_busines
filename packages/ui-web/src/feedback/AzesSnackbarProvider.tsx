/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/feedback/AzesSnackbarProvider.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Global MUI Snackbar host + queue (no notistack/sonner)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Alert from '@mui/material/Alert';
import Snackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from 'react';

import type {
  AzesSnackbarApi,
  AzesSnackbarItem,
  AzesSnackbarSeverity,
  AzesSnackbarShowInput,
} from './types';

const DEFAULT_AUTO_HIDE_MS = 4000;

const SnackbarApiContext = createContext<AzesSnackbarApi | null>(null);

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `azes-snack-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeInput(input: ReactNode | AzesSnackbarShowInput): AzesSnackbarItem {
  if (input !== null && typeof input === 'object' && !Array.isArray(input) && 'message' in input) {
    const value = input as AzesSnackbarShowInput;
    return {
      id: createId(),
      message: value.message,
      severity: value.severity ?? 'default',
      autoHideDuration:
        value.autoHideDuration === undefined ? DEFAULT_AUTO_HIDE_MS : value.autoHideDuration,
      action: value.action,
    };
  }
  return {
    id: createId(),
    message: input,
    severity: 'default',
    autoHideDuration: DEFAULT_AUTO_HIDE_MS,
  };
}

export type AzesSnackbarProviderProps = {
  children: ReactNode;
};

/**
 * App-wide snackbar queue. Mount once (included in `AzesUiProvider`).
 * Use `useAzesSnackbar()` from feature code — do not mount a second host.
 */
export function AzesSnackbarProvider({ children }: AzesSnackbarProviderProps) {
  const queueRef = useRef<AzesSnackbarItem[]>([]);
  const activeRef = useRef(false);
  const currentRef = useRef<AzesSnackbarItem | null>(null);
  const [current, setCurrent] = useState<AzesSnackbarItem | null>(null);
  const [open, setOpen] = useState(false);

  const present = useCallback((item: AzesSnackbarItem | null) => {
    currentRef.current = item;
    activeRef.current = Boolean(item);
    setCurrent(item);
    setOpen(Boolean(item));
  }, []);

  const presentNext = useCallback(() => {
    const next = queueRef.current.shift() ?? null;
    present(next);
  }, [present]);

  const enqueue = useCallback(
    (item: AzesSnackbarItem) => {
      if (!activeRef.current) {
        present(item);
        return item.id;
      }
      queueRef.current.push(item);
      return item.id;
    },
    [present],
  );

  const close = useCallback((id?: string) => {
    if (id && currentRef.current && currentRef.current.id !== id) {
      queueRef.current = queueRef.current.filter((item) => item.id !== id);
      return;
    }
    setOpen(false);
  }, []);

  const api = useMemo<AzesSnackbarApi>(() => {
    const show = (input: ReactNode | AzesSnackbarShowInput) => enqueue(normalizeInput(input));
    const withSeverity = (severity: AzesSnackbarSeverity) => (message: ReactNode) =>
      show({ message, severity });

    return {
      show,
      success: withSeverity('success'),
      info: withSeverity('info'),
      warning: withSeverity('warning'),
      error: withSeverity('error'),
      close,
    };
  }, [close, enqueue]);

  const handleClose = (_event: Event | SyntheticEvent, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleExited = () => {
    activeRef.current = false;
    currentRef.current = null;
    setCurrent(null);
    presentNext();
  };

  const alertSeverity = current && current.severity !== 'default' ? current.severity : null;

  return (
    <SnackbarApiContext.Provider value={api}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={current?.autoHideDuration ?? undefined}
        onClose={handleClose}
        // 0 exit keeps the queue reliable in jsdom and still feels snappy in apps.
        transitionDuration={{ enter: 225, exit: 0 }}
        slotProps={{ transition: { onExited: handleExited } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={alertSeverity || !current ? undefined : current.message}
      >
        {current && alertSeverity ? (
          <Alert
            severity={alertSeverity}
            variant="filled"
            onClose={() => close(current.id)}
            action={current.action}
            sx={{ width: '100%' }}
          >
            {current.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </SnackbarApiContext.Provider>
  );
}

/** Imperative global snackbar API (must be under `AzesSnackbarProvider` / `AzesUiProvider`). */
export function useAzesSnackbar(): AzesSnackbarApi {
  const api = useContext(SnackbarApiContext);
  if (!api) {
    throw new Error(
      'useAzesSnackbar must be used inside <AzesSnackbarProvider> or <AzesUiProvider>.',
    );
  }
  return api;
}

/** Same as `useAzesSnackbar`, but returns `null` outside a provider. */
export function useOptionalAzesSnackbar(): AzesSnackbarApi | null {
  return useContext(SnackbarApiContext);
}
