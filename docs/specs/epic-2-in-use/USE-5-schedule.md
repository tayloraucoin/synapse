# USE-5 — Schedule: SC-01, SC-02 as a record, ghosts, window spans, and shift bands

**Epic:** USE — In Use · **Phase 3** · Size: L
**Slice type:** A time canvas — the same day as the List, laid out against an axis. The risk class is *a canvas that argues*: a block a person can drag, a zoom, a now line that animates, a block so short it loses its title with nothing to say what it is.
**Vigil:** none. **Vesper review:** block density at 64 and 96 px/hour on compact; the three block sizes; the ghost's read at 0.55.

**Status:** Complete (2026-09-06)

> **Vesper — density review.** Open a full day (twelve items, two windows, one multitask pair, one late start) on a phone. Every block must be openable and readable, or the size rule below is wrong.

---

## Outcome

The second tab shows where the day sits against the plan: an hour axis with 15-minute hairlines from an hour before the first item to an hour after the last; blocks whose height is their duration; windows as lighter spans with the block at their top until started; a now line at the current minute with the time at its end and everything above it at 0.55; a ghost outline with the title struck through at the original time of anything started late, and the live block with a violet border and *moved*; a thin band at the minute of every shift with its reason; done blocks filled with a check. Re-tapping the tab scrolls to now. Tapping a block opens the same item sheet; tapping a band opens its record. **Nothing here mutates the day** except through the sheets it opens — no drag, no zoom, no Day Complete.

## Why / intent

- **Official spec §5.3** — the axis, the blocks, windows, the now line, side-by-side multitask, ghost-and-annotate, the anchor glyph on hard items, shift bands. §5.9 — the block visuals per state. §9.6 — the now line moves by re-render, not animation. §11 — the axis switches to 30-minute hairlines above 150% text scale.
- **Epic 2 §5 (SC-01, SC-02)** — every read, interact, and state: the axis extend controls; the three block sizes (< 32px: icon and title only; < 16px: a hairline with a tag beside the axis); *planned* under a ghost's time; no long-press, no drag, no pinch; the day-closed now line with *closed*; SC-02's lines (*At {time}* · *Reason: {reason}* · *Counts as: {tier phrase}* · *Cut: {titles}* / *Nothing was cut.*) and its *Undo this shift* within 10 minutes (**the undo is USE-6's**; this ticket renders SC-02 read-only with the action absent). §12 calls 4 (no Day Complete here) and 5 (no drag).
- **Cross-cutting §11** — the axis navigable by row with `aria-rowindex` per 15-minute band; ghosts and bands announced in sequence with their words. §2.3 — the Schedule is a 960px canvas on wide; the item sheet opens beside the axis so the block stays in view.
- **Ground truth:** USE-1's `DayView` (`items` with `scheduledStart/End`, `originalScheduledStart`, `state`, `multitask`; `shifts`; `wokeAt`/`anchorTime`; `timezone`; `mode`), `minutesFromDayStart`; USE-3's `?sheet=item` and the store; `@syn/ui` `ScheduleAxis` (`startMin`, `endMin`, `pxPerHour`, `onExtend`, children absolutely positioned by `topPx`/`heightPx`), `ScheduleBlock` (`size`, `multitask {index,count}`), `WindowSpan`, `GhostBlock`, `ShiftBand`, `NowLine` (`atMin`, `topPx`, `label`, `closed`), `DayHeader`, `SkeletonBlock`, `EmptyState`, `ScreenFrame width="canvas"`; `todayScheduleRoute`, `dayScheduleRoute`.
- **What this slice is NOT (binding):** no writes; no shift undo (USE-6); no drag or long-press; no zoom; no Day Complete; no block for `not_assigned` items (absent) — `cut_by_shift` items render as ghost outlines only.

**Rulings this slice makes (labelled, logged):**

- **The Schedule is a feature folder** `apps/web/components/schedule-canvas/{use-schedule.ts, schedule-canvas.tsx, layout.ts, copy.ts, index.ts}` rendered by `/today/schedule` and `/day/{date}/schedule`, sharing `day.get` with the List (one query, two canvases). `layout.ts` is pure: `(DayView, pxPerHour) → { axis: {startMin, endMin}, blocks, spans, ghosts, bands, nowTop }` in minutes from the day's start (`woke_at ?? anchor` at the day's date, via `minutesFromDayStart` in the day's zone). Logged.
- **`pxPerHour` is 64 by default and 96 above 150% text scale** (the composite's two values); the hairline density switch is the composite's. Logged.
- **Block size by rendered height:** ≥ 32px `default`; 16–31px `compact` (icon + title; time in the accessible name); < 16px `hairline` (a 2px rule with the title in a `Tag` beside the axis). The three map to `ScheduleBlockSize`. Logged.
- **A window's block sits at the window's top until it has a session or is done, then at the actual start**; the span always draws the whole window. Logged.
- **Multitask members share a band** — `multitask: { index, count }` splits the width; the group's members are the items sharing `multitaskId` at the same minute. Logged.
- **The now line's `label` is the clock in the day's zone**; it re-renders on `useNow`'s minute tick; above it every block gets the 0.55 opacity through `state === "passed"`/`done` from the derived view — the canvas adds no opacity of its own. In record mode the now line is absent; when the day is closed it stops at `closedAt` with *closed*. Logged.
- **Re-tapping the active tab scrolls to now** — `TabBar`/`Rail` emit a `scroll-to-now` custom event the canvas and the List both listen for (SYS-1 ships the event; this ticket subscribes). Logged.
- **`earlier`/`later` extend the axis by an hour per tap** in local state (not persisted); the axis's default range is recomputed on refetch. Logged.

## Experience & states

### SC-01 Schedule (`/today/schedule`, `/day/{date}/schedule`)

The same `DayHeader` and status-line slot as the List (the header is the shell's; USE-2's `DayHeader` props are reused — extract them into `day-list/day-header-props.ts` if not already shared; re-check USE-2's AC 1). `ScreenFrame width="canvas"`. Then `ScheduleAxis startMin endMin pxPerHour timeZone onExtend`:

- **Spans** (`WindowSpan`) for every `window` item, at the window's minutes.
- **Blocks** (`ScheduleBlock item topPx heightPx size multitask timeZone onOpen`) for every assigned item with a `scheduledStart` — fixed at its time; window at the top of its span or at its actual start; height from `durationMin` (windows: the block is `durationMin` tall, not the span). `onOpen` → `?sheet=item&id=…`.
- **Ghosts** (`GhostBlock item topPx heightPx onOpen`) at `originalScheduledStart` for every item whose `scheduledStart !== originalScheduledStart` (a late start or a shift-moved item that was then started) and for every `cut-by-shift` item (outline only, no live block). `onOpen` opens the live block's sheet (same id).
- **Bands** (`ShiftBand topPx deltaMin reasonLabel onOpen`) at each shift's `at`; `onOpen` → `?sheet=shift&id=…` → SC-02.
- **NowLine** in live mode at `nowMin` with `label` = the clock; `closed` when `closedAt` (at `closedAt`'s minute).
- Unscheduled items are not on the axis (the List's *Anytime* is their home); a muted line under the axis: *{n} without a time* `[COPY — needs Vesper sign-off: the document places unscheduled items nowhere on the Schedule and says nothing; a silent absence hides them]` — **or nothing**; Vesper decides; build nothing until signed and log the marker.
- On open and on the `scroll-to-now` event: scroll the axis so the now line is in the upper third (live mode); in record/plan mode, to the first block.

### SC-02 Shift band detail (read)

`ResponsiveSheet` title *Shifted +{n} min* · lines: *At {time}* · *Reason: {reason}* · *Counts as: {tier phrase}* (*done for the record* · *half* · *missed* — the ST-06 heading phrases) · *Cut: {titles}* or *Nothing was cut.* · footer *Close*. *Undo this shift* is **absent** (USE-6 adds it with its 10-minute rule). The data comes from `day.get`'s `shifts` plus the cut items (`cutByShift` filtered by `miss.shiftId` — extend the read model with `shiftId` on cut items' view; a one-line change to USE-1's `to-view.ts`; re-check its AC 9).

**States (exhaustive):** live · record (no now line; ghosts and bands still drawn) · plan (no now line; blocks non-interactive → `onOpen` opens the read-only sheet USE-3 provides for plan mode — **USE-3 did not build a plan-mode sheet**; the List's plan rows are read-only with no sheet. **Ruling:** in plan mode blocks are not buttons; cross-cutting §8.2's "rows open a read-only version of the item sheet with a single action *Edit in week*" applies to the List and the Schedule alike and is **not yet built** — `[NEEDS DECISION — Vesper: ship plan mode with non-interactive rows/blocks in Phase 1, or add the read-only sheet with *Edit in week* → WK-02 as a small follow-on?]` Build non-interactive and log.) · empty day (`EmptyState` over the axis with the LS-00 actions — the same doors) · closed (now line at close with *closed*) · loading (axis with three `SkeletonBlock`s) · offline (readable; blocks open the sheet whose writes revert) · error (as LS-01).

**Failure / edge states:** two items at the same minute without a shared `multitaskId` (should not exist — SET-5/6 prevent it) → render side by side anyway with `count = 2` and log a warning without the titles · an item whose duration exceeds the axis end → the axis extends to fit on layout, not only on tap · a window shorter than its block (should not exist) → the block is clamped to the span · a block starting before the axis start (an offset of −120) → the axis starts an hour before it.

## Non-negotiables (this slice)

- **No drag, no long-press action, no zoom, no Day Complete.**
- **The now line moves by re-render on the minute; nothing animates.**
- **Everything above the now line is at 0.55 and fully interactive** — the opacity comes from the derived state, never from a canvas rule.
- **A ghost is drawn from `originalScheduledStart`; the canvas never computes a ghost from anything else.**
- **Times in the day's zone.**
- **No number about the day.** The axis labels and the now label are times.

## Data & AI

**Schema changes: none.**

**Tables:** none written. Read through `day.get`.

**Placement:** `components/schedule-canvas/` (rule 9); pages replace the two schedule placeholders; the `scroll-to-now` subscription in the canvas and in `day-list/` (both listen); `shiftId` on cut items' view in USE-1's `to-view.ts`.

**tRPC / validators:** none new. `day.get` (USE-1).

**AI notes:** **None.**

## Accessibility

- The axis is a `role="grid"` with one `row` per 15-minute band (`aria-rowindex`), each block a `gridcell` button whose name reads *{title}, {time}, {state}*; ghosts read *{title}, planned {time}, started {actual}*; bands read *shifted +{n} min, {reason}*; the now line is `aria-hidden` (the live region rule).
- `earlier`/`later` are buttons with their labels.
- Focus order: header → axis controls → blocks in time order → bands in time order.
- Compact blocks carry the time in their accessible name; hairline blocks' `Tag` is the visible title.
- At 150%+ text scale the hairlines switch to 30 minutes (the composite's `pxPerHour={96}` path).

## Acceptance criteria (observable — compact and wide; a seeded full day; a fixed clock mid-day)

1. `/today/schedule` shows the axis from an hour before the first item to an hour after the last, hour labels, 15-minute hairlines, and the same day header as the List. *(Vesper.)*
2. Every scheduled item is a block at its time with its duration's height; a 40-minute item at 64 px/h is 43px tall (`default`); a 15-minute item is 16px (`compact`, icon and title only); a 5-minute item renders as a hairline with its title in a tag. *(Vesper.)*
3. A window item shows its span in the lighter surface with the block at the span's top; after *Start* (via the sheet) the block sits at the actual start with the span unchanged.
4. The now line sits at the current minute with the time at its end and advances at the minute boundary without animation; blocks above it are at 0.55 and open the sheet.
5. A late-started item shows a ghost outline with the title struck through and *planned* beneath its time at the original position, and the live block with a violet border and *moved* at the actual position; both open the same sheet.
6. A shift (SQL: a `shifts` row and moved `scheduled_start`s) renders a band at its minute reading *Shifted +60 min · slept in*; tapping opens SC-02 with the four lines and *Close*, and no *Undo this shift*.
7. A cut item renders as a ghost outline only.
8. Two multitask members at one minute render side by side, each with its own state; each opens its own sheet.
9. Hard items show the anchor glyph before the title with the accessible word *fixed*; soft items do not.
10. Re-tapping the *Schedule* tab scrolls to the now line; on `/day/{yesterday}/schedule` there is no now line and the ghosts and bands remain; on a closed today the line stops at the close time with *closed*; on `/day/{tomorrow}/schedule` there is no now line and blocks are not buttons.
11. *earlier* extends the axis by an hour per tap; a one-off placed outside the default range extends the axis on load.
12. An unplanned day shows the empty state over the axis with the same doors as the List.
13. Screen reader (VoiceOver or NVDA): the axis reads as a grid by row; a ghost reads *planned* then *started*; a band reads its words. *(Vesper — state the reader used.)*
14. `grep -rn "onLongPress\|draggable\|onDrag" apps/web/components/schedule-canvas` returns nothing.
15. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `layout.ts` takes `dayStartMinutes = minutesFromDayStart(woke_at ?? anchor)`; every `topPx = (itemMin − axisStartMin) / 60 × pxPerHour`. Keep it pure and test it in a REPL with the fixture day.
- The scroll-to-now event: `window.dispatchEvent(new CustomEvent("syn:scroll-to-now"))` from the nav; the canvas `scrollIntoView({ block: "start" })` on the now line's element with a 1/3-viewport offset via `scroll-margin-top`.
- Ghost detection: `item.originalScheduledStart !== null && item.scheduledStart !== null && +item.originalScheduledStart !== +item.scheduledStart`.
- Text-scale detection for the 96 px/h switch: `matchMedia("(min-resolution: 1.5dppx)")` is *not* text scale; use `parseFloat(getComputedStyle(document.documentElement).fontSize) >= 24` (16 × 1.5) in a resize observer.

## Dev's call

The grid's virtualisation (recommend none — a day is under 50 blocks) · the exact `scroll-margin-top` · whether bands are above or below blocks in z-order (recommend above, they are thin).

## Out of scope

- **Shift undo, the late offer, writing a shift** — USE-6.
- **Trim** — USE-7 (trimmed items are absent here already).
- **The plan-mode read-only sheet with *Edit in week*** — `[NEEDS DECISION]` above; a small follow-on if ruled.
- **Drag-to-reschedule** — never in v1.
- **Pinch/zoom** — Phase 2 refinement, not planned.

## Depends on

- **USE-3** — the item sheet (`?sheet=item`), the store (a ticking block), the late-start data. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The layout math across three block sizes, windows, ghosts, multitask bands, and the axis range — plus a grid accessibility model — is broad and shallow, which is the L that a cheaper model makes narrow by dropping the third block size and the grid semantics.

---

### Kickoff (paste into the session)

> Build **USE-5 — Schedule: SC-01, SC-02 as a record, ghosts, window spans, and shift bands** (attached spec). Model: **Opus**. **No drag, no zoom, no Day Complete; the now line re-renders on the minute; opacity comes from derived state; ghosts come from `originalScheduledStart` only.**
> Attach/read first, in order: this spec · Epic 2 §5 (SC-01, SC-02), §12 · official spec §5.3, §5.9, §9.6, §11 · cross-cutting §2.3, §8.2, §11 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · USE-1 (`DayView`, `minutesFromDayStart`) · USE-2 (`day-list/`, the header props — reuse) · USE-3 (`?sheet=item`) · SYS-1 (the `scroll-to-now` event) · `packages/ui/src/composed/display/{schedule-axis,schedule-block,schedule-overlays,now-line}/` and their stories · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Route the plan-mode sheet question to Vesper as marked; build non-interactive until answered. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
