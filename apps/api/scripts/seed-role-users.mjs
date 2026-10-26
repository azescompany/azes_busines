/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/scripts/seed-role-users.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Print local SQL — one active user per LMS role (dev)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Usage (from apps/api):
 *   node scripts/seed-role-users.mjs > seed-role-users.sql
 *   pnpm exec wrangler d1 execute azes-api --local --file=./seed-role-users.sql
 *
 * guest = loginless (no DB user). All passwords: LocalDevPass123!
 */

import { webcrypto } from 'node:crypto';

const crypto = webcrypto;
const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;
const PASSWORD = 'LocalDevPass123!';

const ORG_ID = '00000000-0000-4000-8000-0000000000og';

const ROLE_IDS = {
  superAdmin: '00000000-0000-4000-8000-0000000000rA',
  orgAdmin: '00000000-0000-4000-8000-0000000000rB',
  instructor: '00000000-0000-4000-8000-0000000000ri',
  student: '00000000-0000-4000-8000-0000000000rs',
};

/** @type {{ id: string; username: string; role: keyof typeof ROLE_IDS; orgId: string | null }[]} */
const USERS = [
  {
    id: '00000000-0000-4000-8000-0000000000u1',
    username: 'sa.demo',
    role: 'superAdmin',
    orgId: null,
  },
  {
    id: '00000000-0000-4000-8000-0000000000u2',
    username: 'oa.demo',
    role: 'orgAdmin',
    orgId: ORG_ID,
  },
  {
    id: '00000000-0000-4000-8000-0000000000u3',
    username: 'instructor.demo',
    role: 'instructor',
    orgId: ORG_ID,
  },
  {
    id: '00000000-0000-4000-8000-0000000000u4',
    username: 'student.demo',
    role: 'student',
    orgId: ORG_ID,
  },
];

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
  return `pbkdf2$${PBKDF2_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(new Uint8Array(bits))}`;
}

function q(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function upsertUserSql(u, hash, now) {
  const roleId = ROLE_IDS[u.role];
  const orgSql = u.orgId ? q(u.orgId) : 'NULL';
  return [
    `DELETE FROM user_roles WHERE user_id = ${q(u.id)};`,
    `DELETE FROM refresh_sessions WHERE user_id = ${q(u.id)};`,
    `DELETE FROM users WHERE id = ${q(u.id)};`,
    `INSERT INTO users (id, username_normalized, password_hash, status, org_id, created_at, updated_at) VALUES (`,
    `  ${q(u.id)}, ${q(u.username)}, ${q(hash)}, 'active', ${orgSql}, ${now}, ${now}`,
    `);`,
    `INSERT INTO user_roles (user_id, role_id, created_at) VALUES (${q(u.id)}, ${q(roleId)}, ${now});`,
  ].join('\n');
}

const now = Math.floor(Date.now() / 1000);
const hashes = {};
for (const u of USERS) {
  hashes[u.id] = await hashPassword(PASSWORD);
}

const sa = USERS[0];
const others = USERS.slice(1);

const lines = [];
lines.push('-- Local role users (dev only). Do not use in production.');
lines.push('');

for (const [name, id] of Object.entries(ROLE_IDS)) {
  lines.push(
    `INSERT OR IGNORE INTO roles (id, name, created_at) VALUES (${q(id)}, ${q(name)}, ${now});`,
  );
}
lines.push('');

// superAdmin first (no org) so organizations.created_by FK can resolve.
lines.push(upsertUserSql(sa, hashes[sa.id], now));
lines.push('');
lines.push(
  `INSERT OR IGNORE INTO organizations (id, name, slug, status, created_by, created_at, updated_at)`,
);
lines.push(
  `VALUES (${q(ORG_ID)}, 'AZES Academy Demo', 'azes-demo', 'active', ${q(sa.id)}, ${now}, ${now});`,
);
lines.push('');

for (const u of others) {
  lines.push(upsertUserSql(u, hashes[u.id], now));
  lines.push('');
}

process.stdout.write(lines.join('\n').trim() + '\n');

console.error('');
console.error('Local role credentials (dev only) — password for all: ' + PASSWORD);
console.error('');
for (const u of USERS) {
  console.error(`  ${u.role.padEnd(12)}  username: ${u.username}  orgId: ${u.orgId ?? 'null'}`);
}
console.error('  guest         (login yox — yalnız ictimai vitrin / Account login səhifəsi)');
console.error('');
console.error('Apply (from apps/api):');
console.error(
  '  node scripts/seed-role-users.mjs > seed-role-users.sql && pnpm exec wrangler d1 execute azes-api --local --file=./seed-role-users.sql',
);
