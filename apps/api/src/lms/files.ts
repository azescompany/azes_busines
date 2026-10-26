/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/lms/files.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: R2 upload validation + put (Mərhələ 2)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { ApiHttpError } from '../errors.js';
import { newId, nowSec } from '../auth/tokens.js';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_UPLOAD_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
]);

export type UploadedFileMeta = {
  id: string;
  ownerId: string;
  storageKey: string;
  mime: string;
  size: number;
  purpose: string;
  createdAt: number;
  updatedAt: number;
};

export function assertAllowedUpload(mime: string, size: number): void {
  if (!ALLOWED_UPLOAD_MIME.has(mime)) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Unsupported file type');
  }
  if (size <= 0 || size > MAX_UPLOAD_BYTES) {
    throw new ApiHttpError(400, 'VALIDATION_ERROR', 'File exceeds size limit (5MB)');
  }
}

export async function putCourseFile(options: {
  r2: R2Bucket;
  ownerId: string;
  purpose: string;
  mime: string;
  bytes: ArrayBuffer;
}): Promise<UploadedFileMeta> {
  assertAllowedUpload(options.mime, options.bytes.byteLength);
  const id = newId();
  const storageKey = `lms/${options.ownerId}/${id}`;
  await options.r2.put(storageKey, options.bytes, {
    httpMetadata: { contentType: options.mime },
  });
  const ts = nowSec();
  return {
    id,
    ownerId: options.ownerId,
    storageKey,
    mime: options.mime,
    size: options.bytes.byteLength,
    purpose: options.purpose,
    createdAt: ts,
    updatedAt: ts,
  };
}
