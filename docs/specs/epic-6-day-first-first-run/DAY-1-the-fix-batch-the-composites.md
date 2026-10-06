# DAY-1 — The fix batch, the composites: the selection grammar on `LargeTargetRow`, `InfoDisclosure`, `PriorityMark`, the two-line collapsed card, steppers by one with an empty state, `StepFrameSkeleton`, the `SearchField` padding, stories

**Epic:** DAY — The first run built day-first (UX v1.3) · **Phase 0** · Size: M
**Slice type:** Design-system corrections in `@syn/ui` — six amended composites, two new ones, every state a story. The risk class is *a second grammar* (a selected state that differs between `SelectRow` and `LargeTargetRow`), *a stepper that snaps mid-word*, and *a skeleton that looks like content*.
**Vigil:** none. **Vesper review:** every story in both themes; the selected state beside a primary button on one canvas; the collapsed card at 375px with a long summary; the stepper emptied and blurred; the skeleton next to the real frame.

**Status:** Complete (2026-09-25)

> **Vesper — story review.** Open Storybook. Confirm: `LargeTargetRow` selected reads as a choice, not a button, on a canvas that also shows a `Button default`; the check sits in the trailing 44px slot and the detail never shifts when it lands; `InfoDisclosure` collapsed is a glyph and a label at secondary size, open is a surface panel whose lines read *term, definition* with the term in weight 500; `PriorityMark` is a 24px ink square whose number is legible at caption size; a `Card` collapsed to two lines wraps its caption at most twice and truncates nothing on the first line but the title; `MinutesStepper` emptied shows *0* as a placeholder in `text-text-disabled`, and blur writes the min, never a snapped mid-typed number; `StepFrameSkeleton` reads as waiting, not as a screen. Say what you would change before DAY-2 composes them.

---

## Outcome

Every composite the v1.2 walkthrough faulted is corrected at the pattern, once, with its story, before any screen is touched: a chosen `LargeTargetRow` is `bg-surface`, a 1.5px ink border and a check — the same grammar `SelectRow` already has — so the sticky primary is the only ink fill on a setup screen; an `InfoDisclosure` exists for every *what does each choice do?*; a `PriorityMark` exists for the matters number; a `Card` can collapse to two lines through one `CardSummary` slot; the three steppers move by one, accept an empty field with a *0* placeholder, and write on blur; a `StepFrameSkeleton` exists for every route transition in the sequence; the `SearchField`'s input no longer sets its text against its border. After this ships, **DAY-2 composes these into the v1.2 screens and nothing in the fix batch waits on Taylor's read of v1.3 §13.** No screen changes here; no new screen composites (DAY-7).

## Why / intent

- **v1.3 R56, §4 frame rules** — *"a chosen `SelectRow` or `LargeTargetRow` is `bg-surface`, a 1.5px `border-ink`, and a check at 20px in the trailing slot; the text stays ink; hover on an unchosen row is `bg-surface` alone. The ink fill (`bg-primary`) is the primary button's and the `Stepper17` cell's, nowhere else."* Amends v1.1 §9.7's `LargeTargetRow` (T1.1, T3.1).
- **v1.3 R60, §10.2, §10.4** — `InfoDisclosure`: *"an info glyph with a text label; open, a surface panel of term-and-definition lines"*; `button[aria-expanded]` controlling a `region`; the glyph `aria-hidden` (T2.3).
- **v1.3 R59, §10.2** — `PriorityMark`: *"the `Stepper17` row cell at 24px: `bg-primary`, `text-primary-foreground`, the number in caption size, tabular, 4px radius. It is never interactive"*; `aria-label` *matters n* (T9.3).
- **v1.3 R57, §10.2** — the collapsed card: *"two lines: glyph · title · Edit / caption facts (line-clamp 2)"* (T3.3).
- **v1.3 R62, §10.2** — *"step by one · empty with *0* placeholder · write on blur · pulse · revert"*; amends the v2 handoff §5.4's *buttons move by 5* (T9.1).
- **v1.3 R63, §2 guardrail 6, §10.2** — `StepFrameSkeleton`: *"the caption, a heading bar, three `SkeletonRow`s, the action row"*; `aria-busy` on the frame's main region; nothing announces (T10.4, T13.1).
- **T13.2** — the `SearchField`'s input padding.
- **Ground truth (consumed, amended in place):** `packages/ui/src/composed/control/large-target-row/`, `text-disclosure-button/` (stays; the new composite sits beside it), `stepper-17/` (its `stepper-17.variants.ts` cell variant is what `PriorityMark` renders at 24px), `minutes-stepper/`, `count-stepper/`, `search-field/`; `packages/ui/src/primitives/layout/card/` (RUN-7's shadcn `Card` with `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`); `composed/display/step-frame/` (DYN-7's frame, RUN-7's sticky row) and `composed/feedback/skeleton*` (the `SkeletonRow`, `SkeletonBlock` primitives Settings already uses); `@syn/hooks/use-optimistic-value` (TD-18, TD-22) — `hold` for a mid-typed value, `set` for a committed one.
- **What this slice is NOT (binding):** any screen in `apps/web` (DAY-2); the v1.3-only composites — `BlockBand hue`, `LinkCallout`, `BrandGlyph`, the `FixtureSheet` fields (DAY-7); a change to `SelectRow`'s grammar (it is already R56's; only its story gains the side-by-side canvas); a change to `Stepper17`'s interactive cells (they keep the ink fill by rule).

**Rulings this slice makes (labelled, logged):**

- **`LargeTargetRow`'s `row` layout (the 56px cells of Adjust's *how far behind*) takes the border and the surface but not the check** — four cells at 375px have no trailing slot; the border and the surface carry the choice and the cell's text is its label. `stacked` takes all three. Logged.
- **`InfoDisclosure` is a new composite beside `TextDisclosureButton`, not a variant of it** — the text toggle's contract (no glyph, the label changes) is used by *Show archived* and *Last night* and must not gain a glyph. Props: `label`, `expanded`, `onToggle`, `items: { term, text }[]`, `id`; renders the Lucide `Info` at 20px, 1.5px stroke, `aria-hidden`; the panel is `bg-surface border-hairline rounded-(--radius) p-(--space-3)` with `gap-(--space-2)`; each line a `Text caption` with the term as a `span` in `font-medium text-ink` and the text in `text-text-secondary`. Logged.
- **`PriorityMark` is display-only** (`composed/display/priority-mark/`): `value: 1–7`, renders a `span` with `role="img"` and `aria-label` from a `copy.ts` (*matters {n}*); the cell class is `stepper17CellVariants({ selected: true, size: "mark" })` — a new `size` variant on the existing cell, 24px, so the mark and the control share one source of truth for the fill and radius. Logged.
- **The two-line collapsed card is a `CardSummary` composition helper, not a `Card` variant** — `CardSummary({ leading, title, caption, action })` renders `CardHeader` with the `EmojiSlot`, a `CardTitle` (`truncate`), the `CardAction`, and a `CardDescription` beneath the title in `text-text-secondary` caption size with `line-clamp-2`; the four setup cards call it in DAY-2. It lives in `primitives/layout/card/card-summary.tsx` and is exported from the card's barrel. Logged.
- **Steppers: the `step` prop is removed; the buttons move by one; the input allows empty** — `MinutesStepper` and `CountStepper` drop `step?: 5 | 1`; on `onChange` an empty string calls `hold(null)` and shows the placeholder *0*; on blur an empty or `NaN` value commits `min` (a length of 0 is not a length); a typed value inside the bounds commits as typed; outside them it clamps with the existing two-second note. Nothing snaps before blur. `Stepper17` is untouched. Logged.
- **`StepFrameSkeleton` mirrors `StepFrame`'s geometry** — the caption line (`SkeletonBlock` 16px × 64px), a heading bar (`SkeletonBlock` 28px × 60%), an optional body line, three `SkeletonRow`s at `--row-min`, and the sticky action row with a `SkeletonBlock` in the primary's place; the root carries `aria-busy="true"` and `aria-label` from copy (*Loading*); no animation beyond the skeleton primitives' own pulse, which reduced-motion already stills. Logged.
- **`SearchField` gains `ps-(--space-3)` on its input after the glyph's slot** so the value never touches the border at 375px. Logged.

## Behaviour & states

**No screen.** Storybook is the surface. Stories added or amended (each with a *both themes* decorator as RUN-7's stories have):

- `large-target-row.stories.tsx` — *Stacked, one selected, beside a primary* (a `Button default` on the canvas under the rows) · *Row, one selected* · *Disabled option* (unchanged) · *Focus-visible*.
- `info-disclosure.stories.tsx` — *Collapsed* · *Expanded, five items* (screen 3's five lines as fixture text) · *Keyboard: Enter toggles, focus stays on the button*.
- `priority-mark.stories.tsx` — *1 through 7 in a row* · *Beside an `EmojiSlot` and a title at 375px*.
- `card.stories.tsx` — *Collapsed, two lines, short* · *Collapsed, two lines, long caption wraps to two and clamps* · *Collapsed, long title truncates*.
- `minutes-stepper.stories.tsx` / `count-stepper.stories.tsx` — *Steps by one* · *Emptied: placeholder 0* · *Blur on empty commits min* · *Typed 7 from 9 without a snap* · *Clamped with the note* (existing).
- `step-frame-skeleton.stories.tsx` — *Default* · *With body line* · *Beside the real frame*.
- `search-field.stories.tsx` — *With a value* (the padding visible).

**States (exhaustive), per component:** as v1.3 §10.2's rows for `LargeTargetRow`, `InfoDisclosure`, `PriorityMark`, `Card` collapsed, `MinutesStepper`/`CountStepper`, `StepFrameSkeleton`. **Failure / edge states:** a stepper's `value` prop arriving `null` → the placeholder *0* and `min` on the first tap; a `PriorityMark` given a value outside 1–7 → the type refuses it (no runtime branch); `InfoDisclosure` with no items → renders the button only.

## Non-negotiables (this slice)

- **One selection grammar.** After this ticket no composite in `@syn/ui` fills a chosen row or card with `bg-primary`.
- **No stepper snaps before blur.**
- **`Stepper17`'s interactive cells keep the ink fill.** The number is their label.
- **Every new or amended state has a story in both themes.**
- **No hex, no off-scale spacing, no arbitrary values** — tokens by name.
- **`TextDisclosureButton` is untouched.**

## Data & AI

**Schema changes: none.**

**Tables:** none.

**Placement:** `packages/ui/src/composed/control/large-target-row/large-target-row.tsx` (+ stories); `packages/ui/src/composed/control/info-disclosure/{info-disclosure.tsx,copy.ts,index.ts,info-disclosure.stories.tsx}` (new); `packages/ui/src/composed/display/priority-mark/{priority-mark.tsx,copy.ts,index.ts,priority-mark.stories.tsx}` (new); `packages/ui/src/composed/control/stepper-17/stepper-17.variants.ts` (the `mark` size); `packages/ui/src/primitives/layout/card/card-summary.tsx` (new) + the card's `index.ts` and stories; `packages/ui/src/composed/control/minutes-stepper/minutes-stepper.tsx`, `count-stepper/count-stepper.tsx` (+ stories); `packages/ui/src/composed/display/step-frame/step-frame-skeleton.tsx` (new) + stories; `packages/ui/src/composed/control/search-field/search-field.tsx`; `packages/ui/src/index.ts` (exports). Rule 9 of `../README.md` § Placement (reusable UI in `@syn/ui` with a story); the `component-guidelines.md` anatomy.

**tRPC / validators:** none.

**AI notes:** **None.**

## Accessibility

- `InfoDisclosure`: `button[aria-expanded][aria-controls]`; the panel `role="region"` with `aria-labelledby` the button; the glyph `aria-hidden`; 44px minimum target.
- `PriorityMark`: `role="img"` + `aria-label`; never focusable.
- `LargeTargetRow` selected: the native radio still announces *checked*; the check is `aria-hidden`; the border passes 3:1 against paper in both themes (ink on paper; neutral-100 on neutral-900).
- Steppers: the emptied input keeps `aria-valuenow` unset and `aria-valuemin`/`max`; the placeholder is not announced as a value.
- `StepFrameSkeleton`: `aria-busy`; no live region.
- `CardSummary`'s caption is part of the card's accessible name through `aria-labelledby` on the title only; the caption is read in flow.

## Acceptance criteria (observable — Storybook at 375px and 1024px, both themes)

1. `LargeTargetRow` stacked, one option selected: computed `background-color` equals `--surface`, `border-color` equals `--ink`, `border-width` is 1.5px, and a `svg` check renders in the trailing slot; the unselected options have `--hairline` borders; hover on an unselected option sets `--surface`. The `Button default` beside it is the only element with `--primary` as its background. *(Vesper.)*
2. `LargeTargetRow` row layout, one selected: border and surface as above; no check rendered; four cells fit 375px.
3. `InfoDisclosure` collapsed shows the glyph and the label; Enter or click toggles `aria-expanded`; expanded, the region lists the items with the term in weight 500 and the text in the secondary tone; focus remains on the button after toggling.
4. `PriorityMark` renders 24×24px, `--primary` fill, the number centred at caption size; `getComputedStyle` on it and on a selected `Stepper17` row cell agree on background and radius.
5. `CardSummary` at 375px with a 90-character caption wraps to two lines and clamps; a 60-character title truncates with an ellipsis; *Edit* stays on the first line.
6. `MinutesStepper`: *+* from 12 gives 13; clearing the input shows *0* as placeholder and holds `null`; blur on empty commits `min` and calls `onCommit(min)` once; typing *7* over *9* shows *7* without an intermediate snap and commits *7* on blur; `step` is no longer a prop (a TypeScript error if passed). Same for `CountStepper`.
7. `StepFrameSkeleton` renders the caption, heading, three rows and the action row; the root has `aria-busy="true"`; under `prefers-reduced-motion` nothing animates.
8. `SearchField` with a value: the input's computed `padding-inline-start` is at least `--space-3` beyond the glyph slot; the text does not touch the border.
9. Every story above renders in both themes without a console error; `yarn workspace @syn/ui run build-storybook --quiet` passes.
10. `grep -rn "bg-primary" packages/ui/src/composed/control/large-target-row packages/ui/src/composed/control/select-row` returns nothing.
11. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `stepper17CellVariants` is a `cva`; add `size: { cell: …, row: …, mark: "size-6 rounded-[4px] text-(length:--fs-caption)" }` and keep the existing two sizes' classes byte-identical.
- The stepper's empty state: `hold(null)` already exists on `useOptimisticValue`; the input's `value={local ?? ""}` and `placeholder="0"` do the rest; guard the *−* button so it disables at `min` as today.
- `StepFrameSkeleton` can reuse `StepFrame`'s layout classes by extracting the sticky-row class string to a shared `step-frame.classes.ts` rather than copying it.
- `CardSummary` is where the four setup cards' collapsed branches converge in DAY-2; write it to take `leading: React.ReactNode` so a `PriorityMark` can sit beside the `EmojiSlot`.

## Dev's call

Whether `InfoDisclosure` animates its panel (200ms settle, crossfade under reduced motion) or appears at once · the exact skeleton widths · whether `CardSummary` exposes a `captionLines` prop (default 2).

## Out of scope

- **Composing these into screens** — DAY-2.
- **`BlockBand hue`, `LinkCallout`, `BrandGlyph`, the `FixtureSheet` fields, `SelectRow` with a leading mark** — DAY-7.
- **The `Select` primitive on screen 2** — DAY-2 (the primitive exists; nothing changes in `@syn/ui`).
- **`Stepper17`'s own cells** — untouched by rule.

## Depends on

- **No slice dependencies.** RUN-7 (Epic 5) is Complete and consumed.

## Recommended execution

**Opus.** Six amendments to composites every screen composes, where a small drift (a second selected colour, a stepper that snaps once) is copied by every later ticket; a cheaper model patches the symptom on one composite and leaves the grammar split.

---

### Kickoff (paste into the session)

> Build **DAY-1 — The fix batch, the composites** (attached spec). Model: **Opus**. **One selection grammar; steppers by one that never snap before blur; the ink fill is the primary's and the `Stepper17` cell's, nowhere else; every state a story in both themes.**
> Attach/read first, in order: this spec · v1.3 R56–R60, R62, R63, §4 frame rules, §10.2, §10.4 · `packages/ui/AGENTS.md` · root `AGENTS.md` · `docs/ai-guides/component-guidelines.md`, `brand-tokens.md`, `classnames.md` · RUN-7 (Epic 5 — the composites this amends; reuse, don't fork) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · Epic 5's `TECHNICAL-DECISIONS.md` (TD-18, TD-22).
> Amend at the pattern; touch no screen. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands, then `yarn workspace @syn/ui run build-storybook --quiet`.
