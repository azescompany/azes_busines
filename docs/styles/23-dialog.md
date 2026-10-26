<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/23-dialog.md
║ Author: AZES_COMPANY
║ Created: 2026-10-10
║ Updated: 2026-10-10
║ Purpose: Global AzesDialog API, queue rules, a11y, bridge, snackbar boundary
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# AzesDialog (global promise dialog)

Promise-based confirm / danger / notify / custom dialogs owned by React Context (not Redux).
Mounted inside `AzesUiProvider` after theme + snackbar.

## Why not Redux

Dialog options carry `ReactNode` and `onConfirm` functions — not serializable RTK state.
This is ephemeral UI chrome. Redux stays for session/preferences; server data stays in TanStack Query.

## Import

```ts
import { useAzesDialog, openDialog } from '@azes/ui-web';
// or
import { useAzesDialog, openDialog } from '@azes/ui-web/feedback';
```

## Hook API

```ts
const dialog = useAzesDialog();

await dialog.confirm({ title, description, onConfirm? }); // Promise<boolean>
await dialog.danger({ title, description, onConfirm? });  // Promise<boolean>, variant=danger
await dialog.notify({ variant: 'success', title });       // Promise<void>, OK only
await dialog.open({ variant: 'custom', title, content }); // Promise<boolean>
dialog.close(); // active → false (cancel)
```

- Confirm / Esc / backdrop (when allowed) → `false`
- Confirm button / successful `onConfirm` → `true`
- `notify` → resolves `void` when closed

### Async `onConfirm`

Button shows loading (`aria-busy`), cancel disabled. On success the dialog closes with `true`.
On throw, dialog stays open, error text appears (Alert), user can retry or cancel.

### Queue

One visible dialog at a time. Further calls enqueue; each call keeps its own promise.
No stacking. Provider unmount resolves pending promises as `false`.

### Route change

`hashchange` / `popstate` dismiss the active dialog as cancel (admin hash router).

## Defaults by variant

| Variant                    | Role        | Backdrop/Esc | Cancel       | Confirm color | Auto-focus |
| -------------------------- | ----------- | ------------ | ------------ | ------------- | ---------- |
| confirm                    | dialog      | yes          | yes          | primary       | confirm    |
| danger                     | alertdialog | no           | yes          | error         | cancel     |
| info/success/warning/error | dialog      | yes          | no (OK only) | tone          | OK         |
| custom                     | dialog      | yes          | yes          | primary       | confirm    |

Override with `closeOnBackdrop`, `hideCancel`, `autoFocus`, `icon`, `maxWidth`.

### Optional layout flags (backward compatible)

| Option               | Default | Purpose                                                          |
| -------------------- | ------- | ---------------------------------------------------------------- |
| `maxWidth`           | `'xs'`  | `'xs' \| 'sm' \| 'md' \| 'lg'`                                   |
| `fullScreenOnMobile` | `false` | `fullScreen` below `sm` (gallery details)                        |
| `showCloseButton`    | `false` | Title-row X (`labels.close`); recommended for `custom` galleries |
| `hideFooter`         | `false` | Omit Confirm/Cancel footer when content owns actions             |
| `paddingless`        | `false` | Zero content padding for edge-to-edge media                      |

Existing variants keep previous defaults when these flags are omitted. Custom gallery dialogs
still use `role="dialog"` (not `alertdialog`). Queue, focus return, and Esc/backdrop rules are
unchanged. Nested carousel lightbox Esc is handled inside `AzesCarousel` (see [24-carousel.md](24-carousel.md)).

Enter does **not** special-case confirm: danger focuses Cancel so Enter cancels.

## Snackbar vs dialog

| Use dialog                             | Use snackbar                |
| -------------------------------------- | --------------------------- |
| User must decide (delete, add-to-work) | Toast after success/failure |
| Blocking question / alert              | Non-blocking status         |
| Async action with retry in place       | Brief feedback              |

Do not replace snackbars with notify for every success — Prefer snackbar for post-action toasts;
use `notify` when the user must acknowledge a message before continuing.

## Imperative bridge (`openDialog`)

```ts
import { openDialog } from '@azes/ui-web/feedback';

// Outside React (e.g. future API middleware). No state in the bridge.
await openDialog({
  variant: 'error',
  title: 'Session expired',
  description: 'Sign in again to continue.',
});
```

`AzesDialogProvider` registers handlers on mount and clears them on unmount.
If no provider is mounted, `openDialog` resolves `false`.

There is currently **no** global API-middleware dialog wiring in this repo (401/403 use auth
redirect handlers). Keep the bridge ready; wire when a product flow needs a React-external dialog.

## i18n

Apps inject labels via `AzesUiProvider` `dialogLabels` (admin: `DialogLabelsBridge` +
`general.dialog.*` en/az/ru). Call sites override `confirmLabel` / `cancelLabel` / copy.

## Tokens / styles

- `theme.azes.dialog` — icon/padding/backdrop mix, typography keys
- `dialogStyles.ts` — `getDialogPaperSx`, `getDialogIconSx`, backdrop, etc.
- No hardcoded hex/rgba in host styles; use `theme.vars.palette.*`, `color-mix`, `theme.azesRadius.lg`

## Admin adoption

- Users delete → `dialog.danger` + delete mutation + table invalidate + success snackbar
- Ads delete → same pattern
- Ads “+” add-to-work → `dialog.confirm` + work mutation + snackbar; errors stay in dialog

Local `DeleteUserDialog` / `DeleteAdDialog` removed.

## Accordion dirty guard

`AzesConfirmDialog` remains for accordion discard flows (controlled open props). Prefer
`useAzesDialog` for new feature confirms.

## ESLint

`no-alert` is error in the base config — do not use `window.confirm` / `alert`.
Prefer `useAzesDialog` for simple questions; complex forms may use `variant="custom"` or a
dedicated page panel.

## Design Lab

`#/auth-lab` — AzesDialog section demos confirm, danger, notify, async error, queue, and a
paddingless gallery dialog.
