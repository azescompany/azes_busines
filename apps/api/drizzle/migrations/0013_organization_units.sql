-- AZES COMPANY
-- File: apps/api/drizzle/migrations/0013_organization_units.sql
-- Author: AZES_COMPANY
-- Created: 2026-10-27
-- Updated: 2026-10-27
-- Purpose: In-tenant Organization Units + unit_memberships (AC-D02 A / Phase 03)
-- Layer: app

CREATE TABLE `organization_units` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`parent_unit_id` text,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`kind` text DEFAULT 'other' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_units_org_code_uidx` ON `organization_units` (`org_id`, `code`);
--> statement-breakpoint
CREATE INDEX `organization_units_org_idx` ON `organization_units` (`org_id`);
--> statement-breakpoint
CREATE INDEX `organization_units_parent_idx` ON `organization_units` (`parent_unit_id`);
--> statement-breakpoint
CREATE TABLE `unit_memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`unit_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`unit_id`) REFERENCES `organization_units`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unit_memberships_unit_user_uidx` ON `unit_memberships` (`unit_id`, `user_id`);
--> statement-breakpoint
CREATE INDEX `unit_memberships_org_idx` ON `unit_memberships` (`org_id`);
--> statement-breakpoint
CREATE INDEX `unit_memberships_user_idx` ON `unit_memberships` (`user_id`);
