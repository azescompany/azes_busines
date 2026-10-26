/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/azesFavicon.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-19
 * ║ Purpose: Home favicon tint + FOUC script parity
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

import { brandSeeds, DEFAULT_PRIMARY } from './brand';
import {
  applyAzesFavicon,
  buildAzesFaviconSvg,
  createAzesFaviconHtmlPlugin,
  getAzesFaviconPrepaintScript,
  resetAzesFaviconCacheForTests,
  syncAzesFaviconFromPrefs,
} from './azesFavicon';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../..');

afterEach(() => {
  resetAzesFaviconCacheForTests();
  document.head.innerHTML = '';
  document.cookie.split(';').forEach((part) => {
    const name = part.split('=')[0]?.trim();
    if (name) document.cookie = `${name}=; Max-Age=0; path=/`;
  });
  window.localStorage.clear();
});

describe('azesFavicon', () => {
  it('builds a home SVG filled with the resolved primary', () => {
    const svg = buildAzesFaviconSvg(brandSeeds.indigo);
    expect(svg).toContain(`fill="${brandSeeds.indigo.toLowerCase()}"`);
    expect(svg).toContain('M10 20v-6h4v6h5v-8h3L12 3');
    expect(svg).toContain('viewBox="0 0 24 24"');
  });

  it('applies a data-URL favicon and updates when primary changes', () => {
    document.head.innerHTML =
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg" data-azes-favicon />';

    applyAzesFavicon(brandSeeds.teal);
    const link = document.querySelector<HTMLLinkElement>('link[data-azes-favicon]');
    expect(link?.href).toContain('data:image/svg+xml');
    expect(decodeURIComponent(link!.href)).toContain(brandSeeds.teal.toLowerCase());

    applyAzesFavicon(brandSeeds.violet);
    expect(decodeURIComponent(link!.href)).toContain(brandSeeds.violet.toLowerCase());
  });

  it('syncs from azes-ui cookie primary', () => {
    document.head.innerHTML =
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg" data-azes-favicon />';
    document.cookie = `azes-ui=1|${brandSeeds.orange}|light; path=/`;

    syncAzesFaviconFromPrefs();
    const link = document.querySelector<HTMLLinkElement>('link[data-azes-favicon]');
    expect(decodeURIComponent(link!.href)).toContain(brandSeeds.orange.toLowerCase());
  });

  it('prepaint script reads azes-ui and tints the icon links', () => {
    document.head.innerHTML =
      '<link rel="icon" href="/favicon.svg" /><link rel="apple-touch-icon" href="/favicon.svg" />';
    document.cookie = `azes-ui=1|${brandSeeds.blue}|system; path=/`;

    eval(getAzesFaviconPrepaintScript());

    const href = document.querySelector('link[rel="icon"]')?.getAttribute('href') ?? '';
    expect(href.startsWith('data:image/svg+xml')).toBe(true);
    expect(decodeURIComponent(href)).toContain(brandSeeds.blue.toLowerCase());
  });

  it('html plugin injects a single boot script', () => {
    const plugin = createAzesFaviconHtmlPlugin();
    const once = plugin.transformIndexHtml('<html><head></head></html>');
    expect(once).toContain('data-azes-favicon-boot');
    expect(once).toContain('azes-ui');
    const twice = plugin.transformIndexHtml(once);
    expect(twice.match(/data-azes-favicon-boot/g)?.length).toBe(1);
  });

  it('keeps account static favicon aligned with DEFAULT_PRIMARY home mark', () => {
    const expected = buildAzesFaviconSvg(DEFAULT_PRIMARY);
    const raw = readFileSync(join(repoRoot, 'apps/account/public/favicon.svg'), 'utf8');
    const svgStart = raw.indexOf('<svg');
    expect(svgStart).toBeGreaterThanOrEqual(0);
    expect(raw.slice(svgStart).trim()).toBe(expected);
  });

  it('marks favicon links in the account Vite HTML shell', () => {
    const html = readFileSync(join(repoRoot, 'apps/account/index.html'), 'utf8');
    expect(html).toContain('data-azes-favicon');
    expect(html).toContain('href="/favicon.svg"');
  });

  it('rewrites a static .ico link to a primary-tinted SVG data-URL', () => {
    document.head.innerHTML =
      '<link rel="icon" href="/favicon.ico" sizes="48x48" data-azes-favicon />';

    applyAzesFavicon(brandSeeds.green);
    const link = document.querySelector<HTMLLinkElement>('link[data-azes-favicon]');
    expect(link?.type).toBe('image/svg+xml');
    expect(link?.getAttribute('sizes')).toBeNull();
    expect(link?.href).toContain('data:image/svg+xml');
    expect(decodeURIComponent(link!.href)).toContain(brandSeeds.green.toLowerCase());
  });
});
