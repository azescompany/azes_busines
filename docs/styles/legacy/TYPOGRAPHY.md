<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/TYPOGRAPHY.md
║ Author: AZES_COMPANY
║ Created: 2026-10-02
║ Updated: 2026-10-02
║ Purpose: Typography variants and their token mapping
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Typography

Font families and scales are primitives in `@azes/design-tokens`. Variants are defined only in
the MUI theme. There is no second set of typography tokens.

| Variant     | Size token | Weight   | Line height                      |
| ----------- | ---------- | -------- | -------------------------------- |
| `h1`        | `4xl`      | bold     | tight                            |
| `h2`        | `3xl`      | bold     | tight                            |
| `h3`        | `2xl`      | semibold | snug                             |
| `h4`        | `xl`       | semibold | snug                             |
| `h5`        | `lg`       | semibold | normal                           |
| `h6`        | `md`       | semibold | normal                           |
| `subtitle1` | `lg`       | medium   | normal                           |
| `subtitle2` | `sm`       | medium   | normal                           |
| `body1`     | `md`       | regular  | normal                           |
| `body2`     | `sm`       | regular  | normal                           |
| `caption`   | `xs`       | regular  | normal                           |
| `button`    | `sm`       | semibold | tight, no uppercase              |
| `overline`  | `xs`       | medium   | normal, uppercase, wide tracking |

Extra families on the theme: `typography.fontFamilyMono` and `typography.fontFamilyDisplay`.

## Rules

- Use `<Typography variant>` or the AZES `Text`. Do not set `fontSize` in `sx` except in the
  showcase.
- Choose the heading level by document structure, and the visual style by `variant`. Use the
  `component` prop when they differ (for example `variant="h4" component="h1"`).
- Density does not change typography. Compact mode changes control sizes and padding only.

## Variant to element map (Phase 3)

MUI v9 removed theme-level `variantMapping`. `@azes/ui-web` exports `azesVariantMapping` (for example
`body1` → `p`, `h1` → `h1`). Use `component={azesVariantMapping.body1}` on `Typography` when the
visual variant and semantic element should differ.

## Roadmap items (later)

- Responsive heading sizes (only if a product asks).
- Decide on responsive heading sizes. Only `h1` to `h3` are candidates, using breakpoint media
  queries inside the variant, and only if a product asks for it. MUI's
  `responsiveFontSizes()` is not used because it rewrites every variant.
- Show every variant in both schemes in the showcase Foundations > Typography page.
