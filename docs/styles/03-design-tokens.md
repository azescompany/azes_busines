<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/03-design-tokens.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-05
║ Purpose: Token layers, groups and the no-duplication rule
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Design tokens

`@azes/design-tokens` is the single source of raw design values. It has no React, React Native
or MUI dependency, so `ui-native` keeps working unchanged.

## Layers

```text
raw tokens (primitives)        color ramps, font sizes, spacing, radius, layout px ...
  -> semantic tokens           semanticColorLight / semanticColorDark
    -> component tokens        componentPx: control heights per density, nav item heights
      -> MUI theme mapping     createAzesTheme (ui-web) maps tokens to palette, shape, ...
        -> runtime config      settings (primary, density, font, nav layout) pick inputs
```

## Groups

| Group          | Export                       | Notes                                                            |
| -------------- | ---------------------------- | ---------------------------------------------------------------- |
| Color ramps    | `primitives.color`           | gray, navy, teal, red, amber, green, 50–900                      |
| Semantic color | `semanticColorLight/Dark`    | background, foreground, border, action, feedback                 |
| Typography     | `primitives.typography`      | families, sizes, weights, line heights, letter spacing           |
| Font presets   | `fontFamilyPresets`          | `inter`, `sourceSerif`, `nunito`, `ibmPlexSans`, `fraunces` (06) |
| Spacing        | `spacing`, `spacingPx`       | MUI uses `spacing: 4`                                            |
| Radius         | `radius`, `radiusPx`         | sm, md, lg, xl, full                                             |
| Shadow         | `shadow`, `elevation`        | web ladder anchors; `elevation` is for native                    |
| Breakpoints    | `breakpoint`, `breakpointPx` | sm 640, md 768, lg 1024, xl 1280, 2xl 1536                       |
| z-index        | `zIndex`                     | base → tooltip                                                   |
| Motion         | `motion`                     | durations (+ ms) and easings                                     |
| Size           | `size`, `sizePx`             | icons, controls, containers                                      |
| Layout         | `layoutPx`                   | header, nav widths, content width, page padding                  |
| Component      | `componentPx`                | control heights per density, nav item heights                    |

### Layout (`layoutPx`)

| Key                   | Value    | Used by                                     |
| --------------------- | -------- | ------------------------------------------- |
| `headerHeightMobile`  | 56       | `AzesHeader` below `layoutQuery`            |
| `headerHeightDesktop` | 56       | `AzesHeader` at `layoutQuery` and up        |
| `navVerticalWidth`    | 280      | `AzesVerticalNav`                           |
| `navMiniWidth`        | 56       | `AzesMiniNav`                               |
| `navMobileWidth`      | 288      | `AzesMobileNav`                             |
| `navHorizontalHeight` | 56       | `AzesHorizontalNav`                         |
| `contentMaxWidth`     | 1280     | `AzesMainContent` when `container: 'fixed'` |
| `contentSidebarWidth` | 240      | `AzesMainSidebar` in-content rail           |
| `pagePaddingXs/Md/Lg` | 16/24/32 | `AzesMainContent` horizontal padding        |

These are AZES values. They are exposed on the theme as `theme.azes.layout` and in CSS as
`--azes-layout-*` variables (08).

## Rules

1. A value lives in exactly one place. The theme reads tokens; apps read the theme.
2. Do not add a token for a one-off value. Add it when a second component needs it.
3. Semantic roles that MUI already models (palette, typography variants) live in the theme,
   not in a second token set.
4. Every px token has a numeric `*Px` form for native and JS math. Web layouts use variables.
5. `themeToCss` / `toCssVariables` have no web consumer. They stay for now (Backlog).

## Example

```ts
import { layoutPx, componentPx } from '@azes/design-tokens';

layoutPx.navVerticalWidth; // 280
componentPx.navItemHeight.compact; // 36
```
