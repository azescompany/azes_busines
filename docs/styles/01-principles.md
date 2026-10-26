<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/01-principles.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Non-negotiable principles, forbidden libraries and the style decision hierarchy
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Principles

## 1. MUI is the web UI foundation

- MUI, MUI System, the MUI theme, CSS theme variables, `sx`, `styled`, `GlobalStyles`,
  variants, `defaultProps`, `styleOverrides`, slots and `slotProps`, `@mui/icons-material` and
  MUI X (community tier) are the only styling tools.
- Emotion is allowed only as MUI's engine.
- AZES does not build a second styling framework on top of MUI.

## 2. Forbidden in the web UI

Tailwind, shadcn/ui, Radix UI, Bootstrap, Chakra, Ant Design, Mantine, styled-components,
vanilla-extract, CSS Modules as component styling, framer-motion, ApexCharts, Iconify and any
other CSS framework or design-system library. `pnpm architecture:verify`
(`forbidden-libraries`) fails if one appears in a `package.json`.

## 3. Configure before you wrap

Follow this order. Stop at the first level that solves the problem.

```text
Global decision (this file)
  -> Tokens and theme (03, 04)
    -> theme.components: styleOverrides, defaultProps, variants (04)
      -> Reusable AZES component (07)
        -> sx, for local composition only
```

A permanent design rule never lives in an `sx` prop. If two screens repeat the same `sx`, it
moves up a level.

## 4. AZES-owned, Minimal-inspired

Principles taken from the Minimal dashboard and rebuilt independently:

| Principle                                       | Why it works                                | AZES version                                                   | AZES difference                                        |
| ----------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| One layout section with header, nav, main slots | Every layout shares scroll and sizing logic | `AzesDashboardLayout`, `AzesMainLayout`, `AzesAuthLayout` (08) | Slots are typed props, not render callbacks            |
| Layout sizes as CSS variables                   | One change re-sizes header, nav and main    | `--azes-layout-*` from tokens (03, 08)                         | Values come from `@azes/design-tokens`, never literals |
| Navigation as data                              | Config is testable and filterable           | `AzesNavConfig` (09)                                           | Access is an injected contract; depth limit of 3       |
| Settings drawer applies live                    | Fast visual evaluation, user preference     | `AzesSettingsDrawer` (10)                                      | Versioned, field-validated storage; apps can lock keys |
| Header blurs and elevates on scroll             | Content stays readable under the header     | `AzesHeader` `elevateOnScroll` (08)                            | Uses `useScrollTrigger`, respects reduced motion       |
| `theme.vars` everywhere                         | Light/dark switch without theme rebuild     | All overrides use `theme.vars` (04)                            | `color-mix()` instead of JS alpha helpers              |

Minimal's dependencies (Iconify, ApexCharts, framer-motion, simplebar, sonner, swr) are not
used. AZES uses MUI equivalents (19).

## 5. Restraint ("do not build" list)

- No Pigment CSS, no Tailwind bridge, no second token pipeline (Style Dictionary is deferred).
- No Theme Lab or settings drawer in product bundles unless the product opts in.
- No wrapper whose only job is renaming a MUI component.
- No MUI X Pro or Premium features without a new ADR and a license.
- No `@mui/lab` without an ADR.
- No animation library. MUI transitions only.

## 6. Accessibility and performance are requirements

Every component meets WCAG 2.2 AA in both schemes and both densities (12). Every subpath has a
measured bundle budget (16).
