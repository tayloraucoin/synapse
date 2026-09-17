# RUN-6 — The day under v1.2: travel rows in the materialiser and the layout, version resolution in `confirmDay` and `editHabitDay`, `applyWorkType`, and the journal reminder in `notify.ts`

**Epic:** RUN — The first run rebuilt (UX v1.2) · **Phase 1** · Size: L
**Slice type:** Day-side services — four mechanisms over the record. The risk class is *the record rewritten* (a travel row that moves the workout's original start; a version change that touches the habit) and *a notification that reports* (a reminder sent about an entry's absence).
**Vigil:** the reminder — induce: journal disabled; reminder off; tonight's entry non-empty at send time; the minute already claimed; two subscriptions. The travel rows — drop the ride home alone; Adjust with a travel row in the morning.

**Status:** Complete — 2026-09-16 (batch 3; database-backed criteria unverified, no tier touched — see `DEVIATIONS.md`)

> **Vigil — full review.** State which paths were exercised: reminder sent · reminder suppressed (entry non-empty) · reminder suppressed (disabled) · reminder suppressed (off) · reminder not doubled on a second scan · travel there dropped, workout untouched · travel back shortened, workout untouched · workout *Not today* cascades both travel rows to not assigned · `applyWorkType` on a *Rarely* day then reversed.

---

## Outcome

The day knows the four things v1.2 added to it: a workout placed with planned travel materialises as three rows — *→ Gym · 15*, the workout, *← Home · 15* — each an item of its own that can be done, dropped, shortened or moved without touching the others, and the Schedule can read them as one band with two thin ends; a habit with versions lands on the day at its default version's length with the `version_key` snapshotted, and the item sheet can change the version as a habit-day edit; a *Rarely* day can become a work day through one service, `applyWorkType`, and back; and the journal has a reminder — one push at the person's time, in their words, only when the journal is on, the reminder is on, and tonight's entry is empty at send time. After this ships, **RUN-11's screens have a reminder to set, RUN-12's builder has travel to show, and RUN-13's Today and Schedule have rows to render.** No screen changes here.

## Why / intent

- **v1.2 §3.7, R35, TD-12** — *"the day carries three rows … The two travel rows are items in their own right: each can be Not today, shortened, or moved, without touching the workout; the workout's length is never the sum. … Where the travel is not planned, the workout is placed alone."* `origin = travel`, `parent_item_id`.
- **v1.2 §3.5, R34, TD-11** — *"On the Today tab the chosen version's length is the item's; the version label shows in the item sheet only."* `version_key` snapshotted; `editHabitDay` accepts a `versionKey` and resolves it server-side.
- **v1.2 §3.9, R40, TD-19** — *Working today* applies a type: the work block, its hours, its fixtures; re-flow; `days.work_template_id`; the reverse.
- **v1.2 §7.2, §9, R38** — N2: *"sent only if the journal is enabled, the reminder is on, and tonight's entry is empty at send time. Never a second one. Never a word about yesterday's entry or its absence."* Title *A few lines*, body the time.
- **v1 §8.1, §8.5** — a notification is a scheduled fact in the person's words; it never reports a miss.
- **TD-4, TD-5** — `stackBlock` unchanged; `original_scheduled_start` rules unchanged; travel rows are two more items in a stack.
- **Ground truth (consumed):** `services/day/{materialize-day,lay-out-day,confirm-day,reflow-block,edit-habit-day,move-item,do-now,adjust-day,get-day}.ts`, `services/jobs/notify.ts` (`notifyStarts` and the N4–N6 scans; `claimDelivery`, `sendClaimed`), `services/notifications/{build-payload,fan-out,list-prefs}.ts`, `NOTIFICATION_CATALOGUE` (RUN-1 added N2), RUN-3's habit columns, RUN-2's item columns.
- **What this slice is NOT (binding):** the day-plans service (RUN-5); any rendering (RUN-13 draws the band and the rows; RUN-11 the setting); the pick's version tabs (RUN-13); Settings → Notifications' row (RUN-11).

**Rulings this slice makes (labelled, logged):**

- **Travel rows are materialised wherever a workout with `plan_travel` and a non-zero travel is placed** — `confirmDay` (the pick's placement), `prefillWeek` (a plan's placement, via RUN-5's call into the same materialiser), `ensureTrainingBlock`. They carry `origin: travel`, `parent_item_id`, `title` *→ {Gym | Studio | Outside}* / *← Home* `[COPY]`, `icon` a plain arrow as `IconValue` curated, `duration_min` the travel length, `priority` the workout's, `scheduling soft`, `gap_before_min 0`, and their own `original_scheduled_start` under TD-5's rule. Logged.
- **A workout's *Not today* cascades to its travel rows** (`assignment_state: not_assigned`, reason *with the workout* `[COPY]`); a travel row's *Not today* touches only itself. `doNow` on the workout slides its travel-back row like any later item; `doNow` on a travel row is allowed. Adjust treats travel rows as soft items with the workout's priority. Logged.
- **`getDay` returns travel rows as items with `parentItemId`;** the Schedule's grouping is the view's concern (RUN-13). The `DayView` gains nothing else. Logged.
- **`editHabitDay({ versionKey })`** resolves the version on the habit, writes `duration_min` and `version_key` together, and refuses an unknown key; `durationMin` in the same call wins over the version's minutes and clears `version_key` (a hand-set length is not a version). `confirmDay` writes `version_key` from the pick's choice or the default version. Logged.
- **`applyWorkType(dayId, templateId)`**: refused unless the day is today or future and unconfirmed-or-set (never closed); creates the work `day_block` from the template with `days.work_template_id`, `work_start_time`, `work_end_time` and `anchor_is_hard` from the template's `anchor_direction` (or the profile's), materialises the weekday's work fixtures as pins, then `layOutDay`. The reverse, `removeWorkType(dayId)`, marks the block's items `not_assigned` (reason *not working today* `[COPY]`), sets the block `state: not_today`, nulls the four columns, re-lays. Both write a `shifts` row? **No** — a shape change is not an Adjust; nothing is scored. Logged.
- **N2 joins `notifyStarts`' minute scan as a fifth kind** keyed on `users.journal_reminder_time` (effective, RUN-3's rule) for users with `journal_enabled` and `journal_reminder_enabled`; the send checks `journal_entries` for today's row having any non-empty answer and skips silently; `claimDelivery` keys it `(user, date, journal_reminder)` so a second scan cannot double it. Payload: title *A few lines*, body the time as the person's clock. Logged.

## Behaviour & states

**No surface.** The mechanisms, by state of the record:

- **Travel:** a training block with a planned workout holds `[travel-there?, workout, travel-back?]` in that order; the stack flows through them; `getDay` returns three items; `move-item` on the workout moves the workout only (the travel rows re-stack around it as any item would); `setDone` on a travel row is a plain done.
- **Versions:** an item from a habit with versions has `version_key` = the chosen or default key and `duration_min` = that version's minutes; `editHabitDay({ versionKey: "quick" })` → `duration_min 5`, `version_key "quick"`, the block re-flows; `editHabitDay({ durationMin: 12 })` → `version_key null`.
- **Working today:** a *Rarely* day with no work block → `applyWorkType(T)` → a work block, fixtures, `days.work_template_id = T`, re-laid; `removeWorkType` → the block `not_today`, items not assigned, columns null.
- **The reminder:** at `journal_reminder_time` for a user with both switches on and an empty entry → one push; otherwise nothing, and no row records "suppressed because empty" beyond the delivery claim's absence.

**States (exhaustive):** travel row — planned · done · not assigned (own) · not assigned (with the workout) · moved · shortened; item version — default · chosen · hand-set (null); day work — none · applied (`work_template_id`) · removed (`not_today`); reminder — sent · suppressed-disabled · suppressed-off · suppressed-nonempty · claimed-already. **Failure / edge states:** `plan_travel` true with both travels 0 → no rows · `applyWorkType` on a closed day → refused `closed` · `applyWorkType` twice → refused `already_working` · `editHabitDay({ versionKey })` on a fixture → refused `fixture` (existing code) · a reminder time before now at scan → sent at the next minute that matches, never back-filled (v1.1 §9.2's rule).

## Non-negotiables (this slice)

- **The workout's `duration_min` never includes travel.**
- **`original_scheduled_start` rules stand** (TD-5); no new writer.
- **A version change is a habit-day edit** — the habit is never written.
- **The reminder never reports.** No body about yesterday, no count, no *you haven't*.
- **Nothing detects** — `applyWorkType` runs only from a tap (RUN-13's row).
- **`stackBlock` is unchanged.**
- **Every query through `ctx.rls.execute()`;** the job uses its service-role path as DYN-20 does.

## Data & AI

**Schema changes: none.**

**Tables:** `day_items` (read, write) · `day_blocks` (read, write) · `days` (read, write — `work_template_id`, the times) · `habits` (read) · `templates` (read) · `fixtures` (read) · `journal_entries` (read) · `users` (read) · `notification_deliveries` (write, via the job).

**Placement:** `packages/api/src/services/day/{materialize-day,confirm-day,lay-out-day,edit-habit-day,set-done,do-now,adjust-day,move-item,get-day}.ts` (amended), `services/day/apply-work-type.ts` (new: `applyWorkType`, `removeWorkType`), `services/jobs/notify.ts` (+ N2 in the scan), `services/notifications/build-payload.ts` (+ the N2 payload); `routers/day.ts` (+ `applyWorkType`, `removeWorkType`), `routers/item.ts` (`editToday` + `versionKey`); `packages/validators/src/{item,day}.ts` (`versionKeySchema` from RUN-1; `applyWorkTypeInput`). Rule 3.

**tRPC / validators:** `day.applyWorkType` · `day.removeWorkType` (new) · `item.editToday` (widened) · `day.confirm` (accepts `versionKey` per routine choice — the pick's input schema in `confirm.ts`).

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — local tier, seeded account; the job through its route with `CRON_SECRET`)

1. A workout with `location gym`, travel 15/15, `plan_travel true`, placed *before the routine* by `confirmDay`: the training block holds three `day_items` in order (`origin travel` · `origin template` · `origin travel`), the middle one's `duration_min` is 60, the travel rows' `parent_item_id` is the workout's id, each has its own `original_scheduled_start`, and the block's span is 90 min. With `plan_travel false`, one row, 60 min. *(Vigil.)*
2. `item.editToday({ id: <travel back>, assignmentState: "not_assigned" })` leaves the workout untouched and re-flows; `item.editToday({ id: <workout>, assignmentState: "not_assigned" })` marks both travel rows not assigned with the reason; `item.editToday({ id: <travel there>, durationMin: 5 })` changes only that row. *(Vigil.)*
3. `getDay` returns the three rows with `parentItemId` on the travel rows and null on the workout; `move-item` on the workout by +30 min leaves the travel rows' `original_scheduled_start` untouched and their `scheduled_start` re-stacked.
4. A habit with versions `quick 5 / full 20` (default `quick`): after `confirmDay` the item has `duration_min 5`, `version_key quick`; `item.editToday({ versionKey: "full" })` → 20 / `full`; `{ versionKey: "nope" }` refused; `{ durationMin: 12 }` → 12 / `null`; `habits.versions` is unchanged throughout.
5. On a *Rarely* Saturday (today, unconfirmed): `day.applyWorkType({ date, templateId: T })` creates the work block with T's hours, `days.work_template_id = T`, Saturday's work fixtures as pins, and re-lays; a second call is refused `already_working`; `day.removeWorkType({ date })` marks the block `not_today`, its items `not_assigned`, nulls the columns; on a closed day both are refused `closed`. *(Vigil.)*
6. Reminder: user with journal on, reminder on at 20:45, no entry tonight → `notifyStarts(20:45)` sends one push titled *A few lines* with body *20:45*; a second `notifyStarts(20:45)` sends nothing (claimed); with an entry whose any answer is non-empty → nothing; with `journal_reminder_enabled false` → nothing; with `journal_enabled false` → nothing. The payload contains no word from the journal. *(Vigil.)*
7. `grep -rn "haven't\|skipped\|missed" packages/api/src/services/notifications packages/api/src/services/jobs` returns nothing new.
8. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `ensureTrainingBlock` in `confirm-day.ts` is where the workout row is written; write the travel rows in the same function so every caller gets them.
- The travel row's icon: `{ kind: "curated", value: "arrow-right" | "arrow-left", colorKey: null }` if the curated set has arrows; else a text glyph is not allowed (R29 is about emoji on chrome, and a travel row is the person's — but keep it plain). Check `curated-icon-grid` for the set.
- `applyWorkType` reuses `materializeDay`'s fixture pass for one weekday and `layOutDay`; do not re-materialise other blocks.
- The N2 scan reads `journal_reminder_time` effective (RUN-3's derived read) — put the derivation in one shared function both `preferences.ts` and the scan call.

## Dev's call

The travel row's curated icon · `removeWorkType`'s name · whether `applyWorkType` lives in `services/day/` or `services/plan/` (day — it writes the record).

## Out of scope

- **Rendering the band and the rows** — RUN-13.
- **Settings → Notifications' N2 row; screen 11's reminder field** — RUN-11.
- **The pick's version tabs; the item sheet's version control** — RUN-13.
- **Day plans and the week pre-fill** — RUN-5.

## Depends on

- **RUN-3** — the workout columns, versions, the effective reminder time. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Four mechanisms on the record with cascades and a notification with five suppression paths; a cheaper model adds the travel to the workout's length, writes the habit on a version change, or sends the reminder with a helpful line about last night.

---

### Kickoff (paste into the session)

> Build **RUN-6 — The day under v1.2** (attached spec). Model: **Opus**. **Travel never adds to the workout; a version change is a habit-day edit; the reminder never reports; nothing detects; `stackBlock` is untouched.**
> Attach/read first, in order: this spec · v1.2 §3.5, §3.7, §3.9, §7.2, §9, §11.7 · v1 §8.1, §8.5 · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · DYN-5 (`confirm-day.ts`, `materialize-day.ts`, `lay-out-day.ts` — reuse, don't fork) · DYN-6 (`edit-habit-day.ts`, `do-now.ts`, `adjust-day.ts`, `move-item.ts`) · DYN-20 (`notify.ts`, the claim) · RUN-3 · `packages/db/SCHEMA_REFERENCE.md` (day_items, day_blocks, days, journal_entries) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-11, TD-12, TD-19) · Epic 4's `TECHNICAL-DECISIONS.md` (TD-4, TD-5, TD-6).
> Induce every Vigil path and state which ran. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
