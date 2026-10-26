/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/client/device-meta.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-11
 * ║ Purpose: Atomic device fingerprint (id+UA+platform+language) for auth
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type DeviceMeta = {
  deviceId: string;
  userAgent: string;
  platform: string;
  language: string;
};

/** Optional navigator fields when seeding a backend-registered device id. */
export type SeedDeviceIdOptions = {
  userAgent?: string;
  platform?: string;
  language?: string;
};

export type DeviceDigestFn = (raw: string) => Promise<string>;

/** Canonical full fingerprint blob — single source of truth. */
const META_STORAGE_KEY = 'azes.device.meta';
/** Legacy bare id (migrated / mirrored for older readers). */
const STORAGE_KEY = 'azes.device.id';
const STORAGE_UPDATED_KEY = 'azes.device.last_updated';
/** Legacy HouseKey key — written alongside canonical id for backend parity. */
const LEGACY_STORAGE_KEY = 'app_device_id';

const META_VERSION = 1 as const;

type StoredDeviceMetaV1 = {
  v: typeof META_VERSION;
  deviceId: string;
  userAgent: string;
  platform: string;
  language: string;
};

const FALLBACK_META: DeviceMeta = {
  deviceId: 'ssr-unknown-device',
  userAgent: 'unknown',
  platform: 'unknown',
  language: 'en',
};

let memoryCache: DeviceMeta | null = null;
let digestOverride: DeviceDigestFn | null = null;

function bytesToHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function defaultDigest(raw: string): Promise<string> {
  if (digestOverride) {
    return digestOverride(raw);
  }
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    // Deterministic non-crypto fallback for constrained test/SSR hosts only.
    let hash = 0;
    for (let i = 0; i < raw.length; i += 1) {
      hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
    }
    return `fallback-${hash.toString(16).padStart(8, '0')}`;
  }
  const data = new TextEncoder().encode(raw);
  const digest = await subtle.digest('SHA-256', data);
  return bytesToHex(digest);
}

function readStorage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

/** Test-only: inject SHA-256 digest (or reset with null). */
export function __setDeviceDigestForTests(digest: DeviceDigestFn | null): void {
  digestOverride = digest;
  memoryCache = null;
}

/** Test-only: clear in-memory device cache. */
export function __resetDeviceMetaCacheForTests(): void {
  memoryCache = null;
}

function navigatorMeta(): Pick<DeviceMeta, 'userAgent' | 'platform' | 'language'> {
  if (typeof navigator === 'undefined') {
    return {
      userAgent: FALLBACK_META.userAgent,
      platform: FALLBACK_META.platform,
      language: FALLBACK_META.language,
    };
  }
  return {
    userAgent: navigator.userAgent || 'unknown',
    platform: navigator.platform || 'unknown',
    language: navigator.language || 'en',
  };
}

function fingerprintRaw(meta: Pick<DeviceMeta, 'userAgent' | 'platform' | 'language'>): string {
  return `${meta.userAgent}|${meta.platform}|${meta.language}`;
}

function isCompleteMeta(value: unknown): value is DeviceMeta {
  if (!value || typeof value !== 'object') return false;
  const m = value as DeviceMeta;
  return (
    typeof m.deviceId === 'string' &&
    m.deviceId.trim().length > 0 &&
    typeof m.userAgent === 'string' &&
    m.userAgent.trim().length > 0 &&
    typeof m.platform === 'string' &&
    m.platform.trim().length > 0 &&
    typeof m.language === 'string' &&
    m.language.trim().length > 0
  );
}

function readStoredFullMeta(storage: Storage): DeviceMeta | null {
  try {
    const raw = storage.getItem(META_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDeviceMetaV1;
    if (parsed?.v !== META_VERSION) return null;
    const meta: DeviceMeta = {
      deviceId: parsed.deviceId?.trim() ?? '',
      userAgent: parsed.userAgent?.trim() ?? '',
      platform: parsed.platform?.trim() ?? '',
      language: parsed.language?.trim() ?? '',
    };
    return isCompleteMeta(meta) ? meta : null;
  } catch {
    return null;
  }
}

function readLegacyBareId(storage: Storage): string | null {
  const fromCanonical = storage.getItem(STORAGE_KEY)?.trim();
  if (fromCanonical) return fromCanonical;
  const fromLegacy = storage.getItem(LEGACY_STORAGE_KEY)?.trim();
  return fromLegacy || null;
}

function persistFullMeta(meta: DeviceMeta): void {
  const storage = readStorage();
  if (!storage) return;
  const payload: StoredDeviceMetaV1 = {
    v: META_VERSION,
    deviceId: meta.deviceId,
    userAgent: meta.userAgent,
    platform: meta.platform,
    language: meta.language,
  };
  try {
    storage.setItem(META_STORAGE_KEY, JSON.stringify(payload));
    // Mirror bare id for any leftover readers / backend parity tooling.
    storage.setItem(STORAGE_KEY, meta.deviceId);
    storage.setItem(LEGACY_STORAGE_KEY, meta.deviceId);
    storage.setItem(STORAGE_UPDATED_KEY, String(Date.now()));
  } catch {
    // Quota / private mode — memory cache still works for the session.
  }
}

function remember(meta: DeviceMeta): DeviceMeta {
  memoryCache = meta;
  persistFullMeta(meta);
  return meta;
}

/**
 * Force the mutator device fingerprint (cross-port account→admin handoff / env pin).
 * Backend binds the session to the **full** login fingerprint — never seed `deviceId`
 * alone against a live navigator that may differ (Chrome update, DevTools, language).
 */
export function seedDeviceId(deviceId: string, options?: SeedDeviceIdOptions): DeviceMeta {
  const trimmed = deviceId.trim();
  if (!trimmed) {
    throw new Error('seedDeviceId requires a non-empty deviceId');
  }
  const nav = navigatorMeta();
  const meta: DeviceMeta = {
    deviceId: trimmed,
    userAgent: options?.userAgent?.trim() || nav.userAgent,
    platform: options?.platform?.trim() || nav.platform,
    language: options?.language?.trim() || nav.language,
  };
  if (!options?.userAgent?.trim() && typeof console !== 'undefined') {
    console.warn(
      '[azes/api] seedDeviceId called without userAgent — pinning live navigator. ' +
        'Prefer passing the login-registered UA/platform/language to avoid API 400.',
    );
  }
  return remember(meta);
}

/**
 * Atomic device fingerprint for headers + login body.
 *
 * Persistence rule (iron): store **id + userAgent + platform + language** together.
 * Never rehydrate a stored id with a fresh `navigator` — that is the classic
 * localhost→prod API 400 ("Fields məlumatları tapılmadı") after UA/language drift.
 *
 * Legacy bare-id keys are reused only when they still match `hash(current navigator)`;
 * otherwise they are discarded and a consistent new fingerprint is created.
 */
export async function getOrCreateDeviceMeta(): Promise<DeviceMeta> {
  if (memoryCache) {
    return memoryCache;
  }

  if (typeof navigator === 'undefined') {
    return FALLBACK_META;
  }

  const storage = readStorage();
  if (storage) {
    const full = readStoredFullMeta(storage);
    if (full) {
      memoryCache = full;
      // Keep bare mirrors in sync if something external wiped them.
      persistFullMeta(full);
      return full;
    }
  }

  const nav = navigatorMeta();
  const bareId = storage ? readLegacyBareId(storage) : null;
  if (bareId) {
    const expected = await defaultDigest(fingerprintRaw(nav));
    if (bareId === expected) {
      // Legacy id still matches live fingerprint — promote to full meta.
      return remember({ deviceId: bareId, ...nav });
    }
    // Orphan bare id (env copy / old session) — drop it so login can register cleanly.
    try {
      storage?.removeItem(STORAGE_KEY);
      storage?.removeItem(LEGACY_STORAGE_KEY);
      storage?.removeItem(META_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  const deviceId = await defaultDigest(fingerprintRaw(nav));
  return remember({ deviceId, ...nav });
}
