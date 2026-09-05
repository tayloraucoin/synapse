-- HAND-EDITED after `drizzle-kit generate` — re-apply after any regeneration.
--
-- `drizzle-kit generate` ignores `schemaFilter` and emits a bare
-- `CREATE SCHEMA "auth"` plus a stub `auth.users`, because our schema
-- references them. On a Supabase project both already exist and Supabase Auth
-- owns them, so the raw statements would abort the migration. Guarding them
-- makes this block a no-op on Supabase and a working stub on a vanilla local
-- Postgres. See SETUP.md §1.
DO $auth_stub$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'auth'
      AND table_name = 'users'
  ) THEN
    CREATE SCHEMA IF NOT EXISTS "auth";
    CREATE TABLE "auth"."users" (
      id uuid PRIMARY KEY NOT NULL,
      email text
    );
  END IF;
END
$auth_stub$;
--> statement-breakpoint
CREATE TYPE "public"."theme_preference" AS ENUM('system', 'light', 'dark');--> statement-breakpoint
CREATE TYPE "public"."device_platform" AS ENUM('ios', 'android', 'web');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"day_close_time" time DEFAULT '03:00' NOT NULL,
	"deleted_at" timestamp with time zone,
	"display_name" text,
	"email" text,
	"first_run_step" smallint,
	"first_run_completed_at" timestamp with time zone,
	"review_reminder_time" time DEFAULT '21:00' NOT NULL,
	"theme" "theme_preference" DEFAULT 'system' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"wake_anchor_habit_id" uuid
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "web_push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"auth" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"platform" "device_platform" NOT NULL,
	"revoked_at" timestamp with time zone,
	"user_agent" text,
	"user_id" uuid
);
--> statement-breakpoint
ALTER TABLE "web_push_subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_push_subscriptions" ADD CONSTRAINT "web_push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "web_push_subscriptions_endpoint_idx" ON "web_push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "web_push_subscriptions_user_id_idx" ON "web_push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "users_select" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("users"."id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "users_update" ON "users" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("users"."id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("users"."id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "users_insert" ON "users" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (false);--> statement-breakpoint
CREATE POLICY "users_delete" ON "users" AS PERMISSIVE FOR DELETE TO "authenticated" USING (false);--> statement-breakpoint
CREATE POLICY "web_push_subscriptions_select" ON "web_push_subscriptions" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("web_push_subscriptions"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "web_push_subscriptions_insert" ON "web_push_subscriptions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("web_push_subscriptions"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "web_push_subscriptions_update" ON "web_push_subscriptions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("web_push_subscriptions"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("web_push_subscriptions"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "web_push_subscriptions_delete" ON "web_push_subscriptions" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("web_push_subscriptions"."user_id" = current_setting('app.user_id', true)::uuid);