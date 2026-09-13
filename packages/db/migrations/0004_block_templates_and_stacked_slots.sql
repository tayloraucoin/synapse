-- HAND-AMENDED after `drizzle-kit generate` — DYN-2, UX v1.1 §11.3–§11.5 (TD-1,
-- TD-3, TD-4, TD-9). Two amendments, both below the generated statements'
-- natural order:
--
--   1. `templates.kind` is added NULLABLE, backfilled to 'morning', then made
--      NOT NULL. The generator emits a one-step NOT NULL add, which fails on a
--      populated table. Every v1.0 template was a whole day anchored at wake;
--      as a morning block it lays out identically.
--   2. The BACKFILL: `template_slots.sort_order` becomes the stack order and
--      `gap_before_min` is derived from the deprecated offsets, once, here, as
--      SQL. Well-formed templates reproduce their offsets exactly under
--      `stackBlock`; malformed ones (two loose fixed slots overlapping, or a
--      before-wake slot) get gap 0 and a NOTICE for a human. Nothing is
--      dropped — `offset_start_min` / `offset_end_min` survive until 0006.
--
-- The four enum values for the day side (`orient`, `not_confirmed`, `fixture`,
-- the three notification kinds) land here rather than in 0005 because the
-- TypeScript schema already spelled them (DYN-1, logged in Epic 4's
-- DEVIATIONS). Additive; nothing writes them before their service ticket.
CREATE TYPE "public"."block_kind" AS ENUM('orient', 'morning', 'training', 'prep', 'work', 'break', 'activity', 'wind_down');--> statement-breakpoint
CREATE TYPE "public"."block_flow" AS ENUM('forward', 'backward');--> statement-breakpoint
CREATE TYPE "public"."block_structure" AS ENUM('stack', 'opener_pool_closer');--> statement-breakpoint
CREATE TYPE "public"."slot_role" AS ENUM('stack', 'opener', 'pool', 'closer');--> statement-breakpoint
ALTER TYPE "public"."item_type" ADD VALUE 'workout';--> statement-breakpoint
ALTER TYPE "public"."woke_at_source" ADD VALUE 'orient';--> statement-breakpoint
ALTER TYPE "public"."completion_state" ADD VALUE 'not_confirmed';--> statement-breakpoint
ALTER TYPE "public"."item_origin" ADD VALUE 'fixture';--> statement-breakpoint
ALTER TYPE "public"."notification_kind" ADD VALUE 'block_start';--> statement-breakpoint
ALTER TYPE "public"."notification_kind" ADD VALUE 'fixture_start';--> statement-breakpoint
ALTER TYPE "public"."notification_kind" ADD VALUE 'devices_off';--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "anchor_time" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "anchor_time" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "block_kind" "block_kind";--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "typical_days" smallint[];--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "weekly_target" smallint;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "flow" "block_flow" DEFAULT 'forward' NOT NULL;--> statement-breakpoint
-- Amendment 1: three steps, not one.
ALTER TABLE "templates" ADD COLUMN "kind" "block_kind";--> statement-breakpoint
UPDATE "templates" SET "kind" = 'morning' WHERE "kind" IS NULL;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "kind" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "structure" "block_structure" DEFAULT 'stack' NOT NULL;--> statement-breakpoint
ALTER TABLE "template_slots" ADD COLUMN "alternates_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "template_slots" ADD COLUMN "alternates_group" text;--> statement-breakpoint
ALTER TABLE "template_slots" ADD COLUMN "gap_before_min" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "template_slots" ADD COLUMN "pinned_at" time;--> statement-breakpoint
ALTER TABLE "template_slots" ADD COLUMN "role" "slot_role" DEFAULT 'stack' NOT NULL;--> statement-breakpoint
CREATE INDEX "habits_user_id_block_kind_idx" ON "habits" USING btree ("user_id","block_kind");--> statement-breakpoint
CREATE INDEX "templates_user_id_kind_idx" ON "templates" USING btree ("user_id","kind");--> statement-breakpoint
CREATE UNIQUE INDEX "template_slots_alternates_default_idx" ON "template_slots" USING btree ("template_id","alternates_group") WHERE "template_slots"."alternates_default" AND "template_slots"."alternates_group" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_weekly_target_check" CHECK ("habits"."weekly_target" IS NULL OR "habits"."weekly_target" BETWEEN 1 AND 7);--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_typical_days_check" CHECK ("habits"."typical_days" IS NULL OR ("habits"."typical_days" <@ ARRAY[0,1,2,3,4,5,6]::smallint[]));--> statement-breakpoint
ALTER TABLE "template_slots" ADD CONSTRAINT "template_slots_gap_before_min_check" CHECK ("template_slots"."gap_before_min" BETWEEN 0 AND 240);--> statement-breakpoint
ALTER TABLE "template_slots" ADD CONSTRAINT "template_slots_pinned_gap_check" CHECK ("template_slots"."pinned_at" IS NULL OR "template_slots"."gap_before_min" = 0);--> statement-breakpoint
-- Amendment 2: the backfill. Offsets → stack order and gaps (UX v1.1 §11.5).
--
-- A POSITION is a set of slots sharing an offset (a multitask bracket, or one
-- slot). The end of a position is its longest member's end — for a window,
-- the window's own end, since under stacking a window is an item as long as
-- its span (DYN-4). Each slot's gap is its offset minus the end of the
-- PREVIOUS SLOT'S position, floored at zero; the first slot's previous end is
-- the anchor (0), so a leading offset becomes a leading gap. Members of one
-- bracket therefore get gap 0 after the first, and the slot after a bracket
-- measures from the bracket's longest end. `unscheduled` slots sort last and
-- get gap 0. A before-wake position (negative offset) is shifted to the
-- anchor before its end is measured, because that is where the stack puts it.
WITH position_ends AS (
  SELECT template_id, offset_start_min,
         MAX(COALESCE(offset_end_min, offset_start_min + duration_min))
           + GREATEST(0, -offset_start_min) AS position_end
  FROM "template_slots"
  WHERE offset_start_min IS NOT NULL
  GROUP BY template_id, offset_start_min
),
ordered AS (
  SELECT s.id,
         s.template_id,
         s.offset_start_min,
         ROW_NUMBER() OVER (
           PARTITION BY s.template_id
           ORDER BY (s.offset_start_min IS NULL), s.offset_start_min, s.sort_order, s.created_at
         ) - 1 AS new_sort,
         pe.position_end
  FROM "template_slots" s
  LEFT JOIN position_ends pe
    ON pe.template_id = s.template_id AND pe.offset_start_min = s.offset_start_min
),
with_prev AS (
  SELECT id, template_id, offset_start_min, new_sort,
         COALESCE(LAG(position_end) OVER (PARTITION BY template_id ORDER BY new_sort), 0) AS prev_end
  FROM ordered
)
UPDATE "template_slots" t
SET sort_order = w.new_sort,
    gap_before_min = CASE
      WHEN w.offset_start_min IS NULL THEN 0
      ELSE LEAST(240, GREATEST(0, w.offset_start_min - w.prev_end))
    END
FROM with_prev w
WHERE w.id = t.id;--> statement-breakpoint
-- The rows a human should look at. Greppable: "0004 overlap:" and "0004 before-wake:".
DO $backfill_notices$
DECLARE
  r record;
  overlap_count integer := 0;
  before_wake_count integer := 0;
BEGIN
  -- A fixed slot that started before the previous position ended, without
  -- sharing that position's bracket: under v1.0 the two overlapped; under
  -- stacking the second now follows the first. Gap is 0; the shape changed.
  FOR r IN
    WITH position_ends AS (
      SELECT template_id, offset_start_min,
             MAX(COALESCE(offset_end_min, offset_start_min + duration_min)) AS position_end
      FROM "template_slots"
      WHERE offset_start_min IS NOT NULL
      GROUP BY template_id, offset_start_min
    ),
    ordered AS (
      SELECT s.id, s.template_id, s.offset_start_min, s.sort_order, s.multitask_group,
             pe.position_end,
             LAG(s.id) OVER (PARTITION BY s.template_id ORDER BY s.sort_order) AS prev_id,
             LAG(pe.position_end) OVER (PARTITION BY s.template_id ORDER BY s.sort_order) AS prev_end,
             LAG(s.multitask_group) OVER (PARTITION BY s.template_id ORDER BY s.sort_order) AS prev_group
      FROM "template_slots" s
      LEFT JOIN position_ends pe
        ON pe.template_id = s.template_id AND pe.offset_start_min = s.offset_start_min
      WHERE s.offset_start_min IS NOT NULL
    )
    SELECT id, template_id, prev_id
    FROM ordered
    WHERE prev_end IS NOT NULL
      AND offset_start_min < prev_end
      AND (multitask_group IS NULL OR multitask_group IS DISTINCT FROM prev_group)
  LOOP
    overlap_count := overlap_count + 1;
    RAISE NOTICE '0004 overlap: template=% slots=%,%', r.template_id, r.prev_id, r.id;
  END LOOP;

  -- A slot before the anchor (TP-02's "up to two hours before"). v1.1 has no
  -- before-wake slot — orient is the first block — so its position survives
  -- only in the deprecated column. Gap is 0; it now starts at the anchor.
  FOR r IN
    SELECT id, template_id, offset_start_min
    FROM "template_slots"
    WHERE offset_start_min IS NOT NULL AND offset_start_min < 0
  LOOP
    before_wake_count := before_wake_count + 1;
    RAISE NOTICE '0004 before-wake: template=% slot=% offset=%', r.template_id, r.id, r.offset_start_min;
  END LOOP;

  RAISE NOTICE '0004 backfill: overlaps=% before-wake=%', overlap_count, before_wake_count;
END
$backfill_notices$;
