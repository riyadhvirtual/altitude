CREATE TABLE `pirep_events` (
	`id` text PRIMARY KEY NOT NULL,
	`pirep_id` text NOT NULL,
	`action` text NOT NULL,
	`performed_by` text NOT NULL,
	`details` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`pirep_id`) REFERENCES `pireps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`performed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pirep_events_pirep_id_index` ON `pirep_events` (`pirep_id`);--> statement-breakpoint
CREATE INDEX `pirep_events_action_index` ON `pirep_events` (`action`);--> statement-breakpoint
CREATE INDEX `pirep_events_performed_by_index` ON `pirep_events` (`performed_by`);--> statement-breakpoint
CREATE INDEX `pirep_events_created_at_index` ON `pirep_events` (`created_at`);--> statement-breakpoint
DROP TABLE `event_aircraft`;--> statement-breakpoint
DROP TABLE `event_gates`;--> statement-breakpoint
DROP TABLE `event_registrations`;--> statement-breakpoint
DROP TABLE `events`;