<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/28-backdrop.md
║ Author: AZES_COMPANY
║ Created: 2026-10-10
║ Updated: 2026-10-10
║ Purpose: Global glass MuiBackdrop — invisible rule, tokens, fallbacks
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# AzesBackdrop (global glass)

Theme-level primary “glass” for **visible** backdrops. Menu / Popover / Select click-away
layers stay transparent.

> Note: `21-table.md` already occupies slot 21; this doc is **28**.

## Invisible rule (critical)

```ts
// createAzesTheme → components.MuiBackdrop.styleOverrides.root
getBackdropSx(theme, { invisible: ownerState.invisible });
```

When `ownerState.invisible === true` → transparent, **no** `backdrop-filter`.
When false → primary tint `color-mix` + blur/saturate.

Do **not** override backdrop `sx` on Dialog / Drawer / Modal / SidePanel / Carousel — the
theme owns glass. Do **not** add hacks on Menu unless tests prove `invisible` is missing
(then set Menu/Popover default `invisible: true` only).

## Where glass applies

| Surface                              | Glass?           |
| ------------------------------------ | ---------------- |
| Dialog / Modal                       | Yes              |
| Drawer / SwipeableDrawer `temporary` | Yes              |
| `AzesSidePanelHost`                  | Yes              |
| Carousel lightbox Modal              | Yes              |
| Menu / Popover / Select / Tooltip    | No (`invisible`) |
| Drawer `permanent` / `persistent`    | No backdrop      |

## Tokens

`theme.azes.backdrop`:

| Key                      | Role                                                    |
| ------------------------ | ------------------------------------------------------- |
| `blur` / `nestedBlur`    | CSS px blur; nested softens stacked modals              |
| `saturate`               | `saturate()` multiplier                                 |
| `tintLight` / `tintDark` | Primary mix % into `background.default`                 |
| `duration`               | Opacity fade ms                                         |
| `opaqueBoost`            | Extra tint when blur unsupported / reduced-transparency |

## Fallbacks

- `@supports not (backdrop-filter…)` → no blur, higher opacity
- `prefers-reduced-transparency: reduce` → no blur, near-opaque tint
- `prefers-reduced-motion: reduce` → no opacity transition

## Component

```ts
import { AzesBackdrop } from '@azes/ui-web/backdrop';
// variant?: 'glass' | 'plain' — custom overlays; invisible always transparent
```

Shared helper: `getBackdropSx(theme, options)` used by the theme override and `AzesBackdrop`.
