/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/color-report.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-09
 * ║ Purpose: Optional console color report (AZES_COLOR_REPORT=1)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { it } from 'vitest';

import { brandSeedDarkPrimary, brandSeedOrder, brandSeeds, brandSeedSecondary } from './brand';
import { contrastRatio, deltaE, hexToOklch, hueDelta } from './color-utils';
import { createAzesTheme } from './createAzesTheme';

function fmt(hex: string): string {
  const o = hexToOklch(hex);
  return `${hex}  L${o.l.toFixed(3)} C${o.c.toFixed(3)} H${o.h.toFixed(1)}`;
}

it.runIf(process.env.AZES_COLOR_REPORT === '1')(
  'prints AZES color report for all brand seeds',
  () => {
    const lines: string[] = ['AZES color report', '=================', ''];

    for (const name of brandSeedOrder) {
      const theme = createAzesTheme({ primary: name });
      lines.push(name);
      for (const scheme of ['light', 'dark'] as const) {
        const p = theme.colorSchemes[scheme]?.palette;
        if (!p) throw new Error(`missing ${scheme}`);
        const primary = p.primary.main;
        const secondary = p.secondary.main;
        const paper = p.background.paper;
        const canvas = p.background.default;
        const checks: Array<[string, boolean]> = [
          ['P contrastText', contrastRatio(primary, p.primary.contrastText) >= 4.5],
          ['P/paper', contrastRatio(primary, paper) >= 3],
          ['P/canvas', contrastRatio(primary, canvas) >= 3],
          ['S contrastText', contrastRatio(secondary, p.secondary.contrastText) >= 4.5],
          ['link/paper', contrastRatio(p.text.link, paper) >= 4.5],
          ['focus/paper', contrastRatio(p.border.focus, paper) >= 3],
          ['hueΔ', hueDelta(hexToOklch(primary).h, hexToOklch(secondary).h) >= 120],
          ['ΔE', deltaE(primary, secondary) >= 0.15],
        ];
        const pass = checks.every(([, ok]) => ok);
        lines.push(
          `  [${scheme}] ${pass ? 'PASS' : 'FAIL'}`,
          `    primary   ${fmt(primary)}`,
          `    secondary ${fmt(secondary)}`,
          `    canvas    ${fmt(canvas)}`,
          `    paper     ${fmt(paper)}`,
          `    curated   P ${scheme === 'light' ? brandSeeds[name] : brandSeedDarkPrimary[name]} / S ${brandSeedSecondary[name][scheme]}`,
          `    checks    ${checks.map(([label, ok]) => `${label}:${ok ? 'ok' : 'FAIL'}`).join(' ')}`,
        );
      }
      lines.push('');
    }

    // eslint-disable-next-line no-console -- intentional report output
    console.log(lines.join('\n'));
  },
);
