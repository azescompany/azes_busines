<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/architecture/package-architecture.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Ownership, responsibilities, and boundaries of each package
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Package Architecture

Every package has a single clear responsibility, a public entry point, and explicit allowed /
forbidden dependencies. No deep imports across packages.

## Public API discipline

- Consumers import from `@azes/<pkg>` (or a controlled subpath like `@azes/ui-web/button`).
- Never `@azes/ui-web/src/components/button/Button`.
- Each package defines an `exports` map; internals are not importable.

## Package catalog

### design-tokens

- Purpose: single source of design language (colors, typography, spacing, radius,
  shadow/elevation, breakpoints, z-index, motion, sizing, semantic colors, light/dark).
- Allowed: nothing framework-specific. Pure TS + generated CSS variables.
- Forbidden: React, react-native, api, state.
- Consumers: `ui-web`, `ui-native`, apps (tokens only).

### ui-web

- Purpose: AZES web design system over headless primitives (Radix-style).
- Allowed: `design-tokens`, React, accessibility primitives, `utils`, `constants`, `types`.
- Forbidden: `api`, `state`, `auth`, business domains.
- Consumers: web + Next.js apps.

### ui-native

- Purpose: AZES native design system over RN primitives.
- Allowed: `design-tokens`, react-native, `utils`, `constants`, `types`.
- Forbidden: `api`, `state`, `auth`, business domains, web-only libraries.
- Consumers: mobile apps.

### api

- Purpose: OpenAPI-generated client + TanStack Query hooks/mutations.
- Structure: `generated/` (never edited), `client/`, `query/`, `mutations/`, `config/`.
- Allowed: `types`, HTTP client, TanStack Query, `constants`.
- Forbidden: React UI, Redux business logic, editing generated files.
- Consumers: apps, `state` (for thin server/client coordination only).

### state

- Purpose: Redux Toolkit store for client/global state.
- Allowed: `types`, `constants`, RTK, persistence adapters.
- Forbidden: storing server data owned by TanStack Query; UI packages.
- Consumers: apps.

### auth

- Purpose: platform-agnostic auth contracts + web/native adapters.
- Allowed: `types`, `state`, secure-storage/browser-storage adapters.
- Forbidden: direct provider coupling in the contract layer.
- Consumers: apps.

### validation

- Purpose: Zod schemas complementing (not duplicating) OpenAPI contracts.
- Allowed: `types`, zod, `constants`.
- Forbidden: React, api generated duplication.
- Consumers: apps, forms.

### i18n

- Purpose: i18next setup, locale structure, formatting, pluralization for web/next/native.
- Allowed: i18next, `constants`, `types`.
- Forbidden: app-specific strings baked into the package.
- Consumers: apps.

### permissions

- Purpose: `resource.action` model for UX/navigation decisions (not authorization).
- Allowed: `types`, `constants`.
- Forbidden: assuming it replaces backend authorization.
- Consumers: apps, UI gating.

### analytics

- Purpose: `analytics.track(...)` abstraction over swappable providers.
- Allowed: `types`, `constants`, `logger`.
- Forbidden: leaking a provider SDK to apps.
- Consumers: apps.

### logger

- Purpose: structured, env-aware logging (info/warn/error/debug).
- Allowed: `types`, `constants`.
- Forbidden: logging sensitive data by default.
- Consumers: everything.

### feature-flags

- Purpose: provider-agnostic feature flag evaluation.
- Allowed: `types`, `constants`.
- Forbidden: provider coupling in app code.
- Consumers: apps.

### utils

- Purpose: pure, reusable, framework-agnostic utilities.
- Allowed: `types`, `constants`.
- Forbidden: React, react-native, api, business logic, app config.
- Consumers: everything.

### constants

- Purpose: stable shared constants.
- Forbidden: business logic, API logic, React components, app-specific config.
- Consumers: everything.

### types

- Purpose: shared TypeScript types not owned by a single package.
- Forbidden: runtime code, React.
- Consumers: everything.

### testing

- Purpose: shared test utilities, presets, and helpers.
- Allowed: testing libraries, `types`.
- Consumers: packages + apps (devDependency).

## Anti-dumping-ground rules

- `utils` and `constants` are not junk drawers. New entries need a clear, reusable purpose.
- If something is used by exactly one app, it belongs in that app, not a package.
