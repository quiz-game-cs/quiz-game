ALTER TABLE "categories" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "major_name" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "minor_name" text;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "close_answers" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "author_id" uuid;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_categories_major_name" ON "categories" USING btree ("major_name");--> statement-breakpoint
CREATE INDEX "idx_questions_author_id" ON "questions" USING btree ("author_id");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_code_unique" UNIQUE("code");