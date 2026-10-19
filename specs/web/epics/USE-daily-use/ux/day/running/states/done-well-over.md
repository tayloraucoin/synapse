---
target: specs/web/ux/day/running/states/done-well-over.md
status: approved
promoted:
boards:
  - name: "now-work / done, well over (danger) / 402 / light"
    page: "USE — daily use"
    at: [964, 19020]
    note: "Frame @ x 964, y 19950"
    capture: specs/web/epics/USE-daily-use/ux/day/running/captures/done-well-over-402.png
rulings:
  [
    D-USE-27,
    D-USE-29,
    D-USE-38,
    D-USE-39,
    D-USE-43,
    D-USE-44,
    D-USE-49,
    D-USE-72,
    D-USE-74,
    D-USE-76,
  ]
---

# Running — Done well over (danger)

[`done-on-a-running-row.md`](done-on-a-running-row.md) with the time taken past the danger edge: "[Agent: ENG-123 tests]", planned 30 min, done at 41. `?state=done-well-over`.

## What shows, top to bottom

As [`done-on-a-running-row.md`](done-on-a-running-row.md), except the settled row's meta: "Done · 41 min of 30" in `destructive-text`. The title stays muted, the box filled muted with its check; the card ("[Write the sync spec]", "18:20 of 45 min") and the row "[Agent: refactor the sync queue]" ("Running · 12:04 of 30 min") as there.

## What the person can do

As [`done-on-a-running-row.md`](done-on-a-running-row.md): nothing on the settled row; it leaves Running a moment later; no Change.

## Words

"Done · <n> min of <plan>", "of <plan>" shown from the warning band up so the colour has its reason beside it.

## The bands (Done's percent bands)

From [`../../../dev-notes/over-by-how-much.md`](../../../dev-notes/over-by-how-much.md) (D-USE-29), cited: up to 10% over the plan, ink, "Done · <n> min"; over 10% to 25%, `warning-text`, "Done · <n> min of <plan>"; over 25%, `destructive-text`, "Done · <n> min of <plan>". Band edges are whole minutes, at least 1 min. For this 30-min item: ink to 33, warning 34 to 37, danger 38 on; 41 is 37% over, danger. Under the plan is always ink. D-USE-72: Running uses the same bands, so the row was already danger while it ran past 38.

## The notes on the boards

**now-work / done, well over (danger) / 402 / light** (Frame @ x 964, y 19950):

> done, well over (danger)
>
> 41 of 30 min is 37% over, so the done line "Done · 41 min of 30" is danger. "of 30" is added so the colour has its reason beside it.

## Rulings

- D-USE-76: the frame is carried as a non-work block's Running rows; inside a Work block firing in place replaces it.
- **Where this state lives (lead's ruling).** The Running rows of non-work blocks (D-USE-27; D-USE-72). Inside a Work block D-USE-43, D-USE-44 and D-USE-49 replace them (one item in hand, the rest firing in place, no Running group); a work item's Done reads "Took … · fired …", and its clock over the range is [`../../../work/today/states/over-the-range.md`](../../../work/today/states/over-the-range.md). "The tiers below are placeholders until step 8."
- D-USE-29: Done coloured by percent over; bends "Nothing red on the execution tabs", P-A04 and N4's "ink only" (note 62), named, at Taylor's call. The word and "of <plan>" carry it, so colour is never alone.
- D-USE-38 and D-USE-72: `warning-text` stays [PROPOSED until the colours look]; danger reuses `destructive-text`.

## Widths

Drawn at: 402. At 1024 and up it scales up (D-USE-39), in the Block panel for a non-work block (D-USE-74).

## Criteria

| ID                             | When                     | Then                                                                         | Evidence                          |
| ------------------------------ | ------------------------ | ---------------------------------------------------------------------------- | --------------------------------- |
| C-USE-running-done-well-over-1 | Done at 41 of 30 min     | "Done · 41 min of 30" in `destructive-text`                                  | `captures/done-well-over-402.png` |
| C-USE-running-done-well-over-2 | Done at 34, 37, 38 of 30 | Warning, warning, danger, each with "of 30"; 33 reads "Done · 33 min" in ink | test                              |
