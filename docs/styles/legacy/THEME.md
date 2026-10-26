<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/THEME.md
║ Author: AZES_COMPANY
║ Created: 2026-10-02
║ Updated: 2026-10-02
║ Purpose: Theme factory API, file layout and provider contract
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Theme

## Today

```ts
createAzesTheme({ primary?: string }): Theme
```

- `primary` accepts a brand seed name from the 12-seed set (`teal` … `slate`, see COLOR.md) or a 6-digit
  hex. Anything else falls back to `teal600` (`resolveBrandPrimary`).
- Output: `createTheme({ cssVariables, colorSchemes: { light, dark }, spacing: 4, shape,
breakpoints, shadows, zIndex, transitions, typography, components })`.
- The augmentation in `mui-augment.ts` adds `palette.border`, `text.muted`, `text.link`,
  `typography.fontFamilyMono` and `fontFamilyDisplay`, `shape.radius*`, breakpoint `2xl`, AZES
  z-index keys, `theme.azesRadius` and `CssThemeVariables.enabled`.

`AzesThemeProvider` resolves `primary` from props, then from `localStorage`. It memoizes the
theme and renders MUI `ThemeProvider` (`defaultMode="system"`, AZES storage keys,
`disableTransitionOnChange`) plus `CssBaseline`.

## Target API (Phases 1 to 3)

```ts
type AzesDensity = 'comfortable' | 'compact';

type CreateAzesThemeInput = {
  primary?: string; // seed name or hex; default teal600
  secondary?: string; // optional override; default = derived from primary (Phase 14)
  density?: AzesDensity; // default 'comfortable' (today's sizes)
};
```

- The defaults must reproduce today's theme. Phase 1 checked the current theme by splitting the factory. The new inputs land in Phases 2 and 3.
- `AzesThemeProvider` takes the same three props and memoizes on all three.
- No `mode` input. Mode stays with MUI `useColorScheme`, persisted under `azes-mode`.
- Nothing else becomes an input until a product needs it. AppBar style, drawer mode and surface
  experiments are props on MUI components, not theme inputs.

## File layout

Phase 1 shipped this split. `createAzesTheme` still accepts only `primary`. `secondary`, `density`, and any new public names stay in later phases. `density.ts` holds the current comfortable button metrics so the button overrides read them from one place.

Target layout:

```text
packages/ui-web/src/theme/
  createAzesTheme.ts        composes the parts below
  palette.ts                schemePalette(semantic, { primary, secondary })
  typography.ts             variants from token primitives
  shadows.ts                25-step ladder
  density.ts                AzesDensity and density tables
  components/
    index.ts                merges all overrides
    baseline.ts             MuiCssBaseline
    buttons.ts              MuiButtonBase, MuiButton, MuiIconButton, MuiFab
    inputs.ts               MuiTextField, MuiOutlinedInput, MuiSelect, MuiCheckbox, ...
    surfaces.ts             MuiPaper, MuiCard, MuiAppBar, MuiDrawer
    feedback.ts             MuiAlert, MuiDialog, MuiSnackbar, MuiTooltip
    data-display.ts         MuiTable*, MuiList*, MuiChip, MuiAvatar
  brand.ts, mui-augment.ts, azes-theme-types.ts, spacing.ts, AzesThemeProvider.tsx (unchanged)
```

These are internal modules. The public surface stays the `@azes/ui-web` root export. New
public names are `AzesDensity` and the extended `CreateAzesThemeInput`.

## Override rules

1. Read values from `theme.vars.*` inside override callbacks so that both schemes work.
2. Use token primitives for sizes. Do not hard-code px values.
3. Use `defaultProps` for behavior defaults (`disableElevation`, `size`, `variant`).
4. Use `variants` only for a named AZES variant that two or more screens need. Augment the
   prop type in `mui-augment.ts`.
5. Every override group gets a test in `createAzesTheme.test.ts` that asserts its key values.
