/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-28
 * ║ Purpose: Public entry point for @azes/ui-web/layout
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import '../theme/mui-augment';

export {
  AzesDashboardLayout,
  DEFAULT_AZES_LAYOUT_LABELS,
  hasPrimaryNavItems,
  type AzesDashboardLayoutProps,
  type AzesDashboardLayoutSlots,
  type AzesLayoutLabels,
} from './AzesDashboardLayout';
export { appsTriggerSx } from './appsTriggerSx';
export {
  AzesHeader,
  canChromeAutoConceal,
  CHROME_COLLAPSE_BUDGET_PX,
  CHROME_CONCEAL_EXIT_OVERFLOW_PX,
  CHROME_MIN_CONCEAL_OVERFLOW_PX,
  CHROME_MIN_HIDE_SCROLL_PX,
  CHROME_MOTION_MS,
  CHROME_OVERFLOW_BUFFER_PX,
  CHROME_SETTLE_MS,
  CHROME_SHOW_UP_PX,
  resolveBottomChromeLock,
  resolveChromeAutoHideLatch,
  resolveChromeShortPagePin,
  type AzesHeaderProps,
  type ChromeAutoHideLatchInput,
  type ChromeAutoHideLatchResult,
  type ChromeShortPagePinInput,
} from './AzesHeader';
export { AzesScrollToTop, type AzesScrollToTopProps } from './AzesScrollToTop';
export { AzesFullscreenButton, type AzesFullscreenButtonProps } from './AzesFullscreenButton';
export {
  useFullscreen,
  type UseFullscreenOptions,
  type UseFullscreenResult,
} from './useFullscreen';
export { AzesLayoutVars, layoutVarsSx, type AzesLayoutVarsProps } from './AzesLayoutVars';
export {
  AZES_MAIN_CONTENT_ID,
  AzesFooter,
  AzesMainContent,
  AzesSkipLink,
  type AzesFooterProps,
  type AzesMainContentProps,
  type AzesSkipLinkProps,
} from './AzesMainContent';
export { AzesMainSidebar, type AzesMainSidebarProps } from './AzesMainSidebar';
export { AzesContentRail, type AzesContentRailProps } from './AzesContentRail';
export {
  AzesHorizontalNav,
  AzesMobileNav,
  AzesVerticalNav,
  type AzesHorizontalNavProps,
  type AzesMobileNavProps,
  type AzesVerticalNavProps,
} from './AzesNavContainers';
export {
  AzesAuthLayout,
  AzesMainLayout,
  type AzesAuthLayoutProps,
  type AzesAuthLayoutSlots,
  type AzesMainLayoutProps,
} from './AzesSimpleLayouts';
