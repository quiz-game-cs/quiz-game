ALTER TABLE "categories" DROP CONSTRAINT "categories_name_unique";--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "major_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "minor_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "name";