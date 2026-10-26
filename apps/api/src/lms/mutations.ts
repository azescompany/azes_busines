/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/lms/mutations.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: LMS write operations — create/update/publish + files
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { and, asc, count, eq } from 'drizzle-orm';

import { newId, nowSec } from '../auth/tokens.js';
import type { ApiDb } from '../db/client.js';
import * as schema from '../db/schema.js';
import { ApiHttpError } from '../errors.js';
import type { UploadedFileMeta } from './files.js';
import { sanitizeCourseContent, sanitizeTitle } from './sanitize.js';
import type {
  AccessType,
  ContentStatus,
  CourseDetailDto,
  CourseLevel,
  EnrollmentDto,
  LessonProgressDto,
  LessonSummaryDto,
  LessonType,
  ModuleCurriculumDto,
} from './types.js';
import type { MemoryEnrollment, MemoryProgress } from './repository.js';

export type CreateCourseInput = {
  title: string;
  slug?: string;
  description?: string | null;
  categoryId?: string | null;
  level?: CourseLevel;
  accessType?: AccessType;
  ownerId: string;
  orgId?: string | null;
};

export type UpdateCourseInput = {
  title?: string;
  description?: string | null;
  categoryId?: string | null;
  level?: CourseLevel;
  accessType?: AccessType;
  coverFileId?: string | null;
};

export type CreateModuleInput = {
  courseId: string;
  title: string;
  position?: number;
};

export type CreateLessonInput = {
  moduleId: string;
  title: string;
  type?: LessonType;
  content?: string | null;
  videoUrl?: string | null;
  durationMin?: number | null;
  position?: number;
  isRequired?: boolean;
};

export type LmsMutations = {
  createCourse(input: CreateCourseInput): Promise<CourseDetailDto>;
  updateCourse(id: string, input: UpdateCourseInput): Promise<CourseDetailDto>;
  createModule(input: CreateModuleInput): Promise<ModuleCurriculumDto>;
  createLesson(input: CreateLessonInput): Promise<LessonSummaryDto>;
  publishCourse(courseId: string): Promise<CourseDetailDto>;
  saveFileAsset(meta: UploadedFileMeta): Promise<UploadedFileMeta>;
  countPublishRequirements(courseId: string): Promise<{ modules: number; lessons: number }>;
  getCourseIdForModule(moduleId: string): Promise<string | null>;
  /** Idempotent enroll — returns existing enrollment if already active. */
  enrollCourse(userId: string, courseId: string): Promise<EnrollmentDto>;
  /** Idempotent complete — re-complete does not change completedAt. */
  completeLesson(userId: string, lessonId: string): Promise<LessonProgressDto>;
  reorderModules(courseId: string, moduleIds: string[]): Promise<ModuleCurriculumDto[]>;
  reorderLessons(moduleId: string, lessonIds: string[]): Promise<LessonSummaryDto[]>;
  archiveLesson(lessonId: string): Promise<LessonSummaryDto>;
  archiveModule(moduleId: string): Promise<ModuleCurriculumDto>;
  archiveCourse(courseId: string): Promise<CourseDetailDto>;
  countLessonProgress(lessonId: string): Promise<number>;
};

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return base || `course-${newId().slice(0, 8)}`;
}

function mapCourse(row: typeof schema.courses.$inferSelect): CourseDetailDto {
  return {
    id: row.id,
    orgId: row.orgId ?? null,
    title: row.title,
    slug: row.slug,
    description: row.description ?? null,
    categoryId: row.categoryId ?? null,
    level: row.level,
    status: row.status,
    accessType: row.accessType,
    ownerId: row.ownerId,
    publishedAt: row.publishedAt ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function createDrizzleLmsMutations(db: ApiDb): LmsMutations {
  return {
    async createCourse(input) {
      const title = sanitizeTitle(input.title);
      if (!title) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Title is required');
      }
      const ts = nowSec();
      const id = newId();
      let slug = sanitizeTitle(input.slug ?? '') || slugify(title);
      const existing = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.slug, slug))
        .limit(1);
      if (existing[0]) {
        slug = `${slug}-${id.slice(0, 6)}`;
      }
      await db.insert(schema.courses).values({
        id,
        orgId: input.orgId ?? null,
        title,
        slug,
        description: sanitizeCourseContent(input.description),
        categoryId: input.categoryId ?? null,
        level: input.level ?? 'beginner',
        coverFileId: null,
        status: 'draft',
        accessType: input.accessType ?? 'free',
        ownerId: input.ownerId,
        createdAt: ts,
        updatedAt: ts,
        publishedAt: null,
      });
      const course = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.id, id))
        .limit(1);
      return mapCourse(course[0]!);
    },

    async updateCourse(id, input) {
      const [row] = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.id, id))
        .limit(1);
      if (!row) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
      const title = input.title !== undefined ? sanitizeTitle(input.title) : row.title;
      if (!title) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Title is required');
      }
      const ts = nowSec();
      await db
        .update(schema.courses)
        .set({
          title,
          description:
            input.description !== undefined
              ? sanitizeCourseContent(input.description)
              : row.description,
          categoryId: input.categoryId !== undefined ? input.categoryId : row.categoryId,
          level: input.level ?? row.level,
          accessType: input.accessType ?? row.accessType,
          coverFileId: input.coverFileId !== undefined ? input.coverFileId : row.coverFileId,
          updatedAt: ts,
        })
        .where(eq(schema.courses.id, id));
      const [next] = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.id, id))
        .limit(1);
      return mapCourse(next!);
    },

    async createModule(input) {
      const title = sanitizeTitle(input.title);
      if (!title) throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Title is required');
      const [course] = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.id, input.courseId))
        .limit(1);
      if (!course) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
      const ts = nowSec();
      const id = newId();
      const position =
        input.position ??
        Number(
          (
            await db
              .select({ total: count() })
              .from(schema.modules)
              .where(eq(schema.modules.courseId, input.courseId))
          )[0]?.total ?? 0,
        ) + 1;
      await db.insert(schema.modules).values({
        id,
        courseId: input.courseId,
        title,
        position,
        status: 'draft' satisfies ContentStatus,
        createdAt: ts,
        updatedAt: ts,
      });
      return { id, title, position, status: 'draft', lessons: [] };
    },

    async createLesson(input) {
      const title = sanitizeTitle(input.title);
      if (!title) throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Title is required');
      const [mod] = await db
        .select()
        .from(schema.modules)
        .where(eq(schema.modules.id, input.moduleId))
        .limit(1);
      if (!mod) throw new ApiHttpError(404, 'NOT_FOUND', 'Module not found');
      const ts = nowSec();
      const id = newId();
      const position =
        input.position ??
        Number(
          (
            await db
              .select({ total: count() })
              .from(schema.lessons)
              .where(eq(schema.lessons.moduleId, input.moduleId))
          )[0]?.total ?? 0,
        ) + 1;
      await db.insert(schema.lessons).values({
        id,
        moduleId: input.moduleId,
        title,
        type: input.type ?? 'text',
        content: sanitizeCourseContent(input.content),
        videoUrl: input.videoUrl?.trim() || null,
        durationMin: input.durationMin ?? null,
        position,
        isRequired: input.isRequired ?? true,
        status: 'draft',
        createdAt: ts,
        updatedAt: ts,
      });
      return {
        id,
        title,
        type: input.type ?? 'text',
        position,
        durationMin: input.durationMin ?? null,
        isRequired: input.isRequired ?? true,
        status: 'draft',
      };
    },

    async countPublishRequirements(courseId) {
      const mods = await db
        .select({ total: count() })
        .from(schema.modules)
        .where(and(eq(schema.modules.courseId, courseId)));
      const moduleRows = await db
        .select({ id: schema.modules.id })
        .from(schema.modules)
        .where(eq(schema.modules.courseId, courseId))
        .orderBy(asc(schema.modules.position));
      let lessons = 0;
      for (const m of moduleRows) {
        const [row] = await db
          .select({ total: count() })
          .from(schema.lessons)
          .where(eq(schema.lessons.moduleId, m.id));
        lessons += Number(row?.total ?? 0);
      }
      return { modules: Number(mods[0]?.total ?? 0), lessons };
    },

    async publishCourse(courseId) {
      const [course] = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.id, courseId))
        .limit(1);
      if (!course) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
      const req = await this.countPublishRequirements(courseId);
      if (req.modules < 1 || req.lessons < 1) {
        throw new ApiHttpError(
          400,
          'VALIDATION_ERROR',
          'Publish requires at least 1 module and 1 lesson',
        );
      }
      const ts = nowSec();
      await db
        .update(schema.courses)
        .set({ status: 'published', publishedAt: course.publishedAt ?? ts, updatedAt: ts })
        .where(eq(schema.courses.id, courseId));
      await db
        .update(schema.modules)
        .set({ status: 'published', updatedAt: ts })
        .where(eq(schema.modules.courseId, courseId));
      const moduleRows = await db
        .select({ id: schema.modules.id })
        .from(schema.modules)
        .where(eq(schema.modules.courseId, courseId));
      for (const m of moduleRows) {
        await db
          .update(schema.lessons)
          .set({ status: 'published', updatedAt: ts })
          .where(eq(schema.lessons.moduleId, m.id));
      }
      const [next] = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.id, courseId))
        .limit(1);
      return mapCourse(next!);
    },

    async saveFileAsset(meta) {
      await db.insert(schema.fileAssets).values({
        id: meta.id,
        ownerId: meta.ownerId,
        storageKey: meta.storageKey,
        mime: meta.mime,
        size: meta.size,
        purpose: meta.purpose,
        createdAt: meta.createdAt,
        updatedAt: meta.updatedAt,
      });
      return meta;
    },

    async getCourseIdForModule(moduleId) {
      const [mod] = await db
        .select()
        .from(schema.modules)
        .where(eq(schema.modules.id, moduleId))
        .limit(1);
      return mod?.courseId ?? null;
    },

    async enrollCourse(userId, courseId) {
      const [course] = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.id, courseId))
        .limit(1);
      if (!course || course.status !== 'published') {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
      }
      const existing = await db
        .select()
        .from(schema.enrollments)
        .where(
          and(eq(schema.enrollments.userId, userId), eq(schema.enrollments.courseId, courseId)),
        )
        .limit(1);
      if (existing[0]) {
        const e = existing[0];
        return {
          id: e.id,
          courseId: e.courseId,
          status: e.status,
          enrolledAt: e.enrolledAt,
          completedAt: e.completedAt ?? null,
          course: mapCourse(course),
        };
      }
      const ts = nowSec();
      const id = newId();
      await db.insert(schema.enrollments).values({
        id,
        userId,
        courseId,
        status: 'active',
        enrolledAt: ts,
        completedAt: null,
        createdAt: ts,
        updatedAt: ts,
      });
      return {
        id,
        courseId,
        status: 'active',
        enrolledAt: ts,
        completedAt: null,
        course: mapCourse(course),
      };
    },

    async completeLesson(userId, lessonId) {
      const [lesson] = await db
        .select({
          id: schema.lessons.id,
          status: schema.lessons.status,
          courseId: schema.modules.courseId,
        })
        .from(schema.lessons)
        .innerJoin(schema.modules, eq(schema.lessons.moduleId, schema.modules.id))
        .where(eq(schema.lessons.id, lessonId))
        .limit(1);
      if (!lesson || lesson.status !== 'published') {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Lesson not found');
      }
      const [enrollment] = await db
        .select()
        .from(schema.enrollments)
        .where(
          and(
            eq(schema.enrollments.userId, userId),
            eq(schema.enrollments.courseId, lesson.courseId),
            eq(schema.enrollments.status, 'active'),
          ),
        )
        .limit(1);
      if (!enrollment) {
        throw new ApiHttpError(403, 'FORBIDDEN', 'Enrollment required');
      }
      const [existing] = await db
        .select()
        .from(schema.lessonProgress)
        .where(
          and(
            eq(schema.lessonProgress.enrollmentId, enrollment.id),
            eq(schema.lessonProgress.lessonId, lessonId),
          ),
        )
        .limit(1);
      if (existing?.status === 'completed') {
        return {
          lessonId,
          enrollmentId: enrollment.id,
          status: 'completed' as const,
          completedAt: existing.completedAt ?? null,
          lastPositionSec: existing.lastPositionSec ?? null,
        };
      }
      const ts = nowSec();
      if (existing) {
        await db
          .update(schema.lessonProgress)
          .set({
            status: 'completed',
            completedAt: ts,
            updatedAt: ts,
          })
          .where(eq(schema.lessonProgress.id, existing.id));
      } else {
        await db.insert(schema.lessonProgress).values({
          id: newId(),
          enrollmentId: enrollment.id,
          lessonId,
          status: 'completed',
          completedAt: ts,
          lastPositionSec: null,
          createdAt: ts,
          updatedAt: ts,
        });
      }
      return {
        lessonId,
        enrollmentId: enrollment.id,
        status: 'completed' as const,
        completedAt: ts,
        lastPositionSec: null,
      };
    },

    async reorderModules(courseId, moduleIds) {
      const mods = await db
        .select()
        .from(schema.modules)
        .where(eq(schema.modules.courseId, courseId));
      if (mods.length !== moduleIds.length) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'moduleIds must include every module once');
      }
      const set = new Set(mods.map((m) => m.id));
      for (const id of moduleIds) {
        if (!set.has(id)) {
          throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Unknown module id in reorder list');
        }
      }
      const ts = nowSec();
      for (let i = 0; i < moduleIds.length; i += 1) {
        await db
          .update(schema.modules)
          .set({ position: i + 1, updatedAt: ts })
          .where(eq(schema.modules.id, moduleIds[i]!));
      }
      const ordered = await db
        .select()
        .from(schema.modules)
        .where(eq(schema.modules.courseId, courseId))
        .orderBy(asc(schema.modules.position));
      return ordered.map((m) => ({
        id: m.id,
        title: m.title,
        position: m.position,
        status: m.status,
        lessons: [],
      }));
    },

    async reorderLessons(moduleId, lessonIds) {
      const lessons = await db
        .select()
        .from(schema.lessons)
        .where(eq(schema.lessons.moduleId, moduleId));
      if (lessons.length !== lessonIds.length) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'lessonIds must include every lesson once');
      }
      const set = new Set(lessons.map((l) => l.id));
      for (const id of lessonIds) {
        if (!set.has(id)) {
          throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Unknown lesson id in reorder list');
        }
      }
      const ts = nowSec();
      for (let i = 0; i < lessonIds.length; i += 1) {
        await db
          .update(schema.lessons)
          .set({ position: i + 1, updatedAt: ts })
          .where(eq(schema.lessons.id, lessonIds[i]!));
      }
      const ordered = await db
        .select()
        .from(schema.lessons)
        .where(eq(schema.lessons.moduleId, moduleId))
        .orderBy(asc(schema.lessons.position));
      return ordered.map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        position: l.position,
        durationMin: l.durationMin ?? null,
        isRequired: Boolean(l.isRequired),
        status: l.status,
      }));
    },

    async archiveLesson(lessonId) {
      const [lesson] = await db
        .select()
        .from(schema.lessons)
        .where(eq(schema.lessons.id, lessonId))
        .limit(1);
      if (!lesson) throw new ApiHttpError(404, 'NOT_FOUND', 'Lesson not found');
      const ts = nowSec();
      await db
        .update(schema.lessons)
        .set({ status: 'archived', updatedAt: ts })
        .where(eq(schema.lessons.id, lessonId));
      return {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        position: lesson.position,
        durationMin: lesson.durationMin ?? null,
        isRequired: Boolean(lesson.isRequired),
        status: 'archived' as const,
      };
    },

    async archiveModule(moduleId) {
      const [mod] = await db
        .select()
        .from(schema.modules)
        .where(eq(schema.modules.id, moduleId))
        .limit(1);
      if (!mod) throw new ApiHttpError(404, 'NOT_FOUND', 'Module not found');
      const ts = nowSec();
      await db
        .update(schema.modules)
        .set({ status: 'archived', updatedAt: ts })
        .where(eq(schema.modules.id, moduleId));
      await db
        .update(schema.lessons)
        .set({ status: 'archived', updatedAt: ts })
        .where(eq(schema.lessons.moduleId, moduleId));
      return {
        id: mod.id,
        title: mod.title,
        position: mod.position,
        status: 'archived' as const,
        lessons: [],
      };
    },

    async archiveCourse(courseId) {
      const [course] = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.id, courseId))
        .limit(1);
      if (!course) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
      const ts = nowSec();
      await db
        .update(schema.courses)
        .set({ status: 'archived', updatedAt: ts })
        .where(eq(schema.courses.id, courseId));
      return {
        ...mapCourse(course),
        status: 'archived' as const,
        createdAt: course.createdAt,
        updatedAt: ts,
      };
    },

    async countLessonProgress(lessonId) {
      const [row] = await db
        .select({ total: count() })
        .from(schema.lessonProgress)
        .where(eq(schema.lessonProgress.lessonId, lessonId));
      return Number(row?.total ?? 0);
    },
  };
}

export function createMemoryLmsMutations(state: {
  courses: CourseDetailDto[];
  curriculum: Record<string, ModuleCurriculumDto[]>;
  files?: UploadedFileMeta[];
  enrollments?: MemoryEnrollment[];
  progress?: MemoryProgress[];
}): LmsMutations {
  const files = state.files ?? [];
  const enrollments = state.enrollments ?? [];
  const progress = state.progress ?? [];
  return {
    async createCourse(input) {
      const title = sanitizeTitle(input.title);
      if (!title) throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Title is required');
      const ts = nowSec();
      const id = newId();
      const course: CourseDetailDto = {
        id,
        orgId: input.orgId ?? null,
        title,
        slug: slugify(title),
        description: sanitizeCourseContent(input.description),
        categoryId: input.categoryId ?? null,
        level: input.level ?? 'beginner',
        status: 'draft',
        accessType: input.accessType ?? 'free',
        ownerId: input.ownerId,
        publishedAt: null,
        createdAt: ts,
        updatedAt: ts,
      };
      state.courses.push(course);
      state.curriculum[id] = [];
      return course;
    },
    async updateCourse(id, input) {
      const idx = state.courses.findIndex((c) => c.id === id);
      if (idx < 0) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
      const cur = state.courses[idx]!;
      const title = input.title !== undefined ? sanitizeTitle(input.title) : cur.title;
      if (!title) throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Title is required');
      const next: CourseDetailDto = {
        ...cur,
        title,
        description:
          input.description !== undefined
            ? sanitizeCourseContent(input.description)
            : cur.description,
        categoryId: input.categoryId !== undefined ? input.categoryId : cur.categoryId,
        level: input.level ?? cur.level,
        accessType: input.accessType ?? cur.accessType,
        updatedAt: nowSec(),
      };
      state.courses[idx] = next;
      return next;
    },
    async createModule(input) {
      const title = sanitizeTitle(input.title);
      if (!title) throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Title is required');
      if (!state.courses.some((c) => c.id === input.courseId)) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
      }
      const list = state.curriculum[input.courseId] ?? (state.curriculum[input.courseId] = []);
      const mod: ModuleCurriculumDto = {
        id: newId(),
        title,
        position: input.position ?? list.length + 1,
        status: 'draft',
        lessons: [],
      };
      list.push(mod);
      return mod;
    },
    async createLesson(input) {
      const title = sanitizeTitle(input.title);
      if (!title) throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Title is required');
      for (const mods of Object.values(state.curriculum)) {
        const mod = mods.find((m) => m.id === input.moduleId);
        if (mod) {
          const lesson: LessonSummaryDto = {
            id: newId(),
            title,
            type: input.type ?? 'text',
            position: input.position ?? mod.lessons.length + 1,
            durationMin: input.durationMin ?? null,
            isRequired: input.isRequired ?? true,
            status: 'draft',
          };
          mod.lessons.push(lesson);
          return lesson;
        }
      }
      throw new ApiHttpError(404, 'NOT_FOUND', 'Module not found');
    },
    async countPublishRequirements(courseId) {
      const mods = state.curriculum[courseId] ?? [];
      return {
        modules: mods.length,
        lessons: mods.reduce((n, m) => n + m.lessons.length, 0),
      };
    },
    async publishCourse(courseId) {
      const idx = state.courses.findIndex((c) => c.id === courseId);
      if (idx < 0) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
      const req = await this.countPublishRequirements(courseId);
      if (req.modules < 1 || req.lessons < 1) {
        throw new ApiHttpError(
          400,
          'VALIDATION_ERROR',
          'Publish requires at least 1 module and 1 lesson',
        );
      }
      const ts = nowSec();
      const next = {
        ...state.courses[idx]!,
        status: 'published' as const,
        publishedAt: state.courses[idx]!.publishedAt ?? ts,
        updatedAt: ts,
      };
      state.courses[idx] = next;
      const mods = state.curriculum[courseId] ?? [];
      for (const m of mods) {
        m.status = 'published';
        for (const l of m.lessons) l.status = 'published';
      }
      return next;
    },
    async saveFileAsset(meta) {
      files.push(meta);
      return meta;
    },
    async getCourseIdForModule(moduleId) {
      for (const [courseId, mods] of Object.entries(state.curriculum)) {
        if (mods.some((m) => m.id === moduleId)) return courseId;
      }
      return null;
    },
    async enrollCourse(userId, courseId) {
      const course = state.courses.find((c) => c.id === courseId);
      if (!course || course.status !== 'published') {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
      }
      const existing = enrollments.find((e) => e.userId === userId && e.courseId === courseId);
      if (existing) {
        const { userId: _u, ...rest } = existing;
        return rest;
      }
      const ts = nowSec();
      const row: MemoryEnrollment = {
        id: newId(),
        userId,
        courseId,
        status: 'active',
        enrolledAt: ts,
        completedAt: null,
        course,
      };
      enrollments.push(row);
      const { userId: _u, ...rest } = row;
      return rest;
    },

    async completeLesson(userId, lessonId) {
      let courseId: string | null = null;
      let lessonStatus: string | null = null;
      for (const [cid, mods] of Object.entries(state.curriculum)) {
        for (const m of mods) {
          const l = m.lessons.find((x) => x.id === lessonId);
          if (l) {
            courseId = cid;
            lessonStatus = l.status;
            break;
          }
        }
        if (courseId) break;
      }
      if (!courseId || lessonStatus !== 'published') {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Lesson not found');
      }
      const enrollment = enrollments.find(
        (e) => e.userId === userId && e.courseId === courseId && e.status === 'active',
      );
      if (!enrollment) {
        throw new ApiHttpError(403, 'FORBIDDEN', 'Enrollment required');
      }
      const existing = progress.find(
        (p) => p.enrollmentId === enrollment.id && p.lessonId === lessonId,
      );
      if (existing?.status === 'completed') {
        return {
          lessonId,
          enrollmentId: enrollment.id,
          status: 'completed',
          completedAt: existing.completedAt,
          lastPositionSec: existing.lastPositionSec,
        };
      }
      const ts = nowSec();
      if (existing) {
        existing.status = 'completed';
        existing.completedAt = ts;
        return {
          lessonId,
          enrollmentId: enrollment.id,
          status: 'completed',
          completedAt: ts,
          lastPositionSec: existing.lastPositionSec,
        };
      }
      progress.push({
        id: newId(),
        enrollmentId: enrollment.id,
        lessonId,
        status: 'completed',
        completedAt: ts,
        lastPositionSec: null,
      });
      return {
        lessonId,
        enrollmentId: enrollment.id,
        status: 'completed',
        completedAt: ts,
        lastPositionSec: null,
      };
    },

    async reorderModules(courseId, moduleIds) {
      const mods = state.curriculum[courseId] ?? [];
      if (mods.length !== moduleIds.length) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'moduleIds must include every module once');
      }
      const byId = new Map(mods.map((m) => [m.id, m]));
      const next: ModuleCurriculumDto[] = [];
      for (let i = 0; i < moduleIds.length; i += 1) {
        const m = byId.get(moduleIds[i]!);
        if (!m)
          throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Unknown module id in reorder list');
        m.position = i + 1;
        next.push(m);
      }
      state.curriculum[courseId] = next;
      return next.map((m) => ({ ...m, lessons: [] }));
    },

    async reorderLessons(moduleId, lessonIds) {
      for (const mods of Object.values(state.curriculum)) {
        const mod = mods.find((m) => m.id === moduleId);
        if (!mod) continue;
        if (mod.lessons.length !== lessonIds.length) {
          throw new ApiHttpError(
            400,
            'VALIDATION_ERROR',
            'lessonIds must include every lesson once',
          );
        }
        const byId = new Map(mod.lessons.map((l) => [l.id, l]));
        const next: LessonSummaryDto[] = [];
        for (let i = 0; i < lessonIds.length; i += 1) {
          const l = byId.get(lessonIds[i]!);
          if (!l)
            throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Unknown lesson id in reorder list');
          l.position = i + 1;
          next.push(l);
        }
        mod.lessons = next;
        return next;
      }
      throw new ApiHttpError(404, 'NOT_FOUND', 'Module not found');
    },

    async archiveLesson(lessonId) {
      for (const mods of Object.values(state.curriculum)) {
        for (const m of mods) {
          const l = m.lessons.find((x) => x.id === lessonId);
          if (l) {
            l.status = 'archived';
            return l;
          }
        }
      }
      throw new ApiHttpError(404, 'NOT_FOUND', 'Lesson not found');
    },

    async archiveModule(moduleId) {
      for (const mods of Object.values(state.curriculum)) {
        const m = mods.find((x) => x.id === moduleId);
        if (m) {
          m.status = 'archived';
          for (const l of m.lessons) l.status = 'archived';
          return { ...m, lessons: [] };
        }
      }
      throw new ApiHttpError(404, 'NOT_FOUND', 'Module not found');
    },

    async archiveCourse(courseId) {
      const idx = state.courses.findIndex((c) => c.id === courseId);
      if (idx < 0) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
      const ts = nowSec();
      const next = { ...state.courses[idx]!, status: 'archived' as const, updatedAt: ts };
      state.courses[idx] = next;
      return next;
    },

    async countLessonProgress(lessonId) {
      return progress.filter((p) => p.lessonId === lessonId).length;
    },
  };
}
