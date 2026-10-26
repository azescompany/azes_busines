/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-native/vitest.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Vitest config for @azes/ui-native (RN Testing Library)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [path.join(rootDir, 'src/test/setup.ts')],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.turbo/**'],
    passWithNoTests: true,
    server: {
      deps: {
        inline: ['@testing-library/react-native', 'react-native'],
      },
    },
  },
  resolve: {
    alias: {
      'react-native': path.join(rootDir, 'src/test/react-native-mock.tsx'),
    },
  },
});
