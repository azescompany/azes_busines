/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/branding/CaspianKeyLogo.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-05
 * ║ Updated: 2026-10-20
 * ║ Purpose: Inline brand SVG for account login (default label AZES Academy)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox } from '@azes/ui-web';
import logoSvg from '@azes/assets/icons/general/caspian-key-logo-global.svg?raw';
import { useId, useMemo } from 'react';

export type CaspianKeyLogoProps = {
  /** Accessible name. */
  label?: string;
  /** Emblem width. Prefer theme spacing at call site when possible. */
  size?: number | string;
  /** Emblem height (default matches wordmark aspect when omitted with size). */
  height?: number | string;
};

function prepareLogoMarkup(raw: string, uid: string, label: string): string {
  let markup = raw.replace(/<!--[\s\S]*?-->/g, '').trim();
  markup = markup
    .replace(/\bid="([^"]+)"/g, (_m, id: string) => `id="${uid}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_m, id: string) => `url(#${uid}-${id})`)
    .replace(
      /(?:xlink:)?href="#([^"]+)"/g,
      (_m, id: string) => `href="#${uid}-${id}" xlink:href="#${uid}-${id}"`,
    );
  markup = markup.replace(/\sfill="currentColor"/, '');
  markup = markup.replace(
    /<svg\b([^>]*)>/,
    `<svg$1 width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${label}">`,
  );
  return markup;
}

/** Login brand emblem — mark/wordmark primary, tagline secondary. */
export function CaspianKeyLogo({
  label = 'AZES Academy',
  size = 200,
  height,
}: CaspianKeyLogoProps) {
  const uid = useId().replace(/:/g, '');
  const markup = useMemo(() => prepareLogoMarkup(logoSvg, uid, label), [label, uid]);
  const h = height ?? `calc(${typeof size === 'number' ? `${size}px` : size} * 141.5 / 682.5)`;

  return (
    <MuiBox
      sx={(theme) => ({
        flexShrink: 0,
        width: size,
        maxWidth: '100%',
        height: h,
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        fill: theme.vars.palette.primary.main,
        '& svg': {
          width: '100%',
          height: '100%',
          display: 'block',
          fill: theme.vars.palette.primary.main,
        },
        '& [data-name="H1"], & [data-name="H1"] use': {
          fill: theme.vars.palette.primary.main,
        },
        '& [data-name="P"], & [data-name="P"] use': {
          fill: theme.vars.palette.secondary.main,
        },
        ...theme.applyStyles('dark', {
          fill: theme.vars.palette.primary.light,
          '& svg': { fill: theme.vars.palette.primary.light },
          '& [data-name="H1"], & [data-name="H1"] use': {
            fill: theme.vars.palette.primary.light,
          },
          '& [data-name="P"], & [data-name="P"] use': {
            fill: theme.vars.palette.secondary.light,
          },
        }),
      })}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
