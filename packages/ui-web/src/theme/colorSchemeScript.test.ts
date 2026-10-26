/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/colorSchemeScript.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-19
 * ║ Purpose: Ensure Vite pre-paint scripts match InitColorSchemeScript keys
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  AZES_COLOR_SCHEME_ATTRIBUTE,
  AZES_COLOR_SCHEME_STORAGE_KEY,
  AZES_MODE_STORAGE_KEY,
} from './brand';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../..');

describe('color scheme pre-paint parity', () => {
  it('uses the same storage keys and attribute in the account Vite shell', () => {
    const accountHtml = readFileSync(join(repoRoot, 'apps/account/index.html'), 'utf8');

    expect(accountHtml).toContain(`localStorage.getItem('${AZES_MODE_STORAGE_KEY}')`);
    expect(accountHtml).toContain(`cookie('${AZES_MODE_STORAGE_KEY}')`);
    expect(accountHtml).toContain(`cookie('azes-ui')`);
    expect(accountHtml).toContain(`var mode = fromCookie || fromLocal || 'system'`);
    expect(accountHtml).toContain(`setAttribute('${AZES_COLOR_SCHEME_ATTRIBUTE}'`);
    expect(accountHtml).toContain('data-azes-favicon');

    expect(AZES_COLOR_SCHEME_ATTRIBUTE).toBe('data-azes-color-scheme');
    expect(AZES_COLOR_SCHEME_STORAGE_KEY).toBe('azes-color-scheme');
    expect(AZES_MODE_STORAGE_KEY).toBe('azes-mode');
  });
});
