# DYN-9 — The block editor, step two: drag to reorder, resize, seam-drag gaps, keyboard equivalents

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: M
**Slice type:** A gesture layer over a working editor. The risk class is *a drag that moves a pin* (a pin never lifts, never reorders, never takes a gap) and *a resize that clamps* (the range is information, never a bound — R21).
**Vigil:** none. **Vesper review:** the lifted block, the faint range band while resizing, the seam.

**Status:** Complete (2026-09-13 — authored and built in one thread, with DYN-20 and DYN-16; DYN-7's `DragLayer` wired over the strip with `editor`, the seam drag and `g` added to the layer, `template.moveSlot` gaining `steps`; every gesture has its keyboard path; the four root commands and the Storybook build pass; the gesture walk is not observed in a browser — logged in `DEVIATIONS.md`)

**Owner:** Reeve (spec) → dev (build) · **Reviewer:** Vesper (by eye), Mason (the writes are `saveSlot`/`moveSlot` only)

## Outcome

On the block editor's timed strip: long-press lifts a block and dragging reorders it with the stack re-flowing under it; dragging a block's bottom edge changes its duration in 5-minute steps, the minutes live beside the ghost and the habit's range as a faint band; dragging the seam between two blocks opens or closes the gap before the lower one; keyboard: Alt+↑/↓ reorders, Shift+↑/↓ resizes, `g` then a number sets the gap before the focused block, Escape cancels; a polite live region announces each. The slot sheet's *Gap before* stays as the fallback (§13 #8). Haptics on lift and drop where available. Reduced motion: positions jump.

## Why / intent

- **§3.11** — *"Long-press a block to lift it and drag it up or down to reorder; the stack re-flows under it as it moves. Drag a block's bottom edge to change its duration; the gutter shows the minutes live and nothing clamps to the range — the range is shown as a faint band on the block while dragging, as information. Drag the seam between two blocks to open a gap … Keyboard: … Alt+↑/↓ reorders; Shift+↑/↓ resizes; g then a number sets the gap."*; *"It must never clamp a duration to the habit's range (R21), and it must never rearrange a pin."*
- **§10.4** — every drag has a keyboard equivalent; the live region's sentences.
- **Ground truth (consumed, never rebuilt):** DYN-7's `DragLayer` (`editor`, `reorder`/`resize` intents, the live region, reduced motion), `GapBand` (`resizable`, the seam handlers), `ScheduleBlock` (`draggable`, `resizable`, `data-pinned`); DYN-8's strip, walk and slot sheet; `template.saveSlot`, `template.moveSlot`.
- **What this slice is NOT (binding):** a new procedure; a drag on the Schedule (DYN-16); a drag on a pool row or a placeable kind's row list.

**Rulings this slice makes (labelled, logged):**

- **The layer gains what §3.11 asks of it and nothing more:** a `gap` intent — from a seam drag (`[data-seam]` with the lower slot's id) and from `g` then a number on a focused block — and an optional `rangeMin`/`rangeMax` per item drawn as the faint band while resizing. Pins are excluded from `g` and the seam above a pin is not resizable (a pin has no gap). Logged.
- **`moveSlot` gains `steps`** (1–50): a drag to index *n* is the same adjacent swap the *Move up · Move down* rows do, repeated in one transaction; the index is computed among the walk's non-pinned slots and mapped to the template's order, so swapping past a pin moves the pin's index and never its time. No new procedure. Logged.
- **A resize writes `saveSlot` with the slot's own fields and the new length**; nothing clamps; the range band is the habit's `duration_min_min … duration_max_min` when the slot carries them. Logged.
- **The seam drag is bounded by the validator (0 … `GAP_MAX`)**: the layer proposes, the strip clamps to the bound before the write; a drag past 240 lands at 240. Logged.
- **Haptics are `navigator.vibrate(10)` on lift and drop** where the API exists; nothing else. Logged.

## Experience & states

### The strip — `components/block-editor/block-strip.tsx`

The timed strip wraps its axis in `DragLayer editor` with the placed slots as items (start from the walk, duration, pinned, resizable, the range). A lifted block: 0.9 opacity, accent border, the re-stack preview beneath; the drop writes `moveSlot` and the walk re-flows. The bottom edge: a resize ghost with *n min* and the faint range band; the drop writes `saveSlot`. The seam: `GapBand resizable` between two blocks — dragging it moves the lower block; the drop writes the lower slot's `gapBeforeMin`. `g` on a focused block: a small entry *Gap before {title}*, Enter writes. Every write is followed by the walk's own re-flow; `SaveStatus` reports as the editor already does.

**States:** idle · lifted · resizing (the band) · gap-dragging · dropping · saving · failed (*Changes aren't saving.* as DYN-8) · offline (the layer is disabled; the strip reads only) · reduced-motion.

**Failure / edge states:** drag across a pin → the pin stays; the block lands on its other side · resize below the range floor → allowed; the band shows where the range was · seam-drag past 240 → 240 · a one-of group → the chosen member moves; the group moves as one (the service's rule) · keyboard only → reorder, resize and gap each complete · a placeable kind (no anchor) → the row list, no layer.

## Non-negotiables (this slice)

- **A pin never lifts, reorders, or takes a gap.**
- **A resize never clamps to the range.**
- **Every gesture has a keyboard path and an announcement.**
- **Every write is `template.saveSlot` or `template.moveSlot`.**

## Data & AI

**Schema changes: none.**

**Tables:** `template_slots` (update — `duration_min`, `gap_before_min`, `sort_order`).

**Placement:** `components/block-editor/{block-strip,use-block-editor}.ts(x)`; `packages/ui/src/composed/control/drag-layer/{drag-layer,copy}.tsx` (+ story); `packages/validators/src/template.ts` (`moveSlotInput.steps`); `services/plan/templates.ts` (`moveSlot` steps); `routers/template.ts`. Rule 3, rule 9.

**tRPC / validators:** `template.moveSlot({ id, direction, steps? })`; existing `template.saveSlot`.

## Acceptance criteria (observable — local tier; `yarn web:dev`)

1. Long-press *Breath work* and drag it below *Walk*: the preview re-stacks; on release the strip shows the new order and the footer's span is unchanged. *(Vesper.)*
2. Drag *Walk*'s bottom edge down 10 minutes: the ghost reads *25 min*, the faint band shows the range; on release the walk re-flows and nothing clamps. *(Vesper.)*
3. Drag the seam under *Breath work* down: the gutter reads *+10*; on release *Walk*'s gap before is 10. *(Vesper.)*
4. Focus a block: Alt+↓ reorders it, Shift+↑ shortens it by 5, `g` `1` `5` Enter sets a 15-minute gap before it; each is announced. *(Vesper.)*
5. A pinned slot: the long-press does nothing; Alt+arrows do nothing; the seam above it does not drag. *(Mason.)*
6. Reduced motion: the preview and the drop jump. *(Vesper.)*
7. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` and the Storybook build pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The strip's items are the walk's `placed`; a reorder's target index is among the non-pinned placed slots in start order — map it to the template's `sortOrder` order before computing steps.
- `SlotView` carries no range; the strip has the habit list for the kind (`habit.list({ blockKind })`) or the range can ride on the slot view. The cheaper path is the view.
- The layer's `editor` mode already routes Alt+arrows to `reorder`; only `g` and the seam are new.

## Dev's call

Where the range rides (the view or a lookup) · the seam's hit target height · whether `g`'s entry accepts *+15* as well as *15*.

## Out of scope

- **Drag-from-panel on desktop** — §3.11's *Add* as drag; the tap path stands.
- **Drag on the pool band** — pool rows have no order the walk uses.

## Depends on

- **DYN-8** — the editor. Complete in `PROGRESS.md`.
