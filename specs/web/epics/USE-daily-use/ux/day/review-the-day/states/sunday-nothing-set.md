---
target: specs/web/ux/day/review-the-day/states/sunday-nothing-set.md
status: approved
promoted:
boards:
  - name: "review-day / sunday, nothing set, top / 402 / light"
    page: "USE — daily use"
    at: [482, 5160]
    note: "Frame @ x 482, y 6090"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/sunday-nothing-set-402.png
rulings: [D-USE-28, D-USE-30, D-USE-68, D-USE-69]
---

# Review the day — Sunday, nothing set

A day with no blocks: two ways in, under the title (step 5 round 2 and the feedback round). It replaces the archived centred version, `review-day / sunday, nothing set / 402 / light` ("Row label · Archive 3", x 964; superseded, D-USE-30). How it sits beside the Saturday empty frame is decided (D-USE-68) in [`empty.md`](empty.md). Its note is the "Frame" at x 482, y 6090.

## What shows, top to bottom

- Status bar 8:40. `Breadcrumb` "‹ Orient" over "Sunday, 18 October"; a hairline.
- No To-dos tray is drawn; the tray stays pinned under the header as on every Review the day (D-USE-69); the frame leaves it out.
- 24 px down, 20 px sides: "Nothing set for Sunday." (body, semibold), then "A loose day can be one list, done in any order." (body, muted).
- Two choice cards, full width, `--radius-control`, 12 px apart, each an icon (20 px, line) beside a title (label, semibold) over a line (caption, muted):
  - **"Make a checklist"** / "Things to get through today. No times." (a list icon), outlined in ink (1.5 px `--color-foreground`): the likely one on a Sunday.
  - **"Plan with blocks"** / "Times on the rail, like a weekday." (a layout icon), a `--color-border` hairline.
- "Copy another day" (label, medium, `--color-link`).
- No Ready, go until a choice is made.

## What the person can do

- **Make a checklist:** [`sunday-making-the-checklist.md`](sunday-making-the-checklist.md).
- **Plan with blocks:** Set my days at Sunday [ASSUMPTION: as "Set Saturday" does, `../../../set-my-days/set-my-days/index.md`; for this day or the usual Sunday is Set my days' own choice].
- **Copy another day:** Set my days' Copy from…, for today [ASSUMPTION: the list of built days with their strips, open-4 "Copy from…"].

## Words

"Nothing set for <Weekday>." · "A loose day can be one list, done in any order." · "Make a checklist" · "Things to get through today. No times." · "Plan with blocks" · "Times on the rail, like a weekday." · "Copy another day".

## The notes on the boards

**"review-day / sunday, nothing set, top / 402 / light"**, "Frame" @ x 482, y 6090:

> sunday, nothing set, top
>
> The ask moved under the title. Centred, it floated in a sea of space: the eye lands at the top (F-pattern), proximity ties the choice to the date it's about, and the empty band read as something failed to load.

The archived frame's note ("Frame" @ x 964, y 26250), for the record: "Sunday, nothing set [PROPOSED] / A day with no blocks offers two ways in: Make a checklist (outlined in ink, the likely one on a Sunday) or Plan with blocks, plus Copy another day."

## Rulings

- D-USE-28: an empty day offers Make a checklist or Plan with blocks.
- D-USE-30: the choice sits under the title, not centred (supersedes the archived frame).

## Widths

Drawn at: 402. At the desk: the cards in the capped column (D-USE-39).

## Criteria

| ID                                        | When                 | Then                                                                                          | Evidence                              |
| ----------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------- |
| C-USE-review-the-day-sunday-nothing-set-1 | A day with no blocks | The ask under the title; Make a checklist outlined in ink; Plan with blocks; Copy another day | `captures/sunday-nothing-set-402.png` |
