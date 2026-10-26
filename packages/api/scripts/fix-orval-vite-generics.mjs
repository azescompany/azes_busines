/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/scripts/fix-orval-vite-generics.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Post-Orval — trailing commas on const generics (Vite/JSX)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Vite/esbuild can treat `export const foo = <T>(...)` as JSX and drop the
 * export. Trailing comma (`<T,>`) makes the generic unambiguous in TSX.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generatedRoot = path.join(packageRoot, 'generated');

function walkTsFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkTsFiles(full, out);
    else if (entry.isFile() && entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

/**
 * Add trailing comma to type-parameter list of `export const Name = <...>(`.
 * Stops at the first `>(` that closes the parameter list (not nested `>` alone).
 */
function fixConstGenerics(src) {
  const marker = 'export const ';
  let result = '';
  let i = 0;
  while (i < src.length) {
    const start = src.indexOf(marker, i);
    if (start === -1) {
      result += src.slice(i);
      break;
    }
    result += src.slice(i, start);
    const afterConst = start + marker.length;
    const eqLt = src.indexOf(' = <', afterConst);
    // Not a generic const export — copy through next safe point
    if (eqLt === -1 || eqLt > src.indexOf('\n', afterConst) + 200) {
      // Heuristic failed; copy marker and continue one char
      result += marker;
      i = afterConst;
      continue;
    }
    // Ensure name is between marker and ` = <` with no other `=`
    const namePart = src.slice(afterConst, eqLt);
    if (!/^[A-Za-z0-9_]+$/.test(namePart.trim())) {
      result += marker;
      i = afterConst;
      continue;
    }
    const typeStart = eqLt + ' = <'.length;
    // Scan for matching `>(` at depth 0 of angle brackets
    let depth = 1;
    let j = typeStart;
    let closeAt = -1;
    while (j < src.length) {
      const ch = src[j];
      if (ch === '<') depth += 1;
      else if (ch === '>') {
        depth -= 1;
        if (depth === 0) {
          // Skip whitespace
          let k = j + 1;
          while (k < src.length && /\s/.test(src[k])) k += 1;
          if (src[k] === '(') {
            closeAt = j;
            break;
          }
          // Lone `>` that wasn't followed by `(` — treat as still inside? depth is 0 incorrectly
          // for nested generics we only hit depth 0 at the real end.
          break;
        }
      }
      j += 1;
    }
    if (closeAt === -1) {
      result += marker;
      i = afterConst;
      continue;
    }
    const typeParams = src.slice(typeStart, closeAt);
    const trimmedEnd = typeParams.replace(/\s+$/, '');
    const fixedParams = trimmedEnd.endsWith(',') ? typeParams : `${trimmedEnd},\n`;
    result += `export const ${namePart.trim()} = <${fixedParams}>`;
    i = closeAt + 1; // continue from char after `>`
  }
  return result;
}

const files = walkTsFiles(generatedRoot);
let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes('export const ') || !before.includes(' = <')) continue;
  const after = fixConstGenerics(before);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed += 1;
  }
}

// eslint-disable-next-line no-console -- intentional CLI summary
console.log(
  JSON.stringify({
    scanned: files.length,
    rewritten: changed,
  }),
);
