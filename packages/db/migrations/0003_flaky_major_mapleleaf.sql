CREATE TABLE "notification_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"kind" "notification_kind" NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"sent_at" timestamp with time zone,
	"snoozed" boolean DEFAULT false NOT NULL,
	"skipped" boolean DEFAULT false NOT NULL,
	"target_id" uuid,
	"target_key" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "notification_deliveries_key" UNIQUE NULLS NOT DISTINCT("user_id","kind","target_id","target_key","scheduled_for")
);
--> statement-breakpoint
ALTER TABLE "notification_deliveries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_deliveries_user_id_scheduled_for_idx" ON "notification_deliveries" USING btree ("user_id","scheduled_for");--> statement-breakpoint
CREATE POLICY "notification_deliveries_select" ON "notification_deliveries" AS PERMISSIVE FOR SELECT TO "authenticated" USING (false);--> statement-breakpoint
CREATE POLICY "notification_deliveries_insert" ON "notification_deliveries" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (false);--> statement-breakpoint
CREATE POLICY "notification_deliveries_update" ON "notification_deliveries" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (false);--> statement-breakpoint
CREATE POLICY "notification_deliveries_delete" ON "notification_deliveries" AS PERMISSIVE FOR DELETE TO "authenticated" USING (false);