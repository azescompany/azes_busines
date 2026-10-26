/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/lms/progress.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Course/lesson progress aggregation helpers (M4)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type {
  CourseProgressDto,
  LearningItemDto,
  LessonProgressStatus,
  LessonRowDto,
} from './types.js';

export function buildCourseProgress(options: {
  courseId: string;
  enrollmentId: string;
  lessons: LessonRowDto[];
  progressRows: { lessonId: string; status: LessonProgressStatus; completedAt: number | null }[];
}): CourseProgressDto {
  const byLesson = new Map(options.progressRows.map((p) => [p.lessonId, p]));
  const required = options.lessons.filter((l) => l.isRequired);
  const totalRequired = required.length;
  let completedRequired = 0;
  const lessons = options.lessons.map((l) => {
    const p = byLesson.get(l.id);
    const status: LessonProgressStatus = p?.status ?? 'not_started';
    if (l.isRequired && status === 'completed') completedRequired += 1;
    return {
      lessonId: l.id,
      status,
      completedAt: p?.completedAt ?? null,
    };
  });
  const percent = totalRequired === 0 ? 0 : Math.round((completedRequired / totalRequired) * 100);
  const next =
    options.lessons.find((l) => (byLesson.get(l.id)?.status ?? 'not_started') !== 'completed') ??
    null;
  return {
    courseId: options.courseId,
    enrollmentId: options.enrollmentId,
    completedRequired,
    totalRequired,
    percent,
    nextLessonId: next?.id ?? null,
    lessons,
  };
}

export function toLearningItem(options: {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  status: LearningItemDto['status'];
  progress: CourseProgressDto;
}): LearningItemDto {
  return {
    enrollmentId: options.enrollmentId,
    courseId: options.courseId,
    courseTitle: options.courseTitle,
    courseSlug: options.courseSlug,
    status: options.status,
    percent: options.progress.percent,
    completedRequired: options.progress.completedRequired,
    totalRequired: options.progress.totalRequired,
    nextLessonId: options.progress.nextLessonId,
  };
}

const FILE_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function looksLikeFileId(value: string | null | undefined): value is string {
  return Boolean(value && FILE_ID_RE.test(value.trim()));
}
