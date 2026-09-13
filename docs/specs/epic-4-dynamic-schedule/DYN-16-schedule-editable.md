# DYN-16 — The Schedule, editable

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: L
**Slice type:** Direct manipulation on the time axis. The risk class is *a slip of the thumb moving a fixture* (a pin never lifts; the dialog is the second guard behind the service's refusal) and *a drag with no keyboard path*.
**Vigil:** none. **Vesper review:** the lifted state, the re-stack preview, the refused line, the move mode, the unconfirmed line.

**Status:** Complete (2026-09-13 — authored and built in one thread, with DYN-20 and DYN-9; the canvas reads `blocks` + `unblocked`, draws `BlockBand`s and slack, wires `DragLayer` to `item.move`, `item.editToday`, `day.moveBlock` and Adjust for the morning band; the pin dialog; move mode by `?mode=move`; the four root commands and the Storybook build pass; the drag walk is not observed in a browser — logged in `DEVIATIONS.md`)

**Owner:** Reeve (spec) → dev (build) · **Reviewer:** Vesper (by eye), Mason (the writes are DYN-6's; the ghost rule)

## Outcome

`/today/schedule` and `/day/{date}/schedule` per §6.5: `BlockBand`s behind the items with the block's name in the gutter, the work band tallest and split around training, slack bands labelled in the gutter (*12 min*); the work block as a container with its fixtures inside as pinned blocks. `DragLayer` wired: long-press lifts an item, 5-minute snap, the displaced re-stack beneath, the drop writes `item.move`; a band-header drag writes `day.moveBlock` — on the **morning** band it opens Adjust (`entry: "band-drag"`, the delta preset) instead; a bottom-edge drag writes `item.editToday({ durationMin })`; a pin or fixture never lifts — dragging it opens a `ConfirmDialog` *Move Dentist to 3:15?* **Move** · **Cancel**, and *Move* writes `item.move({ confirmed: true })`; a refused drop returns the block with the one-line *Fixed things don't move by drag.*; **Edit today** from the day header sheet opens the Schedule in move mode (tap lifts, tap drops); keyboard: Alt+↑/↓, Shift+↑/↓, `m` then a time, Escape; announcements on lift and drop. Record mode: no drag layer. Plan mode: drag allowed, no ghosts, no now line. An unconfirmed today: fixtures and bands only, no now line, a centred *Set the day first* with a link.

## Why / intent

- **§6.5** verbatim — bands, gestures, the record's meaning (*"a re-plan: `scheduled_start` moves, `original_scheduled_start` doesn't, the ghost shows on the axis only after the original time has passed"*), what it must never do, the spec table.
- **§10.1** — *Slack* (*empty band between two block bands, labelled in the gutter, drop target, never coloured*), *Lifted*, *Refused drop*, *Unconfirmed day*, *Devices off* (a hairline at the time).
- **§10.4** — the keyboard equivalents; *Edit today* as the long-press fallback.
- **R22, R23.**
- **Ground truth (consumed, never rebuilt):** DYN-6's `moveItem`, `moveBlock`, `editHabitDay` and their refusals; DYN-7's `DragLayer`, `BlockBand`, `GapBand slack`, `ScheduleBlock` (`draggable`, `resizable`, `pinned`, `container`), `ConfirmDialog`; DYN-15's `DayView.blocks` / `unblocked`; DYN-17's `AdjustSheet` with `entry: "band-drag"`.
- **What this slice is NOT (binding):** a new write; a drag on the List; drag-to-multitask; a ghost before the original time passes.

**Rulings this slice makes (labelled, logged):**

- **`DayBlockView` gains `startAt` / `endAt`** (the instants) so the canvas measures bands in minutes from midnight the way it measures items; `startMin`/`endMin` (from the day's start) stay for the List. Logged.
- **The canvas reads `blocks` + `unblocked`, never `parts`.** Items are laid out by their own start; the work block's container item is drawn as a `ScheduleBlock container` spanning its block with the block's fixtures as children; bands come from the blocks; slack is every gap between consecutive bands. Logged.
- **The morning band's drag goes to Adjust** with `bandDragDeltaMin` preset; every other band writes `day.moveBlock` directly. A band with no times (pooled, not today) is not draggable. Logged.
- **A pin's drag is the layer's `onPinnedDrop`** — the layer tracks the pointer on a `data-pinned` block without lifting it and reports the snapped target once the pointer moves past the scroll tolerance; the canvas opens the dialog. The service refuses without `confirmed`; the dialog is the second guard. Logged.
- **The service's `fixed` refusal (`BAD_REQUEST` with the fixed message) is the layer's `refused` state**; any other error is the sheet's error line. Logged.
- **Move mode is a search param** (`?mode=move`, `todayScheduleRoute({ move: true })` / `dayScheduleRoute(date, { move: true })`), set by the day header sheet's *Edit today* row and read by the canvas; leaving the tab leaves the mode. Logged.
- **Plan mode draws no ghosts** — `original_scheduled_start` differs from `scheduled_start` on a future day only by a drag that has not been lived; the ghost is a fact about a passed time. Logged.
- **The ghost rule is a clock comparison** — a moved item's ghost is drawn only when its original start is before now. Logged.

## Experience & states

### The canvas — `components/schedule-canvas/`

`layout.ts`: bands (`{ id, kind, name, topPx, heightPx, draggable, pooled }`), slack (`{ topPx, heightPx, minutes }` between bands), blocks (items outside the work container), containers (the work block's item with its fixtures relative), ghosts (moved and past, cut), shift bands, spans, the now line. `schedule-canvas.tsx`: `ScheduleAxis` → `BlockBand`s → `GapBand slack` → the blocks, wrapped in `DragLayer` when the day is live or a plan; the layer's `items` are the movable blocks (pinned flags, resizable when not done), `blocks` the bands with times; `state` is the canvas's answer. Intents: `move` → `item.move`; `resize` → `item.editToday`; `move-block` → the morning kind opens `AdjustSheet`, else `day.moveBlock`. `onPinnedDrop` → `ConfirmDialog` *Move {title} to {time}?*. A refused write → `state: "refused"` and the `StatusLine`, cleared on the next lift. A tap still opens the item sheet; a drop does not.

**States:** idle · lifted · dropping · refused · confirming · move mode (a caption *Tap to lift, tap to drop* at the top) · unconfirmed (the centred line, a link to `/today`) · record (no layer) · plan (no ghosts, no now line) · offline (the layer disabled, the standard line) · reduced-motion.

**Failure / edge states:** drag read to 8:07 → 8:05, the rest re-stacked, no overlap, no ghost until 8:07 passes · drag the stand-up → the dialog; *Cancel* leaves it; *Move* moves it with the glyph · drag the morning band → Adjust with the delta · resize below the floor → allowed · keyboard-only → a move and a resize complete · move mode by two taps · 150% text → 96 px/hour with bands · record mode → no drag · a done item → not draggable, not resizable · a `confirm in the morning` item → not draggable.

## Non-negotiables (this slice)

- **A pin, a fixture or the hard anchor never moves by a slip.**
- **Nothing overlaps; a drop on an occupied time inserts.**
- **`original_scheduled_start` is never written; the ghost is never lost.**
- **Every drag has a keyboard path; every lift and drop is announced.**
- **Record mode has no drag layer.**

## Data & AI

**Schema changes: none.**

**Tables:** `day_items` (update through DYN-6's services), `day_blocks` (update through `moveBlock`).

**Placement:** `components/schedule-canvas/{schedule-canvas,layout,copy}.ts(x)`; `components/day-header-sheet/day-header-sheet.tsx`; `lib/routes.ts`; `packages/types/src/domain/view.ts` (`DayBlockView.startAt/endAt`); `services/day/get-day.ts`; `packages/ui/src/composed/control/drag-layer/drag-layer.tsx` (`onPinnedDrop`). Rule 3, rule 9.

**tRPC / validators:** existing `item.move`, `item.editToday`, `day.moveBlock`, `adjust.*`.

## Acceptance criteria (observable — local tier; `yarn web:dev`)

1. Today by block: bands named in the gutter, the work band tallest, split around a placed training block, slack labelled *12 min* between bands. *(Vesper.)*
2. Drag *Read* to 8:07: it lands at 8:05, what it displaced re-stacks beneath, nothing overlaps, no ghost until 8:07 passes. *(Vesper, Mason.)*
3. Drag the stand-up: the dialog *Move Stand-up to 9:45?*; *Cancel* leaves it; *Move* moves it with the glyph. *(Vesper.)*
4. Drag the morning band: the Adjust sheet opens with *Start work later* reflecting the delta. *(Vesper.)*
5. Drag an item's bottom edge below its range floor: allowed. *(Mason.)*
6. Keyboard only: Alt+↓ moves, Shift+↓ lengthens, `m` `8:30` moves; each announced. *(Vesper.)*
7. *Edit today* → the Schedule in move mode: a tap lifts, a tap drops. *(Vesper.)*
8. A closed day: no layer; a future day: drag works, no ghost, no now line; an unconfirmed today: the *Set the day first* line. *(Vesper.)*
9. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` and the Storybook build pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `DragLayer` sets pointer capture on its root, so the block's own `click` fires on the root after a drop; a `clickCapture` guard on the wrapper that swallows the click after a drop keeps the sheet closed.
- `moveItem`'s `toMin` is minutes from midnight of the day's date — the canvas's own unit.
- The container's children are positioned relative to it; the fixtures' `topPx` is their start minus the container's.

## Dev's call

The move-mode caption's words · the slack band's minimum height to label · whether the dialog names the time in the day's zone label.

## Out of scope

- **Two-finger scroll while lifted** — the browser's own; nothing to build.
- **The Phase-2 Schedule refinements** — `apps/web/AGENTS.md`.

## Depends on

- **DYN-15** — `blocks`, `unblocked`, the day header sheet. Complete in `PROGRESS.md`.
- **DYN-6** — `moveItem`, `moveBlock`, `editHabitDay`. Complete in `PROGRESS.md`.
