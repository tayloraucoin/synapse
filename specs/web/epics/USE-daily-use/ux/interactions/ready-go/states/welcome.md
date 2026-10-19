---
target: specs/web/ux/interactions/ready-go/states/welcome.md
status: approved
promoted:
boards:
  - name: "ready-go / welcome, rec. / 402 / light"
    page: "USE — daily use"
    at: [0, 8940]
    note: "Frame @ x 0, y 9870"
    capture: specs/web/epics/USE-daily-use/ux/interactions/ready-go/captures/welcome-402.png
rulings: [D-USE-71, D-USE-25, D-USE-39]
---

# The Ready, go hand-off — the welcome

Step 1 of [`../index.md`](../index.md): the screen Ready, go fades to, at 7:02 on Monday, 12 October. "rec." in the artboard's name is kept as drawn (the recommended direction). Its note is the "Frame" at x 0, y 9870.

## What shows, top to bottom

- Focused: no `AppHeader`, no tabs, no avatar. Back on the left: "‹ Review the day".
- The date, small caps, muted: "MONDAY, 12 OCTOBER".
- "The day is set." in Newsreader at `--text-review-title` [placeholder until Gloss].
- "Today, as I see it" (label) over Orient's line, italic serif, on a left rule: "Slow start, cold bath, then one real push on the launch before lunch. [placeholder]". Absent when Orient's line is empty.
- "The day" (label) over one bar from 7:00 to 17:00, ticks "7:00", "12:00", "17:00": a block per segment in its colour, each named or initialled (W, T, B, Work, L, Work; an empty tail), so colour is never alone; the now-tick a verdigris rule at 7:02.
- "First" (label), then rows on hairlines in Block complete's style: a filled dot, "Wellness" (bold) "7:05 to 8:00"; a hollow dot, "then Training" "8:00"; a hollow dot, "then Breakfast" "9:00".
- Space, then one ink `Button`, full width, on a fade (D-USE-25): "Start Wellness"; under it, caption: "Planned for 7:05. Starting early is fine."

## What the person can do

- **Start Wellness:** the welcome fades and Now opens on Wellness (`../../../day/now/index.md`).
- **‹ Review the day:** back, nothing undone.
- Nothing else is live [ASSUMPTION: the bar and rows are not tappable; none drawn].

## Words

"Review the day" · "The day is set." · "Today, as I see it" · "The day" · "First" · "then <block>" · "<start> to <end>" · "Start <block>" · "Planned for <time>. Starting early is fine." All [placeholder] until Gloss (D-USE-71).

## The notes on the boards

**"ready-go / welcome, rec. / 402 / light"**, "Frame" @ x 0, y 9870:

> Welcome · 7:02 (recommended)
>
> A focused screen with no tabs, like Review the day; back on the left. Top to bottom: the date, "The day is set." in Newsreader, "Today, as I see it" read back from Orient [PROPOSED], the day as one bar from 7:00 to 17:00 with the now-tick in verdigris (names or initials in each block, so colour is never alone), then First: Wellness, then Training, then Breakfast, in Block complete's style. One button on a fade: Start Wellness.

## Rulings

- D-USE-71: as drawn; "Today, as I see it" here is Decided (D-USE-71).
- D-USE-25: the button floats on a fade.
- D-USE-39: focused at every width.
- Replaces round 1's A1 to A4, A reduced motion and B (`../../../boards/use-daily-use/archive-2.md`).
- Kept from round 1, `ready-go / A1 Ready, go pressed / 402 / light`: the day locks on press and nothing waits on the network; Ready, go pressed from a keyboard lands with no motion (C-P11) [ASSUMPTION: round 2 lands on the welcome with focus on its title; not drawn].

## Widths

Drawn at: 402. At 1024 and 1440: focused, with no rail and no tabs (D-USE-39); one centred column capped at `--content-text`, the button at the column's foot right-aligned at a fixed 240, as Review the day at 1440 [ASSUMPTION: D-USE-39 names the welcome as focused, not its button]. Decided (D-USE-74): Start at the desk lands on `/today`, which after Ready, go is Today (D-USE-65; `../../../work/today/index.md`).

## Criteria

| ID                       | When                                 | Then                                                      | Evidence                   |
| ------------------------ | ------------------------------------ | --------------------------------------------------------- | -------------------------- |
| C-USE-ready-go-welcome-1 | Ready, go with Orient's line written | Date, title, the line, the bar, First, Start <block>      | `captures/welcome-402.png` |
| C-USE-ready-go-welcome-2 | Orient's line empty                  | No "Today, as I see it" section                           | test                       |
| C-USE-ready-go-welcome-3 | The bar                              | Every block named or initialled; the now-tick at the time | `captures/welcome-402.png` |
