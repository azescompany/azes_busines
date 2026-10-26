<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-007-package-layout.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Decision record reconciling package layout (flat vs nested)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-007: Flat package layout (design-tokens, ui-web, ui-native separate)

## Context

`strukture.md` proposes nesting UI as `packages/ui/{web,native,tokens}` and adds `config`,
`types`, `hooks` packages. The master prompt proposes flat, separate packages.

## Problem

Nested UI packages blur boundaries, complicate `exports` maps, and couple independent release
cadences of tokens vs. web vs. native UI.

## Options considered

- Flat: `design-tokens`, `ui-web`, `ui-native` as separate packages (+ `types`)
- Nested: `ui/{web,native,tokens}` (+ `config`, `types`, `hooks`)

## Decision

Adopt the **flat layout**: `design-tokens`, `ui-web`, `ui-native` as separate top-level packages.
Keep `packages/types`. Defer `packages/config` (covered by `tooling/*` + per-app config) and
`packages/hooks` (shared hooks stay app-local until proven shared).

## Why

- Clear, independent boundaries and `exports` per package.
- `design-tokens` must be React-free — separating it enforces that.
- Independent versioning/build caching per package.
- Avoids premature `config`/`hooks` packages (anti-dumping-ground principle).

## Consequences

- More top-level packages, each small and focused.
- `strukture.md` remains a historical reference; this ADR is authoritative on layout.

## Status

Accepted. (Selected as the recommended default.)
