<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/04-theme.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Theme API, color schemes, first paint, augmentation and the style decision table
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Theme

## API

```ts
type CreateAzesThemeInput = {
  primary?: string;                 // brand seed name or 6-digit hex; default teal600
  secondary?: string;               // override; default derived from primary (05)
  density?: 'comfortable' | 'compact';
  fontFamily?: AzesFontPresetId;    // 'default' | 'system' | 'inter'
  direction?: 'ltr' | 'rtl';        // default 'ltr' (RTL status: 17)
};

createAzesTheme(input?: CreateAzesThemeInput): Theme;
```

Providers:

- `AzesThemeProvider` (core): props `primary`, `secondary`, `density`, `fontFamily`,
  `direction`. Product apps use it today.
- `AzesUiProvider` (`@azes/ui-web/settings`): settings store plus theme. Reads primary,
  density, font and direction from settings. New apps use this.

## Theme output

`createTheme({ cssVariables: { colorSchemeSelector: 'data-azes-color-scheme' }, colorSchemes:
{ light, dark }, spacing: 4, shape, breakpoints, shadows, zIndex, transitions, typography,
direction, components, azes })`.

- `theme.azes.layout`: the `layoutPx` tokens.
- `theme.azes.density`: the active density.
- `theme.azes.customShadows`: `card`, `dropdown`, `dialog`, `nav`.
- `theme.azesRadius`: rem radius tokens (unchanged).

## Color schemes and stability

- Both schemes are in one theme. Switching scheme only changes the `data-azes-color-scheme`
  attribute; the theme object is not rebuilt.
- The theme is rebuilt only when primary, secondary, density, font or direction changes. The
  provider memoizes on those inputs. Budget: under 8 ms per build (16).
- Mode is `light`, `dark` or `system` (default), stored by MUI under `azes-mode`.

## First paint

- Vite apps: an inline script in `index.html` sets `data-azes-color-scheme` on `<html>` from
  `localStorage['azes-mode']` before React runs.
- Next.js (`realestate`): `InitColorSchemeScript` with the same attribute and keys.
- Primary, density and font are read synchronously from storage when the settings store is
  created, so the first React render already has the right theme. Next reads the
  `azes-settings` / `azes-primary` cookies on the server.
- A test (`colorSchemeScript.test.ts`) keeps the Vite and Next keys identical.

## SSR

- Vite apps: no Emotion cache; MUI's default cache is enough.
- Next: `AppRouterCacheProvider` from `@mui/material-nextjs` lives in the app, never in
  ui-web (`ui-web` must not depend on Next).

## Module augmentation

`packages/ui-web/src/theme/mui-augment.ts` augments `@mui/material/styles`: `palette.border`,
`text.muted`, `text.link`, `typography.fontFamilyMono/Display`, `shape.radius*`, breakpoint
`2xl`, AZES z-index keys, `theme.azesRadius` and `theme.azes`. Add new keys here only.

## Style decision table

| Tool                              | Use when                                            | Do                                                                                                           | Don't                                               |
| --------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| `theme.components.styleOverrides` | A rule applies to every instance                    | `MuiCard: { styleOverrides: { root: ({ theme }) => ({ borderColor: theme.vars.palette.border.default }) } }` | Read `theme.palette` inside overrides (breaks dark) |
| `defaultProps`                    | A behavior default applies everywhere               | `MuiButton: { defaultProps: { disableElevation: true } }`                                                    | Use it to hide a design decision in one app         |
| `variants`                        | A named AZES variant used by 2+ screens             | `Chip` `variant: 'soft'` augmented in `mui-augment.ts`                                                       | Add a variant for one screen                        |
| `slotProps`                       | Configure an inner part of one instance             | `<TextField slotProps={{ htmlInput: { inputMode: 'numeric' } }} />`                                          | Use deprecated `InputProps`                         |
| `GlobalStyles`                    | Document-level rules (layout variables, scrollbars) | `AzesLayoutVars` emits `--azes-layout-*` once                                                                | Style components globally by class name             |
| `styled`                          | A reusable internal part of an AZES component       | `const NavRoot = styled('nav')(...)` inside ui-web                                                           | Use it in apps to recreate a MUI component          |
| `sx`                              | Local composition: spacing, grid placement          | `<Stack sx={{ gap: 2 }} />`                                                                                  | Put colors, radii or shadows that should be global  |

## Override rules

1. Read colors from `theme.vars.*`.
2. Sizes come from tokens. No literal px in ui-web layout code (audit check).
3. Use CSS logical properties (`marginInlineStart`, `paddingInline`, `insetInlineStart`) so the
   same styles work in RTL.
4. Every override group has a test in `createAzesTheme.test.ts`.

## RTL

`direction` is part of the theme input and settings. Full RTL also needs an Emotion cache with
`stylis-plugin-rtl` so MUI's own styles flip. That dependency is not approved yet, so the
direction control is hidden by default and the platform ships LTR (17, ADR-015).
