<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: packages/i18n/README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Overview of @azes/i18n shared i18next foundation
║ Layer: package
╚══════════════════════════════════════════════════════════════╝
-->

# `@azes/i18n`

Shared i18next setup for web, Next.js, and React Native.

- **Global:** `common` namespace (`en`, `az`) — actions + shared auth session copy.
- **Per app:** pass `appId` + product `resources` (`admin`, `account`, …). Locale preference is
  stored under `azes.i18n.locale.<appId>` so products never overwrite each other.
- **UI:** apps use `@azes/ui-web/locale` (`AzesLocaleMenu`) in the app bar; call
  `changeAppLocale(i18n, code)` on change.
