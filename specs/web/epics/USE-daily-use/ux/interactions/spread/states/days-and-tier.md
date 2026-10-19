---
target: specs/web/ux/interactions/spread/states/days-and-tier.md
status: approved
promoted:
boards:
  - name: "this-week / spread, days and tier / 402 / light"
    page: "USE — work"
    at: [9158, 7200]
    note: "Notes · phone, editing and This week (row 6, cont.) @ x 9158"
    capture: specs/web/epics/USE-daily-use/ux/interactions/spread/captures/days-and-tier-402.png
rulings: [D-USE-54, D-USE-57, D-USE-58]
---

# Spread — days and tier (phone)

Step 2b of [`../index.md`](../index.md): "Days and tier" on Spread's full sheet ([`across-the-week/402.md`](across-the-week/402.md)) opens this sub-page inside the sheet. `?state=spread-days`.

## What shows, top to bottom

**Phone (402, 21:10):**

- Behind, under the scrim: "‹ Week" and "Pool" (title) [ASSUMPTION: the screen Spread was opened over; the frame was drawn over the pool].
- The sheet from y 200 (674 tall), a grabber.
- "‹ Spread across the week" (body, the back row) over "Days and tier" (title, 600).
- **Days** (600): one 52 px row per weekday on a hairline, a 20 px checkbox, the day, and muted on the right its free time in the chosen block:
  - ☐ "Mon 12" · "today, already past 9:30"
  - ☑ "Tue 13" · "2 h 10 free in the morning"
  - ☑ "Wed 14" · "2 h 30 free"
  - ☑ "Thu 15" · "2 h 30 free"
  - ☑ "Fri 16" · "2 h free"
- **Tier, every session** (600): a four-way segmented control, each a 7 px square with its word: Urgent, Primary, **Secondary** (selected, 600), Stretch.
- **Done** (primary, ink, full width, 48 tall).

## What the person can do

- **A day:** tick or untick; the preview's rows and the carry line follow on return.
- [ASSUMPTION] Mon 12 cannot be ticked: its Morning Work has begun, said in words beside it (as the desk's dashed Monday).
- **Tier:** one tier for every session.
- **Done** or **‹ Spread across the week:** back to the preview, with the picks kept [ASSUMPTION: picks apply as made; there is no cancel on this page].

## Words

"‹ Spread across the week" · "Days and tier" · "Days" · "<Day> <date>" · "today, already past <time>" · "<length> free in the morning" · "<length> free" · "Tier, every session" · "Done". Free time is a length, never a count or a percentage.

## The notes on the boards

**Notes · phone, editing and This week (row 6, cont.) @ x 9158** — Spread, days and tier

> Spread's sub-page: each day with its free time in the chosen block, and one tier for every session. Back returns to the preview.

## Rulings

- D-USE-57: Spread's Days and tier page. D-USE-54, D-USE-58: Spread on the phone is a full sheet; locked.
- [ASSUMPTION] Sat and Sun are not listed: no Work blocks. Only the first row names the block ("in the morning"); the rest drop it as read on [placeholder] sample data.
- [ASSUMPTION] With "Pick per day", each day row also names its block and opens a choice of that day's Work blocks; not drawn.

## Widths

Drawn at 402. From 1024 Days and Tier are fields of the dialog itself, no sub-page ([`across-the-week/1728.md`](across-the-week/1728.md); D-USE-93).

## Access

The back row is a button named "Back to Spread across the week"; focus lands on the title when the page opens and returns to the "Days and tier" row on Done [ASSUMPTION]. Each day is a checkbox labelled "Tuesday 13, 2 hours 10 free in the morning"; Mon 12 is disabled with its words as its description. Tier is a radio group, each square with its word. Rows 52 tall.

## Criteria

| ID                           | When                 | Then                                                                                                           | Evidence                            |
| ---------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| C-USE-spread-days-and-tier-1 | Days and tier opened | Each weekday with its free time in the chosen block; today, once its block has begun, not offered and says why | `../captures/days-and-tier-402.png` |
| C-USE-spread-days-and-tier-2 | A day unticked, Done | The preview drops that day's session; the carry line grows                                                     | test                                |
| C-USE-spread-days-and-tier-3 | A tier picked        | Every session goes into that tier                                                                              | test                                |
