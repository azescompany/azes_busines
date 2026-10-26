/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/validation/src/index.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Public API and primitive schema tests for @azes/validation
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import * as validation from './index.js';
import { parseWithSchema } from './parse.js';
import { emailString, nonEmptyString, paginationInput } from './primitives.js';

describe('@azes/validation', () => {
  it('exports zod and foundation helpers', () => {
    expect(validation.z).toBeDefined();
    expect(validation.parseWithSchema).toBeTypeOf('function');
    expect(validation.VALIDATION_CONVENTIONS.length).toBeGreaterThan(0);
  });

  it('validates primitives and maps field errors', () => {
    expect(nonEmptyString.safeParse('  hi ').success).toBe(true);
    expect(nonEmptyString.safeParse('   ').success).toBe(false);
    expect(emailString.safeParse('a@b.co').success).toBe(true);
    expect(emailString.safeParse('nope').success).toBe(false);

    const ok = parseWithSchema(paginationInput, { page: '2', pageSize: '10' });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data).toEqual({ page: 2, pageSize: 10 });
    }

    const bad = parseWithSchema(paginationInput, { page: 0, pageSize: 500 });
    expect(bad.success).toBe(false);
    if (!bad.success) {
      expect(Object.keys(bad.fieldErrors).length).toBeGreaterThan(0);
    }
  });

  it('does not depend on react, api, ui, state, or auth', () => {
    const packageJsonPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };
    const deps = { ...packageJson.dependencies, ...packageJson.peerDependencies };
    expect(deps.zod).toBeDefined();
    expect(deps.react).toBeUndefined();
    expect(deps['@azes/api']).toBeUndefined();
    expect(deps['@azes/ui-web']).toBeUndefined();
    expect(deps['@azes/state']).toBeUndefined();
    expect(deps['@azes/auth']).toBeUndefined();
  });
});
