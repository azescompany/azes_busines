/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/palette.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-09
 * ║ Purpose: Map brand + tinted surfaces onto MUI light/dark palettes
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  semanticColorDark,
  semanticColorLight,
  type SemanticColorTokens,
} from '@azes/design-tokens';
import type { PaletteOptions } from '@mui/material/styles';

import {
  brandSeedDarkPrimary,
  brandSeeds,
  resolveBrandPrimary,
  seedNameForHex,
  type BrandSeedName,
} from './brand';
import { bestContrastText, contrastRatio, hexToOklch, oklchToHex } from './color-utils';
import {
  deriveFocusFromPrimary,
  deriveLinkFromPrimary,
  deriveSecondaryFromPrimary,
  ensureFocusContrast,
  type ColorSchemeName,
} from './harmony';
import { createSurfaceScale, type AzesSurfaceScale } from './surfaces';

/** WCAG AA target for contrastText on primary and secondary.main. */
export const AZES_CONTRAST_THRESHOLD = 4.5;

/** UI part contrast against canvas/paper when validating brand colors. */
const SURFACE_CONTRAST_MIN = 3;

type SchemeBrandColors = {
  primaryMain: string;
  secondaryMain: string;
  focusMain: string;
  linkMain: string;
  surfaces: AzesSurfaceScale;
  feedback: SemanticColorTokens['feedback'];
};

/**
 * Normalize feedback to a shared OKLCH weight per scheme.
 * Uses a fixed neutral paper (not brand-tinted) so status colors never follow the brand.
 */
function tuneFeedback(
  feedback: SemanticColorTokens['feedback'],
  scheme: ColorSchemeName,
): SemanticColorTokens['feedback'] {
  const targetL = scheme === 'light' ? 0.55 : 0.72;
  const targetC = scheme === 'light' ? 0.15 : 0.13;
  const referencePaper = scheme === 'light' ? '#f8fafc' : '#0b1b3a';

  const tune = (hex: string): string => {
    const { h, c } = hexToOklch(hex);
    let out = oklchToHex({
      l: targetL,
      c: Math.min(Math.max(c, targetC * 0.8), targetC * 1.2),
      h,
    });
    for (let i = 0; i < 8 && contrastRatio(out, referencePaper) < SURFACE_CONTRAST_MIN; i += 1) {
      const o = hexToOklch(out);
      out = oklchToHex({
        l: scheme === 'light' ? o.l - 0.04 : o.l + 0.04,
        c: o.c,
        h: o.h,
      });
    }
    return out;
  };

  return {
    success: tune(feedback.success),
    successMuted: feedback.successMuted,
    warning: tune(feedback.warning),
    warningMuted: feedback.warningMuted,
    danger: tune(feedback.danger),
    dangerMuted: feedback.dangerMuted,
    info: tune(feedback.info),
    infoMuted: feedback.infoMuted,
  };
}

function schemePalette(brand: SchemeBrandColors): PaletteOptions {
  const { surfaces: s, feedback } = brand;
  return {
    contrastThreshold: AZES_CONTRAST_THRESHOLD,
    primary: {
      main: brand.primaryMain,
      contrastText: bestContrastText(brand.primaryMain),
    },
    secondary: {
      main: brand.secondaryMain,
      contrastText: bestContrastText(brand.secondaryMain),
    },
    success: {
      main: feedback.success,
      contrastText: bestContrastText(feedback.success),
    },
    warning: {
      main: feedback.warning,
      contrastText: bestContrastText(feedback.warning),
    },
    error: {
      main: feedback.danger,
      contrastText: bestContrastText(feedback.danger),
    },
    info: {
      main: feedback.info,
      contrastText: bestContrastText(feedback.info),
    },
    background: {
      default: s.canvas,
      paper: s.paper,
      muted: s.muted,
    },
    text: {
      primary: s.textPrimary,
      secondary: s.textSecondary,
      disabled: s.textMuted,
      muted: s.textMuted,
      link: brand.linkMain,
    },
    divider: s.divider,
    border: {
      default: s.borderDefault,
      strong: s.borderStrong,
      focus: brand.focusMain,
    },
    surface: {
      level1: s.surface1,
      level2: s.surface2,
      level3: s.surface3,
    },
    action: {
      hover: s.actionHover,
      selected: s.actionSelected,
      focus: s.actionFocus,
      disabled: s.actionDisabled,
      disabledBackground: s.actionDisabledBackground,
    },
  };
}

/** Dark scheme may use a lighter seed (or OKLCH lift for custom hex) when needed. */
export function resolveDarkSchemePrimary(resolvedPrimary: string): string {
  const seed = seedNameForHex(resolvedPrimary);
  if (seed) {
    return brandSeedDarkPrimary[seed];
  }

  const { h, c, l } = hexToOklch(resolvedPrimary);
  return oklchToHex({
    l: Math.min(Math.max(l + 0.18, 0.7), 0.78),
    c: Math.min(c, 0.18),
    h,
  });
}

function channelOk(main: string, paper: string, canvas: string): boolean {
  const text = bestContrastText(main);
  return (
    contrastRatio(main, text) >= AZES_CONTRAST_THRESHOLD &&
    contrastRatio(main, paper) >= SURFACE_CONTRAST_MIN &&
    contrastRatio(main, canvas) >= SURFACE_CONTRAST_MIN
  );
}

/**
 * True when a primary (seed name or hex) keeps AA text on `main` and 3:1 against tinted
 * paper/canvas in both schemes, including the derived secondary.
 */
export function isPrimaryContrastSafe(value: string): boolean {
  if (!(value in brandSeeds) && !/^#[0-9a-fA-F]{6}$/.test(value)) {
    return false;
  }
  // Named seeds are curated and always accepted at runtime.
  if (value in brandSeeds) {
    return true;
  }

  const lightPrimary = resolveBrandPrimary(value);
  const darkPrimary = resolveDarkSchemePrimary(lightPrimary);
  const lightSurfaces = createSurfaceScale({ primaryHex: lightPrimary, mode: 'light' });
  const darkSurfaces = createSurfaceScale({ primaryHex: darkPrimary, mode: 'dark' });
  const lightSecondary = deriveSecondaryFromPrimary(lightPrimary, 'light');
  const darkSecondary = deriveSecondaryFromPrimary(darkPrimary, 'dark');

  return (
    channelOk(lightPrimary, lightSurfaces.paper, lightSurfaces.canvas) &&
    channelOk(darkPrimary, darkSurfaces.paper, darkSurfaces.canvas) &&
    channelOk(lightSecondary, lightSurfaces.paper, lightSurfaces.canvas) &&
    channelOk(darkSecondary, darkSurfaces.paper, darkSurfaces.canvas)
  );
}

export type CreateColorSchemesInput = {
  primary: string;
  secondary?: string;
  /** When true (default), backgrounds/borders/text follow primary hue. */
  tintSurfaces?: boolean;
};

function untintedSurfaces(scheme: ColorSchemeName): AzesSurfaceScale {
  const semantic = scheme === 'light' ? semanticColorLight : semanticColorDark;
  return {
    canvas: semantic.background.canvas,
    paper: semantic.background.surface,
    muted: semantic.background.muted,
    surface1: semantic.background.muted,
    surface2: semantic.background.muted,
    surface3: semantic.background.surface,
    divider: semantic.border.default,
    borderDefault: semantic.border.default,
    borderStrong: semantic.border.strong,
    textPrimary: semantic.foreground.primary,
    textSecondary: semantic.foreground.secondary,
    textMuted: semantic.foreground.muted,
    actionHover: scheme === 'light' ? '#f1f5f9' : '#1a2744',
    actionSelected: scheme === 'light' ? '#e2e8f0' : '#243556',
    actionFocus: scheme === 'light' ? '#cbd5e1' : '#2e4268',
    actionDisabled: scheme === 'light' ? '#94a3b8' : '#64748b',
    actionDisabledBackground: scheme === 'light' ? '#e2e8f0' : '#1e293b',
  };
}

export function createColorSchemes(brand: CreateColorSchemesInput): {
  light: { palette: PaletteOptions };
  dark: { palette: PaletteOptions };
} {
  const tint = brand.tintSurfaces !== false;
  const lightPrimary = brand.primary;
  const darkPrimary = resolveDarkSchemePrimary(brand.primary);

  const lightSurfaces = tint
    ? createSurfaceScale({ primaryHex: lightPrimary, mode: 'light' })
    : untintedSurfaces('light');
  const darkSurfaces = tint
    ? createSurfaceScale({ primaryHex: darkPrimary, mode: 'dark' })
    : untintedSurfaces('dark');

  const lightSecondary = brand.secondary ?? deriveSecondaryFromPrimary(lightPrimary, 'light');
  const darkSecondary = brand.secondary ?? deriveSecondaryFromPrimary(darkPrimary, 'dark');

  const lightFocus = ensureFocusContrast(
    deriveFocusFromPrimary(lightPrimary, 'light'),
    lightSurfaces.paper,
    'light',
  );
  const darkFocus = ensureFocusContrast(
    deriveFocusFromPrimary(darkPrimary, 'dark'),
    darkSurfaces.paper,
    'dark',
  );

  const lightFeedback = tuneFeedback(semanticColorLight.feedback, 'light');
  const darkFeedback = tuneFeedback(semanticColorDark.feedback, 'dark');

  return {
    light: {
      palette: schemePalette({
        primaryMain: lightPrimary,
        secondaryMain: lightSecondary,
        focusMain: lightFocus,
        linkMain: deriveLinkFromPrimary(lightPrimary, 'light', lightSurfaces.paper),
        surfaces: lightSurfaces,
        feedback: lightFeedback,
      }),
    },
    dark: {
      palette: schemePalette({
        primaryMain: darkPrimary,
        secondaryMain: darkSecondary,
        focusMain: darkFocus,
        linkMain: deriveLinkFromPrimary(darkPrimary, 'dark', darkSurfaces.paper),
        surfaces: darkSurfaces,
        feedback: darkFeedback,
      }),
    },
  };
}

export type { BrandSeedName };
export { brandSeeds };
