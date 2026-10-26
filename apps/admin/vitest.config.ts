/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/vitest.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Vitest config for @azes/admin
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createVitestConfig } from '@azes/vitest-config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default createVitestConfig({
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      '@azes/assets': path.resolve(rootDir, '../../packages/assets'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
