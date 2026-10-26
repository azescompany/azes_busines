-- AZES COMPANY
-- File: apps/api/drizzle/migrations/0006_tenant_membership.sql
-- Author: AZES_COMPANY
-- Created: 2026-10-26
-- Updated: 2026-10-26
-- Purpose: Multi-org memberships + invitations (TAGET M1); users.org_id = active org
-- Layer: app

CREATE TABLE `organization_memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_memberships_org_user_uidx` ON `organization_memberships` (`org_id`, `user_id`);
--> statement-breakpoint
CREATE INDEX `organization_memberships_user_idx` ON `organization_memberships` (`user_id`);
--> statement-breakpoint
CREATE INDEX `organization_memberships_org_idx` ON `organization_memberships` (`org_id`);
--> statement-breakpoint
CREATE TABLE `organization_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`token_hash` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	`accepted_at` integer,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_invitations_token_hash_uidx` ON `organization_invitations` (`token_hash`);
--> statement-breakpoint
CREATE INDEX `organization_invitations_org_idx` ON `organization_invitations` (`org_id`);
--> statement-breakpoint
CREATE INDEX `organization_invitations_email_idx` ON `organization_invitations` (`email`);
--> statement-breakpoint
-- Backfill: existing single-home users become active members (role from user_roles if present).
INSERT INTO `organization_memberships` (`id`, `org_id`, `user_id`, `role`, `status`, `created_at`, `updated_at`)
SELECT
  lower(hex(randomblob(16))),
  u.`org_id`,
  u.`id`,
  COALESCE(
    (
      SELECT CASE
        WHEN r.`name` = 'admin' THEN 'orgAdmin'
        WHEN r.`name` IN ('orgAdmin', 'instructor', 'student', 'guest') THEN r.`name`
        ELSE 'orgAdmin'
      END
      FROM `user_roles` ur
      INNER JOIN `roles` r ON r.`id` = ur.`role_id`
      WHERE ur.`user_id` = u.`id` AND r.`name` != 'superAdmin'
      ORDER BY CASE r.`name`
        WHEN 'orgAdmin' THEN 3
        WHEN 'admin' THEN 3
        WHEN 'instructor' THEN 2
        WHEN 'student' THEN 1
        ELSE 0
      END DESC
      LIMIT 1
    ),
    'orgAdmin'
  ),
  'active',
  u.`created_at`,
  u.`updated_at`
FROM `users` u
WHERE u.`org_id` IS NOT NULL;
