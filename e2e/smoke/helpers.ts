/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: e2e/smoke/helpers.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-28
 * ║ Purpose: Shared assertions for web shell smoke E2E
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { expect, type Page } from '@playwright/test';

/**
 * Account login identity (Academy brand) — not the old Home “AZES Account / web-vite” chrome.
 * Mirrors apps/account LoginPage unit smoke.
 */
export async function expectAccountLoginShell(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByRole('img', { name: /AZES Academy/i })).toBeVisible();
  await expect(
    page.getByText(/Welcome to AZES Academy|AZES Academy-yə|Добро пожаловать в AZES Academy/i),
  ).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByText(/web-vite/i)).toHaveCount(0);
  await expect(page.getByText(/Environment:/i)).toHaveCount(0);
}

/** @deprecated Prefer expectAccountLoginShell — legacy Home shell chrome. */
export async function expectShellHome(
  page: Page,
  options: { appName: string; platform: string },
): Promise<void> {
  await page.goto('/');
  await expect(page.getByText(new RegExp(`AZES ${options.appName}`, 'i'))).toBeVisible();
  await expect(page.getByText(new RegExp(options.platform, 'i'))).toBeVisible();
  await expect(page.getByText(/Environment:/i)).toBeVisible();
}
