/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/lmsE2e.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: M8 critical LMS API flow — enroll → lesson → quiz → certificate
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/auth/password.js';
import { createMemoryAuthRepository } from '../src/auth/repository.js';
import { createMemoryDashboardService } from '../src/lms/dashboardService.js';
import { createMemoryLmsMutations } from '../src/lms/mutations.js';
import { createMemoryLmsRepository } from '../src/lms/repository.js';
import { createMemoryQuizService } from '../src/lms/quizService.js';
import type { ApiEnv } from '../src/env.js';

const JWT_SECRET = 'test-jwt-access-secret-32chars-min!!';
const testEnv: ApiEnv = {
  API_NAME: 'azes-api',
  API_VERSION: 'v1',
  JWT_ACCESS_SECRET: JWT_SECRET,
};

const deviceBody = {
  deviceId: 'device-e2e-1',
  userAgent: 'vitest',
  platform: 'web',
  language: 'en',
};

const publishedCourse = {
  id: 'course-e2e-1',
  orgId: 'org-1',
  title: 'E2E Course',
  slug: 'e2e-course',
  description: 'Critical path',
  categoryId: null,
  level: 'beginner' as const,
  status: 'published' as const,
  accessType: 'free' as const,
  ownerId: 'user-instructor-1',
  publishedAt: 1_700_000_000,
  createdAt: 1_700_000_000,
  updatedAt: 1_700_000_000,
};

describe('LMS E2E critical path (M8)', () => {
  let passwordHash: string;

  beforeEach(async () => {
    passwordHash = await hashPassword('LocalDevPass123!');
  });

  async function login(app: ReturnType<typeof createApp>, username: string) {
    const res = await app.request(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username,
          password: 'LocalDevPass123!',
          ...deviceBody,
        }),
      },
      testEnv,
    );
    expect(res.status).toBe(200);
    return ((await res.json()) as { accessToken: string }).accessToken;
  }

  function makeApp() {
    const authRepo = createMemoryAuthRepository({
      users: [
        {
          id: 'user-instructor-1',
          usernameNormalized: 'instructor.one',
          passwordHash,
          status: 'active',
          orgId: 'org-1',
        },
        {
          id: 'user-student-1',
          usernameNormalized: 'student.one',
          passwordHash,
          status: 'active',
          orgId: 'org-1',
        },
      ],
      rolesByUser: {
        'user-instructor-1': ['instructor'],
        'user-student-1': ['student'],
      },
    });
    const courses = [publishedCourse];
    const curriculum = {
      'course-e2e-1': [
        {
          id: 'mod-1',
          title: 'Module 1',
          position: 1,
          status: 'published' as const,
          lessons: [
            {
              id: 'les-1',
              title: 'Lesson 1',
              type: 'text' as const,
              position: 1,
              durationMin: 5,
              isRequired: true,
              status: 'published' as const,
            },
          ],
        },
      ],
    };
    const enrollments: Array<{
      id: string;
      userId: string;
      courseId: string;
      status: 'active' | 'completed' | 'cancelled';
      enrolledAt: number;
      completedAt: number | null;
      course: typeof publishedCourse;
    }> = [];
    const progress: Array<{
      id: string;
      enrollmentId: string;
      lessonId: string;
      status: 'not_started' | 'in_progress' | 'completed';
      completedAt: number | null;
      lastPositionSec: number | null;
    }> = [];
    const lmsRepo = createMemoryLmsRepository({
      courses,
      curriculum,
      enrollments,
      progress,
    });
    const lmsMutations = createMemoryLmsMutations({
      courses,
      curriculum,
      enrollments,
      progress,
    });
    const quizService = createMemoryQuizService();
    const dashboardService = createMemoryDashboardService({
      lmsRepo,
      courseTitles: {
        'course-e2e-1': {
          title: publishedCourse.title,
          slug: publishedCourse.slug,
          ownerId: publishedCourse.ownerId,
          orgId: publishedCourse.orgId,
        },
      },
    });
    return createApp({
      authRepo,
      lmsRepo,
      lmsMutations,
      quizService,
      dashboardService,
    });
  }

  it('login → enroll → complete lesson → quiz pass → certificate → verify', async () => {
    const app = makeApp();
    const instructor = await login(app, 'instructor.one');
    const student = await login(app, 'student.one');

    const enroll = await app.request(
      '/api/v1/courses/course-e2e-1/enroll',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${student}` },
      },
      testEnv,
    );
    expect(enroll.status).toBe(201);
    const enrollment = (await enroll.json()) as { id: string; status: string };
    expect(enrollment.status).toBe('active');

    const enrollAgain = await app.request(
      '/api/v1/courses/course-e2e-1/enroll',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${student}` },
      },
      testEnv,
    );
    expect(enrollAgain.status).toBe(201);
    expect(((await enrollAgain.json()) as { id: string }).id).toBe(enrollment.id);

    const complete = await app.request(
      '/api/v1/lessons/les-1/complete',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${student}` },
      },
      testEnv,
    );
    expect(complete.status).toBe(200);
    expect(((await complete.json()) as { status: string }).status).toBe('completed');

    const createQuiz = await app.request(
      '/api/v1/manage/courses/course-e2e-1/quizzes',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${instructor}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          title: 'E2E Quiz',
          maxAttempts: 3,
          passScore: 50,
        }),
      },
      testEnv,
    );
    expect(createQuiz.status).toBe(201);
    const quiz = (await createQuiz.json()) as { id: string };

    const addQ = await app.request(
      `/api/v1/manage/quizzes/${quiz.id}/questions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${instructor}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          type: 'single_choice',
          text: 'Capital of Azerbaijan?',
          options: [
            { id: 'a', label: 'Ganja' },
            { id: 'b', label: 'Baku' },
          ],
          correctAnswer: 'b',
          points: 1,
        }),
      },
      testEnv,
    );
    expect(addQ.status).toBe(201);
    const question = (await addQ.json()) as { id: string };

    const publish = await app.request(
      `/api/v1/manage/quizzes/${quiz.id}/publish`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${instructor}` },
      },
      testEnv,
    );
    expect(publish.status).toBe(200);

    const take = await app.request(
      `/api/v1/quizzes/${quiz.id}`,
      { headers: { Authorization: `Bearer ${student}` } },
      testEnv,
    );
    expect(take.status).toBe(200);
    const takeBody = (await take.json()) as {
      questions: { id: string; correctAnswer?: unknown }[];
    };
    expect(takeBody.questions[0]?.correctAnswer).toBeUndefined();

    const start = await app.request(
      `/api/v1/quizzes/${quiz.id}/attempts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ idempotencyKey: 'e2e-start-1' }),
      },
      testEnv,
    );
    expect(start.status).toBe(201);
    const attempt = (await start.json()) as { id: string };

    const submit = await app.request(
      `/api/v1/attempts/${attempt.id}/submit`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          answers: { [question.id]: 'b' },
          idempotencyKey: 'e2e-sub-1',
        }),
      },
      testEnv,
    );
    expect(submit.status).toBe(200);
    const result = (await submit.json()) as { passed: boolean; score: number };
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);

    const cert = await app.request(
      '/api/v1/courses/course-e2e-1/certificate',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${student}` },
      },
      testEnv,
    );
    expect(cert.status).toBe(201);
    const certificate = (await cert.json()) as { code: string; courseTitle: string };
    expect(certificate.courseTitle).toBe('E2E Course');
    expect(certificate.code.startsWith('CRT-')).toBe(true);

    const verify = await app.request(
      `/api/v1/certificates/verify/${certificate.code}`,
      {},
      testEnv,
    );
    expect(verify.status).toBe(200);
    expect(((await verify.json()) as { code: string }).code).toBe(certificate.code);

    const dash = await app.request(
      '/api/v1/me/dashboard',
      { headers: { Authorization: `Bearer ${student}` } },
      testEnv,
    );
    expect(dash.status).toBe(200);
    const stats = (await dash.json()) as {
      stats: { completedLessons: number };
    };
    expect(stats.stats.completedLessons).toBeGreaterThanOrEqual(1);
  });
});
