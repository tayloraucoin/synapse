---
target: specs/web/ux/work/this-week/states/the-day.md
status: approved
promoted:
boards:
  - name: "this-week / the day, work tiers, Pool entry / 402 / light"
    page: "USE — work"
    at: [5302, 7200]
    note: "Notes · phone, editing and This week (row 6, cont.) @ x 5302"
    capture: specs/web/epics/USE-daily-use/ux/work/this-week/captures/the-day-402.png
rulings:
  [
    D-USE-40,
    D-USE-42,
    D-USE-54,
    D-USE-55,
    D-USE-57,
    D-USE-79,
    D-USE-98,
    D-USE-102,
    D-USE-105,
    D-USE-107,
    D-USE-108,
  ]
---

# This week on the phone — the day, work tiers, Pool entry

Set my days › This week on Tuesday 13 October, Sunday evening at 21:14. The surface's default state: the region list is [`../index.md`](../index.md) › Layout. `?state=the-day` [ASSUMPTION: key].

## What shows, top to bottom

- Status bar 21:14. "‹ Week" over "Tuesday, 13 October"; "✓ Saved".
- Chips "M 12", **"T 13"** (filled ink), "W 14", "T 15", "F 16", "S 17", "S 18" (the last two in disabled ink). No dots drawn [ASSUMPTION: the "set" dot of Set my days' chips stays, as `../../../set-my-days/set-my-days/states/the-day.md`].
- **Breakfast** "9:00 to 9:30", a dashed meal band.
- **Work** "9:30 to 12:00", open to its tiers:
  - "Primary" (leaf square): ✍️ "[Case studies: Alder intro]" with the link glyph and "2 of 3" (a session of a spread task, D-USE-42, D-USE-102: N counts the sessions placed so far); 📅 "[Booking: reschedule flow]" with "due Wed" (the due words of that day, D-USE-98, as words, never a badge here [ASSUMPTION: the phone row carries due as caption words, not the desk's badge]).
  - "Secondary" (amber square): 🎨 "[Brand site: case study template]".
  - "Stretch" (slate square, D-USE-79): empty, so its add row "+ Add to Stretch" shows [ASSUMPTION: each tier keeps its add row, as the Block view's tiers (`../../../day/block-view/states/work-tiers.md`); the frame draws it on the empty tier only]. Urgent is not drawn: it shows when it holds something [ASSUMPTION, as Today].
  - A sky rule, then the fit line "Doesn't fit by 40 min at the top of the ranges" in ink, medium, never red (N6, D-USE-57).
- **Lunch** "12:00 to 13:00", a dashed meal band. **"15:30 [Dentist]"**, a plum event band (an event of its own, outside every block).
- **Foot:** **Pool** (pill, layers glyph) at the left, the + at the right.

## What the person can do

- **Pool:** the pool sheet (Pool tab; `../../../interactions/place-from-the-pool/states/pool-sheet.md`), placing onto this day by default [ASSUMPTION: the place sheet's Days starts on the day shown].
- A row: the Item sheet (`../../../day/item-sheet/`), with Sessions for a spread task ([`../../../day/item-sheet/states/tier-and-sessions.md`](../../../day/item-sheet/states/tier-and-sessions.md)). Long-press: [ASSUMPTION] the work menu of Today's rows ([`../../today/states/work-menu.md`](../../today/states/work-menu.md)) less Start and Prompt sent, since this day is not today.
- "+ Add to Stretch": the tier add row's dropdown ([`../../../day/block-view/states/work-add-to-a-tier.md`](../../../day/block-view/states/work-add-to-a-tier.md)): New item, From the pool, From Linear, with the tier and day set.
- The chips, "‹ Week", the +, a block's Block view: [`../index.md`](../index.md) › Entry and exit.

## Words

"Tuesday, 13 October" · "✓ Saved" · "Primary", "Secondary", "Stretch" · "2 of 3" · "due Wed" · "+ Add to Stretch" · "Doesn't fit by 40 min at the top of the ranges" · "Pool". Gloss: see [`../words-and-access.md`](../words-and-access.md) for the "doesn't fit" bend and the one session form.

## The notes on the boards

**Notes · phone, editing and This week (row 6, cont.) @ x 5302** — This week, the day, Pool entry

Set my days › This week on a day: the Work block opens to its tiers, sessions carry the link mark and "2 of 3", due words on the row, and the fit line at the foot ("Doesn't fit by 40 min at the top of the ranges", in ink). Pool sits beside the + at the foot.

## Rulings

- D-USE-54, D-USE-57: the day view in Set my days › This week with tiers, session marks, due words, the fit line and a Pool button beside the +.
- D-USE-55: the phone's answer to the two-pane Week; one day at a time behind the chips.
- D-USE-40, D-USE-42, D-USE-102: a task longer than a day is one item in sessions, "n of N", N growing as sessions are placed.
- D-USE-79: Stretch is slate.
- D-USE-98: due words per day.

## Widths

Drawn at 402. 1024 and up: the Week (D-USE-55, D-USE-93); Set my days' day pane, [`../index.md`](../index.md) › Platforms (Decided (D-USE-108 (3)): Pool kept, sheets as the right-side panel); built as Set my days' day column with this frame's work parts (Decided (D-USE-107)).

## Criteria

| ID                        | When                                         | Then                                                                                                     | Evidence                   |
| ------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-this-week-the-day-1 | A This week day with a Work block            | The block opens to its tiers, each with its square and word; Pool at the foot's left, the + at its right | `captures/the-day-402.png` |
| C-USE-this-week-the-day-2 | A session of a spread task on the day        | The link glyph and "n of N" on its row                                                                   | `captures/the-day-402.png` |
| C-USE-this-week-the-day-3 | The day's work runs past its Work blocks     | The fit line names the length in ink; no red, no count                                                   | `captures/the-day-402.png` |
| C-USE-this-week-the-day-4 | An item due within two days of the day shown | "due <day>" on its row, worked out for that day                                                          | test                       |
