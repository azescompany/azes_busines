<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/05-color-system.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-09
║ Purpose: OKLCH brand seeds, curated secondaries, tinted surfaces and contrast gates
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Color system

**Source of truth for hex values:** `packages/ui-web/src/theme/brand.ts` (seeds are defined in
OKLCH and converted with gamut clamping). Living agent snapshot:
[CURRENT-STATE.md](CURRENT-STATE.md).

## Layers

```text
1. design-tokens primitives (gray/navy/teal/red/amber/green ramps)
2. semanticColorLight / semanticColorDark  → feedback hues (brand-independent)
3. ui-web brand + harmony + surfaces (OKLCH)
      → createColorSchemes → MUI light/dark CSS-variable palette
```

Runtime settings store `primary` in `azes.settings.v1` (+ legacy `azes-primary`). Mode stays on
MUI `useColorScheme` (`azes-mode`).

## OKLCH pipeline

| Module                 | Role                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `theme/color-utils.ts` | `hexToOklch`, `oklchToHex` (chroma reduction into sRGB), `contrastRatio`, `deltaE`, `mixHex` |
| `theme/brand.ts`       | 12 seeds, dark primaries, curated secondaries                                                |
| `theme/harmony.ts`     | Secondary / focus / link derivation (curated or algorithmic)                                 |
| `theme/surfaces.ts`    | `createSurfaceScale({ primaryHex, mode })` — tinted canvas/paper/borders/text                |
| `theme/palette.ts`     | Assembles MUI schemes; `isPrimaryContrastSafe`; feedback OKLCH weight                        |

No extra color libraries (`culori`, etc.).

## Brand seeds (12)

Names and `brandSeedOrder` are stable. Hexes are regenerated from OKLCH targets
(L≈0.55–0.62 light, L≈0.70–0.78 dark). Default primary remains **teal**.

| Seed    | Secondary pair (intent) |
| ------- | ----------------------- |
| teal    | coral / orange          |
| navy    | amber / gold            |
| blue    | orange / amber          |
| indigo  | gold                    |
| violet  | lime-gold               |
| green   | magenta / pink          |
| emerald | rose / coral            |
| amber   | indigo                  |
| orange  | teal / cyan             |
| red     | cyan / teal             |
| rose    | emerald                 |
| slate   | amber / orange          |

Exact hexes: import `brandSeeds`, `brandSeedDarkPrimary`, `brandSeedSecondary` from
`@azes/ui-web`, or run `node scripts/print-color-report.mjs` after building `@azes/ui-web`.

## Harmony rules

- **Curated:** when `primary` matches a seed hex, secondary comes from `brandSeedSecondary`.
- **Custom hex:** OKLCH split-complementary (`complementaryHue`, muddy 70–130° avoided);
  L within ≈±0.03 of primary; C ≈ 0.9–1.0×; enforced hue Δ ≥ 120° and ΔE(OKLab) ≥ 0.15.
- Explicit `createAzesTheme({ secondary })` / `AzesThemeProvider secondary` still wins.
- `text.link`: primary hue, ≥ 4.5:1 on tinted paper.
- `border.focus`: brighter/saturated primary, ≥ 3:1 on paper.

## Tinted surfaces

`createSurfaceScale` (memoized) drives **global** backgrounds when `tintSurfaces` is true
(default on `createAzesTheme` / `AzesThemeProvider`):

| Token                                   | Dark (approx)                         | Light (approx)        |
| --------------------------------------- | ------------------------------------- | --------------------- |
| `background.default`                    | L≈0.16, C≈0.012–0.03, primary hue     | L≈0.98, C≈0.004–0.01  |
| `background.paper`                      | L≈0.20                                | L≈0.995               |
| `background.muted` / `surface.level1–3` | +≈0.025 L steps                       | muted off-white steps |
| borders / divider                       | tinted, ≥1.3:1 / strong ≥2:1 vs paper | same                  |
| text                                    | near-white / mid tint, AA on paper    | dark tinted neutrals  |

MUI elevation overlay is disabled (`MuiPaper` `backgroundImage: 'none'`). Elevation classes map
to `palette.surface.level*`.

Opt out: `createAzesTheme({ tintSurfaces: false })` → fixed semantic neutrals from tokens.

## Feedback (status)

`success` / `warning` / `error` / `info` **do not follow the brand**. They are OKLCH-normalized
to a shared L/C weight per scheme (reference paper, not brand-tinted) so they read consistently
across seeds while meeting contrast on paper.

## Contrast gate (`isPrimaryContrastSafe`)

Named seeds always pass at runtime (curated + unit-tested). Custom `#rrggbb` must pass in both
schemes:

- primary `contrastText` ≥ 4.5:1
- primary ↔ tinted paper ≥ 3:1 and ↔ canvas ≥ 3:1
- derived secondary meets the same channel rules

Settings `parse.ts` keeps the previous value when a custom hex fails.

## App usage

- Prefer `theme.vars.palette.*` / role strings (`primary.main`, `background.paper`).
- Hover/selected overlays may use `color-mix(in srgb, …)` in `sx`, or theme `action.*` hex mixes.
- No free hex / ad-hoc `rgba` in product components for permanent surfaces.

## Tests and tooling

- `packages/ui-web/src/theme/color-system.test.ts` — 12× light/dark matrix, fuzz (200 hex), snapshot
- `pnpm color:report` — console PASS/FAIL table (`scripts/print-color-report.mjs` → vitest)
- Showcase: `apps/azes-ui` → Colors section (12-seed grid)
