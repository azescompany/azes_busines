<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/ACCESSIBILITY.md
║ Author: AZES_COMPANY
║ Created: 2026-10-02
║ Updated: 2026-10-02
║ Purpose: Accessibility requirements for the web theme and showcase
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Accessibility

Target: WCAG 2.2 AA for every themed component in both color schemes and both densities.

## Already in place

- Focus ring on `ButtonBase:focus-visible`: 3px `color-mix` of primary at 35%.
- Reduced motion: `CssBaseline` shortens animations and transitions when
  `prefers-reduced-motion: reduce` is set.
- `contrastText` comes from MUI `getContrastText`.
- Mode follows the system by default.

## Requirements

| Area        | Requirement                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Contrast    | Text 4.5:1, large text and UI parts 3:1, in light and dark, for every brand seed                                                |
| Focus       | Visible ring on every interactive part, including inputs (P7) and list items (P9). Never `outline: none` without a replacement. |
| Target size | At least 24×24 CSS px in compact density                                                                                        |
| Keyboard    | All showcase demos usable with a keyboard. Drawer, Dialog and Menu return focus.                                                |
| Names       | IconButtons have `aria-label`. Mini drawer items keep names.                                                                    |
| Motion      | Skeleton wave and Collapse respect reduced motion                                                                               |
| Color       | Status is never conveyed by color alone. Alerts keep their icons.                                                               |

## Testing

- Unit: contrast assertions in `createAzesTheme.test.ts` for each seed and scheme
  (`getContrastRatio` from `@mui/material/styles`), plus body/status contrast and compact
  target size (≥ 24px).
- Component: Testing Library queries by role and name in the showcase tests (skip link, dialog,
  Focus and contrast section).
- Automated audit: Phase 11 evaluated `axe-core` and **declined** adding it (no explicit
  dependency approval; avoids showcase-only install/noise cost). Fallback: manual axe
  browser-extension pass.
- Manual checklist (record when run in a browser):
  - [ ] Keyboard pass on showcase in light and dark
  - [ ] 200% zoom pass on showcase in both schemes
  - [ ] axe DevTools extension: no serious/critical issues on Overview, Inputs, Dialogs,
        Focus and contrast
