ALTER TABLE `airline` ADD `infinite_flight_api_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_discord_username_unique` ON `users` (`discord_username`);