<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/architecture/pages-and-features.md
║ Author: AZES_COMPANY
║ Created: 2026-10-10
║ Updated: 2026-10-10
║ Purpose: Pages vs features structure, Query + RHF/zod conventions
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Pages and features

Cursor enforcement: `.cursor/rules/page-architecture.mdc` (always on for apps).  
ADR: [ADR-018](../decisions/ADR-018-pages-and-features.md).  
Canonical examples: `apps/admin/src/features/users`, `apps/admin/src/features/ads`.

## Structure

```text
apps/<app>/src/
├── pages/<feature>/index.tsx     # thin route entry
├── features/<feature>/           # all business UI + data
│   ├── index.ts                  # public API only
│   ├── components/…              # View, Form, Filters, Table
│   ├── columns/
│   ├── hooks/
│   ├── service/                  # *Api.ts + *Queries.ts
│   ├── models/                   # types, schema (zod), mappers
│   └── paths.ts
└── shared/                       # no feature imports
```

## Layer rules

```text
pages → features → shared → packages/*
```

- Pages import only `@/features/<name>` (public `index.ts`).
- Features do not import pages or other features’ internals.
- Server state: TanStack Query in `service/*Queries.ts` with key factories.
- Forms: react-hook-form + zod (`models/schema.ts`, `z.infer`).
- Redux slice only for true client/UI state — never lists/filters/pagination.

## New page checklist

1. Feature folder + models/schema
2. service Api + Queries
3. hooks
4. components (View, Filters, Form, Table)
5. public `index.ts`
6. `pages/<ad>/index.tsx`
7. shell/route + `PATHS` (`shared/config/paths.ts`)
8. i18n en/az/ru
9. tests
10. docs / CURRENT-STATE if API wiring changed

## Typical mistakes

| Mistake                                             | Fix                                   |
| --------------------------------------------------- | ------------------------------------- |
| Fat page with Query + form state                    | Move to `features/*/components/*View` |
| Deep import `@/features/users/hooks/...` from pages | Use public `index.ts`                 |
| API list in Redux                                   | Use TanStack Query                    |
| Controlled form with manual validation              | RHF + zod                             |
| Empty `slice/` folder                               | Delete it                             |

## Next migrations (admin)

Not yet on this structure: Dashboard, Documents, Cities, Organizations, Menus, Roles,
Owners, Contacts, Budgets, Plans, Agencies, Auth Lab, Docs, Design Lab, AI panel.
