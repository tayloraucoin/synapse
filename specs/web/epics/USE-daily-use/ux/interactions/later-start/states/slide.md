---
target: specs/web/ux/interactions/later-start/states/slide.md
status: approved
promoted:
boards:
  - name: "review-day / late, ask: slide / 402 / light"
    page: "USE — daily use"
    at: [5302, 3900]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/interactions/later-start/captures/slide-402.png
rulings: []
---

# A later start — Slide the day back

The sheet on "Slide the day back" [PROPOSED]. Its note is the "Note · success" at x 5302, y 4830.

## What shows, top to bottom

- As [`cut-some.md`](cut-some.md) to the control, with "Slide the day back" picked (outlined in ink).
- "Everything keeps its length, 70 min later" (label, semibold), a hairline.
- One row per block on hairlines: a 3 px bar in the kind's colour, the name (body), then the old start struck through (muted) and the new start (body, semibold) at the trailing edge: Wellness "7:05" → "8:15"; Training "8:00" → "9:10"; Breakfast "9:00" → "10:10" (a grey bar); Work "9:30" → "10:40".
- A set-time row: a lock glyph, "Call with Sam [placeholder]" over "At a set time, stays at 11:00. Work splits around it." (caption, muted).
- "⌄ Show later blocks".
- A hairline, the foot line (label): "The day ends 70 min later: Lights out at 23:40. [placeholder]"
- "Not now" (outlined) and "Slide the day back" (ink, the primary).

## What the person can do

- **Slide the day back** moves every block by the gap; set-time items stay and blocks split around them.
- Switch back to Cut some; "Show later blocks"; **Not now** or × as Cut some.

## Words

"Everything keeps its length, <n> min later" · "At a set time, stays at <time>. <Block> splits around it." · "The day ends <n> min later: Lights out at <time>." · "Slide the day back".

## The notes on the boards

**"review-day / late, ask: slide / 402 / light"**, "Note · success" @ x 5302, y 4830:

> late · ask, slide the day back [PROPOSED]
>
> Everything keeps its length and moves 70 min, old time struck through beside the new. Set-time items stay put and blocks split around them. The footer shows where the day now ends.

## Rulings

None; open-1's "A later start" (`../index.md`). Wellness slides to 8:15, so a passed block comes back on a slide [ASSUMPTION: the slide includes the folded blocks; Cut some is how one is dropped]. A slide past Lights out: to settle (the dev note).

## Widths

Drawn at: 402. At the desk: the right-side panel at `--sheet-w` (D-USE-39).

## Criteria

| ID                        | When                       | Then                                                                             | Evidence                 |
| ------------------------- | -------------------------- | -------------------------------------------------------------------------------- | ------------------------ |
| C-USE-later-start-slide-1 | Slide is picked            | Each block's old start struck through beside its new one; the new end of the day | `captures/slide-402.png` |
| C-USE-later-start-slide-2 | A set-time item in the way | It stays; its block splits around it                                             | test                     |
