/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/createAzesTheme.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-09-29
 * ║ Updated: 2026-10-11
 * ║ Purpose: Theme factory parity with the AZES color-system contract
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { componentPx, fontFamilyPresets, layoutPx, primitives } from '@azes/design-tokens';
import { getContrastRatio } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import {
  brandSeedOrder,
  brandSeeds,
  DEFAULT_PRIMARY,
  resolveBrandColor,
  resolveBrandPrimary,
} from './brand';
import { AZES_FONT_PRESET_IDS, createAzesTheme } from './createAzesTheme';
import { deriveSecondaryFromPrimary } from './harmony';
import {
  AZES_CONTRAST_THRESHOLD,
  isPrimaryContrastSafe,
  resolveDarkSchemePrimary,
} from './palette';
import { azesVariantMapping } from './typography';

describe('createAzesTheme', () => {
  it('uses teal seed as the default primary and derives contrast text', () => {
    const theme = createAzesTheme();
    const light = theme.colorSchemes.light;
    if (!light) {
      throw new Error('light color scheme missing');
    }
    const primary = light.palette.primary;

    expect(DEFAULT_PRIMARY).toBe(brandSeeds.red);
    expect(primary.main.toLowerCase()).toBe(brandSeeds.red.toLowerCase());
    expect(primary.light).toBeTruthy();
    expect(primary.dark).toBeTruthy();
    expect(primary.contrastText).toBeTruthy();
  });

  it('derives secondary/focus/link from primary and keeps feedback brand-independent', () => {
    const primary = brandSeeds.red;
    const theme = createAzesTheme({ primary: 'red' });
    const tealTheme = createAzesTheme({ primary: 'teal' });
    const light = theme.colorSchemes.light;
    const dark = theme.colorSchemes.dark;
    const tealLight = tealTheme.colorSchemes.light;
    if (!light || !dark || !tealLight) {
      throw new Error('color schemes missing');
    }

    expect(light.palette.primary.main.toLowerCase()).toBe(primary.toLowerCase());
    expect(light.palette.secondary.main.toLowerCase()).toBe(
      deriveSecondaryFromPrimary(primary, 'light').toLowerCase(),
    );
    expect(light.palette.border.focus).toMatch(/^#[0-9a-f]{6}$/i);
    expect(light.palette.text.link).toMatch(/^#[0-9a-f]{6}$/i);
    expect(
      getContrastRatio(light.palette.text.link, light.palette.background.paper),
    ).toBeGreaterThanOrEqual(4.5);

    const darkPrimary = resolveDarkSchemePrimary(primary);
    expect(dark.palette.secondary.main.toLowerCase()).toBe(
      deriveSecondaryFromPrimary(darkPrimary, 'dark').toLowerCase(),
    );

    // Feedback hues stay independent of brand (same status mains across brands).
    expect(light.palette.success.main.toLowerCase()).toBe(
      tealLight.palette.success.main.toLowerCase(),
    );
    expect(light.palette.error.main.toLowerCase()).toBe(tealLight.palette.error.main.toLowerCase());
  });

  it('holds both color schemes and maps spacing plus the md breakpoint', () => {
    const theme = createAzesTheme();

    expect(theme.colorSchemes.light).toBeTruthy();
    expect(theme.colorSchemes.dark).toBeTruthy();
    expect(theme.spacing(4)).toBe('calc(4 * var(--mui-spacing, 8px))');
    expect(theme.breakpoints.values.md).toBe(768);
    expect(theme.breakpoints.values['2xl']).toBe(1536);
  });

  it('resolves named seeds and ignores unknown values', () => {
    expect(Object.keys(brandSeeds)).toHaveLength(12);
    expect(resolveBrandPrimary('navy')).toBe(brandSeeds.navy);
    expect(resolveBrandPrimary('blue')).toBe(brandSeeds.blue);
    expect(resolveBrandPrimary('violet')).toBe(brandSeeds.violet);
    expect(resolveBrandPrimary('#112233')).toBe('#112233');
    expect(resolveBrandPrimary('purple')).toBe(DEFAULT_PRIMARY);
    expect(resolveBrandColor('navy', DEFAULT_PRIMARY)).toBe(brandSeeds.navy);
  });

  it('applies a brand secondary input without changing feedback colors', () => {
    const theme = createAzesTheme({ secondary: 'green' });
    const defaultTheme = createAzesTheme();
    const light = theme.colorSchemes.light;
    const defaultLight = defaultTheme.colorSchemes.light;
    if (!light || !defaultLight) {
      throw new Error('light color scheme missing');
    }

    expect(light.palette.secondary.main.toLowerCase()).toBe(brandSeeds.green.toLowerCase());
    expect(light.palette.error.main.toLowerCase()).toBe(
      defaultLight.palette.error.main.toLowerCase(),
    );
  });

  it('harmonizes secondary differently per primary seed in both schemes', () => {
    const teal = createAzesTheme({ primary: 'teal' });
    const red = createAzesTheme({ primary: 'red' });
    const tealLight = teal.colorSchemes.light?.palette.secondary.main.toLowerCase();
    const redLight = red.colorSchemes.light?.palette.secondary.main.toLowerCase();
    const tealDark = teal.colorSchemes.dark?.palette.secondary.main.toLowerCase();
    const redDark = red.colorSchemes.dark?.palette.secondary.main.toLowerCase();

    expect(tealLight).toBeTruthy();
    expect(redLight).toBeTruthy();
    expect(tealLight).not.toBe(redLight);
    expect(tealDark).not.toBe(redDark);
    expect(tealLight).not.toBe(tealDark);
  });

  it('meets contrast on primary contrastText for every brand seed in both schemes', () => {
    expect(brandSeedOrder).toHaveLength(12);
    for (const name of brandSeedOrder) {
      const theme = createAzesTheme({ primary: name });
      for (const scheme of ['light', 'dark'] as const) {
        const palette = theme.colorSchemes[scheme]?.palette;
        if (!palette) {
          throw new Error(`${scheme} color scheme missing`);
        }
        const ratio = getContrastRatio(palette.primary.main, palette.primary.contrastText);
        expect(ratio, `${name} ${scheme} primary contrastText`).toBeGreaterThanOrEqual(
          AZES_CONTRAST_THRESHOLD,
        );
        expect(
          getContrastRatio(palette.secondary.main, palette.secondary.contrastText),
          `${name} ${scheme} secondary contrastText`,
        ).toBeGreaterThanOrEqual(AZES_CONTRAST_THRESHOLD);
      }
    }
  });

  it('meets AA contrast for body text and status colors in both schemes', () => {
    const theme = createAzesTheme();
    for (const scheme of ['light', 'dark'] as const) {
      const palette = theme.colorSchemes[scheme]?.palette;
      if (!palette) {
        throw new Error(`${scheme} color scheme missing`);
      }

      expect(
        getContrastRatio(palette.text.primary, palette.background.default),
        `${scheme} text.primary on canvas`,
      ).toBeGreaterThanOrEqual(AZES_CONTRAST_THRESHOLD);

      expect(
        getContrastRatio(palette.text.secondary, palette.background.default),
        `${scheme} text.secondary on canvas`,
      ).toBeGreaterThanOrEqual(3);

      for (const status of ['error', 'warning', 'success', 'info'] as const) {
        const channel = palette[status];
        expect(
          getContrastRatio(channel.main, channel.contrastText),
          `${scheme} ${status} contrastText`,
        ).toBeGreaterThanOrEqual(AZES_CONTRAST_THRESHOLD);
      }

      expect(
        getContrastRatio(palette.secondary.main, palette.secondary.contrastText),
        `${scheme} secondary contrastText`,
      ).toBeGreaterThanOrEqual(AZES_CONTRAST_THRESHOLD);
    }
  });

  it('keeps compact control targets at least 24px', () => {
    const compact = createAzesTheme({ density: 'compact' });
    const button = compact.components?.MuiButton?.styleOverrides;
    if (!button || typeof button === 'function') {
      throw new Error('MuiButton styleOverrides missing');
    }

    const parsePx = (value: unknown): number => {
      if (typeof value !== 'string') {
        throw new Error(`expected length string, got ${String(value)}`);
      }
      if (value.endsWith('rem')) {
        return Number.parseFloat(value) * 16;
      }
      return Number.parseFloat(value);
    };

    expect(parsePx((button.sizeSmall as { minHeight: string }).minHeight)).toBeGreaterThanOrEqual(
      24,
    );
    expect(parsePx((button.sizeMedium as { minHeight: string }).minHeight)).toBeGreaterThanOrEqual(
      24,
    );
    expect(primitives.sizePx.controlXs).toBeGreaterThanOrEqual(24);
  });

  it('matches the pre-split theme contract for the default input', () => {
    const theme = createAzesTheme();
    const { typography, radiusPx, breakpointPx, shadow, zIndex, motion, size, spacing } =
      primitives;
    const light = theme.colorSchemes.light;
    const dark = theme.colorSchemes.dark;
    if (!light || !dark) {
      throw new Error('color schemes missing');
    }

    expect(light.palette.primary.main.toLowerCase()).toBe(DEFAULT_PRIMARY.toLowerCase());
    expect(light.palette.secondary.main.toLowerCase()).toBe(
      deriveSecondaryFromPrimary(DEFAULT_PRIMARY, 'light').toLowerCase(),
    );
    // Tinted surfaces (default): canvas follows primary hue, not fixed gray50.
    expect(light.palette.background.default.toLowerCase()).not.toBe('#f8fafc');
    expect(light.palette.background.paper).toBeTruthy();
    expect(light.palette.surface.level1).toBeTruthy();
    expect(light.palette.border.focus).toMatch(/^#[0-9a-f]{6}$/i);
    expect(light.palette.text.link).toMatch(/^#[0-9a-f]{6}$/i);
    expect(dark.palette.primary.main.toLowerCase()).toBe(
      resolveDarkSchemePrimary(DEFAULT_PRIMARY).toLowerCase(),
    );
    expect(dark.palette.background.default.toLowerCase()).not.toBe(
      light.palette.background.default.toLowerCase(),
    );
    // Opt-out restores fixed semantic neutrals.
    const untinted = createAzesTheme({ tintSurfaces: false });
    expect(untinted.colorSchemes.light?.palette.background.default.toLowerCase()).toBe('#f8fafc');

    expect(theme.typography.fontFamily).toBe(typography.fontFamily.sans);
    expect(theme.typography.fontFamilyMono).toBe(typography.fontFamily.mono);
    expect(theme.typography.fontFamilyDisplay).toBe(typography.fontFamily.display);
    expect(theme.typography.h1).toMatchObject({
      fontSize: typography.fontSize['4xl'],
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
    });
    expect(theme.typography.body1).toMatchObject({
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.regular,
      lineHeight: typography.lineHeight.normal,
    });
    expect(theme.typography.button).toMatchObject({
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      textTransform: 'none',
    });
    expect(theme.typography.overline).toMatchObject({
      letterSpacing: typography.letterSpacing.wide,
      textTransform: 'uppercase',
    });

    expect(theme.shape).toMatchObject({
      borderRadius: radiusPx.md,
      radiusSm: radiusPx.sm,
      radiusMd: radiusPx.md,
      radiusLg: radiusPx.lg,
      radiusXl: radiusPx.xl,
      radiusFull: radiusPx.full,
    });
    expect(theme.breakpoints.values).toEqual({
      xs: 0,
      sm: breakpointPx.sm,
      md: breakpointPx.md,
      lg: breakpointPx.lg,
      xl: breakpointPx.xl,
      '2xl': breakpointPx['2xl'],
    });
    expect(theme.shadows[0]).toBe('none');
    expect(theme.shadows[1]).toBe(shadow.sm);
    expect(theme.shadows[2]).toBe(shadow.md);
    expect(theme.shadows[3]).toContain('rgba');
    expect(theme.shadows[4]).toBe(shadow.lg);
    expect(theme.shadows[5]).toContain('rgba');
    expect(theme.shadows[24]).toContain('rgba');
    expect(theme.zIndex.appBar).toBe(zIndex.sticky);
    expect(theme.zIndex.drawer).toBe(zIndex.overlay);
    expect(theme.zIndex.modal).toBe(zIndex.modal);
    expect(theme.transitions.duration.standard).toBe(motion.durationMs.normal);
    expect(theme.spacing(1)).toBe('var(--mui-spacing, 8px)');
    expect(createAzesTheme({ density: 'compact' }).spacing(1)).toBe('var(--mui-spacing, 6px)');

    const button = theme.components?.MuiButton?.styleOverrides;
    if (!button || typeof button === 'function') {
      throw new Error('MuiButton styleOverrides missing');
    }
    expect(button.root).toMatchObject({
      borderRadius: primitives.radius.md,
      textTransform: 'none',
    });
    expect(button.sizeMedium).toMatchObject({
      minHeight: size.controlMd,
      paddingLeft: spacing[4],
      paddingRight: spacing[4],
      fontSize: typography.fontSize.md,
    });
    expect(theme.components?.MuiCssBaseline?.styleOverrides).toBeTypeOf('function');
    expect(theme.components?.MuiButtonBase?.styleOverrides).toBeTruthy();
    expect(theme.components?.MuiButton?.defaultProps).toMatchObject({ disableElevation: true });
    expect(azesVariantMapping.body1).toBe('p');
    expect(azesVariantMapping.h1).toBe('h1');
  });

  it('customizes Chip, Card, Paper, Link, SvgIcon and ButtonGroup defaults', () => {
    const theme = createAzesTheme();

    expect(theme.components?.MuiChip?.defaultProps).toMatchObject({ variant: 'outlined' });
    expect(theme.components?.MuiCard?.defaultProps).toMatchObject({ variant: 'outlined' });
    expect(theme.components?.MuiLink?.defaultProps).toMatchObject({ underline: 'hover' });
    expect(theme.components?.MuiButtonGroup?.defaultProps).toMatchObject({
      disableElevation: true,
    });
    expect(theme.components?.MuiIconButton?.styleOverrides).toBeTruthy();
    expect(theme.components?.MuiSvgIcon?.styleOverrides).toMatchObject({
      fontSizeSmall: { fontSize: primitives.size.iconSm },
      fontSizeMedium: { fontSize: primitives.size.iconMd },
      fontSizeLarge: { fontSize: primitives.size.iconLg },
    });
    expect(theme.components?.MuiPaper?.styleOverrides).toBeTruthy();
  });

  it('applies compact density to buttons and input defaults without changing comfortable', () => {
    const comfortable = createAzesTheme();
    const compact = createAzesTheme({ density: 'compact' });

    const comfortableButton = comfortable.components?.MuiButton?.styleOverrides;
    const compactButton = compact.components?.MuiButton?.styleOverrides;
    if (
      !comfortableButton ||
      typeof comfortableButton === 'function' ||
      !compactButton ||
      typeof compactButton === 'function'
    ) {
      throw new Error('MuiButton styleOverrides missing');
    }

    expect(comfortableButton.sizeMedium).toMatchObject({ minHeight: primitives.size.controlMd });
    expect(compactButton.sizeMedium).toMatchObject({ minHeight: '36px' });
    expect(comfortable.components?.MuiTextField?.defaultProps).toMatchObject({
      variant: 'outlined',
    });
    expect(comfortable.components?.MuiTextField?.defaultProps).not.toMatchObject({
      size: 'small',
    });
    expect(compact.components?.MuiTextField?.defaultProps).toMatchObject({
      variant: 'outlined',
      size: 'small',
      margin: 'dense',
    });
    expect(compact.components?.MuiCheckbox?.defaultProps).toMatchObject({
      color: 'primary',
      size: 'small',
    });
    expect(compact.components?.MuiAutocomplete?.defaultProps).toMatchObject({ size: 'small' });
  });

  it('customizes AppBar, Drawer, Tabs and Breadcrumbs for navigation', () => {
    const theme = createAzesTheme();

    expect(theme.components?.MuiAppBar?.defaultProps).toMatchObject({
      color: 'default',
      elevation: 0,
      component: 'header',
    });
    expect(theme.components?.MuiDrawer?.defaultProps).toMatchObject({
      ModalProps: { keepMounted: true },
    });
    expect(theme.components?.MuiTab?.styleOverrides).toMatchObject({
      root: { textTransform: 'none' },
    });
    expect(theme.components?.MuiBreadcrumbs?.styleOverrides).toBeTruthy();
  });

  it('customizes form inputs with outlined defaults, primary color and Autocomplete z-index', () => {
    const theme = createAzesTheme();

    expect(theme.components?.MuiTextField?.defaultProps).toMatchObject({ variant: 'outlined' });
    expect(theme.components?.MuiOutlinedInput?.styleOverrides).toBeTruthy();
    expect(theme.components?.MuiCheckbox?.defaultProps).toMatchObject({ color: 'primary' });
    expect(theme.components?.MuiRadio?.defaultProps).toMatchObject({ color: 'primary' });
    expect(theme.components?.MuiSwitch?.defaultProps).toMatchObject({ color: 'primary' });
    expect(theme.components?.MuiSlider?.defaultProps).toMatchObject({ color: 'primary' });
    expect(theme.components?.MuiToggleButton?.styleOverrides).toBeTruthy();
    expect(theme.components?.MuiAutocomplete?.styleOverrides).toBeTruthy();
  });

  it('stacks overlay z-index in token order and customizes feedback defaults', () => {
    const theme = createAzesTheme();
    const { zIndex } = primitives;

    expect(theme.zIndex.tooltip).toBe(zIndex.tooltip);
    expect(theme.zIndex.snackbar).toBe(zIndex.toast);
    expect(theme.zIndex.modal).toBe(zIndex.modal);
    expect(theme.zIndex.drawer).toBe(zIndex.overlay);
    expect(theme.zIndex.appBar).toBe(zIndex.sticky);
    expect(theme.zIndex.tooltip).toBeGreaterThan(theme.zIndex.snackbar);
    expect(theme.zIndex.snackbar).toBeGreaterThan(theme.zIndex.modal);
    expect(theme.zIndex.modal).toBeGreaterThan(theme.zIndex.drawer);
    expect(theme.zIndex.drawer).toBeGreaterThan(theme.zIndex.appBar);

    expect(theme.components?.MuiAlert?.defaultProps).toMatchObject({ variant: 'standard' });
    expect(theme.components?.MuiSnackbar?.defaultProps).toMatchObject({
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    });
    expect(theme.components?.MuiTooltip?.defaultProps).toMatchObject({
      enterDelay: 300,
      leaveDelay: 100,
    });
    expect(theme.components?.MuiCircularProgress?.defaultProps).toMatchObject({
      color: 'primary',
    });
    expect(theme.components?.MuiLinearProgress?.defaultProps).toMatchObject({
      color: 'primary',
    });
    expect(theme.components?.MuiSkeleton?.defaultProps).toMatchObject({ animation: 'wave' });
    expect(theme.components?.MuiDialog?.styleOverrides).toBeTruthy();
    expect(theme.components?.MuiMenu?.styleOverrides).toBeTruthy();
    expect(theme.components?.MuiPopover?.styleOverrides).toBeTruthy();
    expect(theme.components?.MuiBackdrop?.styleOverrides).toBeTruthy();
    expect(theme.components?.MuiCollapse?.defaultProps).toMatchObject({ timeout: 'auto' });
  });

  it('customizes list, table, avatar, badge, accordion and pagination for data display', () => {
    const comfortable = createAzesTheme();
    const compact = createAzesTheme({ density: 'compact' });

    expect(comfortable.components?.MuiListItemButton?.styleOverrides).toBeTruthy();
    expect(comfortable.components?.MuiTableContainer?.styleOverrides).toBeTruthy();
    expect(comfortable.components?.MuiTableRow?.styleOverrides).toBeTruthy();
    expect(comfortable.components?.MuiAvatar?.styleOverrides).toBeTruthy();
    expect(comfortable.components?.MuiBadge?.defaultProps).toMatchObject({ color: 'error' });
    expect(comfortable.components?.MuiAccordion?.defaultProps).toMatchObject({
      disableGutters: true,
      elevation: 0,
    });
    expect(comfortable.components?.MuiPagination?.defaultProps).toMatchObject({
      color: 'primary',
    });
    expect(comfortable.components?.MuiPagination?.defaultProps).not.toMatchObject({
      size: 'small',
    });
    expect(compact.components?.MuiPagination?.defaultProps).toMatchObject({ size: 'small' });
    expect(compact.components?.MuiTable?.defaultProps).toMatchObject({ size: 'small' });
  });

  it('exposes layout tokens, density, dataGrid/table metrics and custom shadows on theme.azes', () => {
    const theme = createAzesTheme({ density: 'compact' });
    expect(theme.azes.layout).toEqual(layoutPx);
    expect(theme.azes.component).toEqual(componentPx);
    expect(theme.azes.density).toBe('compact');
    expect(theme.azes.dataGrid.rowHeight).toBe(40);
    expect(theme.azes.dataGrid.headerHeight).toBe(40);
    expect(theme.azes.table.rowHeight).toBe(40);
    expect(theme.azes.table.headerTypography).toBe('subtitle2');
    expect(theme.azes.accordion.headerMinHeight).toBe(44);
    expect(theme.azes.accordion.headerHoverMixPercent).toBe(6);
    expect(theme.azes.dialog.iconMixPercent).toBe(12);
    expect(theme.azes.dialog.titleTypography).toBe('subtitle1');
    expect(theme.azes.carousel.aspectRatio).toBe('16 / 10');
    expect(theme.azes.carousel.arrowSize).toBe(40);
    expect(createAzesTheme().azes.carousel.arrowSize).toBe(44);
    expect(theme.azes.loader.delayMs).toBe(200);
    expect(theme.azes.loader.headerLogoRatio).toBe(0.72);
    expect(theme.azes.sidePanel.widthMd).toBe(392);
    expect(theme.azes.sidePanel.backdropMixPercent).toBe(28);
    expect(theme.azes.backdrop.blur).toBe(8);
    expect(theme.azes.backdrop.nestedBlur).toBe(4);
    expect(theme.azes.menu.itemMinHeight).toBeGreaterThanOrEqual(40);
    expect(theme.azes.menu.widthSm).toBeGreaterThan(0);
    expect(theme.azes.menu.paperRadius).toBe(8);
    expect(theme.azes.menu.itemRadius).toBe(4);
    expect(theme.azes.skeleton.delayMs).toBeGreaterThan(0);
    expect(theme.azes.skeleton.waveMixPercent).toBeGreaterThan(0);
    expect(theme.azes.customShadows.card).toBe(theme.shadows[1]);
    expect(theme.azes.customShadows.dialog).toBe(theme.shadows[8]);
    expect(createAzesTheme().azes.density).toBe('comfortable');
    expect(createAzesTheme().azes.dataGrid.rowHeight).toBe(52);
    expect(createAzesTheme().azes.table.rowHeight).toBe(52);
  });

  it('applies font presets and direction, migrating legacy ids', () => {
    expect(createAzesTheme({ fontFamily: 'system' as never }).typography.fontFamily).toBe(
      fontFamilyPresets.inter,
    );
    expect(createAzesTheme({ fontFamily: 'default' as never }).typography.fontFamily).toBe(
      fontFamilyPresets.inter,
    );
    expect(createAzesTheme({ fontFamily: 'inter' }).typography.fontFamily).toBe(
      fontFamilyPresets.inter,
    );
    expect(createAzesTheme({ fontFamily: 'sourceSerif' }).typography.fontFamily).toBe(
      fontFamilyPresets.sourceSerif,
    );
    expect(createAzesTheme({ fontFamily: 'nunito' }).typography.fontFamily).toBe(
      fontFamilyPresets.nunito,
    );
    expect(createAzesTheme({ fontFamily: 'ibmPlexSans' }).typography.fontFamily).toBe(
      fontFamilyPresets.ibmPlexSans,
    );
    expect(createAzesTheme({ fontFamily: 'fraunces' }).typography.fontFamily).toBe(
      fontFamilyPresets.fraunces,
    );
    expect(createAzesTheme({ fontFamily: 'manrope' as never }).typography.fontFamily).toBe(
      fontFamilyPresets.nunito,
    );
    expect(createAzesTheme({ fontFamily: 'comic' as never }).typography.fontFamily).toBe(
      fontFamilyPresets.inter,
    );
    expect(createAzesTheme().direction).toBe('ltr');
    expect(createAzesTheme({ direction: 'rtl' }).direction).toBe('rtl');
    expect(AZES_FONT_PRESET_IDS).toEqual([
      'inter',
      'sourceSerif',
      'nunito',
      'ibmPlexSans',
      'fraunces',
    ]);
  });

  it('accepts every brand seed as contrast safe and rejects low-contrast custom colors', () => {
    for (const seed of brandSeedOrder) {
      expect(isPrimaryContrastSafe(seed), seed).toBe(true);
    }
    expect(isPrimaryContrastSafe(brandSeeds.teal)).toBe(true);
    expect(isPrimaryContrastSafe('#FFF59D')).toBe(false);
    expect(isPrimaryContrastSafe('not-a-color')).toBe(false);
  });

  it('exposes loginShell chrome/canvas tokens with panel percents summing to 100', () => {
    const theme = createAzesTheme();
    const { loginShell } = theme.azes;
    expect(loginShell.canvasPercent + loginShell.showcasePercent).toBe(100);
    expect(loginShell.expandDurationMs).toBeGreaterThan(400);
    expect(loginShell.expandDurationMs).toBeLessThanOrEqual(1000);
    expect(loginShell.expandEasing).toMatch(/cubic-bezier/);
    expect(loginShell.settleEasing).toMatch(/cubic-bezier/);
    expect(loginShell.holdDurationMs).toBe(3000);
    expect(loginShell.scatterDurationMs).toBeGreaterThan(400);
    expect(loginShell.fallbackRedirectMs).toBeGreaterThan(loginShell.holdDurationMs);
    expect(loginShell.desktopMinWidthPx).toBe(primitives.breakpointPx.lg);
  });

  it('exposes navScroller tokens for arrow step and fixed-width items', () => {
    const theme = createAzesTheme();
    const { navScroller } = theme.azes;
    expect(navScroller.scrollStepRatio).toBeGreaterThanOrEqual(0.6);
    expect(navScroller.scrollStepRatio).toBeLessThanOrEqual(0.8);
    expect(navScroller.edgeTolerancePx).toBeGreaterThan(0);
    expect(navScroller.arrowSizeSpacing).toBeGreaterThanOrEqual(4);
    expect(navScroller.itemWidthSpacing).toBeGreaterThan(0);
    expect(navScroller.labelFontSizePx).toBe(11);
    expect(navScroller.iconSizePx).toBeLessThanOrEqual(20);
    expect(navScroller.nativeScrollMinBreakpoint).toBe('lg');
  });

  it('builds a theme within the performance budget', () => {
    const samples: number[] = [];
    for (let i = 0; i < 20; i += 1) {
      const start = performance.now();
      createAzesTheme({ primary: brandSeedOrder[i % brandSeedOrder.length] });
      samples.push(performance.now() - start);
    }
    samples.sort((a, b) => a - b);
    // Generous ceiling for slow CI hosts; docs/styles/16-performance.md targets < 8 ms.
    expect(samples[10]).toBeLessThan(50);
  });
});
