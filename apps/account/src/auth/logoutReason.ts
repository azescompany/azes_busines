/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/auth/logoutReason.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-10
 * ║ Purpose: One-shot forced-logout reason (+ optional i18n key) for login page
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const LOGOUT_REASON_KEY = 'azes.auth.logout_reason';
export const LOGOUT_REASON_KEY_KEY = 'azes.auth.logout_reason_key';
/** Cross-port handoff from admin (sessionStorage is origin-scoped). */
export const LOGOUT_REASON_QUERY = 'azes_logout_reason';
export const LOGOUT_REASON_KEY_QUERY = 'azes_logout_reason_key';
/** Admin sets this so Account does not immediately bounce back (account↔admin loop). */
export const STAY_ON_LOGIN_QUERY = 'azes_stay';
export const SUPPRESS_ADMIN_AUTO_REDIRECT_KEY = 'azes.auth.suppress_admin_auto';

export type LogoutReasonPayload = {
  message: string | null;
  /** Maps to `common:auth.<key>` when present. */
  reasonKey: string | null;
};

export function persistLogoutReason(message: string, reasonKey?: string): void {
  try {
    sessionStorage.setItem(LOGOUT_REASON_KEY, message);
    if (reasonKey) {
      sessionStorage.setItem(LOGOUT_REASON_KEY_KEY, reasonKey);
    } else {
      sessionStorage.removeItem(LOGOUT_REASON_KEY_KEY);
    }
  } catch {
    // ignore storage failures
  }
}

/** Read and clear a pending logout reason (query param or sessionStorage). */
export function consumeLogoutReason(
  search: string = typeof window === 'undefined' ? '' : window.location.search,
): LogoutReasonPayload {
  try {
    const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
    const fromQuery = params.get(LOGOUT_REASON_QUERY);
    const fromKey = params.get(LOGOUT_REASON_KEY_QUERY);
    if (fromQuery || fromKey) {
      params.delete(LOGOUT_REASON_QUERY);
      params.delete(LOGOUT_REASON_KEY_QUERY);
      if (typeof window !== 'undefined') {
        const next = params.toString();
        const path = `${window.location.pathname}${next ? `?${next}` : ''}${window.location.hash}`;
        window.history.replaceState(null, '', path);
      }
      return { message: fromQuery, reasonKey: fromKey };
    }

    const message = sessionStorage.getItem(LOGOUT_REASON_KEY);
    const reasonKey = sessionStorage.getItem(LOGOUT_REASON_KEY_KEY);
    if (message) sessionStorage.removeItem(LOGOUT_REASON_KEY);
    if (reasonKey) sessionStorage.removeItem(LOGOUT_REASON_KEY_KEY);
    return { message, reasonKey };
  } catch {
    return { message: null, reasonKey: null };
  }
}
