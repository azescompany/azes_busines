/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/lms/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: LMS read DTO shapes (M1–M4)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type CourseStatus = 'draft' | 'published' | 'archived';
export type AccessType = 'free' | 'invite' | 'paid';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type LessonType = 'text' | 'video' | 'file';
export type EnrollmentStatus = 'active' | 'completed' | 'cancelled';
export type LessonProgressStatus = 'not_started' | 'in_progress' | 'completed';

export type CategoryDto = {
  id: string;
  name: string;
  slug: string;
};

export type CourseListItemDto = {
  id: string;
  orgId: string | null;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string | null;
  level: CourseLevel;
  status: CourseStatus;
  accessType: AccessType;
  ownerId: string;
  publishedAt: number | null;
};

export type CourseDetailDto = CourseListItemDto & {
  createdAt: number;
  updatedAt: number;
};

export type LessonSummaryDto = {
  id: string;
  title: string;
  type: LessonType;
  position: number;
  durationMin: number | null;
  isRequired: boolean;
  status: ContentStatus;
};

export type ModuleCurriculumDto = {
  id: string;
  title: string;
  position: number;
  status: ContentStatus;
  lessons: LessonSummaryDto[];
};

export type EnrollmentDto = {
  id: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: number;
  completedAt: number | null;
  course: CourseListItemDto | null;
};

export type LessonMaterialDto = {
  fileId: string;
  mime: string;
  size: number;
  signedUrl: string;
  expiresAt: number;
};

export type LessonDetailDto = {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  type: LessonType;
  content: string | null;
  videoUrl: string | null;
  durationMin: number | null;
  position: number;
  isRequired: boolean;
  status: ContentStatus;
  progressStatus: LessonProgressStatus;
  completedAt: number | null;
  prevLessonId: string | null;
  nextLessonId: string | null;
  material: LessonMaterialDto | null;
};

export type LessonProgressDto = {
  lessonId: string;
  enrollmentId: string;
  status: LessonProgressStatus;
  completedAt: number | null;
  lastPositionSec: number | null;
};

export type CourseProgressDto = {
  courseId: string;
  enrollmentId: string;
  completedRequired: number;
  totalRequired: number;
  percent: number;
  nextLessonId: string | null;
  lessons: {
    lessonId: string;
    status: LessonProgressStatus;
    completedAt: number | null;
  }[];
};

export type LearningItemDto = {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  status: EnrollmentStatus;
  percent: number;
  completedRequired: number;
  totalRequired: number;
  nextLessonId: string | null;
};

export type FileAssetDto = {
  id: string;
  ownerId: string;
  storageKey: string;
  mime: string;
  size: number;
  purpose: string;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

/** Internal lesson row used by progress/player (content included). */
export type LessonRowDto = {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  type: LessonType;
  content: string | null;
  videoUrl: string | null;
  durationMin: number | null;
  position: number;
  isRequired: boolean;
  status: ContentStatus;
  modulePosition: number;
};

export type ListCoursesQuery = {
  page: number;
  pageSize: number;
  q?: string;
  categoryId?: string;
  level?: CourseLevel;
  /** When true, include drafts owned by viewer / all for admin. */
  includeDrafts: boolean;
  viewerId: string;
  isAdmin: boolean;
  /**
   * Student catalog: published free OR course id in this set (from Tracks).
   * Ignored when includeDrafts is true.
   */
  accessibleCourseIds?: string[];
};
