/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/typography.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-04
 * ║ Purpose: MUI typography variants built from design-token primitives
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { primitives } from '@azes/design-tokens';
import type { TypographyVariantsOptions } from '@mui/material/styles';
import type React from 'react';

const { typography } = primitives;

export function azesTypography(
  fontFamily: string = typography.fontFamily.sans,
): TypographyVariantsOptions {
  return {
    fontFamily,
    fontFamilyMono: typography.fontFamily.mono,
    fontFamilyDisplay: typography.fontFamily.display,
    h1: {
      fontSize: typography.fontSize['4xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
    },
    h2: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
    },
    h3: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.snug,
    },
    h4: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.snug,
    },
    h5: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.normal,
    },
    h6: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.normal,
    },
    subtitle1: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
    },
    subtitle2: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.lineHeight.normal,
    },
    body1: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.regular,
      lineHeight: typography.lineHeight.normal,
    },
    body2: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.regular,
      lineHeight: typography.lineHeight.normal,
    },
    caption: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.regular,
      lineHeight: typography.lineHeight.normal,
    },
    button: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: typography.lineHeight.tight,
      textTransform: 'none',
    },
    overline: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.wide,
      lineHeight: typography.lineHeight.normal,
      textTransform: 'uppercase',
    },
  };
}

/** Semantic element map. MUI v9 removed theme-level variantMapping; pass `component` explicitly or use this map in app code. */
export const azesVariantMapping = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle1: 'p',
  subtitle2: 'p',
  body1: 'p',
  body2: 'p',
  caption: 'span',
  button: 'span',
  overline: 'span',
} as const satisfies Record<string, keyof React.JSX.IntrinsicElements>;

export type AzesVariantMapping = typeof azesVariantMapping;
