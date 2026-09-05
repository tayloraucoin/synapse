# USE-1 — The day model: boundaries, today, state derivation, day parts, auto-close, and the day read model

**Epic:** USE — In Use · **Phase 0** · Size: L
**Slice type:** Contract — pure time arithmetic plus one read model and one scheduled job. No screen. The risk class is *the wrong day*: an item that belongs to yesterday shown today, a state that flips a minute early, a DST night that duplicates or loses an hour, a zone change that moves a record.
**Vigil:** none. **Mason review:** the time arithmetic (AC 1–8) and the auto-close pass (AC 12–14).

**Status:** Not started

> **Mason — arithmetic review.** Every function here is called by the materialiser (SET-6), the List (USE-2), the timer (USE-3), the resolver (REV-1), and the scheduler (USE-8). Review the DST cases against cross-cutting §7.2 by running them, not by reading them. There is no date library; `Intl` is the tool and the ticket says how.

---

## Outcome

Given a moment, a person's zone, and their day-close time, the system knows which Synapse day it is and when that day opened and closes. Given a wall-clock time on a date in a zone, it produces an instant — resolving a spring-forward gap forward and a fall-back overlap to its first occurrence. Given a day's items and a clock, it says what state each is in and which day part it belongs to. One procedure returns the whole day as view models, with those states computed for first paint, and the client can recompute them every minute from the same fields without asking again. At the day boundary, an unclosed day with undone items closes on its own and its undone items become *pending review*. **No pixel changes.** The List that renders this is USE-2.

## Why / intent

- **Official spec §6.1** — a Day opens at `day_close_time` (default 03:00) and closes by *Day Complete* or automatically at the next; items done between midnight and 03:00 belong to the day that started the previous morning. §6.2 — *now* inside `[scheduled_start, scheduled_end)` for fixed items, inside the window for windowed (*open*); *soon* = 15 minutes before a fixed start; unscheduled items are never now or soon. §6.3 — off-schedule is derived: `done_at` outside `[original_scheduled_start, scheduled_end]`. §6.4 — day parts from `woke_at` (or `anchor_time`), +8 h, +16 h; Evening ends at the last scheduled item. §6.6 — priority tie rules. §6.7 — *closing* when the remaining window ≤ max(10%, 10 min). §7.2 — auto-close leaves undone items pending, never missed.
- **Official spec §5.9** — the state matrix both tabs render from. `ItemState` in `@syn/types` is its union.
- **Epic 2 LS-01's row-state table** — the additional states (*done, quantity missing*, *carried*, *not today*) and the deferred item's position.
- **Cross-cutting §7.1, §7.2, §7.3, §7.4, §8.2** — the day keyed by its date in the stored zone; DST rules; times shown in the day's zone with a zone label only while it differs from the device's; weeks start Monday in the stored zone; record mode and plan mode for non-today days.
- **Ground truth:** SET-1's `days` (with `timezone`, `day_close_time` snapshots), `day_items`, `timer_sessions`, `misses`, `users` (with the pending-pair); `@syn/utils` `time.ts` (`formatClock`, `toDateKey`, `minutesFromDayStart` — extend, do not fork); `@syn/types` `DayItemView`, `ItemState`, `DayMode`, `MultitaskPosition`; `services/user/preferences.ts` (`readPreferences`); `SCHEDULED_JOBS`; `buildServiceRoleAuthContext`; INF-2's note that DST arithmetic "is a separate problem and is not solved here" — it is solved here.
- **What this slice is NOT (binding):** no writes to `day_items` except by the auto-close pass; no materialisation (SET-6); no List (USE-2); no notification (USE-8); no review math (REV-1).

**Rulings this slice makes (labelled, logged):**

- **`deriveItemState` is the one state function.** Signature: `deriveItemState(item: DayItemView-shaped fields, day: { closedAt, mode }, now: Date): ItemState`. Order of precedence, first match wins: `not-assigned` (assignment `not_assigned`) · `cut-by-shift` · `pending-review` (completion `pending_review`) · `carried` (completion `carried`) · `missed` (completion `missed`, only reachable in record mode) · `done-off-schedule` (done and `doneAt` outside `[originalScheduledStart, scheduledEnd]`) · `done` · `deferred` (`deferredAt` set) · `active` (a running session) · for `unscheduled`: `upcoming` · for `fixed_time`: `passed` (now ≥ start + duration) · `now` (start ≤ now < end) · `soon` (start − 15 min ≤ now < start) · `upcoming` · for `window`: `passed` (now ≥ end) · `closing` (inside and remaining ≤ max(10%, 10 min)) · `open` (inside) · `upcoming`. Logged (`TECHNICAL-DECISIONS.md`).
- **The client re-derives state each minute** with `useDerivedItems(items, now)` over the same fields; the API sets `state` for first paint with the same function. Logged.
- **Boundaries use the effective zone and close time; days snapshot both.** `resolveDayKey(now, zone, closeTime)`: the calendar date in `zone` of `now − closeTime`. `dayWindow(dateKey, zone, closeTime)`: `[wallClockToInstant(dateKey, closeTime, zone), wallClockToInstant(dateKey + 1 day, closeTime, zone))`. Logged.
- **`wallClockToInstant(dateKey, "HH:mm", zone)` is `Intl`-based** (no library): compute the UTC guess, read the zone's offset at that instant with `Intl.DateTimeFormat(...).formatToParts`, correct, and re-read once; if the corrected wall clock does not round-trip (a gap), step forward minute by minute until it does (the "first minute after" rule); if two instants map to the wall clock (an overlap), take the earlier. Minutes beyond 24:00 roll into the next date before conversion. Logged.
- **Day parts:** `dayPartOf(item, day)` → `morning` / `afternoon` / `evening` / `anytime`, from `woke_at ?? anchor` at the day's date; unscheduled items with a template offset belong to the part their slot's start falls in (the offset is on the slot; the item keeps `scheduled_start` null — **therefore** SET-6's materialiser writes a `sort_order` that encodes the slot's position, and unscheduled items go to the part of the preceding scheduled item; with no preceding item, *Anytime*). Evening's span ends at the last scheduled item. Logged. `[Vesper: this is the only place the document's "sit at the bottom of the day part they were slotted in" needs a mechanism; if the position reads wrong in use, the fallback is *Anytime* for every unscheduled item.]`
- **Mode:** `dayModeFor(dateKey, todayKey)` → `live` / `record` / `plan`. Logged.
- **Auto-close** is `closeDay(rls, userId, { dateKey, reason: "auto" })` run by the job `auto_close_days` every 15 minutes: for each user (service-role context per user), days with `closed_at IS NULL` whose window end has passed → `closed_at = window end`, `close_reason = auto`, undone assigned items (`completion_state IN (upcoming, active)`) → `pending_review`; a running session is ended at the window end with `source = timer`. A day with no items closes too (so RV-00 can say *Nothing was assigned*). Manual close (REV-2) calls the same `closeDay` with `reason: "manual"`. Logged.
- **The pending-pair is applied in `readPreferences`** (extend INF-8's service): when `pending_*_from <= todayKey` (computed with the *old* values), copy pending into live and null the pair, in the same transaction; the scheduler's per-user pass calls `readPreferences` first so the switch happens without an app open. Logged.
- **The day read model** `getDay(rls, userId, dateKey, now)` returns `DayView`: `{ dateKey, mode, timezone, dayCloseTime, anchorTime, wokeAt, wokeAtSource, closedAt, closeReason, capacityMin, templateName, shiftedMin, parts: [{ part, span: {startLabel, endLabel} | null, items: DayItemView[] }], notAssigned: DayItemView[], cutByShift: DayItemView[], shifts: [{ id, at, deltaMin, reasonLabel, tier }], hasUndone, hasPending, zoneLabel }`. A date with no `days` row returns a virtual empty day (mode from the date, no template, no items, `templateName: null`). Logged.

## Behavior & states

**No surface.** Described by the functions and the read model.

### `packages/utils/src/day/`

- `boundaries.ts` — `resolveDayKey`, `dayWindow`, `dayModeFor`, `addDays(dateKey, n)`, `isSameOrBefore`.
- `wall-clock.ts` — `wallClockToInstant`, `instantToWallClockMinutes(instant, zone)`, `zoneOffsetMinutes(instant, zone)`.
- `week.ts` — `mondayOf(dateKey)`, `weekKeyOf(dateKey)` (ISO `YYYY-Www`), `weekDates(weekKey)` (seven keys), `weekdayIndex(dateKey)` (Mon = 0).
- `item-state.ts` — `deriveItemState`, `isOffSchedule(item)`, `SOON_MINUTES = 15`, `closingThresholdMin(windowMin)`.
- `day-parts.ts` — `dayPartOf`, `dayPartSpans(day)`, `DAY_PART_HOURS = 8`.
- `priority.ts` — `compareForTrim(a, b)` (§6.6: priority ascending, shorter duration, later start).
- `time.ts` (existing) gains `formatClockFromMinutes`.

All pure, all taking explicit zones and clocks, exported from the barrel.

### `packages/api/src/services/day/`

- `get-day.ts` — the read model above; joins `days` (or virtual), `day_items`, running `timer_sessions` (for `timerElapsedSec`), `misses` (for cut items' reason labels), `shifts`, `templates.name`; maps to `DayItemView` via `to-view.ts` (also here: `category` via `habits → categories`, `carriedFromLabel` via `carried_from_item_id → days.date` as *Thu*, `multitask` position from `multitask_id` order); computes `state` with `deriveItemState(…, now)`.
- `to-view.ts` — `toDayItemView(row, joins, day, now)`.
- `close-day.ts` — `closeDay` as ruled.
- `today.ts` — `resolveTodayFor(rls, userId, now)` → `{ todayKey, zone, closeTime }` after applying the pending pair.

### `packages/api/src/services/jobs/auto-close-days.ts`

Registered in `SCHEDULED_JOBS` as `auto_close_days`. Iterates users (singleton `db` for the id list only — a system path, commented), then per user `createRlsClient(buildServiceRoleAuthContext(userId))` → `readPreferences` (applies pending) → close overdue days. Returns the count closed.

### `packages/api/src/routers/day.ts`

`day.get({ date })` → `DayView` (validates with `dateKeySchema`; a future date beyond +1 year is `BAD_REQUEST`); `day.today()` → `{ todayKey }`.

### `apps/web/lib/hooks/`

`use-now.ts` — a 60 s tick aligned to the minute (`setTimeout` to the next :00, then `setInterval`), paused when `document.hidden`, resumed with an immediate tick on visibility. `use-derived-items.ts` — `useDerivedItems(day: DayView, now)` → the same `DayView` with every `state` recomputed via `deriveItemState`.

**States (exhaustive), for `deriveItemState`:** every member of `ItemState` is reachable; the fixture matrix in `packages/ui/src/composed/__fixtures__/view-models.ts` (`itemInState`) is the reference for what each looks like.

**Failure / edge states:** a day whose `timezone` snapshot is an unknown IANA id → `Intl` throws; catch at `getDay`, log the fault without the value, and fall back to the user's current zone (log a deviation the first time it happens in staging) · `now` before the day's window (a `plan` day) → every scheduled item is `upcoming`; unscheduled `upcoming` · a `record` day → no `now`/`soon`/`open`/`closing` ever; undone assigned items are `missed` if a miss exists, else `pending-review` if the day is closed, else `passed` · a running session across the boundary → the auto-close ends it at the window end.

## Non-negotiables (this slice)

- **One state function.** No component, hook, or service decides an `ItemState` any other way.
- **No date library.** `Intl` only, with the gap/overlap rules implemented and tested by hand in the AC.
- **Times are computed in the day's snapshotted zone.** `getDay` never reads the device zone; `zoneLabel` is filled only when the caller passes a device zone that differs (the client passes it — SYS-2 owns the comparison; here it is a parameter).
- **Auto-close never marks anything missed.** Undone → `pending_review`; the Day Review decides.
- **`original_scheduled_start` is never in any update set.**
- **Every user-scoped read and write through `ctx.rls.execute()`;** the job's bypass is the named `buildServiceRoleAuthContext` call.

## Data & AI

**Schema changes: none.**

**Tables:** `days` (read; auto-close updates `closed_at`, `close_reason`) · `day_items` (read; auto-close updates `completion_state`) · `timer_sessions` (read; auto-close ends a running one) · `misses`, `shifts`, `templates`, `habits`, `categories` (read) · `users` (read; pending-pair apply).

**Placement:** `packages/utils/src/day/` (rule 6); `packages/api/src/services/day/` and `services/jobs/auto-close-days.ts` (rules 4, 15); router `day.ts` (rule 3); hooks in `apps/web/lib/hooks/` (web-only: they read `document.hidden`); `readPreferences` extended in place.

**tRPC / validators:** `day.get`, `day.today`. Zod: `dateKeySchema` (exists); `getDayInput` in `packages/validators/src/day.ts`.

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.** (The `zoneLabel` and `span` labels are strings the List will render; produce them here so they are formatted once.)

## Acceptance criteria (observable — run the pure functions in a Node REPL or a scratch script under `$TMPDIR`; the read model against the local tier with SQL-inserted days)

1. `resolveDayKey(2026-09-05T09:59Z, "America/Vancouver", "03:00")` = `2026-09-05`; `resolveDayKey(2026-09-05T09:30Z, …)` (02:30 local) = `2026-09-04`; `resolveDayKey(2026-09-05T10:01Z, …)` (03:01) = `2026-09-05`. *(Mason.)*
2. `dayWindow("2026-09-04", "America/Vancouver", "03:00")` = `[2026-09-04T10:00Z, 2026-09-05T10:00Z)`. *(Mason.)*
3. Spring forward: `wallClockToInstant("2026-03-08", "02:30", "America/Vancouver")` = `2026-03-08T10:00Z` (03:00 PST→PDT — the first minute after the gap); `"01:59"` = `09:59Z`; `"03:00"` = `10:00Z`. *(Mason.)*
4. Fall back: `wallClockToInstant("2026-11-01", "01:30", "America/Vancouver")` = `2026-11-01T08:30Z` (the first occurrence, PDT); `dayWindow("2026-11-01", …, "03:00")` is 25 hours long. *(Mason.)*
5. `wallClockToInstant("2026-09-04", "25:30", zone)` equals `wallClockToInstant("2026-09-05", "01:30", zone)`. *(Mason.)*
6. `mondayOf("2026-09-06")` (a Sunday) = `2026-08-31`; `weekKeyOf("2026-01-01")` = `2025-W01`; `weekDates("2026-W36")` starts `2026-08-31`. *(Mason.)*
7. `deriveItemState` over a fixed item at 07:00–07:40: at 06:44 → `upcoming`; 06:45 → `soon`; 07:00 → `now`; 07:39 → `now`; 07:40 → `passed`; with `doneAt` 07:20 → `done`; with `doneAt` 09:00 → `done-off-schedule`; with `deferredAt` → `deferred`; with a running session → `active`. A 60-minute window: remaining 10 min → `closing`; remaining 11 → `open`; a 200-minute window: remaining 20 → `closing`. An unscheduled item is never `soon` or `now`. *(Mason.)*
8. `dayPartOf` with `wokeAt` 07:04: an item at 14:59 → `morning`; 15:04 → `afternoon`; 23:04 → `evening`; `dayPartSpans` gives *7:04–15:04*, *15:04–23:04*, and Evening ending at the last scheduled item's time.
9. `day.get` for a SQL-inserted day with five items returns `DayView` with items in time order inside their parts, `state` set for `now`, `timerElapsedSec` for an active item, `carriedFromLabel` *Thu* for a carried item, `multitask` positions `first`/`last` for a two-item group, `shiftedMin` summed over shifts, and `mode: "live"`; for yesterday's key `mode: "record"` with no `now`/`soon`; for a date with no row, a virtual empty day.
10. `day.get` as user B for A's date returns B's (empty) day, never A's items.
11. `useNow` ticks at the minute boundary (observe two consecutive values 60 s apart, aligned to :00) and stops while the tab is hidden.
12. Insert a day whose window ended an hour ago with two upcoming items and one running session; run the scheduler route: the day has `closed_at` = the window end and `close_reason = auto`, both items are `pending_review`, the session has `ended_at` = the window end; running again changes nothing. *(Mason.)*
13. A day with no items past its window closes too; a day still inside its window does not.
14. Set `pending_timezone = 'Europe/London'` and `pending_timezone_from = today` by SQL; `user.me` returns `timezone = 'Europe/London'` and the pending pair is null afterwards; with `_from = tomorrow` nothing changes. *(Mason.)*
15. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `zoneOffsetMinutes(instant, zone)`: format the instant in the zone with `hourCycle: "h23"` parts, rebuild a UTC timestamp from those parts, subtract. Two iterations converge everywhere except inside a gap, which the forward step handles.
- Keep the utils free of `Date` mutation; return new instants.
- `getDay` is one `rls.execute` with a handful of selects; assemble in TS. Do not reach for a query builder join that hides the RLS `where`.
- The user list for the job: `db.select({ id: users.id }).from(users)` — the singleton is correct here and the comment says so; everything after that is per-user under the named bypass.
- `useNow` belongs in `apps/web/lib/hooks/` (reads `document`); `useDerivedItems` is pure over the view and could live in `@syn/hooks` — put it there (platform-pure, the Expo app wants it) and note the split.

## Dev's call

The exact `Intl` probing implementation · whether `DayView` is a `type` in `services/day/get-day.ts` or a `day.types.ts` beside it · the job's user batching · `useDerivedItems` memoisation strategy.

## Out of scope

- **Materialising items** — SET-6.
- **Rendering anything** — USE-2, USE-5.
- **Manual close (*Day Complete* → *Finish review*)** — REV-2 calls `closeDay` with `manual`.
- **Reminders at boundaries** — USE-8.
- **The device-zone comparison and the switch dialog** — SYS-2 (this ticket exposes `zoneLabel` as a parameter-driven string).
- **Per-field conflict resolution across devices** — Phase 2.

## Depends on

- **SET-1** — the tables and snapshots. Complete in `../epic-1-setup/PROGRESS.md`.

## Recommended execution

**Opus.** The DST arithmetic without a library, the state precedence, and the boundary semantics are exactly the edge cases that look right and are wrong by an hour twice a year. A cheaper model writes `new Date(y, m, d, h)` in the server's zone and every Vancouver day is off by seven hours in production.

---

### Kickoff (paste into the session)

> Build **USE-1 — The day model: boundaries, today, state derivation, day parts, auto-close, and the day read model** (attached spec). Model: **Opus**. **One state function, pure, in `@syn/utils`; boundaries from the effective zone and close time with days snapshotting both; `Intl` only, gaps resolve forward, overlaps take the first; auto-close never marks missed.**
> Attach/read first, in order: this spec · official spec §5.9, §6.1–§6.7, §7.2 · Epic 2 LS-01's row-state table · cross-cutting §7.1–§7.4, §8.2 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · `packages/utils/src/time.ts` (extend) · `packages/types/src/domain/{ui-state,view}.ts` · `packages/ui/src/composed/__fixtures__/view-models.ts` (the state fixtures) · `packages/api/src/services/user/preferences.ts` and `services/jobs/run-scheduled-jobs.ts` (extend) · `packages/db/SCHEMA_REFERENCE.md` (plan, day groups) · `apps/web/lib/stores/README.md` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `../epic-1-setup/TECHNICAL-DECISIONS.md` (the pending pair) · `docs/specs/infrastructure/DEVIATIONS.md`.
> Prove the DST cases by running them and paste the outputs in your closing note. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
