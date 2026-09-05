# SET-6 — Week build and materialisation: the day materialiser, WK-01/02/03, TP-04, copy last week, and the day's two doors

**Epic:** SET — Setup · **Phase 3** · Size: L
**Slice type:** The write path that turns plans into records. One service (`materializeDay`) is called from five surfaces and must be idempotent, zone-correct, and respectful of anything a person already touched. The risk class is *a rewritten record*: a re-materialisation that replaces a done item, an anchor change that moves a `done_at`, a template swap that deletes a started task.
**Vigil:** none. **Mason review:** the materialiser (AC 9–13) — the keep rules are the ticket.

**Status:** Not started

> **Mason — materialiser review.** Four write paths converge on `services/day/materialize-day.ts`: apply a template, change the anchor, remove the template, re-apply after a template edit (TP-04). Each has a keep rule in cross-cutting §8.1 and Epic 1 WK-01/WK-02/TP-04. Review that the predicate for "untouched" is one function used by all four, and that the zone and DST arithmetic is USE-1's, not a local copy.

---

## Outcome

A person can plan a week: see seven days Monday-first, tap one, choose a template (with its target status and the most-behind marker), change the day's start, add one-off items, remove the template, or copy last week. The moment a template is applied, that day's items exist at absolute times in the person's zone, so tomorrow's list is real before tomorrow. Editing a template already in use asks the three-way question and re-materialises only what nobody has touched. From an empty day on the List, *Plan this day* and *Add a one-off* open these same sheets for today. After this ships, **the List has data to render** (USE-2), and the seeded *Morning* template can be applied to the current week.

## Why / intent

- **Official spec §4.5** — Monday-first; the picker shows target status and the typical-days hint; the most-behind template gets one small marker, not a sort; one-offs are `hard` by default with a fixed time, `soft` otherwise; **applying materialises immediately**; editing an applied template asks *Apply to this week's planned days too?* — three options.
- **Official spec §3.6, §3.7** — a day with no template is an empty day; `anchor_time` is the applied start; `original_scheduled_start` never changes; `origin` and the snapshots.
- **Official spec §6.6** — resolved priority `slot.priority_override ?? habit.life_priority`, written to `day_items.priority` at materialisation.
- **Epic 1 §6 (WK-01, WK-02, WK-03) and §5 (TP-04)** — every read, interact, state; the materialisation rule stated once in WK-01; the re-materialisation rules in TP-04; the keep rules in WK-02.
- **Cross-cutting §7.1, §7.2** — a Day is keyed by its date in the stored zone and runs `day_close_time` to `day_close_time`; scheduled times are absolute timestamps computed from the day's anchor in that zone; spring-forward moves a missing wall-clock time to the first minute after it; fall-back never repeats.
- **Cross-cutting §8.1, §9.3 (G4)** — week plan editability by day tense; one-offs from the day header go under the day part of their time or *Anytime*; a future date from WK-03 goes to that day's plan (the *Day* field, default today, label *Day*).
- **USE-1 (Complete required)** — `resolveDayKey`, `wallClockToInstant`, `dayWindow`, `weekOf`/`mondayOf`, `isPast`/`isFuture` relative to the person's current day. **Consumed, never re-derived here.**
- **Ground truth:** SET-5's templates and `template.get`; SET-4's habit sheet and `habit.list`; the `days`, `day_items` tables; `weekKeySchema`/`dateKeySchema` in `@syn/validators`; `settingsWeekRoute(week?)`; `PickerList` (`marker` prop is the most-behind nudge), `ListRow`, `ResponsiveSheet`, `ThreeOptionDialog`, `ConfirmDialog`, `CollapsiblePanel`, `DateField`, `TimeField`, `SegmentedControl`, `MinutesStepper`, `Stepper17`, `EmptyState`, `SaveStatusText`, `AppHeader`, `ScreenFrame width="canvas"`.
- **What this slice is NOT (binding):** it does not render the List (USE-2), does not compute item *state* (USE-1 owns derivation; this ticket writes rows), does not build the day header sheet (USE-3) — it provides the two sheets that sheet's *Add a one-off* row and LS-00's actions open.

**Rulings this slice makes (labelled, logged):**

- **One materialiser, four callers.** `materializeDay(rls, userId, { date, templateId | null, anchorTime? })` computes the desired item set from the template's slots and reconciles against existing rows keyed by `template_slot_id`: untouched rows are updated in place (times, duration, priority, scheduling, snapshots), missing slots are inserted, rows for removed slots are deleted **if untouched**, and touched rows are left exactly as they are. `changeDayAnchor` and `applyTemplateChanges` (TP-04) are the same function with a different input. Logged (`TECHNICAL-DECISIONS.md`).
- **"Untouched" is one predicate,** `isUntouchedItem(row)`: `assignment_state = assigned` AND `completion_state = upcoming` AND `deferred_at IS NULL` AND `done_at IS NULL` AND no `timer_sessions` AND no `misses`, on a day with `closed_at IS NULL`. Exported from `services/day/untouched.ts`; SET-4's re-snapshot rule and every later ticket use it. Logged.
- **A removed template's touched items survive as one-offs** with `origin` left as `template`, `template_slot_id` nulled, and the day's `template_id` nulled; the row gains no new column — the "*from {template}*" note the document mentions is rendered by joining the template name through the slot… which is now null. **Therefore:** `day_items` gets no new column; the note reads *from a removed template* `[COPY — needs Vesper sign-off]`, or the builder adds `template_name_snapshot` with a deviation line. **Recommended: add the column** (`text null`, set at materialisation) — it is honest and cheap. `[Mason call: add it in this ticket as migration `0002` with a journal entry; log it.]` Logged.
- **Multitask groups get one `multitask_id` per group per day** (a fresh uuid per materialisation, stable across re-materialisation by matching the slot group). Logged.
- **Copy last week copies templates and anchors only**, never one-offs, and overwrites already-planned days only after the additional confirmation line. Logged.
- **WK-03's *Day* field appears only when opened from the day header or LS-00** (the `allowDateChange` prop); from WK-02 the day is fixed. Logged.
- **A same-start one-off asks the multitask question against the day's items** and, on *Yes, multitask*, joins (or creates) the existing item's `multitask_id`. Logged.
- **`week.get` derives `status`** (`planned` when any day has a template or a one-off) — the `WeekPlanStatus` type, no table. Logged in SET-1.

## Experience & states

### The materialiser (no surface)

Given `{ date, templateId, anchorTime }`:

1. Upsert `days` on `(user_id, date)` with `anchor_time`, `template_id`, and — on insert only — `timezone` and `day_close_time` snapshotted from the user's current values (after the pending-pair is applied, USE-1). A day that already exists keeps its snapshots.
2. Read the template's slots. For each slot compute `scheduledStart = wallClockToInstant(date, anchorMinutes + offsetStartMin, day.timezone)` (USE-1 resolves a missing wall-clock time forward), `scheduledEnd` = start + duration for `fixed_time`, `= wallClockToInstant(… offsetEndMin …)` for `window`, both null for `unscheduled`. `original_scheduled_start = scheduledStart` on insert only.
3. Reconcile: match existing rows by `template_slot_id`; update untouched matches; insert new; delete untouched rows whose slot is gone; skip touched rows entirely.
4. Assign `multitask_id` per `multitask_group`; `priority = priority_override ?? life_priority`; snapshots from the habit (`title`, `icon`, `quantity_unit`, `reflection_axes`, `notes_preflight`, `type`); `origin = template`; `scheduling` from the slot.
5. Return `{ dayId, inserted, updated, deleted, kept }` for the caller's copy (*Applied to {n} days.*).

`removeTemplateFromDay`: `template_id = null`; delete untouched template items; keep touched ones (slot id nulled, `template_name_snapshot` retained). `changeDayAnchor`: step 1 with the new anchor, then steps 2–4 (touched items keep their `done_at`; their `scheduled_*` **do** recompute per WK-02 — "the done ones keep their `done_at`; scheduled times still recompute" — so for anchor changes the update applies to *all* template-derived items' `scheduled_start/end` but never to `original_scheduled_start`, `done_at`, sessions, or states). `[Mason: this is the one place "touched" rows are written; keep it to the two time columns.]`

### WK-01 Week build (`/settings/week`, `/settings/week/{week}`)

`ScreenFrame width="canvas"`. `AppHeader` title *{Mon date} – {Sun date}* with `saveStatus`, `action` slot holds *Previous* · *Next* · *This week* (three ghost buttons; *This week* only when not on it), `onBack`. Under the header, the targets line when any template has a target: *{name} {used} of {target}* per targeted template, the most-behind one carrying the marker (a 6px `accent-mark` dot before the name with `sr-only` *most behind*). Unplanned week: *Pick a template for each day you want planned. Days you leave empty are empty.* Seven day rows (`ListRow`, stacked on compact; a seven-column grid of the same rows on wide): weekday and date · *Today* tag · template name or *Nothing planned* (muted) · *starts {time}* · *+{n} one-off* · past days `muted`. Beneath: *Copy last week* (ghost, hidden when last week was unplanned) · *Templates* link. Row tap → WK-02.

`/settings/week` resolves to the current week's key (USE-1's `weekOf(resolveDayKey(now))`) and renders without redirect; `/settings/week/{week}` validates the key.

### WK-02 Day sheet

`ResponsiveSheet` title *{Weekday} {date}* (+ *Today* tag). *Template* field: `PickerList presentation="inline"` with `noneLabel="None"`, `createLabel="New template"` → the template editor in a stacked screen (compact) / panel (wide) returning here, rows `meta` *{n} items · {total} min* + *{used} of {target}* + typical days, `marker` on the most-behind; archived absent unless it is the current value (*{name} (archived)*, disabled). Selecting applies immediately (`materializeDay`); selecting *None* on a day with touched items shows the inline keep line first: *{n} items already started or done stay on the day.* then applies. *Starts at* (`TimeField`, helper *Defaults to the template's start.*) → `changeDayAnchor`. Section *One-offs*: `ListRow`s (icon · title · time · *Fixed*/*Flexible*) → WK-03 edit; *Add a one-off* → WK-03 create. `CollapsiblePanel` *This day* (collapsed) with helper *This is what the List will show.* — the materialised list read-only (icon · title · time · duration). Footer: *Remove template* (ghost, only when applied) → `ConfirmDialog` *Remove {name} from {day}?* / *Untouched items are removed. Started or done items stay.* — **Keep** · **Remove** · *Done* (primary, closes). Past day: template and start disabled; one-offs editable.

### WK-03 One-off sheet

`ResponsiveSheet` *Add a one-off* / *Edit one-off*, dirty guard. *What*: a `SegmentedControl` *From my habits* · *Just a title* `[COPY — needs Vesper sign-off: the document says "a picker … and Just a title (a text field)"; the segment labels are inferred]` → `PickerList` grouped as LB-01 **or** `Input` (1–60, *Give it a title.*) with helper *It won't be added to your habits.* and a link *Save to habits instead* → the habit sheet (type Task) returning with it selected · *Day* (`DateField`, only with `allowDateChange`, default today) · *When* (`SegmentedControl` as TP-03) · *Starts at* / *Between–and* (`TimeField`s, absolute on this day; default now rounded up to 15 min if today, else 09:00) · *Takes* (`MinutesStepper`, optional; bounded when a habit is chosen) · *Timing* (default Fixed) · *Priority* (`Stepper17`, library default or 4) · *Cancel* · *Save*. Same-start collision → the inline question against the day's items.

Writes a `day_items` row: `origin = one_off`, `habit_id` or null, `type` from the habit or `task_appointment`, snapshots, `scheduling` from Timing, times via `wallClockToInstant`. Creates the `days` row if absent (no template).

### TP-04 Apply-changes dialog

Trigger: leaving TP-02 (`onLeave`) after any change in the session when `template.get().appliedDays > 0` over the current and future weeks. `ThreeOptionDialog` title *Apply these changes to planned days?* · body *{name} is applied to {n} days: {day list}. Items already done or reviewed on those days are kept as they are.* · **All planned days** (default) · **Only days from tomorrow** (secondary) · **Don't apply** (ghost). Applying calls `materializeDay` for each day in scope; the caller's header shows *Applied to {n} days.* as `subtitle` for 4 s. Error: *Couldn't update the days. The template is saved; try again from the week.*

### The two doors (for USE-2 / USE-3 to open)

`components/week-build/` exports `DaySheet` (WK-02) and `components/one-off-sheet/` exports `OneOffSheet` (WK-03) with `{ date, open, onOpenChange, allowDateChange?, onSaved }`. LS-00's *Plan this day* opens `DaySheet` for today; *Add a one-off* and DH-01's row open `OneOffSheet` for today with `allowDateChange`. This ticket wires neither door (the List does not exist); it ships the exports and a Storybook-free smoke via WK-01.

**States (exhaustive):** WK-01: unplanned · partial · fully planned · past week · loading (row skeletons) · offline (read-only, line) · autosave error (as TP-02). WK-02: no template · applied · past day · loading · applying · offline. WK-03: create · edit · saving · error · collision-question · offline. TP-04: idle · applying · error.

**Failure / edge states:** applying a template whose habit was archived after the template was built (slots already removed by SET-4 — nothing to do) · a template archived after being applied → WK-02 shows it as current with *(archived)*; the picker offers others · the anchor moved such that an item's wall-clock time lands in a spring-forward gap → USE-1 resolves forward; the row reads its new time · a date key for a week with no `days` rows → seven virtual rows, nothing written until a tap · `Copy last week` when last week had one-offs only → hidden (unplanned means no template on any day).

## Non-negotiables (this slice)

- **A touched item is never replaced, deleted, or re-snapshotted by materialisation.** The predicate is one function; every write path uses it.
- **`original_scheduled_start` is written once.** The DB trigger enforces it; the service never includes it in an update set.
- **Absolute times come from USE-1's `wallClockToInstant` with the day's snapshotted zone.** No local date arithmetic; no `new Date(y, m, d, h)`.
- **Applying is immediate.** No lazy materialisation, no "materialise on open".
- **Monday-first, everywhere.** `typical_days` and the week grid agree on Mon = 0.
- **Every read and write through `ctx.rls.execute()`, with `user_id` written from the session, never the input.**

## Data & AI

**Schema changes: one column** — `day_items.template_name_snapshot text null` (migration `0002`, journalled; a human applies to hosted tiers). Log in `DEVIATIONS.md`.

**Tables:** `days` (upsert, update) · `day_items` (insert, update, delete — untouched only) · `templates`, `template_slots`, `habits` (read) · `timer_sessions`, `misses` (read, for the predicate) · `users` (read zone, close time, usual wake).

**Placement:** router `packages/api/src/routers/week.ts` (rule 3); services `services/day/{materialize-day,untouched,change-day-anchor,remove-template,save-one-off,remove-one-off,copy-week,week-view,apply-template-changes}.ts` (rule 4); validators `packages/validators/src/week.ts` (`applyTemplateInput`, `changeAnchorInput`, `oneOffFormSchema`, `copyWeekInput`, `applyChangesInput`); feature folders `apps/web/components/week-build/` (WK-01 canvas + WK-02 `DaySheet`) and `components/one-off-sheet/` (rule 9); TP-04 as `components/template-editor/apply-changes-dialog.tsx` (it belongs to the editor's leave flow); pages replace the two week placeholders.

**tRPC / validators:** `week.get({ week })` → `{ days: DayPlanView[7], targets, status, lastWeekPlanned }` · `week.applyTemplate({ date, templateId, anchorTime? })` · `week.removeTemplate({ date })` · `week.changeAnchor({ date, anchorTime })` · `week.addOneOff` / `week.updateOneOff` / `week.removeOneOff` (returns the payload for undo) · `week.copyLastWeek({ week, overwrite })` · `week.dayPreview({ date })` → items · `template.applyChanges({ templateId, scope })` (added to the template router, calling the service here) · `template.appliedDays({ templateId })` → `{ count, dates }`.

**AI notes:** **None.**

## Accessibility

- The seven-column grid on wide is still a list in DOM order (Mon → Sun); columns are CSS, not a `table`.
- The most-behind marker carries `sr-only` text (*most behind*); the marker is never the only carrier.
- Day rows announce weekday, date, template or *Nothing planned*, and *Today*.
- WK-02's inline picker is a listbox; *None* is first and *New template* last, both reachable by arrow keys.
- The *This day* preview is a `CollapsiblePanel` with the count in its trigger's accessible name.
- Time fields use the native picker (cross-cutting §3.3).

## Acceptance criteria (observable — local tier, smoke account, zone `America/Vancouver`; run once on a DST-transition date via a fixed clock or a SQL-inserted day)

1. `/settings/week` shows the current week Monday-first with *Today* on the right row; *Previous* / *Next* move weeks; *This week* appears only away from it; `/settings/week/2026-W99` is 404.
2. Tapping Wednesday → WK-02 → picking *Morning* materialises: a `days` row with `timezone` and `day_close_time` snapshotted, five `day_items` with `scheduled_start` at the anchor + offsets in Vancouver (verify the UTC values), `original_scheduled_start = scheduled_start`, `priority` resolved, `origin = template`, `title`/`icon` snapshotted, `template_name_snapshot = 'Morning'`. *(Mason.)*
3. The targets line shows *{name} {used} of {target}* for targeted templates and the marker on the most-behind one; the WK-02 picker shows the same marker on the same row.
4. Changing *Starts at* to 08:00 recomputes every item's `scheduled_start/end` by +60 min; `original_scheduled_start` is unchanged (the trigger would reject a change — confirm no error is raised, meaning the service never tried).
5. Mark one item done by SQL (`done_at`, `completion_state = done`), then re-apply the same template: the done row keeps `done_at`, its snapshots, and its `scheduled_*`; untouched rows are updated; no row is deleted. *(Mason.)*
6. Remove a slot from *Morning* in TP-02, leave → TP-04 lists the applied days; **All planned days** deletes the untouched item for that slot on each day and keeps the done one; **Don't apply** changes no day; **Only days from tomorrow** leaves today untouched. The caller shows *Applied to {n} days.* *(Mason.)*
7. *Remove template* → dialog → the untouched items are gone, the done one stays with `template_slot_id = null` and its `template_name_snapshot`, `days.template_id = null`.
8. WK-03 with *Just a title* creates a `task_appointment` one-off with `habit_id = null`, `origin = one_off`, `scheduling = hard` (Fixed default) at the typed time; with a habit chosen it snapshots the habit and bounds *Takes*; *Save to habits instead* opens the habit sheet and returns with it selected.
9. A one-off saved at the same start as an existing fixed item shows the multitask question; **Yes, multitask** gives both the same `multitask_id`.
10. WK-03 opened with `allowDateChange` and a future date creates the item on that date's day (creating the `days` row); without it, the *Day* field is absent.
11. *Copy last week*: plan last week by SQL or the UI, then the dialog copies templates and anchors, never one-offs; with already-planned days the extra line *{n} planned days will be replaced.* appears and confirming replaces them (touched items on those days survive per the predicate).
12. On a spring-forward date, an item whose wall-clock time is in the missing hour is stored at the first instant after it and the WK-02 preview reads that time. *(Mason.)*
13. As user B, `week.get` shows no rows for A's week; `week.applyTemplate` naming A's template is `NOT_FOUND`.
14. A past week is read-only except one-offs; a past day's WK-02 has template and start disabled.
15. Offline: WK-01 read-only with the line; WK-02/03 primaries disabled.
16. Migration `0002` applies cleanly on a fresh local database after `0001`; the journal has its entry; `SCHEMA_REFERENCE.md` regenerated.
17. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Reconcile in one transaction per day: read existing rows for the day with `template_slot_id IS NOT NULL`, compute the desired map, then `UPDATE … WHERE id = ANY($untouchedIds)`, `INSERT`, `DELETE … WHERE id = ANY($untouchedGoneIds)`. Keep the predicate in SQL as a reusable `sql` fragment *and* in TS for the caller's counts; test they agree.
- The day-row snapshots come from `readPreferences` (INF-8) after USE-1's pending-pair application — read through that service, not `users` directly, so the deferred zone switch is honoured.
- Anchor for a new day: `templates.anchor_time` unless the caller passes one; WK-02's helper *Defaults to the template's start.* is literal.
- `DayPlanView` (the week row) is `{ date, weekday, isToday, isPast, templateId, templateName, anchorTime, oneOffCount }` — a service return type, not `@syn/types` (rule 5).
- *Applied to {n} days.* as a 4-second header subtitle: the editor already owns `subtitle`; pass it via the feature hook's state, not a toast (official §9.7: toasts are for undo only).

## Dev's call

Whether WK-01 on wide is CSS grid or seven flex columns · the `DateField` bounds in WK-03 (recommend today … +1 year) · the exact reconciliation transaction shape · how *(archived)* is rendered in the picker's current-value row.

## Out of scope

- **Rendering the day** (LS-01), item state derivation, the day header sheet — USE-1, USE-2, USE-3. This ticket exports the two doors; USE-2/USE-3 open them.
- **LS-00's *Apply {most-used template}*** — USE-2, using `week.applyTemplate`.
- **N6 (week-build reminder)** — USE-8, reading `week.get(next).status`.
- **Carried items** appearing on a day — REV-2 writes them with `origin = carried`.
- **Per-item drag on the Schedule** — never in v1 (cross-cutting §8.1).

## Depends on

- **SET-5** — templates and slots, `template.get`, the editor's `onLeave`. Complete in `PROGRESS.md`.
- **USE-1** — `wallClockToInstant`, `resolveDayKey`, `dayWindow`, `weekOf`, `mondayOf`, and the pending-pair application in the preferences read. Complete in `../epic-2-in-use/PROGRESS.md`.

## Recommended execution

**Opus.** The materialiser's keep rules *are* the ticket, and they interact with DST, the anchor change's one permitted write to touched rows, and TP-04's three scopes. A cheaper model writes a materialiser that replaces every template item and passes the happy path; the first re-apply after a done item erases a record, which is the one thing the product promises never to do.

---

### Kickoff (paste into the session)

> Build **SET-6 — Week build and materialisation** (attached spec). Model: **Opus**. **One materialiser, one "untouched" predicate; a touched item is never replaced, deleted, or re-snapshotted; absolute times come from USE-1 in the day's snapshotted zone; applying is immediate.**
> Attach/read first, in order: this spec · Epic 1 §6 (WK-01/02/03), §5 TP-04, §0.3, §9, §10 · official spec §3.6, §3.7, §4.5, §6.6 · cross-cutting §7.1, §7.2, §8.1, §9.3 (G4) · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · USE-1 (the time helpers and `readPreferences` — reuse, never re-derive) · SET-5 (the editor's `onLeave`, `template.get`) · SET-4 (the habit sheet, `habit.list`) · `packages/db/SCHEMA_REFERENCE.md` (plan, day groups) · `packages/db/AGENTS.md` (for `0002`) · `docs/ai-guides/db-and-rls-authoring.md` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Author migration `0002` (one column), journal it, verify locally, stop before any hosted migrate. Export `DaySheet` and `OneOffSheet` for the List's doors. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
