<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/ROADMAP.md
║ Author: AZES_COMPANY
║ Created: 2026-10-02
║ Updated: 2026-10-02
║ Purpose: Phased roadmap for the AZES MUI design system on the styles branch
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Roadmap

Work happens on the `styles` branch. Each phase needs explicit approval, is one logically
grouped set of commits, and ends with a WORKER.md update and a stop.

**Standard validation.** Every phase runs these existing commands. A phase is done only when
all of them pass and the phase's own acceptance criteria are met.

```text
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm format:check
pnpm architecture:verify
pnpm --filter @azes/azes-ui dev   # browser check on http://localhost:5177
```

**Standard rollback.** Revert the phase's commits on `styles` (`git revert <range>`). Phases do
not change public names in a way a later phase depends on without saying so, so a revert is
local to the phase.

**Versions.** `@mui/material` 9.3.1, `@emotion/react` 11.14.0 and `@emotion/styled` 11.14.1
stay as they are. See [BASELINE.md](BASELINE.md) for the documented discrepancies.

---

## Phase 0: Baseline and docs (COMPLETED)

- **Objective:** commit the MUI migration on `dev`, create `styles`, record the baseline, and
  write these docs.
- **Files:** `docs/styles/*`, `docs/styles/migration/*` (moved), `docs/architecture/ui-architecture.md`, `WORKER.md`.
- **Acceptance:** baseline green; docs reviewed; no runtime changes.

## Phase 1: Theme architecture (no visual change) — COMPLETED

- **Shipped:** `palette.ts`, `typography.ts`, `shadows.ts`, `density.ts` (comfortable button metrics only), and `components/{baseline,buttons,inputs,surfaces,feedback,data-display,index}.ts`. `CreateAzesThemeInput` is still `{ primary? }`. The parity test in `createAzesTheme.test.ts` was written against the monolith and still passes.

- **Objective:** split `createAzesTheme.ts` into palette, typography, shadows, density and
  component modules (layout in [THEME.md](THEME.md)).
- **Files:** `packages/ui-web/src/theme/**`.
- **Tasks:** move code without changing values; add a parity test that compares the key
  `palette`, `typography`, `shape`, `breakpoints` and `components` outputs for the default
  input against fixed expectations written before the split.
- **Acceptance:** the parity test passes; public exports from `@azes/ui-web` are unchanged
  (`index.test.ts`).
- **Risks:** an accidental value change. Mitigation: expectations are written before moving
  code.

## Phase 2: Light/dark and dynamic color — COMPLETED

- **Shipped:** `resolveBrandColor` / `resolveBrandSecondary`, optional `secondary` on
  `createAzesTheme` and `AzesThemeProvider`, `contrastThreshold: 4.5`, dark-scheme primary uses
  `*400` seeds when canvas contrast fails, contrast tests per seed, `colorSchemeScript.test.ts`,
  showcase Secondary control (demo state only).

- **Objective:** add a `secondary` input and make brand colors meet contrast in both schemes.
- **Files:** `theme/brand.ts`, `theme/palette.ts`, `theme/createAzesTheme.ts`,
  `AzesThemeProvider.tsx`, tests, `apps/azes-ui` (secondary control).
- **Tasks:** `resolveBrandColor`; `palette.contrastThreshold: 4.5`; dark-scheme seed
  adjustment when contrast fails; a test that the Vite pre-paint script and
  `InitColorSchemeScript` use the same attribute and storage key.
- **Acceptance:** contrast tests pass for all 5 seeds in both schemes; the default theme is
  unchanged except `contrastText` values that were below 4.5:1 (listed in the phase report).
- **Risks:** `contrastText` changes on existing buttons. Mitigation: list the changes and check
  account in the browser.

## Phase 3: Typography, spacing and density — COMPLETED

- **Shipped:** `density` input (`comfortable` | `compact`), `controlXs` token, full shadow ladder,
  `azesVariantMapping` export (MUI v9 has no theme-level mapping), showcase Density control.

- **Objective:** density presets and a full elevation ladder.
- **Files:** `theme/density.ts`, `theme/shadows.ts`, `theme/typography.ts`,
  `packages/design-tokens/src/primitives/sizing.ts` (adds `controlXs`), tests.
- **Tasks:** the `density` input and table from [LAYOUT.md](LAYOUT.md); interpolate the shadows
  1 to 24 from the `sm`/`md`/`lg` primitives; typography `variantMapping`.
- **Acceptance:** `comfortable` equals today's sizes; `compact` switches Button, TextField,
  List and Table sizes; native typecheck and tests still pass after the token addition.
- **Risks:** the token addition affects native. Mitigation: it is additive only; native tests run.

## Phase 4: Core component customization — COMPLETED

- **Shipped:** Button `disableElevation`, IconButton radius, ButtonGroup, Chip outlined + full
  radius, Card outlined + `radiusLg`, Paper outlined border, SvgIcon sizes from tokens, Link
  `text.link` + underline hover. Catalog adds `ButtonGroup`, `Link`, `SvgIcon`. No curated
  `@mui/icons-material` barrel (showcase keeps deep imports; products use `SvgIcon` or local SVGs).

- **Objective:** overrides for Button (finalize), IconButton, ButtonGroup, Chip, Paper, Card,
  SvgIcon and Link.
- **Files:** `theme/components/buttons.ts`, `surfaces.ts`, `data-display.ts`, `catalog.ts`.
- **Tasks:** defaultProps and styleOverrides per [COMPONENTS.md](COMPONENTS.md); decide the
  curated icon re-export.
- **Acceptance:** each override has a test; showcase sections render in both schemes and
  densities.

## Phase 5: Layout — COMPLETED

- **Shipped:** `Container` catalog export; showcase Layout sections (Container/Grid/Stack + app-shell
  recipe). **Decision:** no `AppShell` in `ui-web` until two product apps need it.

- **Objective:** Container, Grid and Stack conventions, and the app-shell recipe.
- **Files:** `catalog.ts` (Container), `apps/azes-ui` layout section.
- **Acceptance:** recipe documented and demoed; no `AppShell` in `ui-web` unless two products
  need it (recorded as a decision).

## Phase 6: AppBar, Drawer and navigation — COMPLETED

- **Shipped:** `theme/components/navigation.ts` (MuiAppBar/Drawer/Tabs/Tab/Breadcrumbs);
  catalog exports `Breadcrumbs`, `ListItemIcon`, `useScrollTrigger`. Showcase Theme Lab selects
  AppBar (static/sticky/fixed/transparent) and sidebar (permanent/collapsible/mini/temporary);
  mini drawer uses Tooltip + `aria-label`.

- **Objective:** all AppBar and Drawer modes from [NAVIGATION.md](NAVIGATION.md), plus Tabs and
  Breadcrumbs.
- **Files:** `theme/components/surfaces.ts`, `navigation.ts`, `catalog.ts` (Breadcrumbs, Link,
  useScrollTrigger, ListItemIcon), `apps/azes-ui` shell.
- **Acceptance:** each mode is selectable in the showcase; keyboard focus returns correctly;
  the mini drawer keeps accessible names.
- **Risks:** z-index conflicts. Mitigation: use only the mapped `zIndex` keys.

## Phase 7: Forms and inputs — COMPLETED

- **Shipped:** `inputs.ts` overrides for TextField (outlined), OutlinedInput focus/error/disabled,
  Checkbox/Radio/Switch primary, Slider, ToggleButton selected primary mix, Autocomplete popper
  `zIndex.modal` + compact option density. Catalog adds Autocomplete, Checkbox, Radio/RadioGroup,
  Slider, ToggleButton(Group), FormHelperText, InputAdornment. Showcase Inputs/Forms demos +
  Autocomplete inside Dialog.

- **Objective:** overrides for TextField and OutlinedInput, Select, Checkbox, Radio, Switch,
  Slider, ToggleButton and Autocomplete.
- **Acceptance:** focus, error and disabled states are visible in both schemes; density applies.
- **Risks:** Autocomplete popper z-index; test inside a Dialog.

## Phase 8: Feedback and overlays — COMPLETED

- **Shipped:** `feedback.ts` for Alert (standard + radius), Snackbar bottom-center, Dialog
  radiusLg, Tooltip inverse surface + delays, Menu/Popover paper, Progress primary, Skeleton wave
  off under reduced motion, Backdrop scrim, Collapse timeout. Catalog adds AlertTitle, Backdrop,
  Collapse, Fade, LinearProgress, Menu, MenuList, Popover, Skeleton. Showcase demos + z-index
  order test (tooltip > snackbar > modal > drawer > appBar).

- **Objective:** Alert, Snackbar, Dialog, Menu, Popover, Tooltip, Progress, Skeleton, Backdrop
  and transitions.
- **Acceptance:** overlays stack in token order (tooltip 700 > snackbar 600 > modal 400 > drawer
  300 > appBar 200). MUI renders Menu and Popover through Modal, so they use `zIndex.modal`.
  Reduced motion is respected.

## Phase 9: Data display — COMPLETED

- **Shipped:** ListItemButton/TableRow primary `color-mix` hover/selected; TableContainer scroll
  below `md`; TableHead bold + divider borders; Avatar radiusMd + secondary fallback; Badge
  `color: error`; Accordion bordered (no elevation/`::before`); Pagination primary + compact
  size. Catalog adds Accordion*, AvatarGroup, Badge, ListItem*, Pagination, TableContainer,
  TableFooter, TablePagination, TableSortLabel. Showcase: Tables, Lists, Avatars, Accordion.

- **Objective:** Table, List, Avatar, Badge, Accordion and Pagination.
- **Acceptance:** selected and hover states use primary through `color-mix`; tables scroll
  below `md`.
- **Out of scope:** MUI X DataGrid (needs an ADR).

## Phase 10: Responsive — COMPLETED

- **Shipped:** media-query audit (only `prefers-reduced-motion` in ui-web); Theme Lab Viewport
  presets (Fluid / 360 / 768 / 1024 / 1440) framing the shell; Dialog `fullScreen` below `sm` or
  at the 360 preset; Responsive showcase section; viewport preset smoke test.

- **Objective:** apply [RESPONSIVE.md](RESPONSIVE.md); Theme Lab viewport presets.
- **Acceptance:** no raw px media queries in apps or ui-web; the showcase is checked at 360,
  768, 1024 and 1440.

## Phase 11: Accessibility polish — COMPLETED

- **Shipped:** expanded contrast tests (body text, secondary, status colors); compact target
  size ≥ 24px; ListItemButton focus ring; Skip to content + `#main-content`; accessibility
  showcase section; role/name smoke tests. **Decision:** `axe-core` **not** added (no explicit
  dependency approval); fallback is a manual axe browser-extension pass checklist in
  ACCESSIBILITY.md.

- **Objective:** meet [ACCESSIBILITY.md](ACCESSIBILITY.md).
- **Tasks:** contrast tests; keyboard pass; decide on the `axe-core` dev dependency (asked
  explicitly at this phase).
- **Acceptance:** no AA failures in the showcase in either scheme or density.

## Phase 12: Complete showcase — COMPLETED

- **Shipped:** Theme Lab context/panel, ShowcaseShell, section registry + hash routes, polished
  Overview, foundations (incl. Motion), regrouped component sections, Copy config, smoke test
  for every section id. Demo state stays in `apps/azes-ui` only.

- **Objective:** the IA and Theme Lab from [SHOWCASE.md](SHOWCASE.md).
- **Files:** `apps/azes-ui/src/**` only.
- **Acceptance:** `Showcase.tsx` replaced by the registry, sections and lab; the smoke test
  covers every section; no lab state outside `apps/azes-ui`.

## Phase 13: Cross-app integration verification — COMPLETED

- **Objective:** confirm every web app works with the final theme.
- **Done:** matrix + hard-coded/token audit; typecheck/lint/test/build/architecture:verify;
  per-app builds for all six web apps; runtime smoke on account (Vite) and realestate (Next SSR
  init script + cookie primary path); results in [CROSS-APP.md](CROSS-APP.md). ADR-009 /
  `ui-architecture.md` point at the verification record.
- **Acceptance:** all apps checked; Category A fixes none; `styles` ready to merge into `dev`.

## Phase 14: Primary-driven brand harmony — COMPLETED

- **Objective:** when primary changes, secondary / focus / link auto-harmonize in light and dark
  globally in `@azes/ui-web` (not showcase-only).
- **Done:** `harmony.ts` derivation; palette wiring; Theme Lab primary-only; tests + COLOR.md.
- **Acceptance:** feedback stays fixed; explicit `secondary` override still works; validation
  passes.

## Phase 15: Twelve-color brand palette — COMPLETED

- **Objective:** expand `brandSeeds` to 12 professional primaries; dark companions for each;
  Theme Lab swatches; secondary remains auto from primary.
- **Done:** `brand.ts` + `brandSeedOrder`; dark HSL lift for custom hex; Theme Lab 12-swatch
  picker; contrast tests across all seeds; COLOR/THEME docs.
- **Acceptance:** 12 seeds resolve; light/dark primary contrast; secondary auto; validation
  passes.

---

## Not to build

- Tailwind, CSS Modules as the primary styling system, styled-components, Radix styling,
  Pigment CSS, or any other CSS framework or styling engine.
- Another token engine, a parallel spacing system, duplicated typography tokens or a
  duplicated color system.
- Hundreds of standalone CSS files. CSS files remain only for the height reset and Next.js
  `globals.css`.
- An `Azes*` wrapper for every MUI component (AzesButton, AzesCard, ...).
- Business logic, API or Redux access in `ui-web`.
- `apps/azes-ui` as a dependency of any app, or Theme Lab state in product bundles.
- MUI X, `@mui/lab` or new icon packages without an ADR.
- Upgrades or downgrades of MUI or Emotion inside this roadmap.
- Changes to `@azes/ui-native` beyond additive token reviews.

## Implementation order

Phase 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13. Phases 7 to 9 can be reordered if a
product needs a group earlier. Phases 1 to 3 cannot, because they define the theme inputs
everything else uses.
