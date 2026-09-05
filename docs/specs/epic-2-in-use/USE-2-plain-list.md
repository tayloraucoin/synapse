# USE-2 — Plain List: LS-00/01/02/03, done and undo, the wake anchor, and record and plan modes

**Epic:** USE — In Use · **Phase 1** · Size: L
**Slice type:** The surface a person touches most, on a phone, at arm's length. The risk class is *a tab that thinks*: a count, a question, a spinner over a row, a passed item that stopped responding, a done that waited for the server.
**Vigil:** none — but the **worst-moment test** (official §14) is the review: one-handed, arm's length, every action a 44px target, nothing asks. **Vesper review** of the day header and the expanders on compact.

**Status:** Not started

> **Vesper — worst-moment review.** Open today on a phone with the seeded day. Check off three items with a thumb without looking closely. If anything on the screen made you read a number, answer a question, or wait, it is a defect against this ticket, not a preference.

---

## Outcome

Today, top to bottom, in time order: the day header, the status line, *Morning · 7:04–15:04* and its rows, then Afternoon, Evening, *Anytime*; each row a checkbox, an icon, a title, one word of state when there is one, and a time. Tapping the checkbox marks it done at once with an inline *Undo* for five seconds; tapping it again undoes with the same grace. Marking the wake-up habit done sets the day's wake time and the sections re-anchor. Trimmed and cut items sit under two collapsed lines. *Day Complete* is at the very bottom. A past day renders as a record; a future day as a plan with *Not until Thursday*. An unplanned day says *Nothing planned today.* and offers two doors and, when there is history, a third. **The row opens nothing yet** (USE-3) — tapping a row is a no-op with `onOpen` undefined, which `ItemRow` already renders as a non-interactive body.

## Why / intent

- **Official spec §5.2** — the layout, the day-part sections, the row, the now/soon marker, off-schedule violet, passed at 0.55, multitask brackets, the not-assigned expander, done with 5-second undo. §5.9 — the state matrix. §5.10 — the copy register. §2.4 — the eight guardrails.
- **Epic 2 §0.1** — the nine execution-budget rules. **§2 (LS-00, LS-01, LS-02, LS-03)** — every read, every interact, the row-state table, the screen states. §0.3 — the final vocabulary. §12 — calls 1 (quantity tail), 2 (*Do it anyway*), 3 (*Apply {most-used template}*).
- **Cross-cutting §8.2** — record mode and plan mode, verbatim; §8.3 archived habits on old days; §9.3 G4 (where a one-off lands).
- **`apps/web/AGENTS.md` § Product non-negotiables** — every one binds this screen.
- **Ground truth:** USE-1's `day.get`, `useNow`, `useDerivedItems`, `DayView`; SET-6's `DaySheet`, `OneOffSheet`, `week.applyTemplate`; SYS-1's `AppShell`, `AppHeader` convention, `StatusLineSlot` (`lateOffer` is a prop this ticket does not supply yet — USE-6), `?sheet=` nuqs convention; `@syn/ui` `ItemRow`, `DayHeader`, `DayPartHeader`, `MultitaskGroup`, `ExpanderSection`, `DayCompleteAction`, `EmptyState`, `SkeletonRow`, `RegionRetry`, `StateWord`, `toastUndo`, `ScreenFrame`; `@syn/constants` `UNDO_SHORT_MS`, `UNDO_LONG_MS`; `reviewDayRoute`, `todayRoute`, `dayRoute`.
- **What this slice is NOT (binding):** no item sheet, no day header sheet (USE-3 — the `DayHeader`'s `onOpen` is undefined until then); no Schedule (USE-5); no shift or trim writes (USE-6/7 — the expanders render what the read model has, and *Bring back* / *Do it anyway* are wired here because they are list actions, per the rulings below); no Day Review (REV-2 — *Day Complete* links to `reviewDayRoute(today)`).

**Rulings this slice makes (labelled, logged):**

- **The List is a feature folder** `apps/web/components/day-list/{use-day-list.ts, day-list.tsx, day-section.tsx, copy.ts, index.ts}` rendered by `/today` and `/day/{date}` (both tabs share the day; USE-5 adds `schedule-canvas/` beside it). The page is a Server Component that reads `day.get` through the server caller and passes the initial `DayView`; the hook subscribes to the same query on the client and owns mutations. Logged.
- **Done and undo are optimistic and idempotent.** `item.setDone({ id, done: true | false, at })` writes `done_at`/`completion_state` and stops a running session; the client patches the `day.get` cache before the request and reverts with *Couldn't save. Try again.* `[COPY — needs Vesper sign-off: LS-01 gives the load error, not the write error]` on failure. The 5-second inline *Undo* is `ItemRow`'s `undo` prop (the state-word slot), not a toast, per LS-01. Logged.
- **Undo restores the original `done_at`** (the document: "restores the done state with the original `done_at`") — the client keeps it for the window and sends it back. Logged.
- **The wake anchor sets `woke_at` in the same mutation** (`item.setDone` on the anchor item → `days.woke_at = done_at`, `woke_at_source = anchor`) and the sections recompute from the response. Undo on the anchor clears `woke_at` only if `woke_at_source = anchor` and no manual override exists. Logged.
- **`Bring back` (LS-02) and `Do it anyway` (LS-03) live here** as `item.bringBack` and `item.doAnyway` — they are list actions on faded rows, and the expanders are this screen's. USE-6/7 write the states these undo. `doAnyway`: `assignment_state = assigned`, `completion_state = upcoming`, `time_mode = unscheduled`, `scheduled_* = null`, the `misses` row deleted. Logged.
- **`Apply {most-used template}`** on LS-00: the most-used template by `days.template_id` count over the last four weeks, via `week.mostUsedTemplate()`; hidden with no history; applies at the template's anchor and shows `toastUndo("Applied {name}", 10 s)` whose undo calls `week.removeTemplate`. Logged.
- **Record-mode edits stamp the review.** A done/undone on a closed day sets `days.review_edited_at` (cross-cutting §8.2) in the same mutation; the number is recomputed on read (REV-1). Logged.
- **Plan mode renders `ItemRow variant="read-only"`** with no checkbox and the muted line *Not until {weekday}* in the header (`DayHeader notUntilWeekday`); rows open a read-only sheet in USE-3. Logged.
- **`Day Complete` is a link** (`DayCompleteAction reviewHref`) to `reviewDayRoute(today)`; the review does the closing. Logged.

## Experience & states

### `/today` and `/day/{date}` (LS-01)

Server: `resolveTodayFor` → if `date === todayKey`, `/day/{date}` redirects to `/today` (SYS-1's rule); `day.get(date)` → `DayView`. The page renders `AppShell`'s `header` as `DayHeader` (the whole region is the tappable control; `onOpen` undefined until USE-3): `dateLabel` *{Weekday} {day} {Month}* · `templateName` or *No template* · `wokeAtLabel` *Woke {time}* when set · `shiftedMin` → *Shifted +{n} min* · `zoneLabel` (SYS-2 supplies; a prop here) · `mode` · `notUntilWeekday` in plan mode; in record mode the `AppHeader`-level `dateContext` with a *Today* action is SYS-1's — this ticket passes `mode`. `contentWidth="text"`.

Body inside `ScreenFrame`: per part a `DayPartHeader part span` then a `ul` of `ItemRow`s (`timeZone={day.timezone}`, `onToggleDone`, `onOpen` undefined, `undo` when this row is in its 5-second window), grouped inside `MultitaskGroup` where `multitask !== "none"`; deferred rows sorted to the bottom of their part (the hook sorts; the read model keeps time order). The *Anytime* part only when it has items. Then `ExpanderSection heading="Not assigned today" explanation="Trimmed to fit {capacity} min. These don't count."` with faded `ItemRow variant="faded-with-action" action={Bring back}` rows; `ExpanderSection heading="Cut when shifted" explanation="Shifted +{n} min at {time} — {reason}."` with `action={Do it anyway}` rows; each expander absent when empty. Then `DayCompleteAction closedAtLabel reviewHref` (in `live` mode; in `record` mode the closed line with *Review*; absent in `plan` mode).

Every string from `copy.ts`: the day-part words are `DayPartHeader`'s; *Not assigned today*, *Cut when shifted*, *Bring back*, *Do it anyway*, *Day Complete*, *Day closed at {time}*, *Review*, *Nothing planned today.*, *Plan this day*, *Add a one-off*, *Apply {name}*, *Not until {weekday}*, *Couldn't load today. Pull to try again.*

### LS-00 Empty day

`EmptyState density="page" text="Nothing planned today." actions=[Plan this day, Add a one-off, Apply {name}?]` under the day header. *Plan this day* opens `DaySheet date={today}` (`?sheet=day-plan`); *Add a one-off* opens `OneOffSheet date={today} allowDateChange` (`?sheet=one-off`); both `onSaved` invalidate `day.get`. In record mode: *Nothing was planned.* `[COPY — needs Vesper sign-off]` with no actions; in plan mode the same two actions for that date.

### The checkbox

`onToggleDone(item)`: if not done → optimistic `done`, `doneAt = now`, `state` recomputed (`done` or `done-off-schedule`), the `undo` prop set for `UNDO_SHORT_MS`; a running timer's elapsed disappears (the session ends); on the anchor, `wokeAtLabel` appears from the response. If done → optimistic `upcoming`/`passed` (re-derived), `undo` for `UNDO_SHORT_MS` restoring the original `doneAt`. Quantity: done with a unit and no value → `ItemRow` shows *add {unit}* by itself (the composite handles it from the view).

### Pull to refresh

Compact only: a small pull gesture on the list invalidates `day.get`; scroll position is kept. Not a library — a `touchstart`/`touchmove` threshold with `aria-hidden` feedback text *Refreshing…* `[COPY — needs Vesper sign-off]`. On wide there is no gesture; the query refetches on focus.

**States (exhaustive):** live · record · plan · empty (LS-00 in each mode) · closed (the `DayCompleteAction` closed variant) · loading (skeleton rows under real part headers when the query has cached data, else three `SkeletonRow` under a skeleton header) · error (`RegionRetry` with the sentence, cached rows shown when any) · offline (the shell's line; **Phase 1: writes blocked** — the checkbox is disabled? **No.** Faded is not disabled and offline must not look like disabled: the checkbox stays enabled, the optimistic patch applies, the mutation fails, the row reverts with the sentence. `[Vesper call, logged: a tap that visibly does nothing is worse than a tap that reverts with a sentence.]`) · undo-window (per row).

**Failure / edge states:** the anchor is archived → its row renders from the snapshot (§8.3); done still sets `woke_at` because the day's anchor id is the day's, resolved at read (USE-1 puts `isWakeAnchor` on the item? **No** — `DayItemView` has no such field; the hook compares `item.habitId`… also absent). **Ruling:** the `DayView` gains `wakeAnchorItemId: string | null` (USE-1's read model — a one-line extension this ticket makes and re-checks USE-1's AC 9). Logged. · a done tapped twice within 300 ms → one mutation (debounced by the in-flight guard) · the day auto-closes while open → the next refetch flips to `record` with pending rows; the checkbox still works (a record edit).

## Non-negotiables (this slice)

- **No number about the day on this screen.** Not a count in a heading, not a badge, not a progress mark. The expander headings carry a count of *items* (`{n} not assigned today`) — that is the document's own line and the only permitted number, because it is a count of things hidden, not a grade. `[Vesper: confirmed; it is in LS-01 reads 6.]`
- **Done is instant.** No spinner, no disabled state, no wait.
- **Faded rows are fully interactive**, including offline.
- **No `?` on this screen.** The late offer is SYS-1's slot and USE-6's trigger.
- **The row derives nothing.** `state` comes from `useDerivedItems`; the row reads it.
- **Every string is Epic 2 §2 or official §10.5 verbatim**; the four gaps above are marked.

## Data & AI

**Schema changes: none** (`DayView.wakeAnchorItemId` is a read-model field, not a column).

**Tables:** `day_items` (update `done_at`, `completion_state`, `deferred_at` cleared on done; `assignment_state`, `time_mode`, `scheduled_*` for `doAnyway`/`bringBack`) · `days` (update `woke_at`, `woke_at_source`, `review_edited_at`) · `timer_sessions` (end a running one on done) · `misses` (delete on `doAnyway`) · `templates`, `days` (read for most-used).

**Placement:** router `packages/api/src/routers/item.ts` (rule 3) with services `services/day/{set-done,bring-back,do-anyway}.ts`; `week.mostUsedTemplate` on the week router; validators `packages/validators/src/item.ts` (`setDoneInput`, `itemIdInput`); feature folder `components/day-list/` (rule 9); pages `app/(shell)/today/page.tsx` and `app/(shell)/day/[date]/page.tsx` replace the placeholders; `use-undo-window.ts` in `apps/web/lib/hooks/` (a 5 s/10 s window keyed by id).

**tRPC / validators:** `item.setDone` · `item.bringBack` · `item.doAnyway` · `week.mostUsedTemplate` · `day.get` (USE-1).

**AI notes:** **None.**

## Accessibility

- `ItemRow` already announces *title, state, category*; the time is in the row's text. The 5-second undo is a button in the state-word slot and is announced when it appears (`aria-live="polite"` on the slot — verify the composite; add if absent and log).
- Part headings are `h2`s; the day header is the `h1` (via `AppShell`'s header slot).
- Expanders are `CollapsiblePanel`s with the count in the trigger's name.
- Pull-to-refresh has a keyboard equivalent: the *Refresh* action is not a control (the document has none); on wide the query refetches on focus, which is the equivalent.
- `Day Complete` is a link with primary weight, reachable by Tab as the last control.
- Nothing on the screen updates a live region on the minute tick.

## Acceptance criteria (observable — compact and wide; a seeded day with fixed, window, unscheduled, multitask, and deferred items; a fixed clock or a real morning)

1. `/today` renders the header (weekday, template name), the status-line slot, *Morning* with its span, rows in time order with icon, title, and time; no count, no percentage, no greeting anywhere (screenshot both breakpoints). *(Vesper.)*
2. A fixed item 15 minutes ahead reads *soon* with the dot; at its start *now*; a window inside its span *open*; past its end the row is at 0.55 opacity and still toggles.
3. Tapping a checkbox marks done instantly (the mark draws in 120 ms, the title tone changes, *Undo* appears in the state slot); the DB row has `done_at` within a second; *Undo* within 5 s restores the row and clears `done_at`; after 5 s the slot returns to its state word.
4. Tapping a done item's checkbox undoes it with *Undo* for 5 s; using that *Undo* restores the **original** `done_at` (verify the value is the first one, not now).
5. Marking the wake-up habit done sets `days.woke_at` and `woke_at_source = anchor`; the header shows *Woke {time}*; the Morning span recomputes from it; undoing clears `woke_at`.
6. A done item with a unit and no value shows *add {unit}* after the time.
7. Two multitask members render inside one bracket with the word *multitask* once; each has its own checkbox and toggles independently.
8. A deferred item renders at the bottom of its part at 0.55 with *not today*; its checkbox still completes it and clears `deferred_at`.
9. With a trimmed item (SQL: `assignment_state = not_assigned`) the *Not assigned today* line appears with the capacity explanation; expanding shows the faded row with *Bring back*; *Bring back* returns it to its part. With a cut item (SQL: `cut_by_shift` + a `misses` row with `shift_id`) *Cut when shifted* shows the shift line; *Do it anyway* moves it under *Anytime* and deletes the miss.
10. `/day/{yesterday}` renders record mode: no `now`/`soon`, no *Day Complete* (the closed line with *Review* when closed), checkboxes still toggle and stamp `review_edited_at`; `/day/{tomorrow}` renders plan mode: no checkboxes, *Not until {weekday}* in the header, rows non-interactive; `/day/{today}` redirects to `/today`.
11. An unplanned today shows *Nothing planned today.* with *Plan this day* and *Add a one-off*; with four weeks of history, *Apply {name}* appears and applies the template with a 10-second undo toast that removes it again.
12. Offline (DevTools): the list is readable; a checkbox tap patches then reverts with the sentence; no control is disabled.
13. The load error state shows *Couldn't load today. Pull to try again.* with cached rows when any; pull-to-refresh on compact refetches without resetting scroll.
14. The list does not re-render on the minute tick except rows whose state changed (React DevTools "highlight updates"). *(Mason.)*
15. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- The optimistic patch: `utils.day.get.setData(key, updater)` in `onMutate`, snapshot for `onError`, `invalidate` in `onSettled`. Keep the updater pure and re-run `deriveItemState` on the patched item so the state word is right before the server answers.
- `useUndoWindow(id, ms)` returns `{ active, start, cancel }`; the row's `undo` prop is set from it. One window at a time per id.
- Sorting deferred rows last *within their part* while keeping time order otherwise: stable sort by `[deferredAt !== null, scheduledStart ?? +∞, sortOrder]`.
- The multitask bracket: consecutive rows sharing `multitaskId` wrap in one `MultitaskGroup`; the read model orders them adjacently.
- `wakeAnchorItemId` on `DayView`: `SELECT id FROM day_items WHERE day_id = $1 AND habit_id = users.wake_anchor_habit_id` — one extra scalar in `getDay`.

## Dev's call

The pull-to-refresh threshold and feedback · how the hook exposes rows per part to `DayList` (recommend the `DayView.parts` shape as-is plus `undoFor(id)`) · whether the two doors' sheets are mounted always or lazily.

## Out of scope

- **The item sheet and the day header sheet** — USE-3 (`onOpen` on rows and the header arrive there).
- **The Schedule** — USE-5.
- **Writing trims and shifts** — USE-7, USE-6.
- **Closing the day** — REV-2.
- **The late offer's eligibility** — USE-6 supplies `lateOffer` to the slot.
- **Keyboard navigation between rows** — SYS-4.

## Depends on

- **USE-1** — `day.get`, `useNow`, `useDerivedItems`, `DayView`. Complete in `PROGRESS.md`.
- **SET-6** — materialised days, `DaySheet`, `OneOffSheet`, `week.applyTemplate`, `removeTemplate`. Complete in `../epic-1-setup/PROGRESS.md`.
- **SYS-1** — `AppShell` mounted, the header convention, the `?sheet=` convention, the `/day/{today}` redirect. Complete in `../cross-cutting-system/PROGRESS.md`.

## Recommended execution

**Opus.** The screen is simple to look at and hard to get right: optimistic mutations with a restored original `done_at`, the anchor's side effect, the deferred sort, the expander actions, three modes, and a re-render budget. A cheaper model ships a list that waits for the server on every tap, which is the one thing the execution budget forbids.

---

### Kickoff (paste into the session)

> Build **USE-2 — Plain List: LS-00/01/02/03, done and undo, the wake anchor, and record and plan modes** (attached spec). Model: **Opus**. **No numbers, nothing red, no question, faded is never disabled; done is instant and undo restores the original; the row derives nothing.**
> Attach/read first, in order: this spec · Epic 2 §0.1, §0.3, §2 (LS-00…03), §12 · official spec §2.4, §5.2, §5.9, §5.10, §10.5 · cross-cutting §8.2, §8.3, §9.3 (G4) · `apps/web/AGENTS.md` (§ Product non-negotiables) · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · USE-1 (`day.get`, the hooks — reuse) · SET-6 (`DaySheet`, `OneOffSheet` — reuse) · SYS-1 (the shell, the sheet convention) · `packages/ui/src/composed/display/{item-row,day-header,day-part-header,multitask-group,expander-section}/` and `control/day-complete-action/` · `packages/ui/src/composed/__fixtures__/view-models.ts` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `../epic-1-setup/DEVIATIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Run the worst-moment test on a phone and say what you saw. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
