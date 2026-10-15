---
target: specs/web/ux/set-my-days/new-block-sheet/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — set up"]
  rows: ["USE — set up · Row label · New block sheet"]
  locked: 2026-10-10
---

# New block sheet — set-my-days

Sources: N2 "New block sheet", notes 57–59, 84–87, 92, rounds 3 and 5, refinements 5, 8, 10; step 9 round 3, the Life and To-dos rounds 1 to 5 and step 10 round 1 (D-USE-34); the row "Row label · New block sheet" (p-4-0, y 5040; coverage `../../boards/use-set-up/new-block-sheet.md`). The intent-pass flat file is folded in here. Words, access, instrumentation and criteria: [`words-and-access.md`](words-and-access.md).

## Job

Add a block or a transition at a time, then go straight to filling it (note 87). Done is the block in the column with its Block view open, ready for items.

## Entry and exit

- **Entry:** the + menu's **Block** or **Transition** (`../set-my-days/states/plus-menu.md`), at the first free time after the last block (round 3); a **tapped empty time** on the rail, at that time, as New block (`../set-my-days/states/tap-a-time.md`; [`states/from-a-tapped-time.md`](states/from-a-tapped-time.md)); an **empty day**'s "or tap a time, or +" (`../set-my-days/states/empty-day.md`; [`states/wellness.md`](states/wellness.md)); Review the day's add sheet, "Block" (`../../interactions/add-from-the-rail/states/add-sheet.md`). Route `?sheet=new-block` (`../overview.md`).
- **Exit:** "Add block" closes the sheet into the new block's Block view (`../../day/block-view/states/empty.md`: "Nothing in Wellness yet.", the add row focused). A Work block opens on its tiers, a To-dos block on its pool, a checklist in the All day strip (each state says which). "Add transition" closes to the column, the transition in place. × or a drag down on the grabber closes with nothing added.

## Layout, top to bottom (phone 402)

A `ResponsiveSheet` on the dimmed day; rows holding a control are `--spacing-row` (56 px) tall, so a 36 px control clears the dividers by 10 px (D-USE-34).

1. **Header:** the grabber; × top left; a scope line (caption, muted) over the title: "Usual Monday · every week", "Mon 12 · this date only", "Every Thursday", "Usual Monday · inside Training". Title "New block" or "New transition" (N2's Block or Transition `SegmentedControl` is not drawn: the + menu picks, the title says which).
2. **Kind** (blocks only): a `ChipPicker` of seven, each with its colour dot: Wellness, Training, Work, Life, To-dos on the first line and a half, Break, Evening. Life is yellow (D-USE-38, D-USE-79), To-dos moss. The picked chip takes its kind's soft fill and edge.
3. **Name:** an `EmojiSlotButton` (the icon picker) beside the name `Input`. Picking a kind fills the name with the kind's until typed over.
4. **Starts** (`TimeField`), then **Ends** (`TimeField`) with the length beside it, muted ("20 min", "3 h"): Ends replaces N2's Length (D-USE-34).
5. **Repeats** (blocks only): a `Select`, Google Calendar's presets (D-USE-80; [`states/repeats-menu.md`](states/repeats-menu.md)).
6. **Colour:** the kind's swatch with its name, "Clay, Training's colour"; a transition "Takes Training's colour".
7. **By kind:** "Checklist, no times" with what off or on means (Wellness, Training; [ASSUMPTION: Life and Evening too, not drawn]); "How work fills it" (Work); the fill line (To-dos); "Meal" (Break, and transitions).
8. **The consequence line** (caption, muted): where it goes and what opens next, or the clash, invalid or error line.
9. **The primary** `Button`, ink, full width, sticky above the safe area.

## Primary action

"Add block" or "Add transition". It reads "Name needed", faded, with no name. At the desk it sits at the foot of the right panel [ASSUMPTION: as the sheet's own foot].

## States

| State               | File                                                           | Widths drawn | One line                                      |
| ------------------- | -------------------------------------------------------------- | ------------ | --------------------------------------------- |
| Wellness, empty day | [`states/wellness.md`](states/wellness.md)                     | 402          | Kind first; 7:05 after Orient, 1 h            |
| from a tapped time  | [`states/from-a-tapped-time.md`](states/from-a-tapped-time.md) | 402          | Stretch, 17:00 to 17:20, every Monday         |
| Work                | [`states/work.md`](states/work.md)                             | 402          | How work fills it                             |
| To-dos kind         | [`states/todos-kind.md`](states/todos-kind.md)                 | 402          | Seven kinds, Ends, Repeats; fills from To-dos |
| checklist           | [`states/checklist.md`](states/checklist.md)                   | 402          | Starts and Ends step aside                    |
| transition          | [`states/transition.md`](states/transition.md)                 | 402          | No kind, no Repeats; goes inside its block    |
| meal                | [`states/meal.md`](states/meal.md)                             | 402          | Break with Meal on; Watching while eating     |
| Repeats menu        | [`states/repeats-menu.md`](states/repeats-menu.md)             | 402          | Google's presets (D-USE-80)                   |
| custom recurrence   | [`states/custom-recurrence.md`](states/custom-recurrence.md)   | 402          | Every N, on weekdays, ends                    |
| clash               | [`states/clash.md`](states/clash.md)                           | 402          | "Overlaps Work, 9:30 to 12:00."; Add live     |
| invalid             | [`states/invalid.md`](states/invalid.md)                       | 402          | "Name needed" on faded ink                    |
| error               | [`states/error.md`](states/error.md)                           | 402          | "Not added. Try again."; offline              |

Empty, loading and partial do not apply: a new form with nothing to load.

As built (USE-46): each state is `?state=new-block-<state>&sheet=new-block` (the state files' `state=<state>` collides with other surfaces' names), on `/dev/parts` until Set my days (USE-39) hosts it. The sheet opens on `?sheet=new-block&week=&day=` with `&at=HH:MM` for a tapped time and `&mode=transition` for the + menu's Transition (`newBlockSheetRoute`). Until Block view lands (USE-48), Add closes to the column. Custom… is listed and waits for USE-47. Meal's topic chips are kept for the open sheet only: no column holds which topics a meal offers.

## Platforms

Phone 402 for every state. Wider, the sheet scales up as `ResponsiveSheet`'s right panel at `--sheet-w` (D-USE-39), beside Set my days' list-detail from 1024 (D-USE-83); no wide frame of its own.

## Interactions opened here

- The icon tile: the icon picker, `../../interactions/icon-picker/index.md`.
- Meal's Edit topics: the Meal topics sheet, `../../interactions/meal-topics.md` (D-USE-28).
- Repeats › Custom…: [`states/custom-recurrence.md`](states/custom-recurrence.md), also opened from the To-do sheet's Repeats (`../../day/todo-sheet/states/repeats-open.md`).

## Decisions and open items

D-USE-4, 24, 28, 33, 34, 38, 39, 79, 80, 82, 83 rule this surface; each state names its own. A transition dropped inside a block's span belongs to it, asking nothing (round 5). Physio is a Training block (D-USE-4). A stretch break is a small Training block, a walk a small Wellness block, and a Break can be left empty, as a true break (refinement 8; `../../day/block-view/states/true-break.md`). Editing a repeating block later asks This one, This and following, or All, extending D-USE-24's scoped ··· menu ([`states/custom-recurrence.md`](states/custom-recurrence.md)).
