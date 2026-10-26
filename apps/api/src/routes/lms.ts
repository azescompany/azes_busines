/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/lms.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Academy LMS read + enroll + lesson/progress APIs (M3–M4)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Hono } from 'hono';
import { z } from 'zod';

import {
  getAuthUser,
  hasAnyRole,
  isStaff,
  requireAuth,
  type AuthUser,
  type AuthedEnv,
} from '../auth/requireAuth.js';
import { nowSec } from '../auth/tokens.js';
import { createDb } from '../db/client.js';
import { requireJwtAccessSecret, type ApiEnv } from '../env.js';
import { ApiHttpError } from '../errors.js';
import { createDrizzleLmsMutations, type LmsMutations } from '../lms/mutations.js';
import { buildCourseProgress, looksLikeFileId, toLearningItem } from '../lms/progress.js';
import { createDrizzleLmsRepository, type LmsRepository } from '../lms/repository.js';
import { createSignedFileAccess, verifySignedFileAccess } from '../lms/signedUrl.js';
import type { CourseLevel, LessonDetailDto } from '../lms/types.js';
import {
  createDrizzleOrgRepository,
  createMemoryOrgRepository,
  type OrgRepository,
} from '../org/repository.js';

export type LmsRouteEnv = AuthedEnv;

export type CreateLmsRoutesOptions = {
  lmsRepo?: LmsRepository;
  lmsMutations?: LmsMutations;
  orgRepo?: OrgRepository;
};

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().optional(),
  categoryId: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

function resolveLmsRepo(env: ApiEnv, injected: LmsRepository | undefined): LmsRepository {
  if (injected) return injected;
  if (!env.DB) {
    throw new ApiHttpError(503, 'SERVICE_UNAVAILABLE', 'Database binding is not available');
  }
  return createDrizzleLmsRepository(createDb(env.DB));
}

function resolveMutations(env: ApiEnv, injected?: LmsMutations): LmsMutations {
  if (injected) return injected;
  if (!env.DB) {
    throw new ApiHttpError(503, 'SERVICE_UNAVAILABLE', 'Database binding is not available');
  }
  return createDrizzleLmsMutations(createDb(env.DB));
}

function resolveOrgRepo(env: ApiEnv, injected?: OrgRepository): OrgRepository {
  if (injected) return injected;
  if (!env.DB) {
    // Unit tests without D1: empty Track access (free published catalog only).
    return createMemoryOrgRepository();
  }
  return createDrizzleOrgRepository(createDb(env.DB));
}

function canViewCourse(
  course: { status: string; ownerId: string; accessType: string; id: string },
  user: AuthUser,
  accessibleIds: string[],
): boolean {
  if (hasAnyRole(user, ['superAdmin', 'orgAdmin'])) return true;
  if (course.status === 'draft' && course.ownerId === user.sub && isStaff(user)) return true;
  if (course.status !== 'published') return false;
  if (course.accessType === 'free') return true;
  return accessibleIds.includes(course.id);
}

function canEnrollCourse(
  course: { status: string; accessType: string; id: string },
  accessibleIds: string[],
): boolean {
  if (course.status !== 'published') return false;
  if (course.accessType === 'free') return true;
  return accessibleIds.includes(course.id);
}

export function createLmsRoutes(options: CreateLmsRoutesOptions = {}) {
  const routes = new Hono<LmsRouteEnv>();

  routes.get('/api/v1/categories', requireAuth(), async (c) => {
    const repo = resolveLmsRepo(c.env, options.lmsRepo);
    const items = await repo.listCategories();
    return c.json({ items });
  });

  routes.get('/api/v1/courses', requireAuth(), async (c) => {
    const parsed = listQuerySchema.safeParse({
      page: c.req.query('page') ?? undefined,
      pageSize: c.req.query('pageSize') ?? undefined,
      q: c.req.query('q') ?? undefined,
      categoryId: c.req.query('categoryId') ?? undefined,
      level: c.req.query('level') ?? undefined,
    });
    if (!parsed.success) {
      throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Invalid query parameters');
    }
    const user = getAuthUser(c);
    const staff = isStaff(user);
    const repo = resolveLmsRepo(c.env, options.lmsRepo);
    const orgRepo = resolveOrgRepo(c.env, options.orgRepo);
    const accessibleCourseIds = staff ? undefined : await orgRepo.listAccessibleCourseIds(user.sub);
    const result = await repo.listCourses({
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      q: parsed.data.q,
      categoryId: parsed.data.categoryId,
      level: parsed.data.level as CourseLevel | undefined,
      includeDrafts: staff,
      viewerId: user.sub,
      isAdmin: hasAnyRole(user, ['superAdmin', 'orgAdmin']),
      accessibleCourseIds,
    });
    return c.json(result);
  });

  routes.get('/api/v1/courses/:courseId/curriculum', requireAuth(), async (c) => {
    const courseId = c.req.param('courseId');
    const repo = resolveLmsRepo(c.env, options.lmsRepo);
    const course = await repo.getCourseById(courseId);
    if (!course) {
      throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
    }
    const user = getAuthUser(c);
    const orgRepo = resolveOrgRepo(c.env, options.orgRepo);
    const accessibleIds = await orgRepo.listAccessibleCourseIds(user.sub);
    if (!canViewCourse(course, user, accessibleIds)) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const modules = await repo.getCurriculum(courseId);
    return c.json({ courseId, modules });
  });

  routes.post('/api/v1/courses/:courseId/enroll', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const courseId = c.req.param('courseId');
    const repo = resolveLmsRepo(c.env, options.lmsRepo);
    const course = await repo.getCourseById(courseId);
    if (!course) {
      throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
    }
    const orgRepo = resolveOrgRepo(c.env, options.orgRepo);
    const accessibleIds = await orgRepo.listAccessibleCourseIds(user.sub);
    if (!canEnrollCourse(course, accessibleIds)) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Course requires track access');
    }
    const mut = resolveMutations(c.env, options.lmsMutations);
    const enrollment = await mut.enrollCourse(user.sub, courseId);
    return c.json(enrollment, 201);
  });

  routes.get('/api/v1/courses/:slug', requireAuth(), async (c) => {
    const slug = c.req.param('slug');
    const repo = resolveLmsRepo(c.env, options.lmsRepo);
    const course = await repo.getCourseBySlug(slug);
    if (!course) {
      throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
    }
    const user = getAuthUser(c);
    const orgRepo = resolveOrgRepo(c.env, options.orgRepo);
    const accessibleIds = await orgRepo.listAccessibleCourseIds(user.sub);
    if (!canViewCourse(course, user, accessibleIds)) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    return c.json(course);
  });

  routes.get('/api/v1/me/enrollments', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const repo = resolveLmsRepo(c.env, options.lmsRepo);
    const items = await repo.listEnrollmentsForUser(user.sub);
    return c.json({ items });
  });

  routes.get('/api/v1/me/learning', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const repo = resolveLmsRepo(c.env, options.lmsRepo);
    const enrollments = await repo.listEnrollmentsForUser(user.sub);
    const items = [];
    for (const enr of enrollments) {
      if (enr.status === 'cancelled') continue;
      const lessons = await repo.listPublishedLessonRows(enr.courseId);
      const progressRows = await repo.listLessonProgress(enr.id);
      const progress = buildCourseProgress({
        courseId: enr.courseId,
        enrollmentId: enr.id,
        lessons,
        progressRows,
      });
      items.push(
        toLearningItem({
          enrollmentId: enr.id,
          courseId: enr.courseId,
          courseTitle: enr.course?.title ?? enr.courseId,
          courseSlug: enr.course?.slug ?? enr.courseId,
          status: enr.status,
          progress,
        }),
      );
    }
    return c.json({ items });
  });

  routes.get('/api/v1/courses/:courseId/progress', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const courseId = c.req.param('courseId');
    const repo = resolveLmsRepo(c.env, options.lmsRepo);
    const enrollment = await repo.getEnrollment(user.sub, courseId);
    if (!enrollment || enrollment.status === 'cancelled') {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Enrollment required');
    }
    const lessons = await repo.listPublishedLessonRows(courseId);
    const progressRows = await repo.listLessonProgress(enrollment.id);
    return c.json(
      buildCourseProgress({
        courseId,
        enrollmentId: enrollment.id,
        lessons,
        progressRows,
      }),
    );
  });

  routes.get('/api/v1/lessons/:lessonId', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const lessonId = c.req.param('lessonId');
    const repo = resolveLmsRepo(c.env, options.lmsRepo);
    const lesson = await repo.getLessonRow(lessonId);
    if (!lesson || lesson.status !== 'published') {
      throw new ApiHttpError(404, 'NOT_FOUND', 'Lesson not found');
    }
    const enrollment = await repo.getEnrollment(user.sub, lesson.courseId);
    const staff = isStaff(user);
    if ((!enrollment || enrollment.status === 'cancelled') && !staff) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Enrollment required');
    }
    const ordered = await repo.listPublishedLessonRows(lesson.courseId);
    const idx = ordered.findIndex((l) => l.id === lessonId);
    const progress =
      enrollment != null ? await repo.getLessonProgress(enrollment.id, lessonId) : null;

    let material: LessonDetailDto['material'] = null;
    if (lesson.type === 'file' && looksLikeFileId(lesson.content)) {
      const file = await repo.getFileAsset(lesson.content.trim());
      if (file) {
        const secret = requireJwtAccessSecret(c.env);
        const signed = await createSignedFileAccess({
          secret,
          fileId: file.id,
          userId: user.sub,
          nowSec: nowSec(),
        });
        material = {
          fileId: file.id,
          mime: file.mime,
          size: file.size,
          signedUrl: signed.path,
          expiresAt: signed.expiresAt,
        };
      }
    }

    const body: LessonDetailDto = {
      id: lesson.id,
      courseId: lesson.courseId,
      moduleId: lesson.moduleId,
      title: lesson.title,
      type: lesson.type,
      content: lesson.type === 'file' && material ? null : lesson.content,
      videoUrl: lesson.videoUrl,
      durationMin: lesson.durationMin,
      position: lesson.position,
      isRequired: lesson.isRequired,
      status: lesson.status,
      progressStatus: progress?.status ?? 'not_started',
      completedAt: progress?.completedAt ?? null,
      prevLessonId: idx > 0 ? (ordered[idx - 1]?.id ?? null) : null,
      nextLessonId: idx >= 0 && idx < ordered.length - 1 ? (ordered[idx + 1]?.id ?? null) : null,
      material,
    };
    return c.json(body);
  });

  routes.post('/api/v1/lessons/:lessonId/complete', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const lessonId = c.req.param('lessonId');
    const mut = resolveMutations(c.env, options.lmsMutations);
    const result = await mut.completeLesson(user.sub, lessonId);
    return c.json(result);
  });

  routes.get('/api/v1/files/:fileId/content', async (c) => {
    const fileId = c.req.param('fileId');
    const exp = Number(c.req.query('exp') ?? '');
    const uid = c.req.query('uid') ?? '';
    const sig = c.req.query('sig') ?? '';
    const secret = requireJwtAccessSecret(c.env);
    const ok = await verifySignedFileAccess({
      secret,
      fileId,
      userId: uid,
      expiresAt: exp,
      sig,
      nowSec: nowSec(),
    });
    if (!ok) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Invalid or expired file URL');
    }
    const repo = resolveLmsRepo(c.env, options.lmsRepo);
    const file = await repo.getFileAsset(fileId);
    if (!file) {
      throw new ApiHttpError(404, 'NOT_FOUND', 'File not found');
    }
    if (!c.env.FILES) {
      throw new ApiHttpError(503, 'SERVICE_UNAVAILABLE', 'File storage (R2) is not configured');
    }
    const obj = await c.env.FILES.get(file.storageKey);
    if (!obj) {
      throw new ApiHttpError(404, 'NOT_FOUND', 'File object missing');
    }
    const headers = new Headers();
    headers.set('Content-Type', file.mime);
    headers.set('Cache-Control', 'private, max-age=60');
    return new Response(obj.body, { status: 200, headers });
  });

  return routes;
}
