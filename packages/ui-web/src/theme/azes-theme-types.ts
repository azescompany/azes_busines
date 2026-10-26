/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/azes-theme-types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-09-29
 * ║ Updated: 2026-10-11
 * ║ Purpose: Token shapes attached to the MUI theme without importing MUI
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { ComponentPx, LayoutPx } from '@azes/design-tokens';

export type Radius = {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
};

export type AzesThemeDensity = 'comfortable' | 'compact';

/** Layout metrics for AzesDataGrid (density-aware). */
export type AzesDataGridTokens = {
  rowHeight: number;
  headerHeight: number;
  footerHeight: number;
  minVisibleRows: number;
  cellPaddingX: string;
  hoverMixPercent: number;
  selectedMixPercent: number;
};

/** Layout metrics for AzesTable (density-aware). Mirrors data-grid heights for parity. */
export type AzesTableTokens = {
  rowHeight: number;
  headerHeight: number;
  footerHeight: number;
  minVisibleRows: number;
  cellPaddingX: string;
  hoverMixPercent: number;
  selectedMixPercent: number;
  /** Typography variant keys resolved on the theme. */
  headerTypography: 'subtitle2';
  cellTypography: 'body2';
  footerTypography: 'caption';
};

/** Layout metrics for AzesAccordion panels (density-aware). */
export type AzesAccordionTokens = {
  headerMinHeight: number;
  headerHoverMixPercent: number;
  chipMixPercent: number;
  contentPaddingBlock: number;
  contentPaddingInline: number;
};

/** Layout metrics for the global AzesDialog host (density-aware). */
export type AzesDialogTokens = {
  iconSize: number;
  iconPadding: number;
  iconMixPercent: number;
  contentGap: number;
  paddingBlock: number;
  paddingInline: number;
  backdropMixPercent: number;
  titleTypography: 'h6' | 'subtitle1';
  descriptionTypography: 'body2';
};

/** Layout metrics for AzesCarousel (density-aware). */
export type AzesCarouselTokens = {
  /** CSS aspect-ratio value, e.g. `16 / 10`. */
  aspectRatio: string;
  arrowSize: number;
  thumbSize: number;
  thumbGap: number;
  /** Paper mix percent for tinted chrome (arrows, counter). */
  surfaceMixPercent: number;
  counterTypography: 'caption';
};

/** Motion / size tokens for CaspianLoader (and logo chrome sizing). */
export type AzesLoaderTokens = {
  delayMs: number;
  minDurationMs: number;
  introMs: number;
  loopMs: number;
  staggerMs: number;
  /** Emblem height as fraction of header height (0–1). */
  headerLogoRatio: number;
  /** Inline / section logo heights in theme spacing units. */
  sizeSm: number;
  sizeMd: number;
  sizeLg: number;
  easing: string;
  softMixPercent: number;
};

/** Layout metrics for the global AzesSidePanel host (density-aware). */
export type AzesSidePanelTokens = {
  /** Desktop widths in px (mobile is full viewport). */
  widthSm: number;
  widthMd: number;
  widthLg: number;
  headerMinHeight: number;
  paddingInline: number;
  paddingBlock: number;
  backdropMixPercent: number;
  titleTypography: 'h6' | 'subtitle1';
  subtitleTypography: 'body2' | 'caption';
};

/** Global glass `MuiBackdrop` tokens (visible backdrops only). */
export type AzesBackdropTokens = {
  /** Blur radius in CSS px units (applied as `${blur}px`). */
  blur: number;
  /** Reduced blur when a second modal layer stacks. */
  nestedBlur: number;
  /** CSS saturate() multiplier, e.g. 1.2. */
  saturate: number;
  /** Primary tint % mixed into the light-scheme base. */
  tintLight: number;
  /** Primary tint % mixed into the dark-scheme base. */
  tintDark: number;
  /** Opacity fade duration (ms). */
  duration: number;
  /** Extra opacity boost when blur is unsupported / reduced-transparency. */
  opaqueBoost: number;
};

/** Caspian-wave skeleton surfaces (density-aware mixes / motion). */
export type AzesSkeletonTokens = {
  /** Block fill: text.primary mixed into paper (%). */
  baseMixPercent: number;
  /** Wave tint: primary.main into transparent (%). */
  waveMixPercent: number;
  /** Wave band width as % of group width. */
  waveWidthPercent: number;
  durationMs: number;
  easing: string;
  staggerMs: number;
  fadeInMs: number;
  /** Delay / minDuration for content gate (ms). */
  delayMs: number;
  minDurationMs: number;
  /** Default text line height in spacing units. */
  textLineSpacing: number;
  /** Default button / control height in spacing units. */
  controlHeightSpacing: number;
  avatarSpacing: number;
  chipHeightSpacing: number;
};

/** Global AzesMenu paper / item metrics (density-aware). */
export type AzesMenuTokens = {
  itemMinHeight: number;
  itemRadius: number;
  /** Paper corner radius in CSS px (always applied as `${paperRadius}px` in sx). */
  paperRadius: number;
  widthSm: number;
  widthMd: number;
  maxHeight: number;
  /** Paper shadow (token string; soft elevation). */
  shadow: string;
  hoverMixPercent: number;
  focusMixPercent: number;
  selectedMixPercent: number;
  dangerHoverMixPercent: number;
};

/**
 * Account login “Chrome & Canvas” shell (apps/account).
 * Chrome uses the same `--azes-nav-*` / layout chrome-join tokens as admin.
 */
export type AzesLoginShellTokens = {
  /** Desktop canvas column share (%); showcase is the remainder. */
  canvasPercent: number;
  showcasePercent: number;
  /** Below this width showcase is not mounted (matches MUI `lg` intent). */
  desktopMinWidthPx: number;
  /** Outer chrome inset around canvas on desktop (theme spacing units). */
  chromeInsetSpacing: number;
  /** Form column max width (theme spacing units). */
  formMaxWidthSpacing: number;
  expandDurationMs: number;
  expandEasing: string;
  /** Card scatter overshoot easing (showcase success). */
  settleEasing: string;
  scatterDurationMs: number;
  logoRiseDurationMs: number;
  /** Hold settled scene before exit/redirect. */
  holdDurationMs: number;
  holdReducedMs: number;
  exitDurationMs: number;
  formFadeDurationMs: number;
  formFadeTranslateY: number;
  collapseLeadMs: number;
  welcomeDelayMs: number;
  redirectHoldMs: number;
  reducedMotionMs: number;
  mobileCollapseMs: number;
  /** Absolute redirect safety net (≥ hold + motion × 1.5). */
  fallbackRedirectMs: number;
  enterDurationMs: number;
  enterStaggerMs: number;
  /** Showcase float amplitude (theme spacing units). */
  floatAmplitudeSpacing: number;
  floatDurationMs: number;
  /** Parallax max shift (theme spacing units). */
  parallaxMaxSpacing: number;
  /** Decorative card tilt in degrees. */
  cardTiltDeg: number;
  shakeDistanceSpacing: number;
  shakeDurationMs: number;
  /** Dot-grid wash on chrome: text.primary into transparent (%). */
  gridDotMixPercent: number;
  zIndexChrome: number;
  zIndexCanvas: number;
  zIndexExpanded: number;
};

/** Horizontal menus toolbar scroller (arrow controls + cell metrics). */
export type AzesNavScrollerTokens = {
  /** Fraction of visible width to scroll per arrow click (0–1). */
  scrollStepRatio: number;
  /** Subpixel tolerance when detecting scroll edges (CSS px). */
  edgeTolerancePx: number;
  /** Arrow control size (theme spacing units). */
  arrowSizeSpacing: number;
  /** Edge fade width (theme spacing units). */
  fadeWidthSpacing: number;
  /**
   * From this breakpoint up: native hover scrollbar (desktop web).
   * Below: arrow controls (tablet / `md` range when the toolbar is shown).
   */
  nativeScrollMinBreakpoint: 'sm' | 'md' | 'lg' | 'xl';
  /** Hover scrollbar thickness (theme spacing units) — desktop native mode. */
  scrollbarSizeSpacing: number;
  /** Fixed menu cell width (theme spacing units) — equal columns. */
  itemWidthSpacing: number;
  /** Horizontal padding inside each item (theme spacing units). */
  itemPaddingInlineSpacing: number;
  /** Gap between icon and label (theme spacing units). */
  itemGapSpacing: number;
  /** Toolbar item icon size (CSS px → typography.pxToRem). */
  iconSizePx: number;
  /** Label under icon (CSS px → typography.pxToRem). */
  labelFontSizePx: number;
  /** Expand chevron next to label (CSS px → typography.pxToRem). */
  childChevronSizePx: number;
  /** Active underline thickness (CSS px). */
  underlineHeightPx: number;
};

export type AzesThemeExtension = {
  layout: LayoutPx;
  component: ComponentPx;
  density: AzesThemeDensity;
  dataGrid: AzesDataGridTokens;
  table: AzesTableTokens;
  accordion: AzesAccordionTokens;
  dialog: AzesDialogTokens;
  carousel: AzesCarouselTokens;
  loader: AzesLoaderTokens;
  sidePanel: AzesSidePanelTokens;
  backdrop: AzesBackdropTokens;
  menu: AzesMenuTokens;
  skeleton: AzesSkeletonTokens;
  loginShell: AzesLoginShellTokens;
  navScroller: AzesNavScrollerTokens;
  customShadows: {
    card: string;
    dropdown: string;
    dialog: string;
    nav: string;
  };
};

export type ZIndex = {
  base: number;
  raised: number;
  dropdown: number;
  sticky: number;
  overlay: number;
  modal: number;
  popover: number;
  toast: number;
  tooltip: number;
};
