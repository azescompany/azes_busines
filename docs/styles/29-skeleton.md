<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/29-skeleton.md
║ Author: AZES_COMPANY
║ Created: 2026-10-10
║ Updated: 2026-10-11
║ Purpose: AzesSkeleton / Caspian-wave pending surfaces
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# AzesSkeleton

Layout-matched pending surfaces for content that already sits inside a live shell.
**Not** a boot spinner — that remains [`CaspianLoader`](25-logo-and-loading.md).

## Import

```ts
import {
  AzesSkeleton,
  AzesSkeletonGroup,
  TableSkeleton,
  PageSkeleton,
  DetailsSkeleton,
} from '@azes/ui-web/skeleton';
```

## Primitives

| Component           | Role                                                                                |
| ------------------- | ----------------------------------------------------------------------------------- |
| `AzesSkeleton`      | Block: `text` / `rect` / `circle` / `pill` / `avatar` / `button` / `chip` / `image` |
| `AzesSkeletonGroup` | Wave overlay + `aria-busy` / `role="status"` when `loading`                         |

Tokens: `theme.azes.skeleton` (`baseMixPercent`, `waveMixPercent`, `waveWidthPercent`,
`durationMs`, `easing`, `staggerMs`, `fadeInMs`, `delayMs`, `minDurationMs`, spacing defaults).

## Caspian wave (chosen approach **A**)

Group-level `::after` overlay with `transform: translateX` only (GPU-friendly). Brand tint via
`color-mix(… primary.main …)`. RTL reverses the animation name. Reduced-motion → `static`
(no overlay). `@property` background-position (B) skipped for broader support / less paint risk.

## Pending rules

| Source                                                 | Show skeleton?                                 |
| ------------------------------------------------------ | ---------------------------------------------- |
| Boot / auth                                            | **No** — `CaspianLoader fullscreen`            |
| Route Suspense (shell live)                            | **Yes** — `RoutePageSkeleton` / `PageSkeleton` |
| Query first load (`isPending`, no data)                | **Yes** — feature `XxxViewSkeleton`            |
| Query refetch (`isFetching` + data / keepPreviousData) | **No** — keep rows + `AzesTable` progress      |
| Mutation                                               | **No** — button / dialog busy                  |
| Error                                                  | **No** — error UI                              |

Gate: `useSkeletonGate({ pending })` in `apps/admin/src/loading` (wraps `useDelayedVisible`).

## Feature pattern

```tsx
const firstLoad = query.isPending && query.data === undefined;
const { showSkeleton } = useSkeletonGate({ pending: firstLoad });
// chrome (title, filters) always live
{showSkeleton ? <UsersViewSkeleton label={t('loading.label')} /> : <UsersTable loading={Boolean(query.data) && query.isFetching} … />}
```

## Menus toolbar (horizontal chrome)

While `user-menu` is pending, `AzesHorizontalNav` shows an **indeterminate Caspian-wave
ribbon** (`HorizontalMenusSkeleton`) — not N fake menu buttons. Item count is unknown until
the response; a count-matched skeleton would lie about layout.

## Anti-patterns

- MUI `Skeleton` in apps (ESLint restricted)
- Page-level `CircularProgress` for content pending
- `Math.random` for cell widths (use deterministic index math)
- Full-page skeleton while `AdminShell` is already mounted
- Fake menu-item skeletons sized to a guessed count (use the ribbon instead)
