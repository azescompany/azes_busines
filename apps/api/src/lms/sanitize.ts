/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/lms/sanitize.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Server-side rich-text sanitize (Markdown / light HTML)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** Strip dangerous HTML / script vectors; keep Markdown-friendly plain text. */
export function sanitizeCourseContent(input: string | null | undefined): string | null {
  if (input == null) return null;
  let text = String(input);
  // Remove script/style blocks
  text = text.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');
  // Neutralize javascript: / data: URLs in leftover text
  text = text.replace(/javascript\s*:/gi, '');
  text = text.replace(/vbscript\s*:/gi, '');
  // Collapse extreme control chars (literal control ranges are intentional).
  // eslint-disable-next-line no-control-regex -- strip C0 controls from user HTML/text
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  return text.trim() === '' ? null : text;
}

export function sanitizeTitle(input: string): string {
  return sanitizeCourseContent(input)?.trim() ?? '';
}
