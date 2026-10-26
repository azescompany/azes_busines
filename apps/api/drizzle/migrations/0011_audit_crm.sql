-- AZES COMPANY
-- File: apps/api/drizzle/migrations/0011_audit_crm.sql
-- Author: AZES_COMPANY
-- Created: 2026-10-26
-- Updated: 2026-10-26
-- Purpose: Audit logs + CRM customers (TAGET M4)
-- Layer: app

CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text,
	`org_id` text,
	`action` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text,
	`meta_json` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_logs_created_idx` ON `audit_logs` (`created_at`);
--> statement-breakpoint
CREATE INDEX `audit_logs_org_idx` ON `audit_logs` (`org_id`);
--> statement-breakpoint
CREATE TABLE `crm_customers` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`status` text DEFAULT 'active' NOT NULL,
	`owner_user_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `crm_customers_org_idx` ON `crm_customers` (`org_id`);
--> statement-breakpoint
-- CRM customers menu
INSERT INTO `menus` (`id`, `app`, `code`, `path`, `i18n_key`, `icon_key`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
	('menu-admin-customers', 'admin', 'customers', '/customers', 'nav.customers', 'people', 50, 'active', 1729872000, 1729872000);
--> statement-breakpoint
INSERT INTO `menu_permissions` (`menu_id`, `permission_code`) VALUES
	('menu-admin-customers', 'crm.customers.read'),
	('menu-admin-customers', 'crm.customers.create'),
	('menu-admin-customers', 'crm.customers.update'),
	('menu-admin-customers', 'crm.customers.delete');
--> statement-breakpoint
INSERT INTO `module_menus` (`module_id`, `menu_id`) VALUES
	('pmod-crm', 'menu-admin-customers');
--> statement-breakpoint
INSERT INTO `role_menus` (`role_name`, `menu_id`, `created_at`) VALUES
	('superAdmin', 'menu-admin-customers', 1729872000),
	('orgAdmin', 'menu-admin-customers', 1729872000);
