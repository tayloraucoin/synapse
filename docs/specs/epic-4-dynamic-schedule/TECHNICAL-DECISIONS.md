# Epic 4 — Dynamic schedule (UX v1.1) — Technical Decisions (append-only)

One section per architectural choice that had real alternatives. Written when the decision is made. Format:

```
## YYYY-MM-DD · <ticket-id> · <the decision, as a statement>
**Context (as it was then):** …
**Options weighed:** A … B … C …
**Decision:** …
**Consequences:** what this buys, what it costs, what it forecloses.
**Revisit trigger:** the condition under which this should be reopened.
```

The first nine (TD-1…TD-9) are Mason's architecture pass over v1.1 §11, made 2026-09-12 before any ticket was cut, so every ticket builds inside them. Tickets cite them by number.

## 2026-09-12 · TD-1 · `templates` becomes the block template table; no new table is created for blocks

**Context (as it was then):** v1.0's `templates` is "a named day plan" (official spec §3.4) with `anchor_time`, `weekly_target`, `typical_days`, and slots. v1.1 §3.1 makes a template a *block* with a kind and a flow direction. Every existing service, router, validator, view model, and screen already speaks `templates`.
**Options weighed:** A — a new `block_templates` table beside `templates`, migrate data across, retire `templates`. B — add `kind`, `flow`, `structure` to `templates`, make `anchor_time` nullable, backfill `kind = morning`, and let the day's template list become `day_blocks`. C — keep `templates` as the whole day and add a `blocks` child table under it.
**Decision:** B. A is a rename that costs every consumer a rewrite for no query that needs two tables. C keeps the whole-day noun v1.1 retires and makes a routine variant with a weekly count (which is exactly a template today) a nested thing with no home for its count.
**Consequences:** Buys continuity for `template.*` procedures, `TemplateSummaryView`, the seed, and the export. Costs a `kind` column that every list query filters on and a nullable `anchor_time` whose meaning changes (an explicit override for work templates only). Forecloses nothing.
**Revisit trigger:** a block kind whose template needs a shape `templates` cannot carry (none foreseen; the training and work templates are the odd ones and both fit).

## 2026-09-12 · TD-2 · `day_blocks` is the one new load-bearing table; `day_items` gain `day_block_id`

**Context (as it was then):** v1.1 §6.1 sections the Today tab by block, §6.5 draws block bands and lets a whole block be dragged, §9 enqueues one push per block boundary, §6.6 adjusts "the rest of the morning". Each of those needs a row per block per day with its own start, end, template, placement, and state.
**Options weighed:** A — derive blocks at read time from `day_items` grouped by a `block_kind` column on each item. B — a `day_blocks` table (kind, template, snapshot, sort, start, end, original start, placement, state) with `day_items.day_block_id`. C — a jsonb `blocks` column on `days`.
**Decision:** B. A cannot represent an empty block (a pooled morning before the pick, an unstructured day's wind-down with nothing in it yet) or a block's own `original_scheduled_start`, and a band drag would have to move N items to move one thing. C is A with worse indexes.
**Consequences:** Buys one row per thing the Schedule draws a band for, a place for training placement to be remembered, and a block-level ghost. Costs a second reconcile loop in the materialiser and a nullable `day_block_id` on legacy items until `0006` makes it not null. Forecloses nothing.
**Revisit trigger:** never for this product; a block is the unit v1.1 is built on.

## 2026-09-12 · TD-3 · Workouts and focuses are habits, not tables

**Context (as it was then):** v1.1 §3.7 and §3.8 give a workout a name, a weekly count, typical days, and a length; a focus a name, a weekly count, and typical days. v1.1 §11.3 proposes exactly this.
**Options weighed:** A — `workouts` and `focuses` tables. B — `item_type` gains `workout`; a focus is a `deep_work` habit; `weekly_target smallint` and `typical_days smallint[]` are added to `habits`, nullable, meaningful only for those two types.
**Decision:** B. A workout and a focus are a name with a range and a rotation, which is a habit with two extra columns. Two tables would mean two sheets, two archive paths, two RLS sets, and two view models for no query that needs them apart. The library screen filters by `block_kind`, so workouts and focuses never appear as "habits" to the person (W6).
**Consequences:** Buys reuse of every habit service and the archive rule. Costs two nullable columns most rows leave null and a validator rule that they are set only when `type ∈ {workout, deep_work}`. Forecloses a workout with sub-parts, which is P2-1 and would be a child table then.
**Revisit trigger:** P2-1 (sets and reps).

## 2026-09-12 · TD-4 · Slots store a duration and a gap; offsets are derived by one pure function

**Context (as it was then):** `template_slots.offset_start_min` is absolute from the anchor (v1.0 §3.5). v1.1 §3.2 makes gaps first-class and pins the exception. The materialiser, the editor's footer, the quick-pick's budget, the fit screen, and Adjust all need the same walk.
**Options weighed:** A — keep offsets, add a `gap_before_min` that the editor keeps in sync (two facts, one truth). B — `gap_before_min` + `pinned_at` + `sort_order` are the stored facts; `stackBlock(items, { flow, anchorMin, bound })` in `@syn/utils/day/stack.ts` derives starts; `offset_*` are backfilled in `0004` and dropped in `0006`. C — derive on the client only.
**Decision:** B. A drifts the first time an insert forgets to re-offset downstream slots — the exact pain ledger §6 named. C leaves the server unable to materialise. The walk is a function of rows and a clock with no I/O, which is the definition of `@syn/utils` (placement rule 6), and the future Expo app imports it unchanged.
**Consequences:** Buys one arithmetic for five callers and an editor where inserting mid-stack is free. Costs a backfill that must reproduce the old offsets exactly for well-formed templates (DYN-2 AC) and a transition window in which both columns exist. Forecloses absolute-offset slots, which pins replace.
**Revisit trigger:** a caller that needs a start `stackBlock` cannot produce (none foreseen).

## 2026-09-12 · TD-5 · `original_scheduled_start` is written at *Set the day* for pooled and unconfirmed days; the trigger allows the one null → value transition

**Context (as it was then):** v1.0 writes `original_scheduled_start` at week build and a DB trigger refuses every later write. v1.1 R23 and §11.8: before the pick the day is a draft; pooled items do not exist until the pick; fixtures and pins on structured days are set on Sunday.
**Options weighed:** A — keep writing at week build; treat pre-pick drags as moves (every re-plan reads as *moved*). B — write null at week build for items on a pooled or unconfirmed day, write the value in `confirmDay`, and amend the trigger to allow null → value once. C — drop the trigger and let the service promise.
**Decision:** B. A makes a Sunday plan the record, which v1.1 explicitly rejects (R23). C trades a database property for an application promise, which is the one trade Mason never makes on the record. Fixtures and pins keep A's behaviour because they are set regardless of the pick.
**Consequences:** Buys a record that begins when the person says the day is set. Costs a trigger with two branches (`OLD IS NULL AND NEW IS NOT NULL` permitted; anything else refused) and a materialiser that knows which rows to leave null. Forecloses nothing.
**Revisit trigger:** a surface that needs a ghost for a pre-pick plan (none; the Schedule shows no ghosts before the pick).

## 2026-09-12 · TD-6 · Adjust is one service with `shifts.kind`; shift and trim are retired after their callers move

**Context (as it was then):** v1.0 has `apply-shift` (delta + reason, cuts inherit) and `apply-trim` (capacity, not-assigned). v1.1 §6.6 is one sheet with three entries, a reason chip, *what gives*, and three *how*s, one of which slides the anchor (a shift) and two of which hold it (a refit).
**Options weighed:** A — keep both services and have the sheet call one or the other. B — one `adjustDay` service and one `computeAdjust` pure function over `stackBlock`, writing a `shifts` row with `kind ∈ {shift, refit}`, `shortened_item_ids`, and cuts as v1; the old services and utils are retired in `0006`'s ticket. C — a new `adjustments` table.
**Decision:** B. A keeps two fit computations alive (`computeShiftFit`, `computeTrim`) beside a third, and the Day Review would read three shapes. C is a rename of `shifts` that loses the Review's existing shift band and SC-02 detail sheet. The `shifts` row already carries reason, tier, and the cut link through `misses.shift_id`; one column tells the two kinds apart.
**Consequences:** Buys one preview-then-apply path with the staleness check USE-6 established, and one place the Review reads. Costs a transition in which three services coexist until DYN-21. Forecloses nothing.
**Revisit trigger:** offline reconciliation (Phase 2), as USE-6's own trigger.

## 2026-09-12 · TD-7 · Journal answers are a jsonb keyed by prompt key; prompts live on the profile

**Context (as it was then):** v1.1 §7.2: six prompts, editable per person, reorderable, removable; the morning reads three of them by key.
**Options weighed:** A — six columns on `journal_entries`. B — `journal_entries.answers jsonb Record<promptKey, string>` with `users.journal_prompts jsonb [{key,label}]` seeded from `DEFAULT_JOURNAL_PROMPTS`. C — a `journal_answers` child table, one row per prompt.
**Decision:** B. A cannot survive a renamed or added prompt. C is normalised past any query that reads it (the orient frame reads one row; the Week Review reads seven). A jsonb keyed by a stable key is the shape that lets a person rename a prompt without orphaning an answer.
**Consequences:** Buys editable prompts and a one-row read. Costs a documented JSON shape and a validator that bounds each answer (`JOURNAL_ANSWER_MAX`). Forecloses per-answer timestamps, which P2-5's timer would want and can add as a sibling jsonb then.
**Revisit trigger:** P2-5.

## 2026-09-12 · TD-8 · Fixtures are their own table, materialised as pinned `day_items` with `origin = fixture`

**Context (as it was then):** v1.1 §3.6 and R27: a fixture belongs to a weekday, not a template, and materialises on every planned instance regardless of template; the quick-pick cannot remove it; calendar import lands here later.
**Options weighed:** A — a template slot with `pinned_at` on a template assigned to that weekday. B — a `fixtures` table (title, weekdays[], at_time, duration, block_kind, scheduling, optional habit) read by the materialiser for every day. C — one-offs created seven weeks ahead.
**Decision:** B. A ties a Tuesday stand-up to whichever template Tuesday gets, which is the bug R27 exists to prevent. C is a fixture without a home to edit it. The materialiser already loops per block; fixtures are one more source of pinned rows into the block their `block_kind` names.
**Consequences:** Buys an honest week before any routine is designed and a landing for P2-7. Costs one table and one more read in the materialiser. Forecloses nothing.
**Revisit trigger:** P2-7, which adds `calendar_event_id` to the row rather than a new table.

## 2026-09-12 · TD-9 · Three migrations: plan side, day side, cleanup

**Context (as it was then):** v1.1 §11 touches nine tables and a trigger. Root `AGENTS.md`: migrations are append-only, human-reviewed, never run by an agent against a hosted tier.
**Options weighed:** A — one migration for everything. B — `0004` (templates, template_slots, habits, `item_type`), `0005` (users, fixtures, day_blocks, days, day_items, shifts, journal_entries, notification_prefs, the trigger), `0006` (drop `offset_*`, `days.template_id`, `users.wake_anchor_habit_id`, the old enum values if any). C — one migration per table.
**Decision:** B. A puts the backfill (the one step that can be wrong) in the same review as fourteen additive columns. C is nine reviews for one change. The split follows the dependency: the day side references `templates.kind`, and nothing is dropped while a surface still reads it.
**Consequences:** Buys three reviewable SQL files, each with one idea. Costs a window (DYN-3 → DYN-21) in which old and new columns coexist and `get-day.ts` tolerates both. Forecloses nothing.
**Revisit trigger:** none; this is sequencing.
