<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/26-side-panel.md
║ Author: AZES_COMPANY
║ Created: 2026-10-10
║ Updated: 2026-10-10
║ Purpose: Global AzesSidePanel API, portal host, dirty guard, when-to-use
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# AzesSidePanel (global right drawer)

One MUI `Drawer` host for many panels, identified by typed ids. Panel content stays in the
feature React tree and is portaled into the host when active (RHF / Query stay live).

> Note: `19-dependencies.md` already occupies slot 19; this doc is **26**.

## Why not Redux

Panel registration carries `ReactNode` (title, footer, body). Ephemeral UI chrome — Context only.

## Import

```ts
import { AzesSidePanel, useSidePanel, useSidePanelState } from '@azes/ui-web/side-panel';
```

`AzesUiProvider` mounts `AzesSidePanelProvider` + host (after dialog).

## Register an id

```ts
// apps/admin/src/sidePanelRegistry.ts
declare module '@azes/ui-web/side-panel' {
  interface AzesSidePanelRegistry {
    adsFilters: true;
  }
}
```

`settings` is pre-registered in `@azes/ui-web`.

## Panel + trigger

```tsx
const filters = useSidePanel('adsFilters');

<Button onClick={() => void filters.toggle()}>Filters</Button>

<AzesSidePanel
  id="adsFilters"
  title={t('ads.filters.title')}
  width="md"
  isDirty={isDirty}
  footer={<>…Reset / Apply…</>}
>
  {/* RHF form */}
</AzesSidePanel>
```

## Behaviour

| Rule           | Detail                                                                  |
| -------------- | ----------------------------------------------------------------------- |
| One active     | Opening another id runs dirty-guard on the current panel first          |
| Dirty guard    | `useAzesDialog().confirm` with provider `discardLabels`                 |
| Unmount        | If the `AzesSidePanel` for `activeId` unmounts, the panel closes        |
| Esc / backdrop | Closes (with dirty guard)                                               |
| Focus          | MUI Drawer trap; close restores focus to the trigger                    |
| Mobile         | Full-width paper (`xs`); desktop widths from `theme.azes.sidePanel`     |
| `keepMounted`  | Optional; default `false` (inactive → no portal output)                 |
| Apply close    | `close({ discard: true })` skips dirty confirm after a successful Apply |

## Settings

`AzesSettingsDrawer` content is an `AzesSidePanel` with `id="settings"`. Legacy `open` /
`onClose` still sync for older callers; prefer `useSidePanel('settings').toggle` on
`AzesSettingsButton`.

## Ads filters

- Fields (existing): address, city, owner, phone — no invented filters.
- Apply → `useAdsTable().applyFilters` (page → 0) + `close({ discard: true })`.
- Toolbar Filters button + badge; removable chips above the table.
- Search `AzesAccordion` removed on Ads; Users filters stay on accordion.

## URL sync

**Not implemented.** Admin ads filters are React state (`useAdsTable`); there is no
`?panel=` / filter search-params pattern in the app router (hash routes). Revisit when a
shared URL-state helper exists.

## Panel vs dialog vs accordion

| Use                                  | Choose                       |
| ------------------------------------ | ---------------------------- |
| Persistent form / filters / settings | **Side panel**               |
| Blocking question / danger confirm   | **Dialog** (`useAzesDialog`) |
| Inline expand on the page (CRUD)     | **Accordion**                |

## Tokens / styles

`theme.azes.sidePanel` + `sidePanelStyles.ts`. No hardcoded hex in the host.

## ESLint

Product apps: `@mui/material/Drawer` banned — use `@azes/ui-web/side-panel`.
