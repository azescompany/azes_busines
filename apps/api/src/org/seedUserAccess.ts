/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/seedUserAccess.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Apply default permission profile to a new org user
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { eq } from 'drizzle-orm';

import { nowSec } from '../auth/tokens.js';
import type { ApiDb } from '../db/client.js';
import {
  permissionProfileItems,
  permissionProfiles,
  userMenuPermissions,
  userMenus,
} from '../db/schema.js';

const DEFAULT_MEMBER_PROFILE = 'member-default';
const DEFAULT_ORG_ADMIN_PROFILE = 'org-admin';

export function profileCodeForRole(roleName: string): string {
  if (roleName === 'orgAdmin') return DEFAULT_ORG_ADMIN_PROFILE;
  return DEFAULT_MEMBER_PROFILE;
}

/** Copy profile items into user_menus + user_menu_permissions. No-op if profile missing. */
export async function seedUserAccessFromProfile(
  db: ApiDb,
  input: { userId: string; orgId: string; roleName: string },
): Promise<void> {
  const code = profileCodeForRole(input.roleName);
  const [profile] = await db
    .select()
    .from(permissionProfiles)
    .where(eq(permissionProfiles.code, code))
    .limit(1);
  if (!profile) return;

  const items = await db
    .select()
    .from(permissionProfileItems)
    .where(eq(permissionProfileItems.profileId, profile.id))
    .all();
  if (items.length === 0) return;

  const ts = nowSec();
  for (const item of items) {
    await db
      .insert(userMenus)
      .values({
        userId: input.userId,
        orgId: input.orgId,
        menuId: item.menuId,
        createdAt: ts,
      })
      .run();
    await db
      .insert(userMenuPermissions)
      .values({
        userId: input.userId,
        orgId: input.orgId,
        menuId: item.menuId,
        canRead: item.canRead,
        canCreate: item.canCreate,
        canUpdate: item.canUpdate,
        canDelete: item.canDelete,
      })
      .run();
  }
}
