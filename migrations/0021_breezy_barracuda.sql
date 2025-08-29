ALTER TABLE `users` ADD `discourse_username` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_discourse_username_unique` ON `users` (`discourse_username`);