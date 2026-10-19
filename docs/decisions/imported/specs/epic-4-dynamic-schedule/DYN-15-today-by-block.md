# DYN-15 — Today by block: the tab, the day header and its sheet, the item sheet's additions, the habit-day sheet

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: L
**Slice type:** The execution tab re-sectioned and its two sheets extended. The risk class is *a number on the tab* (a count, a percentage, a countdown) and *configuration reachable from the tab beyond the one designed exception* (the item sheet's *Edit today's*, which edits the day and never the library).
**Vigil:** none. **Vesper review:** the five block sections against §6.1; the container work row; the wind-down rows after devices-off; the day header sheet's row set per day state.

**Status:** Complete (2026-09-13 — authored and built in one thread, with DYN-17; the list by block with the container work row, the marker, the unblocked section; the header's focus and anchor; the day header sheet's five rows with *Add from the library*; the item sheet's *Do now*, *Edit today's* and the one-of segment; `components/habit-day-sheet/`; `item.chooseAlternate`, `day.addFromLibrary`, `DayView.unblocked`, the widened item detail; the four root commands pass; the acceptance walk is blocked at sign-in — logged in `DEVIATIONS.md`)

**Owner:** Reeve (spec) → dev (build) · **Reviewer:** Vesper (the tab by eye), Mason (`chooseAlternate` and `addFromLibrary` against the reflow; the derived-items hook's clock-independent states)

## Outcome

`/today` (confirmed) and `/day/{date}` per §6.1 verbatim: the `DayHeader` with the focus and the anchor as a plain time (*Viewpoint · Work 9:00*, *Work ~9:00* when soft, R17) and *Woke 7:12*; `BlockHeader` sections in block order with their computed spans; `ItemRow`s as v1 §5.2 with the pin glyph and the chosen one-of title; the work block as a `container` row with its fixtures nested, split into two rows around training; the wind-down rows after devices-off without a checkbox and with *confirm in the morning*, the devices-off marker as a hairline row; items with no block (one-offs, an unstructured day's adds) under *Also today*; the not-assigned expander; **Day Complete**. Day parts are no longer rendered (R20). The day header sheet (§6.2): **Adjust the day · Set wake time · Add from the library · Add a one-off · Edit today**, per day state (*Add from the library* first on an unstructured day; *Adjust the day* opens DYN-17's sheet). The item sheet (§6.3): **Do now** in the footer with the one-line overflow and *Do now anyway* · *Adjust instead*; **Edit today's** as ghost text in the header → the `HabitDaySheet` (§6.4); the one-of segment for alternates members; *Not today* as v1. After this ships, **DYN-17 has a tab to be entered from, DYN-16 has the day's blocks to draw as bands, DYN-18 has the wind-down rows to wire the journal into, and DYN-21 can drop `parts`.**

## Why / intent

- **§6.1** — *"Move through today without deciding anything you don't have to … The body is sectioned by block (R20), each with a `BlockHeader` … The work block is one row: a container `ItemRow` variant with the focus as its title, its span as its time text, and the fixtures inside it nested beneath … [It must never] show a count, a percentage, a countdown, or anything red. Ask a question. Reach any configuration without leaving the tab — the item sheet's Edit today's is the one designed exception."*
- **§6.2** — the five rows in order; *Edit today* opens the Schedule with the drag layer (DYN-16); on a closed day only *Edit today* in record mode; on an unstructured day *Add from the library* first.
- **§6.3** — *Do now* (R8: no reason), *Edit today's*, the one-of segment ("changing it re-flows prep"), *Not today* kept exactly.
- **§6.4** — *"Change this item on this day — length, time, priority, whether it's in — without touching the habit … [It must never] clamp (W10). Write to the library. Ask for a reason."*
- **§7.1** — the devices-off marker "a hairline row with the anchor glyph and the time, no checkbox"; rows after it "render without a checkbox and with the caption *confirm in the morning*".
- **R17, R20, R21, §10.1, §13 #1.**
- **Ground truth (consumed, never rebuilt):** DYN-5's `DayView.blocks` (`DayBlockView` with spans, `split`, items in time order), `devicesOffAt`, `isAfterDevicesOff` → `confirm-later`; DYN-6's `item.doNow` (the overflow payload), `item.editToday`, `deriveItemState`; DYN-7's `BlockHeader`, `ItemRow` (`container`, `pinned`, `marker`, the `confirm-later` word), `DayHeader`; DYN-14's `TodayScreen` branch; the existing `DayList`, `useDayList`, `ItemSheet`, `DayHeaderSheet`, `WakeTimeSheet`, `OneOffSheet`.
- **What this slice is NOT (binding):** the Schedule's bands and drag (DYN-16 — *Edit today* navigates to the Schedule tab as it is); Adjust (DYN-17 — the day header sheet mounts its `AdjustSheet`; *Adjust instead* on *Do now* opens it); the journal row's screen (DYN-18 — the wind-down *Journal* row opens nothing); the removal of `parts`, `DayPartHeader`, day parts (DYN-21).

**Rulings this slice makes (labelled, logged):**

- **The list renders `blocks` and `unblocked`; `parts` is no longer read.** `useDayList`'s derive-and-reassemble walks `blocks[].items`, `unblocked`, `notAssigned`, `cutByShift` in that order; `parts` is left as the server sent it (DYN-21 removes it). Logged.
- **`DayView.unblocked`** — assigned items with no block (one-offs, an unstructured day's library adds) — is added to the read model and rendered under the blocks under the caption *Also today* `[COPY]`; without it, a one-off would vanish from a tab sectioned by block. Logged.
- **The work block is a container row:** `ItemRow variant="container"` with the focus label (or *Work*) as its title and its span, the block's fixtures nested as children; a split work block is two container rows either side of the training block, in block order. The container has no checkbox and is never scored. Logged.
- **The devices-off marker is the wind-down row whose `scheduledStart` equals `devicesOffAt`;** it renders with `marker`; every row after it reads *confirm in the morning* from its state. `useDerivedItems` treats `confirm-later` and `not-confirmed` as clock-independent so the minute tick cannot turn them into *passed*. Logged.
- **The header's second line is the focus and the anchor** — *Viewpoint · Work 9:00* / *Work ~9:00* — through `DayHeader`'s `templateName` slot, with *Woke 7:12* when the day has a wake. On an unstructured day the line reads *Unstructured*. Logged.
- **`Add from the library` is a picker of the library's habits grouped by this day's block kinds** (*Morning · Before work · … · Anywhere*); tapping one calls `day.addFromLibrary({ date, habitId, blockKind })` — a habit-day item (origin `one_off`, no slot) at the end of that block, re-flowed; on an unstructured day the item has no block and lands at now. Logged.
- **The one-of segment is one mutation, `item.chooseAlternate({ id })`:** the row takes the other member's habit and length and the block re-flows; the row id and its original start stay (the record is annotated). Logged.
- **`ItemDetailView` gains `priority`, `pinned`, `habitRange`, `alternates`, `dayBlockId`, `assignmentState`** for the sheet's three additions. Logged.
- **The shift and trim rows leave the day header sheet;** their components stay until DYN-21. *Adjust the day* opens DYN-17's `AdjustSheet` with `entry: "header"`. Logged.

## Experience & states

### The tab — `components/day-list/`

`DayListHeader`: `DayHeader` with the date, the second line *{focus} · Work {clock}* (*~* when soft) or *Unstructured*, *Woke 7:12* when set, the zone label when it differs; tapping opens the day header sheet. The body: one `BlockSection` per `DayView.blocks[]` entry — `BlockHeader` (the block's name or its kind's word, the span) then the rows. A `work` block renders as a container row (title: the focus label or *Work*; time text: the span) with its fixture items nested; a `training` block renders its workout row; a pooled block with no items renders *Set in the morning* under its header (a plan-mode day, DYN-12's promise). Wind-down: the marker row, the *confirm in the morning* rows. Then *Also today* for `unblocked`, the not-assigned expander (with *Bring back*), the cut-by-shift expander, **Day Complete**. States: live · plan (read-only rows) · record (no *Do now*, closed rows) · empty (an unplanned day: the existing doors).

### The day header sheet — `components/day-header-sheet/`

Rows in order: **Adjust the day** (live, confirmed, not closed) · **Set wake time** · **Add from the library** (not closed; first on an unstructured day) · **Add a one-off** (not closed) · **Edit today** (→ the Schedule route). *Add from the library* opens `LibraryPickSheet` (this folder): a `PickerList` of habits grouped by the day's block kinds then *Anywhere*, and a `SegmentedControl` of the day's blocks to land in (preselected to the habit's own kind when it is on the day); tap → `day.addFromLibrary`, the sheet closes, the list refreshes.

### The item sheet — `components/item-sheet/`

Header: *Edit today's* as a ghost button beside the identity row (not on a fixture, not in record mode). Under the identity row, for an alternates member: a `SegmentedControl` *{this} · {other}* — choosing the other calls `item.chooseAlternate` and the sheet re-reads. Footer: **Do now** (secondary) when the item is upcoming, soon, now, open, closing, or passed and not done, in live mode; on overflow the footer becomes the one line *{title} no longer fits before {bound}* with **Do now anyway** · **Adjust instead** (opens the Adjust sheet, `entry: "one-off"` for a one-off, else `"header"`). *Not today* as v1.

### The habit-day sheet — `components/habit-day-sheet/`

Title the item's name, caption *Today only*. **Takes** `MinutesStepper` 1–480 with *usually 10–30* beneath (never a limit); **At** `SegmentedControl` *In the stack · At a time* with a `TimeField` (a time pins it for today); **Priority today** `Stepper17`; the ghost row **Leave out today**. Footer *Cancel · Save* → one `item.editToday`; the block re-flows. The muted line *Changes the day, not the habit.* with **Also change the habit** opening the habit sheet (edit mode) stacked. States: editing · a done or running item (length and time disabled with the service's sentence) · saving · offline.

**Failure / edge states:** `doNow` overflow → the line and the two buttons, nothing written · *Do now anyway* → the overflow item is not assigned (the expander shows it with *Bring back*) · `chooseAlternate` on a done member → the sentence · a fixture → no *Edit today's*, no one-of, *Do now* absent · an item with no block (a one-off) → *Do now* still works (the service handles a null block) · a closed day → record mode, no *Do now*, no *Edit today's*, the header sheet shows *Edit today* only · a plan-mode day → rows read-only, the header sheet's *Adjust the day* absent.

## Non-negotiables (this slice)

- **No count, percentage, countdown, or red on the tab.** The expander headings' counts are counts of things hidden, as v1.
- **Configuration is reached only through the day header sheet's rows and *Edit today's*,** which edit the day and never the library.
- **`deriveItemState` is the only state source.**
- **The container row has no checkbox and is never scored.**
- **No clamp on *Takes*.**
- **No new `@syn/ui` component.**

## Data & AI

**Schema changes: none.**

**Tables:** `day_items` (insert — *Add from the library*; update — *Do now*, *Edit today's*, the one-of switch; the reflow's times).

**Placement:** `components/day-list/{day-list,use-day-list,day-list-header,block-section,copy}.tsx` (`day-section.tsx` deleted); `components/day-header-sheet/{day-header-sheet,library-pick-sheet,copy}.tsx`; `components/item-sheet/{item-sheet,use-item-sheet,copy}.ts(x)`; `components/habit-day-sheet/{habit-day-sheet.tsx,copy.ts,index.ts}`; `packages/api/src/services/day/{choose-alternate,add-from-library,get-item,get-day}.ts`; `routers/{item,day}.ts`; `packages/validators/src/adjust.ts` (`addFromLibraryInput`); `packages/hooks/src/use-derived-items.ts`. Rule 9, rule 2, rule 3.

**tRPC / validators:** `item.chooseAlternate({ id })` · `day.addFromLibrary({ date, habitId, blockKind })` · existing `item.doNow`, `item.editToday`, `item.get` (widened), `day.get` (`unblocked`).

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

- Each `BlockHeader` is an `h2`; the container row's nested fixtures are a list inside it.
- The marker row is `aria-hidden`'s opposite: it is read as *Devices off, 22:15, pinned* with no checkbox.
- *Do now anyway* / *Adjust instead* are two buttons under one sentence; the sentence is `aria-live="polite"`.
- The habit-day sheet's range line is associated with the stepper as its description.
- Roving focus (SYS-4) crosses block sections in DOM order.

## Acceptance criteria (observable — local tier, a confirmed Monday; `yarn web:dev`)

1. `/today` shows the header *Monday 14 Sept · Viewpoint · Work 9:00 · Woke 7:12* and five `BlockHeader`s in order — *Morning · 7:03–8:11*, *Before work · 8:15–9:00*, *Work · 9:00–17:30*, … — no day-part headers anywhere. *(Vesper.)*
2. The work row is a container with *Viewpoint* as its title and the stand-up nested beneath it on Tuesday; with training *inside work* there are two work rows around *Push*. *(Vesper.)*
3. The wind-down rows after 22:15 have no checkbox and read *confirm in the morning*; the devices-off row is a hairline with the glyph; a minute later they still do. *(Vesper.)*
4. The item sheet on breath work at 7:50 shows **Do now**; tapping it moves and starts it and slides the rest; when the slide would push the walk past work the footer reads *Walk no longer fits before work* with *Do now anyway* · *Adjust instead*. *(Mason.)*
5. *Edit today's* opens the habit-day sheet; *Takes* 90 on a 10–30 habit saves with the range as muted text and no clamp; *Leave out today* moves it to the expander with *Bring back*. *(Mason.)*
6. On a prep one-of member the sheet shows *Meal-prepped · Cook it*; choosing the other rewrites the row and re-flows prep; the tab shows the new title only. *(Mason.)*
7. The day header sheet shows *Adjust the day · Set wake time · Add from the library · Add a one-off · Edit today*; on an unstructured day *Add from the library* is first; on a closed day only *Edit today*. *Add from the library* → *Read* into *Morning* adds a row at the end of the morning block. *(Vesper, Mason.)*
8. A one-off added at 13:00 appears under *Also today*; nothing on the tab is red, counted or a percentage. *(Vesper.)*
9. `grep -rn "DayPartHeader\|\.parts\b" apps/web/components/day-list/` returns nothing.
10. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `useDayList`'s `flat`/`reassemble`/`mapItems` are the three places that enumerate the day's collections; change all three together.
- `ItemRow variant="container"` takes `children` for the nested fixtures; pass `onOpen` for the container so the focus row opens its own sheet.
- The marker: `item.scheduledStart?.getTime() === day.devicesOffAt?.getTime()` inside the wind-down block.
- `DayHeader` has no `focusLabel` prop; compose the line into `templateName`.

## Dev's call

The word for a block with no template name (the kind's word from `BLOCK_KIND_WORDS`) · whether *Also today* is a `BlockHeader` or a caption (a caption; it is not a block) · whether the library picker lands the habit in its own kind's block by default (yes, when that block is on the day).

## Out of scope

- **The Schedule's bands and drag** — DYN-16.
- **Adjust** — DYN-17 (this ticket mounts its sheet from two entries).
- **The journal screen** — DYN-18.
- **Removing `parts`, `DayPartHeader`, `DaySection`'s day-part model** — DYN-21 (the file `day-section.tsx` is deleted here; the composite stays).

## Depends on

- **DYN-14** — the confirmed state and `TodayScreen`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** A tab rendered from a new model with three sheets touching one reflow; a cheaper model leaves the day-part list beside the block list, or puts a count on the header.

---

### Kickoff (paste into the session)

> Build **DYN-15 — Today by block** (attached spec). Model: **Opus**. **No number on the tab; configuration only through the two designed doors; `deriveItemState` is the only state source; the container row is never scored; no clamp.**
> Attach/read first, in order: this spec · v1.1 §6.1–§6.4, §7.1, §10.1, R17, R20, R21 · `apps/web/AGENTS.md` · root `AGENTS.md` · DYN-5 (`get-day.ts`) · DYN-6 (`do-now.ts`, `edit-habit-day.ts`, `reflow-block.ts`) · DYN-7 (`ItemRow`, `BlockHeader`) · the existing `components/day-list/`, `item-sheet/`, `day-header-sheet/` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Walk the tab in the browser on a confirmed Monday. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
