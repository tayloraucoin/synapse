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

## 2026-09-12 · DYN-1 · Backward flow is the forward walk in a mirror, and `fitToBudget` shortens lowest-priority first, only as far as needed

**Context (as it was then):** `stackBlock` has to lay a block forward from wake or backward to an anchor, with pins, brackets and one-of groups behaving identically in both directions (v1.1 §3.3). `fitToBudget` has to apply R4 — floors first, then cuts — and the ticket left the shorten order as a dev's call.
**Options weighed:** (walk) A — two walks, one per direction, each with its own pin and bracket handling. B — one forward walk in mirrored minutes (`m = anchor − t`) over the reversed list, with bracket members aligned to a shared *end* in mirrored space so they share a real *start*, and each reversed item borrowing its successor's gap; the result mapped back. (shorten) C — shorten every soft item to its floor, then cut. D — proportional shortening across items. E — lowest priority first, each to its floor, stopping the moment the total fits; then cut in the same order.
**Decision:** B and E. A is two places for the pin rule to drift apart, and the pin rule is the one that protects a stand-up. C turns a three-minute overrun into five items at their floors, which is the "meditate for four minutes" v1.1 L2 warned against. D produces durations nobody set. E costs the least important thing first and stops early, and it is the same order the cut step uses, so the two halves of R4 agree about what matters least.
**Consequences:** Buys one pin rule and one priority order for every caller. Costs a mirror that a reader has to hold in their head (the file's header explains it) and a shorten result that can leave higher-priority items untouched while one low-priority item is at its floor — which is the intended reading of "the range is why the range exists". Forecloses nothing.
**Revisit trigger:** a caller that needs proportional shortening (none foreseen); a bracket with a pinned member, which the walk treats as pinned at the first pinned member and does not otherwise model.

## 2026-09-12 · DYN-1 · Enum unions move in `@syn/types` and `@syn/db` together; the migration follows

**Context (as it was then):** DYN-1 widened five unions; the `enumValues<Union>()` sentinel then made every insert of a real value in `@syn/api` a type error, and the ticket had scoped the red to `@syn/db` alone.
**Options weighed:** A — leave the workspace red until DYN-3 (two migration tickets, one execution batch). B — update the five `pgEnum` tuples now (TypeScript only), so the schema and the unions agree and `db:generate` in DYN-2 emits the `ADD VALUE`s. C — hold the union changes back and land them in DYN-2/3 with their migrations.
**Decision:** B. A blocks the build and any deploy for a batch to preserve a proof that had already been captured. C splits DYN-1's contract across three tickets and leaves the view models and constants without the unions they name. The cost of B is a window in which TypeScript accepts a value Postgres cannot store; it is bounded by "nothing writes a new value before its migration", which every service ticket's non-negotiables restate, and by `0004` landing next.
**Consequences:** Buys a green workspace between DYN-1 and DYN-2. Costs four enum extensions arriving in `0004` rather than `0005` (logged in `DEVIATIONS.md`). Forecloses nothing.
**Revisit trigger:** a future enum addition with a writer that ships before its migration — then the union moves with the migration, not before.

## 2026-09-12 · DYN-4 · The same-position rule is one function, `samePosition`, paid by every write and read; alternates are synced by the service after the write

**Context (as it was then):** v1.0's `SameStartError` refused two fixed slots at one start unless they shared a `multitask_group`. v1.1 §3.5 adds *one of*; slots no longer carry a start, only a position in the stack (`sort_order`) or a pin (`pinned_at`).
**Options weighed:** A — check the rule in the slot sheet and trust the client. B — check it in `saveSlot` only, and let `moveSlot`/`restoreSlot`/`duplicateTemplate` assume their inputs were already legal. C — one predicate `samePosition(a, b)` = same `sort_order` or same `pinned_at`, and one legality test (shared `multitask_group` or shared `alternates_group`) used by `saveSlot`, `restoreSlot`, and the read-side `findCollisions`; `moveSlot` swaps whole positions so it cannot create a pair; `duplicateTemplate` copies positions and re-keys groups so it cannot either.
**Decision:** C. A and B both leave a path that stacks breakfast on the walk without anyone seeing it until the day is laid out. Alternates members are made structurally identical (`sort_order`, `gap_before_min`, `pinned_at`, `role`) by `syncAlternates` *after* the write, and any other default in the group is cleared *before* a new default is written, so no moment leaves the group with two defaults or none. `sort_order` is densified by the service after every save, remove, and restore; no caller sends it.
**Consequences:** Buys one invariant with one spelling. Costs an extra read of the template's slots on every write (single digits of rows). Forecloses a client-computed position: the sheet may propose, the service disposes.
**Revisit trigger:** a third legal answer at one position (v1.1 names two), or a caller that needs to write `sort_order` directly (drag reorder in DYN-9 should go through `moveSlot` or a new `reorderSlots` that densifies, never a raw update).

## 2026-09-12 · DYN-4 · A slot is always `fixed_time`; windows and *anytime* are day-level, not template-level

**Context (as it was then):** v1.0 slots had three `time_mode`s and offsets; v1.1 §3.2 describes a slot as a duration and a gap in a stack, with an optional pin, and describes windows (§3.6 one-offs) and *anytime* items as things a day holds.
**Options weighed:** A — keep `timeMode` on `slotFormSchema` and let a template hold a window slot, with `stackBlock` treating it as its span. B — drop `timeMode` from the form; the service writes `fixed_time` on every save; legacy `window`/`anytime` rows are read as-is until `0006` (a legacy window counts as its span in the walk so a migrated template keeps its clocks).
**Decision:** B. A window in a stack has no meaning the walk can honour without a second arithmetic (where in the window does the next thing start?), which TD-4 forbids. The day is where a window belongs (DYN-5's one-offs, DYN-6's moves).
**Consequences:** Buys one arithmetic. Costs a transitional read path (`walkDurationOf`, marked deprecated) until `0006` drops the offsets and the two enum values' rows are converted. Forecloses a per-slot window in a block template; a person who wants "sometime in the morning" places it on the day.
**Revisit trigger:** v1.1 (or a later version) adding a window to the block editor's slot sheet — then `time_mode` returns to the form with a stated walk rule.

## 2026-09-13 · DYN-5 · One layout for the whole day, `layOutDay`, chains `stackBlock` per kind; build and confirm both call it

**Context (as it was then):** v1.1 §11.11 gives two phases — week build lays out the decided blocks; *Set the day* resolves the pools and walks every block in its flow direction from `woke_at`, work start and lights-out. Six callers converge on the materialiser and one new service confirms.
**Options weighed:** A — a walk inside `materializeDay` for build and a second inside `confirmDay` for the forward-from-wake chain, each calling `stackBlock` per block. B — one pure function taking blocks (kind, flow, sort order, state, placement, split half, items) and the day's anchors (wake, work start, work end, lights-out, hardness), returning minutes per block and item and where work actually starts; both services resolve their rows and call it. C — a per-kind anchor resolver only, with the chain left to each caller.
**Decision:** B. The chain — orient and morning forward from wake; placed training and break forward where they sit; prep backward to the work anchor (which a soft anchor lets slide to the morning's end plus prep); work as the container from that anchor to work end, split around an *inside work* placement at its centre; activity forward from work end; wind-down backward to lights-out with the devices-off marker as a pin — is one opinion about where 8:03 is, and A would have written it twice with the second copy drifting on the first Adjust. C leaves the split, the slide and the cursor to each caller. Pooled, `not_today` and unplaced blocks get no times; the walk never clamps — a hard anchor's overrun is reported, never absorbed (R7).
**Consequences:** Buys one arithmetic for build, confirm, and (DYN-6) Adjust and moves, all probeable without a database. Costs a re-read of the day's rows between the reconcile and the walk, so pins are read from their stored clocks rather than carried. Forecloses per-caller layout rules: a caller that wants a different chain changes this function.
**Revisit trigger:** a third direction (a block anchored at both ends), or a placement that names a clock rather than a span.

## 2026-09-13 · DYN-5 · `confirmDay` is one transaction that runs the materialiser's passes, resolves the pools into rows, walks once, and writes the originals with a single `NULL → value` update per table

**Context (as it was then):** R23 says nothing derived from the pick exists before the pick; TD-5 says `original_scheduled_start` is written at *Set the day* for everything but fixtures and pins, and the trigger permits exactly one null-to-value transition. Five sections of the pick (routine, one-ofs, training, focus, shape) each produce rows.
**Options weighed:** A — a procedure per section (`day.setRoutine`, `day.setTraining`, …) and a final `day.confirm` that writes the timestamp. B — one `confirmDay` taking the whole pick, idempotent, in one transaction: materialise the day's blocks ("keep", or the profile's default plan for an unplanned day), resolve the morning (variant → its slots; menu → habit items with `template_slot_id = null` and the *Menu* snapshot, between the opener and the closer; `auto_trim` → `fitToBudget` over the routine's rows), the one-ofs (the chosen member replaces the default's untouched row, with the same `alternates_id`), the training (placement, the workout item, the split, the trade) and the focus (one container item per work row); renumber the blocks; walk; write times; then `UPDATE … SET original_scheduled_start = scheduled_start WHERE original_scheduled_start IS NULL` on `day_blocks` and `day_items`.
**Decision:** B. A would let a day be half-set — a workout placed, a routine still pooled — and the record would begin per section, which is not what "the moment the record begins" means. The `WHERE … IS NULL` form is what keeps the originals out of every other `UPDATE` set: the trigger stands behind it, and the service never carries the column elsewhere. A second confirm returns the day and changes no row; a closed day refuses; over budget never refuses.
**Consequences:** Buys one moment, one write, one refusal set (closed · unplaced workout · trade with a set day). Costs a wide input schema whose sections are all optional, so the one-tap morning is `{ date }`. Forecloses a partial confirm, which the product does not have.
**Revisit trigger:** offline confirm (Phase 2) needing the pick's choices persisted before the write — then the sections become a draft row, and this stays the write.

## 2026-09-13 · DYN-5 · `isUntouchedBlock` is the item predicate lifted one level, plus "no confirm has set it"; a touched block keeps its rows and loses only its link

**Context (as it was then):** SET-6's `isUntouchedItem` decides what the materialiser may rewrite. Blocks are rows now, with their own `original_scheduled_start` written at confirm.
**Options weighed:** A — a block is untouched while its items are. B — A, and while `original_scheduled_start` is null: a confirmed block is touched by definition, even with no item touched. C — a stored flag on the block.
**Decision:** B. A would let a re-assignment delete a confirmed but not-yet-started block (its items are all untouched at 7:05) and with it the record that the day was set that way. C is a second home for a fact the column already carries. The consequences follow SET-6 exactly: an untouched block is re-pointed or deleted (its untouched items cascade); a touched block keeps every row and, when its assignment is gone, has `template_id` nulled, like an item losing its slot.
**Consequences:** Buys one rule at two levels with one spelling each. Costs a read of every item's session and miss counts per block on every write (the same sub-selects SET-6 pays). Forecloses deleting any block a person has set the day on.
**Revisit trigger:** a block-level action that is not a confirm and should count as touching (a band drag, DYN-6) — then it writes the block's `original_scheduled_start` or a note is added here saying why it does not.

## 2026-09-13 · DYN-6 · One reflow after *Set the day* (`reflowBlock`) and one Adjust arithmetic (`computeAdjust`), both over `stackBlock`; fixed points enter the walk as pins

**Context (as it was then):** Five writers change a set day — Adjust, *Do now*, *Edit today's*, an item drag, a band drag — and each must leave pins, fixtures, hard, done and running items where they are while the rest re-stacks beneath, never overlapping, never touching `original_scheduled_start`. `stackBlock` knows pins; it has no notion of "done" or "hard".
**Options weighed:** A — each writer re-lays the rows it touched with its own loop. B — one `reflowBlock(tx, blockId, { from, hold, dryRun })` that reads the block, marks the five fixed kinds (plus whatever the caller holds) as pins at their current clocks, walks the rest forward from the `from` item with `stackBlock`, and writes the two time columns; and one pure `computeAdjust` that does the same over the Adjust scope with `fitToBudget` for the shorten/cut/choose step. C — extend `computeShiftFit` (USE-6) with fixed points and blocks.
**Decision:** B. A is five opinions about where 8:03 is after a drag, and the second one to be written differently is the one that walks a slide through the stand-up. C makes DYN-21's retirement of `shift-fit` a rewrite. Treating fixed points as pins means the pure function needs no new concept: a done item at 8:10 is, to the walk, a pin at 8:10. Overflow — a soft item run into a pin, or past the next block's start — is reported, never absorbed; *Do now* asks before writing (`dryRun`), the others write and let the number be the feedback (R7).
**Consequences:** Buys one place `stackBlock` is called after confirm and one Adjust arithmetic previewed by the client and recomputed by the server. Costs a re-read of the block per write. Forecloses per-writer layout rules; a writer that wants a fixed point moved moves it itself first and holds it (a confirmed pin drag).
**Revisit trigger:** a sixth writer whose re-lay is not "hold the fixed, walk the rest forward" — then it is a different function, named for what it does.

## 2026-09-13 · DYN-6 · Adjust's undo is (b): cuts and the anchor come back, lengths stay; exact positions wait for `shifts.undo_snapshot`

**Context (as it was then):** The ticket's `[NEEDS DECISION]`: a refit shortens durations and a shift walks the remaining set forward from now; neither writes what the rows were before. USE-6's undo subtracts a uniform delta from the still-movable set, which a walked slide is not.
**Options weighed:** (a) add `shifts.undo_snapshot jsonb` in `0006` and ship an exact undo in DYN-21. (b) reuse the shift undo's shape now: cuts restored with their misses deleted, a `shift`'s anchor moved back by its delta (the day's column, the work container, its focus), the scope re-flowed from what came back; lengths kept, *choose*'s left-out items returned through *Bring back*.
**Decision:** (b), the ticket's provisional default, because Taylor had not ruled and the batch could not wait on a migration column. Under (b) nothing is lost that the record needs — a cut item's miss goes because it is no longer cut, the anchor is exact because its delta is stored, and a shortened length is the person's to change on the item sheet — but the re-flow lands items where the walk puts them, not where they were.
**Consequences:** Buys an undo that ships with the services. Costs an approximate restoration of positions, which the toast says in one line (*Undone — lengths kept*). Forecloses nothing: (a) adds a column and a branch.
**Revisit trigger:** DYN-21's `0006` — if the snapshot column lands, `undoAdjust` reads it and this entry is superseded.

## 2026-09-13 · DYN-7 · The drag layer is one controller that owns the gesture and the preview, emits intents, and takes the caller's answer back as a prop

**Context (as it was then):** Two surfaces drag — the Schedule (items in time, bands, resize; DYN-16) and the block editor (reorder, resize, gaps; DYN-9). Each has its own rows, its own refusals (a pin under a drop; a fixture needing a dialog) and its own writes (`item.move`, `day.moveBlock`; `template.moveSlot`). v1.1 §6.5 and §10.4 give one set of gestures, one keyboard vocabulary, and one live-region grammar for both.
**Options weighed:** A — a drag hook per surface, each wired to its procedures. B — one `DragLayer` laid over the axis that reads geometry (`items`, `blocks`, `pxPerHour`, `gutterPx`), lifts on long-press or mouse-drag, snaps, draws the ghost and the re-stack preview, and emits `{ move | resize | move-block | reorder }`; the caller writes, and hands back `state` (`refused`, `confirming`) so the layer draws the return or holds; the keyboard path (Alt/Shift arrows, `m` then a time, Escape) and the polite live region live in the same component. C — B, with the layer also calling the procedures through a callback map.
**Decision:** B. A writes the long-press, the snap, the preview and the announcements twice, and the second copy is the one that lifts a pin. C makes `@syn/ui` know procedure names, which placement rule 5 forbids and the Expo re-skin would inherit. Under B a pin never lifts because `ScheduleBlock` marks it (`data-pinned`) and the layer honours the mark; the refusal line is the caller's sentence passed in; the layer writes nothing.
**Consequences:** Buys one gesture, one keyboard, one voice for both screens, testable in a story with no data. Costs the caller a small state machine (`idle → lifted → dropping | refused | confirming → idle`) and the geometry in minutes. Forecloses a layer that knows what a drop means; that is what the two tickets add.
**Revisit trigger:** a third surface whose drag is not "lift, move in one axis, drop" — a two-axis drag, a drag between lists — which is a different component.

## 2026-09-13 · DYN-7 · `StepFrame` is presentational in `@syn/ui`; the app binds it

**Context (as it was then):** The v1.0 frame lived in the app with the router, tRPC and the online hook inside it; v1.1 §4 reuses the twelve screens in Settings → Your day "without the frame" and widens the count to twelve.
**Options weighed:** A — leave it in the app and give DYN-10 a second frame for twelve steps. B — move the rendering to `@syn/ui` with callbacks (`onBack`, `onFinishLater`), flags (`offline`, `busy`) and a `copy` object, and keep a ten-line wrapper in the app that binds `useStepNavigation`, the routes and `SETUP_COPY`. C — move everything, hooks included, and make `@syn/ui` import the app's clients.
**Decision:** B. A is the fork the design-system rule exists to prevent; C breaks the layer order (root `AGENTS.md`: `@syn/ui` never imports an app). The wrapper keeps the five v1.0 steps' imports unchanged; DYN-10 composes the `@syn/ui` frame directly with `total = 12`.
**Consequences:** Buys one frame for first run and Settings. Costs a wrapper file that will look redundant once DYN-10 rewrites the steps. Forecloses the frame reading the network or the route.
**Revisit trigger:** DYN-10 — when the twelve screens land, the wrapper either serves them or is deleted with the five v1.0 steps.

## 2026-09-13 · DYN-10 · A first-run screen is one component with two frames: `FactScreen` wraps `StepFrame` in the sequence and a heading with *Save* under Settings → Your day

**Context (as it was then):** v1.1 §4 gives twelve screens and §4.14 reuses them "without the frame, as a list". Each screen writes one or two fields of the profile (`user.updatePreferences`) or, for commitments, rows of its own (`fixture.save`). DYN-7 had already moved `StepFrame` to `@syn/ui` for exactly this reuse.
**Options weighed:** A — two components per screen, one for the sequence and one for Settings, sharing a fields component. B — one component per screen taking `embedded`, rendered through a `FactScreen` that supplies either frame: in the sequence, *Continue* saves then `goTo(step + 1)` and *Skip* goes without saving; embedded, a *Save* button saves and calls `onSaved`. C — one component that reads its frame from the route.
**Decision:** B. A is the fork (six pairs that agree today); C makes the screen know the route table. Under B the screen owns its fields and its `save`, and `FactScreen` owns the two frames and the `user.me` invalidation; the DYN-8 page mounts the same six with `embedded` and a callback that returns to the list. Screen 4 passes `save: null` because each fixture is written as it is saved.
**Consequences:** Buys six screens that cannot drift between first run and Settings. Costs `FactScreen` a small branch and every screen an `onSaved` it ignores in the sequence. Forecloses a Settings frame that differs from the sequence's in more than the chrome.
**Revisit trigger:** DYN-11 — screens 7, 9 and 10 embed the block editor rather than fields; if `FactScreen`'s *Save* has nothing to save on those, the editor's own autosave is the save and the frame's button is dropped for them.

## 2026-09-13 · DYN-8 · The editor's footer arithmetic is `stackBlock` on the client over the page's `SlotView`s; the server's walk is read on load and never re-fetched per edit

**Context (as it was then):** v1.1 §3.11's footer reads *7:03 – 8:15 · 72 min · 0 min slack* and must update on every edit — a length, a gap, a pin, a reorder. DYN-4's read model derives `startClock` per slot with one `stackBlock` walk on the server (TD-4). The profile's four clocks bound each kind's walk.
**Options weighed:** A — refetch `template.get` after every write and read the server's clocks. B — walk on the client with the same `stackBlock` (`@syn/utils`) over the `SlotView`s the page already holds, reading the profile once (`user.me`), memoised on the slots and the four clocks; the server's clocks are what the page painted with and every write still invalidates the query. C — a `template.footer` procedure called on each edit.
**Decision:** B. TD-4's point is one arithmetic; the client and the server calling the same pure function over the same fields is that point kept, and it costs no round trip. A repaints the whole strip on a network's schedule; C is a second procedure whose only job is to run a function the client has. The bound per kind (morning/orient → work start, prep → wake, work → work end, activity → lights-out, wind-down → work end) lives in `use-block-editor.ts`'s `boundFor`; DYN-4's `anchors.ts` holds the server's copy of the same mapping, and the two are reconciled when DYN-11's fit screen reads both.
**Consequences:** Buys an instant footer and strip. Costs a second reader of the kind → bound mapping (flagged for DYN-11). Forecloses a footer the client cannot compute — which is any footer that depends on rows the page does not have.
**Revisit trigger:** the fit screen (DYN-11 §4.12) — if it needs the whole day's arithmetic rather than one block's, `layOutDay` is server-only and the reading moves back to a procedure.

## 2026-09-13 · DYN-11 · The fit is a server query, `template.fit`, and first-run completion is one procedure that writes the mode, marks the row, and pre-fills the week

**Context (as it was then):** §4.12 needs orient, prep and the routine's totals against the profile; §4.13 promises the first week pre-filled "so the week build's first job is reading". DYN-8's editor walks on the client; DYN-5's `prefillWeek` exists as `week.prefill`.
**Options weighed:** A — the fit screen fetches three templates and the morning habits and runs `computeBudget` on the client, then calls `updatePreferences`, `completeFirstRun` and `week.prefill` in turn. B — `template.fit` reads the profile and the default templates through the materialiser's own readers and returns minutes; `completeFirstRun({ overflowMode })` writes the mode with the completion and calls `prefillWeek` for the person's current week. C — B, with the pre-fill left to the week build's first open.
**Decision:** B. The fit's inputs are the materialiser's (`readDayProfile`, `defaultTemplateFor`, `readTemplateSlots`), so the number the screen shows is the number the first day will lay out from — four client queries would each be a place to drift. Three client calls in sequence (A) leave an account half-finished when the second fails; C makes the week build's first open a write, which §4.13 says it must not be. The screen still renders and writes nothing until a button is tapped.
**Consequences:** Buys one number, one write, one week. Costs `completeFirstRun` a dependency on `resolveTodayFor` and `prefillWeek` (a second `rls.execute` after the row update — the pre-fill is idempotent, so a failure between them leaves a completed account with an unplanned week, which *Plan from your defaults* repairs). Forecloses a fit computed from rows the server cannot see.
**Revisit trigger:** DYN-13's orient route — `completeFirstRun` may then return where to land, rather than the screen deciding.

## 2026-09-13 · DYN-12 · The day sheet sends the whole assignment; the training trade is its own service over the confirm path's helpers

**Context (as it was then):** WK-02's sheet applied one template per day through `applyTemplate` / `removeTemplate`. Under v1.1 a day has blocks by kind, a shape, a focus and a workout; the materialiser reconciles a full assignment (`assignBlocks`, DYN-5) and `confirmDay` already trades a workout with another day at the pick.
**Options weighed:** A — per-kind procedures (`setBlock`, `setShape`, `setFocus`) each reconciling their own change. B — the sheet builds the day's assignment from `dayPreview.blocks` plus the one change and sends `assignBlocks` every time; the *Structured* toggle reads `week.defaultPlan` (DYN-5's `defaultPlanFor` behind a query) for its blocks. For the trade: C — call `confirmDay` with `tradeWithDate` on an unset day; D — `tradeWorkouts(date, withDate)`, a service that exports and reuses `ensureTrainingBlock`, `habitItem`, `workoutLength` from `confirm-day.ts` and writes both days' workout items.
**Decision:** B and D. A is four reconcilers; B keeps DYN-5's one. C would set a day nobody set; D writes the rows the quick-pick reads (its on-day workout item wins over the rotation's typical one) without touching `confirmed_at`, refuses on a set day with the weekday in the sentence, and leaves a touched item alone.
**Consequences:** Buys a sheet with no reconcile logic and a trade the quick-pick agrees with. Costs one round trip per change (the whole list each time) and three exported helpers in `confirm-day.ts`. Forecloses a per-kind write path; anything that changes a day's plan goes through `assignBlocks`.
**Revisit trigger:** DYN-9's drag between rows — the drop calls the same `tradeWorkouts`; if it needs a preview before the confirm, the service gains a dry-run flag rather than the sheet a second arithmetic.

## 2026-09-13 · DYN-13 · The orient frame is the entry tree's first branch after setup, and the wake stamp is the frame's read

**Context (as it was then):** v1.1 §5.1: the frame is shown "before any tab" the first time the app is opened after the day opens, while `woke_at` is null; opening it stamps the wake (R11). The app's entry tree (`resolveEntry`) is a pure function run by the shell layout on every shell request and by `/`; the tab bar is `AppShell`'s.
**Options weighed:** A — a client redirect from `/today` when the day has no wake. B — `resolveEntry` gains `today: { wokeAt, closed }` and returns `/orient` before the deep-link branch; `resolveEntryForRequest` reads `day.today` (widened to carry the three timestamps) once setup is complete; the layout redirects from any shell path but `/orient`; the frame's query `day.orient` stamps `woke_at` once, server-side, and returns the words. C — a fourth route group with its own gate and a page-level stamp mutation.
**Decision:** B. A shows a tab first (the thing §5.1 forbids) and stamps late; C duplicates the gate for one screen. Under B the rule is one line in the one place the rules live, the stamp is the moment the frame is served, and reloads and deep links cannot stamp twice. The read is skipped while setup is owed so the sequence stays first and `day.today`'s side effects are not paid by a person still in it.
**Consequences:** Buys the frame before any tab, once per day, with one stamp. Costs every shell request one `day.today` read after setup (cached by the same request's later reads) and the layout one more redirect branch. Forecloses a frame that can be opened without stamping.
**Revisit trigger:** a tab the frame should not precede (a deep link into a notification's item, §9) — the branch would then honour a whitelist; today nothing is exempt.

## 2026-09-13 · DYN-14 · The quick-pick is one client state over `day.quickPick`'s defaults; *Set the day* sends only the answers, and the Today page branches on the client

**Context (as it was then):** §5.3's pick is the Today tab's unconfirmed state, not a modal; every section arrives answered (DYN-5); `confirmDayInput` is all-optional and the service fills the rest; after *Set the day* the sections "settle into the list".
**Options weighed:** A — a server page that renders the pick or the list and reloads after confirm. B — `TodayScreen`, a client component fed both the day and the pick from the server for first paint, holding the pick's state in `useQuickPick` and flipping to the list when `day.get` reads a `confirmedAt`. C — per-section writes (`day.chooseRoutine`, `day.chooseFocus` …) before a final confirm.
**Decision:** B. C makes the pick a form with live writes, the thing §5.3 rules out ("nothing is live until confirmed"); A costs a reload at the one moment the document asks for a 200 ms settle. Under B the budget line is the pick's own sum, the one read before confirm is `previewFit`, and the payload is the diff plus the menu's ticks.
**Consequences:** Buys one write per morning and a live line with no round trips. Costs a client-derived trade date (the view carries a weekday word) and a `TodayScreen` that owns two `PageFrame`s. Forecloses a pick that writes as it goes.
**Revisit trigger:** DYN-15 — when the list renders by block and the header line changes at confirm, `TodayScreen` is where the 200 ms settle lands; if DYN-15 needs the day's blocks before the pick resolves, the pick's `onSet` hands over the confirmed `DayView` rather than refetching.

## 2026-09-13 · DYN-15 · The one-of switch rewrites the row; *Add from the library* is a service that lands a habit-day item in a block

**Context (as it was then):** §6.3 lets a one-of member be changed after the pick ("changing it re-flows prep"); an alternates group materialises its chosen member only (R23, DYN-5). §6.2 adds *Add from the library* as the unstructured day's primary door; WK-03's one-off has no block.
**Options weighed:** For the switch: A — materialise both members at the pick and toggle `alternates_chosen`. B — one mutation, `chooseAlternate`, that rewrites the chosen row to the other slot's habit and length and re-flows the block. For the add: C — reuse `saveOneOff` with `timeMode: "unscheduled"` (no block, *anytime*). D — `addFromLibrary({ date, habitId, blockKind })`, a row with `day_block_id`, placed after the block's last item and re-flowed, `origin = one_off`.
**Decision:** B and D. A puts an item on the day that the person did not choose (R23's rule is exactly against that). C lands the habit outside every block, which on a structured day is the wrong place and on an unstructured day is what `blockKind: null` does anyway. Under B the row keeps its id and `original_scheduled_start` — the record is annotated; under D the day reflows as the editor would.
**Consequences:** Buys a switch that keeps the record and an add that lands in the right block. Costs a row whose `habit_id` changes (the Day Review reads the row's own snapshot, so it reads the chosen member) and one more origin the item sheet treats as a one-off (*Remove* applies). Forecloses a two-row alternates group on the day.
**Revisit trigger:** DYN-19 — if the Week Review's counts need to know that a row switched members, `shifts`-style annotation is the place, not a second row.

## 2026-09-13 · DYN-17 · Adjust is four answers feeding one server preview; the late-wake offer is the server's, with four conditions and no inference

**Context (as it was then):** §6.6's sheet is a decision in four steps ending in a proposal the person approves; DYN-6 shipped `adjust.preview` (a read, fingerprinted) and `adjust.commit` (refused when the day changed). The v1.0 late offer (USE-6) inferred lateness from an untouched first item; §6.6 forbids detection and gives the offer four conditions.
**Options weighed:** A — compute the proposal on the client (the shorten-then-cut arithmetic exists in `@syn/utils`) and send the result. B — every answer change re-runs `adjust.preview` (debounced) and the sheet renders what came back; *Set* sends the same answers with the fingerprint; `CONFLICT` re-previews. For the offer: C — keep USE-6's client re-derivation and add the wake check. D — `shell.status.lateWakeOffer`, computed once per read from the day row (`woke_at_source = orient`, `confirmed_at < woke_at`, the anchor hard, no shift yet, the wake more than `LATE_WAKE_OFFER_MIN` after the target), dismissed per day on the client.
**Decision:** B and D. A is a second copy of DYN-6's arithmetic that the commit would then disagree with; under B one function computes and one fingerprint guards it. C keeps the inference the document rules out; D's four facts are all on the day row and none of them is a tap.
**Consequences:** Buys a proposal that cannot differ from what *Set* does, and an offer that fires only on the morning the document describes. Costs a round trip per answer (debounced) and a status read that carries one more boolean. Forecloses an offer that appears on an unset day (the pick already reflects the wake) or twice.
**Revisit trigger:** DYN-16's band drag — the entry passes the delta as a preset; if the drag wants the proposal drawn on the axis before the sheet opens, the preview is the same call from the Schedule.
