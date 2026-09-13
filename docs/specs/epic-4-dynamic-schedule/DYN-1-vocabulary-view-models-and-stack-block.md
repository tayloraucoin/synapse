# DYN-1 — Vocabulary, view models, constants, and `stackBlock`: the block model's types and its one arithmetic

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 0** · Size: M
**Slice type:** Contract / pure logic — no UI, no schema, no procedure. The risk class is *a second arithmetic*: if `stackBlock` is not general enough (pins, backward flow, alternates, multitask) a later ticket writes its own walk and two screens disagree about when breakfast starts.
**Vigil:** none. **Mason review:** `stackBlock`'s probes (AC 6–12) — the edge cases *are* the ticket.

**Status:** Not started

> **Mason — arithmetic review.** One function will be called by the block editor's footer, the quick-pick's budget line, the first-run fit screen, Adjust's proposal, and the materialiser (v1.1 §11.11, TD-4). Review that it is pure (rows, minutes, a flow direction — no `Date`, no zone, no I/O), that a pin never moves, that backward flow ends exactly at the anchor, that overrun is reported rather than clamped, and that alternates contribute exactly one member's duration. Each probe in AC 6–12 is a case a later ticket would otherwise discover in production.

---

## Outcome

Every package above `@syn/db` can spell the block model: `BlockKind`, `BlockFlow`, `BlockStructure`, `SlotRole`, `DayShape`, `TrainingPlacement`, `AnchorDirection`, `OverflowMode`, `WorkDayMode`, `ScheduleShape`, `DayBlockState`, `ShiftKind`, the new `ItemType` and `ItemOrigin` and `CompletionState` members, the three new `NotificationKind`s, and the new `ItemState`s — spelled once in `@syn/types` and checked into the database enums by DYN-2 and DYN-3. The view models a component will receive (`DayBlockView`, `FixtureView`, the widened `DayItemView`, `SlotView`, `TemplateSummaryView`, `HabitSummaryView`, `QuickPickView`, `JournalEntryView`) exist with every field named. The runtime values the model needs (`BLOCK_KINDS`, `DEFAULT_BLOCK_ORDER`, `DEFAULT_JOURNAL_PROMPTS`, `STARTER_LIBRARY` by block, the new bounds) live in `@syn/constants`. And `stackBlock`, `computeBudget`, and `fitToBudget` in `@syn/utils/day/` walk a block in either direction, report slack and overrun, and shorten-then-cut to a budget — verified by probes, not by a screen. After this ships, **DYN-2's migration has types to check its enums against and DYN-4's services have an arithmetic to call.** No table changes here (DYN-2, DYN-3); no procedure (DYN-4); no component (DYN-7).

## Why / intent

- **v1.1 §1.4** — the vocabulary; every union below spells one of its rows. **§3.1** — the eight block kinds and their natural anchors. **§3.2** — stacking, gaps, pins: "each item's start is the previous item's end plus a gap; nothing inside a block has an absolute time unless it is pinned; the stack flows around a pin; if the items before the pin overrun it, they are shown overrunning; the pin never moves." **§3.3** — forward from wake, backward to the work anchor, the budget arithmetic (`120 − 3 − 45 = 72`), slack landing before the anchor. **§3.5** — an alternates group contributes its default member's duration. **§3.10** — the overflow modes. **§11.11** — "the walk itself is a pure function in `@syn/utils` … the block editor's footer, the quick-pick's budget line, the fit screen, the Adjust proposal and the materialiser all call the one function."
- **v1.1 R4 (L2)** — "shortening stops at each item's range floor; if it still doesn't fit, the lowest-priority items are cut." `fitToBudget` is that rule as code.
- **v1.1 §9.1** — the three new notification kinds (`block_start`, `fixture_start`, `devices_off`); **§10.1** — the new item states.
- **v1.1 §12.4** — the per-block starter libraries, verbatim, as data (the same exception `STARTER_HABITS` documents: titles are candidate rows the person confirms, not copy).
- **TD-3** — a workout is `item_type = workout`; a focus is `deep_work`. **TD-4** — offsets derived by `stackBlock`. **TD-6** — `ShiftKind`.
- **Ground truth:** `packages/types/src/domain/{domain,ui-state,view}.ts` (handoff §3.5, extended, never re-spelled); `packages/constants/src/{limits,starter-habits,notification-catalogue}.ts`; `packages/utils/src/day/` (`priority.ts`'s `compareForTrim` is reused for cut order; `wall-clock.ts` is *not* touched — `stackBlock` works in minutes from day start and the materialiser converts).
- **What this slice is NOT (binding):** it does not add a column, a migration, a procedure, a validator, or a component. It does not remove `STARTER_HABITS`, `DayPart`, `computeShiftFit`, or `computeTrim` (DYN-21). It does not decide placement of any screen.

**Rulings this slice makes (labelled, logged):**

- **`stackBlock` works in minutes from the day's start, not instants.** The materialiser converts with USE-1's `wallClockToInstant`; the editor and the pick never need a zone. One function, no `Date` in its signature. Logged.
- **Backward flow is computed as a forward walk over the reversed list from the anchor minus the total, then re-reversed** — so a pin inside a backward block behaves identically to a pin inside a forward one (the stack flows around it in either direction). Logged.
- **Overrun is a number, never a clamp.** `stackBlock` returns `overrunMin` (how far the last item ends past `bound`) and never shortens anything; shortening is `fitToBudget`'s job and only when asked. Logged.
- **An alternates group is passed with `alternatesChosen` on exactly one member**; unresolved groups (the template case) pass the default. The function throws on two chosen or none — a caller bug, not a state. Logged.
- **Multitask members occupy one position**: the group's duration is its longest member; the others contribute zero to the walk. Logged.
- **`STARTER_LIBRARY` replaces the shape, not the file, of `STARTER_HABITS`** — a new export in a new file, keyed by `BlockKind`, with `recommended: boolean` per row; the old export stays untouched until DYN-21. Logged.

## Behavior & states

**No surface.** Described by the exports and the probes.

### `@syn/types` — `packages/types/src/domain/domain.ts` (schema spelling, snake_case)

```ts
export type BlockKind = "orient" | "morning" | "training" | "prep" | "work" | "break" | "activity" | "wind_down";
export type BlockFlow = "forward" | "backward";
export type BlockStructure = "stack" | "opener_pool_closer";
export type SlotRole = "stack" | "opener" | "pool" | "closer";
export type DayShape = "structured" | "unstructured";
export type DayBlockState = "planned" | "pooled" | "set" | "not_today";
export type TrainingPlacement = "before_morning" | "after_morning" | "inside_work" | "after_work" | "in_break";
export type AnchorDirection = "work_waits" | "routine_cut" | "depends";
export type OverflowMode = "daily_menu" | "variants" | "auto_trim";
export type WorkDayMode = "always" | "sometimes" | "never";
export type ScheduleShape = "own_structure_dynamic" | "consistent_shifts" | "varying_shifts" | "fluid";
export type ShiftKind = "shift" | "refit";
export type ItemType = "habit" | "task_appointment" | "deep_work" | "workout";          // + workout (TD-3)
export type ItemOrigin = "template" | "one_off" | "carried" | "calendar_import" | "fixture"; // + fixture (TD-8)
export type CompletionState = "upcoming" | "active" | "done" | "missed" | "carried" | "pending_review" | "not_confirmed"; // + not_confirmed (R16)
export type WokeAtSource = "anchor" | "manual" | "orient";                                // + orient (R11)
export type NotificationKind = /* the nine */ | "block_start" | "fixture_start" | "devices_off"; // §9.1
export type JournalPrompt = { key: string; label: string };
export type WorkDays = Record<"0" | "1" | "2" | "3" | "4" | "5" | "6", WorkDayMode>;
```

### `@syn/types` — `ui-state.ts` (kebab-case)

`ItemState` gains `"not-confirmed"` (§10.1 row *Not confirmed*), `"confirm-later"` (row *Confirm in the morning*), `"moved"` (row *Moved (re-plan)* — an upcoming item whose `scheduledStart !== originalScheduledStart`; `done-off-schedule` still covers the done case). `StateWordKind` gains `"confirm-later"`, `"opener"`, `"closer"`, `"pinned"`. New: `AdjustStep = 1 | 2 | 3 | 4`; `AdjustEntry = "late-offer" | "header" | "one-off" | "band-drag"`; `DragState = "idle" | "lifted" | "dropping" | "refused" | "confirming"`; `QuickPickSectionKind = "last-night" | "shape" | "routine" | "prep" | "training" | "work" | "fixtures"`; `BudgetState = "under" | "exact" | "over"`; `StatusLineVariant` gains `"late-wake-offer"`.

### `@syn/types` — `view.ts`

- `DayItemView` + `dayBlockId: string | null` · `pinned: boolean` · `gapBeforeMin: number` · `alternates: { id: string; chosen: boolean; otherTitle: string; otherDurationMin: number } | null` · `blockKind: BlockKind | null`.
- `SlotView` + `gapBeforeMin: number` · `pinnedClock: string | null` · `role: SlotRole` · `alternates: { group: string; isDefault: boolean; otherTitle: string; otherDurationMin: number } | null`. `startClock` stays (derived by the caller through `stackBlock`).
- `TemplateSummaryView` + `kind: BlockKind` · `flow: BlockFlow` · `structure: BlockStructure`.
- `HabitSummaryView` + `blockKind: BlockKind | null` · `weeklyTarget: number | null` · `typicalDays: ReadonlyArray<0|1|2|3|4|5|6> | null`. `isWakeAnchor` stays until DYN-21.
- New `DayBlockView { id; kind; name: string | null; templateId: string | null; state: DayBlockState; startLabel: string | null; endLabel: string | null; startMin: number | null; endMin: number | null; placement: TrainingPlacement | null; items: DayItemView[]; split: boolean }`.
- New `FixtureView { id; title; weekdays: ReadonlyArray<0|1|2|3|4|5|6>; atClock: string; durationMin: number; blockKind: BlockKind; scheduling: Scheduling; habitId: string | null }`.
- New `QuickPickView` — the sections the pick renders (§5.3): `{ date; lastNight: DayItemView[]; shape: { asked: boolean; default: DayShape } | null; routine: { mode: OverflowMode; menu?: { items: (HabitSummaryView & { durationMin: number; ticked: boolean })[]; availableMin: number }; variants?: (TemplateSummaryView & { remaining: number })[]; assignedId: string | null } | null; prep: { alternates: { groupId; members: { itemId; title; durationMin; isDefault }[]; chosen: string }[] } | null; training: { todays: HabitSummaryView | null; swaps: (HabitSummaryView & { remaining: number; tradesWithDay: string | null })[]; placements: TrainingPlacement[]; lastPlacement: TrainingPlacement | null } | null; work: { focuses: (HabitSummaryView & { remaining: number })[]; assignedId: string | null; askAnchor: boolean } | null; fixtures: DayItemView[]; anchor: { clock: string; isHard: boolean } | null }`.
- New `JournalEntryView { date; answers: Record<string, string>; prompts: JournalPrompt[] }`.

### `@syn/constants`

- `block-kinds.ts`: `BLOCK_KINDS` (the eight, in v1.1 §3.1 order, `as const`) · `DEFAULT_BLOCK_ORDER` (same, minus `training` and `break`, which are placed per day) · `TRAINING_PLACEMENTS` · `PLACEABLE_KINDS = ["training", "break"]`.
- `journal-prompts.ts`: `DEFAULT_JOURNAL_PROMPTS` — six `{ key, label }` rows in §7.2's order with stable keys `day_went · gratitude_today · gratitude_life · looking_forward · make_happen_tomorrow · visualisation`; the labels are v1.1 §7.2's prompts verbatim (data, per the starter-set exception, since the person edits them into their own).
- `starter-library.ts`: `STARTER_LIBRARY: Record<BlockKind, ReadonlyArray<StarterLibraryEntry>>` with `{ title, rangeMin, rangeMax, importance, recommended }` — v1.1 §12.4 verbatim; `orient`, `training`, `work`, `activity` are empty arrays (activity suggests nothing by rule).
- `limits.ts` additions: `GAP_MAX = 240` · `ORIENT_PASSAGE_MAX = 2000` · `INTENTION_MAX = 140` · `MORNING_GRATITUDE_MAX = 280` · `JOURNAL_ANSWER_MAX = 2000` · `JOURNAL_PROMPT_MAX = 60` · `JOURNAL_PROMPTS_MAX = 10` · `FIXTURE_TITLE_MAX = 60` · `FOCUS_TITLE_MAX = 40` · `WORKOUT_TITLE_MAX = 40` · `SKIP_LINE_WINDOW_DAYS = 7` · `LATE_WAKE_OFFER_MIN = 30` · `DRAG_SNAP_MIN = 5` · `LONG_PRESS_MS = 300` · `ADJUST_UNDO_WINDOW_MS = SHIFT_UNDO_WINDOW_MS` (re-exported alias, not a second value).
- `notification-catalogue.ts`: three rows appended — `{ n: 10, kind: "block_start", defaultEnabled: true, phase: 1 }`, `{ n: 11, kind: "fixture_start", defaultEnabled: true, phase: 1 }`, `{ n: 12, kind: "devices_off", defaultEnabled: false, phase: 1 }`; `item_start`'s `defaultEnabled` flips to `false` (R19). The `n` values are citation numbers for v1.1 §9.1's rows N1a–N1d and are documented as such.

### `@syn/utils` — `packages/utils/src/day/stack.ts`

```ts
export type StackItem = {
  id: string;
  durationMin: number;
  gapBeforeMin: number;
  pinnedAtMin: number | null;        // minutes from day start; a pin
  scheduling: "hard" | "soft";
  priority: number;                  // resolved 1–7
  multitaskId?: string | null;
  alternatesId?: string | null;
  alternatesChosen?: boolean;        // exactly one member true per group
};
export type StackInput = {
  items: ReadonlyArray<StackItem>;   // in sort order
  flow: "forward" | "backward";
  anchorMin: number;                 // forward: the start; backward: the end
  bound?: number | null;             // forward: the next hard thing after the block; backward: the earliest allowed start
};
export type PlacedItem = { id: string; startMin: number; endMin: number; pinned: boolean };
export type StackResult = {
  placed: PlacedItem[];
  totalMin: number;                  // sum of counted durations + gaps
  startMin: number; endMin: number;  // the block's span
  slackMin: number;                  // distance from the block's far edge to `bound`, ≥ 0
  overrunMin: number;                // how far the block passes `bound`, ≥ 0 (never both non-zero)
  overrunPinIds: string[];           // pins that the preceding stack runs past
};
export function stackBlock(input: StackInput): StackResult;
```

Rules: items walk in order; each start is the previous end plus its gap; a pinned item's start is `pinnedAtMin` regardless, and the next unpinned item starts at the pin's end; if the item before a pin ends after the pin's start, the pin is in `overrunPinIds` and the pin still does not move; multitask members share a start and the group's end is its longest member's end; an alternates group contributes only the member with `alternatesChosen`; backward flow lays the block so its last item ends at `anchorMin` (walk the reversed list forward from `anchorMin − total`, then map back), pins included.

`packages/utils/src/day/budget.ts`:

```ts
export function computeBudget(input: { wakeMin: number; workStartMin: number; orientMin: number; prepTotalMin: number }): { availableMin: number };
export type FitItem = StackItem & { durationMinMin: number | null; isAssigned: boolean };
export type FitResult = { keep: Array<{ id: string; durationMin: number; shortened: boolean }>; cut: string[]; totalMin: number; overMin: number };
export function fitToBudget(items: ReadonlyArray<FitItem>, availableMin: number, mode: "shorten_then_cut" | "cut_only"): FitResult;
```

`fitToBudget`: hard items are never shortened or cut; `shorten_then_cut` first sets every soft item to `max(durationMinMin ?? durationMin, …)` — the range floor — and, if still over, cuts soft items in `compareForTrim` order (ascending priority, then shorter first, then later start) until it fits; `cut_only` skips the shortening; `overMin` is what remains over when nothing soft is left (never negative). Deterministic; no randomness; no clock.

Both files export through `packages/utils/src/day/index.ts` and the package barrel.

**States (exhaustive):** not applicable — pure functions. **Failure / edge states:** two `alternatesChosen` in a group → throws `AppError("stack_alternates_invalid")`; a pin before the block's forward start → placed at the pin (the stack starts after it), `overrunPinIds` empty; a negative gap → validator's job, the function clamps to 0 and never throws; an empty list → `{ placed: [], totalMin: 0, startMin: anchorMin, endMin: anchorMin, slackMin: bound − anchor or 0, overrunMin: 0 }`.

## Non-negotiables (this slice)

- **Pure.** No `Date`, no zone, no I/O, no React in any new file under `@syn/utils` or `@syn/types`.
- **A pin never moves.** `stackBlock` may report a pin overrun; it may not relocate a pin.
- **Overrun is reported, never clamped.** `stackBlock` shortens nothing.
- **Range is a floor for `fitToBudget`, never a clamp elsewhere** (R21). No function here bounds a duration to a range except the shorten step, and only downward to the floor.
- **One spelling.** Every new union member is a string the database will store (DYN-2/3 check it with `enumValues<Union>()`); kebab-case only in `ui-state.ts`.
- **`STARTER_HABITS` is untouched.** Consumers switch in DYN-11; removal is DYN-21.

## Data & AI

**Schema changes: none.** Types and constants only; DYN-2 and DYN-3 carry the enums.

**Tables:** none.

**Placement:** `packages/types/src/domain/{domain,ui-state,view}.ts` (rule 2's sibling — handoff §3.5, extended in place); `packages/constants/src/{block-kinds,journal-prompts,starter-library,limits,notification-catalogue}.ts` and the barrel (rule 8); `packages/utils/src/day/{stack,budget}.ts` and `day/index.ts` + the barrel (rule 6). Mason's call, TD-4.

**tRPC / validators:** none in this slice. (DYN-4 writes the Zod against these unions.)

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — `yarn check-types` across the workspace; probes run as a throwaway script under `$TMPDIR`, output pasted into the closing report, then deleted)

1. Every union in *Behavior & states* exists in `@syn/types` with the exact members listed, and `enumValues<ItemType>()(["habit","task_appointment","deep_work"])` in `@syn/db` now **fails** the type-check with the `MISSING_ENUM_VALUE` sentinel naming `workout` — proving DYN-2 cannot forget it. State the failing file and line. *(Mason.)*
2. The widened `DayItemView`, `SlotView`, `TemplateSummaryView`, `HabitSummaryView` and the new `DayBlockView`, `FixtureView`, `QuickPickView`, `JournalEntryView` compile; every existing consumer of the widened views compiles because every added field is either optional in the mapper's eyes or supplied by the existing `to-view.ts` mappers with a neutral value (`dayBlockId: null`, `pinned: false`, `gapBeforeMin: 0`, `alternates: null`, `blockKind: null`, `kind: "morning"`, `flow: "forward"`, `structure: "stack"`, `weeklyTarget: null`, `typicalDays: null`). *(Mason.)*
3. `BLOCK_KINDS` has eight members in §3.1 order; `DEFAULT_BLOCK_ORDER` has six; `DEFAULT_JOURNAL_PROMPTS` has six with the stated keys; `STARTER_LIBRARY.morning` has ≥ 30 rows of which exactly 12 are `recommended`; `STARTER_LIBRARY.prep` has 10; `.break` 6; `.wind_down` 8 (two marked `placed: true` — *Journal*, *Phone away*); `.activity`, `.orient`, `.training`, `.work` are empty.
4. `NOTIFICATION_CATALOGUE` has twelve rows; `item_start.defaultEnabled === false`; `block_start` and `fixture_start` are `true`; `devices_off` is `false`.
5. `yarn lint`, `yarn lint:boundaries`, `yarn check-types` pass for `@syn/types`, `@syn/constants`, `@syn/utils` (`@syn/db` fails only on the sentinel from AC 1 until DYN-2 — state this plainly in the report).
6. **Probe — Taylor's morning, forward.** Items `[orient 3, breath 10, cold 5 (gap 5), stretch 15, read 20]`, `flow: forward`, `anchorMin: 420` (7:00), `bound: 495` (8:15 = prep start): `placed` starts are `420, 423, 438, 443, 458`; `endMin 478`; `slackMin 17`; `overrunMin 0`. *(Mason.)*
7. **Probe — prep, backward.** Items `[breakfast 30, walk 15]`, `flow: backward`, `anchorMin: 540` (9:00): breakfast `495–525`, walk `525–540`; `startMin 495`; with `bound: 478` → `slackMin 17`, `overrunMin 0`. *(Mason.)*
8. **Probe — a pin the stack flows around (R3).** Forward from 420: `[breath 10, cold 5, journal 15, call {pinnedAtMin: 480, 10}, stretch 15]`: breath `420–430`, cold `430–435`, journal `435–450`, call `480–490`, stretch `490–505`; `overrunPinIds` empty. Then make journal 40 min: journal `435–475`… call still `480–490`; make journal 50: journal `435–485`, call **still** `480–490`, `overrunPinIds: ["call"]`, stretch `490–505`. *(Mason.)*
9. **Probe — alternates.** `[breakfast-prepped 10 {alternatesId: "b", chosen: true}, breakfast-cook 30 {alternatesId: "b", chosen: false}, walk 15]` backward to 540: total 25, start 515. Swap `chosen`: total 45, start 495. Two `chosen: true` → throws `stack_alternates_invalid`. *(Mason.)*
10. **Probe — multitask.** `[a 10 {multitaskId: "m"}, b 25 {multitaskId: "m"}, c 5]` forward from 0: a `0–10`, b `0–25`, c `25–30`; `totalMin 30`. *(Mason.)*
11. **Probe — `fitToBudget`, R4.** Items (all soft, `durationMinMin` in parens): `meditate 20 (10) p6 · breath 10 (5) p5 · read 20 (15) p4 · stretch 15 (5) p3 · journal 10 (5) p5`, `availableMin: 72`, total 75. `shorten_then_cut` → shortens **only as far as needed**: the implementation may shorten lowest-priority first or proportionally — `[Dev's call; state which]` — but the result keeps all five, `totalMin ≤ 72`, no item below its floor, `cut: []`, `overMin: 0`. With `availableMin: 30` → every item at its floor sums to 40 > 30, so cuts begin ascending by priority: stretch (p3) cut → 35, read (p4) cut → 20 ≤ 30 → stop; `cut: ["stretch","read"]`, `overMin: 0`. With one hard item of 40 and `availableMin: 30`, `cut_only` → `overMin: 10`, `cut` = every soft item, the hard item kept. *(Mason.)*
12. **Probe — empty and edge.** `stackBlock({ items: [], flow: "forward", anchorMin: 420, bound: 495 })` → `slackMin 75`; a gap of `−5` is treated as `0`; a pin at `400` in a forward block from `420` → the pin at `400–410`, the first unpinned item at `420`. *(Mason.)*
13. `yarn build` passes for the three packages.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Implement backward flow by reversing, walking forward from `anchorMin − totalMin` with pins mapped as `anchorMin − (pinnedAtMin + duration)`, then mapping results back — the pin logic stays in one place.
- `compareForTrim` (`day/priority.ts`) already sorts ascending priority / shorter first / later start; reuse it for the cut order so Adjust and the pick agree with v1's trim.
- For AC 11's "how much to shorten", the cheapest deterministic rule is: shorten lowest-priority first, each to its floor, until it fits — it produces the same cut order the cut step would. Document the choice in the function's header comment and `TECHNICAL-DECISIONS.md`.
- Keep `StarterLibraryEntry` structurally compatible with `StarterHabit` minus `wakeAnchor`, so DYN-11's chooser can map without a shim.

## Dev's call

The shorten order inside `fitToBudget` (log it) · whether `QuickPickView` is one interface or a discriminated `QuickPickSection[]` (the handoff's style is one interface; either compiles) · file names inside `constants/` beyond the ones named.

## Out of scope

- **Columns and enums in the database** — DYN-2 (plan side), DYN-3 (day side).
- **Zod validators for any of these shapes** — DYN-4 (`block.ts`, `fixture.ts`, `journal.ts`, `confirm.ts`, `adjust.ts`, `habit-day.ts`).
- **`computeAdjust`, `doNow`'s slide, `moveItem`'s reflow** — DYN-6 builds them over `stackBlock`.
- **Removing `STARTER_HABITS`, `DayPart`, `computeShiftFit`, `computeTrim`** — DYN-21.
- **Any component or story** — DYN-7.

## Depends on

**No slice dependencies in this track.** Consumes SET-1 (`@syn/types` domain file, `enumValues`) and USE-1 (`@syn/utils/day/`) — both Complete in their tracks' `PROGRESS.md`.

## Recommended execution

**Opus.** The value is entirely in `stackBlock`'s generality — pins in both flows, alternates, multitask, overrun without clamping — and in the unions being exactly the strings three later migrations and every screen will spell. A cheaper model writes a forward-only walk that passes AC 6 and fails AC 8's second case silently; the pin moves, and the first time a Tuesday stand-up slides ten minutes the record is wrong in a way nobody sees until Review.

---

### Kickoff (paste into the session)

> Build **DYN-1 — Vocabulary, view models, constants, and `stackBlock`** (attached spec). Model: **Opus**. **Pure functions only; a pin never moves; overrun is reported, never clamped; one spelling per union; `STARTER_HABITS` untouched.**
> Attach/read first, in order: this spec · v1.1 §1.4, §3.1–§3.5, §3.10, §9.1, §10.1, §11.11, §12.4 · `docs/specs/epic-4-dynamic-schedule/README.md` § Non-negotiables and § Canonical paths · `docs/specs/README.md` § Placement rules 2, 6, 8 · root `AGENTS.md` · `packages/types/src/domain/*.ts` (extend in place) · `packages/constants/src/{limits,starter-habits,notification-catalogue}.ts` · `packages/utils/src/day/{priority,trim,shift-fit}.ts` (read for the sort order; do not modify) · `packages/db/src/schema/enum-values.ts` (to understand AC 1) · this track's `TECHNICAL-DECISIONS.md` TD-3, TD-4, TD-6 · `DEVIATIONS.md` (this track's, then Epic 2's).
> Run the twelve probes as a throwaway script under `$TMPDIR`, paste the outputs into the closing report, delete the script. Note the `@syn/db` sentinel failure from AC 1 as expected. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
