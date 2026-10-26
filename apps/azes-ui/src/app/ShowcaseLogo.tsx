/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/app/ShowcaseLogo.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-19
 * ║ Purpose: Animated AZES COMPANY wordmark — high contrast on dark chrome
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Link, MuiBox, Typography, useMediaQuery, useTheme } from '@azes/ui-web';

const BRAND = 'AZES';
const COMPANY = 'COMPANY';

export function ShowcaseLogo({ compact = false }: { compact?: boolean }) {
  const theme = useTheme();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const primaryLight = theme.vars.palette.primary.light;
  const secondary = theme.vars.palette.secondary.main;
  // Nav chrome is dark — never use text.primary (too dark on navy).
  const onChrome = theme.vars.palette.common.white;
  const onChromeMuted = `color-mix(in srgb, ${onChrome} 72%, transparent)`;

  return (
    <Link
      href="#/"
      underline="none"
      color="inherit"
      aria-label="AZES COMPANY — home"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        minWidth: 0,
        lineHeight: 1,
        textDecoration: 'none',
        color: onChrome,
        '&:focus-visible': {
          outline: `2px solid ${onChrome}`,
          outlineOffset: 3,
          borderRadius: 1,
        },
      }}
    >
      <MuiBox
        sx={{
          display: 'inline-flex',
          flexDirection: compact ? 'column' : 'row',
          alignItems: compact ? 'flex-start' : 'baseline',
          gap: compact ? 0.15 : 0.85,
          minWidth: 0,
          position: 'relative',
          py: 0.25,
        }}
      >
        <MuiBox
          aria-hidden
          sx={{
            position: 'absolute',
            left: compact ? -4 : -8,
            top: '50%',
            width: compact ? 6 : 8,
            height: compact ? 6 : 8,
            borderRadius: '50%',
            bgcolor: secondary,
            transform: 'translateY(-50%)',
            opacity: 1,
            ...(reduceMotion
              ? {}
              : {
                  animation: 'azes-brand-dot 2.4s ease-out infinite',
                  '@keyframes azes-brand-dot': {
                    '0%': {
                      boxShadow: `0 0 0 0 color-mix(in srgb, ${secondary} 55%, transparent)`,
                    },
                    '70%': {
                      boxShadow: `0 0 0 10px color-mix(in srgb, ${secondary} 0%, transparent)`,
                    },
                    '100%': {
                      boxShadow: `0 0 0 0 color-mix(in srgb, ${secondary} 0%, transparent)`,
                    },
                  },
                }),
          }}
        />

        <MuiBox
          sx={{
            display: 'inline-flex',
            pl: compact ? 1.25 : 1.75,
            gap: '0.02em',
            overflow: 'hidden',
          }}
        >
          {[...BRAND].map((ch, i) => (
            <Typography
              key={`azes-${ch}-${i}`}
              component="span"
              sx={{
                fontWeight: theme.typography.fontWeightBold,
                fontSize: compact ? '0.78rem' : { xs: '0.9rem', md: '1rem' },
                letterSpacing: compact ? '0.14em' : '0.18em',
                lineHeight: 1.1,
                color: onChrome,
                ...(reduceMotion
                  ? {}
                  : {
                      backgroundImage: `linear-gradient(120deg, ${onChrome} 0%, ${onChrome} 38%, ${primaryLight} 50%, ${onChrome} 62%, ${onChrome} 100%)`,
                      backgroundSize: '220% 100%',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: `azes-brand-in 560ms ease-out ${i * 55}ms both, azes-brand-shine 4.5s ease-in-out ${900 + i * 40}ms infinite`,
                      '@keyframes azes-brand-in': {
                        from: { opacity: 0, transform: 'translateY(6px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                      '@keyframes azes-brand-shine': {
                        '0%, 100%': { backgroundPosition: '100% 50%' },
                        '50%': { backgroundPosition: '0% 50%' },
                      },
                      // Fallback if background-clip text fails: keep solid white.
                      '@supports not ((-webkit-background-clip: text) or (background-clip: text))':
                        {
                          color: onChrome,
                          WebkitTextFillColor: onChrome,
                          backgroundImage: 'none',
                        },
                    }),
              }}
            >
              {ch}
            </Typography>
          ))}
        </MuiBox>

        <MuiBox
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            pl: compact ? 1.25 : 0,
            minWidth: 0,
          }}
        >
          {!compact ? (
            <MuiBox
              aria-hidden
              sx={{
                width: 14,
                height: 2,
                borderRadius: 999,
                bgcolor: secondary,
                flexShrink: 0,
                transformOrigin: 'left center',
                ...(reduceMotion
                  ? {}
                  : {
                      animation: 'azes-brand-rule 700ms ease-out 280ms both',
                      '@keyframes azes-brand-rule': {
                        from: { transform: 'scaleX(0)', opacity: 0 },
                        to: { transform: 'scaleX(1)', opacity: 1 },
                      },
                    }),
              }}
            />
          ) : null}
          <Typography
            component="span"
            sx={{
              fontWeight: theme.typography.fontWeightMedium,
              fontSize: compact ? '0.58rem' : { xs: '0.65rem', md: '0.72rem' },
              letterSpacing: compact ? '0.16em' : '0.22em',
              lineHeight: 1.2,
              color: onChromeMuted,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              ...(reduceMotion
                ? {}
                : {
                    animation: 'azes-brand-fade 560ms ease-out 220ms both',
                    '@keyframes azes-brand-fade': {
                      from: { opacity: 0, transform: 'translateY(6px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }),
            }}
          >
            {COMPANY}
          </Typography>
        </MuiBox>
      </MuiBox>
    </Link>
  );
}
