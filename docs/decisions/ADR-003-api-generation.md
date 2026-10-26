<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-003-api-generation.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Decision record for API client generation (Orval)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-003: Generate the API client with Orval from OpenAPI

## Context

The backend is external and exposes OpenAPI/Swagger contracts. The frontend must stay in sync.

## Problem

Hand-written clients drift from the contract and duplicate types.

## Options considered

- Orval (generates typed client + TanStack Query hooks)
- openapi-typescript + manual client
- GraphQL codegen (N/A — REST/OpenAPI)
- Hand-written client

## Decision

Use **Orval** to generate the client and Query hooks into `packages/api/generated/`, backed by a
shared custom HTTP mutator.

## Why

- Types and hooks generated directly from the contract; minimal drift.
- Native TanStack Query output aligns with ADR-002.
- Custom mutator centralizes auth, headers, error normalization.

## Consequences

- `generated/` is never hand-edited.
- `pnpm api:generate` + CI drift check.
- Regeneration workflow documented in `docs/architecture/api-architecture.md`.

## Status

Accepted.
