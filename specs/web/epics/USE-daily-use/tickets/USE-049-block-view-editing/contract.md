---
id: "USE-49"
size: medium
objective: "Block view in editing mode, opened from Set my days at /days/block/{id}: the usual week's block with icons, grips and the set-time clock, a new block's empty add row, overflow past the end, offline edits, and the kinds' editors (Training with its focus and Swap, a meal with its topics, a true break, the Sunday checklist, Life set with Not this week, Set work), on fixtures"
slice_type: "the editing half of a surface on fixtures; risks a usual-week edit that stays on one date (or the reverse), a set-time item that moves on reorder, an overflow said in red, a checklist that grows times, a Life block with a fill choice, and offline editing drawn dead"
non_negotiables:
  - "In the usual week every change is every such weekday's, and its reach shows as Set my days does; from This week it is that date's only."
  - "A set-time item keeps its time and place; the others re-flow around it (reflowItems); a new typed item is 5 min, after the last (D-USE-81)."
  - "Overflow is words in ink under a dashed line; never red, nothing blocks adding."
  - "Offline every edit here saves on the phone and syncs when back (D-USE-67); no control is faded."
  - "A checklist has no rail, times or lengths; Set a time gives it a span and keeps every box."
  - "Data through useBlockView and usePlannerWrites; only @syn/ui components and preset tokens; colour never alone."
  - "Every state of this ticket is reachable by ?state= (canon C-P08)."
devs_call: "How the kinds' rows compose BlockView (a slot per kind or a variant); file split; the Training focus select's control."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/block-view/by-kind.md"
  - "C-USE-block-view-kind-1"
  - "C-USE-block-view-kind-3"
  - "C-USE-block-view-kind-4"
  - "D-USE-79"
  - "D-USE-81"
waiver: "The editing mode's own states sit in the surface index's table (states/editing-monday.md, empty.md, overflow.md, editing-offline.md); the kinds' editors are this file's. One mode, one ticket."
truth_files: "none: day/block-view/ is promoted with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "wellness editing with the set-time row, empty, overflow, checklist and Life set at 402 against day/block-view/captures/ (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/days/block/"
  - "apps/web/components/planner/block-view/"
  - "apps/web/lib/routes.ts"
  - "apps/web/lib/fixtures/scenarios/"
  - "specs/web/epics/USE-daily-use/tickets/USE-049-block-view-editing/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-11"
  - "USE-36"
  - "USE-39"
  - "USE-48"
out_of_scope:
  - "Work's tiers, Set work's switch to tiers, and the To-dos block's add menu and picker: the Block view Work and To-dos ticket"
  - "The Item sheet, its At a set time and its swap list: the Item sheet's ticket"
  - "The Meal topics sheet behind Edit topics: USE-22"
  - "Now's rest for a true break: Now's ticket"
criteria:
  - id: C1
    statement: "The usual Monday's Wellness shows \"‹ Monday › Wellness\", \"7:05 to 8:00 · every Monday\", Done beside ···, rows with rail time, icon, name, length and grip, and Meditate with a clock and \"At 7:10 · 10 min\" in the grip's place"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-049-block-view-editing/evidence/wellness-editing-402.png"
  - id: C2
    statement: "A new block opens on \"Nothing in Wellness yet.\" with the add row focused on the rail at 7:05, the dashed icon square, \"5 min\", the hint, \"Free until 8:05\" and the end line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-049-block-view-editing/evidence/empty-new-block-402.png"
  - id: C3
    statement: "Items past the end show a dashed ink line at 8:00, \"Runs 12 min past 8:00.\" in ink, and Journal under it; no Free until"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-049-block-view-editing/evidence/overflow-402.png"
  - id: C4
    statement: "Offline in editing, \"Offline. Changes wait until the connection is back.\" sits under the header and every control stays live"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-049-block-view-editing/evidence/editing-offline-402.png"
  - id: C5
    statement: "Training shows \"Training for\" with Body fitness, the drives in italic, and Swap on Workout: gym"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-049-block-view-editing/evidence/training-editing-402.png"
  - id: C6
    statement: "Breakfast shows the Meal switch on, its rows, and \"Watching while eating\" with topics filled when offered and outlined when left out, and Edit topics"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-049-block-view-editing/evidence/meal-editing-402.png"
  - id: C7
    statement: "An empty Break shows Meal off, \"Nothing in Break. A true break.\" with its line, the add row unfocused and \"Free until 15:20\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-049-block-view-editing/evidence/true-break-402.png"
  - id: C8
    statement: "The Sunday checklist shows \"‹ Sunday › Checklist\", \"All day · Checklist · every Sunday\", the switch on, rows of icon, name and grip with no rail or lengths, the add row and Set a time"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-049-block-view-editing/evidence/checklist-editing-402.png"
  - id: C9
    statement: "Dinner with friends shows Life's yellow bar beside \"Life · 19:00 to 21:00 · every Thursday\", the drives in italic, the add row and the plan line; no fill choice"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-049-block-view-editing/evidence/life-set-402.png"
  - id: C10
    statement: "Opened from This week, the Life block's ··· holds Not this week, which frees that week's date only, with Undo"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-049-block-view-editing/evidence/life-not-this-week-402.png"
  - id: C11
    statement: "Writing shows \"Work · 9:30 to 12:00 · every Tuesday\", \"Work fills it with\" reading Set work, fixed rows with rail times and icons, no tiers, and its line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-049-block-view-editing/evidence/set-work-402.png"
  - id: C12
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C13
    statement: "Lint passes"
    evidence: check
    command: "yarn lint"
---

# Contract — block-view-editing

## Build notes

On USE-48's `BlockView`, in `mode: "editing"`. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — set up", row "Block view from Set my days" (y 3780, notes y 4710), and page "USE — daily use" (editing, Monday; overflow; editing, offline). Captures to match in `ux/day/block-view/captures/`. Take ours at `/days/block/<id>?weekday=mon&state=<state>`.

- **Decisions that apply:**
  - D-USE-84: every editing frame draws Done beside ··· (Done goes back to Set my days, as the breadcrumb); the empty state builds round 3's frame. D-USE-87: no hint line; the scope rides the span line ("every Monday", "this Monday only"); a checklist's breadcrumb names its kind.
  - Round 8: a set-time row shows a clock and "At 7:10" in the grip's place and does not move.
  - D-USE-81: a typed item is 5 minutes, after the last; Return keeps the line open; the dashed square opens USE-11's picker.
  - D-USE-67: Block view's editing saves offline and syncs later; the frame's read-only drawing is superseded in behaviour.
  - D-USE-28: a checklist with no span sits in the All day strip; Set a time keeps the boxes. Turning the switch off asks for a span [ASSUMPTION].
  - D-USE-28, D-USE-30: meal topic chips; a tap leaves one out of this meal for every such weekday.
  - Life (D-USE-79): yellow #C9A227 / #F6EDC4, holding its own items like Wellness, no fill choice; Not this week is a row in the block's ··· from This week (D-USE-87), freeing that date with a Toaster and Undo.
  - Training: "Training for" with Body fitness only until the dev note's pass; Swap opens the Item sheet's swap list.
  - Set work: "Work fills it with" reads Set work; a switch to Tasks for the day shows the tiers (D-USE-87).
  - Reach: a usual-week change names its reach as Set my days does (D-USE-33).
- **Interfaces:** `daysBlockRoute(id, { weekday | date })` in `routes.ts`; `BlockView` gains the kinds' header rows (Meal, Training for, Work fills it with, Checklist) and the set-time trailing slot. Scenarios named for each state.
- **Gotchas:**
  - Wellness, Evening and Set work share one view; Evening has no frame of its own.
  - "Nothing after this today" stands in for the peek when no block follows.
  - Placeholder items stay bracketed.
- **Model:** Opus 5.5 at medium. A smaller model moves the set-time item, greys out offline editing, or gives Life a fill select.
