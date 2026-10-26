<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/09-navigation.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-11
║ Purpose: Navigation schema, access filtering, active matching, renderers and router adapter
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Navigation

Navigation is data. Rendering is independent of configuration (ADR-011).

## Schema

```ts
type AzesNavAccess = {
  permissions?: readonly string[]; // any-of, `resource.action`
  roles?: readonly string[]; // any-of
  featureFlag?: string;
};

type AzesNavBadge = {
  content: ReactNode;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
};

type AzesNavItem = {
  id: string;
  title: string; // already translated
  caption?: string; // secondary line / tooltip text
  path?: string; // internal route
  externalHref?: string; // opens in new tab with rel="noopener noreferrer"
  icon?: ReactNode;
  badge?: AzesNavBadge;
  disabled?: boolean;
  match?: 'exact' | 'prefix' | ((pathname: string) => boolean); // default 'prefix' ('exact' for '/')
  access?: AzesNavAccess;
  children?: readonly AzesNavItem[]; // maximum depth 3
};

type AzesNavGroup = {
  id: string;
  subheader?: string;
  items: readonly AzesNavItem[];
  access?: AzesNavAccess;
};
type AzesNavConfig = readonly AzesNavGroup[];
```

## Access filtering

```ts
filterNav(config: AzesNavConfig, access?: AzesAccessContext): AzesNavConfig;
```

- Pure function. With no access context, everything passes.
- An item is kept when every present field passes: permissions any-of, roles any-of, flag on.
- A parent with children is dropped when all its children are filtered out and it has no own
  `path`. Empty groups are dropped.
- `useFilteredNav(config)` reads the access context from `AzesNavProvider` and memoizes on
  `[config, access]`. Keep `config` a module constant or memoize it in the app.

Permissions adapter in an app:

```ts
const checker = createPermissionChecker(session.permissions);
const access: AzesAccessContext = {
  can: (p) => checker.can(p as Permission),
  hasRole: (r) => session.roles.includes(r),
  isEnabled: (f) => flags[f] === true,
};
```

Navigation filtering is UX only. The backend stays the authority (`PERMISSIONS_BOUNDARY`).

## Active matching

- `isNavItemActive(item, pathname)`: `exact` compares paths; `prefix` matches the path or a
  `path/` prefix; a function decides itself.
- `resolveActiveTrail(config, pathname)` returns the ids from the root to the deepest active
  item. Renderers expand the trail and mark the leaf with `aria-current="page"`.

## Renderers

| Component              | Used by               | Behavior                                                  |
| ---------------------- | --------------------- | --------------------------------------------------------- |
| `AzesNavList`          | vertical + mobile nav | Ellipsis labels + overflow tooltip; active inset bar      |
| `AzesNavMiniList`      | mini / footer rail    | Icon + `Tooltip`, children open in a `Popover`            |
| `AzesNavHorizontalBar` | horizontal nav        | Fixed-width cells; ellipsis + overflow tooltip; scroller  |
| `AzesNavScroller`      | horizontal bar        | Hidden scrollbar; L/R arrows + edge fade when overflowing |

`railNav`: desktop dual chrome = mini-rail (Docs/AI). Mobile drawer = pinned
`data-azes-nav-footer`. Menus scroll in `data-azes-nav-menus`.

Items without an icon get a letter avatar in mini mode so they keep a visible target and an
accessible name.

## NavScroller (horizontal menus toolbar)

When top-level menu items do not fit the center column:

- Each cell has a fixed width (`theme.azes.navScroller.itemWidthSpacing`). Labels under icons
  use `text-overflow: ellipsis`; when truncated, hover/focus shows the full title via Tooltip
  (`useOverflowTitle`).
- The strip uses native horizontal overflow with a hidden scrollbar (`scrollbar-width: none`).
- Overlay chevron buttons scroll by `theme.azes.navScroller.scrollStepRatio` of the visible
  width via `scrollBy`. Arrows appear only when that edge still has content (`canScrollStart` /
  `canEnd`); when everything fits, arrows are not rendered.
- Soft edge fade (`mask-image`) on the side that still has overflow.
- Active (`aria-current="page"`) and focused items are brought into view inside the scroller
  only (no page scroll).
- RTL: logical inset for arrows, chevron icons swap, `scrollBy` sign flips.
- **Desktop web** (`nativeScrollMinBreakpoint`, default `lg+`): no arrows; thin native
  horizontal scrollbar is always visible when the strip overflows (stronger on hover).
  Parents must not clip it (`overflow` on the menus chrome is kept scroll-safe).
- **Tablet / `md`** (below that breakpoint when the toolbar is shown): arrow controls + edge
  fade. Mobile below the layout query keeps menus in the sidebar drawer.
- Arrow controls: `primary` fill, `1px solid secondary` border, white chevron icons.
- Tokens: `theme.azes.navScroller` (step/fade/cell metrics, `nativeScrollMinBreakpoint`,
  `scrollbarSizeSpacing`, `iconSizePx` / `labelFontSizePx`).
- Labels: layout `prevMenus` / `nextMenus` (admin i18n: `nav.prevMenus` / `nav.nextMenus`).
- Hold-to-repeat on arrows is not implemented (single click + native swipe/trackpad).

## Router adapter

```tsx
<AzesNavProvider router={{ pathname, LinkComponent: RouterLink }} access={access}>
```

- `LinkComponent` receives `href`. With no component, a plain `<a>` is used.
- Mobile nav closes when `pathname` changes.
- `azes-ui` uses a hash adapter (`#/section`).

## Rules and tests

- Depth above 3 logs a development warning and is cut at render time.
- Tests: filtering (permission, role, flag, empty parents), active matching, depth limit,
  keyboard operation of each renderer.
