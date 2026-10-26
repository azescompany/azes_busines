/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/createAzesTheme.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-09-29
 * ║ Updated: 2026-10-11
 * ║ Purpose: Compose one MUI theme from AZES tokens, brand, density, five font presets, direction
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  componentPx,
  fontFamilyPresets,
  layoutPx,
  primitives,
  type FontFamilyPresetId,
} from '@azes/design-tokens';
import { createTheme, type Theme } from '@mui/material/styles';

import './mui-augment';
import { DEFAULT_PRIMARY, resolveBrandPrimary, resolveBrandSecondary } from './brand';
import { azesComponents } from './components';
import { DEFAULT_AZES_DENSITY, type AzesDensity } from './density';
import { createColorSchemes } from './palette';
import { azesCustomShadows, azesShadows } from './shadows';
import { azesTypography } from './typography';

const { radius, radiusPx, breakpointPx, zIndex, motion } = primitives;

export type { AzesDensity } from './density';

export type AzesFontPresetId = FontFamilyPresetId;
export type AzesDirection = 'ltr' | 'rtl';

export const AZES_FONT_PRESET_IDS = Object.keys(fontFamilyPresets) as AzesFontPresetId[];
export const DEFAULT_AZES_FONT_PRESET: AzesFontPresetId = 'inter';

/** Legacy stored ids → current presets (safe no-crash migration). */
const LEGACY_FONT_PRESET_MAP: Record<string, AzesFontPresetId> = {
  default: 'inter',
  system: 'inter',
  inter: 'inter',
  // Retired neo-grotesk twins (2026-10-11) → closest distinct faces.
  manrope: 'nunito',
  plusJakarta: 'ibmPlexSans',
  dmSans: 'ibmPlexSans',
  spaceGrotesk: 'inter',
};

export function isAzesFontPresetId(value: unknown): value is AzesFontPresetId {
  return (
    typeof value === 'string' && Object.prototype.hasOwnProperty.call(fontFamilyPresets, value)
  );
}

/** Resolve a stored or input font id, migrating legacy default/system/inter values. */
export function resolveAzesFontPresetId(value: unknown): AzesFontPresetId {
  if (isAzesFontPresetId(value)) return value;
  if (typeof value === 'string' && value in LEGACY_FONT_PRESET_MAP) {
    return LEGACY_FONT_PRESET_MAP[value]!;
  }
  return DEFAULT_AZES_FONT_PRESET;
}

export type CreateAzesThemeInput = {
  /** Hex color or a brand seed name. Defaults to teal seed. */
  primary?: string;
  /**
   * Optional override. When omitted, secondary / focus / link are derived from primary
   * per scheme for brand harmony (see `harmony.ts`).
   */
  secondary?: string;
  /** Control sizing preset. Default `comfortable` matches the pre-density theme. */
  density?: AzesDensity;
  /** Body font stack preset. Default `inter`. */
  fontFamily?: AzesFontPresetId;
  /** Text direction. Full RTL flipping of MUI styles also needs an RTL Emotion cache. */
  direction?: AzesDirection;
  /**
   * When true (default), canvas/paper/borders/text follow the primary hue (tinted surfaces).
   * Set false to use fixed semantic neutrals from design-tokens.
   */
  tintSurfaces?: boolean;
};

export function createAzesTheme(input: CreateAzesThemeInput = {}): Theme {
  const primary = resolveBrandPrimary(input.primary ?? DEFAULT_PRIMARY);
  const secondary =
    input.secondary === undefined ? undefined : resolveBrandSecondary(input.secondary);
  const density = input.density ?? DEFAULT_AZES_DENSITY;
  const fontPreset = resolveAzesFontPresetId(input.fontFamily);
  const shadows = azesShadows();

  return createTheme({
    direction: input.direction ?? 'ltr',
    cssVariables: {
      colorSchemeSelector: 'data-azes-color-scheme',
    },
    colorSchemes: createColorSchemes({
      primary,
      secondary,
      tintSurfaces: input.tintSurfaces,
    }),
    // Comfortable = MUI default 8px; compact tightens the scale globally.
    spacing: density === 'compact' ? 6 : 8,
    shape: {
      borderRadius: radiusPx.md,
      radiusSm: radiusPx.sm,
      radiusMd: radiusPx.md,
      radiusLg: radiusPx.lg,
      radiusXl: radiusPx.xl,
      radiusFull: radiusPx.full,
    },
    azesRadius: radius,
    azes: {
      layout: layoutPx,
      component: componentPx,
      density,
      dataGrid:
        density === 'compact'
          ? {
              rowHeight: 40,
              headerHeight: 40,
              footerHeight: 48,
              minVisibleRows: 5,
              cellPaddingX: '12px',
              hoverMixPercent: 6,
              selectedMixPercent: 10,
            }
          : {
              rowHeight: 52,
              headerHeight: 48,
              footerHeight: 52,
              minVisibleRows: 5,
              cellPaddingX: '16px',
              hoverMixPercent: 6,
              selectedMixPercent: 10,
            },
      table:
        density === 'compact'
          ? {
              rowHeight: 40,
              headerHeight: 40,
              footerHeight: 48,
              minVisibleRows: 5,
              cellPaddingX: '12px',
              hoverMixPercent: 6,
              selectedMixPercent: 10,
              headerTypography: 'subtitle2',
              cellTypography: 'body2',
              footerTypography: 'caption',
            }
          : {
              rowHeight: 52,
              headerHeight: 48,
              footerHeight: 52,
              minVisibleRows: 5,
              cellPaddingX: '16px',
              hoverMixPercent: 6,
              selectedMixPercent: 10,
              headerTypography: 'subtitle2',
              cellTypography: 'body2',
              footerTypography: 'caption',
            },
      accordion:
        density === 'compact'
          ? {
              headerMinHeight: 44,
              headerHoverMixPercent: 6,
              chipMixPercent: 10,
              contentPaddingBlock: 2,
              contentPaddingInline: 2,
            }
          : {
              headerMinHeight: 52,
              headerHoverMixPercent: 6,
              chipMixPercent: 10,
              contentPaddingBlock: 2.5,
              contentPaddingInline: 2.5,
            },
      dialog:
        density === 'compact'
          ? {
              iconSize: 20,
              iconPadding: 1.25,
              iconMixPercent: 12,
              contentGap: 1.5,
              paddingBlock: 2,
              paddingInline: 2,
              backdropMixPercent: 40,
              titleTypography: 'subtitle1',
              descriptionTypography: 'body2',
            }
          : {
              iconSize: 22,
              iconPadding: 1.5,
              iconMixPercent: 12,
              contentGap: 2,
              paddingBlock: 2.5,
              paddingInline: 2.5,
              backdropMixPercent: 40,
              titleTypography: 'h6',
              descriptionTypography: 'body2',
            },
      carousel:
        density === 'compact'
          ? {
              aspectRatio: '16 / 10',
              arrowSize: 40,
              thumbSize: 48,
              thumbGap: 0.75,
              surfaceMixPercent: 85,
              counterTypography: 'caption',
            }
          : {
              aspectRatio: '16 / 10',
              arrowSize: 44,
              thumbSize: 56,
              thumbGap: 1,
              surfaceMixPercent: 85,
              counterTypography: 'caption',
            },
      loader: {
        delayMs: 200,
        minDurationMs: 400,
        introMs: 800,
        loopMs: 2400,
        staggerMs: 40,
        headerLogoRatio: 0.72,
        sizeSm: density === 'compact' ? 3 : 3.5,
        sizeMd: density === 'compact' ? 5 : 6,
        sizeLg: density === 'compact' ? 8 : 10,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        softMixPercent: 60,
      },
      sidePanel:
        density === 'compact'
          ? {
              widthSm: 320,
              widthMd: 392,
              widthLg: 480,
              headerMinHeight: 56,
              paddingInline: 2,
              paddingBlock: 2,
              backdropMixPercent: 28,
              titleTypography: 'subtitle1',
              subtitleTypography: 'caption',
            }
          : {
              widthSm: 340,
              widthMd: 392,
              widthLg: 520,
              headerMinHeight: 64,
              paddingInline: 2.5,
              paddingBlock: 2.5,
              backdropMixPercent: 28,
              titleTypography: 'h6',
              subtitleTypography: 'body2',
            },
      backdrop: {
        blur: 8,
        nestedBlur: 4,
        saturate: 1.2,
        tintLight: 16,
        tintDark: 24,
        duration: 200,
        opaqueBoost: 18,
      },
      menu:
        density === 'compact'
          ? {
              itemMinHeight: 40,
              itemRadius: radiusPx.sm,
              paperRadius: radiusPx.md,
              widthSm: 200,
              widthMd: 280,
              maxHeight: 320,
              shadow: shadows[4],
              hoverMixPercent: 6,
              focusMixPercent: 10,
              selectedMixPercent: 10,
              dangerHoverMixPercent: 8,
            }
          : {
              itemMinHeight: 44,
              itemRadius: radiusPx.sm,
              paperRadius: radiusPx.md,
              widthSm: 220,
              widthMd: 300,
              maxHeight: 360,
              shadow: shadows[4],
              hoverMixPercent: 6,
              focusMixPercent: 10,
              selectedMixPercent: 10,
              dangerHoverMixPercent: 8,
            },
      skeleton:
        density === 'compact'
          ? {
              baseMixPercent: 7,
              waveMixPercent: 18,
              waveWidthPercent: 42,
              durationMs: 1600,
              easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
              staggerMs: 36,
              fadeInMs: 220,
              delayMs: 180,
              minDurationMs: 320,
              textLineSpacing: 1.75,
              controlHeightSpacing: 4.5,
              avatarSpacing: 4,
              chipHeightSpacing: 3,
            }
          : {
              baseMixPercent: 8,
              waveMixPercent: 20,
              waveWidthPercent: 45,
              durationMs: 1800,
              easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
              staggerMs: 40,
              fadeInMs: 260,
              delayMs: 200,
              minDurationMs: 360,
              textLineSpacing: 2,
              controlHeightSpacing: 5,
              avatarSpacing: 4.5,
              chipHeightSpacing: 3.5,
            },
      loginShell: {
        canvasPercent: 48,
        showcasePercent: 52,
        desktopMinWidthPx: breakpointPx.lg,
        chromeInsetSpacing: 2,
        formMaxWidthSpacing: 52,
        expandDurationMs: 800,
        expandEasing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        settleEasing: 'cubic-bezier(0.34, 1.3, 0.64, 1)',
        scatterDurationMs: 900,
        logoRiseDurationMs: 720,
        holdDurationMs: 3000,
        holdReducedMs: 400,
        exitDurationMs: 320,
        formFadeDurationMs: 280,
        formFadeTranslateY: 0.75,
        collapseLeadMs: 240,
        welcomeDelayMs: 360,
        redirectHoldMs: 380,
        reducedMotionMs: 180,
        mobileCollapseMs: 240,
        fallbackRedirectMs: 14000,
        enterDurationMs: 520,
        enterStaggerMs: 70,
        floatAmplitudeSpacing: 0.75,
        floatDurationMs: 7000,
        parallaxMaxSpacing: 1.25,
        cardTiltDeg: 4,
        shakeDistanceSpacing: 0.75,
        shakeDurationMs: 280,
        gridDotMixPercent: 6,
        zIndexChrome: 0,
        zIndexCanvas: 1,
        zIndexExpanded: 40,
      },
      navScroller: {
        scrollStepRatio: 0.7,
        edgeTolerancePx: 2,
        arrowSizeSpacing: 4.5,
        fadeWidthSpacing: 2.5,
        /**
         * Desktop web (`lg+`, when the menus toolbar is shown): always-on thin x-scrollbar.
         * Below (`md` / tablet band if toolbar is shown): arrow controls.
         * Mobile (&lt; layoutQuery): menus live in the sidebar drawer.
         */
        nativeScrollMinBreakpoint: 'lg',
        scrollbarSizeSpacing: 1,
        /** ~88px at default spacing — equal toolbar cells. */
        itemWidthSpacing: 11,
        itemPaddingInlineSpacing: 1,
        itemGapSpacing: 0.125,
        iconSizePx: 18,
        labelFontSizePx: 11,
        childChevronSizePx: 12,
        underlineHeightPx: 2,
      },
      customShadows: azesCustomShadows(shadows),
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: breakpointPx.sm,
        md: breakpointPx.md,
        lg: breakpointPx.lg,
        xl: breakpointPx.xl,
        '2xl': breakpointPx['2xl'],
      },
    },
    shadows,
    zIndex: {
      mobileStepper: zIndex.raised,
      fab: zIndex.raised,
      speedDial: zIndex.raised,
      appBar: zIndex.sticky,
      drawer: zIndex.overlay,
      modal: zIndex.modal,
      snackbar: zIndex.toast,
      tooltip: zIndex.tooltip,
      base: zIndex.base,
      raised: zIndex.raised,
      dropdown: zIndex.dropdown,
      sticky: zIndex.sticky,
      overlay: zIndex.overlay,
      popover: zIndex.popover,
      toast: zIndex.toast,
    },
    transitions: {
      duration: {
        shortest: motion.durationMs.instant,
        shorter: motion.durationMs.fast,
        short: motion.durationMs.fast,
        standard: motion.durationMs.normal,
        complex: motion.durationMs.slow,
        enteringScreen: motion.durationMs.normal,
        leavingScreen: motion.durationMs.fast,
      },
      easing: {
        easeInOut: motion.easing.standard,
        easeOut: motion.easing.enter,
        easeIn: motion.easing.exit,
        sharp: motion.easing.emphasized,
      },
    },
    typography: azesTypography(fontFamilyPresets[fontPreset]),
    components: azesComponents(density),
  });
}
