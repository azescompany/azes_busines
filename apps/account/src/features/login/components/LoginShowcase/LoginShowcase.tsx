/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/components/LoginShowcase/LoginShowcase.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Chrome showcase — fan cards + clip expand + scatter
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, Typography, useTheme } from '@azes/ui-web';
import { IconAnalytics, IconCity, IconHome } from '@azes/ui-web/icons';
import { forwardRef, useEffect, useMemo, useRef, type ReactNode, type Ref } from 'react';

import { CaspianLogo } from '../../../../loading/index.js';
import type { LoginSuccessPhase } from '../../hooks/useLoginSuccessTransition.js';
import {
  LOGIN_SHELL_SCATTER,
  LOGIN_SHELL_SCATTER_COMPACT,
  type ScatterCardId,
} from '../../loginShellScatter.js';
import {
  AgentProfileCard,
  DealsKanbanCard,
  ListingsBoardCard,
  MapEnvCard,
  StatsCrmCard,
} from './cards/index.js';

export type LoginShowcaseCopy = {
  brandLabel: string;
  title: string;
  subtitle: string;
  benefits: Array<{ id: string; label: string }>;
  listings: {
    title: string;
    chips: [string, string];
    prices: [string, string, string, string];
  };
  stats: {
    kpis: Array<{ label: string; value: string }>;
    stages: [string, string, string];
  };
  agent: {
    roleLabel: string;
    verified: string;
    stats: [string, string, string];
    contact: string;
    message: string;
  };
  map: {
    title: string;
    chips: [string, string, string];
  };
  deals: {
    columns: [string, string, string];
    prices: [string, string, string, string, string];
  };
};

export type LoginShowcaseProps = {
  copy: LoginShowcaseCopy;
  navTone: 'integrated' | 'contrast';
  reducedMotion: boolean;
  phase: LoginSuccessPhase;
  welcome: string;
  /** `overlay` — phone success layer (no idle chrome copy). */
  layout?: 'chrome' | 'overlay';
};

const BENEFIT_ICONS: Record<string, ReactNode> = {
  listings: <IconHome fontSize="small" aria-hidden />,
  stats: <IconAnalytics fontSize="small" aria-hidden />,
  agents: <IconCity fontSize="small" aria-hidden />,
};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === 'function') ref(value);
  else (ref as { current: T | null }).current = value;
}

export const LoginShowcase = forwardRef<HTMLElement, LoginShowcaseProps>(function LoginShowcase(
  { copy, navTone, reducedMotion, phase, welcome, layout = 'chrome' },
  ref,
) {
  const theme = useTheme();
  const shell = theme.azes.loginShell;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const layerEl = useRef<HTMLElement | null>(null);
  const isOverlay = layout === 'overlay';
  const expanding =
    phase === 'expanding' ||
    phase === 'scattering' ||
    phase === 'settled' ||
    phase === 'hold' ||
    phase === 'exiting' ||
    phase === 'redirecting';
  const scattering =
    phase === 'scattering' ||
    phase === 'settled' ||
    phase === 'hold' ||
    phase === 'exiting' ||
    phase === 'redirecting';
  // Logo rises together with card scatter (not after settle).
  const showFinale =
    phase === 'scattering' ||
    phase === 'settled' ||
    phase === 'hold' ||
    phase === 'exiting' ||
    phase === 'redirecting';
  const hideCopy = expanding || isOverlay;
  const idleMotion = !reducedMotion && phase === 'idle' && !isOverlay;

  const poses = useMemo(() => {
    if (isOverlay) return [...LOGIN_SHELL_SCATTER_COMPACT];
    if (typeof window === 'undefined') return [...LOGIN_SHELL_SCATTER];
    const short =
      window.matchMedia('(max-height: 40rem)').matches ||
      window.matchMedia('(max-width: 80rem)').matches;
    return short ? [...LOGIN_SHELL_SCATTER_COMPACT] : [...LOGIN_SHELL_SCATTER];
  }, [isOverlay]);

  useEffect(() => {
    if (!idleMotion) return undefined;
    const stage = stageRef.current;
    if (!stage) return undefined;
    const fine =
      typeof window.matchMedia === 'function' && window.matchMedia('(pointer: fine)').matches;
    if (!fine) return undefined;

    let raf = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        const max = Number.parseFloat(theme.spacing(shell.parallaxMaxSpacing));
        stage.style.setProperty('--azes-login-px', `${(-nx * max).toFixed(2)}px`);
        stage.style.setProperty('--azes-login-py', `${(-ny * max).toFixed(2)}px`);
      });
    };
    const onLeave = () => {
      stage.style.setProperty('--azes-login-px', '0px');
      stage.style.setProperty('--azes-login-py', '0px');
    };
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      stage.style.removeProperty('--azes-login-px');
      stage.style.removeProperty('--azes-login-py');
    };
  }, [idleMotion, shell.parallaxMaxSpacing, theme]);

  function renderCard(id: ScatterCardId, rotate: number, depth: number, width: string) {
    switch (id) {
      case 'listings':
        return <ListingsBoardCard {...copy.listings} rotate={rotate} depth={depth} width={width} />;
      case 'stats':
        return <StatsCrmCard {...copy.stats} rotate={rotate} depth={depth} width={width} />;
      case 'agent':
        return <AgentProfileCard {...copy.agent} rotate={rotate} depth={depth} width={width} />;
      case 'map':
        return <MapEnvCard {...copy.map} rotate={rotate} depth={depth} width={width} />;
      case 'deals':
        return <DealsKanbanCard {...copy.deals} rotate={rotate} depth={depth} width={width} />;
      default:
        return null;
    }
  }

  return (
    <MuiBox
      component="section"
      ref={(node: HTMLElement | null) => {
        layerEl.current = node;
        assignRef(ref, node);
      }}
      className={[
        'azes-login-showcase-layer',
        isOverlay ? 'azes-login-showcase-layer--overlay' : '',
        expanding ? 'azes-login-showcase-layer--expanded' : '',
        scattering ? 'azes-login-showcase-layer--scatter' : '',
        phase === 'exiting' || phase === 'redirecting' ? 'azes-login-showcase-layer--handoff' : '',
        reducedMotion ? 'azes-login-showcase-layer--reduced' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      sx={{
        position: isOverlay || expanding ? 'fixed' : 'relative',
        inset: isOverlay || expanding ? 0 : undefined,
        zIndex: isOverlay || expanding ? shell.zIndexExpanded : shell.zIndexChrome,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: isOverlay || expanding ? '100dvh' : '100%',
        width: isOverlay || expanding ? '100vw' : '100%',
        px: isOverlay ? 2 : { lg: 4, xl: 6 },
        py: isOverlay ? 2 : 4,
        color: 'var(--azes-nav-text-strong)',
        bgcolor: isOverlay || expanding ? 'var(--azes-nav-bg)' : 'transparent',
        containerType: 'size',
        ['--azes-login-canvas-end' as string]: isOverlay ? '100%' : `${shell.canvasPercent}%`,
        ['--azes-login-scatter-ms' as string]: `${shell.scatterDurationMs}ms`,
        ['--azes-login-settle-ease' as string]: shell.settleEasing,
        ['--azes-login-logo-rise-ms' as string]: `${shell.logoRiseDurationMs}ms`,
        willChange: expanding && phase !== 'hold' ? 'clip-path' : 'auto',
        ...(phase === 'exiting' || phase === 'redirecting'
          ? {
              backgroundImage: `radial-gradient(
                ellipse 80% 60% at 50% 35%,
                color-mix(in srgb, ${theme.vars.palette.primary.main} 22%, transparent),
                transparent 72%
              )`,
            }
          : null),
      }}
    >
      <MuiBox
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: hideCopy ? 0 : 0.9,
          transition: `opacity var(--azes-login-fade-ms) ease`,
          backgroundImage: `radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--azes-nav-text-strong) ${shell.gridDotMixPercent}%, transparent) 1px, transparent 0)`,
          backgroundSize: `${theme.spacing(2.5)} ${theme.spacing(2.5)}`,
          maskImage: 'radial-gradient(ellipse 80% 70% at 40% 45%, #000 35%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 40% 45%, #000 35%, transparent 85%)',
        }}
      />

      {!isOverlay ? (
        <MuiBox
          sx={{
            position: 'relative',
            zIndex: 1,
            maxWidth: theme.spacing(70),
            opacity: hideCopy ? 0 : 1,
            transform: hideCopy ? 'translateY(-8px)' : 'none',
            transition: `opacity var(--azes-login-fade-ms) ease, transform var(--azes-login-fade-ms) ease`,
            pointerEvents: hideCopy ? 'none' : 'auto',
          }}
        >
          <MuiBox
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              mb: 2.5,
            }}
          >
            <CaspianLogo
              variant="full"
              colorMode="mono"
              surface="nav"
              tone="onChrome"
              navTone={navTone}
              label={copy.brandLabel}
              height={theme.spacing(5)}
            />
            <Typography
              variant="h3"
              component="p"
              sx={{
                mt: 3,
                mb: 0,
                fontWeight: 700,
                color: 'var(--azes-nav-text-strong)',
                textWrap: 'balance',
                maxWidth: '22ch',
              }}
            >
              {copy.title}
            </Typography>
          </MuiBox>
          <Typography
            variant="body1"
            sx={{ color: 'var(--azes-nav-text)', maxWidth: '36ch', mb: 2.5 }}
          >
            {copy.subtitle}
          </Typography>
          <MuiBox
            component="ul"
            sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.25, mb: 3.5 }}
          >
            {copy.benefits.map((b) => (
              <MuiBox
                component="li"
                key={b.id}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}
              >
                <MuiBox
                  sx={{
                    display: 'grid',
                    placeItems: 'center',
                    width: theme.spacing(4),
                    height: theme.spacing(4),
                    borderRadius: `${theme.shape.radiusMd}px`,
                    bgcolor: 'var(--azes-nav-hover)',
                    flexShrink: 0,
                  }}
                >
                  {BENEFIT_ICONS[b.id] ?? <IconHome fontSize="small" aria-hidden />}
                </MuiBox>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: 'var(--azes-nav-text-strong)' }}
                >
                  {b.label}
                </Typography>
              </MuiBox>
            ))}
          </MuiBox>
        </MuiBox>
      ) : null}

      <MuiBox
        ref={stageRef}
        aria-hidden={!showFinale}
        className={
          scattering
            ? 'azes-login-showcase-stage azes-login-showcase-stage--scatter'
            : idleMotion
              ? 'azes-login-showcase-stage azes-login-showcase-stage--fan'
              : 'azes-login-showcase-stage'
        }
        sx={{
          position: scattering ? 'absolute' : 'relative',
          inset: scattering ? 0 : undefined,
          zIndex: 2,
          height: scattering ? '100%' : theme.spacing(40),
          maxWidth: scattering ? 'none' : theme.spacing(56),
          width: scattering ? '100%' : undefined,
          perspective: scattering ? 'none' : theme.spacing(120),
          '--azes-login-px': '0px',
          '--azes-login-py': '0px',
          pointerEvents: 'none',
        }}
      >
        {poses.map((pose, index) => (
          <MuiBox
            key={pose.id}
            className={scattering ? 'azes-login-card-scatter' : undefined}
            sx={
              scattering
                ? {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    ['--azes-settle-i' as string]: index,
                    ['--tx' as string]: pose.tx,
                    ['--ty' as string]: pose.ty,
                    ['--rot' as string]: pose.rot,
                    ['--scale' as string]: pose.scale,
                    width: pose.width,
                    marginLeft: `calc(${pose.width} / -2)`,
                    marginTop: theme.spacing(-14),
                    willChange: phase === 'scattering' ? 'transform, opacity' : 'auto',
                  }
                : {
                    position: 'absolute',
                    insetInlineStart: '12%',
                    top: '10%',
                    width: pose.width,
                    maxWidth: '88%',
                    zIndex: pose.fanDepth,
                    transform: `rotate(${pose.fanRotate}deg) translate3d(
                      calc(var(--azes-login-px) * ${0.3 + index * 0.15}),
                      calc(var(--azes-login-py) * ${0.3 + index * 0.15}),
                      0
                    )`,
                    ['--azes-float-i' as string]: index,
                  }
            }
          >
            {renderCard(
              pose.id,
              scattering ? 0 : pose.fanRotate,
              pose.fanDepth,
              scattering ? '100%' : pose.width,
            )}
          </MuiBox>
        ))}
      </MuiBox>

      {showFinale ? (
        <MuiBox
          className="azes-login-finale"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            display: 'grid',
            placeItems: 'center',
            pointerEvents: 'none',
            color: 'var(--azes-nav-text-strong)',
            px: 2,
          }}
        >
          <MuiBox
            className="azes-login-logo-rise"
            sx={{ textAlign: 'center', display: 'grid', gap: 1.25, justifyItems: 'center' }}
          >
            <CaspianLogo
              variant="full"
              colorMode="mono"
              surface="nav"
              tone="onChrome"
              navTone={navTone}
              label={copy.brandLabel}
              height={isOverlay ? theme.spacing(5.5) : theme.spacing(7)}
            />
            <Typography
              variant={isOverlay ? 'h6' : 'h5'}
              component="p"
              aria-live="polite"
              sx={{ fontWeight: 700, textWrap: 'balance' }}
            >
              {welcome}
            </Typography>
          </MuiBox>
        </MuiBox>
      ) : null}
    </MuiBox>
  );
});
