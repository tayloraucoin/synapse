---
target: specs/web/ux/interactions/first-wake-loop.md
status: approved
promoted:
boards: [] # the step 0 board is cited, not carried: superseded by the per-surface frames (boards/use-daily-use/step-0.md)
dev_note: ""
rulings:
  [
    D-USE-5,
    D-USE-7,
    D-USE-8,
    D-USE-9,
    D-USE-10,
    D-USE-11,
    D-USE-12,
    D-USE-13,
    D-USE-14,
    D-USE-15,
    D-USE-16,
    D-USE-17,
    D-USE-18,
    D-USE-19,
    D-USE-20,
    D-USE-21,
    D-USE-71,
    D-USE-73,
  ]
---

# The first-wake loop

The critical path of the day, end to end (N1 "The first-wake loop, step by step", refinement 4): Taylor half awake, one thumb, about ten minutes before the cold bath (notes 9–12, 20). Each step is one screen with one primary action, and nothing asks a question that isn't optional. Step 0 on the boards draws it whole at low detail: the artboard "overview / first-wake loop / board / light" (p-3-0, x 0, y 0; row "Row label · step 0"), approved by Taylor (D-USE-21). Its name carries "board" where the convention puts a width, so the coverage index records it as `superseded` by the per-surface frames that redrew each step at full detail (its direction, D-USE-7 to 21, holds for every screen), and this file cites it rather than carrying it; its capture stays at `captures/first-wake-loop-overview-board.png`. Every text on that board, in full: [`../dev-notes/first-wake-loop-board.md`](../dev-notes/first-wake-loop-board.md).

## Where it starts

- On its own, at the first open of the day ([`../day/orient/index.md`](../day/orient/index.md)), after sign-in when signed out (refinement 3).
- A later open re-enters mid-loop: Review the day before Ready, go, Now after it (D-USE-5; [`../day/orient/states/skipped.md`](../day/orient/states/skipped.md)).

## Steps

Paths without a link are planned and written by a later thread of this handoff (the flow table in [`../day/overview.md`](../day/overview.md)); until then the flat intent file `day/<surface>.md` stands.

| # | The person | The app | Board (carried by) |
| --- | --- | --- | --- |
| 0 | Signs in, only when signed out | The auth screen, then back to where the entry tree sends | `auth/sign-in.md` (living truth) |
| 1 | Reads, writes the lines if wanted, taps **Review the day** | Stamps the wake at the open; Orient shows no time; the lines autosave | Board step "1 · orient.md" and branches 1a, 1b; the frames: [`../day/orient/index.md`](../day/orient/index.md) |
| 2 | Looks at today, makes any swap, taps **Ready, go** | Today as a calendar column, bullet grid at 96 px an hour, the To-dos tray, a + in the rail, back as "‹ Orient" (D-USE-7, 10, 11, 15–19) | Board step "2 · review-the-day.md" and branches 2a, 2c, 2d, 2e; [`../day/review-the-day/index.md`](../day/review-the-day/index.md) |
| 2a | Taps a block | Block view, from the day: breadcrumb "Today › Wellness", the block stretched to fill the screen; back by breadcrumb | Not on the board ("step 3, not on this board"); `day/block-view/index.md` |
| 2b | Taps an item, Swap, picks one | The Item sheet's Swap: the library filtered to the item's kind; rows lead with the icon, length and start, then "Ends 8:40" (D-USE-12); "Add one" | Board step "3 · item-sheet.md · swap open"; `day/item-sheet/index.md` (frames on "USE — set up", step 11) |
| 2c | Taps **Ready, go**, then **Start Wellness** | Review the day fades out and a welcome screen in: "The day is set.", "Today, as I see it" read back from Orient when it has words, the day as one bar, First, then the button for the first block (D-USE-71) | `ready-go/index.md` |
| 3 | Taps **Done** on the lifted item | Now: the active block only, the current item lifted with Start and Done, the tray closed (D-USE-7, 26); Done is one tap and records the planned length, with "Took 2 min · Change" for a few seconds (D-USE-13) | Board step "4 · now.md · current item" and branch 4a; `day/now/index.md` |
| 4 | Taps **Start**, later **Done** | Running: counting down from the planned length, then "n min over" (D-USE-29); Done goes back to Now with the next item lifted | Board step "5 · running.md · counting down"; `day/running/index.md` |
| 5 | Finishes the last item, taps **Start** for the next block | Block complete: "Wellness complete", what's next, anything not done to move or leave (D-USE-70); Start goes to Now with the next block active | Board step "6 · block-complete.md · with items not done"; `day/block-complete/index.md` |
| 6 | Through the day | Steps 3 to 5 repeat block by block; a work block runs in go mode (`day/now-work/`, with `../work/today/`); Schedule and the To-dos tray stay a tab and a tap away | `day/now-work/index.md`, `day/schedule/index.md`, `day/todos/index.md` |
| 7 | At night, writes the wind-down journal | The evening close; its three lines are read back on tomorrow's Orient under "Read last night's reflections" (D-USE-30) | `day/close-the-day/index.md` (D-USE-73); read back in [`../day/orient/states/last-night-open.md`](../day/orient/states/last-night-open.md) |

Loops back (the board's footer): Running, Done → Now, next item lifted. Block complete, Start Training → Now, Training active. Swap, pick one → Review the day. A block tapped → Block view.

## Rules

- One primary action per screen, at the foot on focused screens (D-USE-7); a footer action floats on a fade (D-USE-25).
- Nothing asked that isn't optional; never a questionnaire (note 88); never a clock telling Taylor off (note 62): Orient shows no time, lateness shows only as the day's layout.
- Orient shows once a day; the wake is stamped when it opens.
- Orient and Review the day are focused (no tabs); Now, Running and Block complete keep `AppHeader` and `BottomNav` (N4).
- Every step works from cache offline; writes wait and say "Waiting to save" where a `SaveStatus` shows.
- Verdigris only on the current-item dot (board footer, "Direction drawn here").
- No counts, streaks or scores; only lengths and times (product rules, bent where a D-line says).

## The dev note

None on this board as an artboard. The board holds a "Dev note · Make room" as a layer in its branches row; its text is in [`../dev-notes/first-wake-loop-board.md`](../dev-notes/first-wake-loop-board.md), and the root "Dev note · Make room" artboard (x 4338, y 5160) is carried with Review the day.

## Rulings

- **D-USE-7:** the board's direction kept: bullet grid at 96 px an hour, a lifted card with the tray closed on Now, the primary action at the foot.
- **D-USE-8:** the drawing fixture splits the morning: Wellness 7:05 to 8:00, Training 8:00 to 8:57, then Breakfast.
- **D-USE-9, D-USE-14:** Orient's title, reading, links, "Before the day" and the reflections sheet (step 1).
- **D-USE-10:** Review the day's back is a `Breadcrumb` "‹ Orient", top left.
- **D-USE-11, 15, 16, 18, 19:** adding from Review the day: one + in the rail that teaches itself, a drag in 15-minute steps, the add sheet, Make room when there is no room ("Decide for me" bends record 0001, open).
- **D-USE-12:** Swap rows: icon, length and start, then where the block ends.
- **D-USE-13:** Done is one tap with no menu, "Took 2 min · Change".
- **D-USE-17:** reordering by a visible grip; long-press stays the row's menu.
- **D-USE-20:** work tiers are four: Urgent, Primary, Secondary, Stretch.
- **D-USE-21:** the board is approved; its direction holds for every screen.
- **D-USE-5:** the entry tree and Orient's exit.

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-USE-first-wake-loop-1 | The first open of the day, signed in | Orient, then Review the day, then the Ready, go welcome, then Now, each with one primary action | `captures/first-wake-loop-overview-board.png` |
| C-USE-first-wake-loop-2 | Running, Done | Now, with the next item lifted | test |
| C-USE-first-wake-loop-3 | The last item of a block is done | Block complete, whose Start makes the next block active on Now | test |
| C-USE-first-wake-loop-4 | Swap, pick one | Back on Review the day with the item swapped | test |
| C-USE-first-wake-loop-5 | Any step of the loop | No question is required to move on | test |
