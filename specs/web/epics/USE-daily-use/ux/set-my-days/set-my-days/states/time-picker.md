---
target: specs/web/ux/set-my-days/set-my-days/states/time-picker.md
status: approved
promoted:
boards:
  - name: "set-my-days / time picker open, Up at / 402 / light"
    page: "USE — set up"
    at: [1446, 14000]
    note: "Note · time picker open, Up at"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/time-picker-402.png
  - name: "set-my-days / first week, picker open (popover) / 1024 / light"
    page: "USE — set up"
    at: [2410, 14000]
    note: "Note · first week, picker open (popover) / 1024"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/time-picker-1024.png
rulings: [D-USE-28, D-USE-39, D-USE-83]
---

# Set my days — the time picker

The house's 24-hour picker for "Up at" and "Lights out", open on Up at over the empty first day. `?state=time-picker` (402: the sheet; at 1024 the same param opens the popover). New with the 2026-10-19 feedback (boards passed by Taylor, 2026-10-19). It bends Epic 1 §0.3 ("the native picker on both platforms", `TimeField`'s header) on Taylor's word: the browser's own picker ignored the tokens and was never drawn. Since Taylor's review of 2026-10-19 (USE-142) it is every time field's picker, not only the bounds': `TimeField` holds it, so New block Starts and Ends, the block view's Set a time, the add-event sheet and popover, the item sheet's time, the to-do reminder and the checklist editor open the same sheet or popover, each field reading a compact "7:05".

## What shows

**Closed** (every `TimeField` on the surface): the label above, the field (48 px stacked on the first day; 32 px compact in the day line) with the time typeable as "7:00" (24-hour, no leading zero) and the clock glyph at the trailing edge as its own 44 px button.

**Open, 402** (a bottom `Drawer`, `ResponsiveSheet`'s phone form), over a scrim:

- A grabber; the field's label, muted 13 px, "Up at"; under it the readout "6:30" (26 px semibold, tabular); the × (44 px, "Close") at the trailing edge.
- Two columns side by side, each labelled above: **Hour**, 0 to 23, and **Minute**, 00 to 55 in steps of 5. Each is a list window (hairline border, `--radius-control`, five 46 px rows shown) scrolled to the value. The picked row is filled ink with the label in the background colour, semibold, and a check: never colour alone. Other rows are muted.
- Muted: "24-hour. Any minute can be typed in the field."
- `Button` primary, full width, 48 px: "Done".

**Open, 1024** (D-USE-39, D-USE-83): the same body in a `Popover` under the field, 320 wide, `--radius-sheet`, hairline border, no shadow, no readout (the field above shows the time), no ×.

The field updates as the lists move ("6:30" in ink), and on the first day so does the forward button ("Set Monday, 6:30 to 22:30").

## What the person can do

- Pick an hour and a minute (tap, or keys). **Done** keeps the time; **×**, Escape or a tap outside closes and puts back the time it opened with. Focus returns to the clock button.
- Type any minute in the field ("7:03" stays 7:03); the minute list then shows no pick until a step is chosen [ASSUMPTION].
- Where a field has bounds (`min`, `max`), hours and minutes outside them are shown disabled, never hidden [ASSUMPTION; Set my days' bounds have none].

## Words

"Up at" · "Lights out" · "Hour" · "Minute" · "24-hour. Any minute can be typed in the field." · "Done" · "Close" · "Choose a time for <label>" (the clock button's name).

## Access

- The clock is a button, "Choose a time for Up at", `aria-haspopup="dialog"`, `aria-expanded`. The sheet and the popover are dialogs named by the label, focus trapped while open.
- Each column is a `listbox` named "Hour" or "Minute"; options are "6" and "30" with `aria-selected`. Arrow keys move one, Page Up and Down move five, Home and End go to the ends, digits type ahead; focus opens on the picked hour. Tab goes Hour, Minute, Done.
- The readout and the field change politely; the screen reader hears "Up at, 6:30" on Done.
- Targets: rows 46 px, the × and the clock 44 px, Done 48 px. Reduced motion: the lists jump to the value, no smooth scroll.

## Rulings

- Feedback 2026-10-19 (fix 3): a 24-hour picker on `preset.css` tokens, in a popover or sheet, after checking shadcn and `@syn/ui`. Checked 2026-10-19 [Secondary]: shadcn/ui ships no time picker; community registry ones (Dice UI's, 21st.dev listings) exist, unverified. `@syn/ui` already has `Popover`, `Drawer` and `ResponsiveSheet` (radix-ui, vaul), so it needs no new dependency.
- D-USE-28: menus and overlays read as shadcn's (background token, hairline border).

## Widths

Drawn at: 402 (sheet) and 1024 (popover). 768 to 1023 keep the phone's sheet (D-USE-83).

## Criteria

| ID                              | When                                 | Then                                                                                   | Evidence                       |
| ------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------ |
| C-USE-set-my-days-time-picker-1 | The clock is pressed at 402          | A sheet: label, readout, Hour 0 to 23 and Minute by 5, the pick filled with a check, Done | `captures/time-picker-402.png`  |
| C-USE-set-my-days-time-picker-2 | The clock is pressed at 1024         | The same lists in a popover under the field                                             | `captures/time-picker-1024.png` |
| C-USE-set-my-days-time-picker-3 | Keyboard only                        | Arrows, Home/End and digits move each list; Done keeps; Escape restores; focus returns to the clock | test                    |
| C-USE-set-my-days-time-picker-4 | A screen reader                      | Two listboxes named Hour and Minute, the pick announced as selected                    | test                           |
| C-USE-set-my-days-time-picker-5 | Any minute is typed in the field     | It is kept as typed; the picker never rounds it                                        | test                           |
