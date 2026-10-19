---
target: specs/web/ux/set-my-days/set-my-days/states/usual-week.md
status: approved
promoted:
boards:
  - name: "set-my-days / usual week with Life (B) / 402 / light"
    page: "USE — set up"
    at: [964, 0]
    note: "Frame @ x 964, y 930"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/usual-week-402.png
  - name: "set-my-days / usual week, nothing built / 402 / light"
    page: "USE — set up"
    at: [0, 14000]
    note: "Note · usual week, nothing built"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/usual-week-nothing-built-402.png
  - name: "set-my-days / usual week, Monday built / 402 / light"
    page: "USE — set up"
    at: [482, 14000]
    note: "Note · usual week, Monday built"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/usual-week-monday-built-402.png
rulings: [D-USE-38, D-USE-49, D-USE-79]
---

# Set my days — the usual week (B)

Set my days opened in Usual week: the week as seven rows, with Life and To-dos as kinds beside Work. `?state=usual-week`. Its note is the card "Frame" at x 964, y 930.

## What shows, top to bottom

- Status bar 21:10. "‹ Now" over "Set my days"; "✓ Saved".
- `SegmentedControl`, "Usual week" selected.
- The stepper line: "Every week" (15 px semibold, centred); the ‹ and › are kept in the layout but hidden (opacity 0), so the list does not jump when the switch changes.
- **The seven-day list**, one row each (14 px padding, 20 px sides, a hairline under): the day (17 px semibold), its bounds (13 px muted), a chevron; the strip (8 px tall); one muted line (13 px).

| Row       | Bounds        | Strip, in order                                                                                                           | Line                                                            |
| --------- | ------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Monday    | 7:00 to 22:30 | Orient ink 6, Wellness leaf 34, Training clay 34, Break 18, Work sky 88, Break 34, Work sky 70, open 32, Evening slate 20 | "Evening at 21:30, the wind-down. Work blocks empty"            |
| Tuesday   | 7:00 to 22:30 | as Monday to the second Work, open 2, Life yellow 30, Evening slate 20                                                    | "Life: Climbing [placeholder], 19:00 to 21:00, set"             |
| Wednesday | 7:00 to 22:30 | as Monday                                                                                                                 | "Rest: abs and yoga. Evening at 21:30"                          |
| Thursday  | 7:00 to 22:30 | as Tuesday                                                                                                                | "Life: Dinner with friends [placeholder], 19:00 to 21:00"       |
| Friday    | 7:00 to 22:30 | as Monday to the second Work, To-dos moss 30, open 2, Evening slate 20                                                    | "To-dos: Errands, out, 17:30 to 19:00"                          |
| Saturday  | 8:00 to 23:00 | Orient 6, Wellness leaf 46, Break 10, To-dos moss 60, Break 18, open 70, Life yellow 80, Evening slate 24                 | "To-dos: Errands, out. Life: Out with friends [placeholder]"    |
| Sunday    | All day       | no strip                                                                                                                  | "One checklist, no times. To-dos: Sunday reset, 13:00 to 16:00" |

- Under the list (16 px, 20 px sides, 13 px muted): "Life and To-dos sit beside Work as kinds. Evening is the wind-down only." It sits below the 874 px frame's fold.

Segment widths are the frame's drawing at 402; at build a strip is the day's real shape between its bounds, each block's share of the day kept (the 1024 note). Life's segment is #C9A227 (raw until a token exists; D-USE-79). Friday's moss segment is named "Life [PROPOSED yellow]" in its layer; it draws To-dos, as the line says.

## What the person can do

- Tap a row: that weekday opens in A ([`usual-saturday.md`](usual-saturday.md), [`usual-thursday-evening.md`](usual-thursday-evening.md) draw two).
- "This week": [`the-week.md`](the-week.md). "‹ Now": back.
- An unset weekday reads "Not set yet" with "Set day"; tapping the row opens that weekday on [`empty-first-day.md`](empty-first-day.md) when nothing is built, else on the copy offer ([`copy-offer.md`](copy-offer.md)) once its bounds are set (2026-10-19 feedback; boards passed).
- **Nothing built** (`?state=usual-week-empty`): seven "Not set yet" rows with "Set day", no `SaveStatus`, and under the list "Start with any day. Once one is built, the others can copy it."
- **Monday built** (`?state=usual-week-monday`): Monday as above (bounds, strip, "Wellness, Training, Work. Evening at 21:30"), six "Set day" rows, and under the list "A day not set yet opens on Copy from Monday." (the last built weekday before it, D-USE-85).

## Words

"Every week" · each row's line, above · "Not set yet" · "Set day" · "Start with any day. Once one is built, the others can copy it." · "A day not set yet opens on Copy from <weekday>." · "Life and To-dos sit beside Work as kinds. Evening is the wind-down only." [ASSUMPTION: a framing hint for the round; not a product string unless kept by Gloss].

## The notes on the boards

**"set-my-days / usual week with Life (B) / 402 / light"**, "Frame" @ x 964, y 930:

> Usual week with Life
>
> [PROPOSED] Life (rose) and To-dos (moss) sit in the strips like Work: Tuesday climbing and Thursday dinner are Life; Friday and Saturday errands and Sunday's reset are To-dos. Evening is the last hour every day.

## Rulings

- Open-3 round 2, B then A: Set my days opens on the week under D-USE-49 (the lock).
- Life is yellow, a ninth hue with dark values and its named 2.3:1 exception (D-USE-38, D-USE-79); the note's "rose" is the earlier name, carried as written. To-dos is moss.
- Open-4 "Life and chores": Life is a kind with Work's standing (Set, or From to-dos); chores and errands are to-dos, done in a To-dos block. Evening is the wind-down only. Round 3: Where became Type (Home, Errand, Call, Digital, Other); blocks never filter by Type (round 4). Dev note: `../../../dev-notes/life-and-todos.md`.

## Widths

Drawn at: 402. At 1024 this list is the week pane (320), the strips scaled to it (D-USE-39 (3), D-USE-83), as [`the-day.md`](the-day.md) draws for This week.

## Criteria

| ID                             | When                               | Then                                                                                    | Evidence                      |
| ------------------------------ | ---------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------- |
| C-USE-set-my-days-usual-week-1 | Usual week is shown                | "Every week", seven rows, each with bounds, a strip in kind colours and a line in words | `captures/usual-week-402.png` |
| C-USE-set-my-days-usual-week-2 | A row's line                       | Names kinds and blocks; never a count                                                   | `captures/usual-week-402.png` |
| C-USE-set-my-days-usual-week-3 | Switching Usual week and This week | The list does not jump (the stepper's arrows hold their place)                          | manual                        |
| C-USE-set-my-days-usual-week-4 | No weekday is built                | Seven rows read "Not set yet" with "Set day"; no row offers Copy from                     | `captures/usual-week-nothing-built-402.png` |
| C-USE-set-my-days-usual-week-5 | One weekday is built               | Unset rows keep "Set day"; the hint names the day an unset day would copy                 | `captures/usual-week-monday-built-402.png` |
| C-USE-set-my-days-usual-week-6 | An unset row is tapped             | That weekday opens; its URL is `?week=usual&day=<mon…sun>`                                 | test                          |
