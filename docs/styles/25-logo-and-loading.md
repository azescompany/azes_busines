<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/25-logo-and-loading.md
║ Author: AZES_COMPANY
║ Created: 2026-10-10
║ Updated: 2026-10-12
║ Purpose: CaspianLogo + CaspianLoader + dynamic home favicon
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Caspian logo & loading (`apps/admin`)

Admin chrome uses an **inline SVG** logo and a **CSS-only** global loader under
`apps/admin/src/loading/`. Canonical artwork:

`packages/assets/icons/general/caspian-key-logo-global.svg`

(also used by account login, azes-ui showcase, and app favicons). The SVG uses
`fill="currentColor"`; apps tint via theme `primary` / nav chrome tokens.

### Dynamic favicon (admin + account)

Tab icons use a **filled home** glyph (Material `Home`, viewBox `0 0 24 24`), tinted with the
active brand primary.

| Layer           | Mechanism                                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static fallback | `apps/{admin,account}/public/favicon.svg` @ `DEFAULT_PRIMARY`; admin also `favicon.ico` (same mark)                                                                                         |
| FOUC            | Vite `createAzesFaviconHtmlPlugin()` injects prepaint IIFE from `azes-ui` / `azes-primary` cookie                                                                                           |
| Runtime         | `AzesUiProvider` → `applyAzesFavicon(primary)` on every settings primary change (`.ico` links tagged `data-azes-favicon` are rewritten to SVG data-URL — raster `.ico` cannot recolor live) |

Source of truth: `packages/ui-web/src/theme/azesFavicon.ts` (`buildAzesFaviconSvg`,
`applyAzesFavicon`, `getAzesFaviconPrepaintScript`). Do not hand-edit favicon paths in apps.

Public API (import only this entry):

```ts
import { CaspianLogo, CaspianLoader, NavigationLoader, RouteLoader } from '@/loading';
```

Do **not** add page/route spinners (`CircularProgress`, ad-hoc “Loading…” text,
`PageSkeleton` / `RoutePageSkeleton` / `AppShellSkeleton` for navigation). Prefer
`RouteLoader` / `CaspianLoader` / `NavigationLoader` only. Content-shaped pending
(table first paint) → `@azes/ui-web/skeleton` (see [29-skeleton.md](29-skeleton.md)).

`RoutePageSkeleton` / `AppShellSkeleton` are thin aliases to `RouteLoader` (legacy imports).

### Global navigation + handoff

| Surface                                     | Component                                                           |
| ------------------------------------------- | ------------------------------------------------------------------- |
| React Router lazy / navigate                | `NavigationLoader` in `AdminShell` (`useNavigation`)                |
| Suspense / HydrateFallback                  | `RouteLoader` (`section` or `fullscreen`)                           |
| Auth boot / account→admin (`:5173`→`:5174`) | `RouteLoader mode="handoff"` (admin) / `CaspianKeyLoader` (account) |

Fullscreen chrome: `getBackdropSx` glass (`theme.azes.backdrop`, ~1.75× blur) + primary
radial wash over the live page, animated Caspian logo, **Caspian Key** overline, status
line, MUI `LinearProgress` gradient bar. Same glass on account `CaspianKeyLoader`.
Copy from `common:loading.*`. Reduced-transparency / no-blur fallbacks from backdrop tokens.

## Variants

| Variant   | ViewBox                                        | Notes                   |
| --------- | ---------------------------------------------- | ----------------------- |
| `full`    | full wordmark + tagline                        | default                 |
| `compact` | wordmark; tagline hidden via `[data-name="P"]` | tight slots / DesignLab |
| `mark`    | cropped key emblem                             | mini nav / xs           |

## Color (dual-tone)

SVG groups: mark + `[data-name="H1"]` (CASPIAN KEY) vs `[data-name="P"]` (real estate company).

| Mode                             | Mark / wordmark                  | Tagline                              |
| -------------------------------- | -------------------------------- | ------------------------------------ |
| Light (content / integrated nav) | `primary.main`                   | `secondary.main`                     |
| Dark (content)                   | `primary.light`                  | `secondary.light`                    |
| Dark (integrated nav)            | `primary.light`                  | `secondary.light` mixed toward white |
| Contrast nav (light)             | primary mixed toward white       | secondary mixed toward white         |
| Contrast nav (dark)              | primary.light mixed toward white | secondary.light mixed toward white   |
| `mono`                           | `currentColor`                   | `currentColor` @ 0.72 opacity        |

Resolver: `resolveCaspianLogoFills` in `caspianLogoStyles.ts`.

## `CaspianLogo` variants / modes

- `variant`: `full` | `compact` | `mark` (viewBoxes above)
- `colorMode`: `brand` (default) | `mono` (`currentColor` from parent)
- `surface`: `content` (default) | `nav` (sidebar/header chrome)
- `navTone`: `integrated` | `contrast` (with `surface="nav"`)
- Header brand: `surface="nav"` + live `navTone`; `full` desktop (wordmark + tagline); `mark` on `xs` / mini
- Height: `theme.azes.loader.headerLogoRatio` × header height
- Multiple instances scope SVG `id` / `xlink:href` via React `useId`

## `theme.azes.loader`

Defaults in `createAzesTheme`: `delayMs` 200, `minDurationMs` 400, `introMs` 800,
`loopMs` 2400, `staggerMs` 40, `headerLogoRatio` 0.55, `sizeSm|Md|Lg`, `easing`,
`softMixPercent` 60. Components must not hardcode ms/px for motion or logo chrome.

## `CaspianLoader` animation

**Chosen approach:** clip-path wave reveal + opacity/transform intro + soft shimmer overlay
(loop). Stroke-draw (`stroke-dashoffset`) was rejected for letter subpaths (too heavy /
uneven lengths).

- Stage A (~introMs): mark rises in; waves clip left→right; wordmark stagger fade; tagline last
- Stage B (~loopMs): gentle `translateX` on waves + paper-mixed shimmer
- `prefers-reduced-motion: reduce`: motion off; optional weak opacity pulse
- Layouts: `fullscreen` (boot), `section` (route/Suspense in shell), `inline` (mark + loop)
- A11y: `role="status"`, `aria-busy`, decorative logo `aria-hidden`;
  `aria-live="polite"` only when `announce` (default for fullscreen). Mid-page demos
  must use `announce={false}` so the L-shell scoop is not scrolled into the live region.
- `useDelayedVisible(delay, minDuration)` avoids flash / blink
- Scoop scroll: `ScrollToMain` (manual history restoration + delayed re-assert); no RR
  `ScrollRestoration` (it fought the scoop after `:5173`→`:5174` handoff on `/auth-lab`)

`RouteLoader` wires i18n (`common.brand`, `common.loading.label`) for Suspense/boot.

## App wiring

- Header logo → home hash (`PATHS.authLab`), `common.loading.goHome` aria-label, focus-visible
  outline via `border.focus`
- Lazy Users/Ads + table Suspense → `RouteLoader variant="section"`
- Auth boot (i18n ready, session not) → `RouteLoader variant="fullscreen"`
- Pre-i18n boot: no UI yet (index.html CSS splash skipped as optional)

## i18n (`common`)

- `brand`
- `loading.label`
- `loading.goHome`
