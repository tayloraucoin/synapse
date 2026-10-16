---
size: small
objective: "Three drawn states wave 2 left unowned now work on fixtures: the quiet line before the first block begins, Review the day's Copy another day opening the picker for today, and the To-do sheet's Repeats › Custom…"
slice_type: "three small UI gaps found by the pre-flight; risks a verdigris 'this moment' dot before the block has begun, a link that dead-ends on an empty morning, and a to-do rule stored differently from a block's"
non_negotiables:
  - "Only @syn/ui components and preset tokens."
  - "Custom… reuses USE-47's custom repeat step and stores one RFC 5545 rule on the to-do, as a block does (D-USE-80)."
  - "Copy another day reuses USE-45's CopyPicker for today's date; no second picker."
  - "Before the first block begins, the card's dot is hollow and the line reads as the state file says; nothing reports lateness."
  - "Every state is reachable by ?state=."
devs_call: "Which file each change lands in; scenario names."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/ready-go/states/not-yet-started.md"
  - "C-USE-ready-go-not-yet-started-1"
  - "C-USE-ready-go-not-yet-started-2"
  - "specs/web/epics/USE-daily-use/ux/interactions/copy-from/index.md"
  - "C-USE-copy-from-1"
  - "specs/web/epics/USE-daily-use/ux/day/todo-sheet/states/repeats-open.md"
  - "C-USE-todo-sheet-repeats-open-1"
  - "C-USE-todo-sheet-repeats-open-2"
waiver: "three one-criterion gaps the pre-flight found between built tickets (USE-43, USE-45, USE-47 with USE-28); a ticket each would be thinner than its thread"
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
out_of_scope:
  - "The rest of each surface: built by USE-16, USE-43, USE-45, USE-28 and USE-47"
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
  - id: C4
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
id: USE-110
---

# Contract — wave-2-loose-ends

## Build notes

Vigil's pre-flight (2026-10-16), blocking findings 2 to 4: each state was handed between two built tickets and built by neither.

- **Not yet started** (`ready-go/states/not-yet-started.md`): USE-43 sent it to "Now's tickets", and none of them builds it. Without it, USE-16's card shows the verdigris "this moment" dot before the block has begun. Draw a hollow dot and the state file's line, with its time from the first block.
- **Copy another day** (`copy-from/index.md`, D-USE-68): "Review the day's day with nothing set carries 'Copy another day', which opens this flow", the picker for today's date. USE-40 and USE-45 each left the landing to the other. Open USE-45's `CopyPicker` with today as the target, from `sunday-nothing-set`'s link.
- **Custom…** (`todo-sheet/states/repeats-open.md`): USE-28 ends its list at "Every month" and leaves Custom… to USE-47, which built it for blocks only. Add the option to the To-do sheet's Repeats, open USE-47's custom step, and write the rule through `updateTodo`'s `rrule`.
- **Per path:** one test file per criterion under `lib/data/`; scenarios `ready-go-not-yet-started`, `review-nothing-set-copy` and `todo-repeats-custom`.
- **Model:** Opus 5.5 at medium.
