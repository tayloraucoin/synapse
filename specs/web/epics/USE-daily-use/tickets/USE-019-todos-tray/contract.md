---
id: "USE-19"
size: medium
objective: "The To-dos tray opens in place under Now's header: rows with box, icon, title and either the bell and reminder time or \"From <weekday>\", then Add a to-do; empty, from a reminder (tinted, time in ink), loading, a failed list and a failed check each as decided, and the reminder's lock-screen preview, all through useTodos on fixtures"
slice_type: "a shared collapsible list with its own data region; risks a count anywhere, the tray covering the block instead of pushing it, a carried to-do lost or labelled wrong, the tray's failure taking the screen with it, and a reminder's body with words added"
non_negotiables:
  - "Never a count, open or closed; an empty tray holds only \"Add a to-do\", and closed it reads \"To-dos\" alone (D-USE-26)."
  - "Open, the tray pushes the screen down; nothing covers the day, and the block stays live."
  - "The to-dos load as their own region (useTodos): their loading or failure never blanks the block, and the block's never blanks them."
  - "Which to-dos show and in what order is a pure function in @syn/utils: reminders first by time, then the rest oldest first; an unchecked to-do from an earlier day reads \"From <weekday>\"."
  - "A failure is ink, never red: \"Not saved. Try again.\" under a row, \"To-dos didn't load. Try again.\" for the list."
  - "A reminder's body is the to-do's title exactly, nothing added."
  - "Only @syn/ui components (Collapsible, Checkbox, InlineAddRow, SkeletonRow) and preset tokens."
devs_call: "File split inside components/planner/todos-tray/; the tint's fade (about two seconds, none under reduced motion); the lock-screen preview's drawing."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/todos/index.md"
  - "specs/web/epics/USE-daily-use/ux/day/todos/states/open.md"
  - "specs/web/epics/USE-daily-use/ux/day/todos/states/empty.md"
  - "specs/web/epics/USE-daily-use/ux/day/todos/states/from-a-reminder.md"
  - "specs/web/epics/USE-daily-use/ux/day/todos/states/notification.md"
  - "specs/web/epics/USE-daily-use/ux/day/todos/states/error.md"
  - "C-USE-todos-open-1"
  - "C-USE-todos-open-3"
  - "C-USE-todos-empty-1"
  - "C-USE-todos-from-a-reminder-1"
  - "C-USE-todos-notification-1"
  - "C-USE-todos-error-2"
  - "D-USE-69"
waiver: "One surface, the To-dos tray: its index and the states built here; closed, loading and offline follow from them."
truth_files: "none: an epic proposal; promotion carries day/todos/"
qa: Q1
reviewers:
  - assay
focus:
  - "open, empty and from a reminder at 402: no count, the block pushed not covered (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/planner/"
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/lib/data/use-todos.ts"
  - "apps/web/lib/data/todos.test.ts"
  - "apps/web/lib/fixtures/"
  - "apps/web/lib/routes.ts"
  - "packages/utils/src/planner/tray.ts"
  - "packages/utils/src/planner/tray.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-019-todos-tray/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-9"
  - "USE-10"
  - "USE-16"
out_of_scope:
  - "The To-do sheet a row opens (?sheet=todo&id=): USE-28; rows open that URL"
  - "Sending the reminder and skipping a checked one: the to-dos-and-reminders wiring (wave 3)"
  - "Offline persistence of checks: its own wave 3 ticket; here offline writes land in the fixture server as online"
  - "Desk Today's open To-dos section: work Today's ticket; the tray on Review the day: its own ticket"
criteria:
  - id: C1
    statement: "Open on Now at 7:14: \"To-dos\" and a chevron up; Call the mechanic with its phone icon, a bell and \"10:00\" muted; Library books with its bag icon and \"From Sunday\"; then \"+ Add a to-do\"; Wellness pushed down below"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-019-todos-tray/evidence/open-402.png"
  - id: C2
    statement: "With no to-dos the open tray holds only \"+ Add a to-do\", no message, no illustration, no count"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-019-todos-tray/evidence/empty-402.png"
  - id: C3
    statement: "Opened from a reminder at 10:00 the tray is open with Call the mechanic tinted and \"10:00\" in ink and semibold beside the bell, the Work block pushed down"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-019-todos-tray/evidence/from-a-reminder-402.png"
  - id: C4
    statement: "The reminder preview at /dev/parts shows a lock screen with one Synapse notification whose body is \"Call the mechanic\" and nothing else"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-019-todos-tray/evidence/notification-402.png"
  - id: C5
    statement: "trayTodos orders reminders by time then the rest oldest first, labels an unchecked to-do from Sunday \"From Sunday\" on Monday and one past a week \"From 3 Oct\", keeps a checked one until the day ends, and reminderBody returns the title unchanged"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "Add a to-do writes a to-do with no day, no reminder, no repeat and type Other and keeps the input open; when the to-dos fail to load the block's query still settles, and Try again refetches only the to-dos; a failed check reverts the box"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "The web app and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
  - id: C8
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — todos-tray

## Build notes

After USE-16, which ships `TodosTrayLine` closed. This ticket makes it the tray. Captures to match: `ux/day/todos/captures/{open,empty,from-a-reminder,notification}-402.png`; Paper `01M49AX02VV4SSBKNCN6NRTS6Y`, "USE — daily use", the row "To-dos tray and reminder".

- **Decisions that apply:**
  - D-USE-26: closed by default on Now; an empty tray holds only "Add a to-do"; a carried to-do reads "From Sunday". A reminder is the one way in that opens it.
  - D-USE-69: a checked to-do stays in the tray checked and faded, and live, until the day ends, then leaves; rows with a reminder first by time, then the rest oldest first; the row shows the to-do's own icon; a new to-do starts as Other; loading has no spinner (closed reads "To-dos" until the list arrives, open shows one `SkeletonRow` above a working "Add a to-do"); a failed list reads "To-dos didn't load. Try again." with the info icon, in ink.
  - N4: the reminder's text is the to-do in Taylor's own words, nothing added; tapping opens Now with the tray open on it. The tint fades on its own.
  - D-USE-56 and D-USE-64: offline the tray works as online and looks the same.
  - Words: "To-dos", "Add a to-do", "From <weekday>", "From <d Mon>", the time in `figure`, "Not saved. Try again.", "To-dos didn't load. Try again."
- **Interfaces:**
  - `@syn/utils` `planner/tray.ts`: `trayTodos({ todos, slots, dateKey, now }): { todo; carriedFrom: string | null; reminderAt: string | null }[]` over USE-9's `todoPool`, and `reminderBody(todo): string`.
  - `lib/data/use-todos.ts`: `useTodos(dateKey)`, its own query over the fixture server's new `readTodos(dateKey)`, with `add(title)`, `check(id)`, `uncheck(id)` through `todoInput`.
  - `Scenario` gains `regions?: { todos?: "loading" | "error" }` and `failWrites?: string[]` (record ids whose next write rejects once). USE-21 uses both.
  - `components/planner/todos-tray/`: `TodosTray { focusTodoId? }` replacing `TodosTrayLine`'s body; `ReminderPreview` registered on `/dev/parts` as `todos-notification`.
  - `routes.ts`: `todayRoute({ todo })` reads `?todo=<id>` (nuqs), opening the tray on that to-do; the push payload's URL comes from it.
  - Scenarios on `/today`: `todos-open` (also `carried`), `todos-empty`, `from-a-reminder`, `todos-loading`, `todos-error`, `todos-check-error`, `todos-offline`.
- **Per path:** `tray.test.ts` holds C5; `todos.test.ts` holds C6 against the fixture server.
- **Gotchas:**
  - Names are global across `?state=`; the tray's take the `todos-` prefix where another surface uses the bare word.
  - The fixture's Library books is dated the Sunday before and unchecked.
  - The tray is reused by Review the day and Schedule: it takes no Now-only prop.
- **Model:** Opus 5.5 at medium. A smaller model adds "2 to-dos" to the closed line or overlays the block.
