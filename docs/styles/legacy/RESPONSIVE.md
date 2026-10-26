<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/RESPONSIVE.md
║ Author: AZES_COMPANY
║ Created: 2026-10-02
║ Updated: 2026-10-02
║ Purpose: Breakpoints and responsive rules for web products
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Responsive

## Breakpoints

| Key   | Min width | Source                            |
| ----- | --------- | --------------------------------- |
| `xs`  | 0         | MUI                               |
| `sm`  | 640       | `breakpointPx.sm`                 |
| `md`  | 768       | `breakpointPx.md`                 |
| `lg`  | 1024      | `breakpointPx.lg`                 |
| `xl`  | 1280      | `breakpointPx.xl`                 |
| `2xl` | 1536      | `breakpointPx['2xl']` (augmented) |

These differ from MUI defaults (600/900/1200/1536). Use only the keys above. Never write raw
pixel media queries.

## Rules

- Mobile first: use `sx` objects like `{ xs: ..., md: ... }` and `theme.breakpoints.up()`.
- Prefer CSS (`sx` breakpoints, `display: { xs: 'none', md: 'block' }`) over `useMediaQuery`.
  Use the hook only when the component tree must change (drawer variant).
- In SSR (realestate), `useMediaQuery` returns `defaultMatches` (default `false`) on the server
  and on the first client render. Set `defaultMatches` for the likely device, or prefer the CSS
  approach so the markup matches.
- Dialogs: `fullScreen` below `sm`.
- Tables: wrap them in `TableContainer` with horizontal scroll below `md`. Card-list
  alternatives are app-level decisions.
- Navigation collapse rules are in [NAVIGATION.md](NAVIGATION.md).

## Phase 10 checks

- Grep for raw `@media` and px breakpoints in apps and ui-web. Expect zero outside the
  `CssBaseline` / Skeleton `prefers-reduced-motion` rules.
- Showcase viewport presets (360, 768, 1024, 1440) in Theme Lab, and a browser check at each.

### Phase 10 audit (2026-10-02)

- `apps/**`: no `@media` or raw px media queries.
- `packages/ui-web/src/**`: only `prefers-reduced-motion` in `baseline.ts` and `feedback.ts`
  (Skeleton). No pixel breakpoint media queries.
- Theme Lab Viewport control frames the showcase shell; drawer/AppBar stay inside the frame.
  Dialogs use `fullScreen` below `sm` (and when the 360 preset is active).
