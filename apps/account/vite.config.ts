/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/vite.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-20
 * ║ Purpose: Vite config for @azes/account (+ assets alias for brand SVG)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createAzesFaviconHtmlPlugin } from '../../packages/ui-web/src/theme/azesFavicon';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), createAzesFaviconHtmlPlugin()],
  // Keep a single @azes/api instance so Bearer getter + Orval mutator share state.
  // `@azes/ui-web` `development` export → `src/` (see package.json); prod uses `dist/`.
  resolve: {
    conditions: ['development', 'import', 'module', 'browser', 'default'],
    alias: {
      '@azes/assets': path.resolve(rootDir, '../../packages/assets'),
    },
    dedupe: ['@azes/api', '@azes/auth'],
  },
  server: { port: 100, strictPort: true },
  preview: { port: 100, strictPort: true },
});
