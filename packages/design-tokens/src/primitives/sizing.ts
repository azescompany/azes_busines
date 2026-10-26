/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/design-tokens/src/primitives/sizing.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-02
 * ║ Purpose: Control and icon sizing foundation tokens
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const size = {
  iconSm: '1rem',
  iconMd: '1.25rem',
  iconLg: '1.5rem',
  controlXs: '1.75rem',
  controlSm: '2rem',
  controlMd: '2.5rem',
  controlLg: '3rem',
  containerSm: '40rem',
  containerMd: '48rem',
  containerLg: '64rem',
  containerXl: '80rem',
} as const;

export const sizePx = {
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  controlXs: 28,
  controlSm: 32,
  controlMd: 40,
  controlLg: 48,
  containerSm: 640,
  containerMd: 768,
  containerLg: 1024,
  containerXl: 1280,
} as const;
