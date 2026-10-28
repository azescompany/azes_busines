/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/launcher/components/LauncherScatterGrid/LauncherScatterGrid.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Spiral Bloom entrance — CSS path + spin for module tiles
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, useTheme } from '@azes/ui-web';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { SPIRAL, resolveSpiralConfig, type SpiralIntensity } from './spiralConfig.js';
import { computeSpiralPoses, type SpiralPose } from './spiralPose.js';

export type LauncherScatterPhase = 'idle' | 'playing' | 'done';

const COLS = { xs: 3, sm: 4, md: 5, lg: 6 } as const;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function spacingToPx(value: string | number): number {
  if (typeof value === 'number') return value;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function layoutFromWidth(width: number): {
  cols: number;
  trackUnits: number;
  gapUnits: number;
} {
  if (width >= 1024) return { cols: COLS.lg, trackUnits: 13, gapUnits: 2 };
  if (width >= 768) return { cols: COLS.md, trackUnits: 13, gapUnits: 2 };
  if (width >= 640) return { cols: COLS.sm, trackUnits: 12, gapUnits: 2 };
  return { cols: COLS.xs, trackUnits: 11, gapUnits: 1 };
}

function childKey(child: ReactNode, index: number): string {
  const el = child as ReactElement | null;
  if (el && el.key != null) return String(el.key);
  return `idx-${index}`;
}

function pathKeyframes(keyframeT: readonly number[]): Record<string, { transform: string }> {
  const frames: Record<string, { transform: string }> = {};
  keyframeT.forEach((t, i) => {
    const pct = `${Math.round(t * 100)}%`;
    frames[pct] = {
      transform: `translate(var(--p${i}x, 0px), var(--p${i}y, 0px))`,
    };
  });
  return frames;
}

export type LauncherScatterGridProps = {
  count: number;
  children: ReactNode;
  scrollTrigger?: boolean;
  /** `full` = first visible section; `soft` = later scroll-in groups. */
  intensity?: SpiralIntensity;
};

/**
 * Centered fixed-track grid with Spiral Bloom entrance (transform + opacity only).
 * Plays once per mount/visibility; later child churn uses short fade.
 */
export function LauncherScatterGrid({
  count,
  children,
  scrollTrigger = true,
  intensity = 'full',
}: LauncherScatterGridProps) {
  const theme = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const playedRef = useRef(false);
  const endTimers = useRef<number[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const [phase, setPhase] = useState<LauncherScatterPhase>(() =>
    prefersReducedMotion() ? 'done' : 'idle',
  );
  const [fadeKeys, setFadeKeys] = useState<Set<string>>(() => new Set());
  const [viewportW, setViewportW] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );

  const layout = layoutFromWidth(viewportW || 390);
  const mobile = layout.cols <= COLS.xs;
  const config = useMemo(() => resolveSpiralConfig(intensity, mobile), [intensity, mobile]);

  const trackPx = spacingToPx(theme.spacing(layout.trackUnits));
  const gapPx = spacingToPx(theme.spacing(layout.gapUnits));
  const rows = Math.max(1, Math.ceil(Math.max(count, 1) / layout.cols));

  const poses = useMemo(() => {
    if (count <= 0) return [] as SpiralPose[];
    return computeSpiralPoses({
      cols: layout.cols,
      rows,
      trackPx,
      gapPx,
      count,
      config,
    });
  }, [count, layout.cols, rows, trackPx, gapPx, config]);

  const tileTrack = {
    xs: theme.spacing(11),
    sm: theme.spacing(12),
    md: theme.spacing(13),
  } as const;

  useLayoutEffect(() => {
    const sync = () => {
      const w = rootRef.current?.clientWidth || window.innerWidth;
      setViewportW(w);
    };
    sync();
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', sync);
      return () => window.removeEventListener('resize', sync);
    }
    const ro = new ResizeObserver(() => sync());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clearTimers = useCallback(() => {
    for (const id of endTimers.current) window.clearTimeout(id);
    endTimers.current = [];
  }, []);

  const startSpiral = useCallback(() => {
    if (playedRef.current || prefersReducedMotion()) {
      playedRef.current = true;
      setPhase('done');
      return;
    }
    playedRef.current = true;
    setPhase('playing');
    const maxDelay = poses.reduce((m, p) => Math.max(m, p.delayMs), 0);
    const total = maxDelay + config.durationMs + 48;
    const id = window.setTimeout(() => {
      setPhase('done');
    }, total);
    endTimers.current.push(id);
  }, [poses, config.durationMs]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      playedRef.current = true;
      setPhase('done');
      return;
    }
    if (playedRef.current) return;

    if (!scrollTrigger) {
      const id = window.requestAnimationFrame(() => startSpiral());
      return () => window.cancelAnimationFrame(id);
    }

    const el = rootRef.current;
    if (!el) return;

    const scoop = el.closest('[data-azes-scoop]') ?? null;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.12)) {
          startSpiral();
          io.disconnect();
        }
      },
      { root: scoop instanceof Element ? scoop : null, threshold: [0.12, 0.25] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [scrollTrigger, count, startSpiral]);

  const childArray = Array.isArray(children) ? children : [children];
  const childIds = childArray.map((child, index) => childKey(child, index)).join('|');

  useEffect(() => {
    if (phase !== 'done') return;
    const ids = childIds ? childIds.split('|') : [];
    const nextFade = new Set<string>();
    for (const id of ids) {
      if (!seenIdsRef.current.has(id)) {
        nextFade.add(id);
        seenIdsRef.current.add(id);
      }
    }
    if (nextFade.size === 0) return;
    setFadeKeys(nextFade);
    const t = window.setTimeout(() => setFadeKeys(new Set()), SPIRAL.FADE_MS);
    return () => window.clearTimeout(t);
  }, [phase, childIds]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (!childIds) return;
    for (const id of childIds.split('|')) {
      seenIdsRef.current.add(id);
    }
  }, [phase, childIds]);

  const playing = phase === 'playing';
  const pathFrames = useMemo(() => pathKeyframes(config.keyframeT), [config.keyframeT]);

  return (
    <MuiBox
      ref={rootRef}
      data-azes-launcher-scatter={phase}
      data-azes-spiral-intensity={intensity}
      sx={{
        display: 'grid',
        width: '100%',
        justifyContent: 'center',
        justifyItems: 'center',
        gridTemplateColumns: {
          xs: `repeat(${COLS.xs}, ${tileTrack.xs})`,
          sm: `repeat(${COLS.sm}, ${tileTrack.sm})`,
          md: `repeat(${COLS.md}, ${tileTrack.md})`,
          lg: `repeat(${COLS.lg}, ${tileTrack.md})`,
        },
        gap: { xs: 1, sm: 2, md: 2 },
        '@keyframes azesLauncherSpiralPath': pathFrames,
        '@keyframes azesLauncherSpiralSpin': {
          '0%': {
            transform: 'rotate(var(--sr, -540deg)) scale(var(--ss, 0.35))',
            opacity: 0,
          },
          '25%': { opacity: 1 },
          '75%': {
            transform: 'rotate(0deg) scale(var(--so, 1.06))',
            opacity: 1,
          },
          '100%': {
            transform: 'rotate(0deg) scale(1)',
            opacity: 1,
          },
        },
        '@keyframes azesLauncherTileFade': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '& [data-azes-spiral-path], & [data-azes-spiral-spin]': {
            animation: 'none !important',
            transform: 'none !important',
            opacity: '1 !important',
            willChange: 'auto',
          },
        },
      }}
    >
      {childArray.map((child, index) => {
        if (!child) return null;
        const pose = poses[index];
        const id = childKey(child, index);
        const fading = fadeKeys.has(id);

        const pathVars: CSSProperties = {};
        if (pose && playing) {
          pose.path.forEach((pt, i) => {
            (pathVars as Record<string, string>)[`--p${i}x`] = `${pt.x}px`;
            (pathVars as Record<string, string>)[`--p${i}y`] = `${pt.y}px`;
          });
          (pathVars as Record<string, string>)['--sr'] = `-${pose.spinDeg}deg`;
          (pathVars as Record<string, string>)['--ss'] = String(pose.scaleStart);
          (pathVars as Record<string, string>)['--so'] = String(pose.overshootScale);
        }

        return (
          <MuiBox
            key={id}
            data-azes-spiral-path={playing ? '1' : undefined}
            sx={{
              width: '100%',
              willChange: playing ? 'transform' : 'auto',
              ...(playing && pose
                ? {
                    animationName: 'azesLauncherSpiralPath',
                    animationDuration: `${config.durationMs}ms`,
                    animationTimingFunction: SPIRAL.EASE_OUT,
                    animationDelay: `${pose.delayMs}ms`,
                    animationFillMode: 'both',
                    animationIterationCount: 1,
                  }
                : {
                    transform: 'none',
                  }),
              ...(fading
                ? {
                    animationName: 'azesLauncherTileFade',
                    animationDuration: `${SPIRAL.FADE_MS}ms`,
                    animationTimingFunction: 'ease-out',
                    animationFillMode: 'both',
                  }
                : null),
            }}
            style={pathVars}
          >
            <MuiBox
              data-azes-spiral-spin={playing ? '1' : undefined}
              sx={{
                width: '100%',
                willChange: playing ? 'transform, opacity' : 'auto',
                ...(playing && pose
                  ? {
                      animationName: 'azesLauncherSpiralSpin',
                      animationDuration: `${config.durationMs}ms`,
                      animationTimingFunction: SPIRAL.EASE_ROTATE,
                      animationDelay: `${pose.delayMs}ms`,
                      animationFillMode: 'both',
                      animationIterationCount: 1,
                    }
                  : {
                      transform: 'none',
                      opacity: 1,
                    }),
              }}
            >
              {child}
            </MuiBox>
          </MuiBox>
        );
      })}
    </MuiBox>
  );
}
