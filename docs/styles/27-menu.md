<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/27-menu.md
║ Author: AZES_COMPANY
║ Created: 2026-10-10
║ Updated: 2026-10-10
║ Purpose: AzesMenu API — language, user menu, row actions patterns
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# AzesMenu

Typed global menu for headers, row actions, and language switchers. Built on MUI `Menu` /
`MenuList` with token-driven paper and items. **No visible backdrop** (invisible click-away
only — see [28-backdrop.md](28-backdrop.md)).

> Note: `20-definition-of-done.md` already occupies slot 20; this doc is **27**.

## Import

```ts
import { AzesMenu, useAzesMenu } from '@azes/ui-web/menu';
```

## Minimal example

```tsx
<AzesMenu
  aria-label={t('language')}
  selectionMode="single"
  items={[
    { id: 'az', label: 'Azərbaycan', endAdornment: 'AZ', selected, onSelect },
    { id: 'en', label: 'English', endAdornment: 'EN', selected, onSelect },
  ]}
  trigger={({ props, onClick }) => (
    <Button {...props} onClick={onClick} startIcon={<IconGlobe />}>
      AZ
    </Button>
  )}
/>
```

## Patterns

| Pattern     | Notes                                                                                |
| ----------- | ------------------------------------------------------------------------------------ |
| Language    | `selectionMode="single"`, endonym label + short code adornment — no flag emojis      |
| User menu   | `header` with name/email; logout as `danger` item                                    |
| Row actions | `IconMore` trigger; edit / delete (`danger`)                                         |
| Groups      | `{ type: 'header' }` + `{ type: 'divider' }`                                         |
| Async       | `onSelect` may return a Promise; item shows busy until settle; throw keeps menu open |

## Behaviour

- ↑/↓, Home/End, typeahead (including `ə ı ö ü ş ç ğ`), Enter/Space, Esc/Tab
- Focus moves to the first / selected item on open; returns to the trigger on close
- `disableScrollLock` — page scroll stays unlocked
- Tokens: `theme.azes.menu` (`paperRadius`, `itemRadius`, `itemMinHeight`, `widthSm`/`Md`, `shadow`, mix percents)
- **Radius rule:** paper/item radii are always `` `${n}px` `` strings in `sx`. Bare numbers are
  multiplied by `theme.shape.borderRadius` and look like a circle/pill.

## Anti-patterns

- Direct `@mui/material/Menu` in apps (ESLint restricted)
- Hardcoded hex / px / user-facing strings inside `@azes/ui-web` menu internals
