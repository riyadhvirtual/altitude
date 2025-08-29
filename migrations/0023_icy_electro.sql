CREATE TABLE `event_aircraft` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`aircraft_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`aircraft_id`) REFERENCES `aircraft`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `event_aircraft_event_id_index` ON `event_aircraft` (`event_id`);--> statement-breakpoint
CREATE INDEX `event_aircraft_aircraft_id_index` ON `event_aircraft` (`aircraft_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `event_aircraft_unique` ON `event_aircraft` (`event_id`,`aircraft_id`);--> statement-breakpoint
CREATE TABLE `event_gates` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`gate_number` text NOT NULL,
	`airport_type` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `event_gates_event_id_index` ON `event_gates` (`event_id`);--> statement-breakpoint
CREATE INDEX `event_gates_airport_type_index` ON `event_gates` (`airport_type`);--> statement-breakpoint
CREATE UNIQUE INDEX `event_gates_unique` ON `event_gates` (`event_id`,`gate_number`,`airport_type`);--> statement-breakpoint
CREATE TABLE `event_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`user_id` text NOT NULL,
	`departure_gate_id` text,
	`arrival_gate_id` text,
	`joined_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`departure_gate_id`) REFERENCES `event_gates`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`arrival_gate_id`) REFERENCES `event_gates`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `event_participants_event_id_index` ON `event_participants` (`event_id`);--> statement-breakpoint
CREATE INDEX `event_participants_user_id_index` ON `event_participants` (`user_id`);--> statement-breakpoint
CREATE INDEX `event_participants_departure_gate_id_index` ON `event_participants` (`departure_gate_id`);--> statement-breakpoint
CREATE INDEX `event_participants_arrival_gate_id_index` ON `event_participants` (`arrival_gate_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `event_participants_unique` ON `event_participants` (`event_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`image_url` text,
	`departure_icao` text NOT NULL,
	`arrival_icao` text NOT NULL,
	`departure_time` integer NOT NULL,
	`flight_time` integer NOT NULL,
	`flight_number` text NOT NULL,
	`cargo` integer NOT NULL,
	`fuel` integer NOT NULL,
	`multiplier_id` text,
	`status` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`multiplier_id`) REFERENCES `multipliers`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `events_status_index` ON `events` (`status`);--> statement-breakpoint
CREATE INDEX `events_departure_time_index` ON `events` (`departure_time`);--> statement-breakpoint
CREATE INDEX `events_created_by_index` ON `events` (`created_by`);--> statement-breakpoint
CREATE INDEX `events_departure_icao_index` ON `events` (`departure_icao`);--> statement-breakpoint
CREATE INDEX `events_arrival_icao_index` ON `events` (`arrival_icao`);--> statement-breakpoint
CREATE INDEX `events_flight_number_index` ON `events` (`flight_number`);