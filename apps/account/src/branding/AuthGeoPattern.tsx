/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/branding/AuthGeoPattern.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-05
 * ║ Updated: 2026-10-05
 * ║ Purpose: Subtle hexagonal line pattern for account auth panels
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox } from '@azes/ui-web';

const PATTERN_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="84" height="72" viewBox="0 0 84 72">
    <g fill="none" stroke="%2394a3b8" stroke-width="1" opacity="0.45">
      <path d="M42 2 L70 18 L70 50 L42 66 L14 50 L14 18 Z"/>
      <path d="M42 18 L56 26 L56 42 L42 50 L28 42 L28 26 Z"/>
    </g>
  </svg>`,
);

export type AuthGeoPatternProps = {
  /** Corner placement for the decorative wash. */
  anchor?: 'top-start' | 'bottom-end';
  /** Softens contrast when drawn over a photo. */
  soft?: boolean;
};

/** Non-interactive hexagonal wash used on login hero and form panels. */
export function AuthGeoPattern({ anchor = 'top-start', soft = false }: AuthGeoPatternProps) {
  const isTopStart = anchor === 'top-start';
  return (
    <MuiBox
      aria-hidden
      sx={{
        position: 'absolute',
        ...(isTopStart ? { top: 0, insetInlineStart: 0 } : { bottom: 0, insetInlineEnd: 0 }),
        width: 'min(52%, 22rem)',
        height: 'min(48%, 20rem)',
        backgroundImage: `url("data:image/svg+xml,${PATTERN_SVG}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '5.25rem 4.5rem',
        opacity: soft ? 0.35 : 0.55,
        maskImage: isTopStart
          ? 'linear-gradient(135deg, #000 0%, transparent 72%)'
          : 'linear-gradient(315deg, #000 0%, transparent 72%)',
        WebkitMaskImage: isTopStart
          ? 'linear-gradient(135deg, #000 0%, transparent 72%)'
          : 'linear-gradient(315deg, #000 0%, transparent 72%)',
      }}
    />
  );
}
