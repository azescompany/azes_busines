/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/design-tokens/src/primitives/typography.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-11
 * ║ Purpose: Typography foundation tokens (families, sizes, weights)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const fontFamily = {
  sans: '"Inter Variable", Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  mono: '"IBM Plex Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  display: '"Inter Variable", Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
} as const;

const FALLBACK = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/**
 * Selectable body font stacks for runtime settings — five distinct type approaches.
 * Variable fonts are loaded on demand by `@azes/ui-web` (latin + latin-ext).
 * Legacy stored ids (`default`, `system`, old neo-grotesk presets) resolve in `@azes/ui-web`.
 */
export const fontFamilyPresets = {
  /** Neo-grotesk UI — neutral Swiss default. */
  inter: `"Inter Variable", Inter, ${FALLBACK}`,
  /** Editorial serif — bookish reading tone. */
  sourceSerif: `"Source Serif 4 Variable", "Source Serif 4", Georgia, serif`,
  /** Soft rounded sans — friendly humanist. */
  nunito: `"Nunito Variable", Nunito, ${FALLBACK}`,
  /** Engineered humanist — IBM technical character. */
  ibmPlexSans: `"IBM Plex Sans Variable", "IBM Plex Sans", ${FALLBACK}`,
  /** Soft optical serif — expressive display warmth. */
  fraunces: `"Fraunces Variable", Fraunces, Georgia, serif`,
} as const;

export type FontFamilyPresetId = keyof typeof fontFamilyPresets;

export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
} as const;

export const letterSpacing = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.04em',
} as const;

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
} as const;
