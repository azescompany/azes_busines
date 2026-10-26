-- AZES COMPANY
-- File: apps/api/drizzle/migrations/0007_menu_rbac.sql
-- Author: AZES_COMPANY
-- Created: 2026-10-26
-- Updated: 2026-10-26
-- Purpose: Admin menus + role_menus + menu_permissions (TAGET M1.5)
-- Layer: app

CREATE TABLE `menus` (
	`id` text PRIMARY KEY NOT NULL,
	`app` text DEFAULT 'admin' NOT NULL,
	`code` text NOT NULL,
	`path` text NOT NULL,
	`i18n_key` text NOT NULL,
	`icon_key` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `menus_app_code_uidx` ON `menus` (`app`, `code`);
--> statement-breakpoint
CREATE INDEX `menus_app_sort_idx` ON `menus` (`app`, `sort_order`);
--> statement-breakpoint
CREATE TABLE `menu_permissions` (
	`menu_id` text NOT NULL,
	`permission_code` text NOT NULL,
	FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `menu_permissions_uidx` ON `menu_permissions` (`menu_id`, `permission_code`);
--> statement-breakpoint
CREATE TABLE `role_menus` (
	`role_name` text NOT NULL,
	`menu_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `role_menus_uidx` ON `role_menus` (`role_name`, `menu_id`);
--> statement-breakpoint
CREATE INDEX `role_menus_role_idx` ON `role_menus` (`role_name`);
--> statement-breakpoint
-- Seed Admin menus (fixed PATHS)
INSERT INTO `menus` (`id`, `app`, `code`, `path`, `i18n_key`, `icon_key`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
	('menu-admin-home', 'admin', 'home', '/', 'nav.home', 'home', 10, 'active', 1729872000, 1729872000),
	('menu-admin-orgs', 'admin', 'organizations', '/organizations', 'nav.organizations', 'business', 20, 'active', 1729872000, 1729872000),
	('menu-admin-users', 'admin', 'users', '/users', 'nav.users', 'people', 30, 'active', 1729872000, 1729872000),
	('menu-admin-role-menus', 'admin', 'role-menus', '/role-menus', 'nav.roleMenus', 'security', 40, 'active', 1729872000, 1729872000);
--> statement-breakpoint
-- home: auth-only (no permission row)
INSERT INTO `menu_permissions` (`menu_id`, `permission_code`) VALUES
	('menu-admin-orgs', 'org.manage'),
	('menu-admin-orgs', 'org.create'),
	('menu-admin-users', 'org.manage'),
	('menu-admin-role-menus', 'org.manage_all');
--> statement-breakpoint
-- Default role → menu bindings
INSERT INTO `role_menus` (`role_name`, `menu_id`, `created_at`) VALUES
	('superAdmin', 'menu-admin-home', 1729872000),
	('superAdmin', 'menu-admin-orgs', 1729872000),
	('superAdmin', 'menu-admin-users', 1729872000),
	('superAdmin', 'menu-admin-role-menus', 1729872000),
	('orgAdmin', 'menu-admin-home', 1729872000),
	('orgAdmin', 'menu-admin-orgs', 1729872000),
	('orgAdmin', 'menu-admin-users', 1729872000),
	('instructor', 'menu-admin-home', 1729872000),
	('student', 'menu-admin-home', 1729872000);
