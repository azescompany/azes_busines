<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-008-design-tokens.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Decision record for the design-tokens strategy
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-008: Framework-agnostic design-tokens as the single source of truth

## Context

Web, Next.js, and React Native must share one brand/design language.

## Problem

Duplicated design values across platforms drift and break consistency.

## Options considered

- A React-free `design-tokens` package emitting TS + CSS variables
- Tokens embedded inside each UI package
- A third-party design-token tool (e.g. Style Dictionary) as the authoring layer

## Decision

A dedicated, **React-free** `packages/design-tokens` is the single source of truth. It emits:

- a TypeScript token object (consumed by RN and JS), and
- CSS custom properties (consumed by web/Next.js).

Authoring may adopt Style Dictionary internally later; the public output contract stays stable.

## Why

- One source prevents drift; both platforms consume the same values.
- No React dependency keeps it usable everywhere and cheap to import.
- Stable output contract lets internals change without breaking consumers.

## Consequences

- Token categories fixed in `docs/architecture/ui-architecture.md`.
- `ui-web` and `ui-native` depend on `design-tokens`, not vice versa.

## Status

Accepted.
