/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: e2e/smoke/account.spec.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-28
 * ║ Purpose: Smoke E2E for @azes/account Academy login identity
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { test } from '@playwright/test';

import { expectAccountLoginShell } from './helpers';

test('account login shell identity', async ({ page }) => {
  await expectAccountLoginShell(page);
});
