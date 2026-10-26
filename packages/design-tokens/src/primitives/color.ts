/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/design-tokens/src/primitives/color.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-05
 * ║ Purpose: Primitive color palette (foundation tokens)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const color = {
  white: '#FFFFFF',
  black: '#0B0F14',

  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',

  navy50: '#E8EEFB',
  navy100: '#D0DBF7',
  navy200: '#A8BCF0',
  navy300: '#7A96E3',
  navy400: '#5B7FE0',
  navy500: '#3D63D0',
  navy600: '#2A4DB7',
  navy700: '#1A3478',
  navy800: '#122554',
  navy900: '#0B1B3A',

  teal50: '#E6FAF7',
  teal100: '#C5F5ED',
  teal200: '#8EEADE',
  teal300: '#5EEAD4',
  teal400: '#2DD4BF',
  teal500: '#14B8A6',
  teal600: '#0E9384',
  teal700: '#0B7A6E',
  teal800: '#0A5F56',
  teal900: '#084C45',

  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red200: '#FECACA',
  red300: '#FCA5A5',
  red400: '#F87171',
  red500: '#E5484D',
  red600: '#E5383B',
  red700: '#BE123C',
  red800: '#9F1239',
  red900: '#7F1D1D',

  amber50: '#FFFBEB',
  amber100: '#FEF3C7',
  amber200: '#FDE68A',
  amber300: '#FCD34D',
  amber400: '#F5A524',
  amber500: '#F59E0B',
  amber600: '#D97706',
  amber700: '#B45309',
  amber800: '#92400E',
  amber900: '#78350F',

  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green200: '#BBF7D0',
  green300: '#86EFAC',
  green400: '#4ADE80',
  green500: '#22A06B',
  green600: '#16A34A',
  green700: '#15803D',
  green800: '#166534',
  green900: '#14532D',
} as const;

export type ColorToken = keyof typeof color;
