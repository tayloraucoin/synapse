# REV-3 — Traded-up, reflections, edit mode, and history: DR-04, DR-06, DR-01 in edit mode, and HS-01

**Epic:** REV — Review · **Phase 1** · Size: M
**Slice type:** Four completions of the review — one picker sheet, one collapsed block, one mode, one list. The risk class is *a record edited without a trace*: a past review changed with no stamp, a traded-up verdict that never updates, a history that shows a number for an unreviewed day.
**Vigil:** none. Induce: a traded-up choice on an active item that is finished before *Finish review*; an edit-mode *Save changes* on a day two weeks old; *Finish later* in edit mode with changes (the discard prompt).

**Status:** Not started

---

## Outcome

Choosing *Stayed on something more important* opens a picker of today's done and active items, each with the verdict it would produce, and *Something not on the list*. The reflections section opens to the day's rateable items with their steppers and notes. A reviewed day reopens in edit mode — *Reviewed {when} · edited {when}*, the same panels already decided with *Change*, *Done* expanded, and *Save changes* — and every change stamps the day as edited. History lists weeks newest first with their numbers or their review status, expanding to days that open the Day Review in edit mode, with *Export everything* at the bottom. **The Week Review is REV-4**; history's week rows link to its placeholder until then.

## Why / intent

- **Official spec §7.2** — "Stayed on something more important" opens a one-tap picker of today's done items; reflections collapsed under *Add reflections*; editing a past day's review: same screen, header says *Editing Thursday*? — **Epic 3 DR-01 supersedes with *Reviewed {when} · edited {when}***; §7.5 — history: past weeks as a plain list; past days open the Day Review in editing mode. §0.3 R2 — the verification rule. §3.11 — no cache (the number recomputes on edit).
- **Epic 3 §2 (DR-04, DR-06, DR-01 edit mode, DR-07's *Reviewed · edited*), §4 (HS-01), §8 calls 6 and 7** — every read, interact, rule, and state: DR-04's title, body, rows with verdict tails, *Something not on the list* deciding at half with *What was it?*, the empty body line; the recompute-at-finish rule for an active traded item; DR-06's heading count, per-item axes and notes, items already rated listed last, saves on change / on finish or collapse, nothing required, nothing affecting the number; edit mode's *Decided* section, *Save changes*, *Finish later* → *Discard changes?* — **Keep editing** · **Discard**; HS-01's rows, expansion, statuses, *Show earlier weeks*, the export link and its line, the empty state.
- **Cross-cutting §8.1** — reflections always editable; a past day's Miss change stamps; §9.3 G3 — the item sheet on a past day stamps the review as edited and DR-01 reflects it on return.
- **Ground truth:** REV-2's `components/review-day/`, `review.decide`, `review.changeDecision`, `review.finish`; REV-1's `review.day` (`reflections`, `result`, `mode: "edit"`), `review.history`; USE-3's `item.rate`, `item.setNote` (reflections write through the item's own mutations — one write path); SET-10's `settingsDataRoute()`; `@syn/ui` `PickerList presentation="inline"`, `ResponsiveSheet`, `ReflectionBlock`, `CollapsiblePanel`, `WeekRow`, `DayOutcomeRow form="short"`, `DiscardDialog`, `Button`, `Text`, `EmptyState`; `reviewWeekRoute`, `reviewDayRoute`.
- **What this slice is NOT (binding):** no Week Review; no reflection surface outside the review (the item sheet's is USE-3's); no change to the resolver.

**Rulings this slice makes (labelled, logged):**

- **DR-04 writes `traded_up_item_id` and nothing else about the verdict**; the panel's decided line reads the verdict from `review.day`'s `verdict` (REV-1 computes it from the traded item's current row), so an active item finishing later updates the line on the next read. Logged.
- ***Something not on the list*** writes `reason_key = stayed_on_important`, `traded_up_item_id = null`, and `reason_text` from *What was it?* (1–80) — the resolver treats a null traded item as unverified (half). Logged.
- **Edit mode's changes are batched client-side and written by `review.saveChanges({ date, changes })`** in one transaction that stamps `review_edited_at`; *Finish later* in edit mode discards the batch after the dialog. This differs from live mode (writes on tap) because the document says edit mode "discards unsaved changes after *Discard changes?*" — a discardable change cannot have been written. Logged (`TECHNICAL-DECISIONS.md`).
- **Reflections write through `item.rate` and `item.setNote`** (USE-3's mutations) on change / on collapse / on finish — one write path for a rating wherever it is entered. On a reviewed day they also stamp `review_edited_at`? **No** — reflections never affect the number; the stamp is about the number. Logged.
- **HS-01 pages by eight weeks** with *Show earlier weeks*; the first page is server-rendered. Logged.
- **A day row's status word** is REV-1's `status`: `reviewed` → *{adherence}%* · `pending` → *pending* · `not-reviewed` → *not reviewed* · `nothing-assigned` → *nothing assigned*. Logged.

## Experience & states

### DR-04 Traded-up picker (`?sheet=traded-up&id=…`)

`ResponsiveSheet` title *What did you stay on?* · body *If it was at least as important and got done, this one isn't counted. Otherwise it counts half.* (+ *Nothing's done yet today, so this will count half.* when the list is empty) · `PickerList presentation="inline"` of today's done or active items in schedule order: `icon`, `title`, `meta` *priority {n} · done {time}* / *priority {n} · running*, and the verdict tail *not counted* / *counts half* (append to `meta` in `Text tone="secondary"`; for an active item *counts half — finish it and this changes*) · a last row *Something not on the list* → an `Input` *What was it?* (1–80) and *Save* · footer *Cancel*. Choosing a row → `review.decide` with `{ kind: "missed", tier: "scoping", reasonKey: TRADED_UP_REASON_KEY, tradedUpItemId }` → the panel's decided line *Missed — stayed on {item}: traded up · not counted* or *… · counts half*. Cancel → back to the chooser with no chip selected.

### DR-06 Reflections

The `CollapsiblePanel` REV-2 left empty: one `ReflectionBlock` per done item with axes or a note (`item`, `axes` from the snapshot `reflection_axes` with current `reflection_ratings`, `note`, `onRate` → `item.rate`, `onNoteChange` → local, flushed by `item.setNote` on collapse and on finish/save); items already fully rated listed last; the heading *Reflections · {rated} of {rateable}* updates on change.

### DR-01 edit mode

`review.day` with `mode: "edit"` renders: `subtitle` *Reviewed {when}* + *· edited {when}* when `review_edited_at`; *Decided* replaces *To decide* — the same panels with `state="decided"` and *Change*; *Done* expanded; *Reflections* collapsed; footer *Finish later* (ghost) · *Save changes* (primary, disabled until dirty). A *Change* reopens the chooser (and DR-04 when chosen) and records the change in the batch; the panel shows the new decided line optimistically. *Save changes* → `review.saveChanges` → DR-07 with *Reviewed · edited*. *Finish later* / back with a dirty batch → `DiscardDialog`; **Discard** → the caller route; clean → the caller route.

Entered from RV-00's *Open* (a reviewed today), HS-01's day rows, and (REV-4) WR-02's day rows with `?item=` to scroll to. A reviewed day opened by URL shows edit mode, not DR-07.

### HS-01 History (`/review/history`)

`AppHeader` *History*. `WeekRow rangeLabel status onOpenWeek` per week newest first — `status` *{adherence}%* or *{reviewed} of {planned} reviewed* when open; children: seven `DayOutcomeRow form="short"` (weekday + date · the status word or percent · `onOpen` → `reviewDayRoute(date)`), collapsed by default (the `WeekRow`'s expander). *Show earlier weeks* (`Button variant="ghost"`) → `review.history({ before })` appends. Bottom: text link *Export everything* with `Text` *Your whole record, as files.* → `settingsDataRoute()`. Empty: `EmptyState text="No history yet — it starts with your first reviewed day."`. Loading: `SkeletonBlock`s.

**States (exhaustive):** DR-04: list · empty · not-on-list-text · saving · offline. DR-06: collapsed · expanded · no-rateable (absent) · saving. Edit mode: clean · dirty · saving · discard-prompt · error. HS-01: empty · loading · loaded · paginating · offline (cached).

**Failure / edge states:** the traded item is *Undone* from the List after the decision → the verdict flips to half on the next read; the decided line updates · a reviewed day whose item was removed (a one-off) → `traded_up_item_id` null → half with the marked line from REV-1 · `review.saveChanges` fails → the batch is kept, the sentence shows, the person can retry · HS-01 over a year → paginated; the revisit trigger in REV-1's decision.

## Non-negotiables (this slice)

- **The verdict is never stored; it is read.**
- **Edit mode writes only on *Save changes*, and every save stamps `review_edited_at`.**
- **Reflections never affect the number and are never required.**
- **History shows a number only for a reviewed day or a week with reviewed days.**
- **A change to a cut item's attribution never touches `shifts`** (REV-2's rule, reaffirmed in edit mode).

## Data & AI

**Schema changes: none.**

**Tables:** `misses` (update via `saveChanges`; `traded_up_item_id` via `decide`) · `day_items` (`reflection_ratings`, `notes_reflection` via USE-3's mutations; `completion_state` via `saveChanges` for a carry ↔ miss change) · `days` (`review_edited_at`).

**Placement:** `review.saveChanges` on the review router with `services/review/save-changes.ts`; DR-04 as `components/review-day/traded-up-sheet.tsx`; DR-06 as `components/review-day/reflections-section.tsx`; edit mode inside `use-review-day.ts` (a `batch` state); HS-01 page replaces the placeholder with leaves in `_components/`; validators: `saveChangesInput` (an array of `{ itemId, decision }` reusing `decisionInput`).

**tRPC / validators:** `review.saveChanges` · `review.decide` (REV-2, with `tradedUpItemId`) · `review.history` (REV-1) · `item.rate`, `item.setNote` (USE-3).

**AI notes:** **None.**

## Accessibility

- DR-04's rows carry the verdict in their accessible name (*Deep work, priority 7, done 12:40, not counted*).
- `ReflectionBlock`'s steppers are radiogroups labelled by axis and item.
- `WeekRow`'s expander announces the week and its status; day rows are buttons named by date and status.
- The discard dialog returns focus to *Finish later* on **Keep editing**.
- *Save changes*' disabled state is the clean state; no explanation needed.

## Acceptance criteria (observable — a seeded day; a second day two weeks back reviewed by SQL)

1. In DR-03, *Stayed on something more important* opens DR-04 with today's done and active items, their priorities, times, and verdict tails; choosing a done item of higher priority decides *Missed — stayed on {item}: traded up · not counted* (`traded_up_item_id` set); a lower-priority one decides *… · counts half*.
2. Choosing an active item shows *counts half — finish it and this changes*; finishing that item from the List and reloading the review shows *not counted* on the decided line with no other change. *(Mason.)*
3. *Something not on the list* → *What was it?* → decides at half with the text stored in `reason_text`; an empty list shows the extra body line and only that row; *Cancel* returns to DR-03 with no chip selected.
4. *Reflections · 0 of 2* expands to two blocks; rating an axis writes `reflection_ratings` at once and the heading reads *1 of 2*; a note is written on collapse; the number on DR-07 is unchanged by any of it.
5. Opening a reviewed day shows edit mode: the subtitle, *Decided* panels with *Change*, *Done* expanded, *Save changes* disabled; a *Change* enables it; *Save changes* writes the batch, stamps `review_edited_at`, and shows DR-07 with *Reviewed · edited*; the number reflects the change. *(Vigil.)*
6. With a dirty batch, *Finish later* shows *Discard changes?* — **Keep editing** · **Discard**; **Discard** leaves nothing written (verify `misses` unchanged). *(Vigil.)*
7. `/review/history` lists weeks newest first with *{adherence}%* for weeks with reviewed days and *{r} of {p} reviewed* for open ones; expanding shows seven day rows with the right status words; a day row opens DR-01 in edit mode; *Show earlier weeks* appends; *Export everything* links to `/settings/data`; a fresh account shows the empty sentence.
8. As user B, history and every sheet show only B's data.
9. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- The edit batch: `Map<itemId, Decision>`; the panels read `batch.get(id) ?? view.decision`; `saveChanges` applies each through the same service `decide` uses, inside one transaction, then stamps.
- `PickerList` has no verdict slot; the `meta` node carries it — that is what `meta?: React.ReactNode` is for.
- `WeekRow`'s `children` are the day rows; render them only when expanded to keep history cheap.

## Dev's call

Whether DR-04 is nested over the review or replaces the panel's chooser region on compact (recommend a nested drawer — the document says "sheet") · the history page size within the stated eight.

## Out of scope

- **WR-01…04** — REV-4; HS-01's week rows link there.
- **The item sheet's own reflection region** — USE-3 (built); this ticket reuses its mutations.
- **Export** — SET-10.

## Depends on

- **REV-2** — the review folder, `review.decide`, `review.finish`. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet.** Completions over a settled screen with precise rules; the one mechanism with alternatives (the edit batch) is ruled and logged. Not Composer: the verdict-is-read rule and the stamp are easy to get subtly wrong.

---

### Kickoff (paste into the session)

> Build **REV-3 — Traded-up, reflections, edit mode, and history** (attached spec). Model: **Sonnet**. **The verdict is read, never stored; edit mode writes only on *Save changes* and stamps every save; reflections never touch the number; history shows a number only for reviewed days.**
> Attach/read first, in order: this spec · Epic 3 §2 (DR-04, DR-06, DR-01 edit mode, DR-07), §4 (HS-01), §8 calls 6–7 · official spec §0.3 R2, §3.11, §7.2, §7.5 · cross-cutting §8.1, §9.3 (G3) · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · REV-2 (`components/review-day/` — extend) · REV-1 (`review.day`, `review.history`) · USE-3 (`item.rate`, `item.setNote`) · `packages/ui/src/composed/{control/picker-list,control/reflection-block,display/day-outcome-row,feedback/discard-dialog}/` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `../epic-2-in-use/DEVIATIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
