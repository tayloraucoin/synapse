# SYS-2 — Time: the device-zone check, SY-06, the zone label, and the deferred zone and day-close switches applied to future days

**Epic:** SYS — Cross-cutting · **Phase 1** · Size: M
**Slice type:** One status line, one dialog, one hook, and one service hook into the pending-pair application. The risk class is *a day that jumps*: a mid-day zone change moving today's times, a future day materialised under the old zone, a device zone read in two places.
**Vigil:** none. **Mason review:** the future-day re-materialisation on switch (AC 6–7).

**Status:** Complete (2026-09-06)

---

## Outcome

Travelling, a person sees once a day *Your device is in {zone}. Synapse is on {stored zone}.* [*Switch*]; the day header reads *times in Vancouver* while the two differ. *Switch* asks *Switch to {zone}? Today stays on {stored zone}. Tomorrow starts on {zone}.* and, on **Switch**, the stored zone changes from tomorrow: today keeps its zone, tomorrow and later planned days are re-laid out in the new one, and nothing on the current day moves. Changing the day-close time in Settings behaves the same way from tomorrow. **Nothing else changes.**

## Why / intent

- **Cross-cutting §7.3** — `users.timezone` is the stored zone, not the device's; the mismatch line once per day with *Switch* · dismiss; switching changes the stored zone from tomorrow; times on the List always in the day's zone with a small zone label in the day header only while the two differ. §7.5 — day close applies from tomorrow; *Applies from tomorrow.* §10 SY-06 — the dialog's strings. §13 call 5.
- **USE-1** — the pending pair is applied in `readPreferences` and the scheduler's per-user pass; `days` snapshot `timezone` and `day_close_time`; `resolveDayKey` uses the effective values. **SET-8** — ST-08 writes the pending pair for both fields. **SET-6** — the materialiser re-lays untouched items from slots.
- **Ground truth:** `StatusLineSlot`'s `timezoneMismatch` + `onSwitchZone` props and `TimezoneLine` (built); `timezoneMismatchText`; `AppHeader zoneLabel`; `DayHeader zoneLabel`; `ConfirmDialog`; `shell.status.timezone` (SYS-1); `useDismissed("timezone", "day", dayKey)` (the slot already does this); `TIMEZONE_REGIONS`, `detectTimezone` (`@syn/constants`); `user.updatePreferences({ pendingTimezone })` (SET-8).
- **What this slice is NOT (binding):** no ST-08 changes (SET-8 built the fields); no change to `resolveDayKey`; no DST logic (USE-1).

**Rulings this slice makes (labelled, logged):**

- **The device zone is read in one hook**, `useDeviceZone()` in `apps/web/lib/hooks/` (`Intl.DateTimeFormat().resolvedOptions().timeZone`, re-read on `visibilitychange`); every consumer — the slot, the header label — takes its value from the hook. Logged.
- **The mismatch compares the device zone with `shell.status.timezone`** (the effective stored zone), not with a day's snapshot; the *label* compares the device zone with the **day's** snapshot (`DayView.timezone`) — a past day lived in another zone shows its label even at home. Logged.
- **`zoneLabel` is *times in {city}*** where the city is the IANA id's last segment with underscores as spaces (`America/Vancouver` → *Vancouver*; `Europe/London` → *London*; `UTC` → *UTC*); `zoneCityLabel(iana)` in `@syn/utils` `time.ts`. Logged.
- **Switch writes the pending pair** (`pendingTimezone = deviceZone`, `pendingTimezoneFrom = tomorrow's key` computed server-side in `updatePreferences` from the effective values) — SET-8's mechanism, called from the dialog. Logged.
- **Applying a pending zone or day-close re-lays untouched future days**: USE-1's application step gains an `afterSettingsApplied(rls, userId, { timezone?, dayCloseTime? })` hook (in `services/user/apply-pending-settings.ts`, which SYS-2 creates and USE-1's two call sites call) that, for every `days` row with `date >= from` and `closed_at IS NULL`, updates the snapshot columns and re-runs SET-6's `materializeDay` with the day's own template and anchor (untouched items get new absolute times; touched items keep theirs — the predicate). Days with no template but one-offs: the one-offs' wall-clock times are preserved by recomputing `scheduled_start` from the old snapshot's wall clock into the new zone (`instantToWallClockMinutes` → `wallClockToInstant`). Logged (`TECHNICAL-DECISIONS.md`).
- **The mismatch line is suppressed while first run is owed and on the `(setup)` group** (FR-01 sets the zone). Logged.

## Experience & states

### The status line (SY-06)

`ShellStatusLine` (SYS-1) gains: `timezoneMismatch = deviceZone !== status.timezone ? { deviceZone, storedZone: status.timezone } : undefined`, `onSwitchZone` → opens the dialog. The slot's own priority and day-scoped dismissal apply.

### The dialog

`ConfirmDialog` title *Switch to {zone}?* · description *Today stays on {stored zone}. Tomorrow starts on {zone}.* · cancel **Keep** · confirm **Switch** (secondary emphasis, not destructive) · `busy` while saving → `user.updatePreferences({ pendingTimezone: deviceZone })` → invalidate `shell.status` and `day.get`; the line disappears (dismissed for the day by the slot's rule, and the mismatch will resolve tomorrow).

### The zone label

`PageFrame` (SYS-1) gains `zoneLabel` on the day routes: USE-2's page passes `day.timezone`; the frame's client leaf computes `deviceZone !== day.timezone ? zoneCityLabel(day.timezone) : undefined` and hands it to `DayHeader zoneLabel` / `AppHeader zoneLabel`.

### The application hook

`apply-pending-settings.ts` as ruled, called by `readPreferences` (USE-1's apply step) and the scheduler's per-user pass. Idempotent: a day already carrying the new snapshot is skipped.

**States (exhaustive):** no mismatch · mismatch (line) · dismissed-for-day · dialog · switching · switched (line gone; label until tomorrow) · past day in another zone (label only) · setup-owed (suppressed).

**Failure / edge states:** the device zone is unknown to `TIMEZONE_REGIONS` (a new IANA id) → the line still shows with the raw id; *Switch* writes it (the validator accepts any `Intl`-valid zone — check `timezoneSchema`) · the pending zone is applied while the person is mid-day in the *new* zone (they flew yesterday and switched) → today's key is computed under the effective values after application; USE-1 owns that boundary; this ticket verifies AC 6 · a future day with touched items (a done tomorrow item — impossible; a timer session on a future day — impossible) → the predicate holds anyway.

## Non-negotiables (this slice)

- **The device zone is read in one hook.**
- **A switch never moves anything on the current day.**
- **Future untouched days are re-laid out in the new zone; their wall-clock plan is preserved.**
- **Times render in the day's snapshotted zone**, everywhere, always (USE-1's rule, reaffirmed).
- **Every string is cross-cutting §7.3 / SY-06 verbatim.**

## Data & AI

**Schema changes: none.**

**Tables:** `users` (pending pair via SET-8's procedure) · `days` (update snapshots on application) · `day_items` (re-materialised via SET-6's service).

**Placement:** `apps/web/lib/hooks/use-device-zone.ts`; `components/page-frame/` extended (zone label, mismatch source); `components/zone-switch-dialog/` (or inside `page-frame/`); `zoneCityLabel` in `@syn/utils`; `services/user/apply-pending-settings.ts` with USE-1's two call sites updated (re-check USE-1's AC 14).

**tRPC / validators:** `user.updatePreferences` (exists). No new procedure.

**AI notes:** **None.**

## Accessibility

- The status line names both zones so a screen-reader user can tell which is which (the copy does this).
- The dialog's confirm is *Switch*, matching the line's action (official §10.3: the confirmation reuses the verb).
- The zone label is a caption in the header, read after the title; it is not a live region.

## Acceptance criteria (observable — override the device zone with DevTools sensors or `TZ=`; the smoke account in `America/Vancouver`)

1. With the device in `Europe/London`, the slot reads *Your device is in Europe/London. Synapse is on America/Vancouver.* [*Switch*] with a dismiss; dismiss hides it for the day; it returns tomorrow (SQL-shift or wait).
2. The day header reads *times in Vancouver* while the mismatch holds; at home (zones equal) no label; on `/day/{a past day whose snapshot is Europe/London}` the label *times in London* shows even at home.
3. *Switch* → the dialog with the two zones in the document's sentences; **Keep** closes; **Switch** writes `pending_timezone = Europe/London`, `pending_timezone_from = tomorrow`, leaves `timezone` unchanged, and the line is gone; today's items' times on the List are unchanged (compare before/after). *(Mason.)*
4. `/settings/day` shows the pending zone with *Applies from tomorrow.* (SET-8's behaviour, verified here).
5. During first run, no mismatch line appears.
6. SQL-set `pending_timezone_from = today` and reload: `user.me.timezone` is the new zone; today's `days` row keeps its old snapshot and times; tomorrow's planned day has `timezone = Europe/London` and its untouched items' `scheduled_start` moved to the same wall-clock times in London; a one-off on tomorrow likewise; `original_scheduled_start` on those rows **changed too**? — **No**: `original_scheduled_start` is immutable; it stays at the old instant. **Ruling:** a re-laid future item's `original_scheduled_start` is the old instant, which is honest (the plan was made under the old zone) and harmless (no ghost until it is started; if it is later started late, the ghost draws at the old instant's position in the new zone's axis — `[REVISIT: if this reads wrong in use, exempt never-started future items from immutability by deleting and re-inserting them]`). Verify the trigger did not raise. *(Mason.)*
7. The same for a pending day-close: `pending_day_close_time = 05:00` applied → today's row keeps `03:00`, tomorrow's row has `05:00`, `resolveDayKey` at 04:30 tomorrow returns tomorrow's date (not the day before). *(Mason.)*
8. `grep -rn "resolvedOptions().timeZone" apps/web packages` matches exactly one file.
9. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `Intl.DateTimeFormat().resolvedOptions().timeZone` can return `undefined` in odd embeds; fall back to the stored zone (no mismatch).
- The re-lay for template days is `materializeDay` with the existing `template_id` and `anchor_time`; for one-off-only days, a small loop over items computing `wallClockToInstant(date, instantToWallClockMinutes(scheduled_start, oldZone), newZone)`.
- Keep the application hook's work bounded: only days from `from` to the last planned day.

## Dev's call

Where the dialog component lives · whether the re-lay runs inline in the read path or is deferred to the scheduler's pass only when it touches more than N days (recommend inline; it is a handful of rows).

## Out of scope

- **DST arithmetic** — USE-1.
- **ST-08's fields** — SET-8.
- **A per-day zone override** — never.
- **Offline conflict rules** — Phase 2.

## Depends on

- **USE-1** — the pending-pair application sites, `wallClockToInstant`, `instantToWallClockMinutes`, `DayView.timezone`. Complete in `../epic-2-in-use/PROGRESS.md`.
- **SET-8** — `updatePreferences` with `pendingTimezone`. Complete in `../epic-1-setup/PROGRESS.md`.

## Recommended execution

**Sonnet.** One hook, one dialog, one service hook with a stated rule and Mason's review on the two arithmetic criteria. The failure mode of choosing down is reading the device zone in a second place — the grep catches it.

---

### Kickoff (paste into the session)

> Build **SYS-2 — Time: the device-zone check, SY-06, the zone label, and the deferred switches applied** (attached spec). Model: **Sonnet**. **One hook reads the device zone; a switch never moves today; future untouched days are re-laid out preserving their wall-clock plan; times render in the day's snapshotted zone.**
> Attach/read first, in order: this spec · cross-cutting §7.3, §7.5, §10 SY-06, §13 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · USE-1 (`readPreferences`' apply step, the wall-clock helpers) · SET-6 (`materializeDay`) · SET-8 (`updatePreferences`) · SYS-1 (`PageFrame`, `ShellStatusLine`) · `packages/ui/src/composed/feedback/status-line/presets.tsx` (`TimezoneLine`) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `../epic-1-setup/TECHNICAL-DECISIONS.md` (the pending pair) · `../epic-2-in-use/TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
