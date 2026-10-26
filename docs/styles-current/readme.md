<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-current/readme.md
║ Author: AZES_COMPANY
║ Created: 2026-10-13
║ Updated: 2026-10-13
║ Purpose: Self-contained snapshot of all AZES web style/theme configurations
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# AZES stil konfiqurasiyaları — tam cəm (styles-current)

Bu fayl monoreponun **web UI / theme / stil** konfiqurasiyalarını bir yerdə, özü-özünə
kifayət edəcək şəkildə toplayır. Məqsəd: yeni app (məs. `real-estate-site`) qurarkən eyni
token, theme, settings və komponent platformasını təkrar kəşf etməmək.

**Qayda:** rəng, radius, spacing, layout ölçüsü — sərbəst hex/px yazılmır; aşağıdakı token və
theme dəyərləri istifadə olunur. Komponentlər `@azes/ui-web` (+ subpath) public API-dən gəlir.

---

## 1. Stack (qatlar)

```text
@azes/design-tokens          (React/MUI YOX — yalnız dəyərlər)
        ↓
@azes/ui-web                 createAzesTheme + component overrides + catalog
  ./settings                 AzesUiProvider, settings store, drawer
  ./layout                   Dashboard / Main / Auth shells, header, chrome
  ./navigation               nav schema, filter, renderers
  ./icons                    curated icons
  ./table                    AzesTable (default məhsul cədvəli)
  ./data-grid                AzesDataGrid (legacy / demo)
  ./charts                   MUI X charts (lazy)
  ./forms                    AzesForm + RHF fields
  ./feedback                 snackbar + useAzesDialog
  ./side-panel               sağ Drawer host
  ./menu                     AzesMenu
  ./backdrop                 glass MuiBackdrop
  ./locale                   AzesLocaleMenu, AzesAccountMenu
  ./skeleton                 AzesSkeleton / AzesSkeletonGroup
        ↓
apps/*                       yalnız public export; theme wiring + feature UI
```

Stil qərar iyerarxiyası:

```text
Global prinsip
  → tokens / theme
    → theme.components (styleOverrides, defaultProps, variants)
      → AZES komponent
        → sx (yalnız lokal composition: grid, gap, placement)
```

Daimi dizayn qaydası `sx`-də yaşamamalıdır.

---

## 2. Provider axını (admin nümunəsi — eyni mexanizm)

```text
AzesUiProvider (settings)
  → AzesSettingsProvider (azes.settings.v1)
  → AzesThemeProvider (primary / density / font / direction settings-dən)
  → AzesSnackbarProvider
  → AzesDialogProvider
  → AzesSidePanelProvider
```

Admin: `AzesUiProvider` + `AzesDashboardLayout` (L-shell: mini rail + horizontal menus).

Public / marketing sayt: eyni `AzesUiProvider` (və ya `AzesThemeProvider`), amma shell olaraq
`AzesMainLayout` (header + main + footer, side nav yox) — konfiqurasiyalar eyni qalır.

---

## 3. Runtime settings (`AzesSettings`)

Storage açarı: `azes.settings.v1` (localStorage). Cross-port güzgü: cookie `azes-settings`,
compact sync cookie `azes-ui` = `1|<primary>|<mode>`, plus `azes-primary` / `azes-mode`.

| Açar         | Tip                                  | Default             | Qeyd                                          |
| ------------ | ------------------------------------ | ------------------- | --------------------------------------------- |
| `version`    | `1`                                  | `1`                 | migrasiya                                     |
| `primary`    | seed adı və ya `#rrggbb`             | **red** (`#d33a3c`) | brand seed; contrast gate                     |
| `navLayout`  | `vertical` \| `mini` \| `horizontal` | `horizontal`        | product-da adətən gizlidir                    |
| `navColor`   | `contrast` \| `integrated`           | `contrast`          | settings kart sırası: contrast → integrated   |
| `density`    | `comfortable` \| `compact`           | `comfortable`       | control / nav item hündürlükləri              |
| `direction`  | `ltr` \| `rtl`                       | `ltr`               | RTL Emotion cache hələ BLOCKED; default gizli |
| `fontFamily` | 5 preset                             | `inter`             | aşağıya bax                                   |
| `container`  | `fluid` \| `fixed`                   | `fluid`             | fixed → content max 1280                      |
| `headerMode` | `autoHide` \| `fixed`                | `autoHide`          | chrome scroll hide/show                       |

**Color mode** (`light` / `dark` / `system`) settings obyektində deyil — MUI `useColorScheme`,
storage `azes-mode`, HTML atribut `data-azes-color-scheme`. Default: `system`.

Default gizlədilən settings kontrolları: `direction`, `navLayout`.

App override nümunəsi (admin):

```ts
<AzesUiProvider storage="local" defaults={{ navLayout: 'horizontal' }}>
```

Locked / hiddenControls / SSR `initialSettings` dəstəklənir.

---

## 4. Theme API

```ts
type CreateAzesThemeInput = {
  primary?: string;       // seed adı və ya 6-digit hex; default DEFAULT_PRIMARY (red)
  secondary?: string;     // override; yoxdursa curated / derived
  density?: 'comfortable' | 'compact';
  fontFamily?: AzesFontPresetId;
  direction?: 'ltr' | 'rtl';
  tintSurfaces?: boolean; // default true — canvas/paper primary hue ilə tint
};

createAzesTheme(input?): Theme;
```

Theme çıxışı (qısa):

- `cssVariables` + `colorSchemeSelector: 'data-azes-color-scheme'`
- `colorSchemes: { light, dark }`
- `spacing: 4` (4px base)
- `shape`, `breakpoints`, `shadows`, `zIndex`, `transitions`, `typography`, `direction`
- `theme.azes.layout` = `layoutPx`
- `theme.azes.component` = `componentPx`
- `theme.azes.density`
- `theme.azes.customShadows` (`card`, `dropdown`, `dialog`, `nav`)
- `theme.azes.*` komponent tokenləri: `table`, `dataGrid`, `accordion`, `dialog`, `carousel`,
  `loader`, `sidePanel`, `backdrop`, `menu`, `skeleton`, `loginShell`, …

Rəng oxuma: **`theme.vars.palette.*`** (dark/light switch theme rebuild olmadan).

---

## 5. Brand primary seeds (12) — OKLCH → hex

Default primary: **red** `#d33a3c`. Settings swatch sırası (`brandSeedOrder`): red → rose →
orange → amber → teal → emerald → green → blue → navy → indigo → violet → slate.

| Seed    | Light primary | Dark primary | Secondary (light) intent |
| ------- | ------------- | ------------ | ------------------------ |
| red     | `#d33a3c`     | `#fb756e`    | cyan / teal `#008b96`    |
| rose    | `#d3456c`     | `#fb7d98`    | emerald `#00976d`        |
| orange  | `#cf5500`     | `#ff8e59`    | teal `#00858a`           |
| amber   | `#b37900`     | `#f2af48`    | indigo `#515bc3`         |
| teal    | `#008d85`     | `#2dc3b9`    | coral `#d6593a`          |
| emerald | `#009772`     | `#4fcaa2`    | rose `#d14a65`           |
| green   | `#239149`     | `#69c27e`    | magenta `#bb459b`        |
| blue    | `#2279dc`     | `#6dadff`    | orange `#e26b1b`         |
| navy    | `#3a6aa7`     | `#79a7e2`    | amber `#d28f0e`          |
| indigo  | `#5762d5`     | `#8b9bff`    | gold `#cf9c00`           |
| violet  | `#7f56d3`     | `#b296ff`    | lime-gold `#b1b21d`      |
| slate   | `#516d81`     | `#8fa9bc`    | amber `#dd7b2b`          |

`tintSurfaces: true` (default): background canvas/paper/borders/text primary hue ilə yumşaq
tint olunur. Feedback (`success` / `warning` / `error` / `info`) brand-dən asılı deyil —
OKLCH-normalizə olunmuş status rəngləri.

Custom `#rrggbb` yalnız contrast gate keçəndə qəbul olunur (primary contrastText ≥ 4.5:1,
paper/canvas ≥ 3:1, secondary eyni qaydalar).

---

## 6. Design tokens — primitives

Paket: `@azes/design-tokens`. React/MUI asılılığı yoxdur.

### 6.1 Color ramps (seçilmiş dəyərlər)

| Token       | Hex                         |
| ----------- | --------------------------- |
| white       | `#FFFFFF`                   |
| black       | `#0B0F14`                   |
| gray50…900  | `#F8FAFC` … `#0F172A`       |
| navy50…900  | `#E8EEFB` … `#0B1B3A`       |
| teal50…900  | `#E6FAF7` … `#084C45`       |
| red50…900   | `#FEF2F2` … `#7F1D1D`       |
| amber50…900 | `#FFFBEB` … `#78350F`       |
| green50…900 | `#F0FDF4` … `#14532D` (900) |

Semantic (fallback neutrals — `tintSurfaces: false` və ya semantic basing):

**Light:** canvas `gray50`, surface `white`, muted `gray100`; text gray900/600/500; border
gray200/300; action primary teal600; feedback green600 / amber500 / red600 / navy600.

**Dark:** canvas navy900, surface navy800; text gray50/300/400; action primary teal400;
feedback green400 / amber400 / red400 / navy300.

### 6.2 Spacing (4px base)

| Key | rem     | px  |
| --- | ------- | --- |
| 0   | 0       | 0   |
| 1   | 0.25rem | 4   |
| 2   | 0.5rem  | 8   |
| 3   | 0.75rem | 12  |
| 4   | 1rem    | 16  |
| 5   | 1.25rem | 20  |
| 6   | 1.5rem  | 24  |
| 8   | 2rem    | 32  |
| 10  | 2.5rem  | 40  |
| 12  | 3rem    | 48  |
| 16  | 4rem    | 64  |
| 20  | 5rem    | 80  |
| 24  | 6rem    | 96  |

MUI theme: `spacing: 4` → `theme.spacing(1)` = 4px.

### 6.3 Radius

| Key  | rem     | px   |
| ---- | ------- | ---- |
| none | 0       | 0    |
| sm   | 0.25rem | 4    |
| md   | 0.5rem  | 8    |
| lg   | 0.75rem | 12   |
| xl   | 1rem    | 16   |
| full | 9999px  | 9999 |

### 6.4 Breakpoints

| Key | rem   | px   |
| --- | ----- | ---- |
| sm  | 40rem | 640  |
| md  | 48rem | 768  |
| lg  | 64rem | 1024 |
| xl  | 80rem | 1280 |
| 2xl | 96rem | 1536 |

`xs` = 0 (MUI). Layout mobile↔desktop keçidi: `layoutQuery` default **`lg`**.

### 6.5 Typography primitives

**Font families (default tokens):**

- sans / display: `"Inter Variable", Inter, system-ui, …`
- mono: `"IBM Plex Mono", …`

**Selectable presets (`fontFamilyPresets`):**

| Id            | Üz             | Stack               |
| ------------- | -------------- | ------------------- |
| `inter`       | Inter          | neo-grotesk UI      |
| `sourceSerif` | Source Serif 4 | editorial serif     |
| `nunito`      | Nunito         | soft rounded        |
| `ibmPlexSans` | IBM Plex Sans  | engineered humanist |
| `fraunces`    | Fraunces       | soft optical serif  |

On-demand load: `@fontsource-variable/*` via `loadAzesFont` (latin + latin-ext). Legacy:
`default`/`system` → `inter`; `manrope` → `nunito`; `plusJakarta`/`dmSans` → `ibmPlexSans`;
`spaceGrotesk` → `inter`.

**Sizes:** xs 0.75rem · sm 0.875 · md 1 · lg 1.125 · xl 1.25 · 2xl 1.5 · 3xl 1.875 · 4xl 2.25

**Weights:** regular 400 · medium 500 · semibold 600 · bold 700

**Line heights:** tight 1.25 · snug 1.375 · normal 1.5 · relaxed 1.625

**Letter spacing:** tight -0.02em · normal 0 · wide 0.04em

**MUI variants (theme mapping):**

| Variant   | Size | Weight   | LH                        |
| --------- | ---- | -------- | ------------------------- |
| h1        | 4xl  | bold     | tight                     |
| h2        | 3xl  | bold     | tight                     |
| h3        | 2xl  | semibold | snug                      |
| h4        | xl   | semibold | snug                      |
| h5        | lg   | semibold | normal                    |
| h6        | md   | semibold | normal                    |
| subtitle1 | lg   | medium   | normal                    |
| subtitle2 | sm   | medium   | normal                    |
| body1     | md   | regular  | normal                    |
| body2     | sm   | regular  | normal                    |
| caption   | xs   | regular  | normal                    |
| button    | sm   | semibold | tight (no uppercase)      |
| overline  | xs   | medium   | normal + uppercase + wide |

### 6.6 Layout (`layoutPx`) → CSS `--azes-layout-*`

| Key                     | px           | İstifadə         |
| ----------------------- | ------------ | ---------------- |
| headerHeightMobile      | 56           | header (mobile)  |
| headerHeightDesktop     | 56           | header (desktop) |
| navVerticalWidth        | 280          | vertical nav     |
| navMiniWidth            | 56           | mini rail        |
| navMobileWidth          | 288          | mobile drawer    |
| navHorizontalHeight     | 56           | menus toolbar    |
| contentMaxWidth         | 1280         | fixed container  |
| pagePaddingXs / Md / Lg | 16 / 24 / 32 | main content pad |
| settingsDrawerWidth     | 360          | settings         |
| authCardWidth           | 440          | auth card        |
| chromeGap               | 0            | L-shell flush    |
| chromeRadius            | 16           | floating chrome  |
| chromeJoinRadius        | 24           | Adobe scoop join |

### 6.7 Component (`componentPx`)

| Key                  | comfortable | compact |
| -------------------- | ----------- | ------- |
| controlHeight        | 40          | 32      |
| navItemHeight        | 44          | 36      |
| navSubItemHeight     | 36          | 32      |
| navMiniItemHeight    | 56          | 56      |
| navIconSize          | 22          | 22      |
| headerIconButtonSize | 40          | 40      |

### 6.8 Size

| Key              | rem / px                          |
| ---------------- | --------------------------------- |
| iconSm / Md / Lg | 1 / 1.25 / 1.5 rem → 16 / 20 / 24 |
| controlXs…Lg     | 1.75…3 rem → 28…48                |
| containerSm…Xl   | 40…80 rem → 640…1280              |

### 6.9 Shadow / elevation

| Key   | CSS                                  |
| ----- | ------------------------------------ |
| none  | none                                 |
| sm    | `0 1px 2px rgba(15, 28, 44, 0.08)`   |
| md    | `0 4px 12px rgba(15, 28, 44, 0.12)`  |
| lg    | `0 12px 32px rgba(15, 28, 44, 0.16)` |
| focus | `0 0 0 3px rgba(31, 148, 124, 0.35)` |

Native elevation: none 0 · sm 2 · md 6 · lg 12.

### 6.10 z-index

base 0 · raised 10 · dropdown 100 · sticky 200 · overlay 300 · modal 400 · popover 500 ·
toast 600 · tooltip 700.

### 6.11 Motion

| Duration | ms  |
| -------- | --- |
| instant  | 0   |
| fast     | 120 |
| normal   | 200 |
| slow     | 320 |

Easings: standard / emphasized `cubic-bezier(0.2, 0, 0, 1)` · enter `(0, 0, 0.2, 1)` ·
exit `(0.4, 0, 1, 1)`.

Animasiya kitabxanası yoxdur — yalnız MUI transitions + `prefers-reduced-motion`.

---

## 7. Layout shells

| Komponent                                                                 | Rol                                                                          |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `AzesDashboardLayout`                                                     | Admin/dashboard: header + nav (vertical/mini/horizontal) + mobile nav + main |
| `AzesMainLayout`                                                          | Marketing/public: header + main + footer (side nav yox)                      |
| `AzesAuthLayout`                                                          | Sign-in: centered / split card                                               |
| `AzesHeader`                                                              | Sticky; slots start/center/end/bottom; elevateOnScroll; autoHide             |
| `AzesVerticalNav` / `AzesMiniNav` / `AzesHorizontalNav` / `AzesMobileNav` | Nav variantları                                                              |
| `AzesMainContent`                                                         | fluid/fixed + tokenized padding                                              |
| `AzesFooter`                                                              | legal / version                                                              |
| `AzesLayoutVars`                                                          | `--azes-layout-*` GlobalStyles                                               |

Responsive:

| Range                    | Davranış                                       |
| ------------------------ | ---------------------------------------------- |
| xs–md (< lg)             | mobile drawer; menu button; page padding 16/24 |
| lg+                      | desktop navLayout; page padding 32             |
| xl/2xl + container fixed | max-width 1280                                 |

Touch target: compact ≥ 24×24, comfortable ~40.

---

## 8. Platform komponentləri (konfiqurasiya ilə gələn)

Bunlar admin-də tətbiq olunub; real-estate-site eyni public API-dən istifadə edir (shell fərqli
ola bilər, komponent dəsti eyni).

| Sahə            | Export / token                            | Qısa                                                   |
| --------------- | ----------------------------------------- | ------------------------------------------------------ |
| Table           | `@azes/ui-web/table` · `theme.azes.table` | TanStack + MUI Table; sticky actions; Y scroll page-də |
| Accordion       | core · `theme.azes.accordion`             | `mode="search" \| "crud"`                              |
| Dialog          | `/feedback` · `theme.azes.dialog`         | `useAzesDialog` / `openDialog`                         |
| Side panel      | `/side-panel` · `theme.azes.sidePanel`    | sağ Drawer host + typed panel ids                      |
| Menu            | `/menu` · `theme.azes.menu`               | typed items + trigger render-prop                      |
| Backdrop        | `theme.azes.backdrop`                     | glass blur (invisible=false)                           |
| Carousel        | core · `theme.azes.carousel`              | native scroll-snap; aspect 16/10                       |
| Skeleton        | `/skeleton` · `theme.azes.skeleton`       | Caspian-wave; layout-matched                           |
| Forms           | `/forms`                                  | RHF + AzesForm*                                        |
| Feedback        | `/feedback`                               | snackbar + dialog                                      |
| Locale chrome   | `/locale`                                 | Language / Account menus (labels app-dən)              |
| Settings drawer | `/settings`                               | live primary/density/font/…                            |
| Icons           | `/icons`                                  | curated; deep `@mui/icons-material` app-də yox         |
| Charts          | `/charts`                                 | Line/Bar/Pie lazy                                      |
| DataGrid        | `/data-grid`                              | legacy demo only                                       |

Empty table labels: `AzesTableLabelsProvider` (global), feature-də təkrar boş mətn yazılmır.

---

## 9. App adoption (web)

| App                            | Shell                                          | Qeyd                              |
| ------------------------------ | ---------------------------------------------- | --------------------------------- |
| `account`                      | `AzesUiProvider`                               | login chrome; dashboard yox       |
| `admin`                        | `AzesUiProvider` + `AzesDashboardLayout`       | tam settings + nav                |
| `azes-ui`                      | showcase                                       | platform demos                    |
| `agent-platform`, `agent-site` | `AzesThemeProvider`                            | yüngül                            |
| `realestate`                   | `AzesThemeProvider` + Next cache               | App Router istisnaları            |
| `real-estate-site`             | Next shell (port 5176); UI wiring planı ayrıca | bu qovluqda `real-estate-site.md` |

Favicon: brand primary ilə tint edilmiş home SVG (`azesFavicon`); FOUC cookie/`azes-ui`.

---

## 10. Cross-app theme sync

- Compact cookie `azes-ui` = `1|<primary>|<mode>` — portlar arasında həqiqət mənbəyi.
- Settings localStorage port-scoped; hydrate-də sync primary qalib gəlir.
- Prod: `configureAzesPrefsCookie({ domain })` ← `VITE_AUTH_COOKIE_DOMAIN`.
- First paint: inline script / `InitColorSchemeScript` eyni storage keys.

---

## 11. Qadağalar (stil)

- Tailwind, Radix, shadcn, Chakra, Ant, Mantine, Bootstrap, styled-components,
  vanilla-extract, framer-motion, ApexCharts, Iconify, sonner, simplebar.
- App-də birbaşa `@mui/material` / MUI Drawer / Menu / DataGrid (ADR-009 istisnaları xaric).
- Deep import: `@azes/ui-web/src/...`.
- Sərbəst hex/rgba/px daimi səthlər üçün.
- Desktop-only layout (mobile-first məcburidir).
- UI paketində API / auth / Redux business.

---

## 12. Admin ↔ public sayt fərqi (konfiq eyni, chrome fərqli)

|                                         | Admin                         | Public real-estate sayt            |
| --------------------------------------- | ----------------------------- | ---------------------------------- |
| Provider                                | `AzesUiProvider`              | eyni (tövsiyə)                     |
| primary / density / font / mode         | settings + cookie             | eyni                               |
| Shell                                   | `AzesDashboardLayout` L-shell | `AzesMainLayout` marketing         |
| Nav                                     | API menus + mini rail         | top header links + mobile drawer   |
| Səhifə tipi                             | cədvəl / CRUD / KPI           | hero, listing grid, detail, search |
| Tokens / Button / Dialog / Carousel / … | eyni platform                 | eyni platform                      |

**Nəticə:** stil konfiqurasiyası dəyişmir; yalnız composition (layout + page structure) dəyişir.

---

## 13. Bu qovluq

| Fayl                  | Məzmun                                                                       |
| --------------------- | ---------------------------------------------------------------------------- |
| `readme.md`           | Bu sənəd — bütün stil konfiqurasiyalarının cəmi                              |
| `real-estate-site.md` | Real estate public sayt üçün dizayn təklifi (mövcud token/settings üzərində) |

Yeniləmə: platform token/default dəyişəndə bu `readme.md` də yenilənməlidir.
