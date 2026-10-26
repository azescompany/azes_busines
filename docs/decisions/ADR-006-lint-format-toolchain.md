<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-006-lint-format-toolchain.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Decision record for linting and formatting toolchain
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-006: ESLint + Prettier as the lint/format toolchain

## Context

`strukture.md` lists ESLint and a "Prettier/Biome strategy" (ambiguous). We must pick one standard.

## Problem

Choose a toolchain that enforces dependency boundaries and works across React, Next.js, and RN.

## Options considered

- ESLint + Prettier
- Biome (all-in-one)
- ESLint (lint) + Biome (format)

## Decision

Use **ESLint + Prettier**. ESLint (flat config) enforces code quality and import/dependency
boundaries; Prettier handles formatting.

## Why

- Richest plugin ecosystem for React, Next.js, React Native, and import-boundary enforcement —
  critical for our dependency-graph rules.
- Matches the ESLint choice already in `strukture.md`.
- Biome is faster but its lint/plugin coverage for our stack (esp. RN + boundary rules) is
  weaker today.

## Consequences

- Slightly slower than Biome; mitigated by Turborepo caching.
- Shared configs live in `tooling/eslint` and `tooling/prettier`.
- Revisit Biome if performance/coverage tradeoffs change.

## Status

Accepted. (Selected as the recommended default.)
