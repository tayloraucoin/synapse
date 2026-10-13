---
target: specs/web/ux/interactions/index.md
status: approved
promoted:
boards: []
dev_note: ""
rulings: []
---

# Interactions

The flows that cross surfaces and the overlays opened from more than one, each carried once here and cited from the surfaces that open them (`docs/workflows/stages/ux.md` §4, rule 3). A flow with drawn steps of its own is a directory (`<flow>/index.md` plus `states/`); a flow with one drawn frame or none is one file, its capture in `captures/`. This index carries no artboard; the coverage of every artboard is in [`../boards/`](../boards/use-daily-use/step-0.md).

## The day

| Flow                                            | What it is                                                                                            | Opened from                                                                                        |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [The first-wake loop](first-wake-loop.md)       | The critical path from the alarm to the first block, one thumb, one primary act per screen (N1)       | Its steps are Orient, Review the day, Ready go and Now                                             |
| [The Ready, go hand-off](ready-go/index.md)     | The focused welcome between Review the day and Now, one button that starts the first block (D-USE-71) | Review the day                                                                                     |
| [A later start](later-start/index.md)           | Orient opened well past plan: cut some, or slide the day back [PROPOSED, drawn]                       | Over Review the day, once, when the wake is well past plan; the "Planned before <wake>" row        |
| [Add from the rail](add-from-the-rail/index.md) | The one + in the rail gutter, tapped or dragged, then the add sheet                                   | Review the day's rail + and empty time; a Work block's "Add to Primary" or "Add to Secondary"      |
| [Make room](make-room/index.md)                 | Adding with no room: finding the minutes and what to take them from (D-USE-11, D-USE-66)              | The add sheet's Add on a full block; Block complete's Do now past the block's end                  |
| [Copy from](copy-from/index.md)                 | One day takes the blocks of another built day, with Undo, or Replace first                            | Set my days' day menu and copy offer; Review the day's "Copy another day"                          |
| [Move to and Pick a day](move-to/index.md)      | One item off its place today: later today, another day, a picked day, back to the pool                | The Item sheet's ···, Block complete's "Move to later", the work menu on Now and the phone's Today |
| [Icon picker](icon-picker/index.md)             | One picker for every `EmojiSlotButton`: Emoji and Icon tabs, the colour row                           | The Item sheet, the add sheet's emoji slot, the To-do sheet, the New block sheet                   |
| [The Meal topics sheet](meal-topics.md)         | The saved topics list, opened from four surfaces                                                      | Now's meal card, the avatar menu, a meal block's editor and the New block sheet's Meal             |

## Work

| Flow                                                | What it is                                                                                                                                                     | Opened from                                                                                                |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [+ Add](add/index.md)                               | The four choices at both widths: Task to a tier, From the pool, To-do, Event; New task; save to the pool (D-USE-42, D-USE-54, D-USE-57)                        | Today, Now's header on the phone, a tier's add row, This week                                              |
| [Add an event (desk)](add-event.md)                 | The event popover that names where it lands and what moves (D-USE-42)                                                                                          | + Add › Event at the desk                                                                                  |
| [Place from the pool](place-from-the-pool/index.md) | Pool work onto a day's tier: drag and "+ Add to <tier>" at the desk; the pool sheet, Place, Placed with Undo and doesn't fit on the phone (D-USE-41, D-USE-54) | The Week, Today's nothing-planned, the Block panel, This week's Pool                                       |
| [Spread across the week](spread/index.md)           | A task bigger than a block as sessions on several days in one step, previewed first (D-USE-42)                                                                 | The pool, the Item sheet's ···, Place's doesn't fit                                                        |
| [Sessions, and "this session or all"](sessions.md)  | One item placed on several days; Done for today; a change to one session asks This session or All sessions (D-USE-40, D-USE-57)                                | Today, the Item sheet, the Week                                                                            |
| [Firing and bringing back](firing.md)               | A work item waiting on AI, set by hand, many at once, never written to Linear (D-USE-43)                                                                       | Today at both widths, Now                                                                                  |
| [Start while one runs](start-while-one-runs.md)     | Starting another item asks where the running one goes (D-USE-43)                                                                                               | Start on Today's Next card or a row, the work menu, the Item sheet                                         |
| [Step away and Resume all](step-away.md)            | One press holds every running work timer; firing keeps counting (D-USE-44, D-USE-52)                                                                           | Today's header at the desk, the work block's header on the phone                                           |
| [Linear status changes](linear-status/index.md)     | The status chip, the status box and the status sheet wherever a linked item shows                                                                              | The Item sheet's Linear line, the status box on Now and the phone's Today rows, checking a linked item off |

The dev notes that explain the canvas and have no flow of their own are in [`../dev-notes/`](../dev-notes/how-we-got-here.md).
