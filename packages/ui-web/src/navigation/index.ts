/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/navigation/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-11
 * ║ Purpose: Public entry point for @azes/ui-web/navigation
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import '../theme/mui-augment';

export {
  AzesNavProvider,
  useActiveTrail,
  useAzesRouter,
  useFilteredNav,
  type AzesNavProviderProps,
} from './AzesNavProvider';
export { AzesNavList, type AzesNavListProps } from './AzesNavList';
export { AzesNavMiniList, type AzesNavMiniListProps } from './AzesNavMiniList';
export { AzesNavHorizontalBar, type AzesNavHorizontalBarProps } from './AzesNavHorizontalBar';
export { AzesNavScroller, type AzesNavScrollerProps } from './AzesNavScroller';
export { navToneVars, navToolbarGradient, type AzesNavTone } from './navStyles';
export {
  filterNav,
  hasNavAccess,
  isNavItemActive,
  limitNavDepth,
  resolveActiveTrail,
} from './nav-utils';
export {
  MAX_NAV_DEPTH,
  type AzesAccessContext,
  type AzesNavAccess,
  type AzesNavBadge,
  type AzesNavBadgeColor,
  type AzesNavConfig,
  type AzesNavGroup,
  type AzesNavItem,
  type AzesNavMatch,
  type AzesRouterAdapter,
} from './types';
