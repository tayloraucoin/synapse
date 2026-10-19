---
target: specs/web/ux/day/running/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — daily use"]
  rows:
    - "USE — daily use · Row label · Running and Done"
  locked: 2026-10-10
---

# Running, and Done with time taken — day

Handoff pass, the ledger of the boards. Sources: N4 "Running" and "Done, with time taken"; notes 51, 61 to 63, 74; round 11; amendment 5; D-USE-13, 27, 29, 38, 39, 72. The row "Row label · Running and Done" (p-3-0, y 13980, notes y 14910; coverage [`../../boards/use-daily-use/running-and-done.md`](../../boards/use-daily-use/running-and-done.md)). Folds the intent pass's flat `day/running.md`, deleted once folded (thread 3). Words, access, instrumentation, criteria and the decisions: [`words-and-access.md`](words-and-access.md). Timer rules: [`../../dev-notes/timers-through-the-day.md`](../../dev-notes/timers-through-the-day.md), [`../../dev-notes/several-running.md`](../../dev-notes/several-running.md); colour bands: [`../../dev-notes/over-by-how-much.md`](../../dev-notes/over-by-how-much.md).

## Job

Time the current item against its planned length without ever becoming an alarm: count down, then "n min over", the word always beside its colour (N4; colour by D-USE-29 and D-USE-72, bending note 62's "plain ink"). After a Done with no timer, record the planned length and offer "Change" once, quietly; ignoring it is the default (note 63; D-USE-13 replaces "nothing is recorded"). The data matters later (note 74), never at the cost of a check.

## Entry and exit

- **Entry:** Start on Now's lifted card (`../now/index.md`, cited). "Took 2 min · Change" follows a Done with no timer (D-USE-13; replaces N4's chips).
- **Exit:** Done checks the item, records the time and Now lifts the next. Starting another item no longer pauses this one: several run at once (D-USE-27, superseding the flat file's exit line). For work items, one is in hand at a time ([`../../interactions/start-while-one-runs.md`](../../interactions/start-while-one-runs.md), D-USE-43, D-USE-57).

## Layout, top to bottom (phone 402)

Now's frame is cited, not carried (`../now/index.md`). The running card replaces the lifted card in place:

1. Header: the item's icon tile, the verdigris dot and the name; the meta line "Started 7:14" (paused: "Paused · started 7:14").
2. `TimerDisplay` [PROPOSED countdown mode] in `figure`, counting down; "of 10 min" beside it on the baseline, muted (N4 put it under; the board stands). `aria-live="off"`.
3. Pause (outline; Resume when paused) and Done (ink), side by side.

After a plain Done the checked row's trailing text reads "Took 2 min · Change" (Change underlined); Change opens a bottom sheet with a `MinutesStepper` and Save. N4's `QuickChipRow` ("Time taken", "As planned", "Other…") is superseded by D-USE-13.

## Primary action

Done.

## States

| State                 | File                                                                 | Widths | One line                                                     |
| --------------------- | -------------------------------------------------------------------- | ------ | ------------------------------------------------------------ |
| counting down         | [`states/counting-down.md`](states/counting-down.md)                 | 402    | "7:42" and "of 10 min"; Pause and Done                       |
| over, warning band    | [`states/over-under-a-minute.md`](states/over-under-a-minute.md)     | 402    | "0:40 over" in `warning-text`                                |
| over, danger band     | [`states/over-a-minute-or-more.md`](states/over-a-minute-or-more.md) | 402    | "3 min over" in `destructive-text`                           |
| paused, pulsing       | [`states/paused.md`](states/paused.md)                               | 402    | "4:10" held and pulsing; Resume                              |
| took 2 min, Change    | [`states/took-change.md`](states/took-change.md)                     | 402    | A plain Done records the plan; Change for a few seconds      |
| time-taken sheet      | [`states/time-taken-sheet.md`](states/time-taken-sheet.md)           | 402    | The `MinutesStepper` at the plan, and Save                   |
| after a timed Done    | [`states/timed-done.md`](states/timed-done.md)                       | 402    | "12 min" in figure weight, no Change; the next lifts         |
| timed, a little over  | [`states/timed-over-warning.md`](states/timed-over-warning.md)       | 402    | "12 min of 10" in warning                                    |
| several running       | [`states/several-running.md`](states/several-running.md)             | 402    | The card and Running rows, each with ring, count, Pause, box |
| a row lifted          | [`states/running-row-focused.md`](states/running-row-focused.md)     | 402    | A tapped row becomes the card; the card drops to a row       |
| Done on a Running row | [`states/done-on-a-running-row.md`](states/done-on-a-running-row.md) | 402    | "Done · 34 min" a moment, then it leaves Running             |
| Done, well over       | [`states/done-well-over.md`](states/done-well-over.md)               | 402    | "Done · 41 min of 30" in danger                              |

### Not screens of their own

- **Another started** (flat file `switched`): superseded by D-USE-27; nothing pauses and no "Meditate paused" `Toaster`. Several running: [`states/several-running.md`](states/several-running.md) and the three after it (drawn on the work block's row, y 17760 and 19020; the Running rows of non-work blocks, since inside a Work block one item is in hand and the rest fire in place, D-USE-43, D-USE-44, D-USE-49). Rules: [`../../dev-notes/several-running.md`](../../dev-notes/several-running.md).
- **Left running all day** (`boundary`): at the day's close every timer stops at the boundary; the item is left for the morning, not missed. A note, not a screen ([dev note](../../dev-notes/timers-through-the-day.md)).
- **Offline:** counts are time-based, so they run; Start, Pause and Done queue like any check (Decided (D-USE-72)). Now's offline StatusLine: `../now/states/offline.md`, cited.
- **Empty, loading, error, partial:** N/A, a state of a card already on screen; a failed check is Now's `../now/states/error-on-check.md`, cited.

## Platforms

Phone 402 only. At 1024 and 1440 Running and Done have no frame of their own and scale up from these (D-USE-39); Done's sheet is `ResponsiveSheet`'s right panel. At the desk and on phone Today a work item runs on the work clock (WORK TIME, firing, Step away; D-USE-42 to 49, D-USE-57, D-USE-65): `../../work/today/states/running.md`, `over-the-range.md`, `paused.md`, `stepped-away.md`, [`../../interactions/firing.md`](../../interactions/firing.md), [`../../interactions/step-away.md`](../../interactions/step-away.md), cited. Open-1's "Running on desktop … waits for the desktop pass" is answered by these. Dark comes at lock (D-USE-39).

## Interactions opened here

None of its own; the time-taken sheet is this surface's. Start while one runs: [`../../interactions/start-while-one-runs.md`](../../interactions/start-while-one-runs.md). Timers across devices: [`../../dev-notes/timers-across-devices.md`](../../dev-notes/timers-across-devices.md).
