---
id: "USE-29"
size: small
objective: "The To-do sheet's ··· opens Give it a day…, Mark done and Delete to-do with its consequence, all in ink: Give it a day… and the At row's Pick a day… open a month step inside the sheet, built on a new @syn/ui MonthGrid that the Move to ticket will reuse; Mark done and Delete act at once with Undo in the toast"
slice_type: "a menu and a date step; risks a red delete or a confirm dialog, Undo that does not restore the to-do's slots, a past day pickable, a month grid forked per sheet, and a day given that changes the reminder's day"
non_negotiables:
  - "Delete to-do deletes at once, no confirm, in ink, never red; it leaves the tray and any block that took it; Undo restores the to-do and those slots."
  - "Mark done checks the to-do as its tray box does and closes the sheet with Undo; a repeating one comes back when due (USE-28's rule)."
  - "Give it a day… sets the to-do's onDate and returns; the scope line then reads the day and the to-do sits in that day's tray. Pick a day… in the At row sets remindOn only."
  - "Past days cannot be picked; today is ringed in ink; the picked day is a filled ink disc."
  - "MonthGrid is presentational in @syn/ui (days, marks, picked, onPick), with a story per state, an exports subpath and a components.md row; nothing domain-aware enters it."
  - "Only @syn/ui components (DropdownMenu, ResponsiveSheet, Toaster) and preset tokens; back on the left in the step."
devs_call: 'MonthGrid''s keyboard model (arrow keys by day and week, Page Up and Down by month); the step''s title for each entry ("Give it a day", "Remind on"); the toast words.'
cites:
  - "specs/web/epics/USE-daily-use/ux/day/todo-sheet/states/more-open.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/move-to/states/pick-a-day.md"
  - "C-USE-todo-sheet-more-open-1"
  - "C-USE-todo-sheet-more-open-2"
  - "D-USE-69"
waiver: "The To-do sheet's ··· state, and Pick a day's month, which its Give it a day… shows (D-USE-69); the month is built here for both and the Move to ticket reuses it."
truth_files: "none: an epic proposal; promotion carries day/todo-sheet/"
qa: Q1
reviewers:
  - assay
focus:
  - "the ··· menu and the month step at 402: ink not red, Undo restores slots, past days closed (assay)"
operator_review: false
planned_paths:
  - "packages/ui/src/composed/control/month-grid/"
  - "packages/ui/src/index.ts"
  - "packages/ui/package.json"
  - "apps/web/docs/design/components.md"
  - "apps/web/components/planner/"
  - "apps/web/lib/data/use-todos.ts"
  - "apps/web/lib/data/todo-more.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-029-todo-sheet-more-menu/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-28"
out_of_scope:
  - 'Move to… and its Pick a day consequence row and "Move to <day>": the Move to ticket, on this MonthGrid'
  - "Days already set marked under the number: the Move to ticket passes the marks; here no marks are passed"
criteria:
  - id: C1
    statement: '··· open on Call the mechanic: a right-aligned menu headed "Call the mechanic" with Give it a day…, Mark done, a rule, and Delete to-do with "Gone from the tray and any block. Undo in the toast.", all in ink'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-029-todo-sheet-more-menu/evidence/more-open-402.png"
  - id: C2
    statement: 'Give it a day… shows a step with back on the left, "October 2026" with ‹ and ›, Monday-first weekdays, 1 to 11 faded, 12 ringed in ink and 15 picked as a filled ink disc'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-029-todo-sheet-more-menu/evidence/give-it-a-day-402.png"
  - id: C3
    statement: "Storybook shows MonthGrid with today, a picked day, past days disabled and days marked"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-029-todo-sheet-more-menu/evidence/month-grid-stories.png"
  - id: C4
    statement: "Delete removes the to-do and every slot that took it; Undo brings both back as they were; Mark done sets doneAt and Undo clears it"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "Giving 2026-10-15 sets onDate and leaves remindOn alone; Pick a day… in the At row sets remindOn and leaves onDate alone; a day before today is refused"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "The web app and @syn/ui type-check"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "The web app and @syn/ui lint clean"
    evidence: check
    command: "yarn lint"
---

# Contract — todo-sheet-more-menu

## Build notes

After USE-28. Captures to match: `ux/day/todo-sheet/captures/more-open-402.png` and, for the month, `ux/interactions/move-to/captures/pick-a-day-402.png` (its grid only; the consequence row and the button are Move to's). Paper `01M49AX02VV4SSBKNCN6NRTS6Y`, "USE — set up" (step 11) and "USE — daily use" (the Move to row).

- **Decisions that apply:**
  - D-USE-37: approved as drawn; Delete is in ink, not red, as the item sheet's menus.
  - D-USE-69: Give it a day… is a step inside the sheet with back on the left, showing Pick a day's month; picking a day sets it and returns, the scope line reading the day; the At row's day select reads Today, Tomorrow, then Pick a day….
  - D-USE-37 (Pick a day): a month, today ringed, the picked day filled; [PROPOSED] new component: a month grid, not `DateField`.
  - Mark done: checks the to-do as its box in the tray and closes the sheet; Undo in the toast [ASSUMPTION].
  - Words: "<Title>" as the menu's heading, "Give it a day…", "Mark done", "Delete to-do", "Gone from the tray and any block. Undo in the toast.", the month as "October 2026", weekdays "Mon" to "Sun".
- **Interfaces:**
  - `@syn/ui` `MonthGrid { month: string /* YYYY-MM */; today: string; picked?: string; marked?: readonly string[]; minDate?: string; onPick(dateKey); onMonth(month) }`.
  - `useTodos` gains `remove(id)`, `restore(snapshot)`, `markDone(id)`; the fixture server's `removeTodo` returns the to-do and its slots for Undo.
  - `components/planner/todo-sheet/`: `TodoMoreMenu`, `PickADayStep { title; value; onPick; onBack }`, which USE-28's At row opens through its new "Pick a day…" option.
  - Scenarios: `more-open`, `give-it-a-day` (Monday 12 October, 15 picked).
- **Per path:** `todo-more.test.ts` holds C4 and C5 against the fixture server.
- **Gotchas:**
  - Weeks start on Monday, as `RepeatRule.weekdays`.
  - The step keeps the sheet's height; it is never a second sheet.
- **Model:** Opus 5.5 at medium. A smaller model asks "Delete?" or paints Delete red.
