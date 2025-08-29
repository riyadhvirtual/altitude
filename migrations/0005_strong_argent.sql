CREATE TABLE `event_aircraft` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`flight_number` text NOT NULL,
	`departure_icao` text NOT NULL,
	`arrival_icao` text NOT NULL,
	`flight_time` integer NOT NULL,
	`date` integer NOT NULL,
	`multiplier_id` text,
	`comments` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`multiplier_id`) REFERENCES `multipliers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_name_unique` ON `events` (`name`);