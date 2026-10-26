/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/loading/CaspianLogo/CaspianLogo.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Theme-bound Caspian Key global logo (full / compact / mark)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, useTheme, type SxProps, type Theme } from '@azes/ui-web';
import logoSvg from '@azes/assets/icons/general/caspian-key-logo-global.svg?raw';
import { useId, useMemo } from 'react';

import { CASPIAN_ASPECT, CASPIAN_VIEWBOX } from './caspianLogoPaths.js';
import {
  getCaspianLogoSx,
  type CaspianLogoNavTone,
  type CaspianLogoSurface,
  type CaspianLogoTone,
} from './caspianLogoStyles.js';

export type CaspianLogoVariant = 'full' | 'compact' | 'mark';
export type CaspianLogoColorMode = 'brand' | 'mono';
export type { CaspianLogoNavTone, CaspianLogoSurface, CaspianLogoTone };

export type CaspianLogoProps = {
  variant?: CaspianLogoVariant;
  colorMode?: CaspianLogoColorMode;
  /**
   * `nav` — logo sits on sidebar/header chrome (`--azes-nav-*`).
   * `content` — page/paper surfaces (default).
   */
  surface?: CaspianLogoSurface;
  /** With `surface="nav"`: matches settings Navigation color. */
  navTone?: CaspianLogoNavTone;
  /** Force chrome/paper ink; `auto` follows `surface`. */
  tone?: CaspianLogoTone;
  /** Height; width follows viewBox aspect. Prefer theme spacing / CSS vars. */
  height?: number | string;
  /** Accessible name when not decorative. */
  label: string;
  decorative?: boolean;
  animated?: boolean | 'intro';
  sx?: SxProps<Theme>;
};

function prepareLogoMarkup(raw: string, uid: string, viewBox: string): string {
  let markup = raw.replace(/<!--[\s\S]*?-->/g, '').trim();
  // Scope ids so multiple logos on one page do not collide.
  // Do NOT rewrite bare `href=` after `xlink:href` — that double-prefixes and
  // breaks <use> wordmark glyphs (only the key paths would remain visible).
  markup = markup
    .replace(/\bid="([^"]+)"/g, (_m, id: string) => `id="${uid}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_m, id: string) => `url(#${uid}-${id})`)
    .replace(
      /(?:xlink:)?href="#([^"]+)"/g,
      (_m, id: string) => `href="#${uid}-${id}" xlink:href="#${uid}-${id}"`,
    );
  markup = markup.replace(/\sfill="currentColor"/, '');
  markup = markup.replace(/\sviewBox="[^"]*"/, ` viewBox="${viewBox}"`);
  markup = markup.replace(
    /<svg\b([^>]*)>/,
    `<svg$1 width="100%" height="100%" preserveAspectRatio="xMidYMid meet" focusable="false">`,
  );
  return markup;
}

export function CaspianLogo({
  variant = 'full',
  colorMode = 'brand',
  surface = 'content',
  navTone = 'integrated',
  tone = 'auto',
  height,
  label,
  decorative = false,
  animated = false,
  sx,
}: CaspianLogoProps) {
  const theme = useTheme();
  const uid = useId().replace(/:/g, '');
  const viewBox = CASPIAN_VIEWBOX[variant];
  const aspect = CASPIAN_ASPECT[variant];
  const markup = useMemo(() => prepareLogoMarkup(logoSvg, uid, viewBox), [uid, viewBox]);
  const resolvedHeight =
    height ??
    (variant === 'mark'
      ? theme.spacing(theme.azes.loader.sizeSm)
      : `calc(var(--azes-layout-header-height, ${theme.azes.layout.headerHeightDesktop}px) * ${theme.azes.loader.headerLogoRatio})`);

  const logoSx = [
    getCaspianLogoSx(theme, {
      colorMode,
      animated,
      surface,
      navTone,
      tone,
      hideTagline: variant === 'compact',
    }),
    {
      height: resolvedHeight,
      aspectRatio: String(aspect),
    },
    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
  ];

  return (
    <MuiBox
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      data-caspian-logo=""
      data-variant={variant}
      sx={logoSx}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
