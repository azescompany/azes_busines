<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-current/real-estate-site.md
║ Author: AZES_COMPANY
║ Created: 2026-10-13
║ Updated: 2026-10-13
║ Purpose: Caspian Key design brief — AZES L-shell chrome + marketplace content
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Caspian Key — Design Brief (shell correction)

**Status:** pre-implementation — **kod / refactor / dependency dəyişikliyi yox** təsdiqədək.  
**App:** `apps/real-estate-site` (`@azes/real-estate-site`, Next.js App Router, port **5176**).  
**Stil cəmi:** eyni qovluqdakı `readme.md`.

### Success criterion

Tətbiq **shell-də tanınan AZES** qalır (top toolbar + mini-rail + əyri scoop keçidi);
**main content** isə müasir, premium Caspian Key real-estate marketplace-dir —
admin CRUD dashboard deyil, generic marketing landing header də deyil.

---

## 0. Direction correction (non-negotiable)

|                    | Əvvəlki brief (səhv)                     | Bu brief (düzgün)                             |
| ------------------ | ---------------------------------------- | --------------------------------------------- |
| Shell              | `AzesMainLayout` (ayrı marketing header) | **`AzesDashboardLayout` dual chrome L-shell** |
| Toolbar + sidebar  | atılır                                   | **saxlanılır** — vizual bağlı, tanınan        |
| Scoop / əyri keçid | yox                                      | **`data-azes-scoop` + `chromeJoinRadius`**    |
| Nav                | sadə top links                           | eyni chrome; **label/item-lər Caspian Key**   |
| Content            | page canvas ayrı                         | **scoop içində** photo-first marketplace      |
| Mobile             | ayrı marketing drawer                    | eyni layout-un **`AzesMobileNav` drawer**     |

**Qadağan:** konvensional real-estate marketing header + tam ayrı page canvas ilə L-shell-i
əvəz etmək.

**Saxlanılanlar (dəyişmir):** marketplace + agent-subdomain rejimləri, repository
interfaceləri, i18n, URL-driven filters, a11y, theme/settings/token/public API.

---

## 1. Shell ownership — inspect findings

Screenshot faylları repo-da tapılmayıb; təsvir olunan chrome admin dual-chrome L-shell ilə
uyğun gəlir. Mənbə kodu (2026-10-13):

### 1.1 Ownership map

| Vizual / davranış                               | Sahib                                                                                           | Path / export                            |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Dual chrome layout (header + mini rail + scoop) | `AzesDashboardLayout`                                                                           | `@azes/ui-web/layout`                    |
| Top menus toolbar                               | `AzesHorizontalNav` (layout içində)                                                             | layout                                   |
| Mini sidebar rail                               | `AzesVerticalNav` mini + `railNav` prop                                                         | layout                                   |
| Əyri scoop↔rail keçidi                          | scoop `borderStartStartRadius` ← `--azes-layout-chrome-join` (`layoutPx.chromeJoinRadius` = 24) | `AzesDashboardLayout` + `AzesLayoutVars` |
| Join flatten on autoHide                        | `data-azes-scoop-join` `curve`\|`flat` + header `onConcealedChange`                             | layout                                   |
| Header / brand strip / Apps waffle              | `AzesHeader` + brand-strip logic in DashboardLayout                                             | layout                                   |
| Mobile drawer                                   | **built-in** `AzesMobileNav` (`layoutQuery` default `lg`)                                       | layout                                   |
| Theme / nav tone / settings                     | `AzesUiProvider` + `navColor` / `navLayout` / `headerMode`                                      | `@azes/ui-web/settings`                  |
| App compose nümunəsi                            | `AdminShell`                                                                                    | `apps/admin/src/layout/AdminShell.tsx`   |
| Nav data (admin)                                | API menus + `createAdminRailNav`                                                                | app navigation                           |
| Router bridge                                   | `AzesNavProvider` + adapter                                                                     | `@azes/ui-web/navigation`                |

### 1.2 Critical API facts

```ts
// AzesDashboardLayout — reuse directly
nav: AzesNavConfig;           // horizontal menus toolbar items
railNav?: AzesNavConfig;      // mini-rail (desktop) + drawer footer (mobile)
navLayout?: 'horizontal' | …; // default settings → horizontal = dual chrome
navColor?: 'contrast' | 'integrated';
headerMode?: 'autoHide' | 'fixed';
layoutQuery?: Breakpoint;     // default 'lg' — below = mobile drawer
slots: logo, headerEnd, footer, …
slotProps.main?: { disablePadding?, fill? };
```

- `navLayout === 'horizontal'` + desktop = **dual chrome** (toolbar + mini rail + scoop).
- Scoop is the **scrollport** (`overflow: auto` on `[data-azes-scoop]`).
- `AzesMainLayout` marketing shell **istifadə olunmur** bu məhsul üçün.

### 1.3 Reuse vs new abstraction

| Seçim                                             | Qərar                                                                |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| `AzesDashboardLayout` birbaşa reuse               | **Bəli** — chrome sahibliyi platformadadır                           |
| `ui-web`-də yeni “CaspianShell” paketi            | **Xeyr** — fork / ikinci chrome yox                                  |
| App-level `CaspianSiteShell` (AdminShell analoqu) | **Bəli, minimum** — nav config, slots, Next Link bridge, SiteContext |
| AdminShell-i import etmək                         | **Xeyr** — apps→apps qadağan; admin auth/menus bağlanıb              |
| L-shell CSS-i app-də kopyalamaq                   | **Xeyr**                                                             |

**Minimum arxitektura dəyişikliyi:**

1. `AppProviders`: `AzesThemeProvider` → **`AzesUiProvider`** (settings + theme sync).
2. App `CaspianSiteShell`: `AzesNavProvider` (Next adapter) + `AzesDashboardLayout` + Caspian
   `nav` / `railNav` + logo / headerEnd / footer slots.
3. Feature pages = **scoop children** only (photo-first content).
4. Platform layout koduna toxunma yalnız gap tapılarsa (Ask-first) — default toxunma yox.

---

## 2. Mövcud app vəziyyəti

| Fakt         | Dəyər                                                  |
| ------------ | ------------------------------------------------------ |
| Providers    | `AzesThemeProvider` — UiProvider yox                   |
| Shell        | DashboardLayout **qoşulmayıb**; `HomePage` placeholder |
| Locale URL   | Next-də segment yox; admin `/en\|az\|ru/...`           |
| Brand cookie | `azes-primary` → `resolveBrandPrimary`                 |
| Next         | `AppRouterCacheProvider`, `InitColorSchemeScript`      |
| Map lib      | yox — placeholder                                      |

---

## 3. Product direction

**Caspian Key** — Azərbaycan fokuslu marketplace şablonu; iki rejim:

| Rejim       | Kontekst           | Məzmun                         |
| ----------- | ------------------ | ------------------------------ |
| Marketplace | əsas domen         | bütün elanlar + agent kataloqu |
| Agent site  | `{slug}` subdomain | agent profil + scoped listings |

`SiteContext` + repository `agentSlug` filter. Eyni L-shell; fərq nav subset + content scope.

Content ilhamı: Compass (foto) + Zillow (axtarış usable) — **kopya yox**. Shell ilhamı: **mövcud
AZES admin chrome** (tanınan toolbar/rail/scoop).

---

## 4. Design principles

1. **Shell = AZES L-shell** — toolbar + sidebar vizual bağlı; scoop əyrisi saxlanılır.
2. **Content = premium photo-first marketplace** — hero, search, cards, detail, agents;
   admin table/CRUD densitiyəsi yox.
3. **Primary rəng məqsədli** — CTA / focus / accent; dominant səhifə wash və chrome fill deyil
   (chrome `navColor` tokenləri ilə).
4. **Nav labels Caspian Key** — admin “Users/Ads/Docs/AI” deyil; marketplace IA.
5. **Mobile** — eyni nav konsepsiyası `AzesMobileNav` drawer-də; desktop sidebar-i kiçik
   ekrana **məcbur etmə**.
6. Theme/settings/tokens/public `@azes/ui-web` API saxlanılır; yeni stil sistemi yox.
7. i18n en+az+ru; a11y; URL-driven filters.
8. Server state = TanStack Query; favorites = localStorage; listing data **Redux-da yox**.
9. Mock → API repository interface.

---

## 5. Theme / settings (shell ilə)

```text
AzesUiProvider
  defaults={{
    navLayout: 'horizontal',   // dual chrome — LOCK / default
    navColor: 'contrast',      // admin-tanınan chrome (təsdiq: integrated alternativ)
    density: 'comfortable',
    fontFamily: 'inter',
    container: 'fluid',
    headerMode: 'autoHide',    // scoop scroll + join flatten davranışı saxlanır
  }}
```

- `navLayout` public-də **locked horizontal** (dual chrome qorunur).
- Settings drawer: opsional / gizlədilə bilər; cookie theme sync saxlanır.
- `headerMode: autoHide` L-shell join davranışı ilə uyğundur; `fixed` də mümkündür
  (join flatten olmayacaq) — default **autoHide** tövsiyə (mövcud chrome davranışı).

---

## 6. Navigation IA (chrome labels)

### 6.1 Menus toolbar (`nav`) — marketplace

| id        | Label (i18n)            | Path         |
| --------- | ----------------------- | ------------ |
| home      | Home / Ana səhifə       | `/`          |
| search    | Search / Axtarış        | `/search`    |
| agents    | Agents / Agentlər       | `/agents`    |
| favorites | Favorites / Seçilmişlər | `/favorites` |

Agent mode: `agents` gizlədilir və ya “Marketplace” external link; Home agent home olur.

### 6.2 Mini rail (`railNav`) — secondary

Admin Docs/AI əvəzinə (nümunə):

| id              | Rol                                               |
| --------------- | ------------------------------------------------- |
| favorites       | qısa yol (və ya toolbar-da qalırsa buradan çıxar) |
| contact / about | onClick və ya path                                |
| login / account | account app handoff                               |

Rail item sayı az saxlanır (2–3); admin Profile/AI sıxlığını kopyalamaq məcburi deyil.

### 6.3 Mobile drawer

Eyni `nav` + `railNav` footer pin — `AzesDashboardLayout` artıq belə edir
(`mobileFooterNav = railNav` below `layoutQuery`).

---

## 7. Site modes & routing

Logical PATHS (locale-siz): `/`, `/search`, `/listings/:id`, `/agents`, `/agents/:slug`,
`/favorites`.

Locale: tövsiyə `app/[locale]/…` (admin ilə uyğun) — Phase 0 verify.

Agent host: middleware/`SiteContext`; path eyni; repo scoped. Dev stub: `?agent=slug`.

---

## 8. Content scenarios (scoop içində)

Chrome dəyişmir; **yalnız scoop / main** redesign.

### 8.1 Marketplace homepage

- Scoop içində full-bleed **content hero** (photo-first). Chrome üstündə qalır.
- Hero büdcəsi: brand signal + headline + supporting + CTA + dominant media.
- Floating promo sticker yox; primary yalnız CTA.
- Featured grid, areas, agents teaser — section-lar scoop scroll ilə.
- Hero üçün `slotProps.main.disablePadding` və ya page-level full-bleed section
  (padding tokenləri ilə) — Phase 0-da MainContent padding verify.

### 8.2 Search (filters + optional map/list)

- Filter bar + `AzesSidePanel`; URL query; sort `AzesMenu`.
- `lg+` optional split + map **placeholder**.
- Agent mode: avtomatik `agentSlug` scope.

### 8.3 Property details

- `AzesCarousel`; facts; agent card; sticky contact `xs`; similar.

### 8.4 Agent directory / profile

- Directory marketplace-only; profile + scoped listings.

### 8.5 Empty / loading / error

- `AzesSkeleton*`, `AzesEmptyState`, Alert+retry, route `error.tsx`.

### 8.6 Responsive (chrome + content)

|         | xs–md                                   | lg+                                     |
| ------- | --------------------------------------- | --------------------------------------- |
| Chrome  | hamburger → `AzesMobileNav` drawer      | dual chrome toolbar + mini rail + scoop |
| Content | 1-col cards; stacked search             | 3–4 col; split map placeholder          |
| Scoop   | tam en; əyri join desktop-only (lShell) | curve join görünür                      |

Desktop sidebar layout-u mobile-ə **force edilmir**.

---

## 9. Page & component inventory

### 9.1 Shell (app)

| Komponent                                   | Rol                                                        |
| ------------------------------------------- | ---------------------------------------------------------- |
| `AppProviders`                              | Query + i18n + **AzesUiProvider**                          |
| `CaspianSiteShell`                          | `AzesNavProvider` + `AzesDashboardLayout` + nav/rail/slots |
| `createCaspianNav` / `createCaspianRailNav` | static `AzesNavConfig` + i18n labels                       |
| `SiteContextProvider`                       | marketplace \| agent                                       |
| Next Link adapter                           | nav `LinkComponent` / `toHref`                             |
| Locale / Login in `headerEnd`               | `AzesLocaleMenu` + CTA                                     |

### 9.2 Features (scoop content)

`home`, `search`, `listing`, `agents`, `favorites` — əvvəlki inventar eyni;
`ListingCard` shared atom.

### 9.3 Platform compose (no fork)

`AzesDashboardLayout`, `AzesCarousel`, `AzesSidePanel`, `AzesMenu`, skeleton, EmptyState,
icons, locale — public exports only.

**Yaratma:** yeni layout engine, MainLayout hybrid, ui-web Caspian fork.

---

## 10. Mock data & repositories

(Əvvəlki brief ilə eyni — saxlanılır.)

- Typed fictional `Property` / `Agent`; AZN; Bakı rayonları.
- `PropertyRepository` / `AgentRepository` interfaces; mock impl; Query hooks.
- Favorites: `localStorage` store — Redux yox.
- Seed ~24–36 listings, ~8–12 agents.

---

## 11. Implementation phases & acceptance

### Phase 0 — Verify (no feature UI)

- [ ] `AzesDashboardLayout` dual chrome Next + `AzesNavProvider` Link adapter
- [ ] Scoop scroll + autoHide join curve/flat
- [ ] Mobile drawer below `lg`
- [ ] `AzesUiProvider` + cookie primary/mode
- [ ] Locale strategy A vs B
- [ ] Hero padding vs `disablePadding`

### Phase 1 — CaspianSiteShell (Dizayner)

- UiProvider + DashboardLayout + Caspian nav/rail + headerEnd
- Acceptance:
  - [ ] Toolbar + mini-rail + scoop **tanınan AZES** (əyri keçid görünür)
  - [ ] Nav labels Caspian Key (admin menus deyil)
  - [ ] Mobile = drawer; desktop sidebar force yox
  - [ ] MainLayout / ayrı marketing header **yox**

### Phase 2 — Mock repos + types

- Acceptance: search/filter/sort testable; favorites persist

### Phase 3 — Home content (scoop)

- Acceptance: photo-first hero in scoop; chrome intact; skeleton; i18n

### Phase 4 — Search + filters + map placeholder

- Acceptance: URL filters; empty/error; chrome intact

### Phase 5 — Detail + carousel

- Acceptance: gallery; contact chrome; 404

### Phase 6 — Agents + agent mode

- Acceptance: `?agent=` / slug scope; directory hide in agent mode

### Phase 7 — Favorites + a11y polish

### Phase 8 — API swap prep (Worker) + Coordinator gates

**Shell-specific DoD (əlave):**

- [ ] Recognizably AZES chrome (toolbar ↔ sidebar connected, scoop curve)
- [ ] Content feels Caspian Key marketplace (not admin tables, not generic landing shell)
- [ ] No `AzesMainLayout` as product chrome
- [ ] No new design system / styling library
- [ ] Repos behind interfaces; no listing Redux

---

## 12. APIs to verify before coding

| #   | Surface                                                          | Niyə                 |
| --- | ---------------------------------------------------------------- | -------------------- |
| 1   | `AzesDashboardLayout` props (`nav`, `railNav`, `slotProps.main`) | shell reuse          |
| 2   | Scoop / `chromeJoin` / autoHide                                  | əyri keçid davranışı |
| 3   | `AzesMobileNav` path in DashboardLayout                          | mobile               |
| 4   | `AzesNavProvider` + Next App Router Link adapter                 | nav                  |
| 5   | `AzesUiProvider` SSR cookies                                     | theme                |
| 6   | `@azes/ui-web/brand`                                             | primary FOUC         |
| 7   | `AzesCarousel`, SidePanel, Menu, Skeleton, EmptyState            | content              |
| 8   | `AzesLocaleMenu`                                                 | headerEnd            |
| 9   | `@azes/i18n` + locale URL                                        | en/az/ru             |
| 10  | Admin `AdminShell` (pattern only — copy not import)              | compose reference    |
| 11  | `apiQueryDefaultOptions`                                         | Query                |
| 12  | OpenAPI listing/agent ops existence                              | mock duration        |
| 13  | Account login URL env                                            | Login CTA            |
| 14  | `architecture:verify` / forbidden map libs                       | map Ask-first        |

---

## 13. Open decisions

1. `navColor`: `contrast` (admin-like) yoxsa `integrated`?
2. Settings drawer: gizlədilsin?
3. Locale: `app/[locale]/…`?
4. Map v1 placeholder OK?
5. Agent stub: `?agent=slug`?
6. Rail items: Favorites + Contact + Login — təsdiq?

---

## 14. Explicit non-goals (v1)

- `AzesMainLayout` product chrome
- Admin menus API / Users-Ads CRUD densitiyəsi content-də
- ui-web L-shell fork və ya apps→apps AdminShell import
- Real map SDK; real backend
- Yeni UI paket / token fork
- Listing data in Redux

---

## 15. Consistency checklist

- [x] Shell = DashboardLayout L-shell (toolbar + rail + scoop curve)
- [x] Content = marketplace scenarios in scoop
- [x] Mobile = built-in drawer
- [x] Marketplace + agent modes + repos + i18n + URL filters saxlanılır
- [x] Minimum arch = app CaspianSiteShell only
- [x] No code until §13 reviewed

**Növbəti:** §13 cavabları → Phase 0 verify → Phase 1 shell (ayrı əmr).
