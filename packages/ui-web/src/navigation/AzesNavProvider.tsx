/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/navigation/AzesNavProvider.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Router adapter and access context provider with memoized navigation hooks
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createContext, useContext, useMemo, type ElementType, type ReactNode } from 'react';

import { filterNav, limitNavDepth, resolveActiveTrail } from './nav-utils';
import type { AzesAccessContext, AzesNavConfig, AzesNavItem, AzesRouterAdapter } from './types';

type NavContextValue = {
  router: Required<Pick<AzesRouterAdapter, 'pathname' | 'toHref'>> &
    Pick<AzesRouterAdapter, 'LinkComponent'>;
  access?: AzesAccessContext;
};

const identity = (path: string) => path;

const fallbackContext: NavContextValue = {
  router: { pathname: '/', toHref: identity },
};

const NavContext = createContext<NavContextValue>(fallbackContext);

export type AzesNavProviderProps = {
  router: AzesRouterAdapter;
  access?: AzesAccessContext;
  children: ReactNode;
};

export function AzesNavProvider({ router, access, children }: AzesNavProviderProps) {
  const { pathname, LinkComponent, toHref = identity } = router;
  const value = useMemo<NavContextValue>(
    () => ({ router: { pathname, LinkComponent, toHref }, access }),
    [pathname, LinkComponent, toHref, access],
  );
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useAzesRouter(): NavContextValue['router'] {
  return useContext(NavContext).router;
}

const isProduction =
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV ===
  'production';

function warnCut(id: string): void {
  if (!isProduction) {
    console.warn(
      `[azes/navigation] "${id}" exceeds the maximum depth; its children are not rendered.`,
    );
  }
}

/** Access-filtered, depth-limited config. Memoized on `[config, access]`. */
export function useFilteredNav(config: AzesNavConfig): AzesNavConfig {
  const { access } = useContext(NavContext);
  return useMemo(() => limitNavDepth(filterNav(config, access), warnCut), [config, access]);
}

export function useActiveTrail(config: AzesNavConfig): readonly string[] {
  const { pathname } = useAzesRouter();
  return useMemo(() => resolveActiveTrail(config, pathname), [config, pathname]);
}

export type NavLinkProps = {
  component: ElementType;
  href?: string;
  target?: string;
  rel?: string;
};

/** Props for rendering an item as a link through the router adapter. */
export function useNavLinkProps(): (item: AzesNavItem) => NavLinkProps | null {
  const { LinkComponent, toHref } = useAzesRouter();
  return useMemo(
    () => (item: AzesNavItem) => {
      if (item.externalHref) {
        return {
          component: 'a',
          href: item.externalHref,
          target: '_blank',
          rel: 'noopener noreferrer',
        };
      }
      if (item.path) return { component: LinkComponent ?? 'a', href: toHref(item.path) };
      return null;
    },
    [LinkComponent, toHref],
  );
}
