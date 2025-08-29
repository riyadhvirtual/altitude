CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `accounts_user_id_index` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `accounts_provider_account_index` ON `accounts` (`account_id`,`provider_id`);--> statement-breakpoint
CREATE TABLE `aircraft` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`livery` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `aircraft_name_index` ON `aircraft` (`name`);--> statement-breakpoint
CREATE INDEX `aircraft_livery_index` ON `aircraft` (`livery`);--> statement-breakpoint
CREATE UNIQUE INDEX `aircraft_name_livery_unique` ON `aircraft` (`name`,`livery`);--> statement-breakpoint
CREATE TABLE `airline` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`callsign` text NOT NULL,
	`setup` integer NOT NULL,
	`light_logo` text,
	`dark_logo` text,
	`pireps_webhook_url` text,
	`new_applications_webhook_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `airline_name_index` ON `airline` (`name`);--> statement-breakpoint
CREATE INDEX `airline_callsign_index` ON `airline` (`callsign`);--> statement-breakpoint
CREATE TABLE `airports` (
	`id` text PRIMARY KEY NOT NULL,
	`icao` text NOT NULL,
	`iata` text,
	`name` text NOT NULL,
	`country` text NOT NULL,
	`continent` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`elevation_ft` integer,
	`type` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `airports_icao_index` ON `airports` (`icao`);--> statement-breakpoint
CREATE INDEX `airports_iata_index` ON `airports` (`iata`);--> statement-breakpoint
CREATE INDEX `airports_country_index` ON `airports` (`country`);--> statement-breakpoint
CREATE INDEX `airports_type_index` ON `airports` (`type`);--> statement-breakpoint
CREATE TABLE `leave_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`reason` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `leave_requests_user_id_index` ON `leave_requests` (`user_id`);--> statement-breakpoint
CREATE INDEX `leave_requests_status_index` ON `leave_requests` (`status`);--> statement-breakpoint
CREATE INDEX `leave_requests_start_date_index` ON `leave_requests` (`start_date`);--> statement-breakpoint
CREATE INDEX `leave_requests_end_date_index` ON `leave_requests` (`end_date`);--> statement-breakpoint
CREATE INDEX `leave_requests_active_lookup` ON `leave_requests` (`user_id`,`status`,`start_date`,`end_date`);--> statement-breakpoint
CREATE TABLE `multipliers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`value` real NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `multipliers_name_index` ON `multipliers` (`name`);--> statement-breakpoint
CREATE INDEX `multipliers_value_index` ON `multipliers` (`value`);--> statement-breakpoint
CREATE TABLE `pireps` (
	`id` text PRIMARY KEY NOT NULL,
	`flight_number` text NOT NULL,
	`date` integer NOT NULL,
	`departure_icao` text NOT NULL,
	`arrival_icao` text NOT NULL,
	`flight_time` integer NOT NULL,
	`cargo` integer NOT NULL,
	`fuel_burned` integer NOT NULL,
	`multiplier_id` text,
	`aircraft_id` text,
	`comments` text,
	`user_id` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`multiplier_id`) REFERENCES `multipliers`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`aircraft_id`) REFERENCES `aircraft`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pirep_flight_time_index` ON `pireps` (`flight_time`);--> statement-breakpoint
CREATE INDEX `pireps_user_status_index` ON `pireps` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `pireps_user_status_date_index` ON `pireps` (`user_id`,`status`,`date`);--> statement-breakpoint
CREATE INDEX `pireps_status_date_index` ON `pireps` (`status`,`date`);--> statement-breakpoint
CREATE INDEX `pireps_leaderboard_covering_index` ON `pireps` (`status`,`date`,`user_id`,`flight_time`);--> statement-breakpoint
CREATE TABLE `rank_aircraft` (
	`id` text PRIMARY KEY NOT NULL,
	`rank_id` text NOT NULL,
	`aircraft_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`rank_id`) REFERENCES `ranks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`aircraft_id`) REFERENCES `aircraft`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `rank_aircraft_rank_id_index` ON `rank_aircraft` (`rank_id`);--> statement-breakpoint
CREATE INDEX `rank_aircraft_aircraft_id_index` ON `rank_aircraft` (`aircraft_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `rank_aircraft_unique` ON `rank_aircraft` (`rank_id`,`aircraft_id`);--> statement-breakpoint
CREATE TABLE `ranks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`minimum_flight_time` integer NOT NULL,
	`maximum_flight_time` integer,
	`allow_all_aircraft` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ranks_name_unique` ON `ranks` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `ranks_minimum_flight_time_unique` ON `ranks` (`minimum_flight_time`);--> statement-breakpoint
CREATE INDEX `ranks_name_index` ON `ranks` (`name`);--> statement-breakpoint
CREATE INDEX `ranks_minimum_flight_time_index` ON `ranks` (`minimum_flight_time`);--> statement-breakpoint
CREATE INDEX `ranks_maximum_flight_time_index` ON `ranks` (`maximum_flight_time`);--> statement-breakpoint
CREATE TABLE `route_aircraft` (
	`id` text PRIMARY KEY NOT NULL,
	`route_id` text NOT NULL,
	`aircraft_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`aircraft_id`) REFERENCES `aircraft`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `route_aircraft_route_id_index` ON `route_aircraft` (`route_id`);--> statement-breakpoint
CREATE INDEX `route_aircraft_aircraft_id_index` ON `route_aircraft` (`aircraft_id`);--> statement-breakpoint
CREATE TABLE `routes` (
	`id` text PRIMARY KEY NOT NULL,
	`departure_icao` text NOT NULL,
	`arrival_icao` text NOT NULL,
	`flight_time` integer NOT NULL,
	`details` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `routes_departure_arrival_index` ON `routes` (`departure_icao`,`arrival_icao`);--> statement-breakpoint
CREATE INDEX `routes_flight_time_index` ON `routes` (`flight_time`);--> statement-breakpoint
CREATE TABLE `routes_flight_numbers` (
	`id` text PRIMARY KEY NOT NULL,
	`route_id` text NOT NULL,
	`flight_number` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `routes_flight_numbers_route_id_index` ON `routes_flight_numbers` (`route_id`);--> statement-breakpoint
CREATE INDEX `routes_flight_numbers_flight_number_index` ON `routes_flight_numbers` (`flight_number`);--> statement-breakpoint
CREATE INDEX `routes_flight_numbers_composite_index` ON `routes_flight_numbers` (`route_id`,`flight_number`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`impersonated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`impersonated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_index` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_ranks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`rank_id` text NOT NULL,
	`achieved_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`rank_id`) REFERENCES `ranks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_ranks_user_id_index` ON `user_ranks` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_ranks_rank_id_index` ON `user_ranks` (`rank_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_ranks_user_rank_unique` ON `user_ranks` (`user_id`,`rank_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`verified` integer NOT NULL,
	`callsign` integer,
	`role` text,
	`banned` integer NOT NULL,
	`banned_reason` text,
	`ban_expires` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_callsign_unique` ON `users` (`callsign`);--> statement-breakpoint
CREATE INDEX `users_email_index` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_callsign_index` ON `users` (`callsign`);--> statement-breakpoint
CREATE INDEX `users_name_index` ON `users` (`name`);--> statement-breakpoint
CREATE INDEX `users_search_composite` ON `users` (`name`,`callsign`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verifications_identifier_index` ON `verifications` (`identifier`);