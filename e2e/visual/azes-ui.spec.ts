/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: e2e/visual/azes-ui.spec.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: azes-ui visual matrix — scheme × viewport × nav layout, plus pilot pages
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { expect, test, type Page } from '@playwright/test';

const SCHEMES = ['light', 'dark'] as const;
const VIEWPORTS = [
  { name: 'mobile', width: 360, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;
const NAV_LAYOUTS = ['vertical', 'mini', 'horizontal'] as const;
const PAGES = ['overview', 'pages-analytics', 'pages-list', 'pages-form', 'pages-auth'] as const;

async function prime(page: Page, scheme: string, navLayout: string) {
  await page.addInitScript(
    ([mode, layout]) => {
      window.localStorage.setItem('azes-mode', mode);
      window.localStorage.setItem(
        'azes.settings.v1',
        JSON.stringify({ version: 1, navLayout: layout }),
      );
    },
    [scheme, navLayout],
  );
}

async function settle(page: Page) {
  await expect(page.getByRole('progressbar', { name: 'Loading section' })).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
}

for (const scheme of SCHEMES) {
  for (const viewport of VIEWPORTS) {
    const layouts = viewport.name === 'desktop' ? NAV_LAYOUTS : (['vertical'] as const);
    for (const navLayout of layouts) {
      test(`shell ${scheme} ${viewport.name} ${navLayout}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await prime(page, scheme, navLayout);
        await page.goto('/#/overview');
        await settle(page);
        await expect(page).toHaveScreenshot(`shell-${scheme}-${viewport.name}-${navLayout}.png`);
      });
    }
  }
}

for (const scheme of SCHEMES) {
  for (const id of PAGES) {
    test(`page ${id} ${scheme}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await prime(page, scheme, 'vertical');
      await page.goto(`/#/${id}`);
      await settle(page);
      await expect(page).toHaveScreenshot(`page-${id}-${scheme}.png`, { fullPage: true });
    });
  }
}

test('settings drawer and mobile nav are keyboard reachable', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/#/overview');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Design system sections' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Open settings' }).click();
  await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
});
