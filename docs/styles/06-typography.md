<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/06-typography.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-11
║ Purpose: Typography variants, font presets and semantic element mapping
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Typography

Families and scales are primitives in `@azes/design-tokens`. Variants exist only in the MUI
theme.

| Variant     | Size | Weight   | Line height             |
| ----------- | ---- | -------- | ----------------------- |
| `h1`        | 4xl  | bold     | tight                   |
| `h2`        | 3xl  | bold     | tight                   |
| `h3`        | 2xl  | semibold | snug                    |
| `h4`        | xl   | semibold | snug                    |
| `h5`        | lg   | semibold | normal                  |
| `h6`        | md   | semibold | normal                  |
| `subtitle1` | lg   | medium   | normal                  |
| `subtitle2` | sm   | medium   | normal                  |
| `body1`     | md   | regular  | normal                  |
| `body2`     | sm   | regular  | normal                  |
| `caption`   | xs   | regular  | normal                  |
| `button`    | sm   | semibold | tight, no uppercase     |
| `overline`  | xs   | medium   | normal, uppercase, wide |

## Font presets

Selectable body stacks live in `fontFamilyPresets` (`@azes/design-tokens`). Five distinct
type approaches (not five similar neo-grotesks). Default body / display tokens stay on Inter;
`mono` is unchanged (`IBM Plex Mono` stack).

| Id            | Face           | Approach            | CSS stack (variable first)                       |
| ------------- | -------------- | ------------------- | ------------------------------------------------ |
| `inter`       | Inter          | Neo-grotesk UI      | `"Inter Variable", Inter, system-ui, …`          |
| `sourceSerif` | Source Serif 4 | Editorial serif     | `"Source Serif 4 Variable", "Source Serif 4", …` |
| `nunito`      | Nunito         | Soft rounded sans   | `"Nunito Variable", Nunito, system-ui, …`        |
| `ibmPlexSans` | IBM Plex Sans  | Engineered humanist | `"IBM Plex Sans Variable", "IBM Plex Sans", …`   |
| `fraunces`    | Fraunces       | Soft optical serif  | `"Fraunces Variable", Fraunces, Georgia, …`      |

### Global settings → theme pipeline

```text
azes.settings.v1.fontFamily
  → AzesSettingsProvider / SettingsThemeBridge
  → loadAzesFont(preset)          // on-demand CSS, deduped
  → AzesThemeProvider({ fontFamily })
  → createAzesTheme → resolveAzesFontPresetId
  → theme.typography.fontFamily   // all MUI Typography variants + CssBaseline
```

- Changing the setting rebuilds the theme immediately; no manual page refresh.
- Density never alters typography.
- Permanent `fontFamily` overrides do **not** belong on components — inherit the global theme.
- The settings drawer Font section prefetches all five faces while open so cards preview the
  real typefaces; app boot still loads only the active preset.

### On-demand loading

`@azes/ui-web` loads
`@fontsource-variable/{inter,source-serif-4,nunito,ibm-plex-sans,fraunces}` via
`loadAzesFont` (`wght.css`, latin + latin-ext). Loads are deduplicated (loaded set +
in-flight promise map). Azerbaijani characters (`ə`, `ı`, `İ`, `ğ`, `ş`, `ç`, `ö`, `ü`) are
covered by the latin-ext subsets.

### Legacy compatibility

Stored ids `default` and `system` resolve to `inter`. Unknown ids fall back to `inter`.
Retired neo-grotesk ids migrate: `manrope` → `nunito`, `plusJakarta` / `dmSans` →
`ibmPlexSans`, `spaceGrotesk` → `inter`. Storage key remains `azes.settings.v1`.

## Rules

- Use `<Typography variant>` or AZES `Text`. No `fontSize` in `sx` outside the showcase.
- Pick the heading level by document structure and the look by `variant`. Use `component` when
  they differ. `azesVariantMapping` gives the default element per variant (MUI v9 removed the
  theme-level mapping).
- Density never changes typography.
- Responsive heading sizes are not used until a product needs them; `responsiveFontSizes()` is
  not used because it rewrites every variant.
