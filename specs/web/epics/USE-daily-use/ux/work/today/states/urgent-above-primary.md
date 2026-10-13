---
target: specs/web/ux/work/today/states/urgent-above-primary.md
status: approved
promoted:
boards:
  - name: "now-work / urgent above primary / 402 / light"
    page: "USE — daily use"
    at: [1928, 16500]
    note: "Frame @ x 1928, y 17430"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/urgent-above-primary-402.png
rulings:
  [
    D-USE-20,
    D-USE-38,
    D-USE-42,
    D-USE-43,
    D-USE-45,
    D-USE-49,
    D-USE-51,
    D-USE-55,
    D-USE-77,
    D-USE-79,
  ]
---

# Today — Urgent above Primary

Something urgent is added mid-block; Urgent shows above Primary and its item takes the lift. `?state=urgent-above-primary`.

## What shows, top to bottom

**Phone (402, 9:55), as drawn:** `AppHeader` "Now", the To-dos tray line, the Work `BlockHeader` ("Work", "9:30 to 12:00", ···). Then:

- **Urgent** heading (red square, D-USE-38). The lifted card for "[Sync errors in production]": item icon, dot, title, "30 min · added 9:52", **Start** and **Done**.
- **Primary**: "[Write the sync spec]" "45 min"; "[Review the Paper handoff]" "30 min". [Write the sync spec], lifted until 9:52, is back as a row.
- **Secondary**: "[Answer the review comments]" "20 min"; "[Agent: refactor the sync queue]" "30 min".
- **Stretch**: "[Tidy the Linear backlog]" "15 min".
- `BottomNav`.

**The build, with the later rulings applied:** Next is order only, Urgent first (D-USE-43, D-USE-45), so the first Urgent item neither firing nor done is Next and lifts as the shaded card (D-USE-49); while something runs, the running card keeps the lift and the Urgent item is the shaded Next row (D-USE-45). Rows and card take the locked phone form (D-USE-51). The frame's meta "added 9:52" is not in D-USE-51's row meta (client tile, project emoji, ID, priority chip, size chip) [ASSUMPTION: it goes; the length shows as a range on the right]. An Urgent item's priority chip, where it comes from Linear, is Urgent red with its glyph (D-USE-42); the tier and the priority are separate fields.

**Desk (not drawn):** Urgent sits above Primary as a `GroupHeading` with its red square, only while it holds something (D-USE-38); the Next strip names the Urgent item with "Urgent" as its tier word and Go (D-USE-43, D-USE-55); the card lifts in Urgent (D-USE-45, D-USE-49).

## What the person can do

Start or Done on the Urgent card; fire it (the ring, F, the swipe); everything else as [working](working.md). Once the Urgent item is done or firing and Urgent holds nothing undone, Next moves to Primary. [ASSUMPTION] Urgent's heading stays while it holds a firing or done item.

## Urgent's soft cap

Decided (D-USE-79): none (the note: "Urgent's soft cap stays open (default: none)"; D-USE-20 leaves it open). No helper line shows on Urgent, however many it holds.

## Words

"Urgent", "Primary", "Secondary", "Stretch".

## The notes on the boards

**"now-work / urgent above primary / 402 / light"**, "Frame" @ x 1928, y 17430:

> urgent above primary (D-USE-20)
>
> Something urgent added at 9:52 takes the lifted card; Primary waits below it. Urgent's soft cap stays open (default: none).

## Rulings

- D-USE-79: D-USE-38's colours stand as drawn, with the warning-text token; Urgent has no soft cap.
- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- D-USE-20: four tiers; Urgent sits above Primary in go mode; its soft cap is open.
- D-USE-38: tiers step red, leaf, amber, slate; Urgent shows only when it holds something (open-2's step 8 [ASSUMPTION], drawn here).
- D-USE-43, D-USE-45, D-USE-49: Next is order only, Urgent first; it lifts as the shaded card when nothing is in hand.
- The frame draws plain rows and a verdigris-dot card; D-USE-51 makes them the trimmed work rows.

## Widths

Drawn at 402. Desk: D-USE-38, D-USE-43, D-USE-55, above.

## Criteria

| ID                                 | When                                            | Then                                                                                   | Evidence                                |
| ---------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------- |
| C-USE-today-urgent-above-primary-1 | An item is added to Urgent with nothing in hand | Urgent shows above Primary and its item lifts as Next; the old Next returns to its row | `captures/urgent-above-primary-402.png` |
| C-USE-today-urgent-above-primary-2 | Urgent holds nothing                            | No Urgent heading                                                                      | `captures/primary-only-402.png`         |
| C-USE-today-urgent-above-primary-3 | Urgent holds any number of items                | No cap line; nothing refused                                                           | manual                                  |
