ALTER TABLE `airline` ADD `smtp_host` text;--> statement-breakpoint
ALTER TABLE `airline` ADD `smtp_port` integer;--> statement-breakpoint
ALTER TABLE `airline` ADD `smtp_username` text;--> statement-breakpoint
ALTER TABLE `airline` ADD `smtp_password` text;--> statement-breakpoint
ALTER TABLE `airline` ADD `smtp_from_email` text;--> statement-breakpoint
ALTER TABLE `airline` ADD `smtp_from_name` text;--> statement-breakpoint
ALTER TABLE `airline` ADD `smtp_secure` integer;--> statement-breakpoint
CREATE INDEX `airline_callsign_min_range_index` ON `airline` (`callsign_min_range`);--> statement-breakpoint
CREATE INDEX `airline_callsign_max_range_index` ON `airline` (`callsign_max_range`);--> statement-breakpoint
CREATE INDEX `airline_smtp_host_index` ON `airline` (`smtp_host`);--> statement-breakpoint
CREATE INDEX `airline_smtp_port_index` ON `airline` (`smtp_port`);--> statement-breakpoint
CREATE INDEX `airline_smtp_secure_index` ON `airline` (`smtp_secure`);