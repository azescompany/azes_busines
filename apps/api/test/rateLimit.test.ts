/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/test/rateLimit.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-20
 * ║ Purpose: Auth + LMS rate-limit behaviour tests (M8)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/auth/password.js';
import {
  createMemoryRateLimitStore,
  FILE_UPLOAD_USER_LIMIT,
  LOGIN_USER_LIMIT,
  QUIZ_SUBMIT_USER_LIMIT,
  REFRESH_IP_LIMIT,
} from '../src/auth/rateLimit.js';
import { createMemoryAuthRepository } from '../src/auth/repository.js';
import { createMemoryLmsMutations } from '../src/lms/mutations.js';
import { createMemoryLmsRepository } from '../src/lms/repository.js';
import { createMemoryQuizService } from '../src/lms/quizService.js';
import type { ApiEnv } from '../src/env.js';

const JWT_SECRET = 'test-jwt-access-secret-32chars-min!!';

const testEnv: ApiEnv = {
  API_NAME: 'azes-api',
  API_VERSION: 'v1',
  JWT_ACCESS_SECRET: JWT_SECRET,
  AUTH_RATE_LIMIT_ENABLED: 'true',
};

const deviceBody = {
  deviceId: 'device-rl-1',
  userAgent: 'vitest',
  platform: 'web',
  language: 'en',
};

describe('auth rate limits', () => {
  let passwordHash: string;

  beforeEach(async () => {
    passwordHash = await hashPassword('LocalDevPass123!');
  });

  function appWithLimits() {
    const repo = createMemoryAuthRepository({
      users: [
        {
          id: 'user-rl-1',
          usernameNormalized: 'local.dev',
          passwordHash,
          status: 'active',
          orgId: null,
        },
      ],
      rolesByUser: { 'user-rl-1': ['member'] },
    });
    return createApp({
      authRepo: repo,
      rateLimitStore: createMemoryRateLimitStore(),
    });
  }

  it('login returns 429 RATE_LIMITED after username limit', async () => {
    const app = appWithLimits();
    for (let i = 0; i < LOGIN_USER_LIMIT; i += 1) {
      const res = await app.request(
        '/api/v1/auth/login',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'cf-connecting-ip': '203.0.113.10',
          },
          body: JSON.stringify({
            username: 'local.dev',
            password: 'wrong-password',
            ...deviceBody,
          }),
        },
        testEnv,
      );
      expect(res.status).toBe(401);
    }

    const limited = await app.request(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'cf-connecting-ip': '203.0.113.10',
        },
        body: JSON.stringify({
          username: 'local.dev',
          password: 'wrong-password',
          ...deviceBody,
        }),
      },
      testEnv,
    );
    expect(limited.status).toBe(429);
    expect(limited.headers.get('Retry-After')).toBeTruthy();
    await expect(limited.json()).resolves.toMatchObject({
      error: { code: 'RATE_LIMITED' },
    });
  });

  it('refresh returns 429 RATE_LIMITED after IP limit', async () => {
    const app = appWithLimits();
    const loginRes = await app.request(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'cf-connecting-ip': '198.51.100.7',
        },
        body: JSON.stringify({
          username: 'local.dev',
          password: 'LocalDevPass123!',
          ...deviceBody,
        }),
      },
      testEnv,
    );
    expect(loginRes.status).toBe(200);
    const { refreshToken } = (await loginRes.json()) as { refreshToken: string };

    let lastStatus = 0;
    for (let i = 0; i < REFRESH_IP_LIMIT + 2; i += 1) {
      const res = await app.request(
        '/api/v1/auth/refresh',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'cf-connecting-ip': '198.51.100.7',
          },
          body: JSON.stringify({
            refreshToken: i === 0 ? refreshToken : 'not-a-valid-refresh-token',
            deviceId: deviceBody.deviceId,
          }),
        },
        testEnv,
      );
      lastStatus = res.status;
      if (res.status === 429) {
        expect(res.headers.get('Retry-After')).toBeTruthy();
        await expect(res.json()).resolves.toMatchObject({
          error: { code: 'RATE_LIMITED' },
        });
        return;
      }
    }
    expect(lastStatus).toBe(429);
  });

  it('memory store resets hit window after windowSec elapses (deterministic clock)', async () => {
    const store = createMemoryRateLimitStore();
    const key = 'login:user:window.test';
    const windowSec = 100;
    const limit = 2;
    const t0 = 1_000_000;

    expect((await store.hit(key, windowSec, limit, t0)).allowed).toBe(true);
    expect((await store.hit(key, windowSec, limit, t0 + 1)).allowed).toBe(true);
    const blocked = await store.hit(key, windowSec, limit, t0 + 2);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);

    const afterWindow = await store.hit(key, windowSec, limit, t0 + windowSec);
    expect(afterWindow.allowed).toBe(true);
  });

  it('AUTH_RATE_LIMIT_ENABLED=false skips limits', async () => {
    const app = appWithLimits();
    for (let i = 0; i < LOGIN_USER_LIMIT + 3; i += 1) {
      const res = await app.request(
        '/api/v1/auth/login',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'cf-connecting-ip': '203.0.113.99',
          },
          body: JSON.stringify({
            username: 'local.dev',
            password: 'wrong',
            ...deviceBody,
          }),
        },
        { ...testEnv, AUTH_RATE_LIMIT_ENABLED: 'false' },
      );
      expect(res.status).toBe(401);
    }
  });
});

describe('LMS rate limits (M8)', () => {
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

  function lmsApp() {
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
    const courses = [
      {
        id: 'course-rl-1',
        orgId: 'org-1',
        title: 'RL',
        slug: 'rl',
        description: null,
        categoryId: null,
        level: 'beginner' as const,
        status: 'published' as const,
        accessType: 'free' as const,
        ownerId: 'user-instructor-1',
        publishedAt: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    ];
    const curriculum = {
      'course-rl-1': [
        {
          id: 'mod-1',
          title: 'M',
          position: 1,
          status: 'published' as const,
          lessons: [
            {
              id: 'les-1',
              title: 'L',
              type: 'text' as const,
              position: 1,
              durationMin: 1,
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
        courseId: 'course-rl-1',
        status: 'active' as const,
        enrolledAt: 1,
        completedAt: null,
        course: courses[0]!,
      },
    ];
    return createApp({
      authRepo,
      rateLimitStore: createMemoryRateLimitStore(),
      lmsRepo: createMemoryLmsRepository({ courses, curriculum, enrollments, progress: [] }),
      lmsMutations: createMemoryLmsMutations({ courses, curriculum, enrollments }),
      quizService: createMemoryQuizService(),
    });
  }

  it('quiz submit returns 429 after per-user limit', async () => {
    const app = lmsApp();
    const student = await login(app, 'student.one');

    for (let i = 0; i < QUIZ_SUBMIT_USER_LIMIT; i += 1) {
      const res = await app.request(
        `/api/v1/attempts/missing-attempt-${i}/submit`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${student}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ answers: { q1: 'a' } }),
        },
        testEnv,
      );
      expect(res.status).not.toBe(429);
    }

    const limited = await app.request(
      '/api/v1/attempts/missing-attempt-x/submit',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${student}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ answers: { q1: 'a' } }),
      },
      testEnv,
    );
    expect(limited.status).toBe(429);
    expect(limited.headers.get('Retry-After')).toBeTruthy();
    await expect(limited.json()).resolves.toMatchObject({
      error: { code: 'RATE_LIMITED' },
    });
  });

  it('file upload returns 429 after per-user limit', async () => {
    const app = lmsApp();
    const instructor = await login(app, 'instructor.one');
    const mockFiles = {
      put: async () => undefined,
    } as unknown as R2Bucket;
    const envWithFiles: ApiEnv = { ...testEnv, FILES: mockFiles };

    for (let i = 0; i < FILE_UPLOAD_USER_LIMIT; i += 1) {
      const form = new FormData();
      form.set('file', new File([`hello-${i}`], `f${i}.txt`, { type: 'text/plain' }));
      form.set('purpose', 'course_material');
      const res = await app.request(
        '/api/v1/manage/files',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${instructor}` },
          body: form,
        },
        envWithFiles,
      );
      expect(res.status).toBe(201);
    }

    const form = new FormData();
    form.set('file', new File(['overflow'], 'x.txt', { type: 'text/plain' }));
    const limited = await app.request(
      '/api/v1/manage/files',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${instructor}` },
        body: form,
      },
      envWithFiles,
    );
    expect(limited.status).toBe(429);
    await expect(limited.json()).resolves.toMatchObject({
      error: { code: 'RATE_LIMITED' },
    });
  });
});
