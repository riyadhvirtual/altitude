DROP INDEX `airline_callsign_min_range_index`;--> statement-breakpoint
DROP INDEX `airline_callsign_max_range_index`;--> statement-breakpoint
DROP INDEX `airline_smtp_host_index`;--> statement-breakpoint
DROP INDEX `airline_smtp_port_index`;--> statement-breakpoint
DROP INDEX `airline_smtp_secure_index`;--> statement-breakpoint
DROP INDEX `airline_default_locale_index`;--> statement-breakpoint
ALTER TABLE `airline` ADD `theme` text;--> statement-breakpoint
ALTER TABLE `airline` DROP COLUMN `default_locale`;--> statement-breakpoint
DROP INDEX `pirep_flight_time_index`;--> statement-breakpoint
DROP INDEX `pireps_user_status_date_index`;--> statement-breakpoint
DROP INDEX `pireps_leaderboard_covering_index`;--> statement-breakpoint
CREATE INDEX `pireps_analytics_covering` ON `pireps` (`status`,`date`,`user_id`,`flight_time`);--> statement-breakpoint
CREATE INDEX `pireps_daily_stats` ON `pireps` (`status`,`date`,`flight_time`);--> statement-breakpoint
DROP INDEX `users_locale_index`;--> statement-breakpoint
CREATE INDEX `users_created_at_index` ON `users` (`created_at`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `locale`;