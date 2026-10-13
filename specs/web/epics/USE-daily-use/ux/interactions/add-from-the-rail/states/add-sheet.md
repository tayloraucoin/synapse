---
target: specs/web/ux/interactions/add-from-the-rail/states/add-sheet.md
status: approved
promoted:
boards:
  - name: "review-day / add sheet / 402 / light"
    page: "USE — daily use"
    at: [2892, 3900]
    note: "Note · add sheet"
    capture: specs/web/epics/USE-daily-use/ux/interactions/add-from-the-rail/captures/add-sheet-402.png
rulings: [D-USE-11, D-USE-16, D-USE-19, D-USE-20]
---

# Add from the rail — the add sheet

Board branch 2d [PROPOSED]. Released at 10:15, inside Work, which is full. Its note is "Note · add sheet" at x 2892, y 4830.

## What shows, top to bottom

- Review the day under a scrim (header visible); a `ResponsiveSheet` from y 120 with a grabber.
- × on the left (gained in this round), then the scope line "Monday · lands in Work, 9:30 to 12:00" (caption, muted) over the title "Add".
- A `SegmentedControl`, "Item" (picked) and "Block".
- The emoji slot (dashed, 44 px, a muted face) beside the name field "[New work item]", focused (ink border, caret).
- **Starts:** a time stepper "−15 | 10:15 | +15" [PROPOSED].
- **Length:** a `MinutesStepper` "− 15 min +".
- **At a set time** with the sub-line "Stays at 10:15 when things move" and a `Switch`, off.
- **Tier:** the label, then a four-way `SegmentedControl`: Urgent, Primary, Secondary (picked), Stretch.
- **Notes (optional):** an autogrow `Textarea`, "Details, links, anything to remember".
- The foot line (label, muted): "Work is full at 10:15. Adding asks where the 15 min comes from." Then "Add", full width, ink.

## What the person can do

- Name it; the emoji slot opens the icon picker (`../../icon-picker/index.md`, its no-name-yet step).
- Starts and Length by steps of 15 (Starts also takes a typed time); At a set time pins it (it stays when things move).
- Tier shows only when the time falls in a Work block [ASSUMPTION, D-USE-16 "tier for a work item"].
- **Block** turns the sheet into the New block sheet ([`../../../set-my-days/new-block-sheet/index.md`](../../../set-my-days/new-block-sheet/index.md)).
- **Add:** with room, it lands silently; with no room (as here), it goes on to Make room (`../../make-room/index.md`).
- × closes with nothing added.

## Words

"<Weekday> · lands in <Block>, <start> to <end>" · "Add" · "Item" · "Block" · "Starts" · "Length" · "At a set time" · "Stays at <time> when things move" · "Tier" · "Notes (optional)" · "Details, links, anything to remember" · "<Block> is full at <time>. Adding asks where the <n> min comes from." The canvas title "Add" with the scope line replaces D-USE-16's "Add at 10:15".

## The notes on the boards

**"review-day / add sheet / 402 / light"**, "Note · add sheet" @ x 2892, y 4830:

> add sheet · board 2d [PROPOSED]
>
> Released at 10:15 in Work. Item or Block, icon and name, Starts and Length steppers, At a set time, four tiers, optional notes (D-USE-16, 19). Gains a × on the left. The foot says Work is full, so Add goes on to Make room.

## Rulings

- D-USE-16: Item or Block, icon and name, length, At a set time, tier for a work item, a line when the block is full, Add going to Make room only with no room.
- D-USE-19: Starts in 15-minute steps that takes a typed time; At a set time says what it does; tier as a four-way control; Notes (optional) autogrow.
- D-USE-20: four tiers.

## Widths

Drawn at: 402. At the desk: the right-side panel at `--sheet-w` (D-USE-39).

## Criteria

| ID                                  | When                    | Then                                                          | Evidence                     |
| ----------------------------------- | ----------------------- | ------------------------------------------------------------- | ---------------------------- |
| C-USE-add-from-the-rail-add-sheet-1 | Released inside a block | The scope line names the block; Starts reads the release time | `captures/add-sheet-402.png` |
| C-USE-add-from-the-rail-add-sheet-2 | The block is full       | The foot line says so; Add opens Make room                    | `captures/add-sheet-402.png` |
