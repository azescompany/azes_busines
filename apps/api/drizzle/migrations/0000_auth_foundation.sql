-- AZES COMPANY
-- File: apps/api/drizzle/migrations/0000_auth_foundation.sql
-- Author: AZES_COMPANY
-- Created: 2026-10-19
-- Updated: 2026-10-19
-- Purpose: Initial auth tables — users, roles, refresh sessions (no seed data)
-- Layer: app

CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username_normalized` text NOT NULL,
	`password_hash` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_normalized_uidx` ON `users` (`username_normalized`);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_name_uidx` ON `roles` (`name`);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_roles_uidx` ON `user_roles` (`user_id`,`role_id`);
--> statement-breakpoint
CREATE TABLE `refresh_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`revoked_at` integer,
	`replaced_by_id` text,
	`created_at` integer NOT NULL,
	`user_agent` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
