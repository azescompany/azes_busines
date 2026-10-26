/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/client/errors.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-11
 * ║ Purpose: Normalized API error type for transport/HTTP failures
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type AzesApiErrorBody = unknown;

export class AzesApiError extends Error {
  override readonly name = 'AzesApiError';
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly body: AzesApiErrorBody;
  override readonly cause?: unknown;

  constructor(input: {
    message: string;
    status: number;
    statusText: string;
    url: string;
    body?: AzesApiErrorBody;
    cause?: unknown;
  }) {
    super(input.message);
    this.status = input.status;
    this.statusText = input.statusText;
    this.url = input.url;
    this.body = input.body ?? null;
    this.cause = input.cause;
  }
}

export function isAzesApiError(error: unknown): error is AzesApiError {
  return error instanceof AzesApiError;
}

/** Prefer server body text (text/plain or `{ message|title|detail|error }`) over transport fallback. */
export function messageFromAzesApiErrorBody(body: unknown, fallback: string): string {
  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    for (const key of ['message', 'title', 'detail', 'error']) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
  }
  return fallback;
}

export function getAzesApiErrorMessage(error: AzesApiError, fallback?: string): string {
  const transport =
    fallback ??
    (error.message.trim() || `API request failed with ${error.status} ${error.statusText}`.trim());
  return messageFromAzesApiErrorBody(error.body, transport);
}
