CREATE TABLE `sing_along_song` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`level` integer NOT NULL,
	`audioPath` text NOT NULL,
	`lyricsPath` text NOT NULL,
	`sortOrder` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sing_along_song_slug_unique` ON `sing_along_song` (`slug`);