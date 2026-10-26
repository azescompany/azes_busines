/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/scripts/seed-lms.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Print local-only SQL to seed LMS demo course + roles
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Prerequisites: auth user `local.dev` already seeded (seed-local-user.mjs).
 * Usage (apps/api):
 *   node scripts/seed-lms.mjs > seed-lms.sql
 *   pnpm exec wrangler d1 execute azes-api --local --file=./seed-lms.sql
 */

const now = Math.floor(Date.now() / 1000);
const USER_ID = '00000000-0000-4000-8000-000000000001';
const ORG_ID = '00000000-0000-4000-8000-0000000000og';
const ROLE_STUDENT = '00000000-0000-4000-8000-0000000000rs';
const ROLE_INSTRUCTOR = '00000000-0000-4000-8000-0000000000ri';
const TRACK_ID = '00000000-0000-4000-8000-0000000000tr';
const CAT_ID = '00000000-0000-4000-8000-0000000000c1';
const COURSE_ID = '00000000-0000-4000-8000-0000000000k1';
const MOD_ID = '00000000-0000-4000-8000-0000000000m1';
const LES_ID = '00000000-0000-4000-8000-0000000000l1';
const ENR_ID = '00000000-0000-4000-8000-0000000000e1';

function q(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const sql = `
-- Local LMS seed (M1 + M1b). Requires users.id = ${USER_ID} (local.dev) + migration 0003.
INSERT OR IGNORE INTO organizations (id, name, slug, status, created_by, created_at, updated_at)
VALUES (${q(ORG_ID)}, 'AZES Academy Demo', 'azes-demo', 'active', ${q(USER_ID)}, ${now}, ${now});
UPDATE users SET org_id = ${q(ORG_ID)} WHERE id = ${q(USER_ID)};

INSERT OR IGNORE INTO roles (id, name, created_at) VALUES (${q(ROLE_STUDENT)}, 'student', ${now});
INSERT OR IGNORE INTO roles (id, name, created_at) VALUES (${q(ROLE_INSTRUCTOR)}, 'instructor', ${now});
INSERT OR IGNORE INTO user_roles (user_id, role_id, created_at) VALUES (${q(USER_ID)}, ${q(ROLE_STUDENT)}, ${now});
INSERT OR IGNORE INTO user_roles (user_id, role_id, created_at) VALUES (${q(USER_ID)}, ${q(ROLE_INSTRUCTOR)}, ${now});

DELETE FROM user_tracks WHERE track_id = ${q(TRACK_ID)};
DELETE FROM track_courses WHERE track_id = ${q(TRACK_ID)};
DELETE FROM tracks WHERE id = ${q(TRACK_ID)};
DELETE FROM lesson_progress WHERE enrollment_id = ${q(ENR_ID)};
DELETE FROM enrollments WHERE id = ${q(ENR_ID)};
DELETE FROM lessons WHERE id = ${q(LES_ID)};
DELETE FROM modules WHERE id = ${q(MOD_ID)};
DELETE FROM courses WHERE id = ${q(COURSE_ID)};
DELETE FROM categories WHERE id = ${q(CAT_ID)};

INSERT INTO categories (id, name, slug, created_at, updated_at) VALUES (
  ${q(CAT_ID)}, 'Sahibkarlıq', 'sahibkarliq', ${now}, ${now}
);

INSERT INTO courses (
  id, org_id, title, slug, description, category_id, level, cover_file_id,
  status, access_type, owner_id, created_at, updated_at, published_at
) VALUES (
  ${q(COURSE_ID)},
  ${q(ORG_ID)},
  'Sahibkarlığa giriş',
  'sahibkarliga-giris',
  'Demo published kurs — Mərhələ 1 seed.',
  ${q(CAT_ID)},
  'beginner',
  NULL,
  'published',
  'free',
  ${q(USER_ID)},
  ${now},
  ${now},
  ${now}
);

INSERT INTO tracks (id, org_id, name, slug, description, status, created_by, created_at, updated_at)
VALUES (
  ${q(TRACK_ID)}, ${q(ORG_ID)}, 'Demo proqram', 'demo-program', 'Seed track', 'active',
  ${q(USER_ID)}, ${now}, ${now}
);
INSERT INTO track_courses (track_id, course_id, position, created_at)
VALUES (${q(TRACK_ID)}, ${q(COURSE_ID)}, 1, ${now});
INSERT INTO user_tracks (user_id, track_id, status, assigned_by, assigned_at)
VALUES (${q(USER_ID)}, ${q(TRACK_ID)}, 'active', ${q(USER_ID)}, ${now});

INSERT INTO modules (id, course_id, title, position, status, created_at, updated_at) VALUES (
  ${q(MOD_ID)}, ${q(COURSE_ID)}, 'Modul 1', 1, 'published', ${now}, ${now}
);

INSERT INTO lessons (
  id, module_id, title, type, content, video_url, duration_min,
  position, is_required, status, created_at, updated_at
) VALUES (
  ${q(LES_ID)},
  ${q(MOD_ID)},
  'Xoş gəlmisiniz',
  'text',
  'Bu demo dərs mətnidir.',
  NULL,
  5,
  1,
  1,
  'published',
  ${now},
  ${now}
);

INSERT INTO enrollments (
  id, user_id, course_id, status, enrolled_at, completed_at, created_at, updated_at
) VALUES (
  ${q(ENR_ID)}, ${q(USER_ID)}, ${q(COURSE_ID)}, 'active', ${now}, NULL, ${now}, ${now}
);
`;

console.error('LMS seed SQL written to stdout. Apply with wrangler d1 execute --local.');
process.stdout.write(sql.trim() + '\n');
