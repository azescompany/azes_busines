/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: tooling/eslint/base.js
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-20
 * ║ Purpose: Base ESLint flat config (TS + boundaries + Prettier)
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { boundaryRules, boundarySettings } from './boundaries.js';

const sourceFiles = ['**/*.{js,jsx,mjs,cjs,ts,tsx}'];

const deepImportBan = {
  group: ['@azes/*/src', '@azes/*/src/*'],
  message:
    'Do not deep-import package internals. Use the package public entry point (@azes/<pkg>).',
};

/** @type {import('eslint').Linter.Config[]} */
export const baseConfig = [
  {
    name: 'azes/ignores',
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.expo/**',
      '**/.turbo/**',
      '**/.wrangler/**',
      '**/coverage/**',
      '**/pnpm-lock.yaml',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/.git/**',
      '**/.husky/**',
      '**/docs/**',
      '**/*.md',
      '**/packages/api/generated/**',
      '**/apps/**/next-env.d.ts',
      '**/apps/**/expo-env.d.ts',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },
  {
    name: 'azes/js-recommended',
    files: sourceFiles,
    ...js.configs.recommended,
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: config.files ?? sourceFiles,
  })),
  {
    name: 'azes/base',
    files: sourceFiles,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      boundaries,
    },
    settings: {
      ...boundarySettings,
    },
    rules: {
      ...boundaryRules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-alert': 'error',
    },
  },
  {
    name: 'azes/restricted-deep-imports',
    files: sourceFiles,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [deepImportBan],
        },
      ],
    },
  },
  {
    name: 'azes/no-mui-in-product-apps',
    files: ['apps/**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    ignores: [
      'apps/azes-ui/**',
      'apps/realestate/**',
      'apps/agent-site/**',
      'apps/real-estate-site/**',
      // Design Lab may still demo legacy AzesDataGrid (@azes/ui-web/data-grid).
      'apps/admin/src/pages/DesignLabPage.tsx',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@azes/ui-web/data-grid',
              message:
                'Cədvəl üçün `@azes/ui-web/table` istifadə edin. AzesDataGrid yalnız Design Lab / showcase üçün.',
            },
            {
              name: '@tanstack/react-table',
              message: 'Cədvəl üçün `@azes/ui-web/table` istifadə edin.',
            },
            {
              name: '@mui/material/Drawer',
              message:
                'Sağ panel üçün `@azes/ui-web/side-panel` (`AzesSidePanel` + `useSidePanel`) istifadə edin.',
            },
            {
              name: '@mui/material/Menu',
              message:
                'Açılan menyu üçün `@azes/ui-web/menu` (`AzesMenu` + trigger render-prop) istifadə edin.',
            },
            {
              name: '@mui/material/Skeleton',
              message:
                'Skeleton üçün `@azes/ui-web/skeleton` (`AzesSkeleton` / `AzesSkeletonGroup`) istifadə edin.',
            },
          ],
          patterns: [
            deepImportBan,
            {
              group: ['@mui/*', '@emotion/*'],
              message: 'Import web UI from @azes/ui-web. See ADR-009.',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'azes/mui-icons-only-in-showcase',
    files: ['apps/azes-ui/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@mui/icons-material',
              message: 'Import a specific icon path such as @mui/icons-material/Menu.',
            },
          ],
          patterns: [
            deepImportBan,
            {
              group: [
                '@mui/material',
                '@mui/material/*',
                '@mui/system',
                '@mui/system/*',
                '@emotion/*',
              ],
              message: 'The showcase imports components from @azes/ui-web.',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'azes/next-ssr-mui-adapter',
    files: [
      'apps/realestate/**/*.{js,jsx,ts,tsx}',
      'apps/agent-site/**/*.{js,jsx,ts,tsx}',
      'apps/real-estate-site/**/*.{js,jsx,ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@mui/material',
              message: 'Import InitColorSchemeScript from @mui/material/InitColorSchemeScript.',
            },
          ],
          patterns: [
            deepImportBan,
            {
              group: ['@mui/material/*', '!@mui/material/InitColorSchemeScript'],
              message:
                'Next SSR apps may import InitColorSchemeScript, @mui/material-nextjs, @emotion/cache, and @emotion/server only.',
            },
            {
              group: ['@mui/system', '@mui/system/*'],
              message:
                'Next SSR apps may import InitColorSchemeScript, @mui/material-nextjs, @emotion/cache, and @emotion/server only.',
            },
            {
              group: [
                '@emotion/*',
                '!@emotion/cache',
                '!@emotion/server',
                '!@emotion/react',
                '!@emotion/styled',
              ],
              message:
                'Next SSR apps may import InitColorSchemeScript, @mui/material-nextjs, @emotion/cache, and @emotion/server only.',
            },
          ],
        },
      ],
    },
  },
  {
    name: 'azes/prettier',
    files: sourceFiles,
    ...eslintConfigPrettier,
  },
];

export default baseConfig;
