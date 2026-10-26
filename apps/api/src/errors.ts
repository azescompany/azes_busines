/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/errors.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Consistent JSON API errors (no internal leak)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { ContentfulStatusCode } from 'hono/utils/http-status';

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

export class ApiHttpError extends Error {
  readonly status: ContentfulStatusCode;
  readonly code: string;
  /** Seconds for Retry-After when status is 429. */
  readonly retryAfterSec?: number;

  constructor(status: ContentfulStatusCode, code: string, message: string, retryAfterSec?: number) {
    super(message);
    this.name = 'ApiHttpError';
    this.status = status;
    this.code = code;
    this.retryAfterSec = retryAfterSec;
  }
}

export function toErrorBody(error: unknown): {
  status: ContentfulStatusCode;
  body: ApiErrorBody;
  retryAfterSec?: number;
} {
  if (error instanceof ApiHttpError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      retryAfterSec: error.retryAfterSec,
    };
  }

  return {
    status: 500,
    body: {
      error: {
        code: 'INTERNAL',
        message: 'An unexpected error occurred',
      },
    },
  };
}
