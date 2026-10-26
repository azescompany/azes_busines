/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/design-tokens/src/semantic/color.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-05
 * ║ Purpose: Semantic color token shapes for light and dark themes
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { color } from '../primitives/color';

export type SemanticColorTokens = {
  readonly background: {
    readonly canvas: string;
    readonly surface: string;
    readonly muted: string;
    readonly inverse: string;
  };
  readonly foreground: {
    readonly primary: string;
    readonly secondary: string;
    readonly muted: string;
    readonly inverse: string;
    readonly link: string;
  };
  readonly border: {
    readonly default: string;
    readonly strong: string;
    readonly focus: string;
  };
  readonly action: {
    readonly primary: string;
    readonly primaryHover: string;
    readonly primaryActive: string;
    readonly primaryForeground: string;
    readonly secondary: string;
    readonly secondaryHover: string;
    readonly secondaryForeground: string;
  };
  readonly feedback: {
    readonly success: string;
    readonly successMuted: string;
    readonly warning: string;
    readonly warningMuted: string;
    readonly danger: string;
    readonly dangerMuted: string;
    readonly info: string;
    readonly infoMuted: string;
  };
};

export const semanticColorLight: SemanticColorTokens = {
  background: {
    canvas: color.gray50,
    surface: color.white,
    muted: color.gray100,
    inverse: color.navy900,
  },
  foreground: {
    primary: color.gray900,
    secondary: color.gray600,
    muted: color.gray500,
    inverse: color.white,
    link: color.teal700,
  },
  border: {
    default: color.gray200,
    strong: color.gray300,
    focus: color.teal500,
  },
  action: {
    primary: color.teal600,
    primaryHover: color.teal700,
    primaryActive: color.teal800,
    primaryForeground: color.white,
    secondary: color.navy100,
    secondaryHover: color.navy200,
    secondaryForeground: color.navy900,
  },
  feedback: {
    success: color.green600,
    successMuted: color.green50,
    warning: color.amber500,
    warningMuted: color.amber50,
    danger: color.red600,
    dangerMuted: color.red50,
    info: color.navy600,
    infoMuted: color.navy50,
  },
};

export const semanticColorDark: SemanticColorTokens = {
  background: {
    canvas: color.navy900,
    surface: color.navy800,
    muted: color.navy700,
    inverse: color.gray50,
  },
  foreground: {
    primary: color.gray50,
    secondary: color.gray300,
    muted: color.gray400,
    inverse: color.navy900,
    link: color.teal300,
  },
  border: {
    default: color.navy700,
    strong: color.gray500,
    focus: color.teal400,
  },
  action: {
    primary: color.teal400,
    primaryHover: color.teal300,
    primaryActive: color.teal200,
    primaryForeground: color.navy900,
    secondary: color.navy800,
    secondaryHover: color.navy700,
    secondaryForeground: color.gray50,
  },
  feedback: {
    success: color.green400,
    successMuted: color.green900,
    warning: color.amber400,
    warningMuted: color.amber900,
    danger: color.red400,
    dangerMuted: color.red900,
    info: color.navy300,
    infoMuted: color.navy800,
  },
};
