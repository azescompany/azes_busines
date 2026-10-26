/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/crossPortStorage.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-15
 * ║ Purpose: Cookie + localStorage bridge; optional prefsScope isolation
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

/**
 * Cookies are port-agnostic on the same host (`localhost:5173` ↔ `:5174`) and,
 * with `Domain=`, across prod subdomains (account.* ↔ admin.*).
 * localStorage is origin/port-scoped — cookie is the cross-app source of truth.
 *
 * Compact `azes-ui` (`1|<primary>|<mode>`) is the primary↔mode bridge.
 *
 * Optional `prefsScope` (e.g. `caspian`) namespaces style keys only
 * (`azes-ui.caspian`) so marketplace prefs stay isolated from account/admin/
 * agent-site which keep the shared unscoped names. Auth cookies are untouched.
 */

export type AzesPrefsCookieOptions = {
  /** Optional shared parent domain (e.g. `.example.com`). Omit on localhost. */
  domain?: string;
};

/** Lowercase kebab id for style-pref namespacing (`caspian`, `agent-site`, …). */
const PREFS_SCOPE_ID_RE = /^[a-z][a-z0-9-]{0,31}$/;

let prefsCookieDomain: string | undefined;
/** `null` = shared account↔admin↔agent-site keys (default). */
let prefsScopeId: string | null = null;

/** Call once from apps that share auth cookie domain across account/admin. */
export function configureAzesPrefsCookie(options: AzesPrefsCookieOptions = {}): void {
  prefsCookieDomain = options.domain?.trim() || undefined;
}

/**
 * Namespace style preference cookies/localStorage for one product shell.
 * Pass `null`/`undefined`/`` to use shared unscoped keys (default).
 */
export function configureAzesPrefsScope(scopeId?: string | null): void {
  const raw = scopeId?.trim().toLowerCase() ?? '';
  if (!raw) {
    prefsScopeId = null;
    return;
  }
  if (!PREFS_SCOPE_ID_RE.test(raw)) {
    prefsScopeId = null;
    return;
  }
  prefsScopeId = raw;
}

export function getAzesPrefsScope(): string | null {
  return prefsScopeId;
}

/**
 * Map a canonical style key to the active scope (`azes-ui` → `azes-ui.caspian`).
 * Pure helper also usable from SSR with an explicit `scopeId`.
 */
export function azesPrefsKey(
  base: string,
  scopeId: string | null | undefined = prefsScopeId,
): string {
  const scope = scopeId?.trim().toLowerCase() || null;
  if (!scope || !PREFS_SCOPE_ID_RE.test(scope)) return base;
  return `${base}.${scope}`;
}

export function readDocumentCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(prefix)) continue;
    const raw = trimmed.slice(prefix.length);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

export function writeDocumentCookie(name: string, value: string, maxAgeSeconds = 31_536_000): void {
  if (typeof document === 'undefined') return;
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'path=/',
    `max-age=${maxAgeSeconds}`,
    'SameSite=Lax',
  ];
  if (prefsCookieDomain) {
    parts.push(`Domain=${prefsCookieDomain}`);
  }
  if (typeof location !== 'undefined' && location.protocol === 'https:') {
    parts.push('Secure');
  }
  document.cookie = parts.join(';');
}

function readLocal(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // private mode / quota
  }
}

/**
 * Read preference: cookie wins (shared across ports/subdomains), then localStorage.
 * When cookie differs from local, seed local so MUI / same-origin tabs match.
 */
export function readCrossPortPref(key: string): string | null {
  if (typeof window === 'undefined') return null;
  const fromCookie = readDocumentCookie(key);
  if (fromCookie != null && fromCookie !== '') {
    const fromLocal = readLocal(window.localStorage, key);
    if (fromLocal !== fromCookie) {
      writeLocal(window.localStorage, key, fromCookie);
    }
    return fromCookie;
  }
  const fromLocal = readLocal(window.localStorage, key);
  return fromLocal != null && fromLocal !== '' ? fromLocal : null;
}

/** Write preference to localStorage and cookie (cross-port). */
export function writeCrossPortPref(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  writeLocal(window.localStorage, key, value);
  writeDocumentCookie(key, value);
}

/** Compact cross-app UI sync cookie base name (account ↔ admin). Keep payload tiny. */
export const AZES_UI_SYNC_COOKIE = 'azes-ui';
export const AZES_UI_SYNC_VERSION = 1 as const;
/** Canonical mode key base (may be scoped via `azesPrefsKey`). */
export const AZES_MODE_PREF_BASE = 'azes-mode';
/** Canonical primary key base. */
export const AZES_PRIMARY_PREF_BASE = 'azes-primary';

export type AzesUiSyncMode = 'light' | 'dark' | 'system';

export type AzesUiSync = {
  primary?: string;
  mode?: AzesUiSyncMode;
};

function isUiSyncMode(value: string): value is AzesUiSyncMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function encodeAzesUiSync(sync: AzesUiSync): string {
  const primary = sync.primary?.trim() ? sync.primary.trim() : '-';
  const mode = sync.mode ?? '-';
  return `${AZES_UI_SYNC_VERSION}|${primary}|${mode}`;
}

export function decodeAzesUiSync(raw: string | null | undefined): AzesUiSync {
  if (!raw) return {};
  const parts = raw.split('|');
  if (parts.length < 3 || parts[0] !== String(AZES_UI_SYNC_VERSION)) return {};
  const primaryPart = parts[1]?.trim();
  const modePart = parts[2]?.trim();
  const primary = primaryPart && primaryPart !== '-' ? primaryPart : undefined;
  const mode = modePart && modePart !== '-' && isUiSyncMode(modePart) ? modePart : undefined;
  return { primary, mode };
}

/** Read scoped/shared `azes-ui` sync cookie. */
export function readAzesUiSync(): AzesUiSync {
  return decodeAzesUiSync(readDocumentCookie(azesPrefsKey(AZES_UI_SYNC_COOKIE)));
}

/**
 * Merge + persist `azes-ui` (scoped when configured), and mirror primary/mode.
 */
export function patchAzesUiSync(patch: AzesUiSync): void {
  if (typeof window === 'undefined') return;
  const current = readAzesUiSync();
  const next: AzesUiSync = {
    primary: patch.primary?.trim() ? patch.primary.trim() : current.primary,
    mode: patch.mode ?? current.mode,
  };
  if (!next.primary && !next.mode) return;

  writeDocumentCookie(azesPrefsKey(AZES_UI_SYNC_COOKIE), encodeAzesUiSync(next));
  if (next.primary) writeCrossPortPref(azesPrefsKey(AZES_PRIMARY_PREF_BASE), next.primary);
  if (next.mode) writeCrossPortPref(azesPrefsKey(AZES_MODE_PREF_BASE), next.mode);
}

/**
 * MUI CssVarsProvider `storageManager` factory — keeps mode / color-scheme
 * aligned across ports (and respects active `prefsScope`).
 *
 * Signature matches `@mui/system` StorageManager (options → get/set/subscribe).
 */
export function createAzesCrossPortStorageManager() {
  return (options: { key: string; storageWindow?: Window | null }) => {
    const { key } = options;
    const storageWindow = options.storageWindow ?? (typeof window !== 'undefined' ? window : null);

    const isModeKey = key === azesPrefsKey(AZES_MODE_PREF_BASE);

    return {
      get(defaultValue: string) {
        if (!storageWindow) return defaultValue;
        if (isModeKey) {
          const fromSync = readAzesUiSync().mode;
          if (fromSync) {
            try {
              const fromLocal = readLocal(storageWindow.localStorage, key);
              if (fromLocal !== fromSync) {
                writeLocal(storageWindow.localStorage, key, fromSync);
              }
            } catch {
              // ignore
            }
            return fromSync;
          }
        }
        const fromCookie = readDocumentCookie(key);
        if (fromCookie != null && fromCookie !== '') {
          try {
            const fromLocal = readLocal(storageWindow.localStorage, key);
            if (fromLocal !== fromCookie) {
              writeLocal(storageWindow.localStorage, key, fromCookie);
            }
          } catch {
            // ignore
          }
          return fromCookie;
        }
        try {
          const fromLocal = readLocal(storageWindow.localStorage, key);
          if (fromLocal != null && fromLocal !== '') return fromLocal;
        } catch {
          // ignore
        }
        return defaultValue;
      },
      set(value: string) {
        if (storageWindow) {
          writeLocal(storageWindow.localStorage, key, value);
        }
        writeDocumentCookie(key, value);
        if (isModeKey && (value === 'light' || value === 'dark' || value === 'system')) {
          patchAzesUiSync({ mode: value as AzesUiSyncMode });
        }
      },
      subscribe(handler: (value: string | null) => void) {
        if (!storageWindow) return () => undefined;
        const onStorage = (event: StorageEvent) => {
          if (event.key === key) {
            handler(event.newValue);
          }
        };
        // Cross-port: other origin cannot fire `storage`; re-read sync/cookie on focus.
        const syncFromCookie = () => {
          let next: string | null = null;
          if (isModeKey) {
            next = readAzesUiSync().mode ?? readDocumentCookie(key);
          } else {
            next = readDocumentCookie(key);
          }
          if (next == null || next === '') return;
          try {
            const fromLocal = readLocal(storageWindow.localStorage, key);
            if (fromLocal === next) return;
            writeLocal(storageWindow.localStorage, key, next);
          } catch {
            // still notify MUI
          }
          handler(next);
        };
        const onVisible = () => {
          if (storageWindow.document?.visibilityState === 'visible') {
            syncFromCookie();
          }
        };
        storageWindow.addEventListener('storage', onStorage);
        storageWindow.addEventListener('focus', syncFromCookie);
        storageWindow.document?.addEventListener('visibilitychange', onVisible);
        return () => {
          storageWindow.removeEventListener('storage', onStorage);
          storageWindow.removeEventListener('focus', syncFromCookie);
          storageWindow.document?.removeEventListener('visibilitychange', onVisible);
        };
      },
    };
  };
}

export type AzesStorageManager = ReturnType<typeof createAzesCrossPortStorageManager>;
