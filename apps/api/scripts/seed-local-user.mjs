/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/scripts/seed-local-user.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Print local-only SQL to seed one active auth user
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Usage (from apps/api):
 *   node scripts/seed-local-user.mjs
 * Then apply with wrangler d1 execute (see README).
 *
 * Local-only credentials (never use in production):
 *   username: local.dev
 *   password: LocalDevPass123!
 */

import { webcrypto } from 'node:crypto';

const crypto = webcrypto;
const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

const USERNAME = 'local.dev';
const PASSWORD = 'LocalDevPass123!';
const USER_ID = '00000000-0000-4000-8000-000000000001';
const ROLE_ID = '00000000-0000-4000-8000-0000000000r1';
const ROLE_NAME = 'member';

function bytesToBase64(bytes) {
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return Buffer.from(binary, 'binary').toString('base64');
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: PBKDF2_ITERATIONS,
    },
    baseKey,
    KEY_BITS,
  );
  const hash = new Uint8Array(bits);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(hash)}`;
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const now = Math.floor(Date.now() / 1000);
const passwordHash = await hashPassword(PASSWORD);

const sql = `
-- Local-only seed (Phase 2B). Do not use these credentials in production.
DELETE FROM user_roles WHERE user_id = ${sqlString(USER_ID)};
DELETE FROM refresh_sessions WHERE user_id = ${sqlString(USER_ID)};
DELETE FROM users WHERE id = ${sqlString(USER_ID)};
DELETE FROM roles WHERE id = ${sqlString(ROLE_ID)};

INSERT INTO roles (id, name, created_at) VALUES (
  ${sqlString(ROLE_ID)},
  ${sqlString(ROLE_NAME)},
  ${now}
);

INSERT INTO users (id, username_normalized, password_hash, status, created_at, updated_at) VALUES (
  ${sqlString(USER_ID)},
  ${sqlString(USERNAME)},
  ${sqlString(passwordHash)},
  'active',
  ${now},
  ${now}
);

INSERT INTO user_roles (user_id, role_id, created_at) VALUES (
  ${sqlString(USER_ID)},
  ${sqlString(ROLE_ID)},
  ${now}
);
`.trim();

// Seed script emits SQL to stdout for piping into wrangler.
// eslint-disable-next-line no-console -- intentional CLI stdout
console.log(sql);
console.error('');
console.error('Local credentials (dev only):');
console.error(`  username: ${USERNAME}`);
console.error(`  password: ${PASSWORD}`);
console.error('');
console.error('Apply (from apps/api):');
console.error(
  '  node scripts/seed-local-user.mjs > /tmp/azes-seed.sql && pnpm exec wrangler d1 execute azes-api --local --file=/tmp/azes-seed.sql',
);
