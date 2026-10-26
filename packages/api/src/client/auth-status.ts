/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/client/auth-status.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-11
 * ║ Purpose: Pluggable 401/403 session-invalidated and 402 payment-required handlers
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { messageFromAzesApiErrorBody, type AzesApiError } from './errors';

export type AuthSessionInvalidatedReason = {
  /** 401 = refresh failed / last-device wins; 403 = explicit session kill. */
  status: 401 | 403;
  message: string;
  url: string;
  body: unknown;
};

export type PaymentRequiredReason = {
  status: 402;
  message: string;
  url: string;
  body: unknown;
};

export type AuthSessionInvalidatedHandler = (
  reason: AuthSessionInvalidatedReason,
) => void | Promise<void>;

export type PaymentRequiredHandler = (reason: PaymentRequiredReason) => void | Promise<void>;

/**
 * English fallback when an app has not wired i18n yet.
 * Product apps should prefer `common:auth.sessionOtherDevice` via their i18n bridge.
 */
export const DEFAULT_SESSION_INVALIDATED_MESSAGE =
  'Your profile was signed in from another device. If this was not you, please contact the founders or management.';

let sessionInvalidatedHandler: AuthSessionInvalidatedHandler | null = null;
let paymentRequiredHandler: PaymentRequiredHandler | null = null;

export function setAuthSessionInvalidatedHandler(
  handler: AuthSessionInvalidatedHandler | null,
): void {
  sessionInvalidatedHandler = handler;
}

export function setPaymentRequiredHandler(handler: PaymentRequiredHandler | null): void {
  paymentRequiredHandler = handler;
}

function messageFromErrorBody(body: unknown, fallback: string): string {
  return messageFromAzesApiErrorBody(body, fallback);
}

export async function notifyAuthSessionInvalidated(error: AzesApiError): Promise<void> {
  if (!sessionInvalidatedHandler) {
    return;
  }
  const status: 401 | 403 = error.status === 401 ? 401 : 403;
  await sessionInvalidatedHandler({
    status,
    message: messageFromErrorBody(error.body, DEFAULT_SESSION_INVALIDATED_MESSAGE),
    url: error.url,
    body: error.body,
  });
}

export async function notifyPaymentRequired(error: AzesApiError): Promise<void> {
  if (!paymentRequiredHandler) {
    return;
  }
  await paymentRequiredHandler({
    status: 402,
    message: messageFromErrorBody(error.body, 'Payment required'),
    url: error.url,
    body: error.body,
  });
}
