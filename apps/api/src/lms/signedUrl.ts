/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/lms/signedUrl.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Short-lived HMAC signed URLs for LMS file materials (M4)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

const encoder = () => new TextEncoder();

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Default material URL TTL: 15 minutes. */
export const SIGNED_FILE_TTL_SEC = 900;

export async function createSignedFileAccess(options: {
  secret: string;
  fileId: string;
  userId: string;
  nowSec: number;
  ttlSec?: number;
}): Promise<{ expiresAt: number; path: string }> {
  const expiresAt = options.nowSec + (options.ttlSec ?? SIGNED_FILE_TTL_SEC);
  const payload = `${options.fileId}.${expiresAt}.${options.userId}`;
  const sig = await hmacHex(options.secret, payload);
  const path = `/api/v1/files/${options.fileId}/content?exp=${expiresAt}&uid=${encodeURIComponent(options.userId)}&sig=${sig}`;
  return { expiresAt, path };
}

export async function verifySignedFileAccess(options: {
  secret: string;
  fileId: string;
  userId: string;
  expiresAt: number;
  sig: string;
  nowSec: number;
}): Promise<boolean> {
  if (!Number.isFinite(options.expiresAt) || options.expiresAt < options.nowSec) {
    return false;
  }
  const payload = `${options.fileId}.${options.expiresAt}.${options.userId}`;
  const expected = await hmacHex(options.secret, payload);
  if (expected.length !== options.sig.length) return false;
  let ok = 0;
  for (let i = 0; i < expected.length; i += 1) {
    ok |= expected.charCodeAt(i) ^ options.sig.charCodeAt(i);
  }
  return ok === 0;
}
