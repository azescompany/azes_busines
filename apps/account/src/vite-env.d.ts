/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/vite-env.d.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-19
 * ║ Purpose: Vite env typings for @azes/account
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

/// <reference types="vite/client" />

declare module '*.svg?raw' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ADMIN_APP_URL?: string;
  /** AZES Academy origin — allowlisted returnUrl (not the default handoff). */
  readonly VITE_ACADEMY_APP_URL?: string;
  readonly VITE_AGENT_SITE_APP_URL?: string;
  readonly VITE_REAL_ESTATE_SITE_APP_URL?: string;
  readonly VITE_AUTH_COOKIE_DOMAIN?: string;
  /** Optional registered device fingerprint when calling prod API from localhost. */
  readonly VITE_DEVICE_ID?: string;
  readonly VITE_DEVICE_USER_AGENT?: string;
  readonly VITE_DEVICE_PLATFORM?: string;
  readonly VITE_DEVICE_LANGUAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
