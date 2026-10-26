/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/config/env.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-19
 * ║ Purpose: Runtime env — API base (default local Worker) + handoff targets
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

function trimEnv(value: string | undefined): string | undefined {
  const next = value?.trim();
  return next ? next : undefined;
}

/** Local `@azes/api-server` Wrangler default — empty env must not hit Vite (:100). */
const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8787';

export const accountEnv = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, ''),
  /**
   * Default post-login target + allowlisted origin (`apps/admin` on :200).
   */
  adminAppUrl: (import.meta.env.VITE_ADMIN_APP_URL ?? 'http://localhost:200').replace(/\/$/, ''),
  /**
   * Extra allowlisted `returnUrl` origin (legacy Academy slot; default handoff stays admin).
   */
  academyAppUrl: (import.meta.env.VITE_ACADEMY_APP_URL ?? 'http://localhost:200').replace(
    /\/$/,
    '',
  ),
  /** Next agent-site origin — allowed `returnUrl` target alongside admin. */
  agentSiteAppUrl: (import.meta.env.VITE_AGENT_SITE_APP_URL ?? 'http://localhost:300').replace(
    /\/$/,
    '',
  ),
  /** Caspian marketplace (`real-estate-site`) — allowed `returnUrl` for Site Entry. */
  realEstateSiteAppUrl: (
    import.meta.env.VITE_REAL_ESTATE_SITE_APP_URL ?? 'http://localhost:400'
  ).replace(/\/$/, ''),
  /** Production: `.example.com` so admin + account subdomains share JWT cookies. */
  authCookieDomain: trimEnv(import.meta.env.VITE_AUTH_COOKIE_DOMAIN),
  /**
   * Optional override for local → prod API. Backend rejects unknown/mismatched
   * fingerprints with 400 "Fields məlumatları tapılmadı".
   * AppProviders seeds only when `VITE_DEVICE_ID` **and** `VITE_DEVICE_USER_AGENT`
   * are both set (plus platform/language). Id-only override is ignored.
   */
  deviceIdOverride: trimEnv(import.meta.env.VITE_DEVICE_ID),
  deviceUserAgentOverride: trimEnv(import.meta.env.VITE_DEVICE_USER_AGENT),
  devicePlatformOverride: trimEnv(import.meta.env.VITE_DEVICE_PLATFORM),
  deviceLanguageOverride: trimEnv(import.meta.env.VITE_DEVICE_LANGUAGE),
} as const;
