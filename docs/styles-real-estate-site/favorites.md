<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-real-estate-site/favorites.md
║ Author: AZES_COMPANY
║ Created: 2026-10-14
║ Updated: 2026-10-14
║ Purpose: Favorites page design + sync-ready model
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Favorites (`/favorites`)

## Model (sync-ready)

```ts
{ listingIds: string[]; updatedAt: string }
```

Merge strategy when account sync arrives: **union** of ids. Do not break this shape.

## UI

Same `ListingGrid`. Mounted gate + skeleton (SSR hydration safe). Missing/archived listing → “no longer available” card.

## Analytics

`favorite_toggle`.
