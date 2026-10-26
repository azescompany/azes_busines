/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/lmsProgress.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Lesson player + progress API tests (M4)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/auth/password.js';
import { createMemoryAuthRepository } from '../src/auth/repository.js';
import { createMemoryLmsMutations } from '../src/lms/mutations.js';
import { createMemoryLmsRepository } from '../src/lms/repository.js';
import { createSignedFileAccess, verifySignedFileAccess } from '../src/lms/signedUrl.js';
import type { ApiEnv } from '../src/env.js';

const JWT_SECRET = 'test-jwt-access-secret-32chars-min!!';

const testEnv: ApiEnv = {
  API_NAME: 'azes-api',
  API_VERSION: 'v1',
  JWT_ACCESS_SECRET: JWT_SECRET,
};

const deviceBody = {
  deviceId: 'device-progress-1',
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

describe('LMS progress / lesson player', () => {
  let passwordHash: string;

  beforeEach(async () => {
    passwordHash = await hashPassword('LocalDevPass123!');
  });

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
    return ((await res.json()) as { accessToken: string }).accessToken;
  }

  function makeApp() {
    const authRepo = createMemoryAuthRepository({
      users: [
        {
          id: 'user-student-1',
          usernameNormalized: 'student.one',
          passwordHash,
          status: 'active',
          orgId: 'org-1',
        },
      ],
      rolesByUser: { 'user-student-1': ['student'] },
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
              title: 'Lesson A',
              type: 'text' as const,
              position: 1,
              durationMin: 5,
              isRequired: true,
              status: 'published' as const,
            },
            {
              id: 'les-2',
              title: 'Lesson B',
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
    const progress: {
      id: string;
      enrollmentId: string;
      lessonId: string;
      status: 'not_started' | 'in_progress' | 'completed';
      completedAt: number | null;
      lastPositionSec: number | null;
    }[] = [];
    const lmsRepo = createMemoryLmsRepository({
      courses,
      curriculum,
      enrollments,
      progress,
      lessonExtras: {
        'les-1': { content: 'Hello markdown' },
        'les-2': { content: 'Second' },
      },
    });
    const lmsMutations = createMemoryLmsMutations({
      courses,
      curriculum,
      enrollments,
      progress,
    });
    return createApp({ authRepo, lmsRepo, lmsMutations });
  }

  it('blocks lesson content without enrollment', async () => {
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
              title: 'Lesson A',
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
    const app = createApp({
      authRepo,
      lmsRepo: createMemoryLmsRepository({ courses, curriculum }),
      lmsMutations: createMemoryLmsMutations({ courses, curriculum }),
    });
    const token = await loginAs(app, 'student.two');
    const res = await app.request(
      '/api/v1/lessons/les-1',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(res.status).toBe(403);
  });

  it('returns lesson detail with neighbors when enrolled', async () => {
    const app = makeApp();
    const token = await loginAs(app, 'student.one');
    const res = await app.request(
      '/api/v1/lessons/les-1',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      content: string;
      nextLessonId: string | null;
      prevLessonId: string | null;
    };
    expect(body.content).toBe('Hello markdown');
    expect(body.prevLessonId).toBeNull();
    expect(body.nextLessonId).toBe('les-2');
  });

  it('completes lesson idempotently', async () => {
    const app = makeApp();
    const token = await loginAs(app, 'student.one');
    const first = await app.request(
      '/api/v1/lessons/les-1/complete',
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(first.status).toBe(200);
    const a = (await first.json()) as { completedAt: number; status: string };
    expect(a.status).toBe('completed');

    const second = await app.request(
      '/api/v1/lessons/les-1/complete',
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(second.status).toBe(200);
    const b = (await second.json()) as { completedAt: number };
    expect(b.completedAt).toBe(a.completedAt);

    const prog = await app.request(
      '/api/v1/courses/course-pub-1/progress',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(prog.status).toBe(200);
    const p = (await prog.json()) as {
      percent: number;
      completedRequired: number;
      nextLessonId: string | null;
    };
    expect(p.completedRequired).toBe(1);
    expect(p.percent).toBe(50);
    expect(p.nextLessonId).toBe('les-2');
  });

  it('lists my learning with progress', async () => {
    const app = makeApp();
    const token = await loginAs(app, 'student.one');
    await app.request(
      '/api/v1/lessons/les-1/complete',
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    const res = await app.request(
      '/api/v1/me/learning',
      { headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      items: { courseSlug: string; percent: number; nextLessonId: string | null }[];
    };
    expect(body.items).toHaveLength(1);
    expect(body.items[0]?.courseSlug).toBe('intro');
    expect(body.items[0]?.percent).toBe(50);
    expect(body.items[0]?.nextLessonId).toBe('les-2');
  });

  it('signed file URL verifies and rejects expired', async () => {
    const now = 1_700_000_000;
    const signed = await createSignedFileAccess({
      secret: JWT_SECRET,
      fileId: 'file-1',
      userId: 'user-student-1',
      nowSec: now,
      ttlSec: 60,
    });
    expect(signed.path).toContain('/api/v1/files/file-1/content');
    const ok = await verifySignedFileAccess({
      secret: JWT_SECRET,
      fileId: 'file-1',
      userId: 'user-student-1',
      expiresAt: signed.expiresAt,
      sig: new URL(signed.path, 'http://x').searchParams.get('sig')!,
      nowSec: now + 10,
    });
    expect(ok).toBe(true);
    const expired = await verifySignedFileAccess({
      secret: JWT_SECRET,
      fileId: 'file-1',
      userId: 'user-student-1',
      expiresAt: signed.expiresAt,
      sig: new URL(signed.path, 'http://x').searchParams.get('sig')!,
      nowSec: signed.expiresAt + 1,
    });
    expect(expired).toBe(false);
  });
});
