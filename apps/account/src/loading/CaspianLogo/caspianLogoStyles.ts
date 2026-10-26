/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/loading/CaspianLogo/caspianLogoStyles.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-11
 * ║ Purpose: Dual-tone theme fills + motion for CaspianLogo
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { keyframes, type SxProps, type Theme } from '@azes/ui-web';

export type CaspianLogoSurface = 'content' | 'nav';
/** Matches settings `navColor` when logo sits on chrome. */
export type CaspianLogoNavTone = 'integrated' | 'contrast';
/** Explicit ink for chrome vs paper (login / dual-chrome). */
export type CaspianLogoTone = 'auto' | 'onChrome' | 'onPaper';

export type CaspianLogoStyleOptions = {
  colorMode: 'brand' | 'mono';
  animated: boolean | 'intro';
  surface: CaspianLogoSurface;
  navTone?: CaspianLogoNavTone;
  tone?: CaspianLogoTone;
  /** Hide tagline group in compact variant. */
  hideTagline?: boolean;
};

/** Mark + CASPIAN KEY wordmark vs “real estate company” tagline. */
export type CaspianLogoFills = {
  mark: string;
  tagline: string;
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6%); }
  to { opacity: 1; transform: translateY(0); }
`;

const reducedPulse = keyframes`
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
`;

/**
 * Brand fills by surface / nav tone / color scheme.
 * Light: primary mark + secondary tagline.
 * Dark & contrast: lifted mixes so the pair stays legible on chrome.
 */
export function resolveCaspianLogoFills(
  theme: Theme,
  surface: CaspianLogoSurface,
  navTone: CaspianLogoNavTone,
  scheme: 'light' | 'dark',
): CaspianLogoFills {
  const primary = theme.vars.palette.primary;
  const secondary = theme.vars.palette.secondary;
  const white = theme.vars.palette.common.white;

  if (surface === 'nav' && navTone === 'contrast') {
    if (scheme === 'dark') {
      return {
        mark: `color-mix(in srgb, ${primary.light} 48%, ${white})`,
        tagline: `color-mix(in srgb, ${secondary.light} 40%, ${white})`,
      };
    }
    return {
      mark: `color-mix(in srgb, ${primary.main} 36%, ${white})`,
      tagline: `color-mix(in srgb, ${secondary.main} 28%, ${white})`,
    };
  }

  if (scheme === 'dark') {
    return {
      mark: primary.light,
      tagline:
        surface === 'nav'
          ? `color-mix(in srgb, ${secondary.light} 68%, ${white})`
          : secondary.light,
    };
  }

  return {
    mark: primary.main,
    tagline: secondary.main,
  };
}

function resolveToneSurface(
  tone: CaspianLogoTone | undefined,
  surface: CaspianLogoSurface,
): 'chrome' | 'paper' {
  if (tone === 'onChrome') return 'chrome';
  if (tone === 'onPaper') return 'paper';
  return surface === 'nav' ? 'chrome' : 'paper';
}

export function getCaspianLogoSx(theme: Theme, options: CaspianLogoStyleOptions): SxProps<Theme> {
  const loader = theme.azes.loader;
  const onChrome = resolveToneSurface(options.tone, options.surface) === 'chrome';
  const navTone = options.navTone ?? 'integrated';
  const animated = Boolean(options.animated);
  const mono = options.colorMode === 'mono';

  // On chrome: always lift ink to nav-strong (wordmark must not use text.primary).
  const chromeMono = {
    mark: 'var(--azes-nav-text-strong)',
    tagline: 'color-mix(in srgb, var(--azes-nav-text-strong) 78%, transparent)',
  };
  const lightFills = onChrome
    ? mono
      ? chromeMono
      : resolveCaspianLogoFills(
          theme,
          'nav',
          navTone === 'integrated' ? 'contrast' : navTone,
          'light',
        )
    : mono
      ? { mark: theme.vars.palette.text.primary, tagline: theme.vars.palette.text.secondary }
      : resolveCaspianLogoFills(theme, 'content', navTone, 'light');
  const darkFills = onChrome
    ? mono
      ? chromeMono
      : resolveCaspianLogoFills(theme, 'nav', 'contrast', 'dark')
    : mono
      ? { mark: theme.vars.palette.text.primary, tagline: theme.vars.palette.text.secondary }
      : resolveCaspianLogoFills(theme, 'content', navTone, 'dark');

  return {
    display: 'block',
    height: '100%',
    width: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
    overflow: 'visible',
    flexShrink: 0,
    lineHeight: 0,
    color: onChrome ? 'var(--azes-nav-text-strong)' : theme.vars.palette.text.primary,
    fill: lightFills.mark,
    '& svg': {
      display: 'block',
      width: '100%',
      height: '100%',
      overflow: 'visible',
      color: 'inherit',
      fill: `${lightFills.mark} !important`,
    },
    // Wordmark <use> often carries baked fills — force token ink for chrome legibility.
    '& [data-name="H1"], & [data-name="H1"] use, & [data-name="H1"] path': {
      fill: `${lightFills.mark} !important`,
    },
    '& [data-name="P"], & [data-name="P"] use, & [data-name="P"] path': {
      fill: `${lightFills.tagline} !important`,
      ...(mono && !onChrome ? { opacity: 0.72 } : null),
    },
    ...(options.hideTagline
      ? {
          '& [data-name="P"]': { display: 'none' },
        }
      : null),
    ...(!mono
      ? theme.applyStyles('dark', {
          fill: darkFills.mark,
          '& svg': {
            fill: `${darkFills.mark} !important`,
          },
          '& [data-name="H1"], & [data-name="H1"] use, & [data-name="H1"] path': {
            fill: `${darkFills.mark} !important`,
          },
          '& [data-name="P"], & [data-name="P"] use, & [data-name="P"] path': {
            fill: `${darkFills.tagline} !important`,
          },
        })
      : onChrome
        ? {
            // Keep chrome mono ink in both schemes (nav vars already adapt).
            fill: chromeMono.mark,
            '& svg': { fill: `${chromeMono.mark} !important` },
            '& [data-name="H1"], & [data-name="H1"] use, & [data-name="H1"] path': {
              fill: `${chromeMono.mark} !important`,
            },
            '& [data-name="P"], & [data-name="P"] use, & [data-name="P"] path': {
              fill: `${chromeMono.tagline} !important`,
            },
          }
        : null),
    ...(animated
      ? {
          animation: `${fadeIn} ${loader.introMs}ms ${loader.easing} both`,
        }
      : null),
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none !important',
      ...(animated
        ? {
            opacity: 0.92,
            animation: `${reducedPulse} 2s ease-in-out infinite`,
          }
        : null),
    },
  };
}
