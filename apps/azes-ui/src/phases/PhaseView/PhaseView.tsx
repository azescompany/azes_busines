/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/phases/PhaseView/PhaseView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Shared phase catalog — refined Caspian hero + demo canvas
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useTranslation } from '@azes/i18n';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MuiBox,
  MuiButton,
  Typography,
  useMediaQuery,
  useTheme,
  type Theme,
} from '@azes/ui-web';
import { useAzesSnackbar } from '@azes/ui-web/feedback';
import { IconArrowForward } from '@azes/ui-web/icons';
import { createElement, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { SHOWCASE_NAMESPACE } from '../../i18n/createShowcaseI18n.js';
import { phaseI18nSegment } from '../../i18n/phaseI18nKey.js';
import { SectionContent } from '../../sections/SectionContent.js';
import { findSectionLabel } from '../../sections/registry.js';
import { sectionIcon } from '../../sections/sectionIcons.js';
import { DIAGONAL_H_CLAMP } from '../diagonal.js';
import { DiagonalDivider } from '../DiagonalDivider/DiagonalDivider.js';
import { findPhaseForSection, getPhase, type PhaseId, type PhaseMeta } from '../phaseRegistry.js';
import { ShowcaseParallaxBand } from '../ShowcaseParallaxBand/ShowcaseParallaxBand.js';
import { useActiveSectionId, useInViewOnce } from '../useInViewOnce.js';

const seamCleanSx = {
  boxShadow: 'none',
  filter: 'none',
} as const;

export type PhaseViewProps = {
  phaseId: PhaseId;
  onNavigate: (id: string) => void;
};

function washOverlay(phase: PhaseMeta, theme: Theme): string {
  const black = theme.vars.palette.common.black;
  const primary = theme.vars.palette.primary.main;
  const primaryDark = theme.vars.palette.primary.dark;
  if (phase.wash === 'soft') {
    return [
      `radial-gradient(ellipse 90% 55% at 48% 16%, color-mix(in srgb, ${primary} 32%, transparent), transparent 68%)`,
      `linear-gradient(185deg, color-mix(in srgb, ${black} 18%, transparent) 0%, color-mix(in srgb, ${primaryDark} 42%, ${black}) 100%)`,
    ].join(', ');
  }
  if (phase.wash === 'primary') {
    // Extra bottom vignette keeps white hero copy AA across light seeds on busy photos.
    return [
      `radial-gradient(ellipse 70% 45% at 60% 10%, color-mix(in srgb, ${primary} 40%, transparent), transparent 65%)`,
      `linear-gradient(160deg, color-mix(in srgb, ${primary} 38%, transparent) 0%, color-mix(in srgb, ${primaryDark} 72%, ${black}) 100%)`,
      `linear-gradient(185deg, color-mix(in srgb, ${black} 28%, transparent) 0%, color-mix(in srgb, ${black} 62%, ${primaryDark}) 72%, color-mix(in srgb, ${black} 78%, ${primaryDark}) 100%)`,
    ].join(', ');
  }
  return [
    `radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, ${primaryDark} 35%, transparent), transparent 60%)`,
    `linear-gradient(180deg, color-mix(in srgb, ${black} 50%, transparent) 0%, color-mix(in srgb, ${black} 78%, ${primaryDark}) 100%)`,
  ].join(', ');
}

function ContentRail({ children }: { children: ReactNode }) {
  return (
    <MuiBox
      sx={{
        width: '100%',
        maxWidth: 1120,
        mx: 'auto',
        px: { xs: 2, md: 3 },
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </MuiBox>
  );
}

function scrollToDemo(sectionId: string) {
  const el = document.getElementById(`demo-${sectionId}`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function sectionTitle(
  t: (key: string, options?: Record<string, unknown>) => string,
  id: string,
): string {
  const key = `sections.${id}.title`;
  const translated = t(key);
  if (translated && translated !== key) return translated;
  return findSectionLabel(id) ?? id;
}

function sectionCaption(
  t: (key: string, options?: Record<string, unknown>) => string,
  id: string,
): string {
  const key = `sections.${id}.caption`;
  const translated = t(key);
  if (translated && translated !== key) return translated;
  return t('phase.demoCaption');
}

function sectionTakeaway(
  t: (key: string, options?: Record<string, unknown>) => string,
  id: string,
): string | null {
  const key = `sections.${id}.takeaway`;
  const translated = t(key);
  if (translated && translated !== key) return translated;
  return null;
}

function FadeUp({
  children,
  delayMs,
  disabled,
}: {
  children: ReactNode;
  delayMs: number;
  disabled: boolean;
}) {
  return (
    <MuiBox
      sx={{
        opacity: disabled ? 1 : 0,
        transform: disabled ? 'none' : 'translateY(14px)',
        animation: disabled ? 'none' : `azes-fade-up 520ms ease-out ${delayMs}ms forwards`,
        '@keyframes azes-fade-up': {
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          opacity: 1,
          transform: 'none',
          animation: 'none',
        },
      }}
    >
      {children}
    </MuiBox>
  );
}

function ScrollIndicator({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <MuiBox
      aria-label={label}
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.75,
        color: 'inherit',
        opacity: 0.8,
      }}
    >
      <MuiBox
        sx={{
          width: 1,
          height: 28,
          bgcolor: `color-mix(in srgb, ${theme.vars.palette.common.white} 55%, transparent)`,
          position: 'relative',
          overflow: 'hidden',
          '@media (prefers-reduced-motion: no-preference)': {
            '&::after': {
              content: '""',
              position: 'absolute',
              left: 0,
              width: '100%',
              height: 8,
              bgcolor: theme.vars.palette.common.white,
              animation: 'azes-scroll-dot 1.6s ease-in-out infinite',
            },
            '@keyframes azes-scroll-dot': {
              '0%': { top: '-8px', opacity: 0 },
              '30%': { opacity: 1 },
              '100%': { top: '100%', opacity: 0 },
            },
          },
        }}
      />
      <Typography
        variant="caption"
        sx={{ letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: '0.65rem' }}
      >
        {label}
      </Typography>
    </MuiBox>
  );
}

function ValueCard({
  index,
  sectionId,
  label,
  caption,
  onActivate,
  reduceMotion,
}: {
  index: number;
  sectionId: string;
  label: string;
  caption: string;
  onActivate: () => void;
  reduceMotion: boolean;
}) {
  const theme = useTheme();
  const onDark = theme.vars.palette.common.white;
  const Icon = sectionIcon(sectionId);
  const glass = `color-mix(in srgb, ${theme.vars.palette.primary.dark} 48%, color-mix(in srgb, ${theme.vars.palette.common.black} 38%, transparent))`;
  const glassFallback = `color-mix(in srgb, ${theme.vars.palette.primary.dark} 78%, ${theme.vars.palette.common.black})`;

  return (
    <MuiBox
      component="button"
      type="button"
      aria-label={label}
      onClick={onActivate}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 1.5,
        m: 0,
        cursor: 'pointer',
        appearance: 'none',
        WebkitAppearance: 'none',
        font: 'inherit',
        color: onDark,
        textAlign: 'start',
        minHeight: { xs: 120, md: 148 },
        px: 2.25,
        py: 2.25,
        borderRadius: `${theme.shape.radiusSm}px`,
        bgcolor: glassFallback,
        border: `1px solid color-mix(in srgb, ${onDark} 16%, transparent)`,
        backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${onDark} 10%, transparent) 0%, transparent 42%)`,
        '@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px)))': {
          bgcolor: glass,
          backdropFilter: 'blur(12px) saturate(140%)',
          WebkitBackdropFilter: 'blur(12px) saturate(140%)',
        },
        transformOrigin: 'center center',
        transition: theme.transitions.create(['transform', 'background-color', 'border-color'], {
          duration: 240,
          easing: theme.transitions.easing.easeOut,
        }),
        zIndex: 1,
        '&:hover, &:focus-visible': {
          zIndex: 2,
          transform: reduceMotion ? 'none' : 'translateY(-2px)',
          borderColor: `color-mix(in srgb, ${onDark} 36%, transparent)`,
          outline: 'none',
          '& .azes-card-arrow': {
            opacity: 1,
            transform: 'translateX(0)',
          },
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.vars.palette.common.white}`,
          outlineOffset: 2,
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: theme.transitions.create(['background-color', 'border-color'], {
            duration: 180,
          }),
        },
      }}
    >
      <MuiBox sx={{ display: 'flex', width: '100%', alignItems: 'center', gap: 1 }}>
        <Typography
          component="span"
          sx={{
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            opacity: 0.7,
            fontWeight: theme.typography.fontWeightBold,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </Typography>
        <MuiBox sx={{ ml: 'auto', opacity: 0.9, display: 'inline-flex' }}>
          {createElement(Icon, { fontSize: 'small' })}
        </MuiBox>
      </MuiBox>
      <MuiBox>
        <Typography
          component="span"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontWeight: theme.typography.fontWeightBold,
            fontSize: { xs: '0.85rem', md: '0.9rem' },
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            lineHeight: 1.35,
            mb: 0.5,
            wordBreak: 'break-word',
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            opacity: 0.86,
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {caption}
        </Typography>
      </MuiBox>
      <MuiBox
        className="azes-card-arrow"
        sx={{
          display: 'inline-flex',
          opacity: 0,
          transform: 'translateX(-6px)',
          transition: theme.transitions.create(['opacity', 'transform'], { duration: 220 }),
          '@media (prefers-reduced-motion: reduce)': {
            opacity: 0.85,
            transform: 'none',
          },
        }}
      >
        <IconArrowForward fontSize="small" />
      </MuiBox>
    </MuiBox>
  );
}

function StickySectionNav({
  sectionIds,
  activeId,
  onSelect,
  ariaLabel,
}: {
  sectionIds: readonly string[];
  activeId: string | null;
  onSelect: (id: string) => void;
  ariaLabel: string;
}) {
  const { t } = useTranslation(SHOWCASE_NAMESPACE);
  const theme = useTheme();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!activeId) return;
    const el = pillRefs.current[activeId];
    if (!el || typeof el.scrollIntoView !== 'function') return;
    el.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      inline: 'nearest',
      block: 'nearest',
    });
  }, [activeId, reduceMotion]);

  return (
    <MuiBox
      component="nav"
      aria-label={ariaLabel}
      sx={{
        position: 'sticky',
        top: { xs: 56, md: 64 },
        zIndex: 6,
        mb: { xs: 2.5, md: 3.5 },
        mx: { xs: -2, md: 0 },
        px: { xs: 2, md: 0 },
      }}
    >
      <MuiBox
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          py: 1,
          px: { xs: 0.5, md: 1 },
          borderRadius: `${theme.shape.radiusLg}px`,
          border: '1px solid',
          borderColor: 'border.default',
          bgcolor: `color-mix(in srgb, ${theme.vars.palette.background.paper} 88%, transparent)`,
          '@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px)))': {
            backdropFilter: 'blur(10px) saturate(130%)',
            WebkitBackdropFilter: 'blur(10px) saturate(130%)',
          },
          scrollbarWidth: 'thin',
        }}
      >
        {sectionIds.map((id) => {
          const active = activeId === id;
          return (
            <MuiButton
              key={id}
              ref={(node) => {
                pillRefs.current[id] = node;
              }}
              size="small"
              variant={active ? 'contained' : 'text'}
              color={active ? 'primary' : 'inherit'}
              onClick={() => onSelect(id)}
              data-azes-section-pill={id}
              sx={{
                flexShrink: 0,
                borderRadius: 999,
                px: 1.5,
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                transition: theme.transitions.create(
                  ['background-color', 'color', 'box-shadow', 'border-color'],
                  { duration: 200 },
                ),
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                },
              }}
            >
              {sectionTitle(t, id)}
            </MuiButton>
          );
        })}
      </MuiBox>
    </MuiBox>
  );
}

function DemoCard({
  index,
  sectionId,
  title,
  caption,
  takeaway,
  reduceMotion,
  sectionProps,
}: {
  index: number;
  sectionId: string;
  title: string;
  caption: string;
  takeaway: string | null;
  reduceMotion: boolean;
  sectionProps: {
    onDialog: () => void;
    onSnack: () => void;
    onNavigate: (id: string) => void;
  };
}) {
  const theme = useTheme();
  const [ref, visible] = useInViewOnce<HTMLElement>(reduceMotion);

  return (
    <MuiBox
      ref={ref}
      component="section"
      aria-labelledby={`demo-${sectionId}`}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: `${theme.shape.radiusLg}px`,
        border: '1px solid',
        borderColor: 'border.default',
        bgcolor: 'background.paper',
        boxShadow: theme.azes.customShadows.card,
        minWidth: 0,
        maxWidth: '100%',
        overflowX: 'auto',
        // Header (56/64) + sticky pills (~56) + gap
        scrollMarginTop: { xs: 130, md: 150 },
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(14px)',
        transition: reduceMotion
          ? 'none'
          : theme.transitions.create(['opacity', 'transform'], {
              duration: 420,
              easing: theme.transitions.easing.easeOut,
            }),
      }}
    >
      <MuiBox
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          mb: 2.5,
          pb: 1.5,
          borderBottom: '1px solid',
          borderColor: 'border.default',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            bottom: -1,
            width: 56,
            height: 2,
            borderRadius: 1,
            background: `linear-gradient(90deg, ${theme.vars.palette.primary.main}, color-mix(in srgb, ${theme.vars.palette.primary.main} 10%, transparent))`,
          },
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            color: 'text.secondary',
            fontWeight: theme.typography.fontWeightBold,
            pt: 0.35,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </Typography>
        <MuiBox sx={{ minWidth: 0 }}>
          <Typography
            id={`demo-${sectionId}`}
            variant="h6"
            component="h3"
            sx={{ fontWeight: theme.typography.fontWeightBold, mb: 0.35 }}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '60ch' }}>
            {caption}
          </Typography>
          {takeaway ? (
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                maxWidth: '60ch',
                color: 'text.primary',
                fontWeight: theme.typography.fontWeightMedium,
                lineHeight: 1.5,
              }}
            >
              {takeaway}
            </Typography>
          ) : null}
        </MuiBox>
      </MuiBox>
      <MuiBox sx={{ minWidth: 0, maxWidth: '100%' }}>
        <SectionContent id={sectionId} {...sectionProps} />
      </MuiBox>
    </MuiBox>
  );
}

export function PhaseView({ phaseId, onNavigate }: PhaseViewProps) {
  const { t } = useTranslation(SHOWCASE_NAMESPACE);
  const theme = useTheme();
  const phase = useMemo(() => getPhase(phaseId), [phaseId]);
  const phaseKey = phaseI18nSegment(phase.id);
  const paper = theme.vars.palette.background.paper;
  const canvas = theme.vars.palette.background.default;
  const onDark = theme.vars.palette.common.white;
  const snackbar = useAzesSnackbar();
  const smDown = useMediaQuery(theme.breakpoints.down('sm'));
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [dialogOpen, setDialogOpen] = useState(false);

  const overlay = washOverlay(phase, theme);
  const lookFor = t(`phases.${phaseKey}.lookFor`);
  const pullQuoteKey = `phases.${phaseKey}.pullQuote`;
  const pullQuoteRaw = t(pullQuoteKey);
  const pullQuote = pullQuoteRaw !== pullQuoteKey ? pullQuoteRaw : lookFor;

  const handleSectionNav = (sectionId: string) => {
    const owner = findPhaseForSection(sectionId);
    if (owner && owner !== phaseId) {
      onNavigate(owner);
      window.setTimeout(() => scrollToDemo(sectionId), 80);
      return;
    }
    if (phase.sectionIds.includes(sectionId)) {
      scrollToDemo(sectionId);
      return;
    }
    onNavigate(sectionId);
  };

  const sectionProps = {
    onDialog: () => setDialogOpen(true),
    onSnack: () => snackbar.success(t('phase.snackSaved')),
    onNavigate: handleSectionNav,
  };

  const heroMin = smDown ? 340 : phase.sectionIds.length > 6 ? 520 : 460;
  const stickyOffset = smDown ? 112 : 136;
  const { activeId: activeSection, activate: activateSection } = useActiveSectionId(
    phase.sectionIds,
    true,
    stickyOffset,
  );

  return (
    <MuiBox
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        '--azes-diagonal-h': DIAGONAL_H_CLAMP,
        ...seamCleanSx,
      }}
    >
      <ShowcaseParallaxBand
        imageUrl={phase.imageUrl}
        diagonalEdge={phase.diagonalEdge}
        diagonalHeight={DIAGONAL_H_CLAMP}
        minHeight={heroMin}
        overlay={overlay}
        contentAlign="start"
      >
        <ContentRail>
          <MuiBox
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 3.5, md: 5 },
            }}
          >
            <MuiBox sx={{ maxWidth: 680 }}>
              <FadeUp delayMs={40} disabled={reduceMotion}>
                <MuiBox sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
                  <MuiBox
                    aria-hidden
                    sx={{
                      width: 28,
                      height: 3,
                      borderRadius: 999,
                      bgcolor: 'primary.light',
                    }}
                  />
                  <Typography
                    variant="overline"
                    sx={{ letterSpacing: '0.16em', opacity: 0.92, display: 'block' }}
                  >
                    {t(`phases.${phaseKey}.caption`)}
                  </Typography>
                </MuiBox>
              </FadeUp>
              <FadeUp delayMs={120} disabled={reduceMotion}>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: theme.typography.fontWeightBold,
                    fontSize: 'clamp(1.7rem, 1.2rem + 2.2vw, 2.75rem)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.12,
                    mb: 1.75,
                  }}
                >
                  {t(`phases.${phaseKey}.title`)}
                </Typography>
              </FadeUp>
              <FadeUp delayMs={200} disabled={reduceMotion}>
                <Typography
                  variant="body1"
                  sx={{ opacity: 0.92, lineHeight: 1.65, mb: 2.5, maxWidth: '42ch' }}
                >
                  {t(`phases.${phaseKey}.body`)}
                </Typography>
              </FadeUp>
              <FadeUp delayMs={280} disabled={reduceMotion}>
                <ScrollIndicator label={t('phase.scrollHint')} />
              </FadeUp>
            </MuiBox>

            <FadeUp delayMs={360} disabled={reduceMotion}>
              <MuiBox>
                <Typography
                  variant="overline"
                  sx={{
                    letterSpacing: '0.14em',
                    color: onDark,
                    opacity: 0.92,
                    display: 'block',
                    mb: 2,
                  }}
                >
                  {t('phase.inThisPhase')}
                </Typography>
                <MuiBox
                  sx={{
                    display: 'grid',
                    gap: 1.75,
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, minmax(0, 1fr))',
                      md: 'repeat(3, minmax(0, 1fr))',
                    },
                    alignItems: 'stretch',
                  }}
                >
                  {phase.sectionIds.map((id, index) => (
                    <ValueCard
                      key={id}
                      index={index}
                      sectionId={id}
                      label={sectionTitle(t, id)}
                      caption={sectionCaption(t, id)}
                      reduceMotion={reduceMotion}
                      onActivate={() => scrollToDemo(id)}
                    />
                  ))}
                </MuiBox>
              </MuiBox>
            </FadeUp>
          </MuiBox>
        </ContentRail>
      </ShowcaseParallaxBand>

      <MuiBox
        sx={{
          position: 'relative',
          bgcolor: paper,
          color: 'text.primary',
          // Padding ≥ diagonal height so the wedge is a real band, not a skinny white slash.
          pt: { xs: 5, md: 6.5 },
          pb: { xs: 5, md: 6.5 },
          zIndex: 2,
          mt: '-2px',
          mb: 0,
          ...seamCleanSx,
        }}
      >
        <DiagonalDivider fill={paper} height={DIAGONAL_H_CLAMP} direction="rtl" edge="top" />
        <ContentRail>
          <Typography
            component="p"
            variant="body1"
            color="text.secondary"
            sx={{
              m: 0,
              lineHeight: 1.8,
              maxWidth: '60ch',
              fontSize: { xs: '1.05rem', md: '1.2rem' },
              letterSpacing: '-0.01em',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {lookFor}
          </Typography>
        </ContentRail>
      </MuiBox>

      {phase.showSecondaryBand && phase.secondaryImageUrl ? (
        <ShowcaseParallaxBand
          imageUrl={phase.secondaryImageUrl}
          diagonalEdge="bottom"
          diagonalHeight={DIAGONAL_H_CLAMP}
          minHeight={smDown ? 260 : 340}
          scrollExtra={24}
          overlay={washOverlay(phase, theme)}
          sx={{ mt: '-2px', mb: '-2px' }}
        >
          <ContentRail>
            <Typography
              component="blockquote"
              sx={{
                m: 0,
                fontWeight: theme.typography.fontWeightBold,
                textAlign: 'center',
                maxWidth: 560,
                mx: 'auto',
                lineHeight: 1.45,
                fontSize: 'clamp(1.15rem, 1rem + 0.8vw, 1.55rem)',
                letterSpacing: '-0.015em',
                fontStyle: 'normal',
              }}
            >
              {pullQuote}
            </Typography>
          </ContentRail>
        </ShowcaseParallaxBand>
      ) : null}

      <MuiBox
        sx={{
          position: 'relative',
          bgcolor: canvas,
          pt: { xs: 5, md: 7 },
          pb: { xs: 7, md: 9 },
          zIndex: 1,
          mt: '-2px',
          ...seamCleanSx,
        }}
      >
        {phase.showSecondaryBand ? (
          <DiagonalDivider fill={canvas} height={DIAGONAL_H_CLAMP} direction="rtl" edge="top" />
        ) : null}
        <ContentRail>
          <StickySectionNav
            sectionIds={phase.sectionIds}
            activeId={activeSection}
            onSelect={(id) => {
              activateSection(id);
              scrollToDemo(id);
            }}
            ariaLabel={t('phase.sectionNavAria')}
          />
          <MuiBox sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 5.5, md: 7.5 } }}>
            {phase.sectionIds.map((id, index) => (
              <DemoCard
                key={id}
                index={index}
                sectionId={id}
                title={sectionTitle(t, id)}
                caption={sectionCaption(t, id)}
                takeaway={sectionTakeaway(t, id)}
                reduceMotion={reduceMotion}
                sectionProps={sectionProps}
              />
            ))}
          </MuiBox>
        </ContentRail>
      </MuiBox>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullScreen={smDown}
        aria-labelledby="phase-demo-dialog-title"
      >
        <DialogTitle id="phase-demo-dialog-title">{t('phase.dialogTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t('phase.dialogBody')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setDialogOpen(false)}>{t('phase.dialogClose')}</MuiButton>
        </DialogActions>
      </Dialog>
    </MuiBox>
  );
}
