/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/launcher/hooks/useAppsPrefs.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Favorites / recent / banner — separate from azes.settings.v1
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'azes.admin.apps.v1';
const RECENT_MAX = 8;

export type AppsPrefs = {
  version: 1;
  favorites: string[];
  recent: string[];
  dismissDemoBanner: boolean;
};

const DEFAULT_PREFS: AppsPrefs = {
  version: 1,
  favorites: [],
  recent: [],
  dismissDemoBanner: false,
};

function readPrefs(): AppsPrefs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw) as Partial<AppsPrefs>;
    return {
      version: 1,
      favorites: Array.isArray(parsed.favorites)
        ? parsed.favorites.filter((x): x is string => typeof x === 'string')
        : [],
      recent: Array.isArray(parsed.recent)
        ? parsed.recent.filter((x): x is string => typeof x === 'string')
        : [],
      dismissDemoBanner: Boolean(parsed.dismissDemoBanner),
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function writePrefs(next: AppsPrefs): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

export function useAppsPrefs() {
  const [prefs, setPrefs] = useState<AppsPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    setPrefs(readPrefs());
  }, []);

  const commit = useCallback((updater: (prev: AppsPrefs) => AppsPrefs) => {
    setPrefs((prev) => {
      const next = updater(prev);
      writePrefs(next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback(
    (moduleId: string) => {
      commit((prev) => {
        const has = prev.favorites.includes(moduleId);
        return {
          ...prev,
          favorites: has
            ? prev.favorites.filter((id) => id !== moduleId)
            : [...prev.favorites, moduleId],
        };
      });
    },
    [commit],
  );

  const pushRecent = useCallback(
    (moduleId: string) => {
      commit((prev) => {
        const next = [moduleId, ...prev.recent.filter((id) => id !== moduleId)].slice(
          0,
          RECENT_MAX,
        );
        return { ...prev, recent: next };
      });
    },
    [commit],
  );

  const dismissDemoBanner = useCallback(() => {
    commit((prev) => ({ ...prev, dismissDemoBanner: true }));
  }, [commit]);

  return {
    favorites: prefs.favorites,
    recent: prefs.recent,
    dismissDemoBanner: prefs.dismissDemoBanner,
    toggleFavorite,
    pushRecent,
    dismissDemoBannerAction: dismissDemoBanner,
  };
}
