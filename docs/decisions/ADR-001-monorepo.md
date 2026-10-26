<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-001-monorepo.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Decision record for monorepo tooling (Turborepo + pnpm)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-001: Monorepo with Turborepo + pnpm

## Context

Multiple web and mobile apps must share a platform layer with fast, cached builds and strict
package boundaries.

## Problem

We need one repository that supports many apps/packages, incremental caching, and enforceable
dependency rules, without heavy setup.

## Options considered

- pnpm workspaces + Turborepo
- Nx
- Yarn/npm workspaces alone
- Bazel

## Decision

Use **pnpm workspaces** for dependency management and **Turborepo** for task orchestration and
caching. Package scope `@azes/*`.

## Why

- pnpm: strict, content-addressed store, fast installs, first-class workspaces.
- Turborepo: minimal config, remote-cache ready, good DX; less prescriptive than Nx.
- Matches `strukture.md`.

## Consequences

- Task pipelines defined in `turbo.json`.
- Remote cache can be enabled later.
- Boundaries enforced via ESLint + package `exports`.

## Status

Accepted.
