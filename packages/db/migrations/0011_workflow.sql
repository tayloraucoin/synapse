CREATE TYPE "public"."workflow_column_role" AS ENUM('active', 'done');--> statement-breakpoint
CREATE TABLE "workflow_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	"last_opened_at" timestamp with time zone,
	"name" text NOT NULL,
	"sort_order" smallint NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflow_views" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workflow_columns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"role" "workflow_column_role",
	"sort_order" smallint NOT NULL,
	"user_id" uuid NOT NULL,
	"view_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflow_columns" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workflow_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	"collapsed" boolean DEFAULT false NOT NULL,
	"hue" "category_color_key" NOT NULL,
	"name" text NOT NULL,
	"sort_order" smallint NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflow_groups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workflow_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"firing_started_at" timestamp with time zone,
	"last_returned_at" timestamp with time zone,
	"note" text,
	"sort_order" smallint NOT NULL,
	"title" text NOT NULL,
	"column_id" uuid NOT NULL,
	"group_id" uuid,
	"user_id" uuid NOT NULL,
	"view_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflow_tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workflow_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	"columns" jsonb NOT NULL,
	"name" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflow_templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workflow_day_pins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"day_key" date NOT NULL,
	"group_ids" jsonb NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflow_day_pins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "workflow_views" ADD CONSTRAINT "workflow_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_columns" ADD CONSTRAINT "workflow_columns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_columns" ADD CONSTRAINT "workflow_columns_view_id_workflow_views_id_fk" FOREIGN KEY ("view_id") REFERENCES "public"."workflow_views"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_groups" ADD CONSTRAINT "workflow_groups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_column_id_workflow_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."workflow_columns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_group_id_workflow_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."workflow_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_view_id_workflow_views_id_fk" FOREIGN KEY ("view_id") REFERENCES "public"."workflow_views"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_day_pins" ADD CONSTRAINT "workflow_day_pins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workflow_views_user_id_sort_order_idx" ON "workflow_views" USING btree ("user_id","sort_order");--> statement-breakpoint
CREATE INDEX "workflow_views_user_id_idx" ON "workflow_views" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_columns_view_id_active_idx" ON "workflow_columns" USING btree ("view_id") WHERE "workflow_columns"."role" = 'active';--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_columns_view_id_done_idx" ON "workflow_columns" USING btree ("view_id") WHERE "workflow_columns"."role" = 'done';--> statement-breakpoint
CREATE INDEX "workflow_columns_view_id_sort_order_idx" ON "workflow_columns" USING btree ("view_id","sort_order");--> statement-breakpoint
CREATE INDEX "workflow_columns_user_id_idx" ON "workflow_columns" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workflow_groups_user_id_sort_order_idx" ON "workflow_groups" USING btree ("user_id","sort_order");--> statement-breakpoint
CREATE INDEX "workflow_groups_user_id_idx" ON "workflow_groups" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workflow_tasks_view_id_column_id_group_id_sort_order_idx" ON "workflow_tasks" USING btree ("view_id","column_id","group_id","sort_order");--> statement-breakpoint
CREATE INDEX "workflow_tasks_user_id_archived_at_idx" ON "workflow_tasks" USING btree ("user_id","archived_at");--> statement-breakpoint
CREATE INDEX "workflow_tasks_user_id_idx" ON "workflow_tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workflow_templates_user_id_idx" ON "workflow_templates" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_day_pins_user_id_day_key_idx" ON "workflow_day_pins" USING btree ("user_id","day_key");--> statement-breakpoint
CREATE INDEX "workflow_day_pins_user_id_idx" ON "workflow_day_pins" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "workflow_views_select" ON "workflow_views" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("workflow_views"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_views_insert" ON "workflow_views" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("workflow_views"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_views_update" ON "workflow_views" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("workflow_views"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("workflow_views"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_views_delete" ON "workflow_views" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("workflow_views"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_columns_select" ON "workflow_columns" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("workflow_columns"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_columns_insert" ON "workflow_columns" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("workflow_columns"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_columns_update" ON "workflow_columns" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("workflow_columns"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("workflow_columns"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_columns_delete" ON "workflow_columns" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("workflow_columns"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_groups_select" ON "workflow_groups" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("workflow_groups"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_groups_insert" ON "workflow_groups" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("workflow_groups"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_groups_update" ON "workflow_groups" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("workflow_groups"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("workflow_groups"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_groups_delete" ON "workflow_groups" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("workflow_groups"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_tasks_select" ON "workflow_tasks" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("workflow_tasks"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_tasks_insert" ON "workflow_tasks" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("workflow_tasks"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_tasks_update" ON "workflow_tasks" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("workflow_tasks"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("workflow_tasks"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_tasks_delete" ON "workflow_tasks" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("workflow_tasks"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_templates_select" ON "workflow_templates" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("workflow_templates"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_templates_insert" ON "workflow_templates" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("workflow_templates"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_templates_update" ON "workflow_templates" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("workflow_templates"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("workflow_templates"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_templates_delete" ON "workflow_templates" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("workflow_templates"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_day_pins_select" ON "workflow_day_pins" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("workflow_day_pins"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_day_pins_insert" ON "workflow_day_pins" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("workflow_day_pins"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_day_pins_update" ON "workflow_day_pins" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("workflow_day_pins"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("workflow_day_pins"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "workflow_day_pins_delete" ON "workflow_day_pins" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("workflow_day_pins"."user_id" = current_setting('app.user_id', true)::uuid);