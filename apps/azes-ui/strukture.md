<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: apps/azes-ui/strukture.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: apps/azes-ui strukturası, UI təşkili və stil axını analizi
║ Layer: app
╚══════════════════════════════════════════════════════════════╝
-->

# apps/azes-ui — struktur analizi

Hesabat tarixi: 2026-10-04. Mənbə: diskdəki `apps/azes-ui` və `@azes/ui-web` inteqrasiyası.
Paket adı: `@azes/azes-ui`. Port: **7777**.

## Nədir / nə deyil

|                  |                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------- |
| **Nədir**        | AZES web design system-in **living showcase**-i (laboratoriya).                       |
| **Nə deyil**     | Məhsul app-i, dashboard, ThemeForest qalereyası.                                      |
| **Asılılıq**     | Digər app-lər `@azes/azes-ui`-yə asılı ola bilməz.                                    |
| **UI mənbəyi**   | Bütün komponentlər `@azes/ui-web`-dən; ikonlar `@mui/icons-material/*` (deep import). |
| **Stil sistemi** | MUI 9.3.1 + Emotion `@azes/ui-web` teması vasitəsilə. Parallel CSS framework yoxdur.  |

```bash
pnpm --filter @azes/azes-ui dev      # http://localhost:7777
pnpm --filter @azes/azes-ui build
pnpm --filter @azes/azes-ui test
pnpm --filter @azes/azes-ui lint
```

Ətraflı dizayn sənədi: `docs/styles/SHOWCASE.md`.

---

## Qovluq ağacı

```text
apps/azes-ui/
├── index.html                 # Pre-paint color-scheme skripti + #root
├── package.json               # @azes/azes-ui, Vite 7, React 19
├── vite.config.ts             # port 7777, strictPort
├── vitest.config.ts
├── tsconfig.json
├── README.md                  # qısa runbook
├── strukture.md               # bu fayl
└── src/
    ├── main.tsx               # React root + styles.css
    ├── styles.css             # yalnız height reset (margin/min-height)
    ├── app/
    │   └── App.tsx            # ThemeLabProvider → AzesThemeProvider → Showcase
    ├── lab/                   # Theme Lab (demo state — yalnız bu app)
    │   ├── themeLabTypes.ts   # AppBar/Sidebar/Viewport tipləri
    │   ├── ThemeLabContext.tsx# primary, density, nav, viewport state
    │   └── ThemeLabPanel.tsx  # 12 rəng swatch + Copy config paneli
    ├── shell/
    │   └── ShowcaseShell.tsx  # AppBar + Drawer + main + Dialog/Snackbar chrome
    ├── sections/              # səhifə məzmunu (registry-driven)
    │   ├── registry.ts        # NAV qrupları, hash parse, section id-lər
    │   ├── SectionContent.tsx # id → section komponenti
    │   ├── shared.tsx         # SectionIntro / StackText
    │   ├── foundations.tsx    # Overview, Colors, Type, Spacing, Shape, Elevation, Motion
    │   ├── components.tsx     # Inputs, Surfaces, Data display, Feedback
    │   ├── layout.tsx         # Container/Grid/Stack, app-shell, responsive
    │   ├── navigation.tsx     # AppBar/Drawer, Breadcrumbs, Menus
    │   └── accessibility.tsx  # Focus / contrast
    ├── showcase/
    │   ├── Showcase.tsx       # nazik giriş → ShowcaseShell
    │   └── Showcase.test.tsx  # shell + bütün section smoke testləri
    ├── config/
    │   └── appMeta.ts         # app adı / platform meta
    └── test/
        └── setup.ts           # Vitest / Testing Library setup
```

---

## Boot axını (runtime)

```text
index.html
  │  inline script: localStorage['azes-mode'] → <html data-azes-color-scheme>
  ▼
main.tsx
  │  styles.css (reset)
  ▼
App.tsx
  │  ThemeLabProvider          ← demo state (React Context, Redux deyil)
  │    ThemedShowcase
  │      AzesThemeProvider     ← @azes/ui-web (primary + density)
  │        Showcase
  │          ShowcaseShell     ← AppBar / Drawer / main / ThemeLabPanel
  │            SectionContent  ← hash-ə görə section
  ▼
DOM (#root)
```

### Pre-paint / flash qarşısı

`index.html` içindəki skript React işləməzdən əvvəl `data-azes-color-scheme`-i qoyur.
Açarlar `@azes/ui-web` ilə eynidir: `azes-mode`, atribut `data-azes-color-scheme`.

### Routing

React Router yoxdur. Hash route:

```text
#/overview
#/buttons
#/colors
…
```

`registry.parseSectionHash` hash-i oxuyur; naməlum id rədd edilir.
Drawer klikləri `window.location.hash = '#/<id>'` yazır.

---

## UI necə təşkil olunub

### 1. Shell (`shell/ShowcaseShell.tsx`)

Showcase-in çərçivəsi — bir “app shell” nümunəsi:

| Zona                  | Rol                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------- |
| **Skip link**         | `#main-content` — a11y                                                                    |
| **AppBar**            | Mode (light/dark/system), Primary select + custom hex, Density, AppBar mode, Sidebar mode |
| **Drawer**            | `SECTION_NAV` qrupları; permanent / collapsible / mini / temporary                        |
| **Main**              | aktiv section (`SectionContent`)                                                          |
| **ThemeLabPanel**     | sağ panel (lg+); 12 primary swatch, viewport, live palette preview                        |
| **Dialog / Snackbar** | shell səviyyəsində demo chrome (section-lər callback ilə açır)                            |

Viewport preset (360 / 768 / 1024 / 1440) shell-i frame edir — responsive demo üçün.

### 2. Theme Lab (`lab/`)

| Fayl                  | Məqsəd                                                           |
| --------------------- | ---------------------------------------------------------------- |
| `themeLabTypes.ts`    | `AppBarMode`, `SidebarMode`, `VIEWPORT_PRESETS`, `ThemeLabState` |
| `ThemeLabContext.tsx` | State + `persistPrimary` / `copyConfig`                          |
| `ThemeLabPanel.tsx`   | Swatch picker, secondary/focus/link preview (auto)               |

**Provider-ə gedən dəyərlər:** yalnız `primary` və `density`.  
**Secondary / focus / link:** `@azes/ui-web` `harmony.ts` ilə primary-dən avtomatik (Phase 14).

**Primary palette (12 seed — Phase 15):**  
`teal` · `navy` · `blue` · `indigo` · `violet` · `green` · `emerald` · `amber` · `orange` · `red` · `rose` · `slate`

Primary `localStorage['azes-primary']` + cookie `azes-primary` ilə saxlanır.

### 3. Sections (`sections/`)

| Modul                | Section id-lər                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| `foundations.tsx`    | overview, colors, typography, spacing, radius, shadows, motion                                        |
| `components.tsx`     | buttons, inputs, forms, cards, accordion, tables, lists, avatars, tooltips, alerts, snackbar, dialogs |
| `layout.tsx`         | layout, app-shell, responsive                                                                         |
| `navigation.tsx`     | navigation, breadcrumbs, menus                                                                        |
| `accessibility.tsx`  | accessibility                                                                                         |
| `shared.tsx`         | `SectionIntro`, `StackText` — təkrarlanan başlıq/layout helper                                        |
| `registry.ts`        | drawer NAV + `ALL_SECTION_IDS`                                                                        |
| `SectionContent.tsx` | `switch (id)` → komponent                                                                             |

**IA qrupları (drawer):** Foundations → Inputs → Surfaces → Data display → Feedback → Layout → Navigation → Accessibility.

### 4. Showcase entry

`showcase/Showcase.tsx` — yalnız `ShowcaseShell` mount edir (köhnə monolit parçalanıb).

---

## Stillər necə tənzimlənir

### Prinsip

```text
@azes/design-tokens     (rəng rampaları, spacing, radius, …)
        ↓
@azes/ui-web
  createAzesTheme / AzesThemeProvider / CssBaseline
  catalog (MUI re-export)
  harmony (secondary/focus/link from primary)
        ↓
apps/azes-ui            (sx / theme.palette / komponent props)
```

Showcase-də **ikinci stil sistemi yoxdur**: Tailwind, CSS Modules, styled-components, BEM yoxdur.

### App-daxili CSS

`src/styles.css` yalnız:

```css
html,
body,
#root {
  margin: 0;
  min-height: 100%;
}
```

Rəng, tipografiya, elevation → MUI `CssBaseline` + theme CSS variables (`--mui-*`).

### Tema konfiqurasiyası (ui-web)

| Input       | Mənbə                  | Effekt                                                |
| ----------- | ---------------------- | ----------------------------------------------------- |
| `primary`   | Theme Lab / seed / hex | `palette.primary`; dark-da lazım gələrsə açıq variant |
| `density`   | comfortable / compact  | button/input ölçüləri                                 |
| `secondary` | adətən ötürülmür       | primary-dən auto (light soft tint / dark muted)       |
| mode        | `useColorScheme`       | light / dark / system → `data-azes-color-scheme`      |

Komponent stilləri: `theme.vars.palette.*`, `sx`, MUI `styleOverrides` (`packages/ui-web/src/theme/components/*`).

### App-də stil yazmaq

- Layout/vizual: MUI `sx` və ya catalog komponent props.
- Hard-coded brand hex **qadağan** (Theme Lab custom hex istisna — demo).
- İkon: `@mui/icons-material/Menu` kimi deep import (barrel `@mui/icons-material` yox).

### ESLint sərhədləri

- Product app-lər `@mui/*` / `@emotion/*` idxal edə bilməz.
- `azes-ui` istisna: `@mui/icons-material/<Icon>` deep import icazəlidir.
- UI həmişə `@azes/ui-web` public export-undan.

---

## Asılılıqlar

```text
@azes/azes-ui
  ├── @azes/ui-web          workspace:*   (tema + katalog)
  ├── @mui/icons-material   9.3.1         (yalnız ikonlar)
  ├── react / react-dom     ^19.1
  └── (dev) vite, vitest, testing-library, typescript-config, vitest-config
```

**Yoxdur:** `@azes/api`, `@azes/state`, Redux, TanStack Query, React Router.
**Var:** `@azes/i18n` (`showcase` ns, default `az`) + `AzesLocaleMenu` headerEnd.  
Showcase təmiz UI laboratoriya qalır.

---

## Testlər

`src/showcase/Showcase.test.tsx`:

1. Shell + primary seed dəyişəndə live primary yenilənir
2. Layout section (Container/Grid)
3. Viewport preset frame
4. Skip link / dialog / a11y adları
5. **Hər** `ALL_SECTION_IDS` render olunur (smoke)

---

## Məhdudiyyətlər / gələcək

| Mövzu                                       | Status                                                         |
| ------------------------------------------- | -------------------------------------------------------------- |
| Section lazy-load                           | Eager import; ~693 kB chunk — gələcək namizəd                  |
| Pattern səhifələri (form page, list+detail) | Ayrı route yox; app-shell recipe var                           |
| axe-core                                    | Əlavə edilməyib (əl checklist: `docs/styles/ACCESSIBILITY.md`) |
| Theme Lab product app-lərdə                 | Yox — yalnız showcase                                          |

---

## Tez istinad: “nə haradadır?”

| Axtarıram                   | Fayl                                               |
| --------------------------- | -------------------------------------------------- |
| Tema provider / primary     | `src/app/App.tsx`, `src/lab/ThemeLabContext.tsx`   |
| 12 rəng swatch              | `src/lab/ThemeLabPanel.tsx` (`brandSeedOrder`)     |
| Drawer menyu siyahısı       | `src/sections/registry.ts`                         |
| Section məzmunu             | `src/sections/*.tsx` + `SectionContent.tsx`        |
| AppBar / Drawer / Dialog    | `src/shell/ShowcaseShell.tsx`                      |
| Hash routing                | `registry.parseSectionHash` + shell `useEffect`    |
| CSS reset                   | `src/styles.css`                                   |
| Color-scheme flash fix      | `index.html` inline script                         |
| Tema mühərriki (production) | `packages/ui-web` — bu app-də deyil                |
| Brand seeds / harmony       | `packages/ui-web/src/theme/brand.ts`, `harmony.ts` |

---

## Qısa nəticə

`azes-ui` — `@azes/ui-web` üzərində qurulmuş **registry-driven, Theme Lab-lı design-system showcase**.  
UI shell + section səhifələrindən ibarətdir; stillər demək olar ki, tamamilə shared theme-dən gəlir; app özündə yalnız height reset saxlayır. Demo state (`lab/`) heç vaxt product bundle-a köçürülməməlidir.
