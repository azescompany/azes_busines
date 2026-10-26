<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/11-responsive.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Breakpoints, layout behavior per breakpoint and responsive rules
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Responsive

## Breakpoints

| Key   | Min width | Source                |
| ----- | --------- | --------------------- |
| `xs`  | 0         | MUI                   |
| `sm`  | 640       | `breakpointPx.sm`     |
| `md`  | 768       | `breakpointPx.md`     |
| `lg`  | 1024      | `breakpointPx.lg`     |
| `xl`  | 1280      | `breakpointPx.xl`     |
| `2xl` | 1536      | `breakpointPx['2xl']` |

These differ from MUI defaults. Use only these keys; never write raw pixel media queries.

## Layout per breakpoint

| Range       | Header            | Navigation                     | Content                        |
| ----------- | ----------------- | ------------------------------ | ------------------------------ |
| `xs`–`md`   | 64px, menu button | `AzesMobileNav` drawer (288px) | page padding 16 / 24           |
| `lg`        | 72px              | vertical / mini / horizontal   | page padding 32                |
| `xl`, `2xl` | 72px              | same                           | fixed container caps at 1280px |

`layoutQuery` (default `lg`) is the one breakpoint where layouts switch from mobile to desktop.

## Rules

- Mobile first: `sx={{ p: { xs: 4, md: 6 } }}` and `theme.breakpoints.up()`.
- Prefer CSS (`display: { xs: 'none', lg: 'flex' }`) over `useMediaQuery`. Use the hook only
  when the component tree must change (drawer variant). Layouts do this.
- SSR: `useMediaQuery` returns `defaultMatches` on the server. Prefer CSS so markup matches.
- Dialogs: `fullScreen` below `sm`.
- Tables: `TableContainer` scrolls horizontally below `md`; the data grid scrolls inside
  `AzesMainContent`.
- Touch targets stay at least 24×24px in compact density and 40px in comfortable.

## Checks

- `apps/**` and `packages/ui-web/src/**` contain no raw px `@media` rules (only
  `prefers-reduced-motion`).
- Visual QA viewports: 360, 768, 1024, 1440 (15).
