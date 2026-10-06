# DYN-7 — `@syn/ui` for v1.1: the composites every screen ticket composes

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: L
**Slice type:** Storybook-first component work — no route, no data, no procedure. The risk class is *a fork of the design system*: a second row component beside `ItemRow`, a second sheet, a second band, a colour where v1.1 §10.3 says there is none. The second risk is *a visual that announces nothing*: a drag layer that looks right to a sighted person and is silent to a screen reader.
**Vesper review:** every story in both themes, reduced-motion, and 200% text; the drag layer's five states; the serif surfaces.

**Status:** Complete (2026-09-13 — authored and built in one thread; every composite has its stories; the container row, the three item faces, the drag layer (pointer drag, keyboard moves and resize, the refusal line and the live region), the frame and the serif field checked in the Storybook build in both themes; `yarn ui:lint`, `yarn ui:typecheck`, `storybook build` and the four root commands pass; see `DEVIATIONS.md`)

> **Vesper — story review.** Open `yarn ui:storybook`. For every new or extended composite below, confirm: (1) each state in v1.1 §10.2's row renders as its own story; (2) light and dark read the same (no `dark:` classes; tokens flip); (3) reduced-motion has no scale and positions jump; (4) at 200% text every target stays ≥ 44px and nothing scrolls sideways; (5) `BudgetLine`'s three states are identical but for the numbers; (6) the `DragLayer` story can be driven by keyboard alone — lift, move, resize, drop, cancel, refused — with the live region announcing each. State which stories were opened in which theme.

---

## Outcome

Every reusable piece v1.1 names exists in `@syn/ui` with a story before any screen composes it. A block has a header and a band; a gap between two stacked things has a band with its minutes in the gutter; the quick-pick has a budget line that never changes colour; the Schedule and the block editor share one drag layer that lifts, snaps, previews the re-stack, drops, refuses, confirms, and says so aloud; last night's items have their checkbox rows; the first-run frame counts to any number and carries *Skip for now* beside its primary; the orient frame and the journal have their one serif text area; the item row has a container variant for the work block, a pin, a *confirm in the morning* face and a *not confirmed* face; the schedule block can be dragged, resized, pinned, or be the container; the slot row reads a slot's gap, pin, role and one-of tabs; the chip row, the segmented control, the large-target row, the weekday chips and the habit strip carry the small additions the twelve first-run screens and the reviews need. After this ships, **DYN-8 (the block editor), DYN-10/11 (first run), DYN-12 (the week build), DYN-13 (orient), DYN-14 (the quick-pick), DYN-15 (Today by block), DYN-16 (the editable Schedule), DYN-17 (Adjust), DYN-18 (the evening) and DYN-19 (Review) have every composite they compose.** No screen is built here; no data is read; `DayPartHeader` is not deleted (DYN-21); the drag layer owns no rows and writes nothing.

## Why / intent

- **v1.1 §6.1** — *"The body is sectioned by **block** (R20), each with a `BlockHeader`: the block's name and its computed span in muted tabular text — *Morning · 7:03–8:11*, *Before work · 8:15–9:00*, *Work · 9:00–17:30*, *Wind-down · 22:00–22:45*. … A pin carries the small anchor glyph before its title … The work block is one row: a container `ItemRow` variant with the focus as its title, its span as its time text, and the fixtures inside it nested beneath with a shallow indent; if training or a break splits it, the workout row sits between two work rows labelled *Work · 9:00–11:00* and *Work · 12:00–17:30*."* Spec: *"`BlockHeader` (new; replaces `DayPartHeader`: `{ kind: BlockKind; name: string; span: { startLabel; endLabel } | null }`), `ItemRow` (+ `pinned`, `container` variant with nested children)."*
- **v1.1 §6.5** — *"each block kind renders as a **band** behind its items, a very light fill (`bg-surface`) with the block's name in the gutter at the band's top … The work band is the tallest; fixtures sit inside it as pinned blocks with the anchor glyph. … Long-press an item block to lift it; drag to a new time; it snaps to 5 minutes and the items it displaces re-stack beneath it as it moves; release to drop. Drag a block band's header to move the whole block … Drag an item's bottom edge to change its length for today. Tap an appointment or fixture and drag: the block does not lift."* States: *"idle · lifted (block at 0.9 opacity, 1.5px `border-accent-mark`, the re-stack preview drawn beneath) · dropping (120ms settle) · refused (a pin under the drop: the block returns, a one-line `StatusLine` *Fixed things don't move by drag*) · confirming (dialog)"*. Motion: *"lift scales to 1.02 over 120ms; re-stack preview moves 120ms; drop settles 120ms. Reduced-motion: no scale, positions jump."*
- **v1.1 §3.11** — *"Between items, the gaps render as thin empty bands with the minutes written in the gutter (*+5*); a gap of zero is a hairline. A pin shows the anchor glyph and its clock time; opener and closer rows in an opener-pool-closer routine carry a small *opener* / *closer* caption, and pool items sit in a lighter band labelled *decide in the morning*. A one-of group is a single block with two tabs at its top (*meal-prepped 10 · cook it 30*); the default tab is filled."* Gestures: *"Long-press a block to lift it and drag it up or down to reorder … Drag a block's bottom edge to change its duration … Drag the seam between two blocks to open a gap … Keyboard: arrow keys move focus in time order; Alt+↑/↓ reorders; Shift+↑/↓ resizes; `g` then a number sets the gap."*
- **v1.1 §5.3** — *"A sticky line at the section's foot in tabular figures: *68 chosen · 72 available*. Ticking one more turns it to *83 chosen · 72 available*; nothing changes colour."* Spec: *"a sticky `BudgetLine` (new: two tabular numbers and a middle dot; no colour states)"*; §10.4: *"The quick-pick's budget line is `aria-live="polite"` with a 500ms debounce so tapping three boxes announces once."*
- **v1.1 §7.3** — *"the items after devices-off as `CheckboxField` rows — *Read · Stretch* — none pre-ticked, each 44px."* §10.4: *"The confirm-yesterday rows are labelled *Read, last night, not confirmed*."*
- **v1.1 §7.1, §10.1** — *"the items after devices-off render without a checkbox and with the caption *confirm in the morning*"*; *Not confirmed*: *"Absent; listed in Review as *not confirmed*"* / Schedule: *"Ghost outline"*; *Devices off*: *"Hairline row, anchor glyph, time, no checkbox."*
- **v1.1 §4 (the frame, once)** — *"Every screen sits in `StepFrame`: a caption top-left (*3 of 12*), *Finish later* top-right as ghost text, the heading at 1.375rem, at most one paragraph of body under it, the content, and the primary button pinned above the safe area with *Skip for now* as ghost text beside it where skipping is allowed."* §4.1: the three grey archetype cards *"render at `text-text-disabled` with a caption *not yet* on the right, not tappable"*.
- **v1.1 §5.2, §7.2** — *"a single serif `Textarea`, one row, growing"*; the journal: *"a serif `Textarea` that starts at one row and grows"*. §10.3: *"Newsreader appears on three new surfaces — the orient frame, the journal, the Week Review's reflections — all reflective."*
- **v1.1 §10.2** — the state rows for `BudgetLine`, `DragLayer`, `BlockHeader`; **§10.3** — *"No new colours."*; **§10.4** — the keyboard equivalents, the live region, reduced motion.
- **v1.1 §12.2** — the words: *Block*, *Pin · Fixed*, *One of*, *Decide in the morning*.
- **Handoff v2 §5.6–5.8** — the existing contracts of `ItemRow`, `ScheduleBlock`, `ScheduleAxis` being extended, not replaced.
- **W5** (v1.1 §13) — `SegmentedControl` stacks under its label when three segments would wrap.
- **Ground truth (consumed, never rebuilt):** `packages/ui/src/composed/display/{day-part-header,item-row,schedule-block,schedule-axis,state-word,habit-strip}`, `composed/control/{quick-chip-row,segmented-control,large-target-row,weekday-chips}`, `primitives/control/{textarea,checkbox}`, `primitives/form/checkbox-field` (or wherever `CheckboxField` lives — the builder reads the tree), `composed/__fixtures__/view-models.ts`, `apps/web/app/(setup)/_components/step-frame.tsx`; DYN-1's `DayBlockView`, `DayItemView` (v1.1 fields), `SlotView` (v1.1 fields), `BudgetState`, `DragState`, `StateWordKind`, `StripState`.
- **What this slice is NOT (binding):** no screen, no route, no procedure, no data; no removal of `DayPartHeader`, the template editor's `SlotRow`, or any v1.0 composite (DYN-21); no wiring of the drag layer to `item.move` / `day.moveBlock` (DYN-16) or of the editor's drag to `template.moveSlot` (DYN-9); no `AdjustSheet`, `QuickPick`, `OrientFrame`, `JournalScreen`, `BlockEditor`, `HabitDaySheet`, `FixtureSheet` — those are feature folders in their own tickets.

**Rulings this slice makes (labelled, logged):**

- **`BlockHeader` is added beside `DayPartHeader`; nothing is deleted.** Both coexist until DYN-15 stops reading day parts and DYN-21 removes them (`README.md` § Canonical paths). Logged.
- **The drag layer owns no data.** It takes the blocks and items it is laid over (ids, geometry, `pinned`, `resizable`) and emits `{ kind: "move", id, toMin }`, `{ kind: "resize", id, durationMin }`, `{ kind: "move-block", blockId, deltaMin }`, and `{ kind: "reorder", id, toIndex }` (the editor); refusal (`refused`) and the pin dialog (`confirming`) are the CALLER's answer, fed back as a prop, so one layer serves the Schedule (DYN-16) and the editor (DYN-9) and neither knows about the other's rows. Logged.
- **`BudgetLine` never changes colour** (§5.3, §10.2). `state` exists for the `aria-live` sentence and for tests; the visual is the numbers. Logged.
- **No new tokens** (§10.3). Bands are `bg-surface`; lifted blocks `border-accent-mark`; gutter labels `text-text-secondary` caption tabular. A builder who reaches for a new colour stops. Logged.
- **The serif `Textarea` is the only serif control in the library** — `variant="serif"` on the existing primitive, autogrow from one row; no second component. Logged.
- **`StateWordKind` does not gain `pinned`.** DYN-1 ruled a pin is the anchor glyph before the title (§6.1), carried by `ItemRow`'s `pinned` prop and `ScheduleBlock`'s; the handoff's list is corrected here. Logged.
- **`StripState` gains `not-confirmed`** — the Week Review's *"blank with the label *not confirmed*"* (§7.3) is a strip square; `@syn/types` is widened by one member (a DYN-1 union; the read model that emits it is DYN-19's). Logged.
- **`StepFrame` moves to `@syn/ui` as a presentational frame; the app keeps a binding wrapper.** The frame today (`apps/web/app/(setup)/_components/step-frame.tsx`) carries the router, tRPC and the online hook. The `@syn/ui` `StepFrame` takes `{ step, total, heading, body?, children, primary, skip?, onBack?, onFinishLater, offline?, error?, copy }` and renders; the app file keeps `useStepNavigation` and a `StepFrame` that binds it, so the five existing steps change one import at most. DYN-10 composes the `@syn/ui` frame with `total = 12`. **[NEEDS VALUE AT BUILD] resolved: it lives in the app today; it moves.** Logged.
- **`ItemRow container` is a variant, not a second component.** Same list semantics, same `data-item-row` handle, no checkbox, the focus as the title, the span as the time text, children nested at one indent step. Logged.
- **The `confirm-later` face has no checkbox and the caption word; the `not-confirmed` face is the same row faded with the *not confirmed* word** — `StateWordKind` needs no `not-confirmed` member because the word is `StateWord`'s `text` under the `confirm-later` kind's styling? **No** — the review lists it, the Today tab never shows it (§10.1 *Absent*); `ItemRow` renders `not-confirmed` as faded with `StateWord kind="pending"`-style muted text *not confirmed* via `text`. Logged as the one place the word is rendered outside the strip.
- **Long-press is 300 ms, snap is `DRAG_SNAP_MIN`, motion is `--dur-state` (120 ms)** — constants from `@syn/constants`, never literals in the component. Logged.

## Experience & states

**No screen.** Each composite is described by its contract, the v1.1 sentence it renders, and its stories.

### `BlockHeader` — `composed/display/block-header/`

v1.1 §6.1: *"the block's name and its computed span in muted tabular text — *Morning · 7:03–8:11*"*. Props `{ kind: BlockKind; name: string | null; span: { startLabel: string; endLabel: string } | null; split?: boolean; className? }`. Renders the name (or the kind's default word when `name` is null — *Orient*, *Morning*, *Before work*, *Work*, *Activity*, *Wind-down*, *Training*, *Break*, from `copy.ts`), a middle dot, the span in `text-text-secondary` tabular caption; `split` renders the same header for each half (the caller renders two). No span (`null`) renders the name alone — an unstructured day's block (§10.2 *no-span*). Heading level is the caller's (`as` prop, default `h2`). Stories: with-span · no-span · split (two headers *Work · 9:00–11:00*, *Work · 12:00–17:30*) · each kind.

### `BlockBand` — `composed/display/block-band/`

v1.1 §6.5: *"a very light fill (`bg-surface`) with the block's name in the gutter at the band's top"*. Props `{ kind: BlockKind; name: string | null; topPx: number; heightPx: number; draggable?: boolean; onHeaderPointerDown?: (event) => void; children?: ReactNode; className? }`. Absolutely positioned inside a `ScheduleAxis` column; children are the `ScheduleBlock`s and are positioned by the caller; the gutter label sits 8px from the band's top (§10.3). `draggable` makes the header a handle (`role="button"`, `aria-label` *Move {name}*); the drag itself is the `DragLayer`'s. Stories: morning · work (tall) · split work (two bands with a training band between) · draggable · empty (a pooled block: the band with no children and the label *decide in the morning*).

### `GapBand` — `composed/display/gap-band/`

v1.1 §3.11: *"gaps render as thin empty bands with the minutes written in the gutter (*+5*); a gap of zero is a hairline"*; §10.1 *Slack*: *"Empty band between two block bands, labelled in the gutter (*12 min*) … Never coloured"*. Props `{ minutes: number; topPx: number; heightPx: number; label?: "gap" | "slack"; resizable?: boolean; onSeamPointerDown?: (event) => void; className? }`. Zero minutes → a hairline. The gutter text is `+5` for a gap, `12 min` for slack. `resizable` exposes the seam as a handle (`role="separator"`, `aria-orientation="horizontal"`, `aria-valuenow` the minutes). Stories: gap 5 · gap 0 (hairline) · slack 12 · resizable.

### `BudgetLine` — `composed/display/budget-line/`

v1.1 §5.3: *"*68 chosen · 72 available*"*. Props `{ chosenMin: number; availableMin: number; state?: BudgetState; sticky?: boolean; className? }`. `state` derives from the numbers when omitted (under · exact · over). Two tabular numbers with their words and a middle dot; **identical rendering in every state**. `aria-live="polite"` on an inner region whose text updates after a 500 ms debounce (§10.4). Stories: under · exact · over (the three side by side, to prove they match) · sticky.

### `DragLayer` — `composed/control/drag-layer/`

v1.1 §6.5, §10.2, §10.4. Props:

```ts
{
  /** Geometry the layer needs and nothing else. */
  pxPerHour: number;
  snapMin?: number;              // default DRAG_SNAP_MIN
  longPressMs?: number;          // default DRAG_LONG_PRESS_MS (300)
  items: ReadonlyArray<{ id: string; title: string; startMin: number; durationMin: number; pinned: boolean; resizable: boolean; blockId: string | null }>;
  blocks: ReadonlyArray<{ id: string; name: string; startMin: number; endMin: number; draggable: boolean }>;
  /** The caller's answers, fed back (rulings above). */
  state: DragState;              // idle · lifted · dropping · refused · confirming
  refusedMessage?: string;       // "Fixed things don't move by drag."
  /** Emitted intents; the layer writes nothing. */
  onIntent: (intent: DragIntent) => void;
  onLift?: (id: string) => void;
  onCancel?: () => void;
  /** Explicit move mode (§10.4): tap lifts, tap drops, no long-press. */
  moveMode?: boolean;
  formatTime: (minutes: number) => string;
  children: ReactNode;          // the axis, bands and blocks it is laid over
}
type DragIntent =
  | { kind: "move"; id: string; toMin: number }
  | { kind: "resize"; id: string; durationMin: number }
  | { kind: "move-block"; blockId: string; deltaMin: number }
  | { kind: "reorder"; id: string; toIndex: number };
```

Behaviour: a pointer-down on an item held `longPressMs` (or immediately with a mouse, `pointerType === "mouse"`) lifts it — `state` becomes the caller's, but the layer renders the lifted ghost itself (0.9 opacity, 1.5px `border-accent-mark`, scale 1.02 over `--dur-state`; reduced-motion: no scale); moving snaps to `snapMin` and draws the re-stack preview (the displaced items' outlines moved beneath, 120 ms; reduced-motion: jump); release emits `move`; a pinned item never lifts — the layer emits nothing and the caller decides whether to open the dialog (`confirming`); the bottom-edge handle emits `resize`; a band header emits `move-block`; Escape cancels. Keyboard (§10.4): with a block focused, Alt+↑/↓ emits `move` by `snapMin`, Shift+↑/↓ emits `resize` by `snapMin`, Enter is the caller's open, `m` then a typed time (`HH:mm`, Enter) emits `move`; in the editor, Alt+↑/↓ emits `reorder`. A polite live region announces *Lifted {title}* on lift, *{title} moved to {time}* on drop, *{title} is now {n} min* on resize, and the `refusedMessage` when `state` becomes `refused`. Stories: idle · lifted (pointer) · lifted (keyboard, driven by the story's `play`) · dropping · refused · confirming · move mode · reduced motion · editor reorder.

### `ConfirmYesterdayRows` — `composed/control/confirm-yesterday-rows/`

v1.1 §7.3: `CheckboxField` rows, none pre-ticked, 44px each, labelled *{title}, last night, not confirmed* (§10.4). Props `{ items: ReadonlyArray<Pick<DayItemView, "id" | "title" | "icon">>; checked: ReadonlySet<string> | string[]; onChange: (id: string, checked: boolean) => void; caption?: string /* "Last night" */ }`. Stories: pending (two rows) · one ticked · none (renders nothing — the section is absent, §5.3).

### `StepFrame` — `composed/layout/step-frame/`

v1.1 §4 (the frame, once). Props `{ step: number; total: number; heading: string; body?: string; children?: ReactNode; primary: { label: string; onClick: () => void; busy?: boolean; disabled?: boolean }; skip?: { label?: string; onSkip: () => void; busy?: boolean }; onBack?: () => void; onFinishLater: () => void; offline?: boolean; error?: string | null; copy: { progress: (step: number, total: number) => string; back: string; finishLater: string; skip: string; offline: string } }`. *Skip for now* is ghost text beside the primary (§4), not a secondary button (the v1.0 frame's secondary is replaced — logged). Focus moves to the heading on step change. Stories: 3 of 12 · with skip · first step (no back) · offline · error · busy.

### `Textarea variant="serif"` — `primitives/control/textarea/`

v1.1 §5.2, §7.2: one row, grows with content, Newsreader at body size, hairline under, caption label. Add `variant?: "default" | "serif"` and `autogrow?: boolean` (default true under serif). Stories: serif empty · serif with three lines · default (unchanged).

### Extensions in place

- **`ScheduleBlock`** (+ `draggable`, `resizable`, `pinned`, `container`, `ghostOutline`): `pinned` renders the anchor glyph (`⚓`-free — the product's own small glyph, an SVG in `item-icon`'s style; **the same glyph in `ItemRow`**) and marks the block `data-pinned` so the layer does not lift it; `resizable` renders the bottom-edge handle (8px, `cursor: ns-resize`, `aria-hidden` — the keyboard path is the layer's); `container` is the work block: title = the focus, no lift on the body, children slotted; `ghostOutline` is the *not confirmed* face on the Schedule (§10.1: *"Ghost outline"*). Stories added: pinned · resizable · container with two fixtures inside · ghost outline · confirm-later.
- **`ItemRow`** (+ `variant: "container"`, `pinned`, and the `confirm-later` / `not-confirmed` faces): `container` renders no checkbox, the focus title, the span as time text, and `children` (nested `ItemRow`s) at one indent step (`ps-(--space-6)`); `pinned` draws the glyph before the title; `state === "confirm-later"` renders no checkbox and `StateWord kind="confirm-later"`; `state === "not-confirmed"` renders faded with the word; `state === "moved"` renders `StateWord kind="moved"` with the time text unchanged (§10.1). Stories added: container · container split (two rows around a workout row) · pinned · confirm-later · not-confirmed · moved · devices-off marker (hairline row: `item.type === "task_appointment" && pinned && durationMin === 1` is NOT the rule — the caller passes `marker: true`).
- **`StateWord`** — the `confirm-later`, `opener`, `closer` kinds exist (DYN-1); confirm their stories and tones (`confirm-later` secondary, roles caption). No new kind.
- **`SlotRow`** — the template editor's row (find it: `apps/web/components/template-editor/` or `@syn/ui`; if it is app-local, **this ticket lifts a `SlotRow` into `composed/display/slot-row/`** reading the widened `SlotView`: gap caption *+5* before the row, the pin glyph and clock, the role caption (*opener* / *closer*, `StateWord`), the one-of tabs (*meal-prepped 10 · cook it 30*, the default filled — a two-segment control inside the row, read-only in this ticket). Stories: stack · with gap · pinned · opener · closer · pool (lighter band, *decide in the morning*) · one-of.
- **`QuickChipRow`** (+ `selected?: string | null`, `onSelect`) — the placements chip row (§3.7) with one chip preselected; keeps its existing free-form use. Story: placements with *Not today* last.
- **`SegmentedControl`** (W5) — stacks under its label when three segments would wrap; a `stacked?: boolean` prop the caller sets from its own measurement, plus a `min-w` per segment so the browser wraps to the stacked layout at 200% by default. Story: three segments at 200%.
- **`LargeTargetRow`** (+ `disabled?: boolean`, `caption?: string`) — §4.1's grey archetype cards: `text-text-disabled`, not tappable, the caption *not yet* on the right. Story: the four cards, one live.
- **`WeekdayChips`** (+ `multiple?: boolean`, `value: Weekday[]`) — fixtures pick a set (§4.4). Story: multi-select Mon/Wed/Fri.
- **`HabitStrip`** — the `not-confirmed` square: blank with a hairline outline and the word in the legend (§7.3). Story: a week with one not-confirmed day.
- **`composed/__fixtures__/view-models.ts`** — block-shaped fixtures: `blockDayView` (Taylor's Monday after *Set the day*: orient · training · morning · prep · work with two fixtures · wind-down with the marker and two confirm-later items), `unstructuredDayView`, `splitWorkDayView`, `slotViewsPrep` (the one-of), `quickPickFixture` is DYN-14's; every story above reads these.

**States (exhaustive):** per composite, the §10.2 row; the `ItemRow` matrix gains `moved`, `confirm-later`, `not-confirmed`, container, container-split, pinned, marker; `ScheduleBlock` gains pinned, resizable, container, ghost-outline; `DragLayer` idle · lifted · dropping · refused · confirming · move-mode; `BudgetLine` under · exact · over; `BlockHeader` with-span · no-span · split; `GapBand` gap · hairline · slack · resizable; `StepFrame` first · middle · last · with-skip · offline · error · busy.

**Failure / edge states:** `BlockBand` with `heightPx` under the label's height → the label alone, clipped by the band (the work band is never that short; a break can be) · `GapBand` negative minutes → treated as zero (a validator's failure upstream) · `DragLayer` with `state="lifted"` and no matching item id → renders idle · a resize below `snapMin` → emits `snapMin` · a move past the axis's end → clamped to the last snap inside the axis, the caller refuses if it must · `ConfirmYesterdayRows` with an empty list → renders nothing · `StepFrame` `total < step` → renders the caption as given (the caller's bug, not hidden) · `Textarea serif` pasted 40 lines → grows to `max-h-[60vh]` then scrolls.

## Non-negotiables (this slice)

- **Storybook-first.** Every new or extended composite has a story per state before any screen imports it (root `AGENTS.md` § UI). A composite without a story is not finished.
- **No new tokens, no hex, no `dark:`** (§10.3, `packages/ui/AGENTS.md`).
- **The drag layer writes nothing and knows no procedure.** It emits intents; the caller answers.
- **`BudgetLine` never changes colour.**
- **Every drag has a keyboard equivalent and a live-region sentence** (§10.4). A story proves it.
- **Reduced motion designed, not dropped:** no scale, positions jump, nothing draws (§10.4).
- **≥ 44px targets at 200% text; no horizontal scroll** (official spec §11).
- **`@syn/ui` imports only `@syn/{types,constants,utils}`.** No app, no `@syn/db`, no `@syn/api`.

## Data & AI

**Schema changes: none.**

**Tables:** none — no data is read.

**Placement:** `packages/ui/src/composed/display/{block-header,block-band,gap-band,budget-line,slot-row}/`, `composed/control/{drag-layer,confirm-yesterday-rows}/`, `composed/layout/step-frame/`, extensions in `composed/display/{schedule-block,item-row,state-word,habit-strip}`, `composed/control/{quick-chip-row,segmented-control,large-target-row,weekday-chips}`, `primitives/control/textarea`; `composed/__fixtures__/view-models.ts`; `src/index.ts` + `package.json` `exports` (enumerated); `packages/types/src/domain/ui-state.ts` (`StripState` + `not-confirmed`); `packages/constants/src/motion.ts` (`DRAG_LONG_PRESS_MS = 300`) — `../README.md` § Placement rules 1 (tokens), 2 (composites in `@syn/ui`), 5 (view models in, never rows), and root `AGENTS.md` § UI. Mason's call. `apps/web/app/(setup)/_components/step-frame.tsx` keeps `useStepNavigation` and a wrapper that binds the `@syn/ui` frame.

**tRPC / validators:** none.

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

- **The drag layer's keyboard path is the whole point** (§10.4): Alt+arrows move, Shift+arrows resize, Escape cancels, `m` then a time moves; `aria-live="polite"` announces lift, drop, resize, and refusal. The explicit move mode (tap lifts, tap drops) is a prop, for people who cannot hold a press.
- **`BudgetLine`** announces once per 500 ms, not once per tap.
- **`ConfirmYesterdayRows`** label each checkbox *{title}, last night, not confirmed*.
- **`BlockBand`'s header is a button when draggable**, with *Move {name}*; the band itself is decorative (`aria-hidden` on the fill).
- **`GapBand`'s seam** is a `separator` with the minutes as its value.
- **Focus-visible** 2px `--ring`, 2px offset, on every block, band header, seam, row, chip (§10.1).
- **200% text:** the block editor's strip is DYN-8's, but `ScheduleBlock`'s `hairline` size and `ItemRow`'s `min-w-0` must keep holding; the `SegmentedControl` stacks; `StepFrame`'s primary and ghost skip stay ≥ 44px.

## Acceptance criteria (observable — `yarn ui:storybook`, both themes; the four commands)

1. **`BlockHeader`** stories render *Morning · 7:03–8:11* with the span in `text-text-secondary` tabular caption; `no-span` renders the name alone; `split` renders two headers *Work · 9:00–11:00* and *Work · 12:00–17:30*. *(Vesper.)*
2. **`BlockBand`** renders `bg-surface` with the label 8px from the top; the work band at 8.5h × 64px/h is 544px tall with two pinned fixtures inside; the empty pooled band reads *decide in the morning*; the draggable header is a focusable button labelled *Move Morning*. *(Vesper.)*
3. **`GapBand`** at 5 min renders a band with *+5* in the gutter; at 0 a hairline; slack 12 reads *12 min*; the resizable seam is a `separator` with `aria-valuenow=5`.
4. **`BudgetLine`** under/exact/over render identically except the numbers (screenshot the three side by side); the live region's text updates once after three quick prop changes within 500 ms. *(Vesper.)*
5. **`DragLayer` pointer:** long-press 300 ms lifts (a mouse lifts on drag start), the ghost is 0.9 opacity with a 1.5px accent border, moving snaps to 5 min and draws the re-stack preview, release emits `{ kind: "move", id, toMin }` (the story logs it); a pinned item emits nothing on press-and-drag. *(Vesper.)*
6. **`DragLayer` keyboard:** the `keyboard` story's `play` function focuses a block, presses Alt+↓ twice and Shift+↑ once, and the story's log shows `move +10` then `resize -5`; the live region reads *Lifted Meditate*, *Meditate moved to 8:13*, *Meditate is now 10 min*; Escape cancels and announces nothing; `m`, `08:30`, Enter emits `move` to 8:30. *(Vesper — by keyboard alone.)*
7. **`DragLayer` states:** `refused` returns the block and renders the `refusedMessage` in a `StatusLine`, announced; `confirming` holds the block at its origin; `moveMode` lifts on a single tap and drops on the next; reduced-motion (the story toggles `prefers-reduced-motion`) shows no scale and positions jump. *(Vesper.)*
8. **`ConfirmYesterdayRows`** renders two 44px rows, none checked, each labelled *Read, last night, not confirmed*; an empty list renders nothing.
9. **`StepFrame`** renders *3 of 12*, *Finish later* as ghost text top-right, the heading focused on step change, *Skip for now* as ghost text beside the primary; `onBack` absent → no back button; the five existing first-run steps in `apps/web` render unchanged through the app's wrapper (`yarn build` and a visual check of `/setup/1`). *(Vesper.)*
10. **`Textarea serif`** renders Newsreader at body size, one row, grows to three lines with three lines of text, `max-h-[60vh]` then scrolls; the default variant is unchanged.
11. **`ScheduleBlock`** `pinned` shows the glyph and carries `data-pinned`; `resizable` shows the bottom handle; `container` renders the focus title with two nested fixture blocks; `ghostOutline` renders a hairline outline with no fill. *(Vesper.)*
12. **`ItemRow`** `container` nests two `ItemRow`s at one indent step with no checkbox on the container; `pinned` shows the glyph; `confirm-later` has no checkbox and the caption *confirm in the morning*; `not-confirmed` is faded with *not confirmed*; `moved` shows the word and the planned time unchanged; the marker renders as a hairline row with the glyph and the time. *(Vesper.)*
13. **`SlotRow`** renders the gap caption, the pin clock, the *opener* / *closer* captions, the pool band, and the one-of tabs with the default filled. *(Vesper.)*
14. **`QuickChipRow`** `selected` renders one chip pressed (`aria-pressed`); **`SegmentedControl`** with three segments at 200% stacks under its label with no overflow; **`LargeTargetRow`** `disabled` renders `text-text-disabled`, `aria-disabled`, not tabbable, the caption *not yet*; **`WeekdayChips`** `multiple` toggles Mon/Wed/Fri independently; **`HabitStrip`** renders the `not-confirmed` square as an outlined blank with the legend word. *(Vesper.)*
15. At 200% text every interactive target in every story is ≥ 44px and no story scrolls horizontally at 375px. *(Vesper.)*
16. `yarn ui:storybook` builds (`storybook build`); `yarn ui:build`, `yarn ui:lint`, `yarn ui:typecheck` pass.
17. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Read `schedule-axis` before `BlockBand`: the axis owns `pxPerHour` and the column; bands and blocks are its absolutely positioned children. `BlockBand` is a sibling of `ScheduleBlock` in the same column, drawn first (lower `z-index`).
- The drag layer is a controller around the axis, not inside it: it listens on a wrapping `div` (`onPointerDown` captured), finds the target by `data-item-id` / `data-block-id`, and draws the ghost and the preview in a portal-free overlay `div` positioned over the axis. Pointer capture (`setPointerCapture`) keeps the drag alive when the finger leaves the block. Two-finger scroll while lifted: do not call `preventDefault` on `touchmove` with two touches.
- Keyboard: one `onKeyDown` on the wrapper; the focused block is `document.activeElement.closest("[data-item-id]")`. The `m`-then-time mode is a small inline input that appears beside the block, labelled, and disappears on Enter or Escape.
- Reduced motion: `matchMedia("(prefers-reduced-motion: reduce)")` once, through the package's existing hook if there is one (`src/hooks`); the stories toggle it with a decorator.
- The pin glyph: one small inline SVG in `composed/display/item-icon` (or a sibling `pin-glyph`), 12px, `currentColor`, used by `ItemRow`, `ScheduleBlock`, `SlotRow`. Not an emoji.
- `StepFrame`: keep the app's `useStepNavigation` where it is; the app wrapper is ten lines.

## Dev's call

Whether `BlockBand` and `GapBand` share a `band.variants.ts` · the exact shape of `DragIntent` beyond the four kinds named · whether `SlotRow` lifts from the app or is written fresh against `SlotView` (read the app's row first; lift if it reads a `SlotView`, write fresh if it reads a form) · the pin glyph's drawing.

## Out of scope

- **Every screen** — DYN-8 … DYN-19 compose these.
- **Wiring the drag layer** — DYN-16 (the Schedule), DYN-9 (the editor).
- **Removing `DayPartHeader`, day parts, the v1.0 `SlotRow`** — DYN-21.
- **`StripState`'s emitter** — DYN-19's Week Review read model.
- **The pin confirm `Dialog`'s copy** — DYN-16 (*Move Dentist to 3:15?*).

## Depends on

- **DYN-1** — the unions (`BlockKind`, `DragState`, `BudgetState`, `StateWordKind`, `StripState`) and the widened `DayItemView`, `DayBlockView`, `SlotView`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The drag layer's keyboard parity and live region, and the row variants' state matrix, are where a cheaper model ships a visual that looks right and announces nothing; the second row component is the fork the ticket exists to prevent.

---

### Kickoff (paste into the session)

> Build **DYN-7 — `@syn/ui` for v1.1** (attached spec). Model: **Opus**. **Storybook-first; no new tokens; the drag layer emits intents and writes nothing; every drag has a keyboard equivalent and a sentence; the budget line never changes colour; extend `ItemRow` and `ScheduleBlock`, never fork them.**
> Attach/read first, in order: this spec · v1.1 §3.11, §4 (the frame), §4.1, §5.2, §5.3, §6.1, §6.5, §7.1–7.3, §10.1–10.4, §12.2 · `packages/ui/AGENTS.md` · `docs/ai-guides/{component-guidelines,brand-tokens,classnames,typography-guidelines}.md` · handoff v2 §5.6–5.8 · the existing composites named under *Ground truth* (read every one you extend, and its story) · `apps/web/app/(setup)/_components/step-frame.tsx` · DYN-1 (the unions and view models) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Audit before building: `primitives/` and the v2 handoff §5 first. Write the story with the component. Run `yarn ui:storybook` and check both themes, reduced motion, and 200%. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
