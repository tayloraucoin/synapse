---
target: specs/web/ux/set-my-days/overview.md
status: approved
promoted:
---

# set-my-days — overview

The area's frame in the ledger of the boards, from the approved narrative (N2; "note n" as in `../day/overview.md`) and the page "USE — set up" (p-4-0), rows y 0 to 6300; coverage in `../boards/use-set-up/`.

## Frame

The planner's week page, made editable (notes 68–69, 82–85): set once, edited now and then, with time to spend, so the screens can be roomy (N2). Two rhythms: the **usual week**, each weekday's default, Monday to Sunday separately, no named templates (notes 32–33), whose blocks persist every week while Work blocks keep their times, empty; and **this week**, the seven dated days filled from the usual week, where each week (often on Sunday) Taylor slots work by tier and adds the week's events (refinement 2, note 71). Blocks are set first, items go inside them (notes 85, 87). The day is set as the shape of real time, never answered as a questionnaire (note 88). Kinds: Wellness, Training, Work, Break, Evening, Life and To-dos (Life yellow, To-dos moss; D-USE-79).

## Routes and surfaces

| Route                                    | Surface file                 | Entry from                                                                              | Exit to                                          |
| ---------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `/days?week=usual\|this&day=` [PROPOSED] | `set-my-days/index.md`       | "Set my days" in the avatar menu; "Set Saturday" and "Open This week" on Review the day | "‹ Now" (the tab it came from); a day's "‹ Week" |
| `?sheet=new-block`                       | `new-block-sheet/index.md`   | An empty time on the rail; the + menu's Block                                           | The new block's Block view, editing              |
| `/days/block/{id}` [PROPOSED]            | `../day/block-view/index.md` | A block                                                                                 | Breadcrumb "‹ Monday › Wellness"                 |
| `?sheet=item&id=`                        | `../day/item-sheet/index.md` | An item in the Block view                                                               | Back to the Block view                           |

Copy from, Add From Linear, meal topics and the icon picker are flows in `../interactions/` (`copy-from/index.md`, `add/index.md`, `meal-topics.md`, `icon-picker/index.md`).

## Navigation and shell

A pushed screen with no tab bar on the phone: Set my days opens on the week (B) and a day pushes from it (A), with "‹ Week" back. One tap from every tab through the avatar menu, without taking a tab (note 76). From 1024 it is list-detail beside the rail, nothing current in the rail (D-USE-39 (3), D-USE-83); 768 to 1023 keep the push.

## Design

As `../day/overview.md`. Drawn in light at 402, one wide frame at 1024; dark comes with the build's theme pass (D-USE-58).

## Decision log

The full lines are in `../day/decisions/`; this area rests on these.

| ID           | Decision, for this area                                                                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D-USE-1      | This area holds Set my days and the New block sheet; it borrows the Block view and the item sheet from `day/`                                                                                                                                          |
| D-USE-20     | Four tiers, Urgent above Primary                                                                                                                                                                                                                       |
| D-USE-32, 33 | Step 9 round 4: Copy from with strips, Replace only when the day has blocks, out of bounds kept with a dashed edge; overlap, an event as its own block, tap a time, the usual change naming its reach, loading, error, offline, saved; "This day only" |
| D-USE-34     | Step 10: the New block sheet                                                                                                                                                                                                                           |
| D-USE-38, 79 | The colours; Life a ninth hue, yellow; Stretch slate                                                                                                                                                                                                   |
| D-USE-39, 83 | Set my days list-detail from `--breakpoint-split: 1024px`, the push below                                                                                                                                                                              |
| D-USE-49     | The lock: round 2's week (B) then the day (A); the Archive's A and B superseded                                                                                                                                                                        |
| D-USE-80     | Repeats is Google's presets, then Custom…                                                                                                                                                                                                              |
| D-USE-81     | A new item in an add row is 5 min                                                                                                                                                                                                                      |
| D-USE-82     | Offline: the day's own controls read-only; a block opened from it edits offline (D-USE-67)                                                                                                                                                             |

## Open

- Set my days opens on the week (B), then a day (A), bending N2's "today's weekday": settled by open-3 round 2, logged as D-USE-110 (3). A day with no work, like Saturday, is just fewer blocks: no empty Work block, no placeholder, no message (D-USE-110 (2)). Orient is plain text with no menu; "always first" is in its accessible name (D-USE-110 (1)). No block icons in the column, no half-hour hairlines (D-USE-109).
- "This week" is the default from Sunday evening onward [ASSUMPTION, from N2]; the 1024 note's "from Sunday evening the week's first day" follows it.
- A usual-week change reaches this week's days not yet started, except blocks already changed on that date; never a day already begun: drawn in `set-my-days/states/usual-change-reaches.md` and `day-own-change.md`.
