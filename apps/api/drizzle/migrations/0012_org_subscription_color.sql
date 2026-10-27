-- AZES COMPANY
-- File: apps/api/drizzle/migrations/0012_org_subscription_color.sql
-- Author: AZES_COMPANY
-- Created: 2026-10-26
-- Updated: 2026-10-26
-- Purpose: Org description, color, subscription-lite + member role seed (M5.0-lite)
-- Layer: app

ALTER TABLE `organizations` ADD `description` text;
--> statement-breakpoint
ALTER TABLE `organizations` ADD `color_code` text DEFAULT '#2563EB' NOT NULL;
--> statement-breakpoint
ALTER TABLE `organizations` ADD `subscription_status` text DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE `organizations` ADD `trial_ends_at` integer;
--> statement-breakpoint
INSERT OR IGNORE INTO `roles` (`id`, `name`, `created_at`) VALUES
	('role-member', 'member', 1730304000);
--> statement-breakpoint
INSERT OR IGNORE INTO `permission_profiles` (`id`, `code`, `name`, `description`, `created_at`, `updated_at`) VALUES
	('prof-member-default', 'member-default', 'Member Default', 'Default menus for new org members', 1730304000, 1730304000);
--> statement-breakpoint
INSERT OR IGNORE INTO `permission_profile_items` (`profile_id`, `menu_id`, `can_read`, `can_create`, `can_update`, `can_delete`) VALUES
	('prof-member-default', 'menu-admin-home', 1, 0, 0, 0);
--> statement-breakpoint
INSERT OR IGNORE INTO `menus` (`id`, `app`, `code`, `path`, `i18n_key`, `icon_key`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
	('menu-admin-platform-roles', 'admin', 'platform-roles', '/platform-roles', 'nav.platformRoles', 'security', 45, 'active', 1730304000, 1730304000);
--> statement-breakpoint
INSERT OR IGNORE INTO `menu_permissions` (`menu_id`, `permission_code`) VALUES
	('menu-admin-platform-roles', 'org.manage_all');
--> statement-breakpoint
INSERT OR IGNORE INTO `role_menus` (`role_name`, `menu_id`, `created_at`) VALUES
	('superAdmin', 'menu-admin-platform-roles', 1730304000);
