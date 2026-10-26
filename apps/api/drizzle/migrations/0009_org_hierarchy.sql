-- AZES COMPANY
-- File: apps/api/drizzle/migrations/0009_org_hierarchy.sql
-- Author: AZES_COMPANY
-- Created: 2026-10-26
-- Updated: 2026-10-26
-- Purpose: Org parent hierarchy + org_multi + data_scope (TAGET M2.5 / M3.5)
-- Layer: app

ALTER TABLE `organizations` ADD `parent_organization_id` text;
--> statement-breakpoint
CREATE INDEX `organizations_parent_idx` ON `organizations` (`parent_organization_id`);
--> statement-breakpoint
ALTER TABLE `organization_memberships` ADD `org_multi` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `organization_memberships` ADD `data_scope` text DEFAULT 'org' NOT NULL;
