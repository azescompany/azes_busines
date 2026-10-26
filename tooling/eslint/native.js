/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: tooling/eslint/native.js
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: React Native / Expo ESLint flat config preset
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

import baseConfig from './base.js';

/**
 * Native apps may add `eslint-config-expo` / RN plugins when Expo apps are created (Phase 10).
 * This preset provides shared React Hooks + AZES boundary rules for RN source.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const nativeConfig = [
  ...baseConfig,
  {
    name: 'azes/native',
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unknown-property': 'off',
    },
  },
];

export default nativeConfig;
