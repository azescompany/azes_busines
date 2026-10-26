<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/COLOR.md
║ Author: AZES_COMPANY
║ Created: 2026-10-02
║ Updated: 2026-10-04
║ Purpose: Brand seeds, dynamic primary/secondary and light/dark color rules
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Color

## Sources

- Ramps: `primitives.color` (gray, navy, teal, red, amber, green; 50 to 900).
- Semantic: `semanticColorLight` and `semanticColorDark` (background, foreground, border,
  action, feedback).
- Brand seeds (`brandSeeds` / `brandSeedOrder` in `ui-web`) — **12** curated primaries:

| Seed    | Hex (light) | Notes                    |
| ------- | ----------- | ------------------------ |
| teal    | `#167764`   | AZES default (`teal600`) |
| navy    | `#2B4F78`   | `navy600`                |
| blue    | `#2563EB`   | SaaS blue                |
| indigo  | `#4F46E5`   | product indigo           |
| violet  | `#7C3AED`   | accent violet            |
| green   | `#1C8443`   | `green600`               |
| emerald | `#059669`   | fintech emerald          |
| amber   | `#B85E08`   | `amber600`               |
| orange  | `#EA580C`   | warm orange              |
| red     | `#C02B21`   | `red600`                 |
| rose    | `#E11D48`   | modern rose              |
| slate   | `#475569`   | neutral slate            |

Dark-scheme primaries use `brandSeedDarkPrimary` (lighter steps) when canvas contrast requires
it. Secondary / focus / link still derive from the active primary (Phase 14).

## Palette mapping (per scheme)

| MUI role                           | Source                                          | Follows brand input? |
| ---------------------------------- | ----------------------------------------------- | -------------------- |
| `primary`                          | `primary` input                                 | Yes                  |
| `secondary`                        | `secondary` override, else derived from primary | Yes (Phase 14)       |
| `success/warning/error/info`       | `feedback.*`                                    | No, always fixed     |
| `background.default/paper`         | `background.canvas/surface`                     | No                   |
| `text.primary/secondary/muted`     | `foreground.*`                                  | No                   |
| `text.link`                        | derived from primary                            | Yes (Phase 14)       |
| `divider`, `border.default/strong` | `border.*`                                      | No                   |
| `border.focus`                     | derived from primary                            | Yes (Phase 14)       |

Feedback colors never follow the brand. A red brand must still show a distinct error.

## Primary-driven harmony (Phase 14)

When `secondary` is omitted (the default for all apps):

1. **Secondary** — cool companion of primary (`+48°` hue). Light uses a soft tinted surface;
   dark uses a muted tinted surface (`packages/ui-web/src/theme/harmony.ts`).
2. **Focus** — slightly brighter primary accent for rings and borders.
3. **Link** — readable primary-tinted text (darker in light, lighter in dark).

An explicit `secondary` input still overrides `secondary.main` in both schemes. Focus and link
continue to follow primary.

Persistence: primary is stored in `localStorage` and the `azes-primary` cookie (for Next.js
SSR). Secondary is not persisted; products that need a fixed secondary pass it into
`AzesThemeProvider`.

## Dynamic primary resolution

- Inputs are resolved by `resolveBrandColor(value, fallback)`. `resolveBrandPrimary` and
  `resolveBrandSecondary` are thin wrappers with the default primary and secondary fallbacks.
- MUI derives `light`, `dark` and `contrastText` with `augmentColor`. `contrastThreshold` is
  4.5 so generated text meets WCAG AA for normal text.
- **Dark scheme.** Named brand seeds that fail 3:1 against the dark canvas use the matching
  `*400` ramp step. Custom hex values are used as given.
- Showcase Theme Lab changes **primary** only; secondary / focus / link update automatically.

## Light and dark

- `colorSchemes: { light, dark }` with `cssVariables.colorSchemeSelector =
'data-azes-color-scheme'`. The attribute is set on `<html>`.
- Mode is `light`, `dark` or `system` (default), stored in `localStorage['azes-mode']`.
- Pre-paint: Vite apps have an inline script in `index.html` that sets the attribute before
  React runs. Next.js renders `InitColorSchemeScript` with the same attribute and keys.
- Components read colors as `theme.vars.palette.*` (CSS variables), never as
  `theme.palette.*` inside `styleOverrides`.

## Rules

- No hex literals in app code. Use palette roles (`'primary.main'`, `'text.secondary'`) through
  `sx` or the theme.
- No alpha math in JS for theme colors. Use CSS `color-mix()` with `theme.vars` values, as the
  focus ring and `::selection` already do.
