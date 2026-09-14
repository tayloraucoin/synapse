-- HAND-AMENDED after `drizzle-kit generate` — DYN-21, UX v1.1 §11.12, §0.4,
-- R11, R20 (TD-1, TD-2, TD-4). The generated DROPs are unchanged; two blocks
-- are added around them, in this order:
--
--   1. THE v1.0 BACKFILL, IN SQL, BEFORE THE DROPS. DYN-5's `backfillBlocks`
--      read `days.template_id` — the column this migration removes — so the
--      backfill has to live where the drop lives, or the code that could run
--      it is gone by the time the migration is applied (TECHNICAL-DECISIONS,
--      DYN-21). Every day that has items and no block gets ONE `morning`
--      block: `template_id` and its name from the day's v1.0 template, `set`
--      for a past, closed or touched day (with the block's ghost at its first
--      item's start) and `planned` otherwise; every item on the day is put
--      under it. A day that already has a block is skipped, so the block runs
--      idempotently and a tier that ran the service first changes nothing.
--      "Touched" is `untouched.ts`'s predicate, transcribed.
--
--   2. THE ASSERTION. After the backfill, a day with items and no block is a
--      row the backfill could not reach; the migration raises and applies
--      nothing. `day_items.day_block_id` stays NULLABLE (a change from the
--      handoff's brief): UX v1.1 itself has block-less items — a one-off, an
--      unstructured day's add (`DayView.unblocked`, DYN-15) — so NOT NULL
--      would refuse rows the product writes.
--
-- After the drops: `templates.anchor_time` is nulled for every kind but
-- `work` — the profile anchors the rest at materialisation (TD-1), and a
-- stale v1.0 value on a morning template is a number nothing reads.
--
-- Order per tier (docs/developer-guides/migrations.md): 0004 and 0005 first,
-- the platform setup re-run, then 0006 on its own. Nothing reads the dropped
-- columns after DYN-21; `yarn check-types` is the proof.
DO $$
DECLARE
  candidate RECORD;
  block_id uuid;
  first_start timestamptz;
  last_end timestamptz;
  is_past boolean;
  touched boolean;
  moved integer;
  n_days integer := 0;
  n_items integer := 0;
BEGIN
  FOR candidate IN
    SELECT d.id, d.user_id, d.date, d.timezone, d.closed_at, d.template_id,
           t.name AS template_name
    FROM days d
    LEFT JOIN templates t ON t.id = d.template_id
    WHERE NOT EXISTS (SELECT 1 FROM day_blocks b WHERE b.day_id = d.id)
      AND EXISTS (SELECT 1 FROM day_items i WHERE i.day_id = d.id)
    ORDER BY d.date
  LOOP
    SELECT min(coalesce(i.original_scheduled_start, i.scheduled_start)),
           max(i.scheduled_end)
      INTO first_start, last_end
      FROM day_items i
     WHERE i.day_id = candidate.id;

    -- A day that has been lived is set; a plan is still planned.
    is_past := candidate.closed_at IS NOT NULL
      OR candidate.date < (now() AT TIME ZONE candidate.timezone)::date;

    touched := EXISTS (
      SELECT 1 FROM day_items i
       WHERE i.day_id = candidate.id
         AND NOT (
           i.assignment_state = 'assigned'
           AND i.completion_state = 'upcoming'
           AND i.deferred_at IS NULL
           AND i.done_at IS NULL
           AND NOT EXISTS (SELECT 1 FROM timer_sessions s WHERE s.day_item_id = i.id)
           AND NOT EXISTS (SELECT 1 FROM misses m WHERE m.day_item_id = i.id)
         )
    );

    INSERT INTO day_blocks (
      user_id, day_id, kind, template_id, template_name_snapshot, state,
      sort_order, scheduled_start, scheduled_end, original_scheduled_start
    ) VALUES (
      candidate.user_id, candidate.id, 'morning'::block_kind,
      candidate.template_id, candidate.template_name,
      (CASE WHEN is_past OR touched THEN 'set' ELSE 'planned' END)::day_block_state,
      0, first_start, last_end,
      -- The block's ghost begins where its first item's did.
      CASE WHEN is_past OR touched THEN first_start ELSE NULL END
    )
    RETURNING id INTO block_id;

    UPDATE day_items SET day_block_id = block_id
     WHERE day_id = candidate.id AND day_block_id IS NULL;
    GET DIAGNOSTICS moved = ROW_COUNT;

    n_days := n_days + 1;
    n_items := n_items + moved;
  END LOOP;

  RAISE NOTICE '0006 backfill: days=% items=%', n_days, n_items;

  IF EXISTS (
    SELECT 1 FROM days d
     WHERE EXISTS (SELECT 1 FROM day_items i WHERE i.day_id = d.id)
       AND NOT EXISTS (SELECT 1 FROM day_blocks b WHERE b.day_id = d.id)
  ) THEN
    RAISE EXCEPTION '0006: a day with items has no block after the backfill; nothing applied';
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "template_slots" DROP CONSTRAINT "template_slots_offset_start_min_check";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_wake_anchor_habit_id_habits_id_fk";
--> statement-breakpoint
ALTER TABLE "days" DROP CONSTRAINT "days_template_id_templates_id_fk";
--> statement-breakpoint
DROP INDEX "users_wake_anchor_habit_id_idx";--> statement-breakpoint
DROP INDEX "days_template_id_idx";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "wake_anchor_habit_id";--> statement-breakpoint
ALTER TABLE "template_slots" DROP COLUMN "offset_end_min";--> statement-breakpoint
ALTER TABLE "template_slots" DROP COLUMN "offset_start_min";--> statement-breakpoint
ALTER TABLE "days" DROP COLUMN "template_id";--> statement-breakpoint
-- The profile anchors every kind but work at materialisation (TD-1, v1.1 R5).
UPDATE "templates" SET "anchor_time" = NULL WHERE "kind" <> 'work' AND "anchor_time" IS NOT NULL;
