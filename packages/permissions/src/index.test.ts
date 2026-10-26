/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/permissions/src/index.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Permission model and checker unit tests
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { createPermissionChecker } from './checker.js';
import * as permissions from './index.js';
import { isPermission, parsePermission, permissionOf } from './parse.js';

describe('@azes/permissions', () => {
  it('exports the resource.action foundation', () => {
    expect(permissions.createPermissionChecker).toBeTypeOf('function');
    expect(permissions.PERMISSIONS_BOUNDARY.length).toBeGreaterThan(0);
  });

  it('parses valid permissions and rejects invalid ones', () => {
    expect(isPermission('listing.read')).toBe(true);
    expect(parsePermission('listing.read')).toEqual({
      resource: 'listing',
      action: 'read',
    });
    expect(isPermission('listing')).toBe(false);
    expect(isPermission('.read')).toBe(false);
    expect(permissionOf('user', 'update')).toBe('user.update');
    expect(() => permissionOf('', 'x')).toThrow();
  });

  it('checks grants for UX gating', () => {
    const checker = createPermissionChecker(['listing.read', 'listing.write', 'bad']);
    expect(checker.can('listing.read')).toBe(true);
    expect(checker.can('listing.delete')).toBe(false);
    expect(checker.canAny(['listing.delete', 'listing.write'])).toBe(true);
    expect(checker.canAll(['listing.read', 'listing.write'])).toBe(true);
    expect(checker.canAll(['listing.read', 'listing.delete'])).toBe(false);
    expect(checker.canAll([])).toBe(false);
    expect(checker.list()).toEqual(['listing.read', 'listing.write']);
  });

  it('has no runtime package dependencies', () => {
    const packageJsonPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };
    expect(packageJson.dependencies ?? {}).toEqual({});
    const peers = packageJson.peerDependencies ?? {};
    expect(peers.react).toBeUndefined();
    expect(peers['@azes/api']).toBeUndefined();
  });
});
