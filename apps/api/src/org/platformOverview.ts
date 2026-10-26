/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/platformOverview.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Cross-org KPI counts for SuperAdmin overview
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { count, eq } from 'drizzle-orm';

import type { ApiDb } from '../db/client.js';
import * as schema from '../db/schema.js';
import type { PlatformOverviewDto } from './types.js';

export async function getPlatformOverview(db: ApiDb): Promise<PlatformOverviewDto> {
  const [orgTotal] = await db.select({ value: count() }).from(schema.organizations);
  const [orgActive] = await db
    .select({ value: count() })
    .from(schema.organizations)
    .where(eq(schema.organizations.status, 'active'));
  const [userTotal] = await db.select({ value: count() }).from(schema.users);
  const [trackTotal] = await db.select({ value: count() }).from(schema.tracks);
  const [publishedCourses] = await db
    .select({ value: count() })
    .from(schema.courses)
    .where(eq(schema.courses.status, 'published'));

  const roleCounts = await db
    .select({
      roleName: schema.roles.name,
      value: count(),
    })
    .from(schema.userRoles)
    .innerJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id))
    .groupBy(schema.roles.name);

  const byRole = new Map(roleCounts.map((r) => [r.roleName, Number(r.value)]));

  return {
    organizationCount: Number(orgTotal?.value ?? 0),
    activeOrganizationCount: Number(orgActive?.value ?? 0),
    userCount: Number(userTotal?.value ?? 0),
    instructorCount: byRole.get('instructor') ?? 0,
    studentCount: byRole.get('student') ?? 0,
    orgAdminCount: byRole.get('orgAdmin') ?? 0,
    publishedCourseCount: Number(publishedCourses?.value ?? 0),
    trackCount: Number(trackTotal?.value ?? 0),
  };
}

/** Test double when D1 is not bound. */
export function emptyPlatformOverview(): PlatformOverviewDto {
  return {
    organizationCount: 0,
    activeOrganizationCount: 0,
    userCount: 0,
    instructorCount: 0,
    studentCount: 0,
    orgAdminCount: 0,
    publishedCourseCount: 0,
    trackCount: 0,
  };
}
