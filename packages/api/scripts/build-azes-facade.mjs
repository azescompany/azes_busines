/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/scripts/build-azes-facade.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-20
 * ║ Purpose: Scaffold src/azes facade barrels from Orval AZES output
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const genRoot = path.join(packageRoot, 'generated/azes');
const facadeRoot = path.join(packageRoot, 'src/azes');

const header = (file, purpose) => `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: ${file}
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-20
 * ║ Purpose: ${purpose}
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

`;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, contents) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents, 'utf8');
}

/** Collect Orval value exports so Vite named imports resolve (export * alone can miss). */
function collectValueExportNames(genFilePath) {
  const src = fs.readFileSync(genFilePath, 'utf8');
  const names = new Set();
  for (const match of src.matchAll(/^export const ([A-Za-z0-9_]+)/gm)) {
    names.add(match[1]);
  }
  for (const match of src.matchAll(/^export function ([A-Za-z0-9_]+)/gm)) {
    names.add(match[1]);
  }
  return [...names].sort();
}

if (!fs.existsSync(genRoot)) {
  console.error(`Missing ${genRoot} — run Orval first`);
  process.exit(1);
}

const tagDirs = fs
  .readdirSync(genRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'models')
  .map((d) => d.name)
  .sort();

const rootValueExports = [];

for (const tag of tagDirs) {
  const genFile = path.join(genRoot, tag, `${tag}.ts`);
  if (!fs.existsSync(genFile)) {
    console.error(`Missing generated tag file: ${genFile}`);
    process.exit(1);
  }
  // Prefer fetch helpers + hooks; skip MutationOptions re-exports (Vite named-export
  // drift when Orval adds mutations mid-session — hooks still work inside generated).
  const valueNames = collectValueExportNames(genFile).filter((n) => !n.includes('MutationOptions'));
  rootValueExports.push(...valueNames.map((n) => ({ tag, name: n })));
  const rel = `../../../generated/azes/${tag}/${tag}`;
  const namedBlock =
    valueNames.length > 0 ? `export {\n  ${valueNames.join(',\n  ')},\n} from '${rel}';\n` : '';
  writeFile(
    path.join(facadeRoot, tag, 'index.ts'),
    header(`packages/api/src/azes/${tag}/index.ts`, `AZES ${tag} API facade`) +
      namedBlock +
      `export type * from '${rel}';\n`,
  );
}

if (fs.existsSync(path.join(genRoot, 'models'))) {
  writeFile(
    path.join(facadeRoot, 'models/index.ts'),
    header('packages/api/src/azes/models/index.ts', 'AZES OpenAPI model re-exports') +
      `export * from '../../../generated/azes/models';\n`,
  );
}

const byTag = new Map();
for (const { tag, name } of rootValueExports) {
  const list = byTag.get(tag) ?? [];
  list.push(name);
  byTag.set(tag, list);
}

const rootLines = [];
for (const tag of tagDirs) {
  const names = byTag.get(tag) ?? [];
  if (names.length === 0) {
    rootLines.push(`export type * from './${tag}';`);
    continue;
  }
  rootLines.push(`export {\n  ${names.join(',\n  ')},\n} from './${tag}';`);
  rootLines.push(`export type * from './${tag}';`);
}
if (fs.existsSync(path.join(genRoot, 'models'))) {
  rootLines.push(`export * as azesModels from './models';`);
  rootLines.push(`export type * from './models';`);
}

writeFile(
  path.join(facadeRoot, 'index.ts'),
  header('packages/api/src/azes/index.ts', 'Public AZES API facade entry (@azes/api/azes)') +
    rootLines.join('\n') +
    '\n',
);

console.warn(
  JSON.stringify({ source: 'azes', tagDirs, valueExportCount: rootValueExports.length }, null, 2),
);
