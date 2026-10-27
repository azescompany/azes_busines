<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/CURRENT-STATE.md
║ Author: AZES_COMPANY
║ Created: 2026-10-09
║ Updated: 2026-10-26
║ Purpose: Living snapshot of AZES web UI/theme architecture for Agent Dizayner
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# UI / style current state

Living snapshot for [Agent Dizayner](../../.cursor/rules/uiDesignAgent.mdc). Keep this file
short and factual. After each UI/theme change: update **How it works now** if needed, then append
one line under **Delta log**. Prefer this over re-auditing `packages/ui-web` every chat.

Authoritative long-form docs: [README.md](README.md). Hard rules: `.cursor/rules/ui-system.mdc`.
Self-contained config dump + site brief: `docs/styles-current/` (`readme.md`,
`real-estate-site.md`).

---

## How it works now (2026-10-13)

### Stack

| Layer          | Package / entry                                         | Role                                                                 |
| -------------- | ------------------------------------------------------- | -------------------------------------------------------------------- |
| Tokens         | `@azes/design-tokens`                                   | Primitives + semantic + light/dark theme objects; no React/MUI       |
| Theme          | `@azes/ui-web` → `createAzesTheme`, `AzesThemeProvider` | MUI v9 CSS-vars theme from tokens + brand/density/font/direction     |
| Settings shell | `@azes/ui-web/settings` → `AzesUiProvider`              | Settings store + theme + snackbar + dialog                           |
| Layout / nav   | `@azes/ui-web/layout`, `/navigation`                    | Dashboard chrome; nav content + router/access injected by apps       |
| Leaves         | `/icons`, `/forms`, `/table`, `/data-grid`, `/charts`   | Core-only; prefer `/table` for lists                                 |
| Feedback       | `@azes/ui-web/feedback`                                 | Snackbar + `useAzesDialog` / `openDialog`; wired in `AzesUiProvider` |
| Locale UI      | `@azes/ui-web/locale`                                   | `AzesLocaleMenu`, `AzesAccountMenu` (labels/callbacks from app)      |

### Public exports (`packages/ui-web/package.json`)

`.`, `./settings`, `./settings/ssr` (RSC-safe cookie → `initialSettings` patch),
`./navigation`, `./layout`, `./icons`, `./table`, `./data-grid`, `./charts`,
`./forms`, `./feedback`, `./side-panel`, `./menu`, `./backdrop`, `./locale`
(see also `02-architecture.md`).

### Theme / settings flow

```text
AzesUiProvider (settings)
  → AzesSettingsProvider (azes.settings.v1)
  → AzesThemeProvider (primary/density/font/direction from settings)
  → AzesSnackbarProvider
  → AzesDialogProvider (promise queue; optional dialogLabels from app i18n)
  → AzesSidePanelProvider (+ host Drawer; typed panel ids)
```

- Settings keys: `primary`, `navLayout`, `navColor`, `density`, `direction`, `fontFamily`,
  `container`, `headerMode`. Defaults: horizontal nav, **contrast** nav color, comfortable,
  ltr, inter, fluid, headerMode `autoHide`, primary **red** (first swatch). Mode default
  `system` (MUI). Option card order: navColor `contrast`→`integrated`, headerMode
  `autoHide`→`fixed`.
- Header `autoHide`: scoop `scrollTarget` + L-shell height collapse; settle lock
  (`CHROME_SETTLE_MS` = motion+120) and show-up hysteresis (`CHROME_SHOW_UP_PX`) prevent
  compensation jitter; Apps reopen uses `visibilityPin`; bottom-edge lock near scoop end.
  Conceal gated by `canChromeAutoConceal` ENTER overflow (= collapse budget + hide depth +
  show-up + buffer ≈ 284). Short/marginal pages: force-reveal + `resolveChromeShortPagePin`
  until overflow recovers past ENTER — stops hide↔show oscillation when page height is small.
  Bottom lock unlocks only after `fromBottom > BOTTOM_UNLOCK_PX` (not tiny scroll-up);
  conceal near footer no longer `pinScrollToBottom` (infinite lists were snapping footer up).
  `AzesScrollToTop` fixed bottom-end on `AzesDashboardLayout` (scoop / window).
  Scoop↔rail join (`borderStartStartRadius`) flattens while chrome is concealed and
  curves back on show (`CHROME_MOTION_MS`, `data-azes-scoop-join`).
  Canvas ink: `navToneVars` sets `--azes-nav-*` only (no inherited `color`); chrome
  surfaces set `color: var(--azes-nav-text*)`; scoop + `AzesMainContent` use
  `text.primary` so light/dark page copy stays readable on paper.
  Breakpoint tree (`isDesktop` / dual chrome): `useMediaQuery` **without** `noSsr` so
  SSR HTML matches the client's first paint (`defaultMatches`); real `lg+` applies after
  mount (brief flash OK). `noSsr: true` forks fixed-rail vs dual trees → hydration error.
- Color scheme (`light` / `dark` / `system`): MUI `useColorScheme`, storage key `azes-mode`
  — **not** inside `AzesSettings`.
- **Favicon:** filled home SVG tinted with brand primary (`azesFavicon`). Static
  `/favicon.svg` = `DEFAULT_PRIMARY`; Vite HTML plugin FOUC from `azes-ui` cookie; runtime
  re-tint in `AzesSettingsProvider` when settings primary changes (account + academy).
- **Cross-app theme sync (account ↔ admin ↔ agent-site):** compact cookie `azes-ui` =
  `1|<primary>|<mode>` (mirrors `azes-primary` / `azes-mode`). **Marketplace**
  (`real-estate-site`) uses `prefsScope: "caspian"` → `azes-ui.caspian` etc., isolated
  from the shared shell group. Auth cookies unchanged. FOUC + MUI `storageManager` +
  settings `rehydrate` on focus/visibility. Prod: `configureAzesPrefsCookie({ domain })`
  from `VITE_AUTH_COOKIE_DOMAIN`.
- **Color system (OKLCH):** `color-utils` → `brand` (12 seeds + curated secondaries + dark
  primaries) → `harmony` → `surfaces.createSurfaceScale` → `createColorSchemes`. Default
  `tintSurfaces: true` tints canvas/paper/borders/text with primary hue; opt out with
  `tintSurfaces: false`. Feedback status colors stay brand-independent (OKLCH-normalized).
  Docs: `05-color-system.md`. Report: `pnpm color:report`.
- Fonts (5 distinct presets): `inter` | `sourceSerif` | `nunito` | `ibmPlexSans` | `fraunces`
  via `fontFamilyPresets` + `loadAzesFont` (`@fontsource-variable/*`, latin + latin-ext).
  Legacy `default`/`system`/retired neo-grotesks migrate in `resolveAzesFontPresetId`.
  Settings Font cards are compact horizontal samples; drawer open prefetches all five;
  boot loads only the active preset.
- **AzesAccordion** (core): `mode="search" | "crud"` + `AzesFormGrid` + `AzesConfirmDialog`;
  tokens `theme.azes.accordion`. Admin Users/Ads use search + CRUD panels above `AzesTable`
  (`highlightedRowId` for edit highlight). Docs: `22-accordion.md`.
- **AzesDialog** (core + `/feedback`): Context queue + `useAzesDialog()` /
  `openDialog` bridge (no Redux). Tokens `theme.azes.dialog`, styles in `dialogStyles.ts`.
  Optional flags: `maxWidth: 'lg'`, `fullScreenOnMobile`, `showCloseButton`, `hideFooter`,
  `paddingless`. Admin Users delete + Ads delete/add-to-work/details use it;
  `DialogLabelsBridge` injects en/az/ru defaults. Docs: `23-dialog.md`. ESLint `no-alert`.
- **AzesSidePanel** (`@azes/ui-web/side-panel`): global right Drawer host + portal panels
  (`settings`, `adsFilters`); tokens `theme.azes.sidePanel`. Settings content + Ads filters
  use it; Ads search accordion removed. Docs: `26-side-panel.md`. ESLint bans app
  `@mui/material/Drawer`.
- **AzesMenu** (`@azes/ui-web/menu`): typed items + trigger render-prop; tokens
  `theme.azes.menu`. Admin header language uses `LanguageMenu` (no flag emojis). Docs:
  `27-menu.md`. ESLint bans app `@mui/material/Menu` (warn path via product-apps rule).
- **Glass Backdrop**: `theme.azes.backdrop` + `MuiBackdrop` override via `getBackdropSx`;
  glass only when `ownerState.invisible !== true`. Dialog / temporary Drawer / Modal /
  SidePanel / Carousel lightbox inherit theme glass (no per-component backdrop sx). Docs:
  `28-backdrop.md`.
- **AzesCarousel** (core): native `scroll-snap` gallery (no Swiper/Embla). Tokens
  `theme.azes.carousel`, styles in `carouselStyles.ts`. Admin Ads photo/address → custom
  dialog with carousel + `GET /api/v1/data/{id}` details. Docs: `24-carousel.md`.
- RTL: `direction` setting exists; Emotion RTL cache (UI Platform Phase 9) still **BLOCKED**.

### Tables

- **Default:** `AzesTable` (`@azes/ui-web/table`, ADR-017) — TanStack Table v8 + MUI `Table*`,
  `theme.azes.table`, sticky actions CSS, natural height, **no inner Y scroll** (X only).
  Docs: `21-table.md`.
- **Legacy:** `AzesDataGrid` (`@azes/ui-web/data-grid`, ADR-013) — Design Lab / azes-ui demos
  only. Details: `13-mui-x.md`.
- Admin Users + Ads use `AzesTable` (lazy). ESLint bans `/data-grid` and direct TanStack in
  product apps (Design Lab excepted).

### Style decision hierarchy

```text
Global → tokens/theme → theme.components → AZES component → sx (local only)
```

Layout metrics: CSS vars `--azes-layout-*` (`AzesLayoutVars`, `chromeMetrics`) — no hardcoded px
in layout engine.

### App adoption (web)

| App                | Theme / UI shell                                              | Notes                                                                                                        |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `account`          | `AzesUiProvider`                                              | Login/branding in app features; no dashboard layout yet                                                      |
| `admin`            | `AzesUiProvider` + `AzesDashboardLayout` in `AdminShell`      | Port **200**; Home-only primary nav; locale + `AzesAccountMenu` in `headerEnd`; settings drawer (no AI rail) |
| `azes-ui`          | Showcase / pilot                                              | Full platform demos · port **700**                                                                           |
| `agent-platform`   | `AzesThemeProvider` only                                      | Lighter Vite shell                                                                                           |
| `agent-site`       | `AzesThemeProvider` (+ Next exceptions per ADR-009)           | App Router · port 3000                                                                                       |
| `realestate`       | `AzesThemeProvider` (+ Next exceptions per ADR-009)           | App Router                                                                                                   |
| `real-estate-site` | `AzesUiProvider` + `AzesDashboardLayout` (`CaspianSiteShell`) | Caspian Key L-shell + Phase 2 scoop marketplace UI; brief: `styles-current/real-estate-site.md`              |

Native (`ui-native`) unchanged relative to the MUI web platform track.

### File map (edit here first)

| Concern                    | Primary paths                                                                                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens                     | `packages/design-tokens/src/primitives/*`, `semantic/*`, `themes/*`                                                                     |
| Theme compose              | `packages/ui-web/src/theme/createAzesTheme.ts`, `palette.ts`, `brand.ts`, `harmony.ts`, `surfaces.ts`, `color-utils.ts`, `components/*` |
| Provider                   | `packages/ui-web/src/theme/AzesThemeProvider.tsx`                                                                                       |
| Settings                   | `packages/ui-web/src/settings/*`                                                                                                        |
| Layout                     | `packages/ui-web/src/layout/*`                                                                                                          |
| Navigation                 | `packages/ui-web/src/navigation/*`                                                                                                      |
| Feedback / dialog / locale | `packages/ui-web/src/feedback/*`, `dialog/*`, `locale/*`                                                                                |
| Carousel                   | `packages/ui-web/src/carousel/*`                                                                                                        |
| AzesTable                  | `packages/ui-web/src/table/AzesTable.tsx`, `tableStyles.ts`                                                                             |
| DataGrid (legacy)          | `packages/ui-web/src/data-grid/AzesDataGrid.tsx`, `dataGridStyles.ts`                                                                   |
| Admin chrome example       | `apps/admin/src/layout/AdminShell.tsx`                                                                                                  |
| Account providers          | `apps/account/src/providers/AppProviders.tsx`                                                                                           |

### Topic doc map

| Task                    | Read                                |
| ----------------------- | ----------------------------------- |
| Tokens                  | `03-design-tokens.md`               |
| Theme / SSR / vars      | `04-theme.md`, `05-color-system.md` |
| Components / icons      | `07-components.md`                  |
| Layout / nav / settings | `08`, `09`, `10`                    |
| Forms / tables / MUI X  | `14`, `21`, `13`                    |
| Dialog                  | `23`                                |
| Carousel                | `24`                                |
| Deps / DoD              | `19`, `20`                          |

`docs/styles/legacy/` is frozen history only.

---

## Delta log

- 2026-10-26 — Admin premium chrome (`apps/admin/src/shared/adminChrome/`):
  `PageHeader` diagonal primary wash (`linear-gradient(135deg)` + `alpha(primary, 0.06–0.10)`);
  `EmptyState` repeating 45° stripe pattern; `FilterToolbar` search + chip filters;
  `OrgColorDot` / `UserAvatar`; `useNotify` → `useAzesSnackbar`; `useDirtyLeaveGuard`.
  Orgs/Users/UserAccess/PlatformRoles Views compose Dialog custom / SidePanel (`adminUserCreate`,
  width `lg`≈480) / `AzesMenu` / Confirm — **no new ui-web package components**. Responsive:
  table X-scroll &lt;768; UserAccess sticky save bar + stacked columns on narrow.
- 2026-10-26 — `apps/admin` L-shell restore: `AdminShell` + `AzesDashboardLayout`
  (AppBar / menus toolbar / sidebar+rail slots / settings); primary nav **Home only**;
  `headerEnd` locale + `AzesAccountMenu`; Home scoop polish (no catalog content); port 200.
- 2026-10-20 — Academy catalog native selects: `inputLabel.shrink` so the outline
  label sits in the notch above the visible default option (`value=""` is not filled).
- 2026-10-20 — Academy favicon: `public/favicon.svg` + `index.html` `data-azes-favicon`
  links + `createAzesFaviconHtmlPlugin` + Vite middleware serves `/favicon.ico` as SVG —
  stops 404 on `:200`; same home mark / brand tint as Account.
- 2026-10-19 — `azes-ui` `#/phase-controls` polish: demo copy fully i18n (az/en/ru);
  Cards outlined+elevated side-by-side; Accordion → stacked `AzesAccordion` (open /
  closed / disabled); Forms Autocomplete dialog (local) + snack on Confirm; inputs
  state matrix grid; DemoCard takeaways when `sections.*.takeaway` exists; sticky
  pills 200ms transition + scroll-into-view; ValueCard title 2-line clamp; primary
  wash extra bottom vignette for AA on all 12 seeds (shell phase shares wash).
- 2026-10-19 — `azes-ui` chrome logo: SVG mark removed; animated **AZES COMPANY**
  wordmark (`ShowcaseLogo`) — letter stagger, primary shine, secondary pulse dot /
  rule; respects `prefers-reduced-motion`; mini nav stacks brand + company.
- 2026-10-19 — `azes-ui` Foundations hero: secondary photo band off; tech-circuit
  hero image (`public/home/photos/tech-circuit.jpg`); parallax band no longer uses
  CSS `transform`/`will-change` under clip-path (fixes rectangular shadow under
  diagonal); `<img object-fit:cover>` + separate wash layer.
- 2026-10-19 — `azes-ui` PhaseView seam + sticky-nav fix: removed DiagonalDivider
  blend/glow (pink “cheap” seams); thicker paper wedge + −2px overlaps; canvas
  top divider direction matches hero (rtl); sticky chips use scroll-spy by
  section top + 1s click lock (first chip no longer stuck on second).
- 2026-10-19 — `azes-ui` PhaseView polish (all 5 phases): shared `diagonal.ts` +
  fluid `--azes-diagonal-h`; parallax band uses absolute scaled photo (iOS-safe)
  - optional `animation-timeline: scroll()`; layered soft/primary/dark washes;
    bento glass value cards (index/icon/arrow, lift hover); CSS fade-up + scroll
    indicator; sticky in-page section chips; section cards with reveal +
    section-specific i18n captions (`sections.*` az/en/ru); lookFor vs pullQuote;
    Overview jumps use phase-aware navigate + arrow affordance.
- 2026-10-19 — `azes-ui` phase heroes: «Bu fazada» chips → Caspian home header
  value-card chrome (glass/blur/uppercase/hover scale) on the hero grid; seam
  hygiene — `boxShadow`/`filter: none` on `ShowcaseParallaxBand` (+ photo layer),
  `DiagonalDivider`, and phase section wrappers (kills rectangular band under
  diagonal on every catalog menu). Paper/canvas wedges still `edge="top"`.
- 2026-10-19 — Locale chrome: `azes-ui` `@azes/i18n` + `AzesLocaleMenu` in
  `headerEnd` (default **az**, `showcase` en/az/ru); `agent-site` header locale
  menu + URL swap; Caspian view fallbacks use `DEFAULT_LOCALE` (az). `AzesLocaleMenu`
  trigger now sets `aria-label`. Section demo deep i18n still backlog.
- 2026-10-19 — `azes-ui` phase heroes: flat top + bottom diagonal (Shell-style) on all
  five phases; Platform overflow — page contains X, scoop alone owns Y; `AzesMainContent`
  no longer sets default `overflowX:auto` (was forcing a second scrollport).
- 2026-10-19 — `azes-ui` dual scrollbar fix: removed page-level `overflowX:hidden`
  (`ShowcaseApp` / `PhaseView`) — CSS was forcing nested `overflow-y:auto` inside
  scoop; `styles.css` locks `html/body/#root` overflow so only scoop scrolls.
- 2026-10-19 — `azes-ui` 5-phase catalog: toolbar Foundations/Controls/Data/Shell/Platform;
  `PhaseView` + local `ShowcaseParallaxBand`/`DiagonalDivider` (Caspian diagonal fixed
  photo); demos via existing `SectionContent`; AI rail + settings gear. Port 7777.
- 2026-10-19 — `azes-ui` empty Caspian shell baseline (superseded by 5-phase catalog).
- 2026-10-16 — Caspian directory pages (Houzez-style, existing `@azes/ui-web` only):
  Daily rent booking summary; Agencies list+`/agencies/[slug]` + StickySidebar;
  Complexes list+`/complexes/[slug]` + StickySidebar; Mortgage sliders/SVG/FAQ/
  banks + StickySidebar. Home/Search/Sale untouched. i18n en/az/ru.
- 2026-10-16 — Listing Quick View: `PropertyQuickViewDialog` + `ThreeDotsLoader` (~1s
  card overlay); `ListingCard` expand (`IconFullscreen`); SearchView one dialog
  instance. Details `ListingView` uses `StickySidebar`; `getPropertyUrl` helper.
  i18n `quickView.*` en/az/ru. No new carousel/dialog libs.
- 2026-10-16 — `ListingGrid` `compact` (search/map+sidebar): max **2** cols (was 3) —
  `ListingGrid.tsx`; SearchView/skeleton inherit via `compact={showMap || showSidebar}`.
- 2026-10-16 — SSR settings cookie helper `@azes/ui-web/settings/ssr`
  (`settingsPatchFromCookieRaw`) so Next layouts can pass `density` (and other fields)
  via `initialSettings` — fixes `MuiList-dense` hydration when cookie has `compact`.
  Caspian: `azes-settings.caspian` in `real-estate-site` root layout.
- 2026-10-16 — Marketplace `StickySidebar` + `useStickySidebar` (Houzez Theia): modes
  `static | fixedTop | fixedBottom | absolute`; scroll math via refs/rAF + direct DOM
  styles (no React setState per scroll); scoop `[data-azes-scoop]` as scrollport;
  `topOffset`/`bottomOffset`/`containerRef`/`disabledBelow`; RO on wrapper+aside+row
  (Load More). Replaces `StickyAsidePanel`. SearchView wires listings row. Nested
  scrollbar avoided. `lg+`; mobile static duplicate.
- 2026-10-16 — Caspian global page transition loader: top progress bar + blurred house
  overlay (`PageLoaderProvider` in `AppProviders`); App Router click/popstate bridge;
  query-only → bar; `common.pageLoading` en/az/ru; route `loading.tsx` drives provider
  (no duplicate overlay) — `src/components/common/PageLoader/*`.
- 2026-10-16 — Caspian `/search` (+ sale/rent/daily): parallax hero removed; page title
  in `PageHeaderBand` Paper (breadcrumb secondary link / primary current, `body1`);
  shell full-bleed only on home — `PageHeaderBand`, `SearchView`, `DealScopedSearchView`,
  `CaspianSiteShell`.
- 2026-10-16 — Listing hero: `ParallaxBand diagonalEdge="bottom"` (flat top flush under
  toolbar via chrome-join negative margin; only bottom slant). Kept for reuse;
  search discovery no longer mounts it.
- 2026-10-16 — Caspian `/search` (+ sale/rent/daily): discovery body in `AzesContentRail`.
  Desktop sidebar sticky. Discovery bar / toolbar / Load More — `SearchView`,
  `DealScopedSearchView`.
- 2026-10-16 — Caspian `/search` Houzez Listing v1 frame: inline `SearchDiscoveryBar`,
  results toolbar (count + sort + grid/list/map), sticky `ListingDiscoverySidebar`
  (featured / status / type facets / recently viewed / about+contact), explicit
  **Load More** (no IntersectionObserver). Desktop `main | sidebar`; mobile sidebar
  stacks below results. Skeleton layout-matched. Tokens only —
  `features/search/components/*`, `ListingGrid` compact with sidebar.
- 2026-10-16 — `AzesDashboardLayout`: removed `useMediaQuery(..., { noSsr: true })` so
  SSR + first client paint share `defaultMatches` (avoids dual-chrome vs fixed-rail tree
  fork / hydration mismatch). Brief desktop remount to real breakpoint after hydrate is
  expected — `AzesDashboardLayout.tsx`; see `11-responsive.md`.
- 2026-10-15 — Caspian `ListingCard` title is semantic **`h3`** wrapping the
  stretched `Link` (card body text stays crawlable with SSR hydrate) —
  `ListingCard.tsx`.
- 2026-10-15 — Caspian home **agent cards** redesign (`HomeAgentsBand`): soft primary
  wash, dual-ring portrait, compact circular verified badge, location+listings meta,
  divider + chevron CTA; hover lift (`translateY`) + ring glow (reduced-motion safe);
  grid `xs1 / sm2 / lg4` — theme tokens only.
- 2026-10-15 — Style prefs **`prefsScope`**: marketplace (`caspian`) uses namespaced
  cookies (`azes-ui.caspian`, `azes-settings.caspian`, …); account/admin/agent-site keep
  shared unscoped sync. Auth cookies untouched — `configureAzesPrefsScope` /
  `azesPrefsKey` in `crossPortStorage`; `AzesUiProvider prefsScope`; real-estate wiring.
- 2026-10-15 — Contained `MuiButton` labels forced **white** on `primary`/`secondary`
  `.dark` fill (dark-scheme light `main` no longer yields black text) —
  `packages/ui-web/.../buttons.ts`. ParallaxBand bottom cut pad ≥ diagonal `h`+48;
  inquiry band extra `pb` so CRM card clears slant — `ParallaxBand` / `HomeInquiryBand`.
- 2026-10-14 — Caspian marketplace **banded footer** (`CaspianSiteFooter`): partners
  strip + about/contact + legal/social; `AzesFooter flush`; icons Facebook/X/IG/LI.
- 2026-10-14 — Caspian Fixed/Fluid: home main `constrain: false` + `disablePadding`;
  hero/parallax/section backgrounds + footer chrome stay **full-bleed**; copy/grids
  use new `AzesContentRail` (settings Fixed caps at `contentMaxWidth`). Default
  marketplace container = **fixed**. Footer outer never maxWidth-capped.
- 2026-10-14 — Caspian `ListingGrid` default **4 cols** (lg); map/sidebar split uses
  `compact` (≤3). Home featured = teaser ×8 + “Daha çox” → `/search`. Search discovery
  = infinite pages + **Load More** (`pageSize: 8`). Toolbar nav: **Elanlar** → `/search`.

- 2026-10-12 — Admin mini-rail **Site** entry (`rail-site`, `IconGlobe`) under Profile:
  opens `useAzesDialog` Site Entry (fullScreenOnMobile) with View / Configure actions
  (`features/site-entry`); View → Next agent-site public URL; Configure → account handoff
  to `…/manage`. Responsive stacked action buttons + caption hints.

Newest first. One bullet per change set. Format:
`YYYY-MM-DD — what changed — files/exports — how it works now (one clause)`.

- 2026-10-14 — Caspian homepage hero → Houzez full-viewport (`100svh/dvh` − chrome),
  primary wash top→bottom harden on `HeroVideo`, value cards separate with hover
  lift + shadow; `DiagonalDivider` seam kept — `HomeView` / `HeroVideo`.
- 2026-10-14 — Admin MetricSlides stuck on slide 2: `useAutoLoopCarousel` now
  completes transitions via `TRANSITION_MS` timeout (opacity stack has no CSS
  `transitionend`) so autoplay + arrows loop 1→2→3→4→1 — `useAutoLoopCarousel.ts`.
- 2026-10-14 — Caspian homepage **types + areas** redesign: types = centered
  responsive **grid** (illustration-first mesh + SVG motifs when no photo);
  areas = soft-masked **snap carousel** (unique Bakı photos or mesh fallback,
  no shared images); uniform `aspect-ratio` cards, glass info panel, arrow CTA,
  `home.areas.cityLabel` i18n (fixes raw key); hover/focus/visibility/reduced-motion
  — shell/theme untouched (`DiscoverSlideCard`, `DiscoverCarousel`,
  `DiscoverMotif`, `DiscoverSectionChrome`, `HomeView`).
- 2026-10-14 — Caspian homepage **types + areas** → infinite CSS `LoopSlideRail`
  photo cards (`DiscoverSlideCard`); types drift L→R, areas reverse + staggered
  heights; hover/focus/pointer pause; `prefers-reduced-motion` = snap-scroll row;
  en/az/ru rail labels — shell/theme untouched
  (`HomeView`, `LoopSlideRail`, `DiscoverSlideCard`, `areas.ts`).
- 2026-10-13 — Caspian `ListingCard` **image not found** placeholder (soft gradient +
  dashed icon circle + `card.imageNotFound` / `card.imageNotFoundHint` en/az/ru);
  broken `img` → same placeholder — shell/theme tokens unchanged.
- 2026-10-13 — Caspian `ListingCard` → Houzez listing-v7 style: image overlays (deal/
  type/featured + AZN + AZN/m²), address + beds/baths/area meta, agent footer with
  call/WhatsApp/email; new `@azes/ui-web/icons` (`IconBed`, `IconBath`, `IconPlace`,
  `IconPhone`, `IconEmail`, `IconWhatsApp`, `IconSquareFoot`); i18n `card.*` en/az/ru —
  shell/theme tokens unchanged.
- 2026-10-13 — `AzesScrollToTop`: circular FAB + SVG ring border that fills with
  scroll progress (scoop/window); `theme.shape.radiusFull`.
- 2026-10-13 — Caspian hero seam: drop `clip-path` (black media void under slant);
  use `DiagonalDivider fill=paper` like types/areas so no dark rectangle under
  the diagonal. `HeroVideo` still avoids CSS `filter`. ParallaxBand untouched.
- 2026-10-13 — Caspian homepage diagonals restored (hero `clip-path`, fixed
  `ParallaxBand`, `DiagonalDivider` seams). Section roots: `boxShadow/filter: none`
  so border-box shadow cannot paint a rectangle under the slant.
- 2026-10-13 — Caspian hero loop: keep `baku-night-01/02`, add `baku-skyline.jpg`
  (Heydar Aliyev Center), remove `baku-night-03.jpg`; Pinterest pins mood-only
  (no hotlink) — extra `baku-caspian-01.jpg` stored locally.
- 2026-10-13 — Caspian homepage hero: Wikimedia night Baku trio
  (`baku-night-01/02/03.jpg`) loop with stronger Ken Burns + night pulse + soft
  crossfade (`HeroVideo`); reduced-motion = slide 1 static; shell/theme untouched.
- 2026-10-13 — Caspian homepage promo fixed band: `/home/photos/luxury-interior.jpg`
  (luxury modern living room, local Unsplash copy) via `ParallaxBand`; shell/theme
  untouched. Pinterest pin used as mood ref only — not hotlinked.
- 2026-10-13 — Caspian homepage promo fixed band: `/home/photos/luxury-home.jpg`
  (Wikimedia Villa Casa del Mare) via `ParallaxBand`; shell/theme untouched.
- 2026-10-13 — Caspian homepage hero: replaced `<video>` with Wikimedia
  `/home/photos/baku-skyline.jpg` (Baku / Heydar Aliyev Center) + CSS Ken Burns, film
  grain, light sweep (`HeroVideo`); `prefers-reduced-motion` = static; diagonal
  `clip-path` kept; shell/theme untouched — see `styles-current/homepage-assets.md`.
- 2026-10-13 — Caspian homepage: hero video = Wikimedia _View from Hilton, Baku_ (calm
  skyline); promo/hero use **diagonal `clip-path`** so media edges follow the slant (not
  rectangle + white wedge); `ParallaxBand` fixed window kept; shell/theme untouched.
- 2026-10-13 — Caspian homepage **hero video + fixed promo**: full-bleed
  `/home/videos/baku-aerial.webm` + overlay value cards; `ParallaxBand` clip-path/`fixed`
  window (scoop-safe); paper diagonals only; shell/theme untouched.
- 2026-10-13 — Caspian homepage **visual fix**: diagonals absolute inside sections (no
  standalone wedge); explicit ink/`onDark` contrast; sticky `ParallaxBand` +
  `/home/photos/{hero,promo,p*,a*}.jpg`; `ListingCard` home body text forced readable —
  shell/theme untouched.
- 2026-10-13 — `real-estate-site` marketplace nav scaffolding: toolbar IA (home/sale/rent/
  daily-rent/agencies/complexes/mortgage) + rail (favorites/account/settings); agent mode
  hides agencies/complexes; placeholder scoop pages; en/az/ru labels — no filters, no shell
  visual change, existing pages preserved.
- 2026-10-13 — `real-estate-site` Phase 2 scoop UI: photo-first `HomeView` hero + featured
  grids/areas/agents; shared `ListingCard`/`ListingGrid`; Search filters `AzesSidePanel` +
  sort `AzesMenu` + lg map placeholder; Listing `AzesCarousel` + xs sticky contact; Agents/
  Favorites with `AzesEmptyState`/`AzesSkeleton`; `IconFavorite*` in `@azes/ui-web/icons`.
- 2026-10-13 — `real-estate-site` Phase 1 Caspian L-shell: `AzesUiProvider` (navLayout
  horizontal locked, settings drawer hidden) + `CaspianSiteShell` (`AzesNavProvider` Next
  Link adapter + `AzesDashboardLayout` toolbar/rail/scoop) + marketplace nav IA; scoop
  placeholders only — no `AzesMainLayout`; content Phase 2.
- 2026-10-13 — Caspian Key **homepage visual** (Houzez-inspired): scoop-only sections
  (hero, value props, featured cards `variant=home`, diagonal SVG dividers, ParallaxBand
  fixed/scroll fallback, types grid, agents, testimonials); local `/home/*.svg` assets
  (Unsplash CDN blocked); shell/theme untouched — `HomeView` + `homepage-assets.md`.
- 2026-10-13 — Docs: `real-estate-site.md` **shell correction** — keep `AzesDashboardLayout`
  L-shell (toolbar + mini-rail + scoop curve); marketplace content in scoop only; reject
  `AzesMainLayout` marketing chrome; still pre-code.
- 2026-10-13 — Docs: `real-estate-site.md` revised as **Caspian Key** brief — marketplace +
  agent-subdomain modes, 6 UX scenarios, mock repos, phases, API verify list; still
  pre-code (no app implement).
- 2026-10-13 — Docs: `docs/styles-current/readme.md` (özü-özünə kifayət stil/settings/token
  cəmi) + `real-estate-site.md` (public marketing brief: `AzesMainLayout`, eyni
  primary/settings; implementasiya yox) — platform kodu dəyişməyib.
- 2026-10-13 — `@azes/real-estate-site` Next shell Home: mobile-first `MuiBox` padding
  (`xs`→`md`), primary-tinted soft gradient via `theme.vars` + `color-mix` — no new tokens;
  port `4000` (`agent-site` Next uses `3000`).
- 2026-10-15 — Caspian **Nə axtarırsınız?** `HomePromoBand`: Houzez icon cards,
  exact **16px** gap, hover grow+darker (rent-card style); 4th “Need help?” card;
  en/az/ru `home.promo.headline` + `helpTitle`.
- 2026-10-15 — Caspian **Əmlak tipinə görə bax**: Houzez masonry `PropertyTypeBento`
  (4-col wide/tall tiles, uppercase captions); curated heroes under
  `/home/photos/types/*.jpg` (apartment/house/office/land/commercial).
- 2026-10-15 — Caspian home section order: featured carousel → promo (“Nə
  axtarırsınız?”) → property types → CRM inquiry → areas → agents → testimonials.
- 2026-10-15 — Caspian home **Seçilmiş elanlar**: one-row `FeaturedListingsCarousel`
  (pageSize 8, prefetch at 7th, max 24 then seamless 24→1→2 loop); infinite Query
  `useHomeListingsCarousel`; en/az/ru rail labels.
- 2026-10-15 — Caspian home: original buy/sell/rent **promo** `ParallaxBand` kept in
  place; **CRM inquiry** `HomeInquiryBand` added after it (`luxury-home.jpg`);
  en/az/ru `home.inquiry.*`; form → `leadRepository` (`contact`).
- 2026-10-15 — Footer snap at scroll end (Caspian `/search`): bottom chrome lock
  uses unlock-band hysteresis; conceal no longer `pinScrollToBottom`; SearchView
  infinite scroll observes scoop + preserves near-footer scroll on page append.
- 2026-10-14 — Global canvas text (light/dark): `navToneVars` no longer sets
  `color` on layout ancestors (contrast chrome white was inherited into scoop →
  white-on-white). Rail/header/mobile set `color: var(--azes-nav-text*)`; scoop +
  `AzesMainContent` reset `color: text.primary`. Affects all AzesDashboardLayout apps.
- 2026-10-14 — Caspian marketplace cards: `sx` `borderRadius: theme.shape.radiusLg`
  was multiplying by `shape.borderRadius` (8×12=96px → pill cards). Fixed to
  `` `${theme.shape.radiusLg}px` `` across SectionCard, LeadForm, MapAdapter,
  listing/mortgage/daily-rent/agencies/complexes/contact. Rule: in `sx`, radius
  tokens must be px strings — bare numbers are not pixel values.
- 2026-10-14 — Admin dashboard **bento redesign** (`features/dashboard/**` UI only):
  `styles/tokens.ts` (primary=listings / secondary=sales, paper cards, dark hero);
  `SegmentedControl` for period + admin tabs; MetricSlides = single dark hero +
  story progress + 4 real visuals (ring / dual bar / gauge / stack); KPI = paper
  2×2 with one filled Listings card + sold-share inside Sold card; AdminViews =
  ratio stat strip + LeaderboardList (no scatter) + donut with legend/center total;
  neon/glass trays removed; i18n en/az/ru; Worker/API untouched.
- 2026-10-13 — Admin dashboard metrics band (fintech charts): KPI cards each have a
  distinct decorative spark (area / bars / dual-line / stepped) via deterministic
  `charts/decorativeSeries.ts` + `@mui/x-charts` SparkLine/Line/Bar/Gauge; no axis/
  tooltip/trend %; `aria-hidden` + `pointer-events: none`. MetricSlides: per-slide
  gradient + distinct hero chart; pagination glass tray below chart (no overlap).
  Real KPI numbers / sold-ratio % unchanged. Skeleton matches chart bands.
- 2026-10-13 — Admin dashboard metrics band: MetricSlides card has no title/arrow/
  pause chrome (dots only); height matches KPI 2×2 grid via `lg` 2×2 band
  (`minmax(0,1fr)` + `auto` progress row). Autoplay + sold-ratio `LinearProgress`
  each live in independent `glassTray` cells, side-by-side on the same X axis.
- 2026-10-13 — Admin MetricSlides (prior): single full-height gradient card; grid
  `minmax(0,1fr)`; charts width fill + donut `width={height}`; autoplay progress
  clamped 0–100.

- 2026-10-12 — Dashboard KPI/MetricSlides: gradient cards (primary/secondary);
  real totals in text; decorative `AzesLineChart` wave + `AzesPieChart` donut
  with fake deterministic series, no tooltip (`pointer-events: none`). Admin
  Summary still uses real donut/scatter.

- 2026-10-12 — Dashboard charts v3: `AzesScatterChart` added to `@azes/ui-web/charts`;
  admin leaderboard = real scatter; no app-level `@mui/x-charts`.

- 2026-10-12 — Dashboard charts v2: removed 2-point sparklines; real-ratio
  charts via `@azes/ui-web/charts` (superseded by v3 donut+scatter only).

- 2026-10-12 — Admin Dashboard glass redesign: SVG backdrop + `glassSx` helper,
  `useAutoLoopCarousel` autoplay/loop MetricSlides (dots + progress, no lib),
  modern KPI count-up + icon badges; Interest/Calendar/Todo/AdminViews share glass —
  compose in `apps/admin/src/features/dashboard/**` only.

- 2026-10-12 — Admin `public/favicon.ico` regenerated as home mark @ `DEFAULT_PRIMARY`;
  `index.html` links it with `data-azes-favicon` so FOUC/`applyAzesFavicon` rewrite to
  primary-tinted SVG data-URL (.ico file itself stays static fallback only).

- 2026-10-11 — Admin **Dashboard** UI polish: tinted page chrome (Roles-like), KPI tint
  cards + sold-ratio progress, MetricSlides CSS scroll-snap + prev/next + LinearProgress
  (no AzesCarousel/Swiper/Recharts), MetricSlides|KPI `lg` 6/6 grid, mobile-first period
  tray, AdminViews scrollable tabs + summary tiles, layout-matched skeleton — compose
  only in `apps/admin/src/features/dashboard/components/*`.

- 2026-10-11 — Nav menus toolbar: prior icon-above-label look, equal-width cells +
  ellipsis/overflow tooltip; Docs/AI stay on desktop mini-rail; mobile drawer pins
  them in sidebar footer; sidebar brand divider + menu scroll retained.

- 2026-10-11 — Header fullscreen: `AzesFullscreenButton` + `useFullscreen`
  (`@azes/ui-web/layout`); admin `headerEnd` (before language); en/az/ru enter/exit labels;
  control hidden when Fullscreen API unsupported.

- 2026-10-11 — **Dynamic home favicon**: `azesFavicon` builds Material Home SVG from brand
  primary; Vite `createAzesFaviconHtmlPlugin` FOUC from `azes-ui`/`azes-primary`;
  `AzesUiProvider` re-tints on settings primary change; admin/account `public/favicon.svg`
  = home @ `DEFAULT_PRIMARY` fallback.

- 2026-10-11 — Admin **Roles** page redesign: access-role `RoleCard` (monogram, Active/Archived,
  ID + menu-access chips, Edit/Delete), stats strip + tinted page chrome in `RolesView`,
  denser `RolesCardGrid` / matched skeleton; en/az/ru `rolesAdmin.status|stats|card*` —
  cards read as access-control units, not empty outline boxes.

- 2026-10-11 — Login shell v3: static labels; 5 scatter cards + `loginShellScatter`;
  `useLoginSuccessTransition` (hold 5s, skip, fallback); single canvas language menu; env chip
  removed; docs `31-login-shell.md`. Theme sync untouched.

- 2026-10-11 — Login shell fixes: `LanguageMenu`/`CaspianLogo` `tone=onChrome|onPaper`;
  showcase SVG cards; device-ID security row; prior settle path superseded by scatter/hold;
  `loginShell.settleEasing`; docs `31-login-shell.md`. Theme sync untouched.

- 2026-10-11 — Account login **Chrome & Canvas**: `navToneVars` chrome + scoop-radius canvas;
  `theme.azes.loginShell`; `LoginShowcase` (no photo); prior canvas expand superseded by showcase
  settle; docs `31-login-shell.md` (`30-login-hero` superseded). Theme sync untouched.

- 2026-10-11 — Agent Dizayner roster rename + slim rule — `uiDesignAgent.mdc`,
  `coordinator-agent.mdc` — workers suggest gates only; Coordinator runs build/git.
- 2026-10-11 — Admin locale URL prefix `/en|az|ru/...`; menus toolbar indeterminate
  Caspian-wave ribbon while `user-menu` pending (`navLoading` → `AzesHorizontalNav`).
- 2026-10-11 — Dual-chrome brand strip: logo flush to rail edge (stacked over mini
  icons); Apps collapse slides logo inline-end (`data-azes-brand-strip`).
- 2026-10-11 — CaspianLogo dual-tone: mark/wordmark `primary`, tagline `secondary`;
  dark + contrast nav use lighter `color-mix` lifts (`resolveCaspianLogoFills`).
- 2026-10-11 — Header brand logo uses `full` (wordmark + tagline); was `compact`
  which hid `[data-name="P"]` (“real estate company”).
- 2026-10-10 — Global table empty labels via `AzesTableLabelsProvider` (admin
  `DialogLabelsBridge` → `table.emptyTitle` / `emptyDescription`); feature tables omit
  per-page empty wiring; `AzesEmptyState` still replaces the grid when `data` is empty.
- 2026-10-10 — `AzesEmptyState` Paper for empty tables (`@azes/ui-web/table`); AzesTable
  replaces the grid (not in-cell overlay).
- 2026-10-10 — All logos → `caspian-key-logo-global.svg` (admin `CaspianLogo`, account
  `CaspianKeyLogo`, azes-ui `ShowcaseLogo`, favicons); single `currentColor` / primary tint.
- 2026-10-10 — Global `AzesSkeleton` / `AzesSkeletonGroup` (`@azes/ui-web/skeleton`,
  `theme.azes.skeleton`, Caspian-wave overlay); Users/Ads partial skeletons +
  `useSkeletonGate`; `RoutePageSkeleton`; docs `29-skeleton.md`.
- 2026-10-10 — `AzesMenu` paper radius fix (`paperRadius` px string; bare `sx` numbers
  were × `shape.borderRadius`); `AzesAccountMenu` migrated to `AzesMenu`; language +
  account header chrome aligned.
- 2026-10-10 — Dual chrome header always shows `slots.logo` (superseded 2026-10-11
  brand-strip flush/rail alignment).
- 2026-10-11 — Caspian Key global loaders: admin `NavigationLoader` + enhanced
  `CaspianLoader` (LinearProgress, glass fullscreen); account `CaspianKeyLoader` for
  boot + `:5173`→`:5174` handoff; `common:loading.subtitle|handoff*`; docs `25`.
- 2026-10-11 — Loader exclusivity + auth-lab scroll: `RoutePageSkeleton`/`AppShellSkeleton`
  alias `RouteLoader`; Design Lab Caspian Key demos (section/handoff/fullscreen framed);
  `announce={false}` mid-page; `ScrollToMain` manual restore + delayed scoop reset (no RR
  `ScrollRestoration`); skip-link `focus({ preventScroll: true })`.
- 2026-10-11 — Cross-port theme sync (account `:5173` ↔ admin `:5174`): settings + primary +
  `azes-mode` mirrored to cookies (`azes-settings` / `azes-primary` / `azes-mode`); MUI
  `storageManager`; index.html pre-paint cookie fallback; `configureAzesPrefsCookie`.
- 2026-10-11 — Cross-port fix: cookie is source of truth (was localStorage-first → stale
  port prefs ignored cookie); FOUC + `storageManager` + settings rehydrate on
  focus/visibility; prod via `VITE_AUTH_COOKIE_DOMAIN`.
- 2026-10-11 — Cross-port hard fix: compact `azes-ui` cookie (`1|primary|mode`);
  `@azes/ui-web` `development` export → `src/` so Vite picks live theme sync (was stale
  `dist/`); rebuild `dist` for prod.
- 2026-10-11 — Menus toolbar pending: indeterminate Caspian-wave ribbon (no fake N-item
  button skeletons); docs `29-skeleton.md`.
- 2026-10-11 — Fullscreen loaders (`CaspianLoader` / `CaspianKeyLoader`): real glass via
  `getBackdropSx` + stronger blur; opaque gradient replaced; docs `25`.
- 2026-10-11 — Contrast nav readability: darkened menus wash + white captions; contrast
  dark chrome no longer pale paper. Defaults: red primary, contrast nav, autoHide first
  in settings cards; mode stays `system`.
- 2026-10-11 — Menus toolbar gradient softened (multi-stop bloom); primary reads stronger,
  black edges less harsh.
- 2026-10-11 — autoHide short-page trap/jitter: `canChromeAutoConceal` (min 60px scroll +
  overflow vs chrome collapse); `AzesScrollToTop` in dashboard layout.
- 2026-10-12 — Agent-site **public catalog** (`features/catalog`): hero (gradient
  visual + initials avatar left / agent copy right; stack on xs) + 1→2→3 listing
  card grid; no owner chrome; stub Query until publicKey API; i18n `catalog`.
- 2026-10-12 — `@azes/ui-web/skeleton`: `'use client'` on entry + `AzesSkeletonGroup`
  so Next App Router (agent-site) does not RSC-evaluate MUI `useMediaQuery`.
- 2026-10-12 — Agent-site owner shell chrome: `AgentSiteHeader` (profile band) +
  `AgentSiteNav` (listings / sold / profile dialog) + `AzesSettingsButton` /
  `AzesSettingsDrawer` via `AzesUiProvider` (same primary/mode/density tokens as admin);
  locale routes `/{locale}/` + `/{locale}/sold-item`.
- 2026-10-11 — Horizontal menus toolbar: `AzesNavScroller` — fixed-width cells, label
  ellipsis + overflow tooltip; `lg+` always-visible native x-scrollbar (clip fix), `md`
  arrow scroll; mobile stays sidebar; docs `09-navigation.md`.
- 2026-10-11 — Settings font cards: compact horizontal sample tiles; preset set replaced
  with distinct faces (`inter`, `sourceSerif`, `nunito`, `ibmPlexSans`, `fraunces`);
  legacy neo-grotesk ids migrate. Docs `06-typography.md`.
- 2026-10-11 — `AzesCarousel` distant thumbnail jump: instant scroll when `|Δ| > 1`,
  viewport-based `scrollLeft`, session-guarded unlock (no stale IO/index clobber),
  thumb strip `scrollBy` instead of `scrollIntoView`.
- 2026-10-10 — Global `AzesMenu` + glass `MuiBackdrop` (`theme.azes.menu` /
  `theme.azes.backdrop`); admin `LanguageMenu` (no flags); docs `27-menu.md` /
  `28-backdrop.md`; component-level Dialog/SidePanel/Carousel backdrop sx removed.
- 2026-10-10 — Global `AzesSidePanel` (`@azes/ui-web/side-panel`, `theme.azes.sidePanel`);
  Settings + Ads filters migrated; Ads search accordion removed; docs `26-side-panel.md`.
- 2026-10-10 — Admin `CaspianLogo` / `CaspianLoader` (`apps/admin/src/loading`),
  `theme.azes.loader`, header brand link, Suspense/boot `RouteLoader`, Design Lab demos,
  docs `25-logo-and-loading.md` — CSS-only motion; source SVG unchanged.
- 2026-10-10 — `AzesCarousel` (scroll-snap, `theme.azes.carousel`) + dialog optional
  `lg` / fullscreen-mobile / close / hideFooter / paddingless; Ads photo→details dialog
  via `GET /api/v1/data/{id}`; Design Lab demos; docs `24-carousel.md` + `23-dialog` —
  no slider library dependency.
- 2026-10-10 — Global `AzesDialog` Context queue (`useAzesDialog` / `openDialog`),
  `theme.azes.dialog`, Users/Ads migration, en/az/ru labels, Design Lab demos, `no-alert`,
  docs `23-dialog.md` — no Redux dialog state.
- 2026-10-09 — `AzesAccordion` search/crud + `AzesFormGrid`/`AzesConfirmDialog`;
  `theme.azes.accordion`; Users/Ads filter+CRUD migration; `AzesTable.highlightedRowId` —
  see `22-accordion.md`.
- 2026-10-09 — Five global font presets (`inter`, `manrope`, `plusJakarta`, `dmSans`,
  `spaceGrotesk`): tokens + `@fontsource-variable/dm-sans|space-grotesk`, deduped
  `loadAzesFont`, settings drawer Font cards (`Ag` + AZ sample), en/az/ru labels —
  pipeline unchanged (`azes.settings.v1.fontFamily` → theme).
- 2026-10-09 — AzesTable: no inner Y scroll (`overflow-x` only); `maxHeight` ignored;
  Users/Ads/demos drop `maxHeight` — page/scoop owns vertical scroll.
- 2026-10-09 — AzesTable (`@azes/ui-web/table`, ADR-017): TanStack + MUI Table, sticky
  actions, `theme.azes.table`; Users/Ads migrated; DataGrid left for demos; ESLint ban;
  docs `21-table.md`.
- 2026-10-09 — L-shell scoop join syncs with header autoHide: flatten radius on conceal,
  restore curve on show (`CHROME_MOTION_MS`, `onConcealedChange` → `data-azes-scoop-join`).
- 2026-10-09 — Header autoHide anti-jitter: settle lock (`CHROME_SETTLE_MS`) + show-up
  hysteresis (`CHROME_SHOW_UP_PX`) in `AzesHeader` so L-shell scrollTop compensation cannot
  flip-flop chrome; Apps `visibilityPin` and bottom-edge lock unchanged.
- 2026-10-09 — AzesDataGrid redesign: `theme.azes.dataGrid` metrics, `dataGridStyles.ts`,
  default `autoHeight` + optional `maxHeight`, CSS sticky actions (`azes-sticky-end`, not Pro
  pinning), clean header/sort chrome; admin Users/Ads + Design Lab + azes-ui use
  `maxHeight="…vh"` — see `13-mui-x.md`, ADR-013 sticky note.
- 2026-10-09 — Admin `#/auth-lab` → `DesignLabPage` (buttons, inputs, table, AzesDataGrid);
  JWT HomePage unwired for now; nav label Design Lab.
- 2026-10-09 — OKLCH color system: denser 12 seeds + curated secondaries, tinted surfaces,
  `color-utils`/`surfaces`, contrast gate + snapshots/fuzz, `pnpm color:report`, azes-ui Colors
  grid — see `05-color-system.md`.
- 2026-10-09 — Introduced UI Design Agent rule + this snapshot — `.cursor/rules/uiDesignAgent.mdc`,
  `docs/styles/CURRENT-STATE.md`, parent-rule pointers — agents attach `uiDesignAgent` and read
  this file before UI/theme work instead of full-platform re-audit.
- 2026-10-19 — `apps/azes-ui` AI sheet: grounded chat UI (`AiChatMessages` / `AiChatComposer`)
  inside the existing bottom-end Drawer; tokens only (`background.muted`, `primary`, border);
  responsive xs full-bleed / sm 380; NVIDIA via Vite proxy (no client key).
- 2026-10-19 — azes-ui AI tool actions: whitelist `set_color_mode` / `set_azes_setting` /
  `get_ui_state` (same APIs as settings drawer); caption tool status in chat panel.
- 2026-10-19 — `apps/academy` Caspian shell adoption (`AzesDashboardLayout`,
  empty primary `nav`, `AzesLocaleMenu`, settings drawer, mini-rail AI stub panel); port
  `:200`; no NVIDIA — AI chrome stub only.
- 2026-10-19 — Academy `headerEnd`: `AzesAccountMenu` (`surface="nav"`) after locale —
  JWT `fullName`/`role`, logout → `logoutAcademyAndRedirect` (best-effort API + Account);
  i18n `shell.account` / `shell.logout` en/az/ru.
- 2026-10-19 — Account login `AuthFormCard` error/warning alerts: full-width wrap,
  `overflowWrap`/`wordBreak`, xs→sm typography — Phase 2C API error messages readable
  on mobile (tokens only).
- 2026-10-19 — Account login Phase 2E `errors.rateLimited` (en/az/ru) uses the same
  responsive `AuthFormCard` error Alert (no new tokens/hex).
- 2026-10-20 — Academy shell Phase 2F: `useAcademyMe` feeds `AzesAccountMenu`
  displayName/subtitle from `/api/v1/me` with JWT session fallback (no new tokens).
- 2026-10-20 — Account login copy → AZES Academy / LMS (en/az/ru): brand, welcome,
  showcase hero + 5 decorative card labels (courses/progress/path/kanban); layout,
  tokens, and card chrome unchanged (`31-login-shell.md`).
