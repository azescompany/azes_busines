/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/lms/repository.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: LMS read repository — Drizzle D1 + in-memory for tests
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { and, asc, count, eq, inArray, or, sql } from 'drizzle-orm';

import type { ApiDb } from '../db/client.js';
import * as schema from '../db/schema.js';
import type {
  CategoryDto,
  CourseDetailDto,
  CourseListItemDto,
  EnrollmentDto,
  FileAssetDto,
  LessonProgressStatus,
  LessonRowDto,
  ListCoursesQuery,
  ModuleCurriculumDto,
  Paginated,
} from './types.js';

export type LmsRepository = {
  listCategories(): Promise<CategoryDto[]>;
  listCourses(query: ListCoursesQuery): Promise<Paginated<CourseListItemDto>>;
  getCourseBySlug(slug: string): Promise<CourseDetailDto | null>;
  getCourseById(id: string): Promise<CourseDetailDto | null>;
  getCurriculum(courseId: string): Promise<ModuleCurriculumDto[]>;
  listEnrollmentsForUser(userId: string): Promise<EnrollmentDto[]>;
  getEnrollment(userId: string, courseId: string): Promise<EnrollmentDto | null>;
  getLessonRow(lessonId: string): Promise<LessonRowDto | null>;
  listPublishedLessonRows(courseId: string): Promise<LessonRowDto[]>;
  getLessonProgress(
    enrollmentId: string,
    lessonId: string,
  ): Promise<{
    status: LessonProgressStatus;
    completedAt: number | null;
    lastPositionSec: number | null;
  } | null>;
  listLessonProgress(
    enrollmentId: string,
  ): Promise<{ lessonId: string; status: LessonProgressStatus; completedAt: number | null }[]>;
  getFileAsset(fileId: string): Promise<FileAssetDto | null>;
};

function mapCourse(row: typeof schema.courses.$inferSelect): CourseListItemDto {
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
  };
}

export function createDrizzleLmsRepository(db: ApiDb): LmsRepository {
  return {
    async listCategories() {
      const rows = await db.select().from(schema.categories).orderBy(asc(schema.categories.name));
      return rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug }));
    },

    async listCourses(query) {
      let visibility;
      if (query.includeDrafts) {
        visibility = query.isAdmin
          ? or(
              eq(schema.courses.status, 'published'),
              eq(schema.courses.status, 'draft'),
              eq(schema.courses.status, 'archived'),
            )
          : or(
              eq(schema.courses.status, 'published'),
              and(eq(schema.courses.status, 'draft'), eq(schema.courses.ownerId, query.viewerId)),
            );
      } else if (query.accessibleCourseIds) {
        const trackIds = query.accessibleCourseIds;
        visibility = and(
          eq(schema.courses.status, 'published'),
          trackIds.length > 0
            ? or(eq(schema.courses.accessType, 'free'), inArray(schema.courses.id, trackIds))
            : eq(schema.courses.accessType, 'free'),
        );
      } else {
        visibility = and(
          eq(schema.courses.status, 'published'),
          eq(schema.courses.accessType, 'free'),
        );
      }

      const filters = [visibility!];
      if (query.q?.trim()) {
        const term = `%${query.q.trim().toLowerCase()}%`;
        filters.push(
          or(
            sql`lower(${schema.courses.title}) like ${term}`,
            sql`lower(coalesce(${schema.courses.description}, '')) like ${term}`,
          )!,
        );
      }
      if (query.categoryId) {
        filters.push(eq(schema.courses.categoryId, query.categoryId));
      }
      if (query.level) {
        filters.push(eq(schema.courses.level, query.level));
      }

      const where = and(...filters);
      const totalRow = await db.select({ total: count() }).from(schema.courses).where(where);
      const total = Number(totalRow[0]?.total ?? 0);
      const offset = (query.page - 1) * query.pageSize;
      const rows = await db
        .select()
        .from(schema.courses)
        .where(where)
        .orderBy(asc(schema.courses.title))
        .limit(query.pageSize)
        .offset(offset);

      return {
        items: rows.map(mapCourse),
        page: query.page,
        pageSize: query.pageSize,
        total,
      };
    },

    async getCourseBySlug(slug) {
      const [row] = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.slug, slug))
        .limit(1);
      if (!row) return null;
      return {
        ...mapCourse(row),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    },

    async getCourseById(id) {
      const [row] = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.id, id))
        .limit(1);
      if (!row) return null;
      return {
        ...mapCourse(row),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    },

    async getCurriculum(courseId) {
      const mods = await db
        .select()
        .from(schema.modules)
        .where(eq(schema.modules.courseId, courseId))
        .orderBy(asc(schema.modules.position));
      const result: ModuleCurriculumDto[] = [];
      for (const mod of mods) {
        const lessons = await db
          .select()
          .from(schema.lessons)
          .where(eq(schema.lessons.moduleId, mod.id))
          .orderBy(asc(schema.lessons.position));
        result.push({
          id: mod.id,
          title: mod.title,
          position: mod.position,
          status: mod.status,
          lessons: lessons.map((l) => ({
            id: l.id,
            title: l.title,
            type: l.type,
            position: l.position,
            durationMin: l.durationMin ?? null,
            isRequired: Boolean(l.isRequired),
            status: l.status,
          })),
        });
      }
      return result;
    },

    async listEnrollmentsForUser(userId) {
      const rows = await db
        .select()
        .from(schema.enrollments)
        .where(eq(schema.enrollments.userId, userId))
        .orderBy(asc(schema.enrollments.enrolledAt));
      const out: EnrollmentDto[] = [];
      for (const e of rows) {
        const [course] = await db
          .select()
          .from(schema.courses)
          .where(eq(schema.courses.id, e.courseId))
          .limit(1);
        out.push({
          id: e.id,
          courseId: e.courseId,
          status: e.status,
          enrolledAt: e.enrolledAt,
          completedAt: e.completedAt ?? null,
          course: course ? mapCourse(course) : null,
        });
      }
      return out;
    },

    async getEnrollment(userId, courseId) {
      const [e] = await db
        .select()
        .from(schema.enrollments)
        .where(
          and(eq(schema.enrollments.userId, userId), eq(schema.enrollments.courseId, courseId)),
        )
        .limit(1);
      if (!e) return null;
      const [course] = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.id, e.courseId))
        .limit(1);
      return {
        id: e.id,
        courseId: e.courseId,
        status: e.status,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt ?? null,
        course: course ? mapCourse(course) : null,
      };
    },

    async getLessonRow(lessonId) {
      const [row] = await db
        .select({
          id: schema.lessons.id,
          moduleId: schema.lessons.moduleId,
          title: schema.lessons.title,
          type: schema.lessons.type,
          content: schema.lessons.content,
          videoUrl: schema.lessons.videoUrl,
          durationMin: schema.lessons.durationMin,
          position: schema.lessons.position,
          isRequired: schema.lessons.isRequired,
          status: schema.lessons.status,
          courseId: schema.modules.courseId,
          modulePosition: schema.modules.position,
        })
        .from(schema.lessons)
        .innerJoin(schema.modules, eq(schema.lessons.moduleId, schema.modules.id))
        .where(eq(schema.lessons.id, lessonId))
        .limit(1);
      if (!row) return null;
      return {
        id: row.id,
        courseId: row.courseId,
        moduleId: row.moduleId,
        title: row.title,
        type: row.type,
        content: row.content ?? null,
        videoUrl: row.videoUrl ?? null,
        durationMin: row.durationMin ?? null,
        position: row.position,
        isRequired: Boolean(row.isRequired),
        status: row.status,
        modulePosition: row.modulePosition,
      };
    },

    async listPublishedLessonRows(courseId) {
      const rows = await db
        .select({
          id: schema.lessons.id,
          moduleId: schema.lessons.moduleId,
          title: schema.lessons.title,
          type: schema.lessons.type,
          content: schema.lessons.content,
          videoUrl: schema.lessons.videoUrl,
          durationMin: schema.lessons.durationMin,
          position: schema.lessons.position,
          isRequired: schema.lessons.isRequired,
          status: schema.lessons.status,
          courseId: schema.modules.courseId,
          modulePosition: schema.modules.position,
        })
        .from(schema.lessons)
        .innerJoin(schema.modules, eq(schema.lessons.moduleId, schema.modules.id))
        .where(
          and(
            eq(schema.modules.courseId, courseId),
            eq(schema.lessons.status, 'published'),
            eq(schema.modules.status, 'published'),
          ),
        )
        .orderBy(asc(schema.modules.position), asc(schema.lessons.position));
      return rows.map((row) => ({
        id: row.id,
        courseId: row.courseId,
        moduleId: row.moduleId,
        title: row.title,
        type: row.type,
        content: row.content ?? null,
        videoUrl: row.videoUrl ?? null,
        durationMin: row.durationMin ?? null,
        position: row.position,
        isRequired: Boolean(row.isRequired),
        status: row.status,
        modulePosition: row.modulePosition,
      }));
    },

    async getLessonProgress(enrollmentId, lessonId) {
      const [row] = await db
        .select()
        .from(schema.lessonProgress)
        .where(
          and(
            eq(schema.lessonProgress.enrollmentId, enrollmentId),
            eq(schema.lessonProgress.lessonId, lessonId),
          ),
        )
        .limit(1);
      if (!row) return null;
      return {
        status: row.status,
        completedAt: row.completedAt ?? null,
        lastPositionSec: row.lastPositionSec ?? null,
      };
    },

    async listLessonProgress(enrollmentId) {
      const rows = await db
        .select()
        .from(schema.lessonProgress)
        .where(eq(schema.lessonProgress.enrollmentId, enrollmentId));
      return rows.map((r) => ({
        lessonId: r.lessonId,
        status: r.status,
        completedAt: r.completedAt ?? null,
      }));
    },

    async getFileAsset(fileId) {
      const [row] = await db
        .select()
        .from(schema.fileAssets)
        .where(eq(schema.fileAssets.id, fileId))
        .limit(1);
      if (!row) return null;
      return {
        id: row.id,
        ownerId: row.ownerId,
        storageKey: row.storageKey,
        mime: row.mime,
        size: row.size,
        purpose: row.purpose,
      };
    },
  };
}

/** Test helper — enrollments carry userId in memory seed. */
export type MemoryEnrollment = EnrollmentDto & { userId: string };

export type MemoryLessonExtra = {
  content?: string | null;
  videoUrl?: string | null;
};

export type MemoryProgress = {
  id: string;
  enrollmentId: string;
  lessonId: string;
  status: LessonProgressStatus;
  completedAt: number | null;
  lastPositionSec: number | null;
};

export function createMemoryLmsRepository(
  seed: {
    categories?: CategoryDto[];
    courses?: CourseDetailDto[];
    curriculum?: Record<string, ModuleCurriculumDto[]>;
    enrollments?: MemoryEnrollment[];
    /** lessonId → content/video extras for player tests */
    lessonExtras?: Record<string, MemoryLessonExtra>;
    progress?: MemoryProgress[];
    files?: FileAssetDto[];
  } = {},
): LmsRepository {
  // Share array/object references with mutations (tests pass the same seed objects).
  const categories = seed.categories ?? [];
  const courses = seed.courses ?? [];
  const curriculum = seed.curriculum ?? {};
  const enrollments = seed.enrollments ?? [];
  const lessonExtras = seed.lessonExtras ?? {};
  const progress = seed.progress ?? [];
  const files = seed.files ?? [];

  function flattenLessons(courseId: string): LessonRowDto[] {
    const mods = [...(curriculum[courseId] ?? [])].sort((a, b) => a.position - b.position);
    const out: LessonRowDto[] = [];
    for (const m of mods) {
      if (m.status !== 'published') continue;
      const lessons = [...m.lessons].sort((a, b) => a.position - b.position);
      for (const l of lessons) {
        if (l.status !== 'published') continue;
        const extra = lessonExtras[l.id] ?? {};
        out.push({
          id: l.id,
          courseId,
          moduleId: m.id,
          title: l.title,
          type: l.type,
          content: extra.content ?? null,
          videoUrl: extra.videoUrl ?? null,
          durationMin: l.durationMin,
          position: l.position,
          isRequired: l.isRequired,
          status: l.status,
          modulePosition: m.position,
        });
      }
    }
    return out;
  }

  return {
    async listCategories() {
      return [...categories].sort((a, b) => a.name.localeCompare(b.name));
    },
    async listCourses(query) {
      let items = courses.filter((c) => {
        if (query.includeDrafts) {
          if (query.isAdmin) return true;
          return c.status === 'published' || (c.status === 'draft' && c.ownerId === query.viewerId);
        }
        if (c.status !== 'published') return false;
        if (query.accessibleCourseIds) {
          return c.accessType === 'free' || query.accessibleCourseIds.includes(c.id);
        }
        return c.accessType === 'free';
      });
      if (query.q?.trim()) {
        const q = query.q.trim().toLowerCase();
        items = items.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            (c.description?.toLowerCase().includes(q) ?? false),
        );
      }
      if (query.categoryId) {
        items = items.filter((c) => c.categoryId === query.categoryId);
      }
      if (query.level) {
        items = items.filter((c) => c.level === query.level);
      }
      items = [...items].sort((a, b) => a.title.localeCompare(b.title));
      const total = items.length;
      const start = (query.page - 1) * query.pageSize;
      return {
        items: items.slice(start, start + query.pageSize),
        page: query.page,
        pageSize: query.pageSize,
        total,
      };
    },
    async getCourseBySlug(slug) {
      return courses.find((c) => c.slug === slug) ?? null;
    },
    async getCourseById(id) {
      return courses.find((c) => c.id === id) ?? null;
    },
    async getCurriculum(courseId) {
      return curriculum[courseId] ?? [];
    },
    async listEnrollmentsForUser(userId) {
      return enrollments.filter((e) => e.userId === userId).map(({ userId: _u, ...rest }) => rest);
    },
    async getEnrollment(userId, courseId) {
      const e = enrollments.find((x) => x.userId === userId && x.courseId === courseId);
      if (!e) return null;
      const { userId: _u, ...rest } = e;
      return rest;
    },
    async getLessonRow(lessonId) {
      for (const courseId of Object.keys(curriculum)) {
        const hit = flattenLessons(courseId).find((l) => l.id === lessonId);
        if (hit) return hit;
        // Also allow draft lookup for staff tests via full scan
        for (const m of curriculum[courseId] ?? []) {
          const l = m.lessons.find((x) => x.id === lessonId);
          if (l) {
            const extra = lessonExtras[l.id] ?? {};
            return {
              id: l.id,
              courseId,
              moduleId: m.id,
              title: l.title,
              type: l.type,
              content: extra.content ?? null,
              videoUrl: extra.videoUrl ?? null,
              durationMin: l.durationMin,
              position: l.position,
              isRequired: l.isRequired,
              status: l.status,
              modulePosition: m.position,
            };
          }
        }
      }
      return null;
    },
    async listPublishedLessonRows(courseId) {
      return flattenLessons(courseId);
    },
    async getLessonProgress(enrollmentId, lessonId) {
      const row = progress.find((p) => p.enrollmentId === enrollmentId && p.lessonId === lessonId);
      if (!row) return null;
      return {
        status: row.status,
        completedAt: row.completedAt,
        lastPositionSec: row.lastPositionSec,
      };
    },
    async listLessonProgress(enrollmentId) {
      return progress
        .filter((p) => p.enrollmentId === enrollmentId)
        .map((p) => ({
          lessonId: p.lessonId,
          status: p.status,
          completedAt: p.completedAt,
        }));
    },
    async getFileAsset(fileId) {
      return files.find((f) => f.id === fileId) ?? null;
    },
  };
}
