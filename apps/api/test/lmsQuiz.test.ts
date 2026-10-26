/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/lmsQuiz.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Quiz grading, limits, timer, authz + assignments (M6)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/auth/password.js';
import { createMemoryAuthRepository } from '../src/auth/repository.js';
import { createMemoryLmsMutations } from '../src/lms/mutations.js';
import { createMemoryLmsRepository } from '../src/lms/repository.js';
import { createMemoryQuizService, gradeAnswers } from '../src/lms/quizService.js';
import type { ApiEnv } from '../src/env.js';

const JWT_SECRET = 'test-jwt-access-secret-32chars-min!!';
const testEnv: ApiEnv = {
  API_NAME: 'azes-api',
  API_VERSION: 'v1',
  JWT_ACCESS_SECRET: JWT_SECRET,
};

const deviceBody = {
  deviceId: 'device-quiz-1',
  userAgent: 'vitest',
  platform: 'web',
  language: 'en',
};

const publishedCourse = {
  id: 'course-pub-1',
  orgId: 'org-1',
  title: 'Intro',
  slug: 'intro',
  description: null,
  categoryId: null,
  level: 'beginner' as const,
  status: 'published' as const,
  accessType: 'free' as const,
  ownerId: 'user-instructor-1',
  publishedAt: 1_700_000_000,
  createdAt: 1_700_000_000,
  updatedAt: 1_700_000_000,
};

describe('gradeAnswers', () => {
  it('scores single/multiple/short correctly', () => {
    const result = gradeAnswers(
      [
        {
          id: 'q1',
          type: 'single_choice',
          correctAnswer: 'a',
          explanation: 'A',
          points: 2,
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          correctAnswer: ['a', 'b'],
          explanation: null,
          points: 2,
        },
        {
          id: 'q3',
          type: 'short_text',
          correctAnswer: 'Baku',
          explanation: null,
          points: 1,
        },
      ],
      { q1: 'a', q2: ['b', 'a'], q3: ' baku ' },
    );
    expect(result.earned).toBe(5);
    expect(result.scorePercent).toBe(100);
    expect(result.items.every((i) => i.correct)).toBe(true);
  });
});

describe('LMS quiz / assignments', () => {
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
      'course-pub-1': [
        {
          id: 'mod-1',
          title: 'M1',
          position: 1,
          status: 'published' as const,
          lessons: [
            {
              id: 'les-1',
              title: 'L1',
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
    const enrollments = [
      {
        id: 'enr-1',
        userId: 'user-student-1',
        courseId: 'course-pub-1',
        status: 'active' as const,
        enrolledAt: 1_700_000_100,
        completedAt: null,
        course: publishedCourse,
      },
    ];
    const lmsRepo = createMemoryLmsRepository({
      courses,
      curriculum,
      enrollments,
      progress: [],
    });
    const lmsMutations = createMemoryLmsMutations({ courses, curriculum, enrollments });
    const quizService = createMemoryQuizService();
    return createApp({ authRepo, lmsRepo, lmsMutations, quizService });
  }

  async function createPublishedQuiz(app: ReturnType<typeof createApp>, token: string) {
    const create = await app.request(
      '/api/v1/manage/courses/course-pub-1/quizzes',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Unit quiz',
          timeLimitSec: 60,
          maxAttempts: 2,
          passScore: 50,
        }),
      },
      testEnv,
    );
    expect(create.status).toBe(201);
    const quiz = (await create.json()) as { id: string };
    const q = await app.request(
      `/api/v1/manage/quizzes/${quiz.id}/questions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          type: 'single_choice',
          text: '2+2?',
          options: [
            { id: 'a', label: '3' },
            { id: 'b', label: '4' },
          ],
          correctAnswer: 'b',
          explanation: 'Basic arith',
          points: 1,
        }),
      },
      testEnv,
    );
    expect(q.status).toBe(201);
    const pub = await app.request(
      `/api/v1/manage/quizzes/${quiz.id}/publish`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      testEnv,
    );
    expect(pub.status).toBe(200);
    return quiz.id;
  }

  it('hides correct answers on take; grades on submit; idempotent submit', async () => {
    const app = makeApp();
    const instructor = await login(app, 'instructor.one');
    const student = await login(app, 'student.one');
    const quizId = await createPublishedQuiz(app, instructor);

    const take = await app.request(
      `/api/v1/quizzes/${quizId}`,
      { headers: { Authorization: `Bearer ${student}` } },
      testEnv,
    );
    expect(take.status).toBe(200);
    const takeBody = (await take.json()) as {
      questions: { id: string; correctAnswer?: unknown }[];
    };
    expect(takeBody.questions[0]?.correctAnswer).toBeUndefined();
    const qid = takeBody.questions[0]!.id;

    const start = await app.request(
      `/api/v1/quizzes/${quizId}/attempts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      },
      testEnv,
    );
    expect(start.status).toBe(201);
    const attempt = (await start.json()) as {
      id: string;
      questions: { correctAnswer?: unknown }[];
    };
    expect(attempt.questions[0]?.correctAnswer).toBeUndefined();

    const submit1 = await app.request(
      `/api/v1/attempts/${attempt.id}/submit`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          answers: { [qid]: 'b' },
          idempotencyKey: 'sub-1',
        }),
      },
      testEnv,
    );
    expect(submit1.status).toBe(200);
    const result1 = (await submit1.json()) as {
      score: number;
      passed: boolean;
      items: { correctAnswer: unknown }[];
    };
    expect(result1.score).toBe(100);
    expect(result1.passed).toBe(true);
    expect(result1.items[0]?.correctAnswer).toBe('b');

    const submit2 = await app.request(
      `/api/v1/attempts/${attempt.id}/submit`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          answers: { [qid]: 'a' },
          idempotencyKey: 'sub-1',
        }),
      },
      testEnv,
    );
    expect(submit2.status).toBe(200);
    const result2 = (await submit2.json()) as { score: number };
    expect(result2.score).toBe(100);
  });

  it('rejects submit after timer and blocks over max attempts', async () => {
    const shared = createMemoryQuizService();
    const quiz = await shared.createQuiz({
      courseId: 'course-pub-1',
      title: 'Timed',
      timeLimitSec: 60,
      maxAttempts: 2,
      passScore: 50,
    });
    await shared.addQuestion({
      quizId: quiz.id,
      type: 'single_choice',
      text: 'Q?',
      options: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      correctAnswer: 'b',
      points: 1,
    });
    await shared.publishQuiz(quiz.id);

    const t0 = 1_800_000_000;
    const started = await shared.startAttempt({
      quizId: quiz.id,
      userId: 'user-student-1',
      now: t0,
    });
    await expect(
      shared.submitAttempt({
        attemptId: started.id,
        userId: 'user-student-1',
        answers: {},
        now: t0 + 120,
      }),
    ).rejects.toMatchObject({ status: 409, code: 'ATTEMPT_EXPIRED' });

    const a2 = await shared.startAttempt({
      quizId: quiz.id,
      userId: 'user-student-1',
      now: t0 + 200,
    });
    await shared.submitAttempt({
      attemptId: a2.id,
      userId: 'user-student-1',
      answers: { [a2.questions[0]!.id]: 'b' },
      now: t0 + 201,
    });

    await expect(
      shared.startAttempt({
        quizId: quiz.id,
        userId: 'user-student-1',
        now: t0 + 300,
      }),
    ).rejects.toMatchObject({ status: 409, code: 'ATTEMPT_LIMIT' });
  });

  it('student cannot create quiz; assignment submit + grade works', async () => {
    const app = makeApp();
    const student = await login(app, 'student.one');
    const instructor = await login(app, 'instructor.one');

    const denied = await app.request(
      '/api/v1/manage/courses/course-pub-1/quizzes',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Nope' }),
      },
      testEnv,
    );
    expect(denied.status).toBe(403);

    const asg = await app.request(
      '/api/v1/manage/courses/course-pub-1/assignments',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${instructor}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Essay', description: 'Write' }),
      },
      testEnv,
    );
    expect(asg.status).toBe(201);
    const assignment = (await asg.json()) as { id: string };
    const pub = await app.request(
      `/api/v1/manage/assignments/${assignment.id}/publish`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${instructor}` },
      },
      testEnv,
    );
    expect(pub.status).toBe(200);

    const sub = await app.request(
      `/api/v1/assignments/${assignment.id}/submissions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ content: 'My essay', idempotencyKey: 'asg-1' }),
      },
      testEnv,
    );
    expect(sub.status).toBe(201);
    const submission = (await sub.json()) as { id: string };

    const sub2 = await app.request(
      `/api/v1/assignments/${assignment.id}/submissions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ content: 'Changed', idempotencyKey: 'asg-1' }),
      },
      testEnv,
    );
    expect(sub2.status).toBe(201);
    expect(((await sub2.json()) as { id: string }).id).toBe(submission.id);

    const graded = await app.request(
      `/api/v1/manage/submissions/${submission.id}/grade`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${instructor}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ score: 85, feedback: 'Good' }),
      },
      testEnv,
    );
    expect(graded.status).toBe(200);
    const g = (await graded.json()) as { score: number; feedback: string; status: string };
    expect(g.score).toBe(85);
    expect(g.feedback).toBe('Good');
    expect(g.status).toBe('graded');
  });
});
