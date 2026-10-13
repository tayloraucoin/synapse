---
target: specs/web/ux/set-my-days/set-my-days/states/the-week.md
status: approved
promoted:
boards:
  - name: "set-my-days / this week, the week (B) / 402 / light"
    page: "USE — set up"
    at: [2410, 0]
    note: "Note · grid, 96"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/the-week-402.png
rulings: [D-USE-39, D-USE-49]
---

# Set my days — this week, the week (B)

The surface's opening view in This week: the dated week as seven rows. `?state=the-week`. Its note is "Note · grid, 96" at x 2410, y 930.

## What shows, top to bottom

- Status bar 21:10. "‹ Now" over "Set my days"; "✓ Saved".
- `SegmentedControl`, "This week" selected.
- The stepper: "‹" (44 × 32), "12 to 18 Oct" (15 px semibold, centred), "›".
- **The seven-day list**, rows as [`usual-week.md`](usual-week.md) has them, dated:

| Row    | Bounds        | Strip                                                | Line                                                           |
| ------ | ------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| Mon 12 | 7:00 to 22:30 | Orient, Wellness, Training, Break, Work, Break, Work | "Primary: [Write the sync spec], [Review the Paper handoff]"   |
| Tue 13 | 7:00 to 22:30 | as Monday                                            | "No work slotted yet"                                          |
| Wed 14 | 7:00 to 22:30 | as Monday                                            | "Rest: abs and yoga. No work slotted yet"                      |
| Thu 15 | 7:00 to 22:30 | as Monday                                            | "Dentist at 14:00 [placeholder]. No work slotted yet"          |
| Fri 16 | "Not set yet" | none                                                 | a "Copy from…" outlined button (32 px) in place of the chevron |
| Sat 17 | "Not set yet" | none                                                 | "Copy from…"                                                   |
| Sun 18 | All day       | none                                                 | "One checklist, no times"                                      |

- Under the list (13 px muted): "Tap a day to open it on the time column."

## What the person can do

- Tap a row: the day opens in A ([`the-day.md`](the-day.md)).
- "Copy from…" on a not-set row: Copy from's picker for that date ([`../../../interactions/copy-from/states/copy-picker.md`](../../../interactions/copy-from/states/copy-picker.md)).
- ‹ and › step a week; "Usual week": [`usual-week.md`](usual-week.md); "‹ Now": back.
- On the phone the pool and From Linear open as a sheet over This week (D-USE-54) [not drawn on this page; the phone work rows on "USE — work" carry it].

## Words

"12 to 18 Oct" · "Mon 12" … "Sun 18" · "No work slotted yet" · "Not set yet" · "Copy from…" · "One checklist, no times" · "Tap a day to open it on the time column."

## The notes on the boards

**"set-my-days / this week, the week (B) / 402 / light"**, "Note · grid, 96" @ x 2410, y 930:

> The week (B), This week
>
> [PROPOSED] B then A: Set my days opens on the week and a day opens in A (bends N2's "opens on today's weekday"). This week steps by "12 to 18 Oct". Each row says what's still to do in words, "No work slotted yet", never a count. Not-set days offer Copy from.

## Rulings

- Open-3 round 2, B then A, stands as drawn under D-USE-49 (the lock); it bends N2's "opens on today's weekday".
- Superseded, not carried as a state: **"set-my-days / B: seven-day list first / 402 / light"** (Archive, x 482, y 11340), ruled by D-USE-49 (the lock; open-3 round 2: the week (B) then the day (A)). Its note, "Note · name only, 80" @ x 482, y 12270:

  > B · a seven-day list first
  >
  > The week as rows, each with its bounds, a strip of its blocks in their colours, and the blocks by name; unset days offer Copy from. Easier to see the whole week at once, but every edit is one level deeper and switching days means going back. Its strip could live in A as a later idea.

  Round 2 answered "switching days means going back" with dated chips on the day (A).

## Widths

Drawn at: 402. At 1024 this list is the fixed 320 week pane beside the day, a day always selected ([`the-day.md`](the-day.md), D-USE-39 (3), D-USE-83).

## Criteria

| ID                           | When                      | Then                                                                   | Evidence                    |
| ---------------------------- | ------------------------- | ---------------------------------------------------------------------- | --------------------------- |
| C-USE-set-my-days-the-week-1 | This week is shown        | "12 to 18 Oct" with the steppers, seven dated rows, each line in words | `captures/the-week-402.png` |
| C-USE-set-my-days-the-week-2 | A day has no work slotted | Its line says "No work slotted yet"; no count anywhere                 | `captures/the-week-402.png` |
| C-USE-set-my-days-the-week-3 | A day not set             | "Not set yet" with "Copy from…"                                        | `captures/the-week-402.png` |
