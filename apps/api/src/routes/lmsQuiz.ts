/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/lmsQuiz.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Quiz + assignment HTTP routes (M6)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Hono } from 'hono';
import { z } from 'zod';

import { can } from '../auth/permissions.js';
import {
  enforceRateLimit,
  QUIZ_SUBMIT_USER_LIMIT,
  QUIZ_SUBMIT_USER_WINDOW_SEC,
  quizSubmitUserKey,
  resolveRateLimitStore,
  type RateLimitStore,
} from '../auth/rateLimit.js';
import { getAuthUser, requireAuth, type AuthedEnv } from '../auth/requireAuth.js';
import { assertCanEditCourse } from '../auth/scope.js';
import { createDb } from '../db/client.js';
import type { ApiEnv } from '../env.js';
import { ApiHttpError } from '../errors.js';
import { createDrizzleLmsRepository, type LmsRepository } from '../lms/repository.js';
import { createDrizzleQuizService, type QuizService } from '../lms/quizService.js';

export type CreateLmsQuizRoutesOptions = {
  quizService?: QuizService;
  lmsRepo?: LmsRepository;
  rateLimitStore?: RateLimitStore;
};

function resolveQuiz(env: ApiEnv, injected?: QuizService): QuizService {
  if (injected) return injected;
  if (!env.DB) {
    throw new ApiHttpError(503, 'SERVICE_UNAVAILABLE', 'Database binding is not available');
  }
  return createDrizzleQuizService(createDb(env.DB));
}

function resolveRepo(env: ApiEnv, injected?: LmsRepository): LmsRepository {
  if (injected) return injected;
  if (!env.DB) {
    throw new ApiHttpError(503, 'SERVICE_UNAVAILABLE', 'Database binding is not available');
  }
  return createDrizzleLmsRepository(createDb(env.DB));
}

function parseBody<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Request body failed validation');
  }
  return parsed.data;
}

const quizCreateSchema = z.object({
  title: z.string().min(1),
  lessonId: z.string().nullable().optional(),
  timeLimitSec: z.number().int().positive().nullable().optional(),
  maxAttempts: z.number().int().positive().optional(),
  passScore: z.number().int().min(0).max(100).optional(),
});

const questionCreateSchema = z.object({
  type: z.enum(['single_choice', 'multiple_choice', 'short_text']),
  text: z.string().min(1),
  options: z
    .array(z.object({ id: z.string().min(1), label: z.string().min(1) }))
    .nullable()
    .optional(),
  correctAnswer: z.unknown(),
  explanation: z.string().nullable().optional(),
  points: z.number().int().positive().optional(),
  position: z.number().int().positive().optional(),
});

const startAttemptSchema = z.object({
  idempotencyKey: z.string().min(1).optional(),
});

const submitAttemptSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
  idempotencyKey: z.string().min(1).optional(),
});

const assignmentCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  lessonId: z.string().nullable().optional(),
  dueAt: z.number().int().nullable().optional(),
});

const submitAssignmentSchema = z.object({
  content: z.string().nullable().optional(),
  fileId: z.string().nullable().optional(),
  idempotencyKey: z.string().min(1).optional(),
});

const gradeSchema = z.object({
  score: z.number().int().min(0).max(100),
  feedback: z.string().nullable().optional(),
});

async function requireCourseEdit(
  repo: LmsRepository,
  user: ReturnType<typeof getAuthUser>,
  courseId: string,
) {
  const course = await repo.getCourseById(courseId);
  if (!course) throw new ApiHttpError(404, 'NOT_FOUND', 'Course not found');
  assertCanEditCourse(user, course);
  return course;
}

async function requireEnrolled(repo: LmsRepository, userId: string, courseId: string) {
  const enrollment = await repo.getEnrollment(userId, courseId);
  if (!enrollment || enrollment.status === 'cancelled') {
    throw new ApiHttpError(403, 'FORBIDDEN', 'Enrollment required');
  }
}

export function createLmsQuizRoutes(options: CreateLmsQuizRoutesOptions = {}) {
  const routes = new Hono<AuthedEnv>();

  // —— Manage: quizzes ——
  routes.post('/api/v1/manage/courses/:courseId/quizzes', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.write')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const courseId = c.req.param('courseId');
    const repo = resolveRepo(c.env, options.lmsRepo);
    await requireCourseEdit(repo, user, courseId);
    const body = parseBody(quizCreateSchema, await c.req.json());
    const quiz = resolveQuiz(c.env, options.quizService);
    return c.json(
      await quiz.createQuiz({
        courseId,
        title: body.title,
        lessonId: body.lessonId,
        timeLimitSec: body.timeLimitSec,
        maxAttempts: body.maxAttempts,
        passScore: body.passScore,
      }),
      201,
    );
  });

  routes.get('/api/v1/manage/courses/:courseId/quizzes', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.write')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const courseId = c.req.param('courseId');
    const repo = resolveRepo(c.env, options.lmsRepo);
    await requireCourseEdit(repo, user, courseId);
    const quiz = resolveQuiz(c.env, options.quizService);
    return c.json({ items: await quiz.listQuizzesForCourse(courseId) });
  });

  routes.get('/api/v1/manage/quizzes/:quizId', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.write')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const quizSvc = resolveQuiz(c.env, options.quizService);
    const courseId = await quizSvc.getQuizCourseId(c.req.param('quizId'));
    if (!courseId) throw new ApiHttpError(404, 'NOT_FOUND', 'Quiz not found');
    const repo = resolveRepo(c.env, options.lmsRepo);
    await requireCourseEdit(repo, user, courseId);
    return c.json(await quizSvc.getQuizStaff(c.req.param('quizId')));
  });

  routes.post('/api/v1/manage/quizzes/:quizId/questions', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.write')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const quizSvc = resolveQuiz(c.env, options.quizService);
    const quizId = c.req.param('quizId');
    const courseId = await quizSvc.getQuizCourseId(quizId);
    if (!courseId) throw new ApiHttpError(404, 'NOT_FOUND', 'Quiz not found');
    const repo = resolveRepo(c.env, options.lmsRepo);
    await requireCourseEdit(repo, user, courseId);
    const body = parseBody(questionCreateSchema, await c.req.json());
    return c.json(
      await quizSvc.addQuestion({
        quizId,
        type: body.type,
        text: body.text,
        options: body.options,
        correctAnswer: body.correctAnswer,
        explanation: body.explanation,
        points: body.points,
        position: body.position,
      }),
      201,
    );
  });

  routes.post('/api/v1/manage/quizzes/:quizId/publish', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.write')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const quizSvc = resolveQuiz(c.env, options.quizService);
    const quizId = c.req.param('quizId');
    const courseId = await quizSvc.getQuizCourseId(quizId);
    if (!courseId) throw new ApiHttpError(404, 'NOT_FOUND', 'Quiz not found');
    const repo = resolveRepo(c.env, options.lmsRepo);
    await requireCourseEdit(repo, user, courseId);
    return c.json(await quizSvc.publishQuiz(quizId));
  });

  routes.post('/api/v1/manage/courses/:courseId/assignments', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.write')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const courseId = c.req.param('courseId');
    const repo = resolveRepo(c.env, options.lmsRepo);
    await requireCourseEdit(repo, user, courseId);
    const body = parseBody(assignmentCreateSchema, await c.req.json());
    const quiz = resolveQuiz(c.env, options.quizService);
    return c.json(
      await quiz.createAssignment({
        courseId,
        title: body.title,
        description: body.description,
        lessonId: body.lessonId,
        dueAt: body.dueAt,
      }),
      201,
    );
  });

  routes.post('/api/v1/manage/assignments/:assignmentId/publish', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.write')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const quiz = resolveQuiz(c.env, options.quizService);
    const courseId = await quiz.getAssignmentCourseId(c.req.param('assignmentId'));
    if (!courseId) throw new ApiHttpError(404, 'NOT_FOUND', 'Assignment not found');
    const repo = resolveRepo(c.env, options.lmsRepo);
    await requireCourseEdit(repo, user, courseId);
    return c.json(await quiz.publishAssignment(c.req.param('assignmentId')));
  });

  routes.get('/api/v1/manage/assignments/:assignmentId/submissions', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.write')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const quiz = resolveQuiz(c.env, options.quizService);
    const courseId = await quiz.getAssignmentCourseId(c.req.param('assignmentId'));
    if (!courseId) throw new ApiHttpError(404, 'NOT_FOUND', 'Assignment not found');
    const repo = resolveRepo(c.env, options.lmsRepo);
    await requireCourseEdit(repo, user, courseId);
    return c.json({ items: await quiz.listSubmissions(c.req.param('assignmentId')) });
  });

  routes.post('/api/v1/manage/submissions/:submissionId/grade', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.write')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const body = parseBody(gradeSchema, await c.req.json());
    const quiz = resolveQuiz(c.env, options.quizService);
    return c.json(
      await quiz.gradeSubmission({
        submissionId: c.req.param('submissionId'),
        gradedBy: user.sub,
        score: body.score,
        feedback: body.feedback,
      }),
    );
  });

  // —— Student: quizzes ——
  routes.get('/api/v1/courses/:courseId/quizzes', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.learn') && !can(user.roles, 'course.write')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const courseId = c.req.param('courseId');
    const repo = resolveRepo(c.env, options.lmsRepo);
    if (can(user.roles, 'course.learn') && !can(user.roles, 'course.write')) {
      await requireEnrolled(repo, user.sub, courseId);
    }
    const quiz = resolveQuiz(c.env, options.quizService);
    return c.json({ items: await quiz.listQuizzesForCourse(courseId, { publishedOnly: true }) });
  });

  routes.get('/api/v1/quizzes/:quizId', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const quizSvc = resolveQuiz(c.env, options.quizService);
    const take = await quizSvc.getQuizTake(c.req.param('quizId'));
    const repo = resolveRepo(c.env, options.lmsRepo);
    if (!can(user.roles, 'course.write')) {
      if (!can(user.roles, 'course.learn')) {
        throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
      }
      await requireEnrolled(repo, user.sub, take.courseId);
    }
    // Strip any accidental leakage — take DTO has no correctAnswer.
    return c.json(take);
  });

  routes.post('/api/v1/quizzes/:quizId/attempts', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.learn')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const quizSvc = resolveQuiz(c.env, options.quizService);
    const courseId = await quizSvc.getQuizCourseId(c.req.param('quizId'));
    if (!courseId) throw new ApiHttpError(404, 'NOT_FOUND', 'Quiz not found');
    const repo = resolveRepo(c.env, options.lmsRepo);
    await requireEnrolled(repo, user.sub, courseId);
    const body = parseBody(startAttemptSchema, await c.req.json().catch(() => ({})));
    const started = await quizSvc.startAttempt({
      quizId: c.req.param('quizId'),
      userId: user.sub,
      idempotencyKey: body.idempotencyKey,
    });
    return c.json(started, 201);
  });

  routes.post('/api/v1/attempts/:attemptId/submit', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.learn')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const store = resolveRateLimitStore(c.env, options.rateLimitStore);
    if (store) {
      await enforceRateLimit(
        store,
        quizSubmitUserKey(user.sub),
        QUIZ_SUBMIT_USER_WINDOW_SEC,
        QUIZ_SUBMIT_USER_LIMIT,
      );
    }
    const body = parseBody(submitAttemptSchema, await c.req.json());
    const quizSvc = resolveQuiz(c.env, options.quizService);
    return c.json(
      await quizSvc.submitAttempt({
        attemptId: c.req.param('attemptId'),
        userId: user.sub,
        answers: body.answers,
        idempotencyKey: body.idempotencyKey,
      }),
    );
  });

  routes.get('/api/v1/attempts/:attemptId/result', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.learn') && !can(user.roles, 'course.write')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const quizSvc = resolveQuiz(c.env, options.quizService);
    return c.json(await quizSvc.getAttemptResult(c.req.param('attemptId'), user.sub));
  });

  routes.get('/api/v1/courses/:courseId/assignments', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    const courseId = c.req.param('courseId');
    const repo = resolveRepo(c.env, options.lmsRepo);
    if (!can(user.roles, 'course.write')) {
      if (!can(user.roles, 'course.learn')) {
        throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
      }
      await requireEnrolled(repo, user.sub, courseId);
    }
    const quiz = resolveQuiz(c.env, options.quizService);
    return c.json({
      items: await quiz.listAssignmentsForCourse(courseId, { publishedOnly: true }),
    });
  });

  routes.post('/api/v1/assignments/:assignmentId/submissions', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.learn')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const quiz = resolveQuiz(c.env, options.quizService);
    const courseId = await quiz.getAssignmentCourseId(c.req.param('assignmentId'));
    if (!courseId) throw new ApiHttpError(404, 'NOT_FOUND', 'Assignment not found');
    const repo = resolveRepo(c.env, options.lmsRepo);
    await requireEnrolled(repo, user.sub, courseId);
    const body = parseBody(submitAssignmentSchema, await c.req.json());
    return c.json(
      await quiz.submitAssignment({
        assignmentId: c.req.param('assignmentId'),
        userId: user.sub,
        content: body.content,
        fileId: body.fileId,
        idempotencyKey: body.idempotencyKey,
      }),
      201,
    );
  });

  routes.get('/api/v1/assignments/:assignmentId/submissions/me', requireAuth(), async (c) => {
    const user = getAuthUser(c);
    if (!can(user.roles, 'course.learn')) {
      throw new ApiHttpError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    const quiz = resolveQuiz(c.env, options.quizService);
    const mine = await quiz.getMySubmission(c.req.param('assignmentId'), user.sub);
    return c.json({ submission: mine });
  });

  return routes;
}
