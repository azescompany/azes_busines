/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: e2e/smoke/helpers.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Shared assertions for web shell smoke E2E
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { expect, type Page } from '@playwright/test';

/** Asserts app identity chrome (title + platform + Environment). Works for Home shells and Account login. */
export async function expectShellHome(
  page: Page,
  options: { appName: string; platform: string },
): Promise<void> {
  await page.goto('/');
  await expect(page.getByText(new RegExp(`AZES ${options.appName}`, 'i'))).toBeVisible();
  await expect(page.getByText(new RegExp(options.platform, 'i'))).toBeVisible();
  await expect(page.getByText(/Environment:/i)).toBeVisible();
}
