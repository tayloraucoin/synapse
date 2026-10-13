---
target: specs/web/ux/work/today/states/running.md
status: approved
promoted:
boards:
  - name: "today / running, work clock, add menu / 1728 / light"
    page: "USE — work"
    at: [1808, 0]
    note: "Note · today / running"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/running-1728.png
  - name: "phone-today / running, work time, step away / 402 / light"
    page: "USE — work"
    at: [964, 5760]
    note: "Notes · phone, Today (row 5) @ x 964"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/running-402.png
rulings: [D-USE-42, D-USE-44, D-USE-46, D-USE-47, D-USE-49, D-USE-51, D-USE-52]
---

# Today — running (the work clock)

## What shows, top to bottom

**Desk (1728, 10:20):** the header gains **Step away** (pause glyph, quiet button) left of + Add (D-USE-46). The Next strip names [Appointment reminders: SMS copy] (its tier word and Go sit under the open menu). In Primary, [Portal sign-in] fires in place ("firing · 4 min") with the reminder line; [Case studies] is the **running card**: a 1.5 px verdigris edge, the 22 px emoji and title, the full meta, then "WORK TIME" (verdigris small caps), the clock "1:24:10" in the large figure style, "left of 2 h · worked 35 min since 9:45", and on the right **Pause** (outline), **Prompt sent** (`--color-surface` with a clay edge and dot, `--color-red-700` words) and **Done** (ink). In Secondary, the SMS copy is Next as a shaded row (no card). The **+ Add menu** is open under its button (shadcn `DropdownMenu`): "Task to a tier" T, "From the pool" P, "To-do" D, "Event" E, each with a leading icon, a rule before Event ([add](../../../interactions/add/index.md)).

**Phone (402):** the Work header shows the **Step away** pill beside ··· (D-USE-52). The running card spans the column: WORK TIME, the clock, "left of 2 h · worked 57 min since 9:23", and Pause, Prompt sent and Done at 84 / fill / 84 (D-USE-51). Next is the shaded row below.

## What the person can do

Pause (holds this item, [paused](paused.md)); Prompt sent (pauses work time, starts firing, [prompt sent](prompt-sent.md)); Done (records "Took …"); Step away ([step-away](../../../interactions/step-away.md)); Start on another item asks first ([start-while-one-runs](../../../interactions/start-while-one-runs.md)); + Add.

## Words

"Step away"; "WORK TIME"; "1:24:10"; "left of 2 h · worked 35 min since 9:45"; "Pause", "Prompt sent", "Done"; menu: "Task to a tier", "From the pool", "To-do", "Event".

## The notes on the boards

**Note · today / running** — today / running, work clock, add menu / 1728 / light — rounds 3 and 5 (D-USE-42, D-USE-44, D-USE-46)

Start turns the lifted card into the running card, edged in verdigris (Taylor's hands). Its clock is WORK TIME: it runs only while the item is in Taylor's hands (Start, Pause, Resume) and still counts down from the top of the range ("1:24:10 left of 2 h · worked 35 min since 9:45"; past it, "n min over" in the D-USE-29 colours). Prompt sent is grey with a rust edge and dot, the colour of waiting on AI (D-USE-49); it pauses work time and starts firing time on the row (next frame). [Portal sign-in] fires in place in Primary: rust dot in a grey halo, "firing · 4 min" in dark rust. Next is the SMS copy: while something runs, the running card holds the lift, so Next is a grey-shaded row in its own tier, plus the strip. "Step away" sits in the header only while a work timer runs (the last frame in this row). "+ Add" is the shadcn DropdownMenu: Task to a tier, From the pool, To-do, Event; T, P, D, E [PROPOSED].

**Notes · phone, Today (row 5) @ x 964** — Running, work time, Step away

Start makes the running card, verdigris edge: WORK TIME counts down from the top of the range, "left of 2 h · worked 57 min since 9:23". Pause, Prompt sent (grey, clay edge and dot, dark rust words) and Done at 84 / fill / 84. Step away sits in the block header beside ···, only while a work timer runs. Next is the shaded row.

## Rulings

- D-USE-42: Start makes the running card, counting down from the top of the range (D-USE-27, D-USE-29).
- D-USE-44, D-USE-47: the clock is work time only, labelled WORK TIME, "worked n min since 9:45" under it.
- D-USE-45: while an item runs, the running card holds the lift; Next is a shaded row.
- D-USE-46, D-USE-52: Step away only while a work timer runs; on the phone a pill beside ···.
- D-USE-49: Prompt sent in rust on grey; verdigris only for Taylor's hands.
- D-USE-51: phone buttons at 84 / fill / 84.
- [PROPOSED] the menu's T, P, D, E shortcuts (note). D also means Done on a focused row (D-USE-62); inside the open menu D picks To-do.

## Widths

Drawn at 1728 and 402.

## Criteria

| ID                    | When                     | Then                                                                         | Evidence                    |
| --------------------- | ------------------------ | ---------------------------------------------------------------------------- | --------------------------- |
| C-USE-today-running-1 | Start on the lifted card | It becomes the running card; WORK TIME counts down from the top of the range | `captures/running-1728.png` |
| C-USE-today-running-2 | A work timer runs        | Step away shows (desk header; phone block header); it hides when none runs   | `captures/running-402.png`  |
| C-USE-today-running-3 | Running                  | Next is a shaded row in its tier, not a card                                 | capture                     |
