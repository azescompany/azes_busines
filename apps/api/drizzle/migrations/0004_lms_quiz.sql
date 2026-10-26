-- AZES COMPANY
-- File: apps/api/drizzle/migrations/0004_lms_quiz.sql
-- Author: AZES_COMPANY
-- Created: 2026-10-20
-- Updated: 2026-10-20
-- Purpose: Quiz, questions, attempts, assignments, submissions (M6)
-- Layer: app

CREATE TABLE `quizzes` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`lesson_id` text,
	`title` text NOT NULL,
	`time_limit_sec` integer,
	`max_attempts` integer DEFAULT 3 NOT NULL,
	`pass_score` integer DEFAULT 70 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `quizzes_course_idx` ON `quizzes` (`course_id`);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_id` text NOT NULL,
	`type` text DEFAULT 'single_choice' NOT NULL,
	`text` text NOT NULL,
	`options_json` text,
	`correct_answer_json` text NOT NULL,
	`explanation` text,
	`points` integer DEFAULT 1 NOT NULL,
	`position` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `questions_quiz_idx` ON `questions` (`quiz_id`);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_id` text NOT NULL,
	`user_id` text NOT NULL,
	`started_at` integer NOT NULL,
	`expires_at` integer,
	`submitted_at` integer,
	`score` integer,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`idempotency_key` text,
	`answers_json` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `quiz_attempts_quiz_user_idx` ON `quiz_attempts` (`quiz_id`,`user_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_attempts_idempotency_uidx` ON `quiz_attempts` (`quiz_id`,`user_id`,`idempotency_key`);
--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`lesson_id` text,
	`title` text NOT NULL,
	`description` text,
	`due_at` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `assignments_course_idx` ON `assignments` (`course_id`);
--> statement-breakpoint
CREATE TABLE `assignment_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`assignment_id` text NOT NULL,
	`user_id` text NOT NULL,
	`content` text,
	`file_id` text,
	`status` text DEFAULT 'submitted' NOT NULL,
	`score` integer,
	`feedback` text,
	`graded_by` text,
	`graded_at` integer,
	`submitted_at` integer NOT NULL,
	`idempotency_key` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`graded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `assignment_submissions_assignment_idx` ON `assignment_submissions` (`assignment_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `assignment_submissions_idempotency_uidx` ON `assignment_submissions` (`assignment_id`,`user_id`,`idempotency_key`);
