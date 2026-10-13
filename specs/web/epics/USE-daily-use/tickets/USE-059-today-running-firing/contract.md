---
id: "USE-59"
size: small
objective: "The work loop runs on Today at both widths: Start makes the running card counting WORK TIME down from the top of the range, Pause and Resume hold it, Prompt sent or the ring fires an item in place while Next lifts, the firing mark brings it back, Done records \"Took … · fired …\", over the range counts up, everything firing says so, and the reminder line shows while something fires"
slice_type: "the work loop's interactions over the real clock; risks figures faked in the component, two items in hand at once, bringing back restarting work time, a sound or caption on return, and the reminder line showing when nothing fires or everything does"
non_negotiables:
  - "Every figure is clockAt over deriveClock's events, ticked by useWorkClock; nothing counts in component state (README)."
  - "Inside a Work block at most one item has a running work timer (C-USE-today-4)."
  - "Any of the five ways to fire gives one prompt_sent and the same result: in place, work time paused, firing from 1 min (C-USE-firing-1)."
  - "Bringing back never starts work time, plays no sound and shows no caption (C-USE-firing-3, D-USE-44, D-USE-62)."
  - "Firing reads whole minutes, \"1 h 20\" past an hour; only the work clock shows seconds (D-USE-29)."
  - "Composes USE-10's WorkRow, FiringMark and countdown face; firing is rust on grey, running verdigris (D-USE-49); preset tokens only."
devs_call: "File split; where the card's view model is built; how Done's Undo sits (the house Toaster); the live region's placement."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/firing.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/running.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/prompt-sent.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/brought-back.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/paused.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/over-the-range.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/everything-firing.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/working.md"
  - "C-USE-firing-1"
  - "C-USE-firing-3"
  - "C-USE-today-4"
  - "C-USE-today-running-1"
  - "C-USE-today-running-3"
  - "C-USE-today-prompt-sent-1"
  - "C-USE-today-prompt-sent-2"
  - "C-USE-today-brought-back-1"
  - "C-USE-today-brought-back-2"
  - "C-USE-today-paused-1"
  - "C-USE-today-over-the-range-1"
  - "C-USE-today-over-the-range-2"
  - "C-USE-today-everything-firing-1"
  - "C-USE-today-working-2"
  - "D-USE-44"
  - "D-USE-47"
  - "D-USE-48"
  - "D-USE-53"
waiver: "The firing flow, with Today's loop states folded in (running, prompt sent, brought back, paused, over the range, everything firing, working's reminder line): one running card and one firing row, each state holding its own criteria."
truth_files: "none: promotion carries work/today/ and interactions/firing.md"
qa: Q1
reviewers:
  - assay
focus:
  - "running, prompt sent and brought back at 1728 and 402, paused, over the range and everything firing at 402, against work/today/captures/ (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/components/work/"
  - "apps/web/lib/data/use-today-work.ts"
  - "apps/web/lib/data/work-loop.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-059-today-running-firing/evidence/"
depends_on:
  - "USE-4"
  - "USE-5"
  - "USE-7"
  - "USE-8"
  - "USE-10"
  - "USE-23"
  - "USE-55"
  - "USE-57"
out_of_scope:
  - "Step away, Resume all, the ask when Start meets a running item, a session's Done for today: USE-60"
  - "Swipe to fire, the work menu: USE-70; F, D, J, K, Enter: USE-71"
  - "The firing panel in the Item sheet: USE-67"
  - "\"Still firing, from Work\" on the next block's Now (C-USE-firing-2): the Now thread's block forms"
  - "A Linear write on Done: USE-63 (the line) and the Linear wiring"
criteria:
  - id: C1
    statement: "Through useSlotEvents, the ring on a row and Prompt sent on the running card each write one prompt_sent, and the item then reads firing in place with work time paused and Next lifted"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Start on a second item inside the Work block is never written while one runs without the ask; bring back writes brought_back and no started"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "At 1728 and 402, Start shows the running card: WORK TIME counting down from the top of the range, \"left of 2 h · worked 35 min since 9:45\", Pause, Prompt sent and Done; Next is a shaded row in its tier"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-059-today-running-firing/evidence/running.png"
  - id: C4
    statement: "At 1728 and 402, Prompt sent shows two items firing in place with \"worked n min\" in the meta and \"firing · 1 min\", the reminder line \"While it fires: Kegels · daily\" once under the first, and Next lifted"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-059-today-running-firing/evidence/prompt-sent.png"
  - id: C5
    statement: "At 1728 and 402, a brought-back item looks like its tier's other rows with \"fired n min\" and no caption; Done on it shows \"Took 1 h 10 · fired 32 min\", and \"fired\" is left off one that never fired"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-059-today-running-firing/evidence/brought-back.png"
  - id: C6
    statement: "At 402: paused reads WORK TIME · PAUSED, \"paused at 10:40\" and Resume; over the range reads WORK TIME · OVER and \"12 min over\" in warning, danger past a minute; everything firing reads \"Everything is firing.\" over \"To-dos, while it all fires\" with no Next and no reminder line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-059-today-running-firing/evidence/paused-over-everything-402.png"
  - id: C7
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C8
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — today-running-firing

## Build notes

Wave 2, after USE-57. The loop's truth is the event list through `deriveClock`; this screen only writes events and draws the derived clock. Match `ux/work/today/captures/` running, prompt-sent, brought-back (1728, 402), paused, over-the-range and everything-firing (402).

- **Decisions that apply:**
  - D-USE-43: Start makes the running card; Prompt sent (on it, F, or the ring on any row) fires the item; many fire, one is in hand. D-USE-45: while one runs, the running card holds the lift (verdigris edge) and Next is a shaded row.
  - D-USE-44: two clocks per item; Prompt sent pauses work time by itself; bringing back never restarts it. Bring back by tapping the firing mark.
  - D-USE-47: WORK TIME counts down from the top of the range, "left of 2 h · worked 35 min since 9:45"; a fired item keeps "worked n min" while firing and "fired n min" once back; "While it fires: <reminder>" shows once, under the first firing row, from USE-8's `pickWhileItFires`.
  - D-USE-48: done reads "Took <work> · fired <firing>", "fired" left off when it never fired.
  - D-USE-29: past the top, "n min over" counts up in warning, danger at a minute or more; the over card reads "past the top of 2 h · worked 2 h 12 since 9:23".
  - Paused: only that item holds, "paused at <time>", Resume; Step away hides while nothing runs (USE-60).
  - Everything firing: "Everything is firing." with the undone to-dos under "To-dos, while it all fires"; no Next, no reminder line; only the minutes change as it runs long.
  - D-USE-53: the ring's whole 44 × 44 lead slot is the target. Reduced motion holds the firing halo still.
  - Announced (polite): "<title> firing", "<title> back", "Next: <title>".
- **Interfaces:** the tick is USE-23's `useWorkClock(): Date`, one per page; figures are `clockAt(clock, now)`. `RunningWorkCard { view; figures; onPause; onResume; onPromptSent; onDone }` in `components/work/`; `useTodayWork` gains `start`, `pause`, `resume`, `promptSent`, `bringBack`, `done`, each one `useSlotEvents` write. Five ways to fire map to `promptSent`; USE-70 and USE-71 call the same function.
- **Per path:** `work-loop.test.ts` holds C1 and C2 against the fixture server through the real `deriveClock`. Scenarios `today-running`, `today-prompt-sent`, `today-brought-back`, `today-paused`, `today-over`, `today-everything-firing`.
- **Gotchas:**
  - Done on a session is USE-60's "Done for today"; here Done is the task's plain Done on a one-day item.
  - The day's close ends open spans (C11) with nothing drawn; never show a timer past it.
  - A scenario's clock runs from its fixed `now`, so captures are stable.
- **Model:** Opus 5.5 at medium. A smaller model counts in `useState`, restarts work time on bring back, or moves firing rows to their own group.
