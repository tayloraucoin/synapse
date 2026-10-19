---
target: specs/web/ux/interactions/ready-go/states/first-go-ever.md
status: approved
promoted:
boards:
  - name: "ready-go / welcome, first go ever / 402 / light"
    page: "USE — daily use"
    at: [482, 8940]
    note: "Frame @ x 482, y 9870"
    capture: specs/web/epics/USE-daily-use/ux/interactions/ready-go/captures/first-go-ever-402.png
rulings: [D-USE-71, D-USE-88]
---

# The Ready, go hand-off — first go ever

The welcome the first time Ready, go is ever pressed ([`../index.md`](../index.md)). Its note is the "Frame" at x 482, y 9870.

## What shows, top to bottom

As [`welcome.md`](welcome.md), with these changes:

- No "Today, as I see it" section; the bar sits under the title.
- First lists two rows: "Wellness" "7:05 to 8:00", "then Training" "8:00".
- "From here, at the bottom" (label), then three rows, each an outlined square standing for its tab icon, a bold name and a muted line:
  - "Now" · "the block under way, to-dos on top"
  - "Schedule" · "the whole day, to change it"
  - "Review" · "the days behind"
- The button and its caption as the welcome: "Start Wellness", "Planned for 7:05. Starting early is fine."

## What the person can do

As the welcome. The tab rows are not tappable [ASSUMPTION: they teach, before the tabs exist].

## Words

"From here, at the bottom" · "Now" · "the block under way, to-dos on top" · "Schedule" · "the whole day, to change it" · "Review" · "the days behind". [placeholder] until Gloss.

## The notes on the boards

**"ready-go / welcome, first go ever / 402 / light"**, "Frame" @ x 482, y 9870:

> First go ever [PROPOSED]
>
> Once only, the line from Orient gives way to "From here, at the bottom": Now, Schedule, Review, each with what it holds. It teaches the tabs before they appear, with nothing laid over Now. Help in the avatar menu shows it again.

## Rulings

- D-USE-71: Decided as drawn; shown once ever.
- D-USE-88: the avatar menu has no Help row, so this teaching is never shown again (drops D-USE-71's "Help in the avatar menu shows it again" [ASSUMPTION]); the note's last sentence is superseded.
- Replaces round 1's C, the one-time tooltips over Now (`../../../boards/use-daily-use/archive-2.md`).
- First lists two rows here and three on the welcome [ASSUMPTION: the list shortens to make room; the build lists up to three].

## Widths

Drawn at: 402. Wider: as [`welcome.md`](welcome.md) › Widths (D-USE-39).

## Criteria

| ID                             | When                     | Then                                                   | Evidence                         |
| ------------------------------ | ------------------------ | ------------------------------------------------------ | -------------------------------- |
| C-USE-ready-go-first-go-ever-1 | The first Ready, go ever | "From here, at the bottom" in place of the Orient line | `captures/first-go-ever-402.png` |
| C-USE-ready-go-first-go-ever-2 | Any later Ready, go      | The plain welcome                                      | test                             |
