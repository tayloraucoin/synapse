---
target: specs/web/ux/work/today/states/working.md
status: approved
promoted:
boards:
  - name: "today / working, firing in place / 1728 / light"
    page: "USE — work"
    at: [0, 0]
    note: "Note · today / working"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/working-1728.png
  - name: "phone-today / A: working, firing in place, rec. / 402 / light"
    page: "USE — work"
    at: [0, 5760]
    note: "Notes · phone, Today (row 5) @ x 0"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/working-402.png
not_picked:
  - name: "phone-today / B: Next strip kept / 402 / light"
    ruled: D-USE-51
rulings: [D-USE-44, D-USE-45, D-USE-47, D-USE-48, D-USE-49, D-USE-51]
---

# Today — working (one firing, Next lifted)

The base state of the work loop: nothing in Taylor's hands, one item firing in place. Also the intent states "tiers" and "nothing firing" (N4, N6) and the Linear row.

## What shows, top to bottom

**Desk (1728, 10:20):** the layout in [`../index.md`](../index.md) with: the header without Step away (no timer runs, D-USE-46); the Work band; the Next strip naming "[Case studies: write the Alder intro]", "Primary", Go. **Primary:** "[Portal sign-in: magic link flow]" firing in place: the breathing mark (a `--color-category-clay-dot` dot in a `--color-fill-muted` halo, the halo breathes), the title and meta receded, "firing · 4 min" right in `--color-red-700` (D-USE-49). Under it, once: "While it fires: Kegels · daily" with its checkbox. Then the lifted Next card for [Case studies] (meta "Alder Studio · Brand site · ALD-17 · High · 3 Medium · 1 to 2 h · Copy · session 1 of 3", **Start** and **Done**). **Secondary:** [Appointment reminders: SMS copy] (KES-51, "30 to 60 min"), [Synapse: desk Today layout] ("2 to 4 h", session 1 of 3) with two sub-issue checkboxes, one checked. **Stretch:** [Invoice template refresh] ("No Linear", "15 to 30 min"). **To-dos:** Kegels ("daily · 14:00"), Hip and hamstring stretch (checked, "daily · 10:00"), [Call the mechanic] ("Call"). Day column: Training, Breakfast, Work 9:30 to 12:00 with 11:00 [Kestrel weekly] in plum, Lunch, Work 13:00 to 15:00, Stretch break, Work 15:10 to 17:00; the NowLine at 10:20.

**Phone (402):** the same items trimmed (D-USE-51): firing row with "firing" over "5 min", the reminder line, the lifted Next card full width with Start and Done, Secondary rows, the sub-issues folded as "› 2 sub-issues · 1 done". No Next strip.

## What the person can do

Start or Done on the card; the ring on any work row (or F, or swipe on the phone) fires it ([firing](../../../interactions/firing.md)); the firing mark brings it back; check the reminder or a to-do; open a row's sheet; + Add.

## The notes on the boards

**Note · today / working** — today / working, firing in place / 1728 / light — round 5 (D-USE-44, D-USE-45, D-USE-47)

No Firing group. [Portal sign-in] fires in its own tier and place: the ring becomes the breathing mark (a rust dot in a grey halo that breathes), the title and its meta recede, and "firing · 4 min" sits on the right in dark rust (D-USE-49). The daily reminder line ("While it fires: Kegels") sits under the first firing row in order. Next is [Case studies]: nothing is in Taylor's hands, so Next lifts as the card with Start and Done, shaded light grey with no border (D-USE-45, D-USE-49); the Next strip under the header names it too. Hover on any task row shows the same light grey shade. No Step away here: no work timer is running (D-USE-46). Every emoji has its own 18 px slot with a 7 px gap (22 px on the 17 px card title). [ASSUMPTION] Project icons come from Linear's project icon; not verified. Bends: N4 note 56 at the desk only.

**Notes · phone, Today (row 5) @ x 0** — A, working, firing in place · recommended

Pick: no Next strip on the phone. Next is the shaded row, or the lifted card with Start and Done when nothing is in hand, in its own tier. The strip repeats that row, costs 48 px above the running card, and Go is a desk key. Rows trim to 402: client tile, project emoji in its 18 px slot, ID, priority chip, size chip; client and project names and labels move to the item sheet. Firing reads on the right in two lines, "firing / 5 min", dark rust. + in the header opens Add.

## Rulings

- D-USE-44, D-USE-47, D-USE-49: firing stays in its tier and place; the row changes; rust on grey, never verdigris.
- D-USE-45, D-USE-49: Next lifts as the shaded card with no border; rows get 12 px vertical padding inside the shade; size chips inside it switch to `--color-background`.
- [PROPOSED] (Open, rounds 5 and 6) Hover and Next share one shade; if they ever need to differ, Next takes `--color-fill-muted`.
- D-USE-48: emoji slots.
- D-USE-51: the phone trims rows and drops the strip.
- Not picked: "phone-today / B: Next strip kept" (x 482). Its card: "The desk's strip at 402: NEXT, emoji, title, Go. It repeats the lifted card one screen-third away and pushes Secondary down. Not picked." (D-USE-51, D-USE-58).

## Widths

Drawn at 1728 and 402. 1024 and 1440: [`../../overview.md`](../../overview.md) breakpoint.

## Criteria

| ID                    | When                                           | Then                                                                                      | Evidence                    |
| --------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------- |
| C-USE-today-working-1 | One item firing, none running                  | It stays in its tier and place with the mark and "firing · n min"; Next lifts as the card | `captures/working-1728.png` |
| C-USE-today-working-2 | A daily reminder is undone and something fires | "While it fires: <reminder>" shows once, under the first firing row                       | capture                     |
| C-USE-today-working-3 | Phone                                          | No Next strip; meta trimmed to tile, emoji, ID, priority, size                            | `captures/working-402.png`  |
