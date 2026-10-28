/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/design-tokens/src/primitives/layout.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-28
 * ║ Purpose: Application layout dimensions — L-shell + content sidebar width
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** Shell dimensions shared by every web layout. Values are CSS px. */
export const layoutPx = {
  /** App bar / rail brand row / mini chrome row height. */
  headerHeightMobile: 56,
  headerHeightDesktop: 56,
  navVerticalWidth: 280,
  /** Mini rail width — matches header / toolbar chrome (56×56). */
  navMiniWidth: 56,
  navMobileWidth: 288,
  /** Horizontal menus toolbar strip height (Apps row). */
  navHorizontalHeight: 56,
  /**
   * In-content module/section sidebar (`AzesMainSidebar`).
   * Published as `--azes-layout-content-sidebar-width`.
   */
  contentSidebarWidth: 240,
  contentMaxWidth: 1280,
  pagePaddingXs: 16,
  pagePaddingMd: 24,
  pagePaddingLg: 32,
  settingsDrawerWidth: 360,
  authCardWidth: 440,
  /**
   * Outer inset for floating chrome variants. L-joined Adobe shell uses 0
   * (sidebar/header flush to the viewport; published as `--azes-layout-chrome-gap`).
   */
  chromeGap: 0,
  /** Outer corner radius reserved for floating chrome cards (non L-join). */
  chromeRadius: 16,
  /** Concave join radius where sidebar meets header/content (Adobe scoop). */
  chromeJoinRadius: 24,
} as const;

/** Component-level sizes that change with density. Values are CSS px. */
export const componentPx = {
  controlHeight: { comfortable: 40, compact: 32 },
  navItemHeight: { comfortable: 44, compact: 36 },
  navSubItemHeight: { comfortable: 36, compact: 32 },
  /** Mini rail item row — matches header / toolbar chrome height. */
  navMiniItemHeight: { comfortable: 56, compact: 56 },
  navIconSize: 22,
  headerIconButtonSize: 40,
} as const;

export type LayoutPx = typeof layoutPx;
export type ComponentPx = typeof componentPx;
