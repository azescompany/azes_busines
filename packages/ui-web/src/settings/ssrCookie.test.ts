/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/settings/ssrCookie.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-16
 * ║ Updated: 2026-10-16
 * ║ Purpose: SSR cookie → initialSettings patch for density hydration
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { settingsPatchFromCookieRaw } from './ssrCookie';

describe('settingsPatchFromCookieRaw', () => {
  it('returns empty patch for nullish or blank', () => {
    expect(settingsPatchFromCookieRaw(null)).toEqual({});
    expect(settingsPatchFromCookieRaw(undefined)).toEqual({});
    expect(settingsPatchFromCookieRaw('')).toEqual({});
    expect(settingsPatchFromCookieRaw('   ')).toEqual({});
  });

  it('parses density compact from plain JSON', () => {
    expect(
      settingsPatchFromCookieRaw(
        JSON.stringify({ version: 1, density: 'compact', navLayout: 'horizontal' }),
      ),
    ).toMatchObject({ density: 'compact', navLayout: 'horizontal' });
  });

  it('parses URI-encoded cookie bodies', () => {
    const raw = encodeURIComponent(JSON.stringify({ density: 'compact' }));
    expect(settingsPatchFromCookieRaw(raw)).toMatchObject({ density: 'compact' });
  });

  it('drops invalid fields', () => {
    expect(settingsPatchFromCookieRaw(JSON.stringify({ density: 'huge' }))).toEqual({});
  });

  it('returns empty on invalid JSON', () => {
    expect(settingsPatchFromCookieRaw('{not-json')).toEqual({});
  });
});
