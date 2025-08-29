ALTER TABLE `airline` ADD `default_locale` text;--> statement-breakpoint
CREATE INDEX `airline_default_locale_index` ON `airline` (`default_locale`);--> statement-breakpoint
ALTER TABLE `users` ADD `locale` text;--> statement-breakpoint
CREATE INDEX `users_locale_index` ON `users` (`locale`);