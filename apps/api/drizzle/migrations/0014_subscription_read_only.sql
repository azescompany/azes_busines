-- AZES COMPANY
-- File: apps/api/drizzle/migrations/0014_subscription_read_only.sql
-- Author: AZES_COMPANY
-- Created: 2026-10-27
-- Updated: 2026-10-27
-- Purpose: AC-D08 subscription lite — optional read-only flag on organizations
-- Layer: app

ALTER TABLE `organizations` ADD `subscription_read_only` integer DEFAULT 0 NOT NULL;
