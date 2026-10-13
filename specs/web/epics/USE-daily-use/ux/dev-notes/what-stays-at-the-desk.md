---
target: specs/web/ux/dev-notes/what-stays-at-the-desk.md
status: approved
promoted:
dev_note: "Dev note · What stays at the desk, and the phone's answer"
rulings: [D-USE-51, D-USE-55, D-USE-57, D-USE-58, D-USE-65, D-USE-93, D-USE-104]
---

# What stays at the desk, and the phone's answer

The desk-only map: what the phone does not draw, and what stands in for it below 1024 (D-USE-55, D-USE-93). A state drawn only at 1728 or 1440 cites this note for its phone answer; a state drawn only at 402 cites the files below for its desk form.

## The dev note

**Dev note · What stays at the desk, and the phone's answer** ("USE — work", x 11086, y 7200, a 402 × 874 text artboard at the end of row 6). D-USE-55 places this note at x 5302; on the board it now stands at x 11086, since D-USE-57 extended row 6 to the right (the cont. frames from x 5302 on). D-USE-58 locks it at x 11086.

> Desk-only · the phone's answer
>
> What stays at the desk
>
> The two-pane Week
>
> Phone: Set my days › This week, one day at a time behind the day chips. The pool is a sheet (Pool, From Linear, client filter). Place and Spread stand in for drag.
>
> The Time lens
>
> Phone: the Schedule tab for today, and Set my days' day view for any other day. No lens switch.
>
> The opened day
>
> Phone: a day chip in Set my days opens that day's blocks and tiers. Now shows only today, as designed.
>
> The pipeline
>
> Phone: nothing. Workflow (beta) and the later whole-pipeline view stay at the desk; the pool sheet is the pipeline for now.
>
> Also desk-only
>
> The Next strip with Go (pick A), the week strip, the day column beside Today, keyboard keys, and the browser tab's "Next: …" title.

The cont. strip's card for it (Notes · phone, editing and This week (row 6, cont.) @ x 5302, y 8114, card "Desk-only, drawn once"):

> Desk-only, drawn once
>
> The answers point to frames that exist: Set my days on "USE — set up" and this row's day view, the Schedule tab on "USE — daily use".

## Each answer, and the files that carry it

| Desk-only         | The desk carrier                                                                                                                                             | The phone's answer, carried by                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The two-pane Week | [`../work/week/`](../work/week/index.md) (› Below 1024)                                                                                                      | Set my days › This week on "USE — set up" ([`../set-my-days/set-my-days/index.md`](../set-my-days/set-my-days/index.md), [`the-week.md`](../set-my-days/set-my-days/states/the-week.md)); this row's day view and pool, [`../work/this-week/`](../work/this-week/) ([`the-day.md`](../work/this-week/states/the-day.md)); the pool sheet, Place and Spread: [`../interactions/place-from-the-pool/`](../interactions/place-from-the-pool/index.md), [`../interactions/spread/`](../interactions/spread/index.md); the client filter, [`client-filter.md`](../work/this-week/states/client-filter.md) |
| The Time lens     | [`../work/week/states/time-lens.md`](../work/week/states/time-lens.md)                                                                                       | Today: the Schedule tab, [`../day/schedule/`](../day/schedule/index.md). Any other day: Set my days' day view, [`../set-my-days/set-my-days/states/the-day.md`](../set-my-days/set-my-days/states/the-day.md). No lens switch                                                                                                                                                                                                                                                                                                                                                                        |
| The opened day    | [`../work/today/states/opened-day.md`](../work/today/states/opened-day.md)                                                                                   | A day chip in Set my days ([`../set-my-days/set-my-days/index.md`](../set-my-days/set-my-days/index.md); this row's [`../work/this-week/states/the-day.md`](../work/this-week/states/the-day.md)). Now shows only today                                                                                                                                                                                                                                                                                                                                                                              |
| The pipeline      | Workflow (beta) on the rail ([`../work/overview.md`](../work/overview.md)); the later whole-pipeline view is not in this build (D-USE-104)                   | Nothing; the pool sheet is the pipeline for now (D-USE-55, D-USE-104)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Also desk-only    | The Next strip with Go, the week strip, the day column, keyboard keys and the tab title: [`../work/today/`](../work/today/index.md) and its words and access | None: the phone marks Next by its shade (D-USE-51, D-USE-65); see [`../work/today/`](../work/today/index.md)'s phone rows                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

## What it means for the build

- **One break**: from 1024 up the desk surfaces show; below 1024 the answers above stand in (D-USE-93).
- **"Pick A"** in the note is D-USE-58's pick: no Next strip on the phone (D-USE-51 (1)).
- **The pipeline:** the whole-pipeline view is not in this build, and its shape is a later round (D-USE-104). Workflow (beta) stays desk-only.
- Nothing in this note is drawn twice: each answer points to frames that exist (the cont. card).

## Rulings

- D-USE-55: desk-only, drawn once, the four answers and the also-desk-only list.
- D-USE-57: row 6 extended to the right, which moved this note to x 11086. D-USE-58: locked at x 11086.
- D-USE-93: the one break at 1024. D-USE-104: the whole-pipeline view is not in this build.
