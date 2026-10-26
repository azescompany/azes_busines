/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/lmsManage.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: LMS manage write API tests (M2 + M5 reorder/archive)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/auth/password.js';
import { createMemoryAuthRepository } from '../src/auth/repository.js';
import { assertAllowedUpload } from '../src/lms/files.js';
import { createMemoryLmsMutations } from '../src/lms/mutations.js';
import { createMemoryLmsRepository } from '../src/lms/repository.js';
import { sanitizeCourseContent } from '../src/lms/sanitize.js';
import type { CourseDetailDto, ModuleCurriculumDto } from '../src/lms/types.js';
import type { ApiEnv } from '../src/env.js';
import { ApiHttpError } from '../src/errors.js';

const JWT_SECRET = 'test-jwt-access-secret-32chars-min!!';
const testEnv: ApiEnv = {
  API_NAME: 'azes-api',
  API_VERSION: 'v1',
  JWT_ACCESS_SECRET: JWT_SECRET,
};

const deviceBody = {
  deviceId: 'device-mgmt-1',
  userAgent: 'vitest',
  platform: 'web',
  language: 'en',
};

describe('LMS manage writes', () => {
  let passwordHash: string;
  let courses: CourseDetailDto[];
  let curriculum: Record<string, ModuleCurriculumDto[]>;

  beforeEach(async () => {
    passwordHash = await hashPassword('LocalDevPass123!');
    courses = [];
    curriculum = {};
  });

  function makeApp(roles: Record<string, string[]>) {
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
        {
          id: 'user-instructor-2',
          usernameNormalized: 'instructor.two',
          passwordHash,
          status: 'active',
          orgId: 'org-1',
        },
      ],
      rolesByUser: roles,
    });
    const lmsRepo = createMemoryLmsRepository({ courses, curriculum });
    const lmsMutations = createMemoryLmsMutations({ courses, curriculum });
    return createApp({ authRepo, lmsRepo, lmsMutations });
  }

  async function login(app: ReturnType<typeof createApp>, username: string) {
    const res = await app.request(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password: 'LocalDevPass123!', ...deviceBody }),
      },
      testEnv,
    );
    expect(res.status).toBe(200);
    return ((await res.json()) as { accessToken: string }).accessToken;
  }

  it('sanitizes script tags from content', () => {
    expect(sanitizeCourseContent('Hello <script>alert(1)</script> world')).toBe('Hello  world');
  });

  it('rejects disallowed mime and oversized files', () => {
    expect(() => assertAllowedUpload('application/x-msdownload', 10)).toThrow(ApiHttpError);
    expect(() => assertAllowedUpload('image/png', 9_000_000)).toThrow(ApiHttpError);
  });

  it('student cannot create course (403)', async () => {
    const app = makeApp({
      'user-student-1': ['student'],
      'user-instructor-1': ['instructor'],
      'user-instructor-2': ['instructor'],
    });
    const token = await login(app, 'student.one');
    const res = await app.request(
      '/api/v1/manage/courses',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Nope' }),
      },
      testEnv,
    );
    expect(res.status).toBe(403);
  });

  it('instructor creates course, module, lesson and publishes', async () => {
    const app = makeApp({
      'user-student-1': ['student'],
      'user-instructor-1': ['instructor'],
      'user-instructor-2': ['instructor'],
    });
    const token = await login(app, 'instructor.one');
    const create = await app.request(
      '/api/v1/manage/courses',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          title: 'My Course',
          description: 'Safe <b>ok</b><script>x</script>',
        }),
      },
      testEnv,
    );
    expect(create.status).toBe(201);
    const course = (await create.json()) as {
      id: string;
      description: string | null;
      status: string;
    };
    expect(course.status).toBe('draft');
    expect(course.description).toBe('Safe ok');

    const emptyPublish = await app.request(
      `/api/v1/manage/courses/${course.id}/publish`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(emptyPublish.status).toBe(400);

    const modRes = await app.request(
      `/api/v1/manage/courses/${course.id}/modules`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Module A' }),
      },
      testEnv,
    );
    expect(modRes.status).toBe(201);
    const mod = (await modRes.json()) as { id: string };

    const lesRes = await app.request(
      `/api/v1/manage/modules/${mod.id}/lessons`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Lesson 1', content: 'Body' }),
      },
      testEnv,
    );
    expect(lesRes.status).toBe(201);

    const pub = await app.request(
      `/api/v1/manage/courses/${course.id}/publish`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(pub.status).toBe(200);
    const published = (await pub.json()) as { status: string };
    expect(published.status).toBe('published');
  });

  it('instructor cannot edit another instructor course', async () => {
    const app = makeApp({
      'user-student-1': ['student'],
      'user-instructor-1': ['instructor'],
      'user-instructor-2': ['instructor'],
    });
    const t1 = await login(app, 'instructor.one');
    const created = await app.request(
      '/api/v1/manage/courses',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${t1}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Owned by one' }),
      },
      testEnv,
    );
    const course = (await created.json()) as { id: string };
    const t2 = await login(app, 'instructor.two');
    const patch = await app.request(
      `/api/v1/manage/courses/${course.id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${t2}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Hijack' }),
      },
      testEnv,
    );
    expect(patch.status).toBe(403);
  });

  it('rejects empty title', async () => {
    const app = makeApp({
      'user-student-1': ['student'],
      'user-instructor-1': ['instructor'],
      'user-instructor-2': ['instructor'],
    });
    const token = await login(app, 'instructor.one');
    const res = await app.request(
      '/api/v1/manage/courses',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: '   ' }),
      },
      testEnv,
    );
    expect(res.status).toBe(400);
  });

  it('reorders lessons and soft-archives without deleting progress', async () => {
    const progress: {
      id: string;
      enrollmentId: string;
      lessonId: string;
      status: 'completed';
      completedAt: number | null;
      lastPositionSec: number | null;
    }[] = [];
    const authRepo = createMemoryAuthRepository({
      users: [
        {
          id: 'user-instructor-1',
          usernameNormalized: 'instructor.one',
          passwordHash,
          status: 'active',
          orgId: 'org-1',
        },
      ],
      rolesByUser: { 'user-instructor-1': ['instructor'] },
    });
    const lmsRepo = createMemoryLmsRepository({ courses, curriculum, progress });
    const lmsMutations = createMemoryLmsMutations({ courses, curriculum, progress });
    const app = createApp({ authRepo, lmsRepo, lmsMutations });
    const token = await login(app, 'instructor.one');

    const create = await app.request(
      '/api/v1/manage/courses',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Reorder Course' }),
      },
      testEnv,
    );
    const course = (await create.json()) as { id: string };
    const modRes = await app.request(
      `/api/v1/manage/courses/${course.id}/modules`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ title: 'Mod' }),
      },
      testEnv,
    );
    const mod = (await modRes.json()) as { id: string };
    const l1 = (await (
      await app.request(
        `/api/v1/manage/modules/${mod.id}/lessons`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ title: 'A' }),
        },
        testEnv,
      )
    ).json()) as { id: string };
    const l2 = (await (
      await app.request(
        `/api/v1/manage/modules/${mod.id}/lessons`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ title: 'B' }),
        },
        testEnv,
      )
    ).json()) as { id: string };

    progress.push({
      id: 'p1',
      enrollmentId: 'enr-x',
      lessonId: l1.id,
      status: 'completed',
      completedAt: 1,
      lastPositionSec: null,
    });

    const reorder = await app.request(
      `/api/v1/manage/modules/${mod.id}/lessons/reorder`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ ids: [l2.id, l1.id] }),
      },
      testEnv,
    );
    expect(reorder.status).toBe(200);
    const ordered = (await reorder.json()) as { lessons: { id: string; position: number }[] };
    expect(ordered.lessons.map((l) => l.id)).toEqual([l2.id, l1.id]);
    expect(progress[0]?.lessonId).toBe(l1.id);

    const arch = await app.request(
      `/api/v1/manage/lessons/${l1.id}/archive`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(arch.status).toBe(200);
    const archBody = (await arch.json()) as {
      lesson: { status: string };
      hadProgress: boolean;
    };
    expect(archBody.lesson.status).toBe('archived');
    expect(archBody.hadProgress).toBe(true);
    expect(progress).toHaveLength(1);

    const courseArch = await app.request(
      `/api/v1/manage/courses/${course.id}/archive`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      testEnv,
    );
    expect(courseArch.status).toBe(200);
    expect(((await courseArch.json()) as { status: string }).status).toBe('archived');
  });
});
