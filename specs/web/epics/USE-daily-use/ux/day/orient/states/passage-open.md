---
target: specs/web/ux/day/orient/states/passage-open.md
status: approved
promoted:
boards:
  - name: "orient / passage open / 402 / light"
    page: "USE — daily use"
    at: [482, 2640]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/orient/captures/passage-open-402.png
rulings: [D-USE-9]
---

# Orient — passage open: Read all

"Read all" opens the passage in a full-screen reader over Orient. Its note is the "Note · success" at x 482, y 3570 (the note artboards are all named the same; this one is told by its x).

## What shows, top to bottom

- **Status bar:** the phone's.
- **Reader bar:** `--h-target` tall, 20 px side padding, 12 px gap, a `--color-border` hairline under it. The × (18 px, `--color-foreground`) on the left, then the reading's caption "Morning reading" [placeholder] (label, medium, muted).
- **Passage body:** 24 px side padding, 24 px above, 16 px between paragraphs, clipped at the foot and scrolling. The passage's title "Where the feet are" [placeholder] (sans, medium, `--text-review-title`), then its paragraphs in Newsreader at reading size (`--text-heading`, review-body leading) [placeholder]:
  - "Begin where the feet are. The breath has kept time all night without being asked. Before the list and before the clock there is only this: cool air, a held cup, the plain fact of being awake."
  - "Nothing has to be decided yet. The day is already written; it only needs reading, slowly, the way a letter from a friend is read twice. Notice the weight of the body on the seat. Notice the water filling."
  - "When the mind runs ahead to the meeting, the drive, the list, let it go and come back, the way the tide comes back. There is time for all of it, and none of it is now."
- **Dots:** centred at the foot, 16 px above, 8 px apart, 8 px each; the current `--color-foreground`, the others `--color-fill-muted`. They show where the passage sits among the day's passages.
- No button. The reader is a full-screen proposal for Plumb (open-1, "To Plumb … the full-screen passage reader").

## What the person can do

- Swipe left or right for the next or previous passage; the dots follow.
- Scroll a long passage.
- Tap × (left) to go back to Orient, at the same passage.

## Words

"Morning reading" [placeholder]; the passage's own title and words. The × has the accessible name "Close" [ASSUMPTION: Gloss].

## The notes on the boards

**"orient / passage open / 402 / light"**, note "Note · success" @ x 482, y 3570:

> passage open · Read all
>
> Full screen, Newsreader at reading size, × on the left back to Orient. Swipe for the next passage; the dots show where.

## Rulings

- **D-USE-9:** the passage clamps on Orient with "Read all", which opens a full-screen reader.
- The overview board drew this as branch 1a, "orient.md · passage open [PROPOSED state]" ([`../../../interactions/first-wake-loop.md`](../../../interactions/first-wake-loop.md)); this frame is the one built.

## Widths

Drawn at: 402. Not drawn at: the desk; still full screen, the text column capped at the reading measure and centred [ASSUMPTION: D-USE-39 names no wide reader; Orient scales up].

## Criteria

| ID                          | When                  | Then                                                                 | Evidence                        |
| --------------------------- | --------------------- | -------------------------------------------------------------------- | ------------------------------- |
| C-USE-orient-passage-open-1 | "Read all" is tapped  | The reader fills the screen with the whole passage and × on the left | `captures/passage-open-402.png` |
| C-USE-orient-passage-open-2 | A swipe in the reader | The next passage shows and the dots move                             | test                            |
| C-USE-orient-passage-open-3 | × is tapped           | Orient shows at the same passage, focus back on "Read all"           | test                            |
