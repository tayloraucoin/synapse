---
target: specs/web/ux/set-my-days/set-my-days/states/overlap.md
status: approved
promoted:
boards:
  - name: "set-my-days / overlap / 402 / light"
    page: "USE — set up"
    at: [3856, 1260]
    note: "Frame @ x 3856, y 2190"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/overlap-402.png
rulings: [D-USE-33]
---

# Set my days — overlap

This week's Monday, 12 October, at 21:10: Breakfast has just been dragged to 8:30 and lands on Training. `?state=overlap`. Its note is the "Frame" at x 3856, y 2190. Layout, words and access: [`../index.md`](../index.md).

## What shows, top to bottom

- **Header:** "‹ Week", `SaveStatus` "Saved"; the title "Monday, 12 October".
- **Dated chips:** M 12 (filled ink), T 13, W 14, T 15, F 16, S 17, S 18, a dot under each built day.
- **Bounds row:** "Up at 7:00", "Lights out 22:30", the ···.
- **Column:**
  - Orient's line and lock at 7:00, "Orient · 5 min".
  - Wellness 7:05 to 8:00 (Pee and weigh, Water, Start the cold bath, "+2 more").
  - **The pair, side by side at half width, neither moved nor deleted:** Training on the left, "8:00 to 8:57" with "Drive to the YMCA"; Breakfast on the right, "8:30 to 9:00", carrying an ink edge (the block just moved) over its hairline Break band.
  - **The overlap line**, under the pair, full width: "Overlaps Training, 8:30 to 8:57." on the left, "Start at 8:57" (underlined, ink) on the right.
  - Work 9:30 to 12:00 with its tiers as slotted this week: Primary ([Write the sync spec] · ENG-123, [Review the Paper handoff]), Secondary ([Fix the retry backoff] · ENG-140), Stretch ([Tidy the Linear backlog]) [placeholder]; Lunch 12:00 to 13:00; the + bottom right.

## What the person can do

- "Start at 8:57": the one fix, moving the block just moved to start after the earlier block ends [ASSUMPTION: it keeps its length, 8:57 to 9:27; nothing else moves]. The pair then returns to full width and the line goes.
- Leave it: both blocks stay, overlapping; the line stays until the overlap is gone [ASSUMPTION].
- Drag either block again, or open either one, as any block (N2).

## Words

- "Overlaps Training, 8:30 to 8:57." (names the other block and the overlapping span)
- "Start at 8:57" (the earlier block's end)

## The notes on the boards

**"set-my-days / overlap / 402 / light"**, "Frame @ x 3856, y 2190":

> Overlap
>
> Breakfast dragged to 8:30 lands on Training: the two sit side by side, half width, neither moved or deleted. [PROPOSED] The block just moved carries an ink edge, and a line under the pair names the overlap with one fix, "Start at 8:57" (after the earlier block). Go mode runs the earlier one first [ASSUMPTION].

## Rulings

- N2: long-press and drag moves a block in time; others don't move, and an overlap shows both side by side.
- D-USE-33: step 9 round 4 approved in full, "overlap side by side with one fix" among it. The note's [PROPOSED] and [ASSUMPTION] are kept as drawn (no D-line lifts step 9's marks).
- Go mode runs the earlier block first [ASSUMPTION]; how Now shows it is go mode's ([`../../../day/now/index.md`](../../../day/now/index.md)), not drawn there.
- A block added over another from the New block sheet is its clash state ([`../../new-block-sheet/states/clash.md`](../../new-block-sheet/states/clash.md)); once added it shows as this pair.

## Widths

Drawn at: 402. At 1024 and wider, the day pane of the list-detail (D-USE-83, [`the-day.md`](the-day.md)) shows the same pair and line.

## Criteria

| ID                          | When                            | Then                                                                                            | Evidence                   |
| --------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-set-my-days-overlap-1 | A block is dropped over another | Both at half width side by side, neither moved or deleted; the moved one has an ink edge        | `captures/overlap-402.png` |
| C-USE-set-my-days-overlap-2 | The overlap shows               | One line under the pair names the other block and span, with one fix at the earlier block's end | `captures/overlap-402.png` |
| C-USE-set-my-days-overlap-3 | The fix is tapped               | The moved block starts at the earlier block's end; no other block moves                         | test                       |
