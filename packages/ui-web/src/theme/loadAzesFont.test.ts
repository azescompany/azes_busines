/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/loadAzesFont.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-09
 * ║ Purpose: Deduped on-demand font loader unit tests
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AZES_FONT_PRESET_IDS, type AzesFontPresetId } from './createAzesTheme';
import { azesFontCssImporters, loadAzesFont, resetAzesFontLoaderForTests } from './loadAzesFont';

describe('loadAzesFont', () => {
  const spies = {} as Record<AzesFontPresetId, ReturnType<typeof vi.fn>>;
  const originals = {} as Record<AzesFontPresetId, () => Promise<unknown>>;

  beforeEach(() => {
    resetAzesFontLoaderForTests();
    for (const preset of AZES_FONT_PRESET_IDS) {
      originals[preset] = azesFontCssImporters[preset];
      spies[preset] = vi.fn(async () => undefined);
      azesFontCssImporters[preset] = spies[preset]!;
    }
  });

  afterEach(() => {
    for (const preset of AZES_FONT_PRESET_IDS) {
      azesFontCssImporters[preset] = originals[preset]!;
    }
    resetAzesFontLoaderForTests();
  });

  it('loads every preset id exactly once when requested repeatedly', async () => {
    for (const preset of AZES_FONT_PRESET_IDS) {
      await loadAzesFont(preset);
      await loadAzesFont(preset);
      expect(spies[preset]).toHaveBeenCalledTimes(1);
    }
  });

  it('dedupes concurrent loads for the same preset', async () => {
    await Promise.all([
      loadAzesFont('sourceSerif'),
      loadAzesFont('sourceSerif'),
      loadAzesFont('sourceSerif'),
    ]);
    expect(spies.sourceSerif).toHaveBeenCalledTimes(1);
  });

  it('allows rapid successive preset changes without throwing', async () => {
    await expect(
      Promise.all(AZES_FONT_PRESET_IDS.map((preset) => loadAzesFont(preset))),
    ).resolves.toEqual(AZES_FONT_PRESET_IDS.map(() => undefined));
    for (const preset of AZES_FONT_PRESET_IDS) {
      expect(spies[preset]).toHaveBeenCalledTimes(1);
    }
  });
});
