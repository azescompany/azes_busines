/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/vite.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Vite config for @azes/admin (port 200 + @ + assets aliases)
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
  resolve: {
    conditions: ['development', 'import', 'module', 'browser', 'default'],
    alias: {
      '@': path.resolve(rootDir, 'src'),
      '@azes/assets': path.resolve(rootDir, '../../packages/assets'),
    },
    dedupe: ['@azes/api', '@azes/auth'],
  },
  server: { port: 200, strictPort: true },
  preview: { port: 200, strictPort: true },
});
