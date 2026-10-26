/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/mui-augment.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-09-29
 * ║ Updated: 2026-10-09
 * ║ Purpose: TypeScript augmentation for AZES tokens on the MUI theme
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AzesThemeExtension, Radius } from './azes-theme-types';

declare module '@mui/material/styles' {
  /** CSS variables are always on for AZES themes, so colorSchemes is part of Theme. */
  interface CssThemeVariables {
    enabled: true;
  }

  interface Palette {
    border: {
      default: string;
      strong: string;
      focus: string;
    };
    surface: {
      level1: string;
      level2: string;
      level3: string;
    };
  }

  interface PaletteOptions {
    border?: {
      default?: string;
      strong?: string;
      focus?: string;
    };
    surface?: {
      level1?: string;
      level2?: string;
      level3?: string;
    };
  }

  interface TypeBackground {
    muted: string;
  }

  interface TypeText {
    muted: string;
    link: string;
  }

  interface TypographyVariants {
    fontFamilyMono: string;
    fontFamilyDisplay: string;
  }

  interface TypographyVariantsOptions {
    fontFamilyMono?: string;
    fontFamilyDisplay?: string;
  }

  interface Shape {
    radiusSm: number;
    radiusMd: number;
    radiusLg: number;
    radiusXl: number;
    radiusFull: number;
  }

  interface ShapeOptions {
    radiusSm?: number;
    radiusMd?: number;
    radiusLg?: number;
    radiusXl?: number;
    radiusFull?: number;
  }

  interface BreakpointOverrides {
    '2xl': true;
  }

  interface ZIndex {
    base: number;
    raised: number;
    dropdown: number;
    sticky: number;
    overlay: number;
    popover: number;
    toast: number;
  }

  interface Theme {
    azesRadius: Radius;
    azes: AzesThemeExtension;
  }

  interface ThemeOptions {
    azesRadius?: Radius;
    azes?: AzesThemeExtension;
  }
}

export {};
