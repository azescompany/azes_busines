/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/state/src/store/createStore.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Store factory, preferences, persistence unit tests
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it, vi } from 'vitest';

import { createMemoryStorageAdapter } from '../persistence/memoryStorage';
import {
  loadPersistedPreferences,
  persistPreferences,
} from '../persistence/loadPersistedPreferences';
import { PREFERENCES_PERSIST_KEY } from '../persistence/types';
import { selectThemePreference } from '../slices/preferences/selectors';
import { preferencesInitialState, setTheme } from '../slices/preferences/preferencesSlice';
import { createAzesStore } from './createStore';

describe('createAzesStore', () => {
  it('starts with preferences initial state', () => {
    const store = createAzesStore();
    expect(store.getState().preferences).toEqual(preferencesInitialState);
    expect(selectThemePreference(store.getState())).toBe('system');
  });

  it('dispatches typed actions and updates selectors', () => {
    const store = createAzesStore();
    store.dispatch(setTheme('dark'));
    expect(selectThemePreference(store.getState())).toBe('dark');
  });

  it('accepts preloaded preferences for hydration', () => {
    const store = createAzesStore({
      preloadedState: { preferences: { theme: 'light' } },
    });
    expect(selectThemePreference(store.getState())).toBe('light');
  });

  it('persists preferences through middleware when adapter is provided', async () => {
    const adapter = createMemoryStorageAdapter();
    const store = createAzesStore({ persistence: adapter });

    store.dispatch(setTheme('light'));

    await vi.waitFor(async () => {
      const raw = await adapter.getItem(PREFERENCES_PERSIST_KEY);
      expect(raw).toBe(JSON.stringify({ theme: 'light' }));
    });
  });
});

describe('persistence helpers', () => {
  it('loads valid persisted preferences', async () => {
    const adapter = createMemoryStorageAdapter({
      [PREFERENCES_PERSIST_KEY]: JSON.stringify({ theme: 'dark' }),
    });
    await expect(loadPersistedPreferences(adapter)).resolves.toEqual({ theme: 'dark' });
  });

  it('falls back on invalid payloads', async () => {
    const adapter = createMemoryStorageAdapter({
      [PREFERENCES_PERSIST_KEY]: '{not-json',
    });
    await expect(loadPersistedPreferences(adapter)).resolves.toEqual(preferencesInitialState);
  });

  it('writes preferences JSON', async () => {
    const adapter = createMemoryStorageAdapter();
    await persistPreferences(adapter, { theme: 'light' });
    expect(await adapter.getItem(PREFERENCES_PERSIST_KEY)).toBe(JSON.stringify({ theme: 'light' }));
  });
});

describe('state isolation', () => {
  it('does not include server/query cache keys on RootState', () => {
    const store = createAzesStore();
    const keys = Object.keys(store.getState());
    expect(keys).toEqual(['preferences']);
    expect(keys).not.toContain('queries');
    expect(keys).not.toContain('mutations');
    expect(keys).not.toContain('api');
  });
});
