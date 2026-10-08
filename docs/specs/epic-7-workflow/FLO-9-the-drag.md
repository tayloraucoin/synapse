# FLO-9 — The drag: `Board` gains its `DndContext`; a row across cells and lanes; a lane among lanes; touch and keyboard

**Epic:** FLO — Workflow · **Phase 4 (does not gate)** · Size: M
**Slice type:** One interaction, the least-precedented UI in the epic: nested sortables in one drag context. The risk class is *a drop that lands somewhere other than where the line showed it*, *a drag that fights scrolling on touch*, and *a second code path for moving* that drifts from the menu's.
**Vigil:** touch (long-press, scroll while holding, drop, cancel) and keyboard (lift, move, drop, cancel) on a real phone width and a desktop.

**Status:** Complete (2026-10-04)

> **Vigil — touch and keyboard.** On a touch device or emulation at 375px: a long-press lifts a row; a short swipe still scrolls the page; holding near the edge scrolls; dropping lands where the line was; a second finger or `Esc` cancels and the row is back. At 1280px with a pointer: a row dragged from *In progress* in one lane to the middle of *Finish later* in another lands at that index in that lane, and *Undo* returns it. With the keyboard: the sortable's lift, arrows, drop and cancel work on a row and on a lane, and each step is announced. State which you ran.
>
> **Vesper — the lift and the line.** The lifted row is the product's lift (a 1.5px accent border, 0.9 opacity), the drop position is a 2px ink line, nothing else changes colour, and the firing mark on a lifted firing row is the only thing still moving. Under reduced motion rows jump to their places without sliding.

---

## Outcome

Moving a task becomes a drag: lift a row and drop it at any position in any cell of any lane, and it is there — same result, same toast, same undo as the menu. Lanes drag by a grip among themselves to change the usual order. On touch a long-press lifts. Everything FLO-7 built still works without touching a pointer. **Nothing else waits on this ticket; if nested sortables prove unstable on touch, the fallback below ships and the epic is still complete.**

## Why / intent

- **W12, UX §4 WF-01 *moving and reordering*** — drag is the faster path over the same moves; dropping into another lane changes the group; the drop position is a 2px ink line; lanes drag by their grip, among lanes only; pinned lanes hold their place.
- **TD-43** — a `DndContext` inside `Board`, a `SortableContext` per cell and one for the lanes, a `DragOverlay`; `Board` owns gesture and preview and emits intents; `SortableList` is not extended; dnd-kit stays inside `@syn/ui`.
- **UX §6** — a row settles in 120ms; reduced motion: no transition.
- **Ground truth (consumed):** `packages/ui/src/composed/control/sortable-list/sortable-list.tsx` (the sensors — pointer at 6px, touch at `DRAG_LONG_PRESS_MS` with 8px tolerance, keyboard — the lift look, the live text, `usePrefersReducedMotion`; match them, do not import its internals); FLO-4's `Board`, `BoardLane`, `BoardCell`, `LaneHeader`'s `handle` slot, `TaskRow`'s `lifted`; FLO-7's `moveTask` and the group reorder mutation.
- **What this slice is NOT (binding):** a new move or reorder procedure; a new dependency; a change to `SortableList`; dragging columns on the board; dragging a task onto a view tab; a drag on the lane *No group*'s head.

**Rulings this slice makes (labelled, logged):**

- **`Board` gains two optional props and is static without them**: `onMoveTask?({ id, toColumnId, toGroupId, toIndex })` and `onReorderLanes?(ids)`. Absent, no drag context is mounted and FLO-4's stories render as before. Logged.
- **The app passes FLO-7's `moveTask` and the group reorder as those callbacks.** The drag adds a caller, not a code path: the toast, the undo and the cache patch are the menu's. A drop inside the same cell is a reorder and shows no toast. Logged.
- **Lanes reorder among unpinned lanes only.** Pinned lanes and *No group* have no grip. A lane's drag reorders the usual order (UX §3.5). Logged.
- **On compact, a row drags within the visible column only** (UX WF-01's compact line); between columns is the menu. Logged.
- **Collapsed lanes accept a drop on their head**: the task goes to the end of that lane's cell in the row's current column. Logged.
- **Fallback, pre-authorised (TD-43's revisit trigger):** if nested sortables cannot be made stable on touch within this ticket, ship row drag only; lanes keep *Move up* / *Move down*. Say so in the report and in `DEVIATIONS.md`. Logged.

## Experience & states

**A row.** Pointer: press and move 6px lifts. Touch: hold 300ms lifts; movement before that scrolls. The lifted row follows in an overlay with the lift look; its place in the source cell is held open; a 2px ink line shows the drop position in the cell under the pointer; empty cells show the line at their top. Release drops. `Esc` cancels.

**A lane.** The grip (*Reorder {name}*) at the head's leading edge, visible on hover or focus on wide and always on compact; lifts the whole lane as its head; drops among unpinned lanes.

**Keyboard.** The sortable's own: focus a row's or lane's handle, `Space` lifts, arrows move (across cells and lanes for a row), `Space` drops, `Esc` cancels. FLO-7's `Alt`+arrows remain the direct path.

**States (exhaustive):** idle · lifting · over a valid cell (line shown) · over nothing (no line; release returns the row) · dropping (120ms settle; none under reduced motion) · cancelled · disabled (offline: no grip, no lift).

**Failure / edge states:** the move's write fails → FLO-7's revert and line · a refetch arrives mid-drag → the drag continues over the new data; if the lifted task no longer exists, the drag cancels · dropping where it started → nothing sent · a lifted firing row keeps breathing; dropping it outside the active column ends firing, with the toast's undo restoring it.

## Non-negotiables (this slice)

- **One move path.** The drag calls the callbacks; it performs no write and patches no cache itself.
- **`@dnd-kit/*` is imported only under `packages/ui/src/`.**
- **A drop lands at the line.**
- **A short swipe scrolls.** The page is never trapped by the board on touch.
- **Every drag has its announcement**, and `Esc` always cancels to the prior place.
- **Nothing FLO-7 built stops working**, with or without a pointer.
- **`SortableList` is unchanged.**

## Data & AI

**Schema changes: none.**

**Tables:** none directly; through FLO-7's `moveTask` (`task.move`) and the group reorder (`group.reorder`).

**Placement:** `packages/ui/src/composed/layout/board/{board.tsx, board-dnd.tsx, board.stories.tsx}`; `packages/ui/src/composed/display/lane-header/` (the grip rendered into the `handle` slot by `Board`, or a `LaneHandle` export beside it); `apps/web/app/(shell)/workflow/[view]/_components/workflow-board.tsx` (the two callbacks passed). Mason, TD-43.

**tRPC / validators:** none new.

**AI notes:** **None.**

## Accessibility

- A polite live region, as `SortableList`'s: lifted, moved (naming the lane, the column and the position — *Northwind, Finish later, position 2*), dropped, cancelled.
- The grip is a 44px target labelled *Reorder {name}*; a row's keyboard lift is on the row itself or a visually hidden handle — say which.
- The drop line is 2px ink, not colour-coded; the position is also announced.
- Reduced motion: no slide, no settle; rows and lanes change place at once.
- The position in an announcement is an ordinal the person asked for by lifting, not a tally on the board; it appears nowhere visually.

## Acceptance criteria (observable — Storybook, and the app on the local tier at 375px and 1280px; the conditions in the Vigil callout)

1. In the `board` story *Draggable*, dragging a row from one cell to the second position of another cell in a different lane calls `onMoveTask` once with that task's id, that column's id, that lane's group id, and `toIndex: 1`, and calls nothing else.
2. In the app, the same drag moves the task, shows *Moved to {Column}*, and *Undo* returns it to its lane, column and index; a firing task dragged out of the active column stops firing and undo restores it. *(Vigil.)*
3. Dragging a row within its cell reorders it with no toast, and the order survives a reload.
4. Dropping a row where it started sends no request.
5. Dragging a lane's grip below another unpinned lane changes the usual order after a reload; a pinned lane and *No group* show no grip.
6. On touch emulation at 375px: a swipe shorter than the long-press scrolls the page; a 300ms hold lifts; the row drops within the visible column. *(Vigil.)*
7. `Esc` during a drag returns the row with no request sent.
8. With the keyboard: `Space` on a focused row's handle lifts, `→` moves it to the next column's cell, `Space` drops, and the live region announced each step. *(Vigil.)*
9. With reduced motion emulated, a drop changes the row's place with no transition, and the only running animation is a firing mark.
10. With `Board` given neither callback, no drag context mounts and FLO-4's stories are unchanged.
11. `grep -rln "@dnd-kit" apps packages --include="*.ts" --include="*.tsx"` lists only files under `packages/ui/src/`.
12. `packages/ui/src/composed/control/sortable-list/` is unchanged in the diff.
13. FLO-7's criteria 3, 6, 7 and 20 still hold.
14. If the fallback was taken, the report and `DEVIATIONS.md` say so and criteria 5 and the lane parts of 8 are marked not built.
15. `yarn workspace @syn/ui run build-storybook --quiet` passes.
16. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- dnd-kit's multiple-containers pattern: one `DndContext`; each cell a `SortableContext` with its task ids and a `useDroppable` for the empty case; `onDragOver` tracks the container under the pointer; `onDragEnd` computes `{ toColumnId, toGroupId, toIndex }` and calls the callback. Keep the in-drag arrangement in local state and discard it on end — the app's cache patch is the truth.
- Discriminate drag types with `data: { type: "task" | "lane" }` so a lane never drops into a cell.
- `closestCorners` behaves better than `closestCenter` across cells of unequal height.
- A `DragOverlay` avoids the lifted row being clipped by the board's sideways-scrolling region and its sticky first column.
- Auto-scroll is on by default in dnd-kit; check it against the board's own horizontal region and the page's vertical scroll together.
- The app holds the cache; while a drag is in progress, a refetch re-rendering the lists must not reset the drag — key the sortables by task id, not index.

## Dev's call

`closestCorners` versus a custom collision strategy · where the keyboard lift lives on a row · how the in-drag arrangement is held · whether the grip is `LaneHeader`'s or `Board`'s to render.

## Out of scope

- **Dragging columns on the board** — columns reorder in the Columns sheet (FLO-8).
- **Dragging a task to another view** — *Move to view* (FLO-7).
- **Multi-select** — not in UX v0.1.

## Depends on

- **FLO-7** — `moveTask`, the group reorder, the toasts and undo the drag reuses. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Nested sortables with touch, keyboard and a scrolling region are where a drag library's examples stop and the edge cases start; a cheaper model ships the pointer path and traps the page on a phone.

---

### Kickoff (paste into the session)

> Build **FLO-9 — The drag** (attached spec). Model: **Opus**. **The drag adds a caller, not a code path: `Board` emits a move, the app's existing `moveTask` performs it; dnd-kit stays inside `@syn/ui`; a short swipe still scrolls.**
> Attach/read first, in order: this spec · `docs/ux/workflow-ux-spec-v0.1.md` §3.5, §4 WF-01 (*moving and reordering*, accessibility, compact), §6 · `01-technology-assessment.md` §3 (TD-43) · `packages/ui/AGENTS.md` · root `AGENTS.md` · `packages/ui/src/composed/control/sortable-list/sortable-list.tsx` (match, don't import its internals, don't change it) · FLO-4, FLO-7 · this track's `README.md`, `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Story first, with the full matrix, before the app passes a callback. Run the Vigil callout's touch and keyboard walks and say which you ran. If nested sortables are unstable on touch, take the pre-authorised fallback and log it. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands, then `yarn workspace @syn/ui run build-storybook --quiet`.
