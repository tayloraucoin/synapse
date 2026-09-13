-- HAND-AMENDED after `drizzle-kit generate` — DYN-3, UX v1.1 §11.2, §11.6–§11.10,
-- §9.3 (TD-2, TD-5, TD-7, TD-8, TD-9). The generated statements are unchanged;
-- one block is appended at the end:
--
--   The immutability trigger on `day_blocks.original_scheduled_start`. The
--   function `day_items_original_start_immutable()` (01_init_functions.sql)
--   already permits exactly one transition — NULL → value — and refuses every
--   other write, which is TD-5's rule; its body is table-agnostic, so the
--   same function is armed on `day_blocks`. It is re-declared here, identically,
--   so a database migrated before the platform setup ran still has it;
--   02_apply_triggers_rls.sql arms both triggers on every setup run.
--
-- Not here: the four day-side enum values (they landed in 0004 — see Epic 4's
-- DEVIATIONS), the `day_block_id NOT NULL` (0006, after DYN-5's backfill), and
-- any drop (0006).
CREATE TYPE "public"."anchor_direction" AS ENUM('work_waits', 'routine_cut', 'depends');--> statement-breakpoint
CREATE TYPE "public"."overflow_mode" AS ENUM('daily_menu', 'variants', 'auto_trim');--> statement-breakpoint
CREATE TYPE "public"."schedule_shape" AS ENUM('own_structure_dynamic', 'consistent_shifts', 'varying_shifts', 'fluid');--> statement-breakpoint
CREATE TYPE "public"."day_block_state" AS ENUM('planned', 'pooled', 'set', 'not_today');--> statement-breakpoint
CREATE TYPE "public"."day_shape" AS ENUM('structured', 'unstructured');--> statement-breakpoint
CREATE TYPE "public"."training_placement" AS ENUM('before_morning', 'after_morning', 'inside_work', 'after_work', 'in_break');--> statement-breakpoint
CREATE TYPE "public"."shift_kind" AS ENUM('shift', 'refit');--> statement-breakpoint
CREATE TABLE "fixtures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	"at_time" time NOT NULL,
	"block_kind" "block_kind" DEFAULT 'activity' NOT NULL,
	"duration_min" smallint NOT NULL,
	"scheduling" "scheduling" DEFAULT 'hard' NOT NULL,
	"title" text NOT NULL,
	"weekdays" smallint[] NOT NULL,
	"habit_id" uuid,
	"user_id" uuid NOT NULL,
	CONSTRAINT "fixtures_duration_min_check" CHECK ("fixtures"."duration_min" BETWEEN 1 AND 480),
	CONSTRAINT "fixtures_title_check" CHECK (length("fixtures"."title") BETWEEN 1 AND 60),
	CONSTRAINT "fixtures_weekdays_check" CHECK (cardinality("fixtures"."weekdays") >= 1 AND ("fixtures"."weekdays" <@ ARRAY[0,1,2,3,4,5,6]::smallint[]))
);
--> statement-breakpoint
ALTER TABLE "fixtures" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "day_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"kind" "block_kind" NOT NULL,
	"original_scheduled_start" timestamp with time zone,
	"placement" "training_placement",
	"scheduled_end" timestamp with time zone,
	"scheduled_start" timestamp with time zone,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"state" "day_block_state" DEFAULT 'planned' NOT NULL,
	"template_name_snapshot" text,
	"day_id" uuid NOT NULL,
	"template_id" uuid,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "day_blocks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"day_id" uuid NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "journal_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "shifts" DROP CONSTRAINT "shifts_delta_min_check";--> statement-breakpoint
DROP INDEX "notification_prefs_user_id_kind_idx";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "anchor_direction" "anchor_direction";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "block_order" jsonb DEFAULT '["orient","morning","prep","work","activity","wind_down"]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "devices_off_time" time;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "earliest_wake_time" time;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "journal_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "journal_prompts" jsonb DEFAULT '[{"key":"day_went","label":"How the day went"},{"key":"gratitude_today","label":"Grateful for today"},{"key":"gratitude_life","label":"Grateful for, in life"},{"key":"looking_forward","label":"Looking forward to"},{"key":"make_happen_tomorrow","label":"What I want to make happen tomorrow"},{"key":"visualisation","label":"Tomorrow, as I see it"}]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lights_out_time" time;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "orient_ask_gratitude" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "orient_passage" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "orient_show_last_night" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "overflow_mode" "overflow_mode" DEFAULT 'daily_menu' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "schedule_shape" "schedule_shape";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "work_days" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "work_end_time" time;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "work_start_time" time;--> statement-breakpoint
ALTER TABLE "days" ADD COLUMN "anchor_is_hard" boolean;--> statement-breakpoint
ALTER TABLE "days" ADD COLUMN "confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "days" ADD COLUMN "intention" text;--> statement-breakpoint
ALTER TABLE "days" ADD COLUMN "morning_gratitude" text;--> statement-breakpoint
ALTER TABLE "days" ADD COLUMN "shape" "day_shape" DEFAULT 'structured' NOT NULL;--> statement-breakpoint
ALTER TABLE "days" ADD COLUMN "work_start_time" time;--> statement-breakpoint
ALTER TABLE "days" ADD COLUMN "work_focus_habit_id" uuid;--> statement-breakpoint
ALTER TABLE "day_items" ADD COLUMN "alternates_chosen" boolean;--> statement-breakpoint
ALTER TABLE "day_items" ADD COLUMN "alternates_id" uuid;--> statement-breakpoint
ALTER TABLE "day_items" ADD COLUMN "gap_before_min" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "day_items" ADD COLUMN "pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "day_items" ADD COLUMN "day_block_id" uuid;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN "kind" "shift_kind" DEFAULT 'shift' NOT NULL;--> statement-breakpoint
ALTER TABLE "shifts" ADD COLUMN "shortened_item_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_prefs" ADD COLUMN "block_kind" "block_kind";--> statement-breakpoint
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_blocks" ADD CONSTRAINT "day_blocks_day_id_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_blocks" ADD CONSTRAINT "day_blocks_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_blocks" ADD CONSTRAINT "day_blocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_day_id_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fixtures_user_id_archived_at_idx" ON "fixtures" USING btree ("user_id","archived_at");--> statement-breakpoint
CREATE INDEX "fixtures_user_id_idx" ON "fixtures" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "fixtures_habit_id_idx" ON "fixtures" USING btree ("habit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "day_blocks_day_id_kind_sort_order_idx" ON "day_blocks" USING btree ("day_id","kind","sort_order");--> statement-breakpoint
CREATE INDEX "day_blocks_day_id_sort_order_idx" ON "day_blocks" USING btree ("day_id","sort_order");--> statement-breakpoint
CREATE INDEX "day_blocks_template_id_idx" ON "day_blocks" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "day_blocks_user_id_idx" ON "day_blocks" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "journal_entries_day_id_idx" ON "journal_entries" USING btree ("day_id");--> statement-breakpoint
CREATE INDEX "journal_entries_user_id_created_at_idx" ON "journal_entries" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "journal_entries_user_id_idx" ON "journal_entries" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_work_focus_habit_id_habits_id_fk" FOREIGN KEY ("work_focus_habit_id") REFERENCES "public"."habits"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_items" ADD CONSTRAINT "day_items_day_block_id_day_blocks_id_fk" FOREIGN KEY ("day_block_id") REFERENCES "public"."day_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "days_user_id_confirmed_at_idx" ON "days" USING btree ("user_id","confirmed_at");--> statement-breakpoint
CREATE INDEX "days_work_focus_habit_id_idx" ON "days" USING btree ("work_focus_habit_id");--> statement-breakpoint
CREATE INDEX "day_items_day_block_id_sort_order_idx" ON "day_items" USING btree ("day_block_id","sort_order");--> statement-breakpoint
CREATE INDEX "day_items_alternates_id_idx" ON "day_items" USING btree ("alternates_id");--> statement-breakpoint
ALTER TABLE "notification_prefs" ADD CONSTRAINT "notification_prefs_user_id_kind_block_kind_key" UNIQUE NULLS NOT DISTINCT("user_id","kind","block_kind");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_orient_passage_check" CHECK ("users"."orient_passage" IS NULL OR length("users"."orient_passage") <= 2000);--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_intention_check" CHECK ("days"."intention" IS NULL OR length("days"."intention") <= 140);--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_morning_gratitude_check" CHECK ("days"."morning_gratitude" IS NULL OR length("days"."morning_gratitude") <= 280);--> statement-breakpoint
ALTER TABLE "day_items" ADD CONSTRAINT "day_items_gap_before_min_check" CHECK ("day_items"."gap_before_min" BETWEEN 0 AND 240);--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_delta_min_check" CHECK ("shifts"."delta_min" BETWEEN 0 AND 600);--> statement-breakpoint
CREATE POLICY "fixtures_select" ON "fixtures" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("fixtures"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "fixtures_insert" ON "fixtures" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("fixtures"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "fixtures_update" ON "fixtures" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("fixtures"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("fixtures"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "fixtures_delete" ON "fixtures" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("fixtures"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "day_blocks_select" ON "day_blocks" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("day_blocks"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "day_blocks_insert" ON "day_blocks" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("day_blocks"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "day_blocks_update" ON "day_blocks" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("day_blocks"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("day_blocks"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "day_blocks_delete" ON "day_blocks" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("day_blocks"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "journal_entries_select" ON "journal_entries" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("journal_entries"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "journal_entries_insert" ON "journal_entries" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("journal_entries"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "journal_entries_update" ON "journal_entries" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("journal_entries"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("journal_entries"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "journal_entries_delete" ON "journal_entries" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("journal_entries"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
-- Amendment: the immutability trigger on day_blocks (TD-5). The function is
-- the one 01_init_functions.sql declares; re-declared identically here so the
-- trigger can be created on a database that has not run the setup yet.
CREATE OR REPLACE FUNCTION public.day_items_original_start_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $immutable$
BEGIN
  IF old.original_scheduled_start IS NOT NULL
     AND new.original_scheduled_start IS DISTINCT FROM old.original_scheduled_start THEN
    RAISE EXCEPTION 'original_scheduled_start is immutable';
  END IF;
  RETURN new;
END;
$immutable$;--> statement-breakpoint
DROP TRIGGER IF EXISTS day_blocks_original_start_immutable ON public.day_blocks;--> statement-breakpoint
CREATE TRIGGER day_blocks_original_start_immutable
  BEFORE UPDATE ON public.day_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.day_items_original_start_immutable();
