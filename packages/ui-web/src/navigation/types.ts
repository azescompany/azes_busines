/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/navigation/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-05
 * ║ Purpose: Navigation schema, access context and router adapter contracts
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { ElementType, ReactNode } from 'react';

export const MAX_NAV_DEPTH = 3;

export type AzesNavAccess = {
  /** Any-of. `resource.action` strings checked with `AzesAccessContext.can`. */
  permissions?: readonly string[];
  /** Any-of. */
  roles?: readonly string[];
  featureFlag?: string;
};

export type AzesNavBadgeColor =
  'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

export type AzesNavBadge = { content: ReactNode; color?: AzesNavBadgeColor };

export type AzesNavMatch = 'exact' | 'prefix' | ((pathname: string) => boolean);

export type AzesNavItem = {
  id: string;
  /** Already translated label. */
  title: string;
  caption?: string;
  /** Internal route path, e.g. `/settings/profile`. */
  path?: string;
  /** External URL. Opens in a new tab. */
  externalHref?: string;
  /** Action-only item (no navigation). Prefer over `path` when both are set. */
  onClick?: () => void;
  icon?: ReactNode;
  badge?: AzesNavBadge;
  disabled?: boolean;
  /** Default `prefix` (`exact` for `/`). */
  match?: AzesNavMatch;
  access?: AzesNavAccess;
  /** Maximum depth is `MAX_NAV_DEPTH`; deeper levels are cut at render time. */
  children?: readonly AzesNavItem[];
};

export type AzesNavGroup = {
  id: string;
  subheader?: string;
  items: readonly AzesNavItem[];
  access?: AzesNavAccess;
};

export type AzesNavConfig = readonly AzesNavGroup[];

/** App-supplied access checks. Navigation filtering is UX only; the backend stays authoritative. */
export type AzesAccessContext = {
  can: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isEnabled: (featureFlag: string) => boolean;
};

/** App-supplied router integration. ui-web never imports a router. */
export type AzesRouterAdapter = {
  pathname: string;
  /** Rendered for internal links with an `href` prop. Default: `<a>`. */
  LinkComponent?: ElementType;
  /** Map a nav path to the link `href` (e.g. hash routing). Default: identity. */
  toHref?: (path: string) => string;
};
