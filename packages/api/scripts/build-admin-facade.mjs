/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/scripts/build-admin-facade.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Scaffold src/admin facade barrels from Orval ADMIN output
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const genRoot = path.join(packageRoot, 'generated/admin');
const facadeRoot = path.join(packageRoot, 'src/admin');

const header = (file, purpose) => `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: ${file}
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: ${purpose}
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

`;

function listExports(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const values = new Set();
  const types = new Set();
  for (const match of src.matchAll(/^export (const|function|type|interface|enum|class) (\w+)/gm)) {
    const kind = match[1];
    const name = match[2];
    if (kind === 'type' || kind === 'interface') {
      types.add(name);
    } else {
      values.add(name);
    }
  }
  return { values: [...values], types: [...types] };
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, contents) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents, 'utf8');
}

function namedExportBlock(kind, names, fromPath) {
  if (names.length === 0) {
    return '';
  }
  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  const keyword = kind === 'type' ? 'export type' : 'export';
  return `${keyword} {\n${sorted.map((n) => `  ${n},`).join('\n')}\n} from '${fromPath}';\n`;
}

function writeSelectiveFacade(filePath, purpose, values, types, fromPath) {
  writeFile(
    filePath,
    header(
      filePath.replace(`${packageRoot}${path.sep}`, 'packages/api/').replaceAll('\\', '/'),
      purpose,
    ) +
      namedExportBlock('value', values, fromPath) +
      (values.length && types.length ? '\n' : '') +
      namedExportBlock('type', types, fromPath),
  );
}

const tagDirs = fs
  .readdirSync(genRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'models')
  .map((d) => d.name)
  .sort();

let totalQueries = 0;
let totalMutations = 0;
let totalHooks = 0;
const perTag = {};

for (const tag of tagDirs) {
  const genFile = path.join(genRoot, tag, `${tag}.ts`);
  const { values, types } = listExports(genFile);
  const allNames = [...values, ...types];
  const src = fs.readFileSync(genFile, 'utf8');
  const queries = (src.match(/export const getGet\w+QueryOptions/g) || []).length;
  const mutations = (src.match(/export const get\w+MutationOptions/g) || []).length;
  const hooks = new Set(
    [...src.matchAll(/export (?:const|function) (use\w+)/g)].map((match) => match[1]),
  ).size;
  totalQueries += queries;
  totalMutations += mutations;
  totalHooks += hooks;
  perTag[tag] = { queries, mutations, hooks, exports: allNames.length };

  if (tag === 'roles') {
    const menusValues = values.filter((n) => /RolesMenus/.test(n));
    const menusTypes = types.filter((n) => /RolesMenus/.test(n));
    const dropdownValues = values.filter((n) => /RolesDropdown/.test(n));
    const dropdownTypes = types.filter((n) => /RolesDropdown/.test(n));
    const rootValues = values.filter((n) => !/RolesMenus|RolesDropdown/.test(n));
    const rootTypes = types.filter((n) => !/RolesMenus|RolesDropdown/.test(n));

    writeSelectiveFacade(
      path.join(facadeRoot, 'roles/menus/index.ts'),
      'ADMIN roles/menus API facade',
      menusValues,
      menusTypes,
      '../../../../generated/admin/roles/roles',
    );
    writeSelectiveFacade(
      path.join(facadeRoot, 'roles/dropdown/index.ts'),
      'ADMIN roles/dropdown API facade',
      dropdownValues,
      dropdownTypes,
      '../../../../generated/admin/roles/roles',
    );
    writeFile(
      path.join(facadeRoot, 'roles/index.ts'),
      header('packages/api/src/admin/roles/index.ts', 'ADMIN roles API facade') +
        `export * from './menus';\nexport * from './dropdown';\n\n` +
        namedExportBlock('value', rootValues, '../../../generated/admin/roles/roles') +
        (rootValues.length && rootTypes.length ? '\n' : '') +
        namedExportBlock('type', rootTypes, '../../../generated/admin/roles/roles'),
    );
    continue;
  }

  if (tag === 'admin-budget') {
    const overdueValues = values.filter((n) => /AdminbudgetOverdue/.test(n));
    const overdueTypes = types.filter((n) => /AdminbudgetOverdue/.test(n));
    const restValues = values.filter((n) => !/AdminbudgetOverdue/.test(n));
    const restTypes = types.filter((n) => !/AdminbudgetOverdue/.test(n));

    writeSelectiveFacade(
      path.join(facadeRoot, 'admin-budget/overdue/index.ts'),
      'ADMIN admin-budget/overdue API facade',
      overdueValues,
      overdueTypes,
      '../../../../generated/admin/admin-budget/admin-budget',
    );
    writeFile(
      path.join(facadeRoot, 'admin-budget/index.ts'),
      header('packages/api/src/admin/admin-budget/index.ts', 'ADMIN admin-budget API facade') +
        `export * from './overdue';\n\n` +
        namedExportBlock(
          'value',
          restValues,
          '../../../generated/admin/admin-budget/admin-budget',
        ) +
        (restValues.length && restTypes.length ? '\n' : '') +
        namedExportBlock('type', restTypes, '../../../generated/admin/admin-budget/admin-budget'),
    );
    continue;
  }

  writeFile(
    path.join(facadeRoot, tag, 'index.ts'),
    header(`packages/api/src/admin/${tag}/index.ts`, `ADMIN ${tag} API facade`) +
      `export * from '../../../generated/admin/${tag}/${tag}';\n`,
  );
}

writeFile(
  path.join(facadeRoot, 'models/index.ts'),
  header('packages/api/src/admin/models/index.ts', 'ADMIN OpenAPI model re-exports') +
    `export * from '../../../generated/admin/models';\n`,
);

writeFile(
  path.join(facadeRoot, 'index.ts'),
  header('packages/api/src/admin/index.ts', 'Public ADMIN API facade entry (@azes/api/admin)') +
    [
      ...tagDirs.map((t) => `export * from './${t}';`),
      `export * as adminModels from './models';`,
      `export type * from './models';`,
    ].join('\n') +
    '\n',
);

const modelFiles = fs
  .readdirSync(path.join(genRoot, 'models'))
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts').length;

console.warn(
  JSON.stringify(
    {
      tagDirs,
      totalQueries,
      totalMutations,
      totalHooks,
      modelFiles,
      perTag,
    },
    null,
    2,
  ),
);
