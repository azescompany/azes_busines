-- AZES COMPANY
-- File: apps/api/drizzle/migrations/0008_platform_modules.sql
-- Author: AZES_COMPANY
-- Created: 2026-10-26
-- Updated: 2026-10-26
-- Purpose: Platform module registry (TAGET M2) — not LMS curriculum modules
-- Layer: app

CREATE TABLE `platform_modules` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`version` text DEFAULT '1.0.0' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `platform_modules_code_uidx` ON `platform_modules` (`code`);
--> statement-breakpoint
CREATE TABLE `module_menus` (
	`module_id` text NOT NULL,
	`menu_id` text NOT NULL,
	FOREIGN KEY (`module_id`) REFERENCES `platform_modules`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `module_menus_uidx` ON `module_menus` (`module_id`, `menu_id`);
--> statement-breakpoint
CREATE TABLE `organization_modules` (
	`org_id` text NOT NULL,
	`module_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`module_id`) REFERENCES `platform_modules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_modules_uidx` ON `organization_modules` (`org_id`, `module_id`);
--> statement-breakpoint
CREATE TABLE `organization_menus` (
	`org_id` text NOT NULL,
	`menu_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_menus_uidx` ON `organization_menus` (`org_id`, `menu_id`);
--> statement-breakpoint
INSERT INTO `platform_modules` (`id`, `code`, `name`, `version`, `status`, `created_at`, `updated_at`) VALUES
	('pmod-admin-core', 'admin-core', 'Admin Core', '1.0.0', 'active', 1729872000, 1729872000),
	('pmod-crm', 'crm', 'CRM', '1.0.0', 'active', 1729872000, 1729872000);
--> statement-breakpoint
INSERT INTO `module_menus` (`module_id`, `menu_id`) VALUES
	('pmod-admin-core', 'menu-admin-home'),
	('pmod-admin-core', 'menu-admin-orgs'),
	('pmod-admin-core', 'menu-admin-users'),
	('pmod-admin-core', 'menu-admin-role-menus');
