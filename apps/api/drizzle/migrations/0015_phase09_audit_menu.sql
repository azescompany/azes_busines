-- AZES COMPANY
-- File: apps/api/drizzle/migrations/0015_phase09_audit_menu.sql
-- Author: AZES_COMPANY
-- Created: 2026-10-28
-- Updated: 2026-10-28
-- Purpose: Phase 09 — audit-logs Admin menu + generalAdmin role_menus (additive)
-- Layer: app

INSERT OR IGNORE INTO `menus` (`id`, `app`, `code`, `path`, `i18n_key`, `icon_key`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
	('menu-admin-audit', 'admin', 'audit-logs', '/audit-logs', 'nav.auditLogs', 'security', 60, 'active', 1730563200, 1730563200);
--> statement-breakpoint
INSERT OR IGNORE INTO `menu_permissions` (`menu_id`, `permission_code`) VALUES
	('menu-admin-audit', 'audit.read');
--> statement-breakpoint
INSERT OR IGNORE INTO `role_menus` (`role_name`, `menu_id`, `created_at`) VALUES
	('superAdmin', 'menu-admin-audit', 1730563200),
	('generalAdmin', 'menu-admin-home', 1730563200),
	('generalAdmin', 'menu-admin-orgs', 1730563200),
	('generalAdmin', 'menu-admin-audit', 1730563200);
