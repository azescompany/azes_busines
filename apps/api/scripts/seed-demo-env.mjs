/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/scripts/seed-demo-env.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Phase 09 — idempotent multi-org demo seed (dev/test only)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Usage (from apps/api):
 *   AZES_ALLOW_DEMO_SEED=1 node scripts/seed-demo-env.mjs
 *   pnpm exec wrangler d1 execute azes-api --local --file=./.local/seed-demo-env.sql
 *
 * Local/dev shared password (also documented in docs/access_control/DEMO_SEED.md).
 * Credentials mirror: apps/api/.local/demo-credentials.json (gitignored).
 * Refuses production / missing AZES_ALLOW_DEMO_SEED=1.
 */

import { webcrypto } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LOCAL_DIR = join(ROOT, '.local');
const CREDENTIALS_PATH = join(LOCAL_DIR, 'demo-credentials.json');
const SQL_PATH = join(LOCAL_DIR, 'seed-demo-env.sql');

const crypto = webcrypto;
const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

function refuseIfUnsafe() {
  const allow = process.env.AZES_ALLOW_DEMO_SEED === '1';
  const nodeEnv = (process.env.NODE_ENV ?? '').toLowerCase();
  const wranglerEnv = (process.env.WRANGLER_ENV ?? process.env.CLOUDFLARE_ENV ?? '').toLowerCase();
  const isProd =
    nodeEnv === 'production' ||
    wranglerEnv === 'production' ||
    process.env.AZES_ENV === 'production';

  if (isProd) {
    console.error('REFUSED: demo seed must not run in production.');
    process.exit(1);
  }
  if (!allow) {
    console.error('REFUSED: set AZES_ALLOW_DEMO_SEED=1 for local/dev demo seed.');
    process.exit(1);
  }
}

function bytesToBase64(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return Buffer.from(binary, 'binary').toString('base64');
}

/** Local/dev only — same as Vitest fixtures; never use in production. */
const LOCAL_DEMO_PASSWORD = process.env.AZES_DEMO_PASSWORD?.trim() || 'LocalDevPass123!';

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

/** Deterministic demo IDs (UUID-ish). */
const IDS = {
  roleSuperAdmin: '00000000-0000-4000-8000-0000000000rA',
  roleGeneralAdmin: '00000000-0000-4000-8000-0000000000rG',
  roleOrgAdmin: '00000000-0000-4000-8000-0000000000rB',
  roleMember: '00000000-0000-4000-8000-0000000000rM',
  userSuperAdmin: '00000000-0000-4000-8000-0000000090u1',
  userGeneralAdmin: '00000000-0000-4000-8000-0000000090u2',
  orgAzes: '00000000-0000-4000-8000-0000000090o1',
  orgCustomer: '00000000-0000-4000-8000-0000000090o2',
  // AZES Company users
  userAzesAdmin: '00000000-0000-4000-8000-0000000091u1',
  userAzesDevMgr: '00000000-0000-4000-8000-0000000091u2',
  userAzesSales: '00000000-0000-4000-8000-0000000091u3',
  userAzesFinance: '00000000-0000-4000-8000-0000000091u4',
  userAzesMember: '00000000-0000-4000-8000-0000000091u5',
  // Customer org users
  userCustAdmin: '00000000-0000-4000-8000-0000000092u1',
  userCustMgr: '00000000-0000-4000-8000-0000000092u2',
  userCustA: '00000000-0000-4000-8000-0000000092u3',
  userCustB: '00000000-0000-4000-8000-0000000092u4',
  // Units AZES
  unitMgmt: '00000000-0000-4000-8000-0000000091t1',
  unitDev: '00000000-0000-4000-8000-0000000091t2',
  unitSales: '00000000-0000-4000-8000-0000000091t3',
  unitFinance: '00000000-0000-4000-8000-0000000091t4',
  // Units customer
  unitCustBranch: '00000000-0000-4000-8000-0000000092t1',
  unitCustDept: '00000000-0000-4000-8000-0000000092t2',
};

const ACCOUNTS = [
  {
    id: IDS.userSuperAdmin,
    username: 'superadmin@azes.local',
    roleId: IDS.roleSuperAdmin,
    roleName: 'superAdmin',
    orgId: null,
    label: 'SuperAdmin',
  },
  {
    id: IDS.userGeneralAdmin,
    username: 'generaladmin@azes.local',
    roleId: IDS.roleGeneralAdmin,
    roleName: 'generalAdmin',
    orgId: null,
    label: 'GeneralAdmin',
  },
  {
    id: IDS.userAzesAdmin,
    username: 'azes.admin@azes.local',
    roleId: IDS.roleOrgAdmin,
    roleName: 'orgAdmin',
    orgId: IDS.orgAzes,
    label: 'AZES OrgAdmin',
    membershipRole: 'orgAdmin',
  },
  {
    id: IDS.userAzesDevMgr,
    username: 'azes.devmgr@azes.local',
    roleId: IDS.roleMember,
    roleName: 'member',
    orgId: IDS.orgAzes,
    label: 'AZES Dev manager',
    membershipRole: 'member',
  },
  {
    id: IDS.userAzesSales,
    username: 'azes.sales@azes.local',
    roleId: IDS.roleMember,
    roleName: 'member',
    orgId: IDS.orgAzes,
    label: 'AZES Sales',
    membershipRole: 'member',
  },
  {
    id: IDS.userAzesFinance,
    username: 'azes.finance@azes.local',
    roleId: IDS.roleMember,
    roleName: 'member',
    orgId: IDS.orgAzes,
    label: 'AZES Finance',
    membershipRole: 'member',
  },
  {
    id: IDS.userAzesMember,
    username: 'azes.member@azes.local',
    roleId: IDS.roleMember,
    roleName: 'member',
    orgId: IDS.orgAzes,
    label: 'AZES Member',
    membershipRole: 'member',
  },
  {
    id: IDS.userCustAdmin,
    username: 'customer.admin@demo.local',
    roleId: IDS.roleOrgAdmin,
    roleName: 'orgAdmin',
    orgId: IDS.orgCustomer,
    label: 'Customer OrgAdmin',
    membershipRole: 'orgAdmin',
  },
  {
    id: IDS.userCustMgr,
    username: 'customer.mgr@demo.local',
    roleId: IDS.roleMember,
    roleName: 'member',
    orgId: IDS.orgCustomer,
    label: 'Customer manager',
    membershipRole: 'member',
  },
  {
    id: IDS.userCustA,
    username: 'customer.user.a@demo.local',
    roleId: IDS.roleMember,
    roleName: 'member',
    orgId: IDS.orgCustomer,
    label: 'Customer user A',
    membershipRole: 'member',
  },
  {
    id: IDS.userCustB,
    username: 'customer.user.b@demo.local',
    roleId: IDS.roleMember,
    roleName: 'member',
    orgId: IDS.orgCustomer,
    label: 'Customer user B',
    membershipRole: 'member',
  },
];

refuseIfUnsafe();

mkdirSync(LOCAL_DIR, { recursive: true });

const now = Math.floor(Date.now() / 1000);
const lines = [];
lines.push(
  '-- Phase 09 demo seed (dev/local only). Idempotent INSERT OR IGNORE / targeted upserts.',
);
lines.push('-- Do not apply to production.');
lines.push('');

const roles = [
  [IDS.roleSuperAdmin, 'superAdmin'],
  [IDS.roleGeneralAdmin, 'generalAdmin'],
  [IDS.roleOrgAdmin, 'orgAdmin'],
  [IDS.roleMember, 'member'],
];
for (const [id, name] of roles) {
  // Prefer stable id when free; if name already exists under another id, keep that row.
  lines.push(
    `INSERT INTO roles (id, name, created_at) SELECT ${q(id)}, ${q(name)}, ${now} WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = ${q(name)});`,
  );
}
lines.push('');

async function upsertUserSql(a, orgSql) {
  const password = LOCAL_DEMO_PASSWORD;
  const hash = await hashPassword(password);
  // Bind role by name so pre-existing local role rows (different ids) still work.
  const sql = [
    `DELETE FROM unit_memberships WHERE user_id = ${q(a.id)};`,
    `DELETE FROM organization_memberships WHERE user_id = ${q(a.id)};`,
    `DELETE FROM refresh_sessions WHERE user_id = ${q(a.id)};`,
    `DELETE FROM user_roles WHERE user_id = ${q(a.id)};`,
    `DELETE FROM users WHERE id = ${q(a.id)};`,
    `INSERT INTO users (id, username_normalized, password_hash, status, org_id, created_at, updated_at) VALUES (`,
    `  ${q(a.id)}, ${q(a.username)}, ${q(hash)}, 'active', ${orgSql}, ${now}, ${now}`,
    `);`,
    `INSERT INTO user_roles (user_id, role_id, created_at)`,
    `SELECT ${q(a.id)}, id, ${now} FROM roles WHERE name = ${q(a.roleName)} LIMIT 1;`,
  ].join('\n');
  return { sql, password };
}

const outAccounts = [];
const platformAccounts = ACCOUNTS.filter((a) => !a.orgId);
const orgAccounts = ACCOUNTS.filter((a) => a.orgId);

// 1) Platform users first (org_id NULL) so organizations.created_by FK can resolve.
for (const a of platformAccounts) {
  const { sql, password } = await upsertUserSql(a, 'NULL');
  lines.push(sql);
  lines.push('');
  outAccounts.push({
    username: a.username,
    password,
    role: a.roleName,
    label: a.label,
    orgId: a.orgId,
  });
}

// 2) Orgs (created_by = SuperAdmin)
lines.push(
  `INSERT OR IGNORE INTO organizations (id, name, slug, status, subscription_status, created_by, created_at, updated_at)`,
);
lines.push(
  `VALUES (${q(IDS.orgAzes)}, 'AZES Company', 'azes-company', 'active', 'active', ${q(IDS.userSuperAdmin)}, ${now}, ${now});`,
);
lines.push(
  `INSERT OR IGNORE INTO organizations (id, name, slug, status, subscription_status, created_by, created_at, updated_at)`,
);
lines.push(
  `VALUES (${q(IDS.orgCustomer)}, 'Demo Customer LLC', 'demo-customer', 'active', 'active', ${q(IDS.userSuperAdmin)}, ${now}, ${now});`,
);
lines.push('');

// 3) Org-scoped users (org_id now valid)
for (const a of orgAccounts) {
  const { sql, password } = await upsertUserSql(a, q(a.orgId));
  lines.push(sql);
  lines.push('');
  outAccounts.push({
    username: a.username,
    password,
    role: a.roleName,
    label: a.label,
    orgId: a.orgId,
  });
}

// 4) Memberships
for (const a of orgAccounts) {
  if (!a.membershipRole) continue;
  const mid = `m-${a.id.slice(-8)}`;
  lines.push(`DELETE FROM organization_memberships WHERE id = ${q(mid)};`);
  lines.push(
    `INSERT INTO organization_memberships (id, org_id, user_id, role, status, org_multi, data_scope, created_at, updated_at)`,
  );
  lines.push(
    `VALUES (${q(mid)}, ${q(a.orgId)}, ${q(a.id)}, ${q(a.membershipRole)}, 'active', 0, 'org', ${now}, ${now});`,
  );
}
lines.push('');

// 5) Units — clear memberships first, then recreate units
const allUnitIds = [
  IDS.unitMgmt,
  IDS.unitDev,
  IDS.unitSales,
  IDS.unitFinance,
  IDS.unitCustBranch,
  IDS.unitCustDept,
];
for (const unitId of allUnitIds) {
  lines.push(`DELETE FROM unit_memberships WHERE unit_id = ${q(unitId)};`);
}
lines.push('');

const azesUnits = [
  [IDS.unitMgmt, 'Management', 'mgmt', 'department'],
  [IDS.unitDev, 'Development', 'dev', 'department'],
  [IDS.unitSales, 'Sales', 'sales', 'department'],
  [IDS.unitFinance, 'Finance', 'finance', 'department'],
];
for (const [id, name, code, kind] of azesUnits) {
  lines.push(`DELETE FROM organization_units WHERE id = ${q(id)};`);
  lines.push(
    `INSERT INTO organization_units (id, org_id, parent_unit_id, kind, name, code, status, created_at, updated_at)`,
  );
  lines.push(
    `VALUES (${q(id)}, ${q(IDS.orgAzes)}, NULL, ${q(kind)}, ${q(name)}, ${q(code)}, 'active', ${now}, ${now});`,
  );
}
lines.push('');

const custUnits = [
  [IDS.unitCustBranch, 'HQ Branch', 'hq', 'branch'],
  [IDS.unitCustDept, 'Operations', 'ops', 'department'],
];
for (const [id, name, code, kind] of custUnits) {
  lines.push(`DELETE FROM organization_units WHERE id = ${q(id)};`);
  lines.push(
    `INSERT INTO organization_units (id, org_id, parent_unit_id, kind, name, code, status, created_at, updated_at)`,
  );
  const parent = id === IDS.unitCustDept ? q(IDS.unitCustBranch) : 'NULL';
  lines.push(
    `VALUES (${q(id)}, ${q(IDS.orgCustomer)}, ${parent}, ${q(kind)}, ${q(name)}, ${q(code)}, 'active', ${now}, ${now});`,
  );
}
lines.push('');

// 6) Unit memberships
const unitMembers = [
  [IDS.unitMgmt, IDS.userAzesAdmin, 'manager'],
  [IDS.unitDev, IDS.userAzesDevMgr, 'manager'],
  [IDS.unitSales, IDS.userAzesSales, 'member'],
  [IDS.unitFinance, IDS.userAzesFinance, 'member'],
  [IDS.unitCustBranch, IDS.userCustAdmin, 'manager'],
  [IDS.unitCustDept, IDS.userCustMgr, 'manager'],
  [IDS.unitCustDept, IDS.userCustA, 'member'],
  [IDS.unitCustDept, IDS.userCustB, 'member'],
];
for (const [unitId, userId, role] of unitMembers) {
  const umid = `um-${unitId.slice(-4)}-${userId.slice(-4)}`;
  const org = unitId.includes('0092') ? IDS.orgCustomer : IDS.orgAzes;
  lines.push(`DELETE FROM unit_memberships WHERE id = ${q(umid)};`);
  lines.push(
    `INSERT INTO unit_memberships (id, org_id, unit_id, user_id, role, status, created_at, updated_at)`,
  );
  lines.push(
    `VALUES (${q(umid)}, ${q(org)}, ${q(unitId)}, ${q(userId)}, ${q(role)}, 'active', ${now}, ${now});`,
  );
}

writeFileSync(SQL_PATH, lines.join('\n') + '\n', 'utf8');
writeFileSync(
  CREDENTIALS_PATH,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      note: 'Local/dev only. Never commit. Reset: delete this file and re-run seed.',
      accounts: outAccounts.map(({ username, password, role, label, orgId }) => ({
        username,
        password,
        role,
        label,
        orgId,
      })),
    },
    null,
    2,
  ),
  'utf8',
);

console.error('Demo seed SQL written:', SQL_PATH);
console.error('Credentials written (gitignored):', CREDENTIALS_PATH);
console.error('');
console.error('Accounts (passwords only in .local/demo-credentials.json):');
for (const a of outAccounts) {
  console.error(`  ${a.label.padEnd(22)} ${a.username}`);
}
console.error('');
console.error('Apply (local D1):');
console.error('  pnpm exec wrangler d1 execute azes-api --local --file=./.local/seed-demo-env.sql');
console.error('');
console.error('Sign-in: Account app → username above; password from demo-credentials.json');
console.error('Reset passwords: delete .local/demo-credentials.json and re-run this script.');
