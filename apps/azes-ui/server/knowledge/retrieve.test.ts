/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/server/knowledge/retrieve.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Unit tests for knowledge retrieval scoring
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { formatContext, retrieveChunks, tokenize, type KnowledgeChunk } from './retrieve.js';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const chunks = JSON.parse(
  readFileSync(path.join(rootDir, 'chunks.json'), 'utf8'),
) as KnowledgeChunk[];

describe('tokenize', () => {
  it('drops stop words and short tokens', () => {
    expect(tokenize('What is the azes-ui port?')).toContain('azes-ui');
    expect(tokenize('What is the azes-ui port?')).not.toContain('the');
  });
});

describe('retrieveChunks', () => {
  it('ranks azes-ui-related chunks above unrelated queries', () => {
    const hit = retrieveChunks('azes-ui showcase port 7777', chunks, 3);
    expect(hit.length).toBeGreaterThan(0);
    expect(hit.some((c) => c.id.includes('azes-ui') || c.text.includes('7777'))).toBe(true);
  });

  it('formats context with source paths', () => {
    const ctx = formatContext(chunks.slice(0, 1));
    expect(ctx).toContain(chunks[0]!.source);
  });
});
