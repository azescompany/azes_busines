/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/loginShell.animations.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Static checks — showcase expand + scatter (no layout anim)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const cssPath = join(dirname(fileURLToPath(import.meta.url)), 'login.animations.css');
const css = readFileSync(cssPath, 'utf8');

describe('login.animations.css scatter contract', () => {
  it('expands showcase with clip-path and scatters cards via transform', () => {
    expect(css).toContain('@keyframes azes-login-showcase-expand');
    expect(css).toContain('@keyframes azes-login-card-scatter');
    expect(css).toContain('@keyframes azes-login-logo-rise');
    expect(css).not.toContain('azes-login-canvas-expand');
    expect(css).not.toContain('azes-login-card-settle');

    const scatter = css.slice(css.indexOf('@keyframes azes-login-card-scatter'));
    const block = scatter.slice(0, scatter.indexOf('}'));
    expect(block).toMatch(/transform/);
    expect(block).not.toMatch(/\bwidth\b/);
    expect(block).not.toMatch(/\bleft\b/);
  });

  it('includes RTL expand and canvas opacity exit only', () => {
    expect(css).toContain('azes-login-showcase-expand-rtl');
    expect(css).toContain('@keyframes azes-login-canvas-exit');
  });
});
