/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/navigation/navToneVars.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-14
 * ║ Updated: 2026-10-14
 * ║ Purpose: navToneVars must not set inherited `color` (scoop text)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { createAzesTheme } from '../theme/createAzesTheme';
import { navToneVars } from './navStyles';

describe('navToneVars', () => {
  it('exposes CSS vars without setting inherited color (both tones)', () => {
    const theme = createAzesTheme({ mode: 'light' });
    for (const tone of ['contrast', 'integrated'] as const) {
      const vars = navToneVars(theme, tone);
      expect(vars).toHaveProperty('--azes-nav-text');
      expect(vars).toHaveProperty('--azes-nav-text-strong');
      expect(vars).not.toHaveProperty('color');
    }
  });
});
