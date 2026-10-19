---
size: small
objective: "Five drawn states wave 2 left unowned work on fixtures: the quiet line before the first block begins, Review the day's Copy another day, the To-do sheet's Repeats › Custom…, Still firing from Work on the next block's Now, and the Journal row that opens Close the day and ticks itself"
slice_type: "three small UI gaps found by the pre-flight; risks a verdigris 'this moment' dot before the block has begun, a link that dead-ends on an empty morning, and a to-do rule stored differently from a block's"
non_negotiables:
  - "Only @syn/ui components and preset tokens."
  - "Custom… reuses USE-47's custom repeat step and stores one RFC 5545 rule on the to-do, as a block does (D-USE-80)."
  - "Copy another day reuses USE-45's CopyPicker for today's date; no second picker."
  - "Before the first block begins, the card's dot is hollow and the line reads as the state file says; nothing reports lateness."
  - "Firing work is never lost from sight: an item still firing when its Work block ends shows on the next block's Now with Bring back and Done."
  - "The Journal row opens the journal, never the Item sheet, and ticks only when something is written; an empty journal leaves it unticked with no missed state."
  - "Every state is reachable by ?state=."
devs_call: "Which file each change lands in; scenario names."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/ready-go/states/not-yet-started.md"
  - "C-USE-ready-go-not-yet-started-1"
  - "C-USE-ready-go-not-yet-started-2"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/sunday-nothing-set.md"
  - "C-USE-review-the-day-sunday-nothing-set-1"
  - "specs/web/epics/USE-daily-use/ux/day/todo-sheet/states/repeats-open.md"
  - "C-USE-todo-sheet-repeats-open-1"
  - "C-USE-todo-sheet-repeats-open-2"
  - "specs/web/epics/USE-daily-use/ux/interactions/firing.md"
  - "C-USE-firing-2"
  - "specs/web/epics/USE-daily-use/ux/day/close-the-day/built-and-words.md"
  - "C-USE-close-the-day-1"
  - "C-USE-close-the-day-2"
  - "specs/web/epics/USE-daily-use/ux/day/close-the-day/states/empty.md"
  - "C-USE-close-the-day-empty-2"
waiver: "five small gaps the pre-flight found between built tickets (USE-43, USE-45, USE-47 with USE-28, USE-59, USE-44); a ticket each would be thinner than its thread"
truth_files: "none: the three areas are promoted with USE"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/now/"
  - "apps/web/app/(shell)/today/review/"
  - "apps/web/components/planner/"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
depends_on:
  - "USE-89"
  - "USE-16"
  - "USE-17"
  - "USE-28"
  - "USE-40"
  - "USE-44"
  - "USE-45"
  - "USE-47"
  - "USE-48"
  - "USE-59"
out_of_scope:
  - "The rest of each surface: built by USE-16, USE-17, USE-43, USE-44, USE-45, USE-28, USE-47 and USE-59"
  - "The Journal tick read live: USE-96"
criteria:
  - id: C1
    statement: "Before the first block begins, Now's card shows a hollow dot and the quiet line 'Starts at 7:05. Anything can be done early.'"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-110-wave-2-loose-ends/evidence/ready-go-not-yet-started-402.png"
  - id: C2
    statement: "On Review the day with nothing set, Copy another day opens the copy picker for today, and choosing a day copies it with Undo"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The To-do sheet's Repeats lists Custom…, which opens the custom step and stores one rule on the to-do"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "When the block's time arrives, the not-yet-started dot fills verdigris"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "Work ends with an item firing: the next block's Now shows 'Still firing, from Work' with Bring back and Done"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-110-wave-2-loose-ends/evidence/firing-still-firing-402.png"
  - id: C7
    statement: "On Now and in Block view, the Wind-down block's Journal row opens /day/{date}/journal; a field written there ticks the row, and an empty journal leaves it unticked"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
id: USE-110
---

# Contract — wave-2-loose-ends

## Build notes

Vigil's pre-flights (2026-10-16): each state was handed between two built tickets and built by neither.

- **Not yet started** (`ready-go/states/not-yet-started.md`): USE-43 sent it to "Now's tickets", and none of them builds it. Without it, USE-16's card shows the verdigris "this moment" dot before the block has begun. Draw a hollow dot and the state file's line, with its time from the first block.
- **Copy another day** (`copy-from/index.md`, D-USE-68): "Review the day's day with nothing set carries 'Copy another day', which opens this flow", the picker for today's date. USE-40 and USE-45 each left the landing to the other. Open USE-45's `CopyPicker` with today as the target, from `sunday-nothing-set`'s link.
- **Custom…** (`todo-sheet/states/repeats-open.md`): USE-28 ends its list at "Every month" and leaves Custom… to USE-47, which built it for blocks only. Add the option to the To-do sheet's Repeats, open USE-47's custom step, and write the rule through `updateTodo`'s `rrule`.
- **Still firing** (`interactions/firing.md`, C-USE-firing-2, D-USE-57): USE-59 sent it to "the Now thread's block forms", and USE-17 neither cites nor builds it. Derive it from the clock: a `prompt_sent` with no Bring back or Done, whose block has ended, shows on the current block's Now as its own row.
- **The Journal row** (`close-the-day/index.md`'s entry, DYN-18): USE-44 sent the row's link and its tick to Now's and Block view's tickets, and none built them. The row opens `journalRoute(date)`; its tick follows whether the day's journal has any answer (fixtures here, USE-96 live).
- **Per path:** one test file per criterion under `lib/data/`; scenarios `ready-go-not-yet-started`, `review-nothing-set-copy`, `todo-repeats-custom`, `firing-still-firing` and `wind-down-journal`.
- **Model:** Opus 5.5 at medium.
