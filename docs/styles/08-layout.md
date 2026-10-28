<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/08-layout.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-28
║ Purpose: Layout engine components, slots, dimensions, scroll and responsive behavior
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Layout

`@azes/ui-web/layout` gives every app the same shells, so no app builds its own header, nav or
content frame (ADR-011, superseding the v1 "no AppShell" decision).

## Components

| Component             | Role                                                                    |
| --------------------- | ----------------------------------------------------------------------- |
| `AzesDashboardLayout` | Header + desktop nav (vertical, mini or horizontal) + mobile nav + main |
| `AzesMainLayout`      | Header + main + footer, no side nav (marketing, public pages)           |
| `AzesAuthLayout`      | Centered or split card for sign-in flows                                |
| `AzesHeader`          | Sticky AppBar with `start`, `center`, `end`, `bottom` slots             |
| `AzesVerticalNav`     | Fixed side nav, full width                                              |
| `AzesMiniNav`         | Fixed side nav, icons only, tooltips and popover children               |
| `AzesHorizontalNav`   | Bar under the header with menu children                                 |
| `AzesMobileNav`       | Temporary drawer; closes when the pathname changes                      |
| `AzesMainContent`     | Container fixed or fluid (optional `constrain`), tokenized page padding |
| `AzesMainSidebar`     | In-content section/module nav (sticky `lg+`; drawer below) — not chrome |
| `AzesContentRail`     | Settings-aware inner column for full-bleed marketing pages              |
| `AzesFooter`          | Full-bleed chrome; Fixed/Fluid only on the inner content row            |
| `AzesLayoutVars`      | `GlobalStyles` that emits `--azes-layout-*` once                        |

## `AzesDashboardLayout`

```ts
type AzesDashboardLayoutProps = {
  nav: AzesNavConfig;
  children: ReactNode;
  navLayout?: 'vertical' | 'mini' | 'horizontal'; // default: settings
  navColor?: 'integrated' | 'contrast'; // default: settings
  container?: 'fluid' | 'fixed'; // default: settings
  layoutQuery?: Breakpoint; // default 'lg'
  slots?: {
    logo?: ReactNode;
    headerStart?: ReactNode;
    headerCenter?: ReactNode;
    headerEnd?: ReactNode;
    navTop?: ReactNode;
    navBottom?: ReactNode;
    footer?: ReactNode;
  };
  slotProps?: { header?: Partial<AzesHeaderProps>; main?: Partial<AzesMainContentProps> };
};
```

Settings values are defaults; props win. This lets the showcase follow the drawer while a
product can hard-wire one layout.

## Dimensions

All sizes come from `theme.azes.layout` (03), emitted as CSS variables:

```text
--azes-layout-header-height        64px, 72px at layoutQuery and up
--azes-layout-nav-width            280px vertical, 88px mini, 0 for horizontal/mobile
--azes-layout-nav-mobile-width     288px
--azes-layout-nav-horizontal-height 56px
--azes-layout-content-max-width    1280px
--azes-layout-content-sidebar-width 240px (AzesMainSidebar)
```

## `AzesMainSidebar`

In-page module/section menus inside the scoop (not L-shell `AzesVerticalNav`).

```ts
type AzesMainSidebarProps = {
  nav: AzesNavConfig;
  label: string;
  title?: ReactNode;
  header?: ReactNode;
  layoutQuery?: Breakpoint; // default 'lg'
  openMenuLabel?: string;
  closeMenuLabel?: string;
};
```

- Desktop (`lg+`): sticky aside, width `--azes-layout-content-sidebar-width`.
- Below `layoutQuery`: menu button + temporary Drawer.
- Apps pass already-translated module menus; shell chrome nav stays separate.
- **Ink:** always apply `navToneVars(theme, 'integrated')` on the sidebar root (and drawer
  paper). Chrome `contrast` vars cascade into the scoop; without reset, inactive
  `AzesNavList` labels are near-white on paper in light mode.

Components use the variables, never literal px. The audit check `layout-hardcoded-values`
rejects px literals in `packages/ui-web/src/layout`.

## Scroll and stickiness

- The document scrolls. The header is `position: sticky` at the top.
- Sidebar / drawer: **menus** scroll in `data-azes-nav-menus`; **footer** (`railNav` /
  Docs+AI) stays pinned in `data-azes-nav-footer` (never scrolls away with menus).
- Desktop navs are `position: fixed` with their own scroll area (`overflow-y: auto`,
  `scrollbar-width: thin`).
- The main column is offset by `--azes-layout-nav-width` with `padding-inline-start`, so it
  also works in RTL.
- `AzesMainContent` sets `min-width: 0` so wide children (data grid) scroll inside it instead
  of stretching the page.
- `AzesHeader` with `elevateOnScroll` adds a border and blurred surface after 8px of scroll
  (`useScrollTrigger`).

## Responsive behavior

| Width                      | Behavior                                                       |
| -------------------------- | -------------------------------------------------------------- |
| below `layoutQuery` (`lg`) | Menu button in header; `AzesMobileNav` drawer; no desktop nav  |
| `lg` and up                | Desktop nav from `navLayout`                                   |
| `xl`, `2xl`                | `container: 'fixed'` caps constrained main / `AzesContentRail` |

Breakpoints are the MUI keys from tokens, never arbitrary pixel media queries (11).

## Composition rules

- Apps pass data (nav config) and slots. They never fork layout components.
- Page content goes inside `AzesMainContent`; pages do not add their own outer padding.
- Do not nest two layouts.
