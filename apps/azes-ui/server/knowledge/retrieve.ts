/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/server/knowledge/retrieve.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Keyword overlap retrieval over curated AI knowledge chunks
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type KnowledgeChunk = {
  id: string;
  title: string;
  source: string;
  text: string;
};

const STOP = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'to',
  'of',
  'in',
  'on',
  'for',
  'is',
  'are',
  'be',
  'with',
  'how',
  'what',
  'where',
  'when',
  'why',
  'does',
  'do',
  'can',
  'i',
  'we',
  'you',
  'it',
  'this',
  'that',
  've',
  'dir',
  'bir',
  'nedir',
  'necə',
  'nece',
  'haqqinda',
  'haqqında',
]);

/** Tokenize for overlap scoring (ASCII + common path chars). */
export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9@/_.-]+/u)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/**
 * Rank chunks by term overlap with the query. Returns topK unique chunks.
 */
export function retrieveChunks(
  query: string,
  chunks: readonly KnowledgeChunk[],
  topK = 4,
): KnowledgeChunk[] {
  const terms = tokenize(query);
  if (terms.length === 0) {
    return chunks.slice(0, Math.min(2, chunks.length));
  }

  const scored = chunks.map((chunk) => {
    const hay = `${chunk.title} ${chunk.source} ${chunk.text}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (hay.includes(term)) score += term.length >= 5 ? 2 : 1;
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const positive = scored.filter((s) => s.score > 0).slice(0, topK);
  if (positive.length > 0) return positive.map((s) => s.chunk);
  return scored.slice(0, Math.min(2, scored.length)).map((s) => s.chunk);
}

/** Format retrieved chunks for the system/context message. */
export function formatContext(chunks: readonly KnowledgeChunk[]): string {
  if (chunks.length === 0) return '(no knowledge chunks matched)';
  return chunks.map((c, i) => `[${i + 1}] ${c.title} (${c.source})\n${c.text}`).join('\n\n');
}
