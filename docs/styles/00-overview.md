<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/00-overview.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Overview and quick start of the AZES web UI platform
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Overview

## What it is

One MUI-based platform package, `@azes/ui-web`, that every AZES web app uses for its whole
visual layer. Products differ by brand inputs and settings, not by forks of components.

```text
@azes/design-tokens        primitives (no React)
@azes/ui-web               theme, catalog, Box/Stack/Text/Button
  /settings                runtime settings store, AzesUiProvider, settings drawer
  /navigation              navigation schema, filtering, active matching, renderers
  /layout                  dashboard, main and auth layouts, header, navs, content
  /icons                   curated icon set and createAzesIcon
  /table                   AzesTable (TanStack + MUI Table, default)
  /data-grid               AzesDataGrid (MUI X community, legacy demos)
  /charts                  AzesLineChart, AzesBarChart, AzesPieChart (MUI X, lazy)
  /forms                   AzesForm and react-hook-form bound fields
apps/azes-ui               pilot consumer and full interactive showcase
```

"ui-mui" is only a name for this concept. There is no `@azes/ui-mui` package (ADR-010).

## Out of scope

- `@azes/ui-native` and the Expo apps. They share only `@azes/design-tokens`.
- Business logic, API calls, auth and Redux. UI packages never import them.

## Quick start (Vite app)

```tsx
import { AzesUiProvider } from '@azes/ui-web/settings';
import { AzesDashboardLayout } from '@azes/ui-web/layout';
import { AzesNavProvider, type AzesNavConfig } from '@azes/ui-web/navigation';

const nav: AzesNavConfig = [
  { id: 'main', subheader: 'Overview', items: [{ id: 'home', title: 'Home', path: '/' }] },
];

export function App() {
  return (
    <AzesUiProvider>
      <AzesNavProvider router={{ pathname: location.pathname, LinkComponent: 'a' }}>
        <AzesDashboardLayout nav={nav} slots={{ headerEnd: <UserMenu /> }}>
          <HomePage />
        </AzesDashboardLayout>
      </AzesNavProvider>
    </AzesUiProvider>
  );
}
```

Existing product apps keep `AzesThemeProvider`. It is still supported (see 17).

## Quality bar

Minimal-level polish, Linear-level restraint, Vercel-level clarity and enterprise data
density, with AZES identity. The Minimal dashboard is a reference for principles only. No code,
assets or exact visual designs are copied (01).
