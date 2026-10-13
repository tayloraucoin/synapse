---
target: specs/web/ux/work/today/states/waiting.md
status: approved
promoted:
boards:
  - name: "now-work / tier colours, status boxes, waiting / 402 / light"
    page: "USE — daily use"
    at: [3374, 17760]
    note: "Frame @ x 3374, y 18690"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/waiting-402.png
rulings:
  [
    D-USE-35,
    D-USE-38,
    D-USE-40,
    D-USE-44,
    D-USE-45,
    D-USE-49,
    D-USE-51,
    D-USE-57,
    D-USE-77,
    D-USE-78,
  ]
---

# Today — Waiting (tier colours, status boxes)

Linked items whose Linear status is In review, Blocked or Paused leave their tiers for a Waiting group at the foot of the block: nothing to do until they move. The same frame draws the tier colour squares and the plum meeting band. `?state=waiting`.

## What shows, top to bottom

**Phone (402, 10:20), as drawn:** `AppHeader` "Now" with the avatar; the To-dos tray line ("To-dos Call the mechanic… ⌄"); the Work `BlockHeader` (sky bar, "Work", "9:30 to 12:00", ···). Then:

- **Primary**, a leaf square before the heading. The lifted card: the sky tile with 🔄, the now dot, "[Fix the sync retry]", meta "In progress · ENG-123 · Medium · 1–2 h", **Start** and **Done**. "[Review the Paper handoff]" (plain item, checkbox) "30 min".
- The meeting band: plum fill (`category-plum-chip`) with a 3 px plum edge, a glyph, "[Design sync]", "Meeting · 10:30 to 11:00", and "in 10 min" on the right (the step before it lifts: [meeting-coming-up](meeting-coming-up.md)).
- **Secondary**, an amber square. "[Answer the review comments]", its box a grey Todo ring, meta "Todo · ENG-131 · Small", "30–60 min". "[Address review on the sync PR]", a cyan Changes requested shape, "Changes requested · ENG-128 · Medium", "1–2 h".
- **Waiting · nothing to do until it moves** (no square). "[Offline queue PR]", indigo In review shape, title muted, "In review" right. "[Vendor API access]", red Blocked ring, title muted, "Blocked" right.
- `BottomNav` Now, Schedule, Review.

## What the person can do

- Tap a row: the Item sheet; its status chip changes the status ([linear-status](../../../interactions/linear-status/index.md)). A Waiting item returns to its tier when its status leaves In review, Blocked or Paused, here or in Linear [ASSUMPTION: at its old place].
- Everything else as [working](working.md).

## Words

"Waiting · nothing to do until it moves"; the status word on a Waiting row, as Linear names it.

## The notes on the boards

**now-work / tier colours, status boxes, waiting / 402 / light** (Frame @ x 3374, y 18690):

> tier colours, status boxes, waiting [PROPOSED]
>
> A Linear item's box is its status shape in Linear's colour; a plain item keeps its checkbox. Tier headings take a colour square. In review, Blocked and Paused leave the tiers for Waiting at the bottom: nothing to do until they move. The meeting band is plum.

## Rulings

- D-USE-78: the row's lead slot stays the firing ring; status changes on the Item sheet's chip; Waiting stands at both widths.
- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- Decided (D-USE-78): Waiting has no later D-line; kept as drawn. It stands at both, at the foot of the block under Stretch, before To-dos (the desk's open To-dos section, D-USE-40). Its rows are never Next (D-USE-45) and take no ring.
- Status boxes: the frame draws a linked row's box as its status shape. D-USE-44, D-USE-49 and D-USE-51 make every work row's lead slot the ring that fires it; the status shape and word move to the Item sheet (D-USE-35). Default as in [`../../../interactions/linear-status/index.md`](../../../interactions/linear-status/index.md) (Decided (D-USE-78): there). On a Waiting row the right column carries the status word, as drawn, in place of the length.
- Tier squares: the frame draws Primary leaf and Secondary amber. D-USE-38: Urgent red, Primary leaf, Secondary amber, Stretch slate (not sky) [PROPOSED until Taylor's look]; the word always beside it ([colours](../../../dev-notes/colours-for-a-new-thread.md)).
- Meta: the frame's "In progress · ENG-123 · Medium" and "Todo · ENG-131 · Small" become D-USE-51's phone meta (client tile, project emoji, ID, priority chip, size chip); the now dot gives way to the lifted card's shade (D-USE-49).
- Meeting band: plum (D-USE-38: an event is always a fill with the calendar icon; the frame's glyph becomes the calendar icon). Its behaviour: [meeting-coming-up](meeting-coming-up.md) and the [dev note](../../../dev-notes/meeting-inside-a-work-block.md).
- Blocked and Paused share Urgent's red (D-USE-38); a named bend of "nothing red on the tabs".

## Widths

Drawn at: 402. The desk (1024 and up): Decided (D-USE-78), the Waiting group under Stretch in the main column, before To-dos, rows as the desk's work rows.

## Criteria

| ID                    | When                                                        | Then                                                                                          | Evidence                   |
| --------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-today-waiting-1 | A linked item's status becomes In review, Blocked or Paused | It leaves its tier for Waiting at the block's foot, title muted, the status word on the right | `captures/waiting-402.png` |
| C-USE-today-waiting-2 | Its status leaves those three                               | It returns to its tier                                                                        | manual                     |
| C-USE-today-waiting-3 | Any tier heading                                            | Its colour square with its word; Stretch is slate                                             | `captures/waiting-402.png` |
