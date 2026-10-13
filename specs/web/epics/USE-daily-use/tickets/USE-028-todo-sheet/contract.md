---
id: "USE-28"
size: medium
objective: "A to-do row opens the To-do sheet over the day: the scope line, the icon tile and title edited in place, Type, Repeats, Reminder with its At row, and Notes, every change saving as made with no primary, the reminder row telling the iPhone browser and notifications-off cases apart, on fixtures through useTodos"
slice_type: "an edit-in-place sheet; risks a Save button, a change lost or saved twice, a repeat label that names the wrong weekday or date, a reminder switch offered where no reminder can arrive, a failure in red, and a second icon picker"
non_negotiables:
  - "No primary and no Save: each change saves as made through todoInput; a failed one reverts its field and shows \"Not saved. Try again.\" under its row, in ink."
  - "The reminder's day and time are remindOn (USE-30) and remindAt; the to-do keeps no day of its own unless given one; turning the switch off clears both."
  - "The reminder row shows the switch only where a reminder can arrive; an iPhone browser shows \"Reminders need the installed app.\" with How, installed with notifications off shows \"Notifications are off for Synapse.\" with Settings."
  - "Repeats reads from the to-do's day, or today: \"Every week, on Monday\", \"Every month, on the 12th\"; a checked repeating to-do comes back on its next due date as a new to-do and the done one stays done."
  - "The icon tile opens USE-11's IconPickerStep inside the sheet with back on the left."
  - "Only @syn/ui components (ResponsiveSheet, Select, Switch, TimeField, Textarea, EmojiSlotButton) and preset tokens; × on the left."
devs_call: "File split inside components/planner/todo-sheet/; how the title edits in place; the reminder availability check's home in lib/pwa; making a phone number or link in Notes tappable [PROPOSED]."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/todo-sheet/index.md"
  - "specs/web/epics/USE-daily-use/ux/day/todo-sheet/states/default.md"
  - "specs/web/epics/USE-daily-use/ux/day/todo-sheet/states/type-open.md"
  - "specs/web/epics/USE-daily-use/ux/day/todo-sheet/states/repeats-open.md"
  - "specs/web/epics/USE-daily-use/ux/day/todo-sheet/states/reminder-on.md"
  - "specs/web/epics/USE-daily-use/ux/day/todo-sheet/states/not-installed.md"
  - "specs/web/epics/USE-daily-use/ux/day/todo-sheet/states/notifications-off.md"
  - "C-USE-todo-sheet-default-1"
  - "C-USE-todo-sheet-type-open-1"
  - "C-USE-todo-sheet-repeats-open-1"
  - "C-USE-todo-sheet-repeats-open-2"
  - "C-USE-todo-sheet-reminder-on-1"
  - "C-USE-todo-sheet-not-installed-1"
  - "C-USE-todo-sheet-notifications-off-1"
  - "D-USE-69"
waiver: "One surface, the To-do sheet: its index and the six drawn states built here; loading, error and offline follow the index's decisions; ··· is USE-29's."
truth_files: "none: an epic proposal; promotion carries day/todo-sheet/"
qa: Q1
reviewers:
  - assay
focus:
  - "the six states at 402, and the reminder row's three forms (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/planner/"
  - "apps/web/app/(shell)/_components/sheet-host.tsx"
  - "apps/web/lib/data/use-todos.ts"
  - "apps/web/lib/data/todo-sheet.test.ts"
  - "apps/web/lib/pwa/"
  - "apps/web/lib/fixtures/"
  - "apps/web/lib/routes.ts"
  - "packages/utils/src/planner/todo-repeat.ts"
  - "packages/utils/src/planner/todo-repeat.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-028-todo-sheet/evidence/"
depends_on:
  - "USE-4"
  - "USE-6"
  - "USE-7"
  - "USE-10"
  - "USE-11"
  - "USE-19"
  - "USE-30"
out_of_scope:
  - "··· (Give it a day…, Mark done, Delete) and the At row's Pick a day…: USE-29"
  - "Repeats' Custom… step: the custom recurrence ticket (the New block sheet's area 5); the option is added there, so this list ends at Every month"
  - "The Install sheet How opens and the Settings page: the account tickets; the buttons open their URLs"
  - "+ Add › To-do on the work screens: the add ticket; this sheet takes ?sheet=todo&new=1 for it"
  - "Arming the notification: the to-dos-and-reminders wiring (wave 3)"
criteria:
  - id: C1
    statement: "Call the mechanic opened from the tray: ×, ···, \"To-dos · in the tray, no day yet\", the 📞 tile and title, Type \"📞 Call\", Repeats \"Does not repeat\", Reminder \"Off\" with the switch, Notes with its two lines, and the footer line; no primary"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-028-todo-sheet/evidence/default-402.png"
  - id: C2
    statement: "Type open above its trigger: Home, Errand, Call (checked), Digital and Other, each emoji in an 18 px slot"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-028-todo-sheet/evidence/type-open-402.png"
  - id: C3
    statement: "Repeats open on Monday the 12th: Does not repeat (checked), Every day, \"Every week, on Monday\", \"Every month, on the 12th\" and \"A repeat comes back to the tray when it's due, after this one is done.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-028-todo-sheet/evidence/repeats-open-402.png"
  - id: C4
    statement: "Reminder on: \"On: a notification at the time below\", the At row with \"Today\" and the TimeField \"12:30\", and \"If it's checked off before 12:30, the reminder doesn't come.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-028-todo-sheet/evidence/reminder-on-402.png"
  - id: C5
    statement: "In an iPhone browser the switch is replaced by \"Reminders need the installed app.\" and How; installed with notifications off, by \"Notifications are off for Synapse.\" and Settings; each with its footer line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-028-todo-sheet/evidence/reminder-unavailable-402.png"
  - id: C6
    statement: "todoRepeatOptions for 2026-10-12 gives the four rules with their labels, and a weekly to-do checked on Monday writes a new to-do due the next Monday while the checked one stays done"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "Each field writes once as it changes; the reminder writes remindOn and remindAt and the switch off clears both; a failed write reverts its field; a new sheet creates the to-do only once a title is typed; reminderAvailability gives available, not-installed or notifications-off"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "The web app and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
  - id: C9
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — todo-sheet

## Build notes

After USE-19 (rows open `?sheet=todo&id=`) and USE-30 (`remindOn`). Captures to match: `ux/day/todo-sheet/captures/{default,type-open,repeats-open,reminder-on,not-installed,notifications-off}-402.png`; Paper `01M49AX02VV4SSBKNCN6NRTS6Y`, "USE — set up", step 11 rounds 1 and 2. Behind the scrim the drawn screen is Review the day; the captures open the sheet over Now.

- **Decisions that apply:**
  - D-USE-3: the sheet exists, set from the tray. D-USE-35: every to-do has Notes; Computer is Digital (💻). D-USE-37: rounds 1 and 2 approved as drawn, [PROPOSED] marks standing (Type as a select, tappable numbers and links); a to-do with no day reminds on the day picked and stays in the tray with no day.
  - D-USE-69: "+ Add › To-do" opens the same sheet with the title empty and focused, created once a title is typed; loading is N/A (fields at once); a failed change reverts with "Not saved. Try again."; a reminder set offline is armed once it syncs; the At row's day select reads Today, Tomorrow, then Pick a day…; a new to-do starts as Other; no length on this sheet.
  - Footer lines: "Changes save as they're made. It waits in the tray until it's done or a To-dos block takes it."; reminder on: "… If it's checked off before <time>, the reminder doesn't come."; not installed: "… Everything else here works in the browser."; notifications off: "… The reminder switch comes back once notifications are on."
  - D-USE-39: at the desk the sheet is ResponsiveSheet's right panel at `--sheet-w`.
- **Interfaces:**
  - `@syn/utils` `planner/todo-repeat.ts`: `todoRepeatOptions(dateKey): { label; rrule: string | null }[]` and `nextDue(rrule, afterDateKey)` over USE-6's expander.
  - `useTodos` gains `update(id, patch)` and the fixture server's `writeTodo` handles a repeating to-do's check.
  - `lib/pwa/reminder-availability.ts`: `reminderAvailability({ ios; standalone; permission })`; a scenario's `device` overrides it through `source.ts`.
  - `components/planner/todo-sheet/`: `TodoSheet`, `ReminderRow`; `sheet-host.tsx` gains the `todo` case (create the host if USE-22 has not).
  - Scenarios: `todo-sheet` (default), `type-open`, `repeats-open`, `reminder-on`, `not-installed`, `notifications-off`, `todo-sheet-error`, `todo-sheet-offline`.
- **Per path:** `todo-repeat.test.ts` holds C6's options; `todo-sheet.test.ts` holds C6's return and C7 against the fixture server.
- **Gotchas:**
  - C5 is one capture of the two sheets side by side, or two stacked; name it as the criterion says.
  - The tile's tint is To-dos' moss chip [ASSUMPTION, as drawn].
  - `remindAt` is a wall-clock time; `remindOn` a date key; never an instant.
- **Model:** Opus 5.5 at medium. A smaller model adds a Save button or offers the switch in Safari.
