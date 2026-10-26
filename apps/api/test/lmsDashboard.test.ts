/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/lmsDashboard.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Dashboard stats, certificates, notifications (M7)
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
import type { ApiEnv } from '../src/env.js';

const JWT_SECRET = 'test-jwt-access-secret-32chars-min!!';
const testEnv: ApiEnv = {
  API_NAME: 'azes-api',
  API_VERSION: 'v1',
  JWT_ACCESS_SECRET: JWT_SECRET,
};

const deviceBody = {
  deviceId: 'device-dash-1',
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

describe('LMS dashboard / certificates', () => {
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

  function makeApp(progressCompleted: boolean) {
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
            {
              id: 'les-2',
              title: 'L2',
              type: 'text' as const,
              position: 2,
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
    const progress = progressCompleted
      ? [
          {
            id: 'p1',
            enrollmentId: 'enr-1',
            lessonId: 'les-1',
            status: 'completed' as const,
            completedAt: 1_700_000_200,
            lastPositionSec: null,
          },
          {
            id: 'p2',
            enrollmentId: 'enr-1',
            lessonId: 'les-2',
            status: 'completed' as const,
            completedAt: 1_700_000_300,
            lastPositionSec: null,
          },
        ]
      : [
          {
            id: 'p1',
            enrollmentId: 'enr-1',
            lessonId: 'les-1',
            status: 'completed' as const,
            completedAt: 1_700_000_200,
            lastPositionSec: null,
          },
        ];
    const lmsRepo = createMemoryLmsRepository({
      courses,
      curriculum,
      enrollments,
      progress,
    });
    const dashboardService = createMemoryDashboardService({
      lmsRepo,
      courseTitles: {
        'course-pub-1': {
          title: 'Intro',
          slug: 'intro',
          ownerId: 'user-instructor-1',
          orgId: 'org-1',
        },
      },
    });
    return createApp({
      authRepo,
      lmsRepo,
      lmsMutations: createMemoryLmsMutations({ courses, curriculum, enrollments, progress }),
      dashboardService,
    });
  }

  it('dashboard stats match enrollment progress', async () => {
    const app = makeApp(false);
    const token = await login(app, 'student.one');
    const res = await app.request(
      '/api/v1/me/dashboard',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      stats: {
        activeCourses: number;
        completedCourses: number;
        completedLessons: number;
        averagePercent: number;
      };
      continueLearning: { courseId: string; percent: number } | null;
    };
    expect(body.stats.activeCourses).toBe(1);
    expect(body.stats.completedCourses).toBe(0);
    expect(body.stats.completedLessons).toBe(1);
    expect(body.stats.averagePercent).toBe(50);
    expect(body.continueLearning?.courseId).toBe('course-pub-1');
    expect(body.continueLearning?.percent).toBe(50);
  });

  it('issues certificate only when complete; idempotent; verify by code', async () => {
    const incomplete = makeApp(false);
    const stu = await login(incomplete, 'student.one');
    const denied = await incomplete.request(
      '/api/v1/courses/course-pub-1/certificate',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${stu}` },
      },
      testEnv,
    );
    expect(denied.status).toBe(409);

    const app = makeApp(true);
    const token = await login(app, 'student.one');
    const first = await app.request(
      '/api/v1/courses/course-pub-1/certificate',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      testEnv,
    );
    expect(first.status).toBe(201);
    const cert = (await first.json()) as { id: string; code: string; courseTitle: string };
    expect(cert.courseTitle).toBe('Intro');
    expect(cert.code.startsWith('CRT-')).toBe(true);

    const second = await app.request(
      '/api/v1/courses/course-pub-1/certificate',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      testEnv,
    );
    expect(second.status).toBe(201);
    expect(((await second.json()) as { id: string }).id).toBe(cert.id);

    const verify = await app.request(`/api/v1/certificates/verify/${cert.code}`, {}, testEnv);
    expect(verify.status).toBe(200);
    expect(((await verify.json()) as { code: string }).code).toBe(cert.code);

    const notes = await app.request(
      '/api/v1/me/notifications',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(notes.status).toBe(200);
    const items = ((await notes.json()) as { items: { type: string; readAt: number | null }[] })
      .items;
    expect(items.some((n) => n.type === 'certificate')).toBe(true);

    const readAll = await app.request(
      '/api/v1/me/notifications/read-all',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      testEnv,
    );
    expect(readAll.status).toBe(200);

    const analytics = await app.request(
      '/api/v1/manage/analytics',
      {
        headers: {
          Authorization: `Bearer ${await login(app, 'instructor.one')}`,
        },
      },
      testEnv,
    );
    expect(analytics.status).toBe(200);
    const a = (await analytics.json()) as {
      totals: { enrollments: number; completedEnrollments: number };
    };
    expect(a.totals.enrollments).toBeGreaterThanOrEqual(1);
    expect(a.totals.completedEnrollments).toBeGreaterThanOrEqual(1);
  });

  it('bookmark add is idempotent', async () => {
    const app = makeApp(false);
    const token = await login(app, 'student.one');
    const a = await app.request(
      '/api/v1/me/bookmarks/course-pub-1',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      testEnv,
    );
    expect(a.status).toBe(201);
    const b = await app.request(
      '/api/v1/me/bookmarks/course-pub-1',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
      testEnv,
    );
    expect(b.status).toBe(201);
    const list = await app.request(
      '/api/v1/me/bookmarks',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(((await list.json()) as { items: unknown[] }).items).toHaveLength(1);
  });
});
