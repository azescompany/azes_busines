/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/azes/courses/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-20
 * ║ Purpose: AZES courses API facade
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export {
  getApiV1Categories,
  getApiV1Courses,
  getApiV1CoursesCourseIdCurriculum,
  getApiV1CoursesCourseIdProgress,
  getApiV1CoursesSlug,
  getApiV1FilesFileIdContent,
  getApiV1LessonsLessonId,
  getApiV1MeEnrollments,
  getApiV1MeLearning,
  getGetApiV1CategoriesQueryKey,
  getGetApiV1CategoriesQueryOptions,
  getGetApiV1CoursesCourseIdCurriculumQueryKey,
  getGetApiV1CoursesCourseIdCurriculumQueryOptions,
  getGetApiV1CoursesCourseIdProgressQueryKey,
  getGetApiV1CoursesCourseIdProgressQueryOptions,
  getGetApiV1CoursesQueryKey,
  getGetApiV1CoursesQueryOptions,
  getGetApiV1CoursesSlugQueryKey,
  getGetApiV1CoursesSlugQueryOptions,
  getGetApiV1FilesFileIdContentQueryKey,
  getGetApiV1FilesFileIdContentQueryOptions,
  getGetApiV1LessonsLessonIdQueryKey,
  getGetApiV1LessonsLessonIdQueryOptions,
  getGetApiV1MeEnrollmentsQueryKey,
  getGetApiV1MeEnrollmentsQueryOptions,
  getGetApiV1MeLearningQueryKey,
  getGetApiV1MeLearningQueryOptions,
  postApiV1CoursesCourseIdEnroll,
  postApiV1LessonsLessonIdComplete,
  useGetApiV1Categories,
  useGetApiV1Courses,
  useGetApiV1CoursesCourseIdCurriculum,
  useGetApiV1CoursesCourseIdProgress,
  useGetApiV1CoursesSlug,
  useGetApiV1FilesFileIdContent,
  useGetApiV1LessonsLessonId,
  useGetApiV1MeEnrollments,
  useGetApiV1MeLearning,
  usePostApiV1CoursesCourseIdEnroll,
  usePostApiV1LessonsLessonIdComplete,
} from '../../../generated/azes/courses/courses';
export type * from '../../../generated/azes/courses/courses';
