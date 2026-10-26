/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/auth/src/storage/clearLegacyWebTokenVault.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-05
 * ║ Updated: 2026-10-05
 * ║ Purpose: One-shot cleanup of removed sessionStorage/IndexedDB token vault
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

const SESSION_ACCESS_KEY = 'azes.auth.accessToken';
const SESSION_REFRESH_KEY = 'azes.auth.refreshToken';
const IDB_NAME = 'azes.auth';
const IDB_STORE = 'tokens';
const IDB_KEY = 'web';

/** Removes leftover vault keys from the short-lived IndexedDB/sessionStorage experiment. */
export async function clearLegacyWebTokenVault(): Promise<void> {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(SESSION_ACCESS_KEY);
      sessionStorage.removeItem(SESSION_REFRESH_KEY);
    }
  } catch {
    // ignore
  }

  if (typeof indexedDB === 'undefined') {
    return;
  }

  await new Promise<void>((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onerror = () => resolve();
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        try {
          if (!db.objectStoreNames.contains(IDB_STORE)) {
            db.close();
            resolve();
            return;
          }
          const tx = db.transaction(IDB_STORE, 'readwrite');
          tx.objectStore(IDB_STORE).delete(IDB_KEY);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => {
            db.close();
            resolve();
          };
        } catch {
          try {
            db.close();
          } catch {
            // ignore
          }
          resolve();
        }
      };
    } catch {
      resolve();
    }
  });
}
