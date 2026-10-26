<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-004-ui-architecture.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-09-29
║ Purpose: Decision record for separate web/native UI over shared tokens
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-004: Separate ui-web and ui-native over shared design-tokens

## Context

Both web and native apps need a consistent AZES look, but platforms differ fundamentally.

## Problem

A single universal UI package forces leaky abstractions and couples apps to the wrong primitives.

## Options considered

- Separate `ui-web` + `ui-native`, shared `design-tokens`
- One universal cross-platform UI (e.g. react-native-web / Tamagui)
- No design system (apps use third-party libs directly)

## Decision

Two platform-specific UI packages consuming a shared, React-free `design-tokens` package. Web is
built on headless primitives (Radix-style); native on RN primitives. Apps import only
`@azes/ui-web` / `@azes/ui-native`.

## Why

- Platform-idiomatic components; no lowest-common-denominator API.
- Shared design language via tokens keeps brand consistency.
- Underlying primitive library is swappable without app changes.

## Consequences

- Some component work is duplicated across platforms (acceptable, intentional).
- Apps never depend on third-party UI directly.

## Status

Accepted. The web styling implementation (Radix-style CSS) is superseded for the theme
engine by [ADR-009](ADR-009-mui-web-theme.md). This record still requires separate
`ui-web` and `ui-native` packages over shared `design-tokens`.
