/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/settings/AzesSettingsProvider.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-15
 * ║ Purpose: Settings context + AzesUiProvider (optional prefsScope isolation)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import { AzesDialogProvider, type AzesDialogProviderProps } from '../dialog/AzesDialogProvider';
import type { AzesDialogLabels } from '../dialog/types';
import { AzesSnackbarProvider } from '../feedback/AzesSnackbarProvider';
import {
  AzesSidePanelProvider,
  type AzesSidePanelProviderProps,
} from '../side-panel/AzesSidePanelProvider';
import { applyAzesFavicon } from '../theme/azesFavicon';
import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { resolveBrandPrimary } from '../theme/brand';
import { loadAzesFont } from '../theme/loadAzesFont';
import {
  createAzesSettingsStore,
  type AzesSettingsStore,
  type AzesSettingsStoreOptions,
} from './store';
import {
  DEFAULT_HIDDEN_SETTINGS_CONTROLS,
  type AzesSettings,
  type AzesSettingsKey,
  type AzesSettingsPatch,
} from './types';

type SettingsContextValue = {
  store: AzesSettingsStore;
  hiddenControls: ReadonlySet<AzesSettingsKey>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export type AzesSettingsProviderProps = AzesSettingsStoreOptions & {
  /** Drawer controls to hide. Locked keys are always hidden. Default: `['direction']`. */
  hiddenControls?: readonly AzesSettingsKey[];
  /** Inject a store (tests, multiple providers sharing one store). */
  store?: AzesSettingsStore;
  children: ReactNode;
};

export function AzesSettingsProvider({
  hiddenControls = DEFAULT_HIDDEN_SETTINGS_CONTROLS,
  store: injectedStore,
  children,
  ...options
}: AzesSettingsProviderProps) {
  // Options are read once; a new store per render would drop user changes.
  const [store] = useState(() => injectedStore ?? createAzesSettingsStore(options));

  useEffect(() => store.connect(), [store]);

  const hiddenKey = hiddenControls.join(',');
  const value = useMemo<SettingsContextValue>(
    () => ({
      store,
      hiddenControls: new Set<AzesSettingsKey>([
        ...(hiddenKey ? (hiddenKey.split(',') as AzesSettingsKey[]) : []),
        ...(store.lockedKeys as AzesSettingsKey[]),
      ]),
    }),
    [store, hiddenKey],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

function useSettingsContext(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error(
      'Azes settings hooks must be used inside <AzesSettingsProvider> or <AzesUiProvider>.',
    );
  }
  return context;
}

/**
 * Read one settings slice. The component re-renders only when the selected value changes, so
 * select primitives (`(s) => s.navLayout`), not new objects.
 */
export function useAzesSettings<T>(selector: (settings: AzesSettings) => T): T {
  const { store } = useSettingsContext();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getServerState()),
  );
}

/** Like `useAzesSettings`, but returns `undefined` outside a provider instead of throwing. */
export function useOptionalAzesSettings<T>(selector: (settings: AzesSettings) => T): T | undefined {
  const context = useContext(SettingsContext);
  const store = context?.store;
  return useSyncExternalStore(
    store?.subscribe ?? noopSubscribe,
    () => (store ? selector(store.getState()) : undefined),
    () => (store ? selector(store.getServerState()) : undefined),
  );
}

const noopSubscribe = () => () => undefined;

export type AzesSettingsActions = {
  set: (patch: AzesSettingsPatch) => void;
  reset: () => void;
};

/** Stable actions. Never causes a re-render. */
export function useAzesSettingsActions(): AzesSettingsActions {
  const { store } = useSettingsContext();
  return useMemo(() => ({ set: store.set, reset: store.reset }), [store]);
}

/** Like `useAzesSettingsActions`, but returns `null` outside a provider. */
export function useOptionalAzesSettingsActions(): AzesSettingsActions | null {
  const store = useContext(SettingsContext)?.store;
  return useMemo(() => (store ? { set: store.set, reset: store.reset } : null), [store]);
}

/** True when a drawer control should be rendered for `key`. */
export function useIsSettingsControlVisible(key: AzesSettingsKey): boolean {
  return !useSettingsContext().hiddenControls.has(key);
}

export type AzesUiProviderProps = AzesSettingsProviderProps & {
  /** Fixed secondary override. Default: derived from primary. */
  secondary?: string;
  /** When true (default), tint canvas/paper toward the primary hue. */
  tintSurfaces?: boolean;
  /**
   * Style cookie/storage namespace. Marketplace uses `caspian` so prefs do not
   * sync with account/admin/agent-site (shared unscoped keys). Auth untouched.
   */
  prefsScope?: string | null;
  /** Default dialog button / status labels (usually from app i18n). */
  dialogLabels?: Partial<AzesDialogLabels>;
  /** Forwarded to `AzesDialogProvider` (default true). */
  dialogCloseOnRouteChange?: AzesDialogProviderProps['closeOnRouteChange'];
  /** Dirty-guard labels for side panels. */
  sidePanelDiscardLabels?: AzesSidePanelProviderProps['discardLabels'];
  /** Side panel host chrome labels (close). */
  sidePanelHostLabels?: AzesSidePanelProviderProps['hostLabels'];
};

function SettingsThemeBridge({
  secondary,
  tintSurfaces,
  children,
}: {
  secondary?: string;
  tintSurfaces?: boolean;
  children: ReactNode;
}) {
  const primary = useAzesSettings((s) => s.primary);
  const density = useAzesSettings((s) => s.density);
  const fontFamily = useAzesSettings((s) => s.fontFamily);
  const direction = useAzesSettings((s) => s.direction);

  useEffect(() => {
    document.documentElement.setAttribute('dir', direction);
  }, [direction]);

  useEffect(() => {
    void loadAzesFont(fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    applyAzesFavicon(resolveBrandPrimary(primary));
  }, [primary]);

  return (
    <AzesThemeProvider
      primary={primary}
      secondary={secondary}
      density={density}
      fontFamily={fontFamily}
      direction={direction}
      tintSurfaces={tintSurfaces}
    >
      {children}
    </AzesThemeProvider>
  );
}

/** Settings store + theme + snackbar + dialog + side panel. Recommended root provider. */
export function AzesUiProvider({
  secondary,
  tintSurfaces,
  prefsScope,
  dialogLabels,
  dialogCloseOnRouteChange,
  sidePanelDiscardLabels,
  sidePanelHostLabels,
  children,
  ...settingsProps
}: AzesUiProviderProps) {
  return (
    <AzesSettingsProvider {...settingsProps} prefsScope={prefsScope}>
      <SettingsThemeBridge secondary={secondary} tintSurfaces={tintSurfaces}>
        <AzesSnackbarProvider>
          <AzesDialogProvider labels={dialogLabels} closeOnRouteChange={dialogCloseOnRouteChange}>
            <AzesSidePanelProvider
              discardLabels={sidePanelDiscardLabels}
              hostLabels={sidePanelHostLabels}
            >
              {children}
            </AzesSidePanelProvider>
          </AzesDialogProvider>
        </AzesSnackbarProvider>
      </SettingsThemeBridge>
    </AzesSettingsProvider>
  );
}
