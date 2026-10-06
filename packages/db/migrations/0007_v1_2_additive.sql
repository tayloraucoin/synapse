-- HAND-AMENDED after `drizzle-kit generate` — RUN-2, UX v1.2 §11.1–§11.6
-- (TD-10, TD-11, TD-12, TD-13, TD-14, TD-15, TD-19). The generated statements
-- are unchanged; two blocks are appended at the end:
--
--   1. The `orient_passage` backfill: one `passages` row per non-blank
--      `users.orient_passage`, at `sort_order 0`. The source column is left as
--      it is — `0008` drops it, never the migration that adds its replacement.
--      A plain textarea's text is its own Markdown.
--
--   2. The `passages` storage bucket and its restrictive object policies —
--      the icons' limits and grammar (`passages/{user_id}/{file}`), so the
--      three image buckets cannot drift. Skipped on vanilla Postgres exactly
--      as `03_storage_buckets.sql` does; that setup file carries the same
--      bucket, so a fresh database and a migrated one agree.
--
-- ADDITIVE ONLY. Five new enums, two `ADD VALUE`s (`item_origin.travel`,
-- `notification_kind.journal_reminder`), three new tables (`passages` and
-- `day_plans` owner-private; `quotes` a catalogue — select for authenticated,
-- writes denied: it changes by migration, or through RUN-14's service-role
-- surface if D3 is ratified), and columns on `users`, `habits`, `fixtures`,
-- `templates`, `days`, `day_items`. Nothing is dropped, renamed, or retyped.
-- The three v1.1 columns v1.2 stops writing (`earliest_wake_time`,
-- `orient_passage`, `orient_show_last_night`) are `0008`'s.
--
-- Applied by Taylor, after `0004`–`0006`, never by an agent on a hosted tier.
CREATE TYPE "public"."fixture_kind" AS ENUM('meeting', 'appointment', 'class', 'event', 'social', 'chore', 'other');--> statement-breakpoint
CREATE TYPE "public"."workout_location" AS ENUM('home', 'gym', 'outside');--> statement-breakpoint
CREATE TYPE "public"."morning_mode" AS ENUM('set_from_plan', 'build_each_morning');--> statement-breakpoint
CREATE TYPE "public"."day_plan_state" AS ENUM('draft', 'complete');--> statement-breakpoint
CREATE TYPE "public"."work_day_kind" AS ENUM('remote', 'coworking', 'office', 'other');--> statement-breakpoint
ALTER TYPE "public"."item_origin" ADD VALUE 'travel';--> statement-breakpoint
ALTER TYPE "public"."notification_kind" ADD VALUE 'journal_reminder';--> statement-breakpoint
CREATE TABLE "passages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	"body_md" text NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"title" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "passages_body_md_check" CHECK (length("passages"."body_md") BETWEEN 1 AND 8000),
	CONSTRAINT "passages_title_check" CHECK ("passages"."title" IS NULL OR length("passages"."title") <= 80),
	CONSTRAINT "passages_images_check" CHECK (jsonb_typeof("passages"."images") = 'array' AND jsonb_array_length("passages"."images") <= 4),
	CONSTRAINT "passages_tags_check" CHECK (cardinality("passages"."tags") <= 10)
);
--> statement-breakpoint
ALTER TABLE "passages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "day_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"breaks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"devices_off_time" time,
	"excluded_fixture_ids" uuid[] DEFAULT '{}' NOT NULL,
	"icon" jsonb,
	"lights_out_time" time,
	"name" text NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"state" "day_plan_state" DEFAULT 'draft' NOT NULL,
	"training" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"wake_time" time,
	"weekdays" smallint[] DEFAULT '{}' NOT NULL,
	"work_end_time" time,
	"work_start_time" time,
	"morning_template_id" uuid,
	"prep_template_id" uuid,
	"user_id" uuid NOT NULL,
	"wind_down_template_id" uuid,
	"work_template_id" uuid,
	CONSTRAINT "day_plans_name_check" CHECK (length("day_plans"."name") BETWEEN 1 AND 40),
	CONSTRAINT "day_plans_weekdays_check" CHECK ("day_plans"."weekdays" <@ ARRAY[0,1,2,3,4,5,6]::smallint[])
);
--> statement-breakpoint
ALTER TABLE "day_plans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attribution" text NOT NULL,
	"published_at" timestamp with time zone,
	"source" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"text" text NOT NULL,
	CONSTRAINT "quotes_text_check" CHECK (length("quotes"."text") BETWEEN 1 AND 400),
	CONSTRAINT "quotes_attribution_check" CHECK (length("quotes"."attribution") BETWEEN 1 AND 120),
	CONSTRAINT "quotes_source_check" CHECK ("quotes"."source" IS NULL OR length("quotes"."source") <= 200)
);
--> statement-breakpoint
ALTER TABLE "quotes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "journal_reminder_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "journal_reminder_time" time;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "morning_mode" "morning_mode" DEFAULT 'set_from_plan' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "orient_ask_intention" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "orient_ask_visualisation" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "quotes_opt_in" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "location" "workout_location";--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "plan_travel" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "travel_back_min" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "travel_there_min" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "versions" jsonb;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "workout_type" text;--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "icon" jsonb DEFAULT '{"kind":"emoji","value":"📍"}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "fixtures" ADD COLUMN "kind" "fixture_kind" DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "anchor_direction" "anchor_direction";--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "icon" jsonb;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "location_kind" "work_day_kind";--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "work_end_time" time;--> statement-breakpoint
ALTER TABLE "days" ADD COLUMN "visualisation" text;--> statement-breakpoint
ALTER TABLE "days" ADD COLUMN "work_template_id" uuid;--> statement-breakpoint
ALTER TABLE "day_items" ADD COLUMN "version_key" text;--> statement-breakpoint
ALTER TABLE "day_items" ADD COLUMN "parent_item_id" uuid;--> statement-breakpoint
ALTER TABLE "passages" ADD CONSTRAINT "passages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_plans" ADD CONSTRAINT "day_plans_morning_template_id_templates_id_fk" FOREIGN KEY ("morning_template_id") REFERENCES "public"."templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_plans" ADD CONSTRAINT "day_plans_prep_template_id_templates_id_fk" FOREIGN KEY ("prep_template_id") REFERENCES "public"."templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_plans" ADD CONSTRAINT "day_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_plans" ADD CONSTRAINT "day_plans_wind_down_template_id_templates_id_fk" FOREIGN KEY ("wind_down_template_id") REFERENCES "public"."templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_plans" ADD CONSTRAINT "day_plans_work_template_id_templates_id_fk" FOREIGN KEY ("work_template_id") REFERENCES "public"."templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "passages_user_id_sort_order_idx" ON "passages" USING btree ("user_id","sort_order");--> statement-breakpoint
CREATE INDEX "passages_user_id_archived_at_idx" ON "passages" USING btree ("user_id","archived_at");--> statement-breakpoint
CREATE INDEX "passages_user_id_idx" ON "passages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "day_plans_user_id_sort_order_idx" ON "day_plans" USING btree ("user_id","sort_order");--> statement-breakpoint
CREATE INDEX "day_plans_user_id_idx" ON "day_plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "day_plans_prep_template_id_idx" ON "day_plans" USING btree ("prep_template_id");--> statement-breakpoint
CREATE INDEX "day_plans_morning_template_id_idx" ON "day_plans" USING btree ("morning_template_id");--> statement-breakpoint
CREATE INDEX "day_plans_wind_down_template_id_idx" ON "day_plans" USING btree ("wind_down_template_id");--> statement-breakpoint
CREATE INDEX "day_plans_work_template_id_idx" ON "day_plans" USING btree ("work_template_id");--> statement-breakpoint
CREATE INDEX "quotes_published_at_idx" ON "quotes" USING btree ("published_at");--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_work_template_id_templates_id_fk" FOREIGN KEY ("work_template_id") REFERENCES "public"."templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_items" ADD CONSTRAINT "day_items_parent_item_id_day_items_id_fk" FOREIGN KEY ("parent_item_id") REFERENCES "public"."day_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "days_work_template_id_idx" ON "days" USING btree ("work_template_id");--> statement-breakpoint
CREATE INDEX "day_items_parent_item_id_idx" ON "day_items" USING btree ("parent_item_id");--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_travel_check" CHECK ("habits"."travel_there_min" BETWEEN 0 AND 180 AND "habits"."travel_back_min" BETWEEN 0 AND 180);--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_workout_type_check" CHECK ("habits"."workout_type" IS NULL OR length("habits"."workout_type") BETWEEN 1 AND 32);--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_visualisation_check" CHECK ("days"."visualisation" IS NULL OR length("days"."visualisation") <= 280);--> statement-breakpoint
CREATE POLICY "passages_select" ON "passages" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("passages"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "passages_insert" ON "passages" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("passages"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "passages_update" ON "passages" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("passages"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("passages"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "passages_delete" ON "passages" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("passages"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "day_plans_select" ON "day_plans" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("day_plans"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "day_plans_insert" ON "day_plans" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("day_plans"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "day_plans_update" ON "day_plans" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("day_plans"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("day_plans"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "day_plans_delete" ON "day_plans" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("day_plans"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "quotes_select" ON "quotes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "quotes_insert" ON "quotes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (false);--> statement-breakpoint
CREATE POLICY "quotes_update" ON "quotes" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (false);--> statement-breakpoint
CREATE POLICY "quotes_delete" ON "quotes" AS PERMISSIVE FOR DELETE TO "authenticated" USING (false);--> statement-breakpoint
-- ---------------------------------------------------------------------------
-- 1. Backfill: every non-blank `users.orient_passage` becomes one passage
--    (UX v1.2 §11.1, RUN-2). The column is left untouched for `0008`.
-- ---------------------------------------------------------------------------
INSERT INTO "passages" ("user_id", "body_md", "sort_order")
SELECT "id", "orient_passage", 0
FROM "users"
WHERE "orient_passage" IS NOT NULL AND btrim("orient_passage") <> '';--> statement-breakpoint
-- ---------------------------------------------------------------------------
-- 2. The `passages` storage bucket (UX v1.2 §3.12, TD-15) — the icons' limits
--    and grammar. Mirrors `supabase/setup/03_storage_buckets.sql`; skipped on
--    vanilla Postgres the same way.
-- ---------------------------------------------------------------------------
DO $passages_bucket$
BEGIN
  IF to_regclass('storage.buckets') IS NULL THEN
    RAISE NOTICE 'storage.buckets not found — skipping the passages bucket (vanilla Postgres; run db:setup on Supabase-hosted DBs)';
    RETURN;
  END IF;

  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'passages',
    'passages',
    false,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
  ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
END $passages_bucket$;--> statement-breakpoint
DO $passages_policies$
DECLARE
  operation text;
  policy_name text;
BEGIN
  IF to_regclass('storage.objects') IS NULL THEN
    RAISE NOTICE 'storage.objects not found — skipping the passages object policies (vanilla Postgres)';
    RETURN;
  END IF;

  -- Deny everything to `authenticated` on this bucket, RESTRICTIVE, exactly as
  -- the other three buckets (SET-3): both rails use the service role.
  FOREACH operation IN ARRAY ARRAY['select', 'insert', 'update', 'delete'] LOOP
    policy_name := format('storage_%s_%s_deny', 'passages', operation);

    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects;', policy_name);

    IF operation = 'insert' THEN
      EXECUTE format(
        'CREATE POLICY %I ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (bucket_id <> %L);',
        policy_name, 'passages'
      );
    ELSE
      EXECUTE format(
        'CREATE POLICY %I ON storage.objects AS RESTRICTIVE FOR %s TO authenticated USING (bucket_id <> %L);',
        policy_name, upper(operation), 'passages'
      );
    END IF;
  END LOOP;
END
$passages_policies$;
