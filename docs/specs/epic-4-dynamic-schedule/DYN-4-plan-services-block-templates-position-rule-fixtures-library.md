# DYN-4 — Plan services: block templates by kind, the same-position rule with *one of*, fixtures, workouts and focuses, the library by block, the journal write path

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: L
**Slice type:** The write path for everything planned. One invariant (`saveSlot`'s position rule) is stated in the service and paid by every caller; the rest is kind-aware CRUD over DYN-2/3's columns. The risk class is *a template that silently stacks two things*: a save path that walks past the position rule and materialises breakfast on top of the walk.
**Vigil:** none. **Mason review:** the position invariant (AC 4–7) and the validators' cross-field rules (AC 2).

**Status:** Not started

> **Mason — invariant review.** `saveSlot` today enforces "two fixed slots at one start share a `multitask_group` or the save is refused" (`SameStartError`). This slice replaces *start* with *position* and adds a third legal answer, *one of* (`alternates_group`). Review that the rule is one function on every write path (save, move, duplicate, restore-after-undo, the migration-era `restoreSlot`), that `findCollisions` reads the same rule, that an alternates group's members are forced to share `sort_order` and `gap_before_min` and to have exactly one `alternates_default`, and that no path can leave a pinned slot with a non-zero gap.

---

## Outcome

Every plan-side thing v1.1 names can be created, listed, edited, archived, and read back as a view model: block templates of any kind with their flow and structure; slots with gaps, pins, roles, multitask brackets and *one of* groups, saved under the same-position rule; fixtures; habits with a block kind; workouts and focuses as habits with a rotation; and the journal entry for a day. The library lists by block, then category. `SlotView.startClock` is derived by `stackBlock` in the mapper, never stored. After this ships, **DYN-5 can materialise from block templates and fixtures, DYN-8 can build the block editor over `template.*`, and DYN-10/11 can save what first run collects.** No day rows are written here (DYN-5); no screen changes (DYN-8+); `offset_*` are no longer written by anything.

## Why / intent

- **v1.1 §3.2** — gaps and pins; **§3.4** — routines as stack or opener · pool · closer; **§3.5** — "an alternates group extends the block editor's same-start question from two answers to three"; **§3.6** — fixtures and one-offs; **§3.7** — the rotation; **§3.8** — focus and work template; **§4.15** — the library holds habits only, grouped by block then category, the habit sheet gains a block chip and loses the type segment; **§7.2** — the journal autosaves per field; **§11.5** — "`save-slot.ts`: the same-start rule becomes a same-position rule with three answers … refuses otherwise with a `SamePositionError` carrying both options … an alternates group's members must have `sort_order` equal and `gap_before_min` equal, enforced in the service, not the sheet."
- **TD-1, TD-3, TD-4, TD-7, TD-8.**
- **`../README.md` § Placement rules 3, 4, 5, 7** — routers by domain, services `<verb-noun>.ts`, view mapping in the API, one Zod schema per form and procedure.
- **Ground truth (consumed, never rebuilt):** `services/plan/{save-slot,templates,to-view,most-used-template}.ts`; `services/library/{save-habit,list-habits,to-view,archive-habit,habit-usage,starter-set}.ts`; `routers/{template,habit}.ts`; `validators/{template,habit,week}.ts`; DYN-1's unions, `stackBlock`, `STARTER_LIBRARY`; DYN-2/3's columns.
- **What this slice is NOT (binding):** it does not write `days`, `day_blocks`, or `day_items` (DYN-5 — except `journal_entries`, which is a day-keyed table with no materialisation and belongs here because the journal screen and the orient frame's read both need it before DYN-5's confirm exists). It does not build a screen. It does not remove `apply-shift`/`apply-trim` or `STARTER_HABITS`.

**Rulings this slice makes (labelled, logged):**

- **The same-position rule.** Two slots at one *position* (same `sort_order` in the stack, or both pinned at the same `pinned_at`) must share a `multitask_group` **or** an `alternates_group`; otherwise `SamePositionError { withSlotId, withTitle, position }`. The caller answers with `multitaskWith` or `alternatesWith` on the next save. A slot may not be in both. Logged.
- **Alternates members are kept structurally identical by the service:** on any write to a member, the service copies `sort_order`, `gap_before_min`, `pinned_at`, and `role` to the other member(s); `alternates_default` is set on the written member when the input says so and cleared on the others; a group with no default gets its first member as default. Logged.
- **`sort_order` is dense and owned by the service.** `moveSlot` swaps positions; `saveSlot` of a new slot appends at `max + 1`; `removeSlot` closes the gap; a bracket or alternates group moves as one position. No caller sends `sort_order`. Logged.
- **A pinned slot's gap is forced to 0 on write** (the DB check would refuse otherwise; the service normalises so the sheet never sees the check). Logged.
- **`template.create` takes `{ kind }`** and defaults `flow` from the kind (`prep`, `wind_down` → `backward`; else `forward`) and `structure` to `stack`; `anchor_time` is null except for `kind = work`, where it defaults from `users.work_start_time`. Logged.
- **Workouts and focuses go through `habit.*`** with `type: workout` / `deep_work` and the two rotation fields; `habit.list` gains `{ blockKind?, types? }` filters; the library screen and the block screens are different filters over one procedure. Logged.
- **The habit sheet's `type` field is dropped from `habitFormSchema`'s public shape**: the library creates `habit`; the training screen creates `workout`; the focus screen creates `deep_work`; one-offs and fixtures create `task_appointment` through their own sheets. `type` is set by the calling procedure, never by the form (W6). Logged.
- **`journal.save` is an upsert per `(day_id)` merging one key at a time** (`{ date, key, value }`), so autosave on a single field never overwrites another field written from a second device. Logged.

## Behavior & states

**No surface.** Described by procedures, their inputs, and the states of the rows they write.

### Validators — `packages/validators/src/`

- **`block.ts`** (new; `template.ts` keeps `templatePatchSchema` and the leave schema, gains `kind`/`flow`/`structure` on the patch): `blockKindSchema`, `blockFlowSchema`, `blockStructureSchema`, `slotRoleSchema`; `createTemplateInput { kind }`; `slotFormSchema` **replaced**: `{ templateId, slotId?, habitId, timeMode, durationMin (1–480), gapBeforeMin (0–GAP_MAX), pinnedClock: clockTimeSchema | null, role, priorityOverride, scheduling, windowMin?: number (window length; only for `window`), multitaskWith?: uuid, alternatesWith?: uuid, alternatesDefault?: boolean }` with `superRefine`: `pinnedClock` set → `gapBeforeMin` must be 0 (message *Pinned things have no gap before them.* `[COPY — needs Vesper sign-off]`); `role ≠ stack` only when the template's `structure` is `opener_pool_closer` (checked in the service, since the validator has no template); `multitaskWith` and `alternatesWith` mutually exclusive. `restoreSlotInput` re-shaped to the new columns. `moveSlotInput` unchanged.
- **`fixture.ts`** (new): `fixtureFormSchema { id?, title (1–FIXTURE_TITLE_MAX, *Give it a title.*), weekdays: weekdaySchema[] (min 1, *Pick at least one day.* `[COPY]`), atClock, durationMin, blockKind: enum ["work","activity"] default activity, scheduling default hard, habitId? }`; `fixtureIdInput`.
- **`habit.ts`** amended: `habitFormSchema` loses `type`, gains `blockKind: blockKindSchema.nullable()`; new `rotationHabitSchema { id?, title (1–WORKOUT_TITLE_MAX / FOCUS_TITLE_MAX), weeklyTarget (1–7), typicalDays: weekdaySchema[] | null, durationMin/Max? (workouts only) }`; `listHabitsInput { includeArchived?, blockKind?, types?: ItemType[] }`.
- **`journal.ts`** (new): `journalSaveInput { date: dateKeySchema, key: string (1–60), value: string (≤ JOURNAL_ANSWER_MAX) }`; `journalGetInput { date }`; `journalPromptsSchema` (array ≤ JOURNAL_PROMPTS_MAX of `{ key, label ≤ JOURNAL_PROMPT_MAX }`, keys unique) — used by `user.updatePreferences`.
- **`preferences.ts`** amended: the profile columns from DYN-3 (`scheduleShape`, `workDays`, `workStartTime`, `workEndTime`, `anchorDirection`, `earliestWakeTime`, `lightsOutTime`, `devicesOffTime`, `overflowMode`, `orientPassage ≤ ORIENT_PASSAGE_MAX`, `orientShowLastNight`, `orientAskGratitude`, `journalEnabled`, `journalPrompts`, `blockOrder`) as optional fields of the existing preferences patch; `blockOrder` validated as a permutation of the non-placeable kinds (*Every block once.* `[COPY]`); `devicesOffTime`, when both set, must be ≤ `lightsOutTime` in wall-clock order allowing midnight wrap (message `[COPY — needs Vesper sign-off]`).

### Services — `packages/api/src/services/`

- **`plan/save-slot.ts`** rewritten: `saveSlot(rls, userId, input)` → loads the template (kind, structure), normalises (pin → gap 0; role → stack unless structure allows), resolves position (a new slot appends; an edit keeps its position unless `pinnedClock` changed), runs the **position rule**, writes, then syncs alternates members. Exports `SamePositionError`, `findCollisions(slots)` (same rule, read side), and `positionOf(slot)`.
- **`plan/templates.ts`** amended: `createTemplate({ kind })`, `listTemplates({ kind?, includeArchived? })`, `duplicateTemplate` (copies the new columns, regenerates local group ids), `moveSlot` (position-aware), `removeSlot`/`restoreSlot` (dense reorder; restore re-runs the position rule).
- **`plan/to-view.ts`** amended: `toSlotView` computes `startClock`/`endClock` by running `stackBlock` over the template's slots with `anchorMin` from the profile for the kind (wake → forward; work start → backward for prep; lights-out → backward for wind-down; work start → forward for work; 0 for training/break/orient/activity, which are placed per day) — one call per template, not per slot; `toTemplateSummaryView` adds `kind`, `flow`, `structure`, and `totalMin` from the same walk.
- **`plan/fixtures.ts`** (new): `saveFixture`, `listFixtures`, `archiveFixture`, `restoreFixture`, `toFixtureView`.
- **`library/save-habit.ts`** amended: `type` from the caller (`"habit"` from `habit.create`, set by `habit.createWorkout` / `habit.createFocus`); `block_kind`, `weekly_target`, `typical_days` written; **the range-shrink warning stays** (LB-02) but **no clamp anywhere**.
- **`library/list-habits.ts`** amended: filters; grouping key `(block_kind, category)`; `toHabitSummaryView` adds `blockKind`, `weeklyTarget`, `typicalDays`.
- **`library/starter-library.ts`** (new): `createFromStarterLibrary(rls, userId, { blockKind, titles[] })` writing habits with `block_kind` from `STARTER_LIBRARY`; `starter-set.ts` stays until DYN-21.
- **`day/journal.ts`** (new): `saveJournalAnswer` (upsert-merge one key), `getJournalEntry(date)`, `getLastNight(todayKey)` → the previous day's entry (by date, not by "yesterday" — the day before `todayKey` in the person's key space, via USE-1's `daysBefore`).
- **`user/preferences.ts`** amended: reads and writes the new columns; `blockOrder` default from `DEFAULT_BLOCK_ORDER` when null (it never is after `0005`, but the reader tolerates it).

### Routers

- `template`: `create({ kind })`, `list({ kind?, includeArchived? })`, `get` (returns `kind`, `flow`, `structure`, `anchorTime`, slots as `SlotView` with derived clocks), `update` (patch gains `kind`, `flow`, `structure`, `anchorTime` nullable), `saveSlot` (throws `CONFLICT` with the `SamePositionError` payload — the same shape USE/SET-5 established for `same_start`, renamed), `moveSlot`, `removeSlot`, `restoreSlot`, `duplicate`, `archive`, `restore`, `discardIfEmpty` — all existing names kept.
- `fixture` (new): `list`, `save`, `archive`, `restore`.
- `habit`: `list` (filters), `create` (type `habit`), `createWorkout`, `createFocus`, `update` (rotation fields allowed only for `workout`/`deep_work` — service refuses otherwise with `BAD_REQUEST`), `createFromStarterLibrary({ blockKind, titles })`; everything else unchanged.
- `journal` (new): `get({ date })`, `save({ date, key, value })`, `lastNight()`.
- `user.updatePreferences`: the widened patch.
- `root.ts`: mount `fixture`, `journal`.

**States (exhaustive):** per row — a template of each kind, each structure; a slot stack / opener / pool / closer, pinned or not, in a bracket or a group; a fixture active / archived; a habit of each type with or without a rotation; a journal entry empty / partial / full.

**Failure / edge states:** `saveSlot` with `alternatesWith` naming a slot already in a multitask bracket → `BAD_REQUEST` *That one is already a multitask.* `[COPY]` · `alternatesWith` naming a slot in another alternates group → joins that group (three-way *one of* is legal; the DB has no cap; the sheet shows tabs) · a `role: pool` slot on a `stack` template → the service sets `stack` and returns the normalised row · `moveSlot` across a pin → the pin does not move; the moving slot lands on the other side of it · `removeSlot` of an alternates member leaving one → the survivor's `alternates_group` is nulled and `alternates_default` cleared · `restoreSlot` after the other member was edited → re-syncs from the survivor · `habit.update` setting `blockKind` on a habit in a template of another kind → allowed; the template keeps the slot (a habit's block is a default, v1.1 §11.3) · `journal.save` for a future date → `BAD_REQUEST` (journals are written on their day or after; the orient frame reads only the past) · `fixture.save` with `weekdays` that no planned day matches → fine; materialisation is DYN-5's.

## Non-negotiables (this slice)

- **One position rule, in the service, on every write path.** Save, move, duplicate, restore, migration-era restore. `findCollisions` reads the same rule.
- **`offset_start_min` / `offset_end_min` are never written after this slice.** Read-only until `0006` drops them.
- **A pin has no gap; alternates members are structurally identical; `sort_order` is dense.** Normalised by the service, never trusted from input.
- **`startClock` is derived by `stackBlock`, once per template, in the mapper.** No stored start, no second walk.
- **The habit form never sets `type`; the calling procedure does** (W6).
- **No clamp to a range** anywhere in these validators (R21).
- **Every read and write through `ctx.rls.execute()`, `user_id` from the session.**

## Data & AI

**Schema changes: none** (DYN-2, DYN-3 complete).

**Tables:** `templates` (read, insert, update) · `template_slots` (read, insert, update, delete) · `habits` (read, insert, update) · `fixtures` (read, insert, update) · `journal_entries` (read, upsert) · `users` (read, update — preferences) · `days` (read only, for `journal.save`'s date check and `lastNight`).

**Placement:** `packages/validators/src/{block,fixture,journal,habit,preferences,template}.ts` + barrel (rule 7); `packages/api/src/services/plan/{save-slot,templates,to-view,fixtures}.ts`, `services/library/{save-habit,list-habits,to-view,starter-library}.ts`, `services/day/journal.ts`, `services/user/preferences.ts` (rule 4); `packages/api/src/routers/{template,habit,fixture,journal,user}.ts` + `root.ts` (rule 3). Mason's call: `journal.ts` under `services/day/` because its key is a day.

**tRPC / validators:** as listed in *Routers* and *Validators*.

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — local tier, smoke account; procedures called through the server caller in a throwaway script under `$TMPDIR`)

1. `template.create({ kind: "prep" })` returns a row with `flow = backward`, `structure = stack`, `anchor_time = null`; `{ kind: "work" }` has `anchor_time = users.work_start_time` (or null when unset); `template.list({ kind: "morning" })` returns only morning templates.
2. **Validators.** `slotFormSchema` refuses `pinnedClock` with `gapBeforeMin: 5`; refuses `multitaskWith` and `alternatesWith` together; accepts `durationMin: 90` for a habit whose range is 10–30 (no clamp); `fixtureFormSchema` refuses empty `weekdays`; `preferences` refuses a `blockOrder` missing `wind_down` and one with `training` in it; `journalSaveInput` refuses a 2001-char value. *(Mason.)*
3. `template.saveSlot` on a stack of three appends at `sort_order 3`; `moveSlot(up)` swaps 3 and 2; `removeSlot` of position 1 leaves `0, 1, 2` dense; `restoreSlot` puts it back at 1 and re-densifies.
4. **Position rule — refused.** Save a second slot with `pinnedClock: "08:00"` when one exists at 08:00 with no group → `CONFLICT` whose payload names the occupant and `position`. *(Mason.)*
5. **Position rule — multitask.** The same save with `multitaskWith: <occupant>` → both share a `multitask_group`, same `sort_order`, gap 0. *(Mason.)*
6. **Position rule — one of.** The same save with `alternatesWith: <occupant>, alternatesDefault: true` → both share an `alternates_group`, identical `sort_order`/`gap_before_min`/`pinned_at`/`role`, the new one `alternates_default = true`, the occupant `false`; editing the occupant's gap to 10 updates both; `template.get` returns each with `alternates.otherTitle` / `otherDurationMin` and `isDefault`. *(Mason.)*
7. **Position rule — read side.** Insert by SQL two loose slots at one position; `template.get` reports them in `collisions` (the existing shape) and `findCollisions` names the pair. *(Mason.)*
8. `template.get` for Taylor's prep template (breakfast one-of 10/30 default 10, walk 15) with `users.work_start_time = 09:00` returns `startClock` `8:35` / `8:50` (backward from 9:00 with the default member); after `alternatesDefault` moves to the 30-min member, `8:15` / `8:45`.
9. `template.duplicate` of a template with a bracket and a one-of group produces new local ids for both, identical structure.
10. `fixture.save({ title: "Stand-up", weekdays: [1], atClock: "09:30", durationMin: 20, blockKind: "work" })` → a row; `fixture.list` → `FixtureView` with `atClock "9:30"`; `archive` hides it from `list` unless `includeArchived`.
11. `habit.createWorkout({ title: "Push", weeklyTarget: 2, typicalDays: [0, 3], durationMin: 60 })` → `type = workout`, `block_kind = training`; `habit.createFocus({ title: "Viewpoint", weeklyTarget: 2 })` → `type = deep_work`, `block_kind = work`; `habit.update` setting `weeklyTarget` on a `habit`-type row → `BAD_REQUEST`; `habit.list({ blockKind: "morning" })` excludes both; `habit.list({ types: ["workout"] })` returns Push. *(Mason.)*
12. `habit.create` from the library sheet with no `type` in the input → `type = habit`; the validator has no `type` field (compile-time check: `HabitFormInput` has no `type` key).
13. `habit.createFromStarterLibrary({ blockKind: "wind_down", titles: ["Read", "Stretch"] })` → two habits with `block_kind = wind_down` and the library's ranges; a title not in the library is refused.
14. `journal.save({ date: today, key: "gratitude_today", value: "the walk" })` then `{ key: "visualisation", value: "…" }` → one row with both keys; `journal.get(today)` returns both with the person's prompts; `journal.lastNight()` on the next day key returns it; `journal.save` for tomorrow → `BAD_REQUEST`. *(Mason.)*
15. `user.updatePreferences({ workDays: {...}, anchorDirection: "depends", lightsOutTime: "22:45", devicesOffTime: "22:15", journalPrompts: [...] })` round-trips through `user.me`; `devicesOffTime: "23:00"` with `lightsOutTime: "22:45"` is refused.
16. As user B, `template.saveSlot` naming A's template is `NOT_FOUND`; `fixture.archive` on A's fixture is `NOT_FOUND`; `journal.get` for A's day returns B's (empty) entry, never A's. *(Mason.)*
17. `grep -rn "offsetStartMin\|offset_start_min" packages/api/src packages/validators/src` returns only reads in `to-view.ts`/`get-day.ts` transition code marked `// DEPRECATED until 0006` — no writes.
18. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Keep `SamePositionError`'s shape parallel to `SameStartError`'s so the slot sheet's existing `InlineQuestionRow` wiring (DYN-8) changes one branch: `{ code: "same_position", withSlotId, withTitle, position: { sortOrder, pinnedClock } }`.
- Run `stackBlock` once in `toTemplateView` and index the result by slot id; `toSlotView` then reads a map. The anchor minutes for each kind come from `readPreferences` — pass them in, don't read `users` inside the mapper.
- The journal upsert: `INSERT … ON CONFLICT (day_id) DO UPDATE SET answers = journal_entries.answers || EXCLUDED.answers` — jsonb concatenation is the merge.
- `getLastNight` keys off `daysBefore(todayKey, 1)`; a person who journals at 00:30 on Tuesday wrote on Monday's day (USE-1's boundaries), which is what "last night" means.

## Dev's call

Whether alternates groups allow more than two members in the validator (the DB allows it; recommend allowing, the sheet caps at two for now) · the exact `CONFLICT` payload field names · whether `fixture` and `journal` are separate routers or sub-routers of `template`/`day` (recommend separate; rule 3 says one per domain and both are domains).

## Out of scope

- **Materialising fixtures, blocks, or pools onto a day** — DYN-5.
- **The block editor, the library screen, the fixture sheet, first run** — DYN-8, DYN-10, DYN-11.
- **`confirmDay`, `adjustDay`, `doNow`, habit-day edits** — DYN-5, DYN-6.
- **The orient frame reading `lastNight`** — DYN-13.
- **Removing `saveSlot`'s deprecated offset reads, `STARTER_HABITS`, `starter-set.ts`** — DYN-21.

## Depends on

- **DYN-3** — every column written here. Complete in `PROGRESS.md`. (DYN-1 and DYN-2 transitively.)

## Recommended execution

**Opus.** The position rule with three answers, the alternates sync, dense ordering across brackets and pins, and derived clocks in one walk are four invariants that interact; a cheaper model gets each right alone and lets `moveSlot` carry a bracket member past its partner, which the DB cannot refuse and the editor cannot see until the day is laid out with breakfast twice.

---

### Kickoff (paste into the session)

> Build **DYN-4 — Plan services** (attached spec). Model: **Opus**. **One position rule in the service on every write path; a pin has no gap; alternates members are structurally identical; `sort_order` is dense; `startClock` derived by `stackBlock` once per template; no clamp; offsets never written again.**
> Attach/read first, in order: this spec · v1.1 §3.2, §3.4–§3.8, §4.15, §7.2, §11.3–§11.6, §11.10 · this track's `TECHNICAL-DECISIONS.md` TD-1, TD-3, TD-4, TD-7, TD-8 · `docs/specs/README.md` § Placement rules 3, 4, 5, 7 · `docs/ai-guides/trpc-foundation-patterns.md` · `packages/api/src/services/plan/{save-slot,templates,to-view}.ts` (rewrite the first; amend the rest) · `services/library/{save-habit,list-habits,to-view}.ts` · `services/user/preferences.ts` · `routers/{template,habit,user}.ts`, `root.ts` · `packages/validators/src/{template,habit,week,preferences}.ts` · DYN-1 (`stackBlock`, the unions, `STARTER_LIBRARY`) · `packages/db/SCHEMA_REFERENCE.md` (plan, library, day, user groups after `0005`) · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (this track's, Epic 1's).
> Run the AC probes through the server caller in a throwaway script under `$TMPDIR`; paste outputs; delete it. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
