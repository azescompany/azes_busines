/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/auth/password.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: PBKDF2-SHA-256 password hashing (Workers Web Crypto)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;
const FORMAT_PREFIX = 'pbkdf2';

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: salt as BufferSource,
      iterations,
    },
    baseKey,
    KEY_BITS,
  );
  return new Uint8Array(bits);
}

/** Encode password for storage: `pbkdf2$iterations$saltB64$hashB64`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveKey(password, salt, PBKDF2_ITERATIONS);
  return `${FORMAT_PREFIX}$${PBKDF2_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(hash)}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const parts = encoded.split('$');
  if (parts.length !== 4 || parts[0] !== FORMAT_PREFIX) {
    return false;
  }
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations < 1) {
    return false;
  }
  const salt = base64ToBytes(parts[2]!);
  const expected = base64ToBytes(parts[3]!);
  const actual = await deriveKey(password, salt, iterations);
  if (actual.length !== expected.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < actual.length; i += 1) {
    diff |= actual[i]! ^ expected[i]!;
  }
  return diff === 0;
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}
