/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/config/env.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: API base URL and runtime configuration
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type ApiRuntimeConfig = {
  baseUrl: string;
  timeoutMs: number;
};

const DEFAULT_TIMEOUT_MS = 30_000;

let runtimeConfig: ApiRuntimeConfig = {
  baseUrl: '',
  timeoutMs: DEFAULT_TIMEOUT_MS,
};

export function configureApi(config: Partial<ApiRuntimeConfig>): void {
  runtimeConfig = {
    ...runtimeConfig,
    ...config,
  };
}

export function getApiConfig(): Readonly<ApiRuntimeConfig> {
  return runtimeConfig;
}

export function resolveRequestUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = runtimeConfig.baseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!base) {
    return normalizedPath;
  }

  return `${base}${normalizedPath}`;
}
