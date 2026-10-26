/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: tooling/eslint/nextjs.js
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Next.js ESLint flat config preset (React base + Next notes)
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import reactConfig from './react.js';

/**
 * Next.js apps should also enable `eslint-config-next` in the app when Next is installed
 * (Phase 10). This preset provides the shared React + AZES boundary layer until then.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const nextjsConfig = [
  ...reactConfig,
  {
    name: 'azes/nextjs',
    rules: {
      // Reserved for Next-specific shared rules once apps exist.
    },
  },
];

export default nextjsConfig;
