/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/lmsManage.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: LMS write APIs — course/module/lesson/publish/reorder/archive
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Hono } from 'hono';
import { z } from 'zod';

import { can } from '../auth/permissions.js';
import {
  enforceRateLimit,
  FILE_UPLOAD_USER_LIMIT,
  FILE_UPLOAD_USER_WINDOW_SEC,
  fileUploadUserKey,
  resolveRateLimitStore,
  type RateLimitStore,
} from '../auth/rateLimit.js';
import { getAuthUser, requireAuth, type AuthedEnv } from '../auth/requireAuth.js';
import { assertCanEditCourse } from '../auth/scope.js';
import { createDb } from '../db/client.js';
import type { ApiEnv } from '../env.js';
import { ApiHttpError } from '../errors.js';
import { putCourseFile } from '../lms/files.js';
import { createDrizzleLmsMutations, type LmsMutations } from '../lms/mutations.js';
import { createDrizzleLmsRepository, type LmsRepository } from '../lms/repository.js';

export type CreateLmsManageRoutesOptions = {
  lmsRepo?: LmsRepository;
  lmsMutations?: LmsMutations;
  rateLimitStore?: RateLimitStore;
};

function resolveMutations(env: ApiEnv, injected?: LmsMutations): LmsMutations {
  if (injected) return injected;
  if (!env.DB) {
    throw new ApiHttpError(503, 'SERVICE_UNAVAILABLE', 'Database binding is not available');
  }
  return createDrizzleLmsMutations(createDb(env.DB));
}

function resolveRepo(env: ApiEnv, injected?: LmsRepository): LmsRepository {
  if (injected) return injected;
  if (!env.DB) {
    throw new ApiHttpError(503, 'SERVICE_UNAVAILABLE', 'Database binding is not available');
  }
  return createDrizzleLmsRepository(createDb(env.DB));
}

const courseBodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  accessType: z.enum(['free', 'invite', 'paid']).optional(),
});

const coursePatchSchema = courseBodySchema.partial().extend({
  coverFileId: z.string().nullable().optional(),
});

const moduleBodySchema = z.object({
  title: z.string().min(1),
  position: z.number().int().positive().optional(),
});

const lessonBodySchema = z.object({
  title: z.string().min(1),
  type: z.enum(['text', 'video', 'file']).optional(),
  content: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  durationMin: z.number().nonnegative().nullable().optional(),
  position: z.number().int().positive().optional(),
  isRequired: z.boolean().optional(),
});

function parseBody<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Request body failed validation');
  }
  return parsed.data;
}

export function createLmsManageRoutes(options: CreateLmsManageRoutesOptions = {}) {
  const routes = new Hono<AuthedEnv>();

  routes.post('/api/v1/manage/courses', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.write')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const body = parseBody(courseBodySchema, await c.req.json());
    const mut = resolveMutations(c.env, options.lmsMutations);
    const course = await mut.createCourse({
      ...body,
      ownerId: user.sub,
      orgId: user.orgId,
    });
    return c.json(course, 201);
  });

  routes.patch('/api/v1/manage/courses/:courseId', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const course = await repo.getCourseById(c.req.param('courseId'));
    if (!course) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
    assertCanEditCourse(user, course);
    const body = parseBody(coursePatchSchema, await c.req.json());
    const mut = resolveMutations(c.env, options.lmsMutations);
    return c.json(await mut.updateCourse(course.id, body));
  });

  routes.post('/api/v1/manage/courses/:courseId/modules', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const course = await repo.getCourseById(c.req.param('courseId'));
    if (!course) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
    assertCanEditCourse(user, course);
    const body = parseBody(moduleBodySchema, await c.req.json());
    const mut = resolveMutations(c.env, options.lmsMutations);
    return c.json(await mut.createModule({ courseId: course.id, ...body }), 201);
  });

  routes.post('/api/v1/manage/modules/:moduleId/lessons', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const mut = resolveMutations(c.env, options.lmsMutations);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const courseId = await mut.getCourseIdForModule(c.req.param('moduleId'));
    if (!courseId) throw new ApiHttpError(404, 'NOT_FOUND', 'Module not found');
    const ownerCourse = await repo.getCourseById(courseId);
    if (!ownerCourse) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
    assertCanEditCourse(user, ownerCourse);
    const body = parseBody(lessonBodySchema, await c.req.json());
    return c.json(await mut.createLesson({ moduleId: c.req.param('moduleId'), ...body }), 201);
  });

  routes.post('/api/v1/manage/courses/:courseId/publish', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const course = await repo.getCourseById(c.req.param('courseId'));
    if (!course) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
    assertCanEditCourse(user, course);
    const mut = resolveMutations(c.env, options.lmsMutations);
    return c.json(await mut.publishCourse(course.id));
  });

  routes.post('/api/v1/manage/files', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.write')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const store = resolveRateLimitStore(c.env, options.rateLimitStore);
    if (store) {
      await enforceRateLimit(
        store,
        fileUploadUserKey(user.sub),
        FILE_UPLOAD_USER_WINDOW_SEC,
        FILE_UPLOAD_USER_LIMIT,
      );
    }
    if (!c.env.FILES) {
      throw new ApiHttpError(503, 'SERVICE_UNAVAILABLE', 'File storage (R2) is not configured');
    }
    const form = await c.req.formData();
    const file = form.get('file');
    const purpose = String(form.get('purpose') ?? 'course_material');
    if (!(file instanceof File)) {
      throw new ApiHttpError(400, 'VALIDATION_ERROR', 'file field is required');
    }
    const bytes = await file.arrayBuffer();
    const meta = await putCourseFile({
      r2: c.env.FILES,
      ownerId: user.sub,
      purpose,
      mime: file.type || 'application/octet-stream',
      bytes,
    });
    const mut = resolveMutations(c.env, options.lmsMutations);
    const saved = await mut.saveFileAsset(meta);
    return c.json(saved, 201);
  });

  const reorderIdsSchema = z.object({
    ids: z.array(z.string().min(1)).min(1),
  });

  routes.put('/api/v1/manage/courses/:courseId/modules/reorder', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const course = await repo.getCourseById(c.req.param('courseId'));
    if (!course) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
    assertCanEditCourse(user, course);
    const body = parseBody(reorderIdsSchema, await c.req.json());
    const mut = resolveMutations(c.env, options.lmsMutations);
    const modules = await mut.reorderModules(course.id, body.ids);
    return c.json({ courseId: course.id, modules });
  });

  routes.put('/api/v1/manage/modules/:moduleId/lessons/reorder', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const mut = resolveMutations(c.env, options.lmsMutations);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const moduleId = c.req.param('moduleId');
    const courseId = await mut.getCourseIdForModule(moduleId);
    if (!courseId) throw new ApiHttpError(404, 'NOT_FOUND', 'Module not found');
    const course = await repo.getCourseById(courseId);
    if (!course) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
    assertCanEditCourse(user, course);
    const body = parseBody(reorderIdsSchema, await c.req.json());
    const lessons = await mut.reorderLessons(moduleId, body.ids);
    return c.json({ moduleId, lessons });
  });

  routes.post('/api/v1/manage/lessons/:lessonId/archive', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const mut = resolveMutations(c.env, options.lmsMutations);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const lessonId = c.req.param('lessonId');
    const lesson = await repo.getLessonRow(lessonId);
    if (!lesson) throw new ApiHttpError(404, 'NOT_FOUND', 'Lesson not found');
    const course = await repo.getCourseById(lesson.courseId);
    if (!course) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
    assertCanEditCourse(user, course);
    const progressCount = await mut.countLessonProgress(lessonId);
    const archived = await mut.archiveLesson(lessonId);
    return c.json({ lesson: archived, hadProgress: progressCount > 0 });
  });

  routes.post('/api/v1/manage/modules/:moduleId/archive', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const mut = resolveMutations(c.env, options.lmsMutations);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const moduleId = c.req.param('moduleId');
    const courseId = await mut.getCourseIdForModule(moduleId);
    if (!courseId) throw new ApiHttpError(404, 'NOT_FOUND', 'Module not found');
    const course = await repo.getCourseById(courseId);
    if (!course) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
    assertCanEditCourse(user, course);
    return c.json(await mut.archiveModule(moduleId));
  });

  routes.post('/api/v1/manage/courses/:courseId/archive', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const repo = resolveRepo(c.env, options.lmsRepo);
    const course = await repo.getCourseById(c.req.param('courseId'));
    if (!course) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
    assertCanEditCourse(user, course);
    const mut = resolveMutations(c.env, options.lmsMutations);
    return c.json(await mut.archiveCourse(course.id));
  });

  return routes;
}
