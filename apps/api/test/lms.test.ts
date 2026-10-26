/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/lms.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: LMS read + enroll API authz + pagination tests (M3)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/auth/password.js';
import { createMemoryAuthRepository } from '../src/auth/repository.js';
import { createMemoryLmsMutations } from '../src/lms/mutations.js';
import { createMemoryLmsRepository } from '../src/lms/repository.js';
import type { MemoryEnrollment } from '../src/lms/repository.js';
import type { ApiEnv } from '../src/env.js';
import { createMemoryOrgRepository } from '../src/org/repository.js';

const JWT_SECRET = 'test-jwt-access-secret-32chars-min!!';

const testEnv: ApiEnv = {
  API_NAME: 'azes-api',
  API_VERSION: 'v1',
  JWT_ACCESS_SECRET: JWT_SECRET,
};

const deviceBody = {
  deviceId: 'device-lms-1',
  userAgent: 'vitest',
  platform: 'web',
  language: 'en',
};

const publishedCourse = {
  id: 'course-pub-1',
  orgId: 'org-1',
  title: 'Intro to Business',
  slug: 'intro-business',
  description: 'Start here',
  categoryId: 'cat-1',
  level: 'beginner' as const,
  status: 'published' as const,
  accessType: 'free' as const,
  ownerId: 'user-instructor-1',
  publishedAt: 1_700_000_000,
  createdAt: 1_700_000_000,
  updatedAt: 1_700_000_000,
};

const draftCourse = {
  id: 'course-draft-1',
  orgId: 'org-1',
  title: 'Secret Draft',
  slug: 'secret-draft',
  description: null,
  categoryId: null,
  level: 'intermediate' as const,
  status: 'draft' as const,
  accessType: 'invite' as const,
  ownerId: 'user-instructor-1',
  publishedAt: null,
  createdAt: 1_700_000_100,
  updatedAt: 1_700_000_100,
};

const inviteCourse = {
  id: 'course-invite-1',
  orgId: 'org-1',
  title: 'Track Only',
  slug: 'track-only',
  description: 'Invite access',
  categoryId: 'cat-1',
  level: 'beginner' as const,
  status: 'published' as const,
  accessType: 'invite' as const,
  ownerId: 'user-instructor-1',
  publishedAt: 1_700_000_050,
  createdAt: 1_700_000_050,
  updatedAt: 1_700_000_050,
};

describe('LMS read routes', () => {
  let passwordHash: string;

  beforeEach(async () => {
    passwordHash = await hashPassword('LocalDevPass123!');
  });

  function makeApp(rolesByUser: Record<string, string[]>) {
    const authRepo = createMemoryAuthRepository({
      users: [
        {
          id: 'user-student-1',
          usernameNormalized: 'student.one',
          passwordHash,
          status: 'active',
          orgId: 'org-1',
        },
        {
          id: 'user-instructor-1',
          usernameNormalized: 'instructor.one',
          passwordHash,
          status: 'active',
          orgId: 'org-1',
        },
      ],
      rolesByUser,
    });
    const lmsRepo = createMemoryLmsRepository({
      categories: [{ id: 'cat-1', name: 'Business', slug: 'business' }],
      courses: [publishedCourse, draftCourse],
      curriculum: {
        'course-pub-1': [
          {
            id: 'mod-1',
            title: 'Module 1',
            position: 1,
            status: 'published',
            lessons: [
              {
                id: 'les-1',
                title: 'Welcome',
                type: 'text',
                position: 1,
                durationMin: 5,
                isRequired: true,
                status: 'published',
              },
            ],
          },
        ],
      },
      enrollments: [
        {
          id: 'enr-1',
          userId: 'user-student-1',
          courseId: 'course-pub-1',
          status: 'active',
          enrolledAt: 1_700_000_200,
          completedAt: null,
          course: publishedCourse,
        },
      ],
    });
    return createApp({ authRepo, lmsRepo });
  }

  async function loginAs(app: ReturnType<typeof createApp>, username: string) {
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
    const body = (await res.json()) as { accessToken: string };
    return body.accessToken;
  }

  it('rejects unauthenticated course list with 401', async () => {
    const app = makeApp({
      'user-student-1': ['student'],
      'user-instructor-1': ['instructor'],
    });
    const res = await app.request('/api/v1/courses', {}, testEnv);
    expect(res.status).toBe(401);
  });

  it('student sees only published courses', async () => {
    const app = makeApp({
      'user-student-1': ['student'],
      'user-instructor-1': ['instructor'],
    });
    const token = await loginAs(app, 'student.one');
    const res = await app.request(
      '/api/v1/courses?page=1&pageSize=10',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: { slug: string }[]; total: number };
    expect(body.total).toBe(1);
    expect(body.items.map((i) => i.slug)).toEqual(['intro-business']);
  });

  it('student cannot read draft course detail (403)', async () => {
    const app = makeApp({
      'user-student-1': ['student'],
      'user-instructor-1': ['instructor'],
    });
    const token = await loginAs(app, 'student.one');
    const res = await app.request(
      '/api/v1/courses/secret-draft',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(res.status).toBe(403);
  });

  it('instructor sees own draft in list', async () => {
    const app = makeApp({
      'user-student-1': ['student'],
      'user-instructor-1': ['instructor'],
    });
    const token = await loginAs(app, 'instructor.one');
    const res = await app.request(
      '/api/v1/courses',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: { slug: string }[]; total: number };
    expect(body.total).toBe(2);
    expect(body.items.map((i) => i.slug).sort()).toEqual(['intro-business', 'secret-draft']);
  });

  it('paginates and validates pageSize', async () => {
    const app = makeApp({
      'user-student-1': ['student'],
      'user-instructor-1': ['instructor'],
    });
    const token = await loginAs(app, 'student.one');
    const bad = await app.request(
      '/api/v1/courses?pageSize=999',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(bad.status).toBe(400);

    const ok = await app.request(
      '/api/v1/courses?page=1&pageSize=1',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(ok.status).toBe(200);
    const body = (await ok.json()) as { pageSize: number; items: unknown[] };
    expect(body.pageSize).toBe(1);
    expect(body.items).toHaveLength(1);
  });

  it('returns curriculum for published course', async () => {
    const app = makeApp({
      'user-student-1': ['student'],
      'user-instructor-1': ['instructor'],
    });
    const token = await loginAs(app, 'student.one');
    const res = await app.request(
      '/api/v1/courses/course-pub-1/curriculum',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { modules: { lessons: unknown[] }[] };
    expect(body.modules).toHaveLength(1);
    expect(body.modules[0]?.lessons).toHaveLength(1);
  });

  it('returns enrollments for current user', async () => {
    const app = makeApp({
      'user-student-1': ['student'],
      'user-instructor-1': ['instructor'],
    });
    const token = await loginAs(app, 'student.one');
    const res = await app.request(
      '/api/v1/me/enrollments',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: { courseId: string }[] };
    expect(body.items).toHaveLength(1);
    expect(body.items[0]?.courseId).toBe('course-pub-1');
  });

  it('hides invite courses until track assignment', async () => {
    const authRepo = createMemoryAuthRepository({
      users: [
        {
          id: 'user-student-1',
          usernameNormalized: 'student.one',
          passwordHash,
          status: 'active',
          orgId: 'org-1',
        },
        {
          id: 'user-instructor-1',
          usernameNormalized: 'instructor.one',
          passwordHash,
          status: 'active',
          orgId: 'org-1',
        },
      ],
      rolesByUser: {
        'user-student-1': ['student'],
        'user-instructor-1': ['instructor'],
      },
    });
    const courses = [publishedCourse, inviteCourse];
    const lmsRepo = createMemoryLmsRepository({
      categories: [{ id: 'cat-1', name: 'Business', slug: 'business' }],
      courses,
      curriculum: {},
    });
    const orgRepo = createMemoryOrgRepository({
      organizations: [
        {
          id: 'org-1',
          name: 'Org One',
          slug: 'org-one',
          status: 'active',
              parentOrganizationId: null,
              createdBy: 'user-instructor-1',
          createdAt: 1,
          updatedAt: 1,
        },
      ],
      tracks: [
        {
          id: 'track-1',
          orgId: 'org-1',
          name: 'Programme A',
          slug: 'programme-a',
          description: null,
          status: 'active',
          createdBy: 'user-instructor-1',
          createdAt: 1,
          updatedAt: 1,
        },
      ],
    });
    await orgRepo.setTrackCourses('track-1', ['course-invite-1']);

    const app = createApp({ authRepo, lmsRepo, orgRepo });
    const token = await loginAs(app, 'student.one');

    const before = await app.request(
      '/api/v1/courses?page=1&pageSize=20',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(before.status).toBe(200);
    const beforeBody = (await before.json()) as { items: { id: string }[] };
    expect(beforeBody.items.map((i) => i.id)).toEqual(['course-pub-1']);

    await orgRepo.assignUserTracks({
      userId: 'user-student-1',
      trackIds: ['track-1'],
      assignedBy: 'user-instructor-1',
    });

    const after = await app.request(
      '/api/v1/courses?page=1&pageSize=20',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(after.status).toBe(200);
    const afterBody = (await after.json()) as { items: { id: string }[] };
    expect(afterBody.items.map((i) => i.id).sort()).toEqual(['course-invite-1', 'course-pub-1']);
  });

  it('enrolls idempotently on free published course', async () => {
    const authRepo = createMemoryAuthRepository({
      users: [
        {
          id: 'user-student-2',
          usernameNormalized: 'student.two',
          passwordHash,
          status: 'active',
          orgId: 'org-1',
        },
      ],
      rolesByUser: { 'user-student-2': ['student'] },
    });
    const courses = [{ ...publishedCourse }];
    const enrollments: MemoryEnrollment[] = [];
    const lmsRepo = createMemoryLmsRepository({
      categories: [{ id: 'cat-1', name: 'Business', slug: 'business' }],
      courses,
      curriculum: {},
      enrollments,
    });
    const lmsMutations = createMemoryLmsMutations({
      courses,
      curriculum: {},
      enrollments,
    });
    const app = createApp({ authRepo, lmsRepo, lmsMutations });
    const token = await loginAs(app, 'student.two');

    const first = await app.request(
      '/api/v1/courses/course-pub-1/enroll',
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(first.status).toBe(201);
    const firstBody = (await first.json()) as { id: string; courseId: string };
    expect(firstBody.courseId).toBe('course-pub-1');

    const second = await app.request(
      '/api/v1/courses/course-pub-1/enroll',
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(second.status).toBe(201);
    const secondBody = (await second.json()) as { id: string };
    expect(secondBody.id).toBe(firstBody.id);
  });

  it('rejects enroll on invite course without track (403)', async () => {
    const authRepo = createMemoryAuthRepository({
      users: [
        {
          id: 'user-student-2',
          usernameNormalized: 'student.two',
          passwordHash,
          status: 'active',
          orgId: 'org-1',
        },
      ],
      rolesByUser: { 'user-student-2': ['student'] },
    });
    const courses = [inviteCourse];
    const lmsRepo = createMemoryLmsRepository({
      categories: [{ id: 'cat-1', name: 'Business', slug: 'business' }],
      courses,
      curriculum: {},
    });
    const lmsMutations = createMemoryLmsMutations({ courses, curriculum: {} });
    const app = createApp({ authRepo, lmsRepo, lmsMutations });
    const token = await loginAs(app, 'student.two');
    const res = await app.request(
      '/api/v1/courses/course-invite-1/enroll',
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(res.status).toBe(403);
  });
});
