CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nickname" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_nickname_unique" UNIQUE("nickname")
);
--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_name_key";--> statement-breakpoint
ALTER TABLE "questions" DROP CONSTRAINT "questions_category_id_fkey";
--> statement-breakpoint
DROP INDEX "idx_play_records_created_at";--> statement-breakpoint
DROP INDEX "idx_play_records_question_correct";--> statement-breakpoint
DROP INDEX "idx_play_records_question_id";--> statement-breakpoint
ALTER TABLE "play_records" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "play_records" ADD CONSTRAINT "play_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_play_records_user_id" ON "play_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_play_records_created_at" ON "play_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_play_records_question_correct" ON "play_records" USING btree ("question_id","is_correct");--> statement-breakpoint
CREATE INDEX "idx_play_records_question_id" ON "play_records" USING btree ("question_id");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_name_unique" UNIQUE("name");