<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-005-rn-runtime-expo.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Decision record for React Native runtime (Expo)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-005: React Native apps use Expo (managed workflow)

## Context

Three mobile apps (`mobile-account`, `mobile-agent`, `mobile-realestate`) share the platform layer
and must be quick to build and run.

## Problem

Choose a RN toolchain balancing DX, native flexibility, and maintenance in a monorepo.

## Options considered

- Expo (managed) with expo-router + EAS
- Bare React Native CLI
- Expo now, documented bare-eject later

## Decision

Use **Expo managed workflow** with `expo-router`, keeping `expo prebuild`/eject as a documented
escape hatch if a native requirement demands it.

## Why

- Fastest DX; shared config across three apps; OTA updates and EAS builds.
- expo-router gives a file-based routing model consistent across apps.
- Prebuild retains full native control when needed.

## Consequences

- Native modules must be Expo-compatible or added via config plugins/prebuild.
- Dev/run commands documented in WORKER.md Phase 10.

## Status

Accepted. (Selected as the recommended default.)
