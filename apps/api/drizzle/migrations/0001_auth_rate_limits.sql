-- AZES COMPANY
-- File: apps/api/drizzle/migrations/0001_auth_rate_limits.sql
-- Author: AZES_COMPANY
-- Created: 2026-10-19
-- Updated: 2026-10-19
-- Purpose: D1-backed auth rate-limit buckets (Phase 2E)
-- Layer: app

CREATE TABLE `auth_rate_limits` (
	`bucket_key` text PRIMARY KEY NOT NULL,
	`window_start` integer NOT NULL,
	`hit_count` integer NOT NULL
);
