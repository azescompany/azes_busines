<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/18-azes-ui.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Role, structure and conventions of the azes-ui pilot and showcase app
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# azes-ui (pilot and showcase)

`apps/azes-ui` is a private Vite app on port 700. It is the first real consumer of every
platform capability and the interactive showcase. Nothing is added to the platform without
being used here first.

## Boot

```text
index.html pre-paint script (azes-mode -> data-azes-color-scheme)
  -> AzesUiProvider (settings store + theme)
    -> ShowcaseApp: hash router adapter + AzesNavProvider
      -> AzesDashboardLayout (nav from the section registry, settings button in header)
        -> lazy section page inside AzesMainContent
      -> AzesSettingsDrawer
```

## Structure

```text
src/
  app/App.tsx                 providers
  app/ShowcaseApp.tsx         router adapter, layout, drawer, demo dialog/snackbar
  app/ShowcaseLogo.tsx        wordmark (monogram in mini nav)
  routing/useHashRoute.ts     hash router adapter (`#/<section>`)
  sections/registry.ts        section ids, groups, icons, nav config (AzesNavConfig)
  sections/SectionContent.tsx lazy loader per section id (React.lazy + Suspense)
  sections/*.tsx              foundations, components, layout, navigation, accessibility,
                              platform (settings, navigation engine, form binding), mui-x
  pages/pages.tsx             analytics, list and form pilot pages
  pages/AuthPage.tsx          full-page AzesAuthLayout pilot
  lab/                        demo-only viewport preset and content frame
```

## Rules

- Platform state lives in `@azes/ui-web/settings`. `src/lab` keeps only demo-only state that a
  product would never ship (viewport preview).
- Sections are lazy loaded; the overview loads first.
- Every section id is covered by the smoke test in `Showcase.test.tsx`.
- `azes-ui` may import `@mui/icons-material/<Name>` paths for demos; everything else comes from
  `@azes/ui-web`.

## Adding a section

1. Add the id, title and group (or icon for top-level items) to `sections/registry.ts`.
2. Create the page in a section module and register its lazy loader in `SectionContent.tsx`.
3. The smoke test picks it up automatically.

## Pages (Phase 13)

- `#/pages-analytics`: KPI cards, capacity bars, line and bar charts.
- `#/pages-list`: search field, data grid, empty state, primary action.
- `#/pages-form`: workspace form with zod validation, sections and async submit.
- `#/pages-auth`: full-page `AzesAuthLayout` sign-in (split aside from `md`); the dashboard
  layout is not rendered on this route.

## Visual matrix

`pnpm --filter @azes/azes-ui test:visual` runs `e2e/visual/azes-ui.spec.ts` against
`vite preview` (build first). Local only; see 15.
