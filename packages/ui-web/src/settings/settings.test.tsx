/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/settings/settings.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-11
 * ║ Purpose: Settings parsing, migration, persistence, cross-tab sync and re-render scope
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { fontFamilyPresets } from '@azes/design-tokens';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Profiler } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AZES_PRIMARY_STORAGE_KEY, brandSeeds } from '../theme/brand';
import { AZES_FONT_PRESET_IDS } from '../theme/createAzesTheme';
import { AzesSettingsDrawer } from './AzesSettingsDrawer';
import {
  AzesSettingsProvider,
  AzesUiProvider,
  useAzesSettings,
  useAzesSettingsActions,
  useIsSettingsControlVisible,
} from './AzesSettingsProvider';
import { migrateAzesSettings, parseAzesSettings } from './parse';
import { createAzesSettingsStore } from './store';
import { configureAzesPrefsScope } from '../theme/crossPortStorage';
import { AZES_SETTINGS_COOKIE, AZES_SETTINGS_STORAGE_KEY, DEFAULT_AZES_SETTINGS } from './types';

function clearPrefsCookies(): void {
  for (const name of [
    AZES_SETTINGS_STORAGE_KEY,
    AZES_SETTINGS_COOKIE,
    AZES_PRIMARY_STORAGE_KEY,
    'azes-mode',
    'azes-color-scheme',
  ]) {
    document.cookie = `${name}=;path=/;max-age=0`;
  }
}

const FONT_OPTION_LABELS = {
  inter: 'Inter',
  sourceSerif: 'Source Serif',
  nunito: 'Nunito',
  ibmPlexSans: 'IBM Plex Sans',
  fraunces: 'Fraunces',
} as const;

beforeEach(() => {
  configureAzesPrefsScope(null);
  window.localStorage.clear();
  clearPrefsCookies();
});
afterEach(() => {
  configureAzesPrefsScope(null);
  window.localStorage.clear();
  clearPrefsCookies();
});

describe('parseAzesSettings', () => {
  it('returns defaults for missing or corrupted storage', () => {
    expect(parseAzesSettings(null)).toEqual(DEFAULT_AZES_SETTINGS);
    expect(parseAzesSettings('{not json')).toEqual(DEFAULT_AZES_SETTINGS);
    expect(parseAzesSettings('[1,2]')).toEqual(DEFAULT_AZES_SETTINGS);
  });

  it('keeps valid fields and migrates legacy font presets', () => {
    const parsed = parseAzesSettings(
      JSON.stringify({
        version: 1,
        navLayout: 'mini',
        density: 'huge',
        primary: '#FFF59D',
        fontFamily: 'default',
      }),
    );
    expect(parsed.navLayout).toBe('mini');
    expect(parsed.fontFamily).toBe('inter');
    expect(parsed.density).toBe(DEFAULT_AZES_SETTINGS.density);
    expect(parsed.primary).toBe(DEFAULT_AZES_SETTINGS.primary);
  });

  it('migrates the unversioned compactLayout shape', () => {
    expect(migrateAzesSettings({ compactLayout: true })).toMatchObject({
      density: 'compact',
      version: 1,
    });
    expect(parseAzesSettings(JSON.stringify({ compactLayout: true })).density).toBe('compact');
  });
});

describe('createAzesSettingsStore', () => {
  it('persists changes and mirrors primary to the legacy key', () => {
    const store = createAzesSettingsStore();
    store.set({ navLayout: 'horizontal', primary: 'violet' });
    expect(store.getState().navLayout).toBe('horizontal');
    const stored = JSON.parse(window.localStorage.getItem(AZES_SETTINGS_STORAGE_KEY) ?? '{}');
    expect(stored).toMatchObject({ navLayout: 'horizontal', primary: 'violet', version: 1 });
    expect(window.localStorage.getItem(AZES_PRIMARY_STORAGE_KEY)).toBe(brandSeeds.violet);
  });

  it('reads the legacy primary key once when no settings are stored', () => {
    window.localStorage.setItem(AZES_PRIMARY_STORAGE_KEY, brandSeeds.rose);
    expect(createAzesSettingsStore().getState().primary).toBe(brandSeeds.rose);
  });

  it('ignores invalid patches and keeps the same state object', () => {
    const store = createAzesSettingsStore();
    const before = store.getState();
    store.set({ density: 'huge' as never, primary: '#FFF59D' });
    expect(store.getState()).toBe(before);
  });

  it('applies locked values, defaults and reset', () => {
    const store = createAzesSettingsStore({
      defaults: { container: 'fixed' },
      locked: { navLayout: 'mini' },
    });
    expect(store.getState()).toMatchObject({ container: 'fixed', navLayout: 'mini' });
    store.set({ navLayout: 'vertical', density: 'compact' });
    expect(store.getState()).toMatchObject({ navLayout: 'mini', density: 'compact' });
    store.reset();
    expect(store.getState().density).toBe('comfortable');
    expect(store.lockedKeys).toEqual(['navLayout']);
  });

  it('does not touch storage in none mode', () => {
    const store = createAzesSettingsStore({ storage: 'none' });
    store.set({ density: 'compact' });
    expect(window.localStorage.getItem(AZES_SETTINGS_STORAGE_KEY)).toBeNull();
  });

  it('re-hydrates on a storage event from another tab', () => {
    const store = createAzesSettingsStore();
    const disconnect = store.connect();
    window.localStorage.setItem(
      AZES_SETTINGS_STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_AZES_SETTINGS, density: 'compact' }),
    );
    window.dispatchEvent(new StorageEvent('storage', { key: AZES_SETTINGS_STORAGE_KEY }));
    expect(store.getState().density).toBe('compact');
    disconnect();
  });
});

describe('AzesSettingsProvider', () => {
  it('re-renders only components that select the changed key', () => {
    const renders = { nav: 0, density: 0 };
    const store = createAzesSettingsStore({ storage: 'none' });

    function NavReader() {
      const navLayout = useAzesSettings((s) => s.navLayout);
      return <span>{navLayout}</span>;
    }
    function DensityReader() {
      const density = useAzesSettings((s) => s.density);
      return <span>{density}</span>;
    }

    render(
      <AzesSettingsProvider store={store}>
        <Profiler id="nav" onRender={() => (renders.nav += 1)}>
          <NavReader />
        </Profiler>
        <Profiler id="density" onRender={() => (renders.density += 1)}>
          <DensityReader />
        </Profiler>
      </AzesSettingsProvider>,
    );
    const baseline = { ...renders };

    act(() => store.set({ density: 'compact' }));

    expect(screen.getByText('compact')).toBeInTheDocument();
    expect(renders.density).toBe(baseline.density + 1);
    expect(renders.nav).toBe(baseline.nav);
  });

  it('drawer writes settings, hides direction/navLayout and selects primary seeds', () => {
    const store = createAzesSettingsStore({ storage: 'none' });
    render(
      <AzesUiProvider store={store}>
        <AzesSettingsDrawer open onClose={() => undefined} />
      </AzesUiProvider>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Settings' });
    expect(within(dialog).queryByRole('group', { name: 'Direction' })).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole('group', { name: 'Navigation layout' }),
    ).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('textbox', { name: 'Custom hex' })).not.toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('radio', { name: 'violet' }));
    expect(store.getState().primary).toBe('violet');
    expect(within(dialog).getByRole('radio', { name: 'violet' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    const fontGroup = within(dialog).getByRole('radiogroup', { name: 'Font' });
    for (const preset of AZES_FONT_PRESET_IDS) {
      const radio = within(fontGroup).getByRole('radio', { name: FONT_OPTION_LABELS[preset] });
      expect(radio).toBeInTheDocument();
      expect(radio).toHaveStyle({ fontFamily: fontFamilyPresets[preset] });
    }

    fireEvent.click(within(dialog).getByRole('radio', { name: 'Compact' }));
    expect(store.getState().density).toBe('compact');

    fireEvent.click(within(fontGroup).getByRole('radio', { name: 'Fraunces' }));
    expect(store.getState().fontFamily).toBe('fraunces');
    expect(store.getState().primary).toBe('violet');
    expect(store.getState().density).toBe('compact');
    expect(within(fontGroup).getByRole('radio', { name: 'Fraunces' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(within(fontGroup).getByRole('radio', { name: 'Fraunces' })).toHaveAttribute(
      'tabindex',
      '0',
    );

    fireEvent.click(within(fontGroup).getByRole('radio', { name: 'Source Serif' }));
    expect(store.getState().fontFamily).toBe('sourceSerif');
    expect(store.getState().primary).toBe('violet');

    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Reset settings' })[0]!);
    expect(store.getState().navLayout).toBe('horizontal');
    expect(store.getState().primary).toBe(DEFAULT_AZES_SETTINGS.primary);
    expect(store.getState().fontFamily).toBe('inter');
  }, 20_000);

  it('persists and restores a selected font preset', () => {
    const store = createAzesSettingsStore();
    act(() => {
      store.set({ fontFamily: 'sourceSerif', density: 'compact' });
    });
    expect(JSON.parse(localStorage.getItem(AZES_SETTINGS_STORAGE_KEY)!).fontFamily).toBe(
      'sourceSerif',
    );

    const restored = createAzesSettingsStore();
    expect(restored.getState().fontFamily).toBe('sourceSerif');
    expect(restored.getState().density).toBe('compact');
  });

  it('exposes actions and hides locked and default-hidden controls', () => {
    function Probe() {
      const actions = useAzesSettingsActions();
      const navVisible = useIsSettingsControlVisible('navLayout');
      const directionVisible = useIsSettingsControlVisible('direction');
      const densityVisible = useIsSettingsControlVisible('density');
      return (
        <button type="button" onClick={() => actions.set({ density: 'compact' })}>
          {`${navVisible}-${directionVisible}-${densityVisible}`}
        </button>
      );
    }
    render(
      <AzesSettingsProvider storage="none" locked={{ navLayout: 'mini' }}>
        <Probe />
      </AzesSettingsProvider>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('false-false-true');
  });
});
