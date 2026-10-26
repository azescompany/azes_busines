-- AZES COMPANY
-- File: apps/api/drizzle/migrations/0003_org_rbac_track.sql
-- Author: AZES_COMPANY
-- Created: 2026-10-20
-- Updated: 2026-10-20
-- Purpose: Organizations, Track, user org_id, course org_id (M1b)
-- Layer: app

CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_slug_uidx` ON `organizations` (`slug`);
--> statement-breakpoint
ALTER TABLE `users` ADD `org_id` text;
--> statement-breakpoint
CREATE INDEX `users_org_idx` ON `users` (`org_id`);
--> statement-breakpoint
ALTER TABLE `courses` ADD `org_id` text;
--> statement-breakpoint
CREATE INDEX `courses_org_idx` ON `courses` (`org_id`);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tracks_org_slug_uidx` ON `tracks` (`org_id`,`slug`);
--> statement-breakpoint
CREATE INDEX `tracks_org_idx` ON `tracks` (`org_id`);
--> statement-breakpoint
CREATE INDEX `tracks_created_by_idx` ON `tracks` (`created_by`);
--> statement-breakpoint
CREATE TABLE `track_courses` (
	`track_id` text NOT NULL,
	`course_id` text NOT NULL,
	`position` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `track_courses_uidx` ON `track_courses` (`track_id`,`course_id`);
--> statement-breakpoint
CREATE TABLE `user_tracks` (
	`user_id` text NOT NULL,
	`track_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`assigned_by` text NOT NULL,
	`assigned_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_tracks_uidx` ON `user_tracks` (`user_id`,`track_id`);
--> statement-breakpoint
CREATE INDEX `user_tracks_user_idx` ON `user_tracks` (`user_id`);
