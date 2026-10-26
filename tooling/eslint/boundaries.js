/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: tooling/eslint/boundaries.js
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Shared eslint-plugin-boundaries element and rule settings
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** @type {import('eslint').Linter.Config['settings']} */
export const boundarySettings = {
  'boundaries/elements': [
    { type: 'app', pattern: 'apps/*', mode: 'folder' },
    { type: 'design-tokens', pattern: 'packages/design-tokens', mode: 'folder' },
    { type: 'ui-web', pattern: 'packages/ui-web', mode: 'folder' },
    { type: 'ui-native', pattern: 'packages/ui-native', mode: 'folder' },
    { type: 'api', pattern: 'packages/api', mode: 'folder' },
    { type: 'state', pattern: 'packages/state', mode: 'folder' },
    { type: 'auth', pattern: 'packages/auth', mode: 'folder' },
    { type: 'validation', pattern: 'packages/validation', mode: 'folder' },
    { type: 'i18n', pattern: 'packages/i18n', mode: 'folder' },
    { type: 'permissions', pattern: 'packages/permissions', mode: 'folder' },
    { type: 'testing', pattern: 'packages/testing', mode: 'folder' },
    { type: 'package', pattern: 'packages/*', mode: 'folder' },
    { type: 'tooling', pattern: 'tooling/*', mode: 'folder' },
  ],
  'boundaries/include': ['apps/**/*', 'packages/**/*', 'tooling/**/*'],
};

/**
 * Dependency graph enforcement aligned with docs/architecture/dependency-graph.md.
 * Rules activate as matching folders appear; empty workspaces lint cleanly.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
export const boundaryRules = {
  'boundaries/no-unknown': 'off',
  'boundaries/no-unknown-files': 'off',
  'boundaries/element-types': [
    'error',
    {
      default: 'allow',
      rules: [
        { from: ['app'], disallow: ['app'] },
        {
          from: ['ui-web', 'ui-native'],
          disallow: ['api', 'state', 'auth'],
        },
        {
          from: ['design-tokens'],
          disallow: ['app', 'ui-web', 'ui-native', 'api', 'state', 'auth'],
        },
        {
          from: ['api'],
          disallow: ['app', 'ui-web', 'ui-native', 'state', 'auth'],
        },
        {
          from: ['state'],
          disallow: ['app', 'ui-web', 'ui-native', 'api'],
        },
        {
          from: ['auth'],
          disallow: ['app', 'ui-web', 'ui-native', 'api'],
        },
        {
          from: ['validation', 'i18n', 'permissions'],
          disallow: ['app', 'ui-web', 'ui-native', 'api', 'state', 'auth'],
        },
        {
          from: ['testing'],
          disallow: ['app', 'api', 'state', 'auth'],
        },
      ],
    },
  ],
};
