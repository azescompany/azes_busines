/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/lib/deviceId.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-05
 * ║ Updated: 2026-10-05
 * ║ Purpose: Account login device-id display facade over @azes/api fingerprint
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { getOrCreateDeviceMeta } from '@azes/api';

/**
 * Stable device id used by the shared mutator (`X-Device-Id` / `DeviceId`).
 *
 * Hashing + localStorage persistence live in `@azes/api` (`getOrCreateDeviceMeta`)
 * so Account ↔ Admin handoff stays consistent. Do not invent a second fingerprint
 * here — that would desync sessions across ports.
 */
export async function ensureDeviceId(): Promise<string> {
  const meta = await getOrCreateDeviceMeta();
  return meta.deviceId;
}

/** Formats a hex/device id as `A1B2-C3D4-••••-E5F6` for UI display. */
export function maskDeviceId(deviceId: string): string {
  const hex = deviceId.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  const padded = (hex.length >= 16 ? hex : `${hex}0000000000000000`).slice(0, 16);
  const a = padded.slice(0, 4);
  const b = padded.slice(4, 8);
  const d = padded.slice(12, 16);
  return `${a}-${b}-••••-${d}`;
}

export async function getMaskedDeviceId(): Promise<string> {
  const id = await ensureDeviceId();
  return maskDeviceId(id);
}
