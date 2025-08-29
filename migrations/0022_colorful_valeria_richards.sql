ALTER TABLE `users` ADD `infinite_flight_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_infinite_flight_id_unique` ON `users` (`infinite_flight_id`);