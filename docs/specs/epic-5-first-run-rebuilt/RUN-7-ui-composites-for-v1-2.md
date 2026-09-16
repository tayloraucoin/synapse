# RUN-7 — `@syn/ui` for v1.2: `Card`, `SelectRow`, `SortableList`, `RangeEditor`, `RichTextEditor`, `TagInput`, `PassageCarousel`, the optimistic steppers, and the small extensions every screen ticket composes

**Epic:** RUN — The first run rebuilt (UX v1.2) · **Phase 2** · Size: L
**Slice type:** Storybook-first component work — no route, no data, no procedure. The risk class is *a fork of the design system* (a second sortable beside `DragLayer` that shares its code; a second row beside `SelectRow`; a card with a shadow) and *a control that waits* (a stepper whose value follows the request rather than the tap).
**Vesper review:** every story in both themes, reduced-motion, and 200% text; the optimistic stories under a slow network; the editor's five controls; the sortable driven by keyboard alone.

**Status:** Not started

> **Vesper — story review.** Open `yarn ui:storybook`. For every composite below confirm: (1) each state in v1.2 §10.2's row is its own story; (2) light and dark read the same (tokens flip; no `dark:` classes); (3) the *slow network* control on `MinutesStepper`, `CountStepper`, `Stepper17` and `SelectRow` shows the value change on the tap and the hairline pulse after, never a disabled control; (4) `SortableList` can be driven by keyboard alone — Alt+↑/↓ — with the live region announcing; (5) `RichTextEditor` has exactly five toolbar controls and round-trips the sample Markdown; (6) `Card` has a hairline and no shadow; (7) `StepFrame`'s action row stays pinned with 3× viewport content; (8) at 200% text every target stays ≥ 44px and nothing scrolls sideways at 375px; (9) emoji slots are 44px squares, `aria-hidden`. State which stories were opened in which theme.

---

## Outcome

Every reusable piece v1.2 names exists in `@syn/ui` with a story before any screen composes it. A setup card has a base (`Card`: `bg-surface`, `border-hairline`, 16px padding, no shadow); a chooser has a row that is the selection (`SelectRow`); a vertical list can be reordered by handle, pointer and keyboard (`SortableList`, dnd-kit); a range can be edited in one compact line (`RangeEditor`); a passage has an editor with five controls that speaks Markdown (`RichTextEditor`) and a tag field (`TagInput`); the orient frame has a carousel with dots (`PassageCarousel`); the three steppers hold their value on the tap and commit on a debounce; `StepFrame`'s action row is sticky; `TimeField` has *Done* and a leading slot; `WeekdayChips` has *Flexible*; `BlockBand` can label inside the band; `LargeTargetRow` and `ListRow` have a leading slot; the `font-emoji` stack is one token. After this ships, **RUN-8…RUN-13 have every composite they compose.** No screen is built here; nothing reads data; `RangeInput` and `DragLayer` are untouched (RUN-15 removes the first once unused; the second stays for the Schedule).

## Why / intent

- **v1.2 §4 (frame rules, R43)** — *"the action row pinned above the safe area at every scroll position — a hairline above it, `bg-paper` behind it … Content scrolls beneath the action row with 96px of bottom padding"*; *"the open control has a **Done** that returns it to the value state, and blur does the same"*; *"Selection is a row, not a checkbox: a `SelectRow` — emoji, title, a muted detail on the right; the whole row is the target; selected rows show a tick in the trailing slot and an ink border"*; *"Cards collapse."*
- **v1.2 §2 guardrail 4, TD-18** — *"Steppers hold their value locally and write on a debounce … nothing disables itself while a request is in flight"*; the `value / onChange / onCommit` contract; `useOptimisticValue` in `@syn/hooks`.
- **v1.2 §10.2** — the state rows: `SelectRow` (default · selected · saving · failed · disabled · focus-visible), `SortableList` (idle · lifted · dropping · keyboard · reduced-motion), `RangeEditor compact` (default · editing · invalid · focus-visible), `RichTextEditor` (empty · writing · toolbar-active · link-editing · read-only · offline · focus-visible · reduced-motion), `TagInput`, `PassageCarousel` (one · many · quote-day · empty · reduced-motion), `TimeField disclosed` (value · open · saving · error), the steppers (local value at once; 400ms debounce; never disabled in flight; failed reverts with one line), `WeekdayChips` (+ flexible), `LargeTargetRow` (+ leading), `ListRow` (+ leading emoji), `ScheduleAxis`/`BlockBand` (+ in-band labels; *"labels never in the gutter below 3 hours of height"*). *"Emoji rendering. One rule for every slot: the glyph sits in a 44px square, `text-[1.25rem]` on rows and `text-[1.5rem]` in card headers, `font-emoji` … vertically centred on the row's control, with `aria-hidden`."*
- **v1.2 §10.4** — `SortableList`'s keyboard path and live region; `SelectRow` as `button[aria-pressed]`; the editor's `toolbar` role and 200% wrap; the carousel as a `region` with `tablist` dots.
- **v1.2 §4.6, TD-15, TD-16** — the editor: *"a five-control toolbar pinned above the keyboard — bold · italic · quote · list · link — and nothing else"*; Markdown in and out; tiptap and dnd-kit are `@syn/ui`'s alone.
- **v1.2 §4.9** — `Stepper17` *"as seven 40px squares in one row (they fit at 375px with 4px gaps); the chosen one ink-filled; the numbers stay visible"*.
- **v1.2 §5.2** — the carousel: *"its images above if any (one at column width; a strip if more), its title as a caption in muted sans, its body in Newsreader at body size; or, on a quote day, the quote in quotation marks with its attribution as a caption under the chrome caption *A quote*. Beneath the column, a row of dots … Swipe, or the arrow keys, moves between passages with a 200ms settle (crossfade under reduced motion)."*
- **v1.2 §4.13i, S12.1** — `BlockBand` *"the block's name and span inside the band's top edge, never in the gutter"* at 96px/h.
- **v1.1 §10.3** — no new colours. `Card` is the shadcn base re-slotted with the house tokens: hairline, no shadow, `rounded-md` per the preset.
- **Handoff v2 §5** — existing contracts (`MinutesStepper`, `CountStepper`, `Stepper17`, `TimeField`, `WeekdayChips`, `LargeTargetRow`, `ListRow`, `StepFrame`, `ScheduleAxis`, `BlockBand`, `Textarea serif`, `EmojiPicker`, `ItemIcon`) are extended, not replaced.
- **Ground truth (consumed, never rebuilt):** those composites; `primitives/{control,layout,feedback}`; `composed/control/drag-layer` (the Schedule's — untouched); `composed/control/range-input` (untouched; superseded in sheets by `RangeEditor`); `composed/__fixtures__/view-models.ts`; `packages/config/tailwind/preset.css`; `packages/config/eslint/boundaries.js` (`RESTRICTED_EXTERNAL`); `packages/hooks/src/`; RUN-1's seeds for story data.
- **What this slice is NOT (binding):** no screen, no route, no procedure; no `HabitSetupCard` / `WorkoutSetupCard` / `FocusSetupCard` / `WorkDayTypeCard` / `DayPlanCard` / `PassageCard` / `PassageSheet` / `DayBuilder` — those are feature folders (app-local composition, placement rule 9); no change to `DragLayer`; no deletion of `RangeInput`.

**Rulings this slice makes (labelled, logged):**

- **`Card` is a primitive** (`primitives/layout/card/`) from the shadcn set with `CardHeader` / `CardContent` / `CardFooter`, restyled to the house: `bg-surface`, `border border-hairline`, no shadow, 16px padding. Setup cards and `DayPlanCard` compose it; nothing else in the app gains a card by this ticket. Logged.
- **`useOptimisticValue<T>({ value, onCommit, debounceMs })` lives in `@syn/hooks`** (platform-pure: no DOM) and returns `{ local, set, committing, error, revert }`; the three steppers and `SelectRow` consume it; `STEPPER_COMMIT_DEBOUNCE_MS` from `@syn/constants` is the default. Existing callers of the steppers are updated to the new contract in this ticket (`onChange` becomes `onCommit`; a codemod-by-hand over the app — list every file in the closing report). Logged.
- **`SortableList` is generic over its item** (`renderItem(item, { handleProps, isLifted })`), owns the dnd-kit sensors (pointer, touch with 300ms delay, keyboard), the live region (*Lifted {title}* · *{title} moved to position n*), and emits `onReorder(ids)`. It never imports from `drag-layer/`. Logged.
- **`RichTextEditor` takes `valueMd` / `onChangeMd`** and converts at the boundary with `tiptap-markdown`; `readOnly` renders the same prose styles without the toolbar (so the frame and the read-only passage use one renderer, never `dangerouslySetInnerHTML`); the toolbar is a `role="toolbar"` of five `IconButton`s with labels; link editing is a small popover with one field. Headings, images, colour and tables are not installed. Logged.
- **`RangeEditor` is `from · to · min` on one 44px line, right-aligned, 3-digit fields, with `invalid` when `to < from`** and the sentence *The second number is the longer one.* `[COPY]`; `RangeInput` stays for LB-02 until RUN-15. Logged.
- **`PassageCarousel` takes `slides: ({ kind: "passage", … } | { kind: "quote", … })[]`, `index`, `onIndexChange`**; images render through the app's asset URL builder passed as a prop (`resolveImageUrl`), so the composite knows no route. Logged.
- **`StepFrame` gains `stickyActions` (default true)**; `total` already accepts any number (DYN-7 set it to twelve; the prop is a number). Logged.
- **`--font-emoji` is one `@theme` line in `preset.css`** (`"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`) and `ItemIcon`'s emoji branch uses `font-emoji`; a new `EmojiSlot` display composite (44px square, size variant `row | card`, `aria-hidden`) is what every row and card header uses so the rule has one home. Logged.

## Experience & states

### The new composites

- **`Card`** (primitive) — default · with header/footer · as a collapsed summary (a `Card` with one line and an *Edit* text button; the collapse itself is the feature folder's).
- **`SelectRow`** — `{ icon: IconValue | null; title; detail?; selected; onToggle; committing?; error?; disabled?; disabledCaption? }`; 56px min height; two-column grid from 720px is the *list's* concern — `SelectRowList` wraps it with `columns={1|2}`.
- **`SortableList`** — as ruled; handle 44px, `GripVertical` from the curated set, labelled *Reorder {title}*; lifted row 0.9 opacity, 1.5px `border-accent-mark` (the same lift grammar as `DragLayer`, by copying the two classes, not the code); 120ms settle; reduced-motion jumps.
- **`RangeEditor`** — as ruled.
- **`RichTextEditor`** — as ruled; placeholder in muted serif; min rows prop; the toolbar sticks to the bottom of the editor's viewport on mobile (above the keyboard) — `position: sticky; bottom: 0`.
- **`TagInput`** — chips with an `×` (44px target), Enter/comma adds, Backspace on empty removes the last, `max` prop with a muted count when near it.
- **`PassageCarousel`** — as ruled; dots 8px, current ink; `region` labelled *Today's reading*; swipe via pointer events with a 40px threshold; arrow keys; crossfade under reduced-motion.
- **`EmojiSlot`** — as ruled.
- **`useOptimisticValue`** — in `@syn/hooks`, with a story-free README note in the hook file.

### The extensions

- `MinutesStepper`, `CountStepper`, `Stepper17`: the contract; `Stepper17` gains `layout="row"` (seven squares). `TimeField`: `disclosed` gains *Done* (44px text button) and blur-to-value; `leading?: ReactNode`. `WeekdayChips`: `flexible?: boolean`, `onFlexible`, a leading *Flexible* chip that clears and renders ink when set. `LargeTargetRow`: `leading?: ReactNode` (rendered through `EmojiSlot` when an `IconValue`); disabled rows fade the leading slot to 0.4. `ListRow`: `leading?`. `BlockBand`: `labelPlacement="gutter" | "inside"`, and `ScheduleAxis` picks *inside* automatically when the axis is under 3 hours tall. `StepFrame`: `stickyActions`.

**States (exhaustive):** per v1.2 §10.2's table, one story each. **Failure / edge states:** `onCommit` rejects → `error` set, `local` reverts to `value`, the caller's `StatusLine` shows the one line (the composite shows a hairline in `text-text-secondary`, never red) · `SortableList` with one item → the handle is present and inert · `RichTextEditor` given Markdown with a heading → rendered as a paragraph (the extension is not installed) and round-tripped as the text without `#` — stated in the story · `PassageCarousel` with `slides: []` → the placeholder slot the caller passes as `empty`.

## Non-negotiables (this slice)

- **No new colours** (v1.1 §10.3). `Card` has a hairline, not a shadow; a failed stepper is a hairline, not red.
- **A control's own state changes on the tap.** No composite disables itself while committing.
- **`SortableList` and `DragLayer` share no code.**
- **The editor has five controls.** Nothing else installed.
- **`@dnd-kit/*` and `@tiptap/*` are imported only inside `@syn/ui`** and listed in `RESTRICTED_EXTERNAL`.
- **Every glyph slot is `aria-hidden` and 44px.**
- **Every new composite has a story; every extended one has a story for the extension.**

## Data & AI

**Schema changes: none.** **Tables:** none.

**Placement:** `packages/ui/src/primitives/layout/card/`; `packages/ui/src/composed/control/{select-row,sortable-list,range-editor,rich-text-editor,tag-input}/`; `composed/display/{passage-carousel,emoji-slot}/`; the extended composites in place; `packages/ui/package.json` (the seven dependencies; exports); `packages/hooks/src/use-optimistic-value.ts`; `packages/config/tailwind/preset.css` (`--font-emoji`); `packages/config/eslint/boundaries.js` (`RESTRICTED_EXTERNAL` += the seven, comment generalised); `packages/constants` is read (`STEPPER_COMMIT_DEBOUNCE_MS`). Placement rules 8 (`@syn/ui`, Storybook-first), headless hooks in `@syn/hooks`.

**tRPC / validators:** none.

**AI notes:** **None.**

## Accessibility

- `SelectRow` is a `button` with `aria-pressed`; the tick is decorative; the disabled caption (*in your library*) is read with the row.
- `SortableList`: handle labelled *Reorder {title}*; Alt+↑/↓ moves the focused row; a polite live region announces lift and drop; reduced-motion jumps.
- `RichTextEditor`: `role="toolbar"` with labelled buttons and the standard shortcuts (⌘/Ctrl+B, I, K); the editor announces formatting changes; at 200% the toolbar wraps to two rows and stays pinned.
- `PassageCarousel`: `region` *Today's reading*; dots are `tablist` / `tab`s with arrow-key movement; swipe has the keys as its fallback.
- `TimeField`'s *Done* returns focus to the *Change* button.
- `EmojiSlot` is `aria-hidden`; the title is the accessible name everywhere.
- 200% text: seven `Stepper17` squares wrap to two rows of four and three; `RangeEditor` stays on one line at 375px until 200%, then stacks *to* under.

## Acceptance criteria (observable — `yarn ui:storybook`, both themes, reduced-motion on and off, 100% and 200% text)

1. `Card` renders with `border-hairline`, `bg-surface`, no `shadow-*` class; a story shows a collapsed one-line card with *Edit*.
2. `SelectRow`'s six states are six stories; under the *slow network* control the tick appears on the tap and the hairline pulse follows; a rejected commit reverts the tick and surfaces `error`. *(Vesper.)*
3. `SortableList`'s story: pointer drag reorders and emits `onReorder`; Alt+↓ on the second row moves it to third and the live region announces; touch lifts after 300ms; reduced-motion jumps; `grep -rn "drag-layer" packages/ui/src/composed/control/sortable-list` returns nothing. *(Vesper.)*
4. `RangeEditor` on one 44px line at 375px; `to < from` shows the sentence; at 200% *to* stacks under.
5. `RichTextEditor`: the toolbar has five buttons; typing `**bold**` round-trips to `**bold**` through `valueMd`; a heading in the input renders as a paragraph; `readOnly` renders the prose with no toolbar; `grep -rn "dangerouslySetInnerHTML" packages/ui/src/composed/control/rich-text-editor` returns nothing. *(Vesper.)*
6. `TagInput` adds on Enter and comma, removes on the chip's `×` and on Backspace-when-empty, refuses past `max`.
7. `PassageCarousel` stories: one · three · quote-day · empty; arrow keys move; dots are tabs; reduced-motion crossfades.
8. `MinutesStepper`, `CountStepper`, `Stepper17` hold the tapped value and call `onCommit` once after 400ms of quiet across five rapid taps (the story logs commits); none renders `disabled` while committing; `Stepper17 layout="row"` shows seven 40px squares at 375px. *(Vesper.)*
9. `StepFrame` with 3× viewport content keeps the action row pinned with the hairline and paper fill; the last content row is reachable above it.
10. `TimeField disclosed` opens on *Change*, closes on *Done* and on blur, returning focus to *Change*; `leading` renders an `EmojiSlot`.
11. `WeekdayChips` *Flexible* clears every day and renders ink; picking a day clears *Flexible*. `LargeTargetRow` and `ListRow` render `leading`; a disabled `LargeTargetRow` fades its glyph.
12. `ScheduleAxis` at 2 hours tall draws band labels inside the band; at 4 hours in the gutter; no label overlaps another in either story.
13. `packages/config/eslint/boundaries.js` lists the seven packages under `owners: ["ui"]`; a probe import of `@dnd-kit/sortable` from `apps/web` fails `yarn lint:boundaries` (probe pasted, then removed).
14. Every caller of the three steppers in `apps/web` compiles against the new contract (listed in the closing report).
15. `yarn workspace @syn/ui run build-storybook --quiet` passes; `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Conscious Connections' `packages/ui` has a dnd-kit sortable already; read it for the sensor setup and the announcement strings, then write Synapse's in the house voice — copy the approach, not the file.
- `tiptap-markdown` exposes `editor.storage.markdown.getMarkdown()`; set content with the same extension so the input is parsed as Markdown, not HTML.
- `useOptimisticValue`'s revert must not fire if a newer commit is pending (track a sequence number).
- `EmojiPicker` (frimousse) already exists; `EmojiSlot` is display only and does not open it — the feature folder wires the two.
- `BlockBand`'s inside label: caption size, `text-text-secondary`, 8px from the band's top-left, same as the gutter label's style.

## Dev's call

`SelectRowList` as a separate export or a `columns` prop on a wrapper · `Card` sub-component names · the carousel's swipe implementation (pointer events vs a library — no library) · how `readOnly` prose styles are shared (a `prose-passage` class in the preset is fine).

## Out of scope

- **The feature-folder cards, sheets, the builder, the frame** — RUN-8…RUN-13.
- **Deleting `RangeInput`** — RUN-15.
- **Any change to `DragLayer` or the Schedule's drag** — not in this epic.
- **The step sheet mode on `HabitSheet`** — RUN-10.

## Depends on

- **RUN-1** — the seeds for story data, `STEPPER_COMMIT_DEBOUNCE_MS`, `HabitVersion`, the view models. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Nine new composites with full state matrices, two third-party engines wrapped behind stable contracts, and a prop-contract change across every stepper caller; a cheaper model reuses `DragLayer` for the list, installs tiptap's whole starter kit including headings, or disables the stepper while committing.

---

### Kickoff (paste into the session)

> Build **RUN-7 — `@syn/ui` for v1.2** (attached spec). Model: **Opus**. **No new colours; a control's own state changes on the tap; `SortableList` and `DragLayer` share no code; five editor controls; dnd-kit and tiptap never leave `@syn/ui`; every glyph slot is 44px and `aria-hidden`.**
> Attach/read first, in order: this spec · v1.2 §2, §4 (frame rules), §4.6, §4.9, §5.2, §10.2, §10.4 · v1.1 §10.3 · `packages/ui/AGENTS.md` · `docs/ai-guides/component-guidelines.md` (RUN-1's optimistic section) · `docs/ai-guides/brand-tokens.md` · root `AGENTS.md` · DYN-7 (the composites being extended — reuse, don't fork) · the v2 handoff §5 for the existing contracts · RUN-1 · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-16, TD-18, TD-20) · Epic 4's `DEVIATIONS.md` (DYN-7's lines).
> Storybook first; every state a story; list every stepper caller you updated. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn workspace @syn/ui run build-storybook --quiet`, then `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
