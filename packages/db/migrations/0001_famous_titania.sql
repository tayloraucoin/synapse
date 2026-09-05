CREATE TYPE "public"."category_color_key" AS ENUM('leaf', 'sky', 'clay', 'rose', 'amber', 'slate', 'plum', 'moss');--> statement-breakpoint
CREATE TYPE "public"."item_type" AS ENUM('habit', 'task_appointment', 'deep_work');--> statement-breakpoint
CREATE TYPE "public"."miss_tier" AS ENUM('circumstance', 'scoping', 'chose_not_to');--> statement-breakpoint
CREATE TYPE "public"."scheduling" AS ENUM('hard', 'soft');--> statement-breakpoint
CREATE TYPE "public"."time_mode" AS ENUM('fixed_time', 'window', 'unscheduled');--> statement-breakpoint
CREATE TYPE "public"."day_close_reason" AS ENUM('manual', 'auto');--> statement-breakpoint
CREATE TYPE "public"."woke_at_source" AS ENUM('anchor', 'manual');--> statement-breakpoint
CREATE TYPE "public"."assignment_state" AS ENUM('assigned', 'not_assigned', 'cut_by_shift');--> statement-breakpoint
CREATE TYPE "public"."completion_state" AS ENUM('upcoming', 'active', 'done', 'missed', 'carried', 'pending_review');--> statement-breakpoint
CREATE TYPE "public"."item_origin" AS ENUM('template', 'one_off', 'carried', 'calendar_import');--> statement-breakpoint
CREATE TYPE "public"."timer_session_source" AS ENUM('timer', 'manual');--> statement-breakpoint
CREATE TYPE "public"."miss_resolved_by" AS ENUM('day_review', 'shift');--> statement-breakpoint
CREATE TYPE "public"."notification_kind" AS ENUM('item_start', 'window_open', 'window_closing', 'review_reminder', 'pending_review', 'week_build', 'week_ready', 'timer_running', 'calendar_item');--> statement-breakpoint
CREATE TYPE "public"."export_status" AS ENUM('preparing', 'ready', 'expired', 'failed');--> statement-breakpoint
CREATE TABLE "user_avatars" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"byte_size" integer NOT NULL,
	"content_type" text NOT NULL,
	"storage_path" text NOT NULL,
	"user_id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_avatars" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"color_key" "category_color_key" NOT NULL,
	"name" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	"default_notes_preflight" text,
	"duration_max_min" smallint,
	"duration_min_min" smallint,
	"icon" jsonb DEFAULT '{"kind":"curated","value":"dot","colorKey":null}'::jsonb NOT NULL,
	"life_priority" smallint NOT NULL,
	"quantity_unit" text,
	"reflection_axes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"title" text NOT NULL,
	"type" "item_type" NOT NULL,
	"category_id" uuid,
	"user_id" uuid NOT NULL,
	CONSTRAINT "habits_life_priority_check" CHECK ("habits"."life_priority" BETWEEN 1 AND 7),
	CONSTRAINT "habits_duration_min_min_check" CHECK ("habits"."duration_min_min" IS NULL OR "habits"."duration_min_min" BETWEEN 1 AND 480),
	CONSTRAINT "habits_duration_max_min_check" CHECK ("habits"."duration_max_min" IS NULL OR "habits"."duration_max_min" BETWEEN 1 AND 480),
	CONSTRAINT "habits_duration_range_check" CHECK ("habits"."duration_min_min" IS NULL OR "habits"."duration_max_min" IS NULL OR "habits"."duration_min_min" <= "habits"."duration_max_min")
);
--> statement-breakpoint
ALTER TABLE "habits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	"built_in" boolean DEFAULT false NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" smallint NOT NULL,
	"structural" boolean DEFAULT false NOT NULL,
	"tier" "miss_tier" NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reasons" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"anchor_time" time DEFAULT '07:00' NOT NULL,
	"archived_at" timestamp with time zone,
	"name" text NOT NULL,
	"typical_days" smallint[],
	"weekly_target" smallint,
	"user_id" uuid NOT NULL,
	CONSTRAINT "templates_weekly_target_check" CHECK ("templates"."weekly_target" IS NULL OR "templates"."weekly_target" BETWEEN 1 AND 7),
	CONSTRAINT "templates_typical_days_check" CHECK ("templates"."typical_days" IS NULL OR ("templates"."typical_days" <@ ARRAY[0,1,2,3,4,5,6]::smallint[]))
);
--> statement-breakpoint
ALTER TABLE "templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "template_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"duration_min" smallint NOT NULL,
	"multitask_group" text,
	"offset_end_min" integer,
	"offset_start_min" integer,
	"priority_override" smallint,
	"scheduling" "scheduling" NOT NULL,
	"sort_order" smallint NOT NULL,
	"time_mode" time_mode NOT NULL,
	"habit_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "template_slots_duration_min_check" CHECK ("template_slots"."duration_min" BETWEEN 1 AND 480),
	CONSTRAINT "template_slots_offset_start_min_check" CHECK ("template_slots"."offset_start_min" IS NULL OR "template_slots"."offset_start_min" >= -120),
	CONSTRAINT "template_slots_priority_override_check" CHECK ("template_slots"."priority_override" IS NULL OR "template_slots"."priority_override" BETWEEN 1 AND 7)
);
--> statement-breakpoint
ALTER TABLE "template_slots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"anchor_time" time NOT NULL,
	"capacity_min" smallint,
	"close_reason" "day_close_reason",
	"closed_at" timestamp with time zone,
	"date" date NOT NULL,
	"day_close_time" time NOT NULL,
	"review_edited_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"timezone" text NOT NULL,
	"woke_at" timestamp with time zone,
	"woke_at_source" "woke_at_source",
	"template_id" uuid,
	"user_id" uuid NOT NULL,
	CONSTRAINT "days_capacity_min_check" CHECK ("days"."capacity_min" IS NULL OR "days"."capacity_min" BETWEEN 5 AND 1440)
);
--> statement-breakpoint
ALTER TABLE "days" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "day_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assignment_state" "assignment_state" DEFAULT 'assigned' NOT NULL,
	"calendar_event_id" text,
	"completion_state" "completion_state" DEFAULT 'upcoming' NOT NULL,
	"deferred_at" timestamp with time zone,
	"done_at" timestamp with time zone,
	"duration_min" smallint,
	"icon" jsonb NOT NULL,
	"multitask_id" uuid,
	"notes_preflight" text,
	"notes_reflection" text,
	"origin" "item_origin" NOT NULL,
	"original_scheduled_start" timestamp with time zone,
	"priority" smallint NOT NULL,
	"quantity_unit" text,
	"quantity_value" numeric(10, 2),
	"reflection_axes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reflection_ratings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"scheduled_end" timestamp with time zone,
	"scheduled_start" timestamp with time zone,
	"scheduling" "scheduling" NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"time_mode" time_mode NOT NULL,
	"title" text NOT NULL,
	"type" "item_type" NOT NULL,
	"carried_from_item_id" uuid,
	"day_id" uuid NOT NULL,
	"habit_id" uuid,
	"template_slot_id" uuid,
	"user_id" uuid NOT NULL,
	CONSTRAINT "day_items_priority_check" CHECK ("day_items"."priority" BETWEEN 1 AND 7),
	CONSTRAINT "day_items_duration_min_check" CHECK ("day_items"."duration_min" IS NULL OR "day_items"."duration_min" BETWEEN 1 AND 480)
);
--> statement-breakpoint
ALTER TABLE "day_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "timer_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"source" timer_session_source NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"day_item_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "timer_sessions_ended_at_check" CHECK ("timer_sessions"."ended_at" IS NULL OR "timer_sessions"."ended_at" > "timer_sessions"."started_at")
);
--> statement-breakpoint
ALTER TABLE "timer_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"delta_min" smallint NOT NULL,
	"reason_key" text,
	"reason_text" text,
	"tier" "miss_tier" NOT NULL,
	"day_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "shifts_delta_min_check" CHECK ("shifts"."delta_min" BETWEEN 5 AND 600)
);
--> statement-breakpoint
ALTER TABLE "shifts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "misses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"note" text,
	"reason_key" text,
	"reason_text" text,
	"resolved_by" "miss_resolved_by" NOT NULL,
	"tier" "miss_tier" NOT NULL,
	"day_item_id" uuid NOT NULL,
	"shift_id" uuid,
	"traded_up_item_id" uuid,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "misses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notification_prefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"enabled" boolean NOT NULL,
	"kind" "notification_kind" NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_prefs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "data_exports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"byte_size" integer,
	"error" text,
	"expires_at" timestamp with time zone,
	"status" "export_status" DEFAULT 'preparing' NOT NULL,
	"storage_path" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "data_exports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "feedback_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"app_version" text,
	"message" text NOT NULL,
	"screen_path" text,
	"user_id" uuid
);
--> statement-breakpoint
ALTER TABLE "feedback_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pending_day_close_time" time;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pending_day_close_time_from" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pending_timezone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pending_timezone_from" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reminder_prompt_answered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "usual_wake_time" time DEFAULT '07:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "week_build_reminder_time" time DEFAULT '18:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "week_build_reminder_weekday" smallint DEFAULT 6 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_avatars" ADD CONSTRAINT "user_avatars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reasons" ADD CONSTRAINT "reasons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_slots" ADD CONSTRAINT "template_slots_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_slots" ADD CONSTRAINT "template_slots_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_slots" ADD CONSTRAINT "template_slots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "days" ADD CONSTRAINT "days_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_items" ADD CONSTRAINT "day_items_carried_from_item_id_day_items_id_fk" FOREIGN KEY ("carried_from_item_id") REFERENCES "public"."day_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_items" ADD CONSTRAINT "day_items_day_id_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_items" ADD CONSTRAINT "day_items_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_items" ADD CONSTRAINT "day_items_template_slot_id_template_slots_id_fk" FOREIGN KEY ("template_slot_id") REFERENCES "public"."template_slots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_items" ADD CONSTRAINT "day_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_sessions" ADD CONSTRAINT "timer_sessions_day_item_id_day_items_id_fk" FOREIGN KEY ("day_item_id") REFERENCES "public"."day_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_sessions" ADD CONSTRAINT "timer_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_day_id_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "misses" ADD CONSTRAINT "misses_day_item_id_day_items_id_fk" FOREIGN KEY ("day_item_id") REFERENCES "public"."day_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "misses" ADD CONSTRAINT "misses_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "misses" ADD CONSTRAINT "misses_traded_up_item_id_day_items_id_fk" FOREIGN KEY ("traded_up_item_id") REFERENCES "public"."day_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "misses" ADD CONSTRAINT "misses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_prefs" ADD CONSTRAINT "notification_prefs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_exports" ADD CONSTRAINT "data_exports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_messages" ADD CONSTRAINT "feedback_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_user_id_name_idx" ON "categories" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "categories_user_id_idx" ON "categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "habits_user_id_archived_at_idx" ON "habits" USING btree ("user_id","archived_at");--> statement-breakpoint
CREATE INDEX "habits_category_id_idx" ON "habits" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "habits_user_id_idx" ON "habits" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reasons_user_id_key_idx" ON "reasons" USING btree ("user_id","key");--> statement-breakpoint
CREATE INDEX "reasons_user_id_archived_at_idx" ON "reasons" USING btree ("user_id","archived_at");--> statement-breakpoint
CREATE INDEX "reasons_user_id_idx" ON "reasons" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "templates_user_id_archived_at_idx" ON "templates" USING btree ("user_id","archived_at");--> statement-breakpoint
CREATE INDEX "templates_user_id_idx" ON "templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "template_slots_template_id_sort_order_idx" ON "template_slots" USING btree ("template_id","sort_order");--> statement-breakpoint
CREATE INDEX "template_slots_habit_id_idx" ON "template_slots" USING btree ("habit_id");--> statement-breakpoint
CREATE INDEX "template_slots_user_id_idx" ON "template_slots" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "days_user_id_date_idx" ON "days" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "days_user_id_closed_at_idx" ON "days" USING btree ("user_id","closed_at");--> statement-breakpoint
CREATE INDEX "days_template_id_idx" ON "days" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "days_user_id_idx" ON "days" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "day_items_day_id_scheduled_start_idx" ON "day_items" USING btree ("day_id","scheduled_start");--> statement-breakpoint
CREATE INDEX "day_items_user_id_completion_state_idx" ON "day_items" USING btree ("user_id","completion_state");--> statement-breakpoint
CREATE INDEX "day_items_habit_id_idx" ON "day_items" USING btree ("habit_id");--> statement-breakpoint
CREATE INDEX "day_items_template_slot_id_idx" ON "day_items" USING btree ("template_slot_id");--> statement-breakpoint
CREATE INDEX "day_items_user_id_idx" ON "day_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "timer_sessions_day_item_id_started_at_idx" ON "timer_sessions" USING btree ("day_item_id","started_at");--> statement-breakpoint
CREATE INDEX "timer_sessions_user_id_idx" ON "timer_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "shifts_day_id_at_idx" ON "shifts" USING btree ("day_id","at");--> statement-breakpoint
CREATE INDEX "shifts_user_id_idx" ON "shifts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "misses_day_item_id_idx" ON "misses" USING btree ("day_item_id");--> statement-breakpoint
CREATE INDEX "misses_shift_id_idx" ON "misses" USING btree ("shift_id");--> statement-breakpoint
CREATE INDEX "misses_traded_up_item_id_idx" ON "misses" USING btree ("traded_up_item_id");--> statement-breakpoint
CREATE INDEX "misses_user_id_idx" ON "misses" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_prefs_user_id_kind_idx" ON "notification_prefs" USING btree ("user_id","kind");--> statement-breakpoint
CREATE INDEX "notification_prefs_user_id_idx" ON "notification_prefs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "data_exports_user_id_created_at_idx" ON "data_exports" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "data_exports_user_id_idx" ON "data_exports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feedback_messages_user_id_idx" ON "feedback_messages" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_wake_anchor_habit_id_habits_id_fk" FOREIGN KEY ("wake_anchor_habit_id") REFERENCES "public"."habits"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_wake_anchor_habit_id_idx" ON "users" USING btree ("wake_anchor_habit_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_week_build_reminder_weekday_check" CHECK ("users"."week_build_reminder_weekday" BETWEEN 0 AND 6);--> statement-breakpoint
CREATE POLICY "user_avatars_select" ON "user_avatars" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("user_avatars"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "user_avatars_insert" ON "user_avatars" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("user_avatars"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "user_avatars_update" ON "user_avatars" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("user_avatars"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("user_avatars"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "user_avatars_delete" ON "user_avatars" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("user_avatars"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "categories_select" ON "categories" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("categories"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "categories_insert" ON "categories" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("categories"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "categories_update" ON "categories" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("categories"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("categories"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "categories_delete" ON "categories" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("categories"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "habits_select" ON "habits" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("habits"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "habits_insert" ON "habits" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("habits"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "habits_update" ON "habits" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("habits"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("habits"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "habits_delete" ON "habits" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("habits"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "reasons_select" ON "reasons" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("reasons"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "reasons_insert" ON "reasons" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("reasons"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "reasons_update" ON "reasons" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("reasons"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("reasons"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "reasons_delete" ON "reasons" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("reasons"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "templates_select" ON "templates" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("templates"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "templates_insert" ON "templates" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("templates"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "templates_update" ON "templates" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("templates"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("templates"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "templates_delete" ON "templates" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("templates"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "template_slots_select" ON "template_slots" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("template_slots"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "template_slots_insert" ON "template_slots" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("template_slots"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "template_slots_update" ON "template_slots" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("template_slots"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("template_slots"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "template_slots_delete" ON "template_slots" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("template_slots"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "days_select" ON "days" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("days"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "days_insert" ON "days" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("days"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "days_update" ON "days" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("days"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("days"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "days_delete" ON "days" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("days"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "day_items_select" ON "day_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("day_items"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "day_items_insert" ON "day_items" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("day_items"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "day_items_update" ON "day_items" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("day_items"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("day_items"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "day_items_delete" ON "day_items" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("day_items"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "timer_sessions_select" ON "timer_sessions" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("timer_sessions"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "timer_sessions_insert" ON "timer_sessions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("timer_sessions"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "timer_sessions_update" ON "timer_sessions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("timer_sessions"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("timer_sessions"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "timer_sessions_delete" ON "timer_sessions" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("timer_sessions"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "shifts_select" ON "shifts" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("shifts"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "shifts_insert" ON "shifts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("shifts"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "shifts_update" ON "shifts" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("shifts"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("shifts"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "shifts_delete" ON "shifts" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("shifts"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "misses_select" ON "misses" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("misses"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "misses_insert" ON "misses" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("misses"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "misses_update" ON "misses" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("misses"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("misses"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "misses_delete" ON "misses" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("misses"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "notification_prefs_select" ON "notification_prefs" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("notification_prefs"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "notification_prefs_insert" ON "notification_prefs" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("notification_prefs"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "notification_prefs_update" ON "notification_prefs" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("notification_prefs"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("notification_prefs"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "notification_prefs_delete" ON "notification_prefs" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("notification_prefs"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "data_exports_select" ON "data_exports" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("data_exports"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "data_exports_insert" ON "data_exports" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("data_exports"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "data_exports_update" ON "data_exports" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("data_exports"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("data_exports"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "data_exports_delete" ON "data_exports" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("data_exports"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "feedback_messages_insert" ON "feedback_messages" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("feedback_messages"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "feedback_messages_select" ON "feedback_messages" AS PERMISSIVE FOR SELECT TO "authenticated" USING (false);--> statement-breakpoint
CREATE POLICY "feedback_messages_update" ON "feedback_messages" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (false);--> statement-breakpoint
CREATE POLICY "feedback_messages_delete" ON "feedback_messages" AS PERMISSIVE FOR DELETE TO "authenticated" USING (false);