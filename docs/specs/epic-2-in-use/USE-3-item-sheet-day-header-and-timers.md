# USE-3 — Item sheet and day header: IT-01, DH-01, DH-02, the timer engine, and the tick store

**Epic:** USE — In Use · **Phase 2** · Size: L
**Slice type:** The one sheet that holds everything about an item, the four-row day sheet, and a timer that must survive a closed sheet, a reload, and a second device. The risk class is *a lost minute*: a session that never ended, an elapsed time that drifts, two timers running where one may, a late start that did not leave a ghost.
**Vigil:** review the timer by inducing — start, close the sheet, reload the tab, check the row; start on device A, open device B; start a second timer on another item; mark done with a timer running; let the day auto-close with a timer running. QA states which of the five it exercised.

**Status:** Not started

> **Vigil — timer review.** A timer is a promise about time. Verify every path in the list above against the `timer_sessions` rows, not the screen.

---

## Outcome

Tapping a row opens the item: icon, title, chip, type word; the time line; the state line when there is one; the preflight note; the timer with *Start* / *Stop* (and *Pause* / *Resume* once USE-4 lands) and its sessions; the quantity field when the habit has a unit; the reflection steppers and note when configured or done; and *Not today* · *Done* at the bottom. Starting a passed item leaves a ghost the Schedule will draw (USE-5) and the row reads *moved* once done. Only one timer runs at a time outside a multitask group. Tapping the day header opens four rows — *Set wake time*, *I have less time today*, *Shift my day*, *Add a one-off* — and *Set wake time* records when the day really started. The elapsed time ticks in the row, the sheet, and the tab title without the list re-rendering. **Manual time (IT-02), pause/resume, and the one-off *Edit*/*Remove* actions are USE-4**; the two middle day-header rows open nothing until USE-6/7 (they are `hidden` until then).

## Why / intent

- **Official spec §5.2 (interactions), §5.4 (timers), §5.5 (multitask), §5.9 (active state)** — Start/Stop on the sheet; starting sets `active`; stop does not mark done; done does not require a timer; manual entry always available; only one timer at a time except inside a multitask group; the running glyph is pulse-free; no motion beyond the digits.
- **Official spec §5.3 (late start)** — ghost-and-annotate: starting a passed item leaves a ghost at `original_scheduled_start` and creates the live position at now with a violet border and *moved*.
- **Epic 2 §3 (DH-01, DH-02) and §4 (IT-01)** — every read, interact, rule, and state. §0.1 rules 1–3. §12 call 1 (the quantity tail), call 9 (foregrounded pushes surface nothing).
- **Cross-cutting §1.2, §1.3** — sheets never navigate; back closes the topmost sheet; a dirty form asks. §3.4 — the item sheet's initial focus is on the title. §6.4 — a timer started on one device shows on the other once synced. §9.3 G1, G3 — the one-off actions and the record-mode sheet (USE-4 wires G1; **G3's record-mode sheet is this ticket**: no *Not today*, the date in the header, any change stamps `review_edited_at`).
- **`apps/web/lib/stores/README.md`** — the running-timer tick is the first sanctioned Zustand store, built here.
- **Ground truth:** USE-2's `day-list/` (its `onOpen`), `item.setDone`, the optimistic grammar, `useUndoWindow`; USE-1's `deriveItemState`, `DayView`; SET-6's `OneOffSheet`; `@syn/ui` `ResponsiveSheet` (`header`, `footer`, `initialFocus="title"`), `ItemIcon`, `CategoryChip`, `TimeText`, `PreflightNote`, `TimerDisplay`, `TimerControl`, `SessionRow`, `NumberUnitInput`, `ReflectionBlock`, `Stepper17`, `Textarea`, `ActionRowSheet`, `TimeField`, `Button`, `toastUndo`; `lib/hooks/use-elapsed.ts` (INF-8); `NOTE_MAX = 500`, `UNDO_SHORT_MS`.
- **What this slice is NOT (binding):** no IT-02, no pause/resume, no *Edit*/*Remove* one-off (USE-4); no Schedule rendering of the ghost (USE-5 — this ticket writes the data the ghost is drawn from); no shift or trim (USE-6/7); no reason asked anywhere (*Not today* asks none).

**Rulings this slice makes (labelled, logged):**

- **The item sheet is a feature folder** `apps/web/components/item-sheet/{use-item-sheet.ts, item-sheet.tsx, timer-region.tsx, copy.ts, index.ts}` opened by `?sheet=item&id=…` on `/today`, `/day/{date}`, and (USE-5) the Schedule; USE-8's landings open it the same way. The sheet reads its item from the `day.get` cache by id and owns its mutations. Logged.
- **The timer engine is three mutations and one store.** `timer.start({ itemId })` inserts an open session, sets `completion_state = active`, applies the late-start rule, and — outside a multitask group — ends any other running session for the user (returning `{ stopped: { itemId, title } }` for the toast); `timer.stop({ itemId })` ends the open session and returns `completion_state` to `upcoming` (or leaves `done`); `timer.pause`/`resume` are USE-4's. The store `lib/stores/use-timer-store.ts` holds `{ itemId, startedAt, accumulatedSec, status }` seeded from `DayView` (the active item's running session and prior sessions' total), publishes `elapsedSec` at 1 Hz, and is re-seeded on every `day.get` refetch (the second device). Logged (`TECHNICAL-DECISIONS.md`).
- **Late start** (the rule the engine applies in `timer.start`): if the item is `passed` at start time (per `deriveItemState`), set `scheduled_start = now`, `scheduled_end = now + duration` (or the window's remaining? **No** — for a passed window, `now + duration`), leave `original_scheduled_start`; the row reads *moved* once done because `isOffSchedule` is true. Logged.
- **Done from the sheet is `item.setDone`** (USE-2's mutation) — one write path for done, everywhere. It ends a running session. Logged.
- **`Not today`** is `item.defer({ id, deferred: true | false })` → `deferred_at`; the sheet's button reads *Back in the list* when deferred; the row's inline *Undo* for 5 s reverts. Logged.
- **Quantity and note save on blur and on close; reflection steppers save on change** — three thin mutations `item.setQuantity`, `item.setNote`, `item.rate`, all optimistic. Logged.
- **DH-01's two middle rows are `hidden`** until USE-6/7 wire them; the `ActionRowSheet` supports `hidden` per row. Logged.
- **The record-mode sheet** (G3): opened from `/day/{past}`, the header shows the date, *Not today* is absent, *Done* / *Undo done* present, timer and manual time present (a past session is still a record), any write stamps `review_edited_at` (the mutations do this when the day is closed — the `set-done` service already does; extend the others). Logged.
- **The document title** shows the elapsed time while a timer runs (`{m:ss} · Synapse`), from the store, so a backgrounded tab still tells the time. Logged. `[Vesper: allowed — it is a time, not a number about the day.]`

## Experience & states

### IT-01 Item sheet

`ResponsiveSheet` `size="tall"` `initialFocus="title"` with `header` = the identity row (`ItemIcon` 24 · title as the focusable `h2` · `CategoryChip` · type word `Text tone="secondary"` *habit* / *task* / *deep work* · in record mode a second line with the date) and `title` = the item's title for AT.

Body, in order: the time line (`Text`: *at 7:20* · *between 1:00 and 4:00* · *anytime*, then *· {duration} min*, then *Fixed* when `scheduling = hard`) · the state line when any (*done 4:32 — moved from 7:20* · *done 7:24* · *carried from Thursday* · *not today* · *timer running · {elapsed}* · *time logged: {total} min in {n} sessions*) · `PreflightNote` labelled *Before starting* when present · **Timer**: `TimerDisplay elapsedSec status` + `TimerControl status onStart onStop pauseEnabled={false}` (USE-4 enables) · a text link *Add time by hand* (USE-4 — render disabled with no handler? **No** — omit until USE-4; log) · `SessionRow`s for each session (*7:22–7:31 · 9 min*, `onEdit` USE-4 — omit the affordance until then) · **Quantity** (`NumberUnitInput label={unit} unit decimal`) only with a unit · **Reflection** (`ReflectionBlock`) only with axes or when done · footer: *Not today* (ghost; *Back in the list* when deferred; absent when done or in record mode) · *Done* (primary) / *Undo done* (secondary when done).

Close (swipe, scrim, Esc, corner) saves pending quantity and note first (`dirty` is false — these autosave; the sheet has no discard prompt).

### The timer

*Start*: optimistic `status = running`, `startedAt = now` in the store; `timer.start` → if another timer stopped, `toastUndo("Stopped {other}", 5 s)` whose undo swaps them back (`timer.start(other)` — which stops this one); the row shows elapsed in place of the time. *Stop*: `timer.stop`; the state line becomes *time logged*. Tick: one `setInterval(1000)` in the store while `status === "running"`, `elapsedSec = accumulatedSec + (now − startedAt)`; consumers select by item id. Multitask: a second start inside the same `multitask_id` does not stop the first (the service checks; the store holds one `itemId` per running session — extend to a small map keyed by item id).

### DH-01 Day header sheet

`ActionRowSheet` (`?sheet=day-header`) `title` *{Weekday} {day} {Month}* · `subtitle` *{template} · starts {anchor} · Woke {time}* or *Wake time not set* (+ *Closed at {time}* when closed) · rows: *Set wake time* → DH-02 · *I have less time today* (`hidden` until USE-7; hidden when closed) · *Shift my day* (`hidden` until USE-6; hidden when closed) · *Add a one-off* → `OneOffSheet date={today} allowDateChange` · `closeLabel="Close"`.

### DH-02 Set wake time

`ResponsiveSheet` *Wake time* · body by source (*Marking your wake-up habit done sets this on its own. Or set it here.* · *Set at {time} by {habit}.* · *Set by hand.*) · `TimeField label="Woke at"` default the anchor's `done_at` else `anchor_time`, `min`/`max` bounding to the day's window · *Clear* (ghost, when set by hand) · *Cancel* · *Save* → `day.setWakeTime({ date, wokeAt | null })` → `woke_at`, `woke_at_source = manual`; the parts recompute.

**States (exhaustive):** IT-01: upcoming · soon/now/open/closing (same layout) · active · done · done-off-schedule · deferred · carried · record-mode · saving (the primary `busy`; the sheet stays) · error (*Couldn't save. Your changes are kept — try again.*) · offline (writes fail and revert; the sheet says the sentence). DH-01: open · closed-day (two rows absent) · offline. DH-02: unset · set-by-anchor · set-by-hand · saving · offline.

**Failure / edge states:** `timer.start` fails after the optimistic tick → the store resets, the row's time returns, the sentence shows · the day auto-closes with a timer running → USE-1 ended the session; the next refetch re-seeds the store to idle · two devices start the same item → the second `timer.start` finds an open session and returns it (idempotent; one session, cross-cutting §6.4) · the sheet's item disappears from the cache (removed elsewhere) → the sheet closes.

## Non-negotiables (this slice)

- **Done never requires a timer, a quantity, or a reflection.**
- **Stop never marks done. Done ends a running session.**
- **One running timer per person outside a multitask group**, enforced in the service, surfaced with the 5-second swap toast.
- **A late start leaves `original_scheduled_start` untouched.** The DB trigger enforces it; the service never sets it.
- **The store is never the source of truth for whether a timer exists** — the session row is; the store is re-seeded on refetch.
- **No reason is asked here.** *Not today* asks nothing.
- **No motion beyond the digits changing.**

## Data & AI

**Schema changes: none.**

**Tables:** `timer_sessions` (insert, update `ended_at`) · `day_items` (update `completion_state`, `scheduled_start/end` on late start, `deferred_at`, `quantity_value`, `notes_reflection`, `reflection_ratings`) · `days` (update `woke_at`, `woke_at_source`, `review_edited_at`).

**Placement:** routers `timer.ts` (new) and `item.ts`, `day.ts` (extended) (rule 3); services `services/day/{start-timer,stop-timer,defer-item,set-quantity,set-note,rate-item,set-wake-time,late-start}.ts`; validators `packages/validators/src/{timer,item,day}.ts` extended; feature folders `components/item-sheet/`, `components/day-header-sheet/`; the store `apps/web/lib/stores/use-timer-store.ts` (rule 13); `use-elapsed.ts` removed if it has no consumer left (log it).

**tRPC / validators:** `timer.start` · `timer.stop` · `item.defer` · `item.setQuantity` · `item.setNote` · `item.rate` · `day.setWakeTime`.

**AI notes:** **None.**

## Accessibility

- The sheet announces the item's title on open (`initialFocus="title"`); the header's title is the focus target.
- `TimerDisplay` is `aria-live="off"` (official §11); the state line updates politely once on start/stop.
- `TimerControl`'s buttons carry the item's title in their accessible names (*Start Morning run*).
- The quantity field's unit is part of its label; decimal input uses `inputmode="decimal"`.
- `Not today` / `Back in the list` is a ghost button, not a link; its change is announced.
- DH-01 rows are 56px buttons; DH-02's time field is native.

## Acceptance criteria (observable — compact and wide; the Vigil list run and stated)

1. Tapping a row opens the sheet with the identity row, time line, and footer; the URL gains `?sheet=item&id=…`; back closes it and the List is exactly where it was.
2. *Start* on an upcoming item: the row's time becomes the elapsed digits within a second; `timer_sessions` has an open row; closing the sheet and reloading the tab shows the row still ticking with the right elapsed; the document title shows the elapsed. *(Vigil.)*
3. *Stop* ends the session (`ended_at` set), the state line reads *time logged: {n} min in 1 sessions*, the row returns to its time; `completion_state` is `upcoming`.
4. Starting a second item shows *Stopped {first}* [*Undo*] for 5 s; the first's session is ended; *Undo* restarts the first and stops the second. Inside a multitask group both run. *(Vigil.)*
5. *Start* on a passed item sets `scheduled_start = now` and leaves `original_scheduled_start`; after *Done* the row reads *moved* with *7:45 → 14:52* in violet. *(Vigil.)*
6. *Done* with a running timer ends the session and marks done; the sheet closes; the row shows done with inline *Undo*.
7. A quantity typed and the sheet closed → `quantity_value` saved and the row's *add {unit}* tail gone; a note typed → `notes_reflection` saved on close; a stepper change saves at once.
8. *Not today* moves the row to the bottom of its part at 0.55 with *not today*, `deferred_at` set; the row's *Undo* (5 s) and the sheet's *Back in the list* both clear it.
9. Device B (a second browser) opens the day after A starts a timer: B's row ticks with the same elapsed; B's *Stop* ends it for both on the next refetch. *(Vigil.)*
10. With a timer running, shift the day's window end into the past by SQL and run the scheduler: the session ends at the window end and the next refetch shows the row idle and the day in record mode. *(Vigil.)*
11. The day header opens DH-01 with the subtitle and four rows, two of them hidden (only *Set wake time* and *Add a one-off* visible); *Set wake time* → DH-02 with the anchor's time when set; saving 07:10 by hand sets `woke_at_source = manual` and the Morning span recomputes; *Clear* reverts to the planned anchor.
12. On `/day/{yesterday}` the sheet shows the date in the header, no *Not today*, and *Done* on an undone item stamps `review_edited_at`.
13. Opening the sheet while the list has 30 items and starting a timer: only the ticking row and the sheet re-render on the tick (React DevTools). *(Mason.)*
14. Offline: *Start* ticks optimistically, then reverts with *Couldn't save. Your changes are kept — try again.*; the sheet stays open.
15. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- The store: `create<TimerState>()` with `start(itemId, startedAt, accumulatedSec)`, `stop(itemId)`, `seed(dayView)`, and a module-level interval started on the first running entry and cleared on the last stop. Select with `useTimerStore((s) => s.elapsedFor(itemId))` to keep re-renders local.
- `DayItemView.timerElapsedSec` from the API is the seed; after that the store is authoritative for display and the query for existence.
- Late start needs `deriveItemState` at request time — the service calls it with the server clock; the client's optimistic patch does the same with its clock; they agree to the second.
- The one-timer rule's swap toast needs the stopped item's title — return it from `timer.start`.
- `document.title` is set in the store's subscriber inside a `"use client"` leaf mounted once in the shell (`timer-title.tsx`), not in the sheet.

## Dev's call

The store's shape for multitask (a map vs a single entry plus a group id) · whether the sessions list is inline or collapsed past three · the record-mode header line's exact format (date only, per the document).

## Out of scope

- **IT-02 manual time, session edit, pause/resume, the *Edit*/*Remove* one-off actions, *From {template}* line** — USE-4.
- **Drawing the ghost and the live block** — USE-5.
- **Shift and trim rows' targets** — USE-6, USE-7.
- **N8 persistent timer notification** — Phase 2.
- **Sign-out's timer flush** — SET-8's dialog gains the flush here: on *Sign out* with a running timer, `timer.stop` first; offline, the dialog's offline body. (Re-check SET-8's AC 2.)

## Depends on

- **USE-2** — the List, `item.setDone`, the optimistic grammar, `useUndoWindow`. Complete in `PROGRESS.md`.
- **SET-9** — the permission sheet's predicate (so *Add a one-off* from the day header behaves like WK-03 everywhere). Complete in `../epic-1-setup/PROGRESS.md`.

## Recommended execution

**Opus.** The timer is a small state machine spread across a store, three mutations, a trigger-protected column, and two devices. A cheaper model gets the happy path and leaves a session open on auto-close, or double-runs on the second device — and the record is what the product is.

---

### Kickoff (paste into the session)

> Build **USE-3 — Item sheet and day header: IT-01, DH-01, DH-02, the timer engine, and the tick store** (attached spec). Model: **Opus**. **One running timer outside a multitask group; stop never marks done; a late start never touches `original_scheduled_start`; the session row is the truth and the store is re-seeded from it.**
> Attach/read first, in order: this spec · Epic 2 §3 (DH-01/02), §4 (IT-01), §0.1, §12 · official spec §5.2 (interactions), §5.3 (late start), §5.4, §5.5, §5.9 · cross-cutting §1.2, §1.3, §3.4, §6.4, §9.3 (G3) · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · `apps/web/lib/stores/README.md` · USE-2 (`day-list/`, `item.setDone` — reuse) · USE-1 (`deriveItemState`) · SET-6 (`OneOffSheet`) · `packages/ui/src/composed/{layout/responsive-sheet,layout/action-row-sheet,control/timer-control,display/timer-display,display/session-row,control/number-unit-input,control/reflection-block}/` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `../epic-1-setup/DEVIATIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Run the five Vigil paths and state each. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
