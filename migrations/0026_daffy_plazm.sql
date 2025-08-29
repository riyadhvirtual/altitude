PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
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
	`discord_username` text NOT NULL,
	`discourse_username` text,
	`infinite_flight_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "email_verified", "image", "verified", "callsign", "role", "banned", "banned_reason", "ban_expires", "discord_username", "discourse_username", "infinite_flight_id", "created_at", "updated_at") SELECT "id", "name", "email", "email_verified", "image", "verified", "callsign", "role", "banned", "banned_reason", "ban_expires", "discord_username", "discourse_username", "infinite_flight_id", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_callsign_unique` ON `users` (`callsign`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_discord_username_unique` ON `users` (`discord_username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_discourse_username_unique` ON `users` (`discourse_username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_infinite_flight_id_unique` ON `users` (`infinite_flight_id`);--> statement-breakpoint
CREATE INDEX `users_email_index` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_callsign_index` ON `users` (`callsign`);--> statement-breakpoint
CREATE INDEX `users_name_index` ON `users` (`name`);--> statement-breakpoint
CREATE INDEX `users_search_composite` ON `users` (`name`,`callsign`);--> statement-breakpoint
CREATE INDEX `users_created_at_index` ON `users` (`created_at`);