/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/design-tokens/src/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Shared type definitions for design tokens and themes
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type ThemeName = 'light' | 'dark';

export type TokenPrimitive = string | number;

export type TokenRecord = {
  readonly [key: string]: TokenPrimitive | TokenRecord;
};
