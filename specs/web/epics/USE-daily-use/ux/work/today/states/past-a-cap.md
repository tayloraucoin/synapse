---
target: specs/web/ux/work/today/states/past-a-cap.md
status: approved
promoted:
boards:
  - name: "now-work / cap, a third Primary / 402 / light"
    page: "USE — daily use"
    at: [964, 16500]
    note: "Frame @ x 964, y 17430"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/past-a-cap-402.png
rulings:
  [
    D-USE-20,
    D-USE-41,
    D-USE-45,
    D-USE-49,
    D-USE-50,
    D-USE-51,
    D-USE-54,
    D-USE-65,
    D-USE-77,
  ]
---

# Today — past a cap (a third Primary)

A tier holds more than its usual number: a third Primary, or a fifth Secondary. Soft, never a block (N4). `?state=past-a-cap`.

## What shows, top to bottom

**Phone (402, 9:44), as drawn:** `AppHeader` "Now", the To-dos tray line, the Work `BlockHeader` ("Work", "9:30 to 12:00", ···). Then:

- **Primary** heading, and under it a `HelperText`: "Two is the usual for Primary."
- The lifted card for "[Write the sync spec]", "45 min · 9:30", **Start** and **Done**.
- A row: "[Review the Paper handoff]", "30 min".
- The third Primary, just added: "[Fix the sign-in redirect]", "20 min".
- An `InlineAddRow`: "Add to Primary" with its plus glyph.
- **Secondary**: "[Answer the review comments]" "20 min"; "[Agent: refactor the sync queue]" "30 min".
- **Stretch**: "[Tidy the Linear backlog]" "15 min".
- `BottomNav`.

**The build, with the later rulings applied:** the rows and card take the locked phone form (D-USE-51; the shaded Next card, D-USE-45, D-USE-49), with + in the Now header. The frame's "Add to Primary" row under the tier: D-USE-54 superseded the "add row under each tier" frame and adds through + Add. [ASSUMPTION] What the note's "Add to Primary stays" carries into the build is the rule, not the row: adding to Primary is never refused, from + Add or anywhere else.

**Desk (not drawn):** the same `HelperText` under the tier's `GroupHeading` (N4 "both widths"; D-USE-50: the desk keeps N4's rules); "+ Add to <tier>" stays on hover (D-USE-41).

## The Secondary helper

The note says "The same rule for a fifth Secondary"; D-USE-65 gives its words: "Four is the usual for Secondary." The two agree: the helper shows once a fifth Secondary is in, the line naming the usual four. [ASSUMPTION] Stretch and Urgent have no helper: N4 names only Primary's two and Secondary's four, and Urgent's cap stays open (D-USE-20, [urgent-above-primary](urgent-above-primary.md)).

## What the person can do

Everything as [working](working.md). The helper is text, not a control; it leaves when the tier is back at its usual number [ASSUMPTION].

## Words

"Two is the usual for Primary."; "Four is the usual for Secondary." (D-USE-65); "Add to Primary".

## The notes on the boards

**"now-work / cap, a third Primary / 402 / light"**, "Frame" @ x 964, y 17430:

> cap, a third Primary
>
> The add went through: a third Primary sits in the list and "Two is the usual for Primary." appears under the heading. Add to Primary stays; nothing is refused. The same rule for a fifth Secondary.

## Rulings

- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- N4: a third Primary or a fifth Secondary is allowed; the line is soft.
- D-USE-50: N4's rules hold in the work block on the phone; the desk keeps them.
- D-USE-65: Secondary's helper, "Four is the usual for Secondary."; it matches the note's "fifth Secondary".
- The frame draws plain rows; D-USE-51 makes them the trimmed work rows. The frame's add row under the tier: D-USE-54, above.

## Widths

Drawn at 402. Desk: as the phone, under the `GroupHeading` (D-USE-50).

## Criteria

| ID                       | When                                    | Then                                                                                 | Evidence                      |
| ------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------- |
| C-USE-today-past-a-cap-1 | A third Primary is added                | It is added; "Two is the usual for Primary." shows under the heading; nothing blocks | `captures/past-a-cap-402.png` |
| C-USE-today-past-a-cap-2 | A fifth Secondary is added              | It is added; "Four is the usual for Secondary." shows under the heading              | manual                        |
| C-USE-today-past-a-cap-3 | The tier drops back to its usual number | The helper leaves                                                                    | manual                        |
