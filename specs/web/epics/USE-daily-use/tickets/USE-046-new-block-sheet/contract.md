---
id: "USE-46"
size: medium
objective: "The New block sheet adds a block or a transition at a time and opens it to fill: seven kinds with their colours, name and icon, Starts and Ends with the length beside, the Repeats presets, the kind's own row (Checklist, How work fills it, the To-dos fill line, Meal with its topics), and the clash, invalid and error lines, on fixtures"
slice_type: "a form sheet on fixtures; risks a name that stops following the kind, a Length control where Ends belongs, a clash that blocks or turns red, a transition asked where it goes, a Repeats default that ignores which week opened it, and an add that loses what was typed on failure"
non_negotiables:
  - "Writes only through usePlannerWrites' createBlock and createTransition, with newBlockInput and newTransitionInput; refusals show in the sheet's words."
  - "Picking a kind fills the name and the colour until the name is typed over; the form's rules are a pure module with tests."
  - "Ends, never Length, with the length beside it; a transition has no kind, no Repeats and takes its block's colour."
  - "Clash is a line in ink and Add stays live; invalid is \"Name needed\" on faded ink; error keeps everything typed. Nothing red, no shake."
  - "Repeats defaults to weekly on its day from the usual week and to Does not repeat from This week (D-USE-80)."
  - "A ResponsiveSheet: bottom at 402, the right panel at --sheet-w from 768; rows 56 px."
  - "Every state of this ticket is reachable by ?sheet=new-block&state= (canon C-P08)."
devs_call: "The form module's shape; file split; how the consequence line is composed from the pure functions' answers."
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/index.md"
  - "D-USE-28"
  - "D-USE-34"
  - "D-USE-38"
  - "D-USE-79"
  - "D-USE-80"
truth_files: "none: specs/web/ux/set-my-days/ is promoted with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "from a tapped time, transition, clash, invalid and error at 402 against set-my-days/new-block-sheet/captures/ (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/planner/new-block-sheet/"
  - "apps/web/app/(shell)/days/"
  - "apps/web/lib/fixtures/scenarios/"
  - "specs/web/epics/USE-daily-use/tickets/USE-046-new-block-sheet/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-11"
  - "USE-36"
  - "USE-39"
out_of_scope:
  - "Repeats › Custom… and the This one, This and following or All question: the Repeats ticket"
  - "The Meal topics sheet behind Edit topics: USE-22"
  - "Block view, where Add block lands: its tickets"
  - "Review the day's add sheet's Block switch: the add-from-the-rail ticket opens this sheet"
criteria:
  - id: C1
    statement: "17:00 tapped on the usual Monday opens \"Usual Monday · every week\" over \"New block\", the seven kinds with Training picked, \"Stretch\", Starts 17:00, Ends 17:20 with \"20 min\", \"Weekly on Monday\", \"Clay, Training's colour\", Checklist off and \"Goes in on Mondays, 17:00 to 17:20, after Work. Opens empty to add its items.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-046-new-block-sheet/evidence/from-a-tapped-time-402.png"
  - id: C2
    statement: "From the empty Thursday, Wellness picked fills \"Wellness\", Starts 7:05 after Orient and Ends 8:05 with \"1 h\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-046-new-block-sheet/evidence/wellness-402.png"
  - id: C3
    statement: "Work from Mon 12 shows \"Mon 12 · this date only\", Does not repeat, and How work fills it with Tasks for the day picked over Set work; no Checklist row"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-046-new-block-sheet/evidence/work-402.png"
  - id: C4
    statement: "To-dos picked shows moss, Ends 16:00 with \"3 h\", the fill line and \"What isn't done by 16:00 goes back to To-dos.\"; no type picker, no Checklist"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-046-new-block-sheet/evidence/todos-kind-402.png"
  - id: C5
    statement: "Checklist on: Starts and Ends leave and the line names the All day strip"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-046-new-block-sheet/evidence/checklist-402.png"
  - id: C6
    statement: "A transition at 8:00 reads \"Usual Monday · inside Training\" over \"New transition\": no kind, no Repeats, Ends 8:15 with \"15 min\", \"Takes Training's colour\", Meal off, and \"8:00 falls in Training, so it goes inside Training. Workout: gym moves to 8:15.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-046-new-block-sheet/evidence/transition-402.png"
  - id: C7
    statement: "Break with Meal on shows \"Watching while eating\", the saved topics as chips with Edit topics, and the line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-046-new-block-sheet/evidence/meal-402.png"
  - id: C8
    statement: "Repeats opened on Sunday 18 October lists Does not repeat, Daily, Weekly on Sunday (ticked), Monthly on the third Sunday, Annually on 18 October, Every weekday, Monday to Friday, a separator and Custom…"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-046-new-block-sheet/evidence/repeats-menu-402.png"
  - id: C9
    statement: "Stretch at 11:30 inside Work shows, in ink, \"Overlaps Work, 9:30 to 12:00. Adding still works: the two sit side by side, and Work keeps its time.\" with Add block live"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-046-new-block-sheet/evidence/clash-402.png"
  - id: C10
    statement: "The name cleared keeps focus, the line reads \"A block needs a name. The kind's name fills in when a kind is picked; this one was cleared.\" and the primary is faded \"Name needed\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-046-new-block-sheet/evidence/invalid-402.png"
  - id: C11
    statement: "A failed add shows \"Not added.\" with Try again inline in ink with an alert icon, everything typed kept, Add block live"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-046-new-block-sheet/evidence/error-402.png"
  - id: C12
    statement: "The form module: the name follows the kind until typed over and refills when cleared and a kind is picked; Ends sets the length; Repeats defaults by week; a transition's time inside a block places it in_block"
    evidence: test
    command: "yarn test"
  - id: C13
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C14
    statement: "Lint passes"
    evidence: check
    command: "yarn lint"
---

# Contract — new-block-sheet

## Build notes

Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — set up", row "New block sheet" (y 5040). Captures to match: `ux/set-my-days/new-block-sheet/captures/` (all 402). Take ours at `/days?…&sheet=new-block&state=<state>`.

- **Decisions that apply:**
  - D-USE-34: seven kinds (Wellness, Training, Work, Life, To-dos, Break, Evening) as a `ChipPicker` with colour dots; Ends with the length beside it replaces Length; "Name needed" on faded ink; the clash line in ink with Add live; "Not added. Try again." inline. The earlier frames (`wellness.md`, `work.md`) build with seven kinds and Ends.
  - D-USE-38, D-USE-79: Life yellow, To-dos moss, Stretch slate.
  - D-USE-80: Repeats is Google's presets worded from the start date, then Custom…; one RRULE stored (`presetRule`).
  - D-USE-28: the menu is a shadcn dropdown; meal blocks carry "Watching while eating" topic chips; a tap toggles one for this meal.
  - Round 5: a transition dropped inside a block's span belongs to it, asking nothing, and takes its block's days.
  - Scope lines: "Usual <Weekday> · every week", "<Day> <date> · this date only", "Every <Weekday>", "Usual <Weekday> · inside <Block>".
  - Exit: Add block closes into the new block's Block view (Work on its tiers, To-dos on its pool, a checklist in the All day strip); Add transition closes to the column.
  - Offline (D-USE-82): the sheet does not open from Set my days; a connection lost while open shows the error line until back.
  - Change its time (D-USE-87, out-of-bounds): this sheet's Starts and Ends on the existing block, titled with its name, with Save.
  - Access: focus on the name with its text selected; Kind a radio group; the clash, invalid and error lines polite live regions tied to the primary; the faded primary `aria-disabled` and focusable.
- **Interfaces:** `NewBlockSheet { scope; start; end; kind?; mode: "block" | "transition" | "times"; onAdded(blockId) }` and `new-block-sheet/form.ts` (pure: state, actions, the consequence line from `firstFreeTime`, `overlaps`, `eventLanding`). Scenarios named for each state.
- **Per path:** `form.test.ts` holds C12, `describe`d by criterion.
- **Gotchas:**
  - The emoji slot opens USE-11's `IconPickerStep` as a step inside the sheet, back on the left, never a second sheet.
  - The kinds wrap to a first line and a half, as drawn.
- **Model:** Opus 5.5 at medium. A smaller model keeps Length, blocks the add on a clash, or asks where a transition goes.
