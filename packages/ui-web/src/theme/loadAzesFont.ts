/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/loadAzesFont.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-06
 * ║ Updated: 2026-10-11
 * ║ Purpose: On-demand @fontsource-variable loaders (latin + latin-ext)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AzesFontPresetId } from './createAzesTheme';

const loaded = new Set<AzesFontPresetId>();
const inflight = new Map<AzesFontPresetId, Promise<void>>();

/** CSS importers per preset — swapped in unit tests for dedupe assertions. */
export const azesFontCssImporters: Record<AzesFontPresetId, () => Promise<unknown>> = {
  inter: () => import('@fontsource-variable/inter/wght.css'),
  sourceSerif: () => import('@fontsource-variable/source-serif-4/wght.css'),
  nunito: () => import('@fontsource-variable/nunito/wght.css'),
  ibmPlexSans: () => import('@fontsource-variable/ibm-plex-sans/wght.css'),
  fraunces: () => import('@fontsource-variable/fraunces/wght.css'),
};

/** Load the variable font CSS once per preset (swap, latin + latin-ext via package CSS). */
export async function loadAzesFont(preset: AzesFontPresetId): Promise<void> {
  if (loaded.has(preset)) return;
  const pending = inflight.get(preset);
  if (pending) return pending;

  const task = (async () => {
    try {
      const importer = azesFontCssImporters[preset];
      if (importer) await importer();
      loaded.add(preset);
    } catch {
      // Vitest/jsdom and non-bundled consumers still apply the CSS font stack.
    } finally {
      inflight.delete(preset);
    }
  })();

  inflight.set(preset, task);
  return task;
}

/** Test helper: clear dedupe state between unit tests. */
export function resetAzesFontLoaderForTests(): void {
  loaded.clear();
  inflight.clear();
}
