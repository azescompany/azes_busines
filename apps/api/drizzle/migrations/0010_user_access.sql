-- AZES COMPANY
-- File: apps/api/drizzle/migrations/0010_user_access.sql
-- Author: AZES_COMPANY
-- Created: 2026-10-26
-- Updated: 2026-10-26
-- Purpose: Permission profiles + user menu CRUD (TAGET M3)
-- Layer: app

CREATE TABLE `permission_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permission_profiles_code_uidx` ON `permission_profiles` (`code`);
--> statement-breakpoint
CREATE TABLE `permission_profile_items` (
	`profile_id` text NOT NULL,
	`menu_id` text NOT NULL,
	`can_read` integer DEFAULT 1 NOT NULL,
	`can_create` integer DEFAULT 0 NOT NULL,
	`can_update` integer DEFAULT 0 NOT NULL,
	`can_delete` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `permission_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permission_profile_items_uidx` ON `permission_profile_items` (`profile_id`, `menu_id`);
--> statement-breakpoint
CREATE TABLE `user_menus` (
	`user_id` text NOT NULL,
	`org_id` text NOT NULL,
	`menu_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_menus_uidx` ON `user_menus` (`user_id`, `org_id`, `menu_id`);
--> statement-breakpoint
CREATE TABLE `user_menu_permissions` (
	`user_id` text NOT NULL,
	`org_id` text NOT NULL,
	`menu_id` text NOT NULL,
	`can_read` integer DEFAULT 1 NOT NULL,
	`can_create` integer DEFAULT 0 NOT NULL,
	`can_update` integer DEFAULT 0 NOT NULL,
	`can_delete` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_menu_permissions_uidx` ON `user_menu_permissions` (`user_id`, `org_id`, `menu_id`);
--> statement-breakpoint
INSERT INTO `permission_profiles` (`id`, `code`, `name`, `description`, `created_at`, `updated_at`) VALUES
	('prof-org-admin', 'org-admin', 'Organization Admin', 'Full org admin menus', 1729872000, 1729872000),
	('prof-accountant', 'accountant', 'Accountant', 'Read-focused finance-ready profile', 1729872000, 1729872000),
	('prof-salesperson', 'salesperson', 'Salesperson', 'Sales-oriented profile', 1729872000, 1729872000),
	('prof-warehouse', 'warehouse-operator', 'Warehouse Operator', 'Inventory-oriented profile', 1729872000, 1729872000),
	('prof-readonly', 'read-only', 'Read-only User', 'Read-only home access', 1729872000, 1729872000);
--> statement-breakpoint
INSERT INTO `permission_profile_items` (`profile_id`, `menu_id`, `can_read`, `can_create`, `can_update`, `can_delete`) VALUES
	('prof-org-admin', 'menu-admin-home', 1, 0, 0, 0),
	('prof-org-admin', 'menu-admin-orgs', 1, 1, 1, 0),
	('prof-org-admin', 'menu-admin-users', 1, 1, 1, 0),
	('prof-accountant', 'menu-admin-home', 1, 0, 0, 0),
	('prof-salesperson', 'menu-admin-home', 1, 0, 0, 0),
	('prof-warehouse', 'menu-admin-home', 1, 0, 0, 0),
	('prof-readonly', 'menu-admin-home', 1, 0, 0, 0);
