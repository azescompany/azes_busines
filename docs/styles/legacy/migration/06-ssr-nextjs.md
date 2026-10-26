<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/migration/06-ssr-nextjs.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-09-29
║ Purpose: Next.js App Router integration for the MUI theme
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Next.js SSR

`apps/realestate` uses Next.js 15 App Router. `app/layout.tsx` is a Server Component:

```text
html suppressHydrationWarning
  body
    InitColorSchemeScript
    AppRouterCacheProvider from @mui/material-nextjs/v15-appRouter
      AzesThemeProvider primary from the azes-primary cookie
        existing query, store, and i18n providers
```

`AppRouterCacheProvider` is the official Emotion cache for streaming SSR. It is a
dependency of `realestate`, not of `@azes/ui-web`, because `@mui/material-nextjs` peers on
`next`.

`InitColorSchemeScript` is imported from `@mui/material/InitColorSchemeScript`. No other
`@mui/material` component is imported by the app.
