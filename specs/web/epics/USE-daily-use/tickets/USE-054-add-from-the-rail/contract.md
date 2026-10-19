---
id: "USE-54"
size: small
objective: "Adding to the laid-out day at a time: dragging the rail + reads the time in 15-minute steps and releasing opens the add sheet there, tapping empty time does the same, and the sheet (Item or Block, icon and name, Starts, Length, At a set time, Tier inside Work, Notes) lands the item silently with Undo when there is room or hands it to Make room when there is none, today only, on fixtures"
slice_type: "a drag gesture and a form sheet on fixtures; risks a drag that reads times off the 15-minute grid or past the day's edges, a solid line drawn over content, an add that asks when free time can absorb it, a Tier shown outside Work, and an add that reaches the usual week"
non_negotiables:
  - "Today only: an addition is a dated item or a slot for that date; the usual week never changes (note 18)."
  - "15-minute steps in the drag and in Starts, which also takes a typed time (D-USE-19); the drag stops at the day's edges."
  - "While dragging the + becomes the time; the line is solid ink in the rail only, a faint dashed guide over the block, never solid over content (D-USE-18)."
  - "With room the addition lands with no question and a Toaster offers Undo; with no room it goes to Make room through useRoom().place (USE-41)."
  - "Tier shows only when the time falls in a Work block; Block turns the sheet into the New block sheet at that time (USE-46)."
  - "Only @syn/ui components and preset tokens; nothing red; a gesture has a tap path (tap the + for the next free time)."
  - "Every state of this ticket is reachable by ?state= (canon C-P08)."
devs_call: "The drag's implementation (the existing drag layer, no new dependency); the haptic tick where the platform has one; file split."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/add-from-the-rail/index.md"
  - "C-USE-add-from-the-rail-1"
  - "C-USE-add-from-the-rail-2"
  - "C-USE-add-from-the-rail-3"
  - "C-USE-add-from-the-rail-4"
  - "D-USE-11"
  - "D-USE-15"
  - "D-USE-16"
  - "D-USE-18"
  - "D-USE-19"
  - "D-USE-22"
truth_files: "none: interactions/add-from-the-rail/ is promoted with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "the rail drag and the add sheet, full and preset to a tier, at 402 against interactions/add-from-the-rail/captures/ (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/planner/rail-add/"
  - "apps/web/components/planner/add-sheet/"
  - "apps/web/app/(shell)/today/review/"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-054-add-from-the-rail/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-11"
  - "USE-31"
  - "USE-36"
  - "USE-37"
  - "USE-41"
  - "USE-46"
  - "USE-51"
out_of_scope:
  - "The rail + itself, its one-time hint and the first-change line: USE-37"
  - "Make room's sheet and engine: USE-41 and USE-35"
  - "The rail + on Schedule: Schedule's ticket mounts it"
criteria:
  - id: C1
    statement: "Holding and dragging the + shows \"10:15\" in a filled ink tag in the gutter, a solid line in the rail only and a faint dashed guide across Work"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-054-add-from-the-rail/evidence/rail-drag-402.png"
  - id: C2
    statement: "Released at 10:15 in a full Work, the sheet reads \"Monday · lands in Work, 9:30 to 12:00\" over \"Add\", Item picked, the name focused, Starts 10:15, Length 15 min, At a set time off, Tier with Secondary picked, Notes, and \"Work is full at 10:15. Adding asks where the 15 min comes from.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-054-add-from-the-rail/evidence/add-sheet-402.png"
  - id: C3
    statement: "Add to Primary on an empty Work block opens the same sheet with the tier preset and no Starts"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-054-add-from-the-rail/evidence/add-sheet-preset-tier-402.png"
  - id: C4
    statement: "Added with room, the item shows in its block and a Toaster offers Undo"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-054-add-from-the-rail/evidence/added-undo-402.png"
  - id: C5
    statement: "The drag maps a finger's position to 15-minute steps clamped to the day's edges; an add with room writes a dated item or a tiered slot for that date only and Undo removes it; with no room it calls the room hook and writes nothing itself"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "Lint passes"
    evidence: check
    command: "yarn lint"
---

# Contract — add-from-the-rail

## Build notes

On Review the day's column (USE-31) and its rail + (USE-37). Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — daily use", row "Review the day" (notes y 4830). Captures to match: `ux/interactions/add-from-the-rail/captures/` (rail-drag, add-sheet). Take ours at `/today/review?state=rail-drag` and `?sheet=add&state=<state>`.

- **Decisions that apply:**
  - D-USE-11: a + in the rail as well as tapping empty time; free time absorbs an addition silently; no room opens Make room.
  - D-USE-15: one +; a tap adds at the next free time; a drag in 15-minute steps; release opens the add sheet there. D-USE-18: the + becomes the time while dragging.
  - D-USE-16 and D-USE-19: the sheet's fields: Item or Block, icon and name, Starts ("−15 | 10:15 | +15", typed too), Length (`MinutesStepper`), At a set time ("Stays at <time> when things move"), Tier as a four-way control for a work item, Notes (optional) autogrowing, the foot line when the block is full, then Add.
  - D-USE-22: an empty Work block's Add rows open the sheet preset to the tier, with no Starts.
  - Tapping empty time opens the sheet at the tapped time, rounded to 15 minutes [ASSUMPTION]. Releasing on the +'s own place cancels; dragging stops at the day's edges [ASSUMPTION].
  - × or a drag down closes with nothing added. Offline adding works and saves on the phone (D-USE-64).
  - Desk: the + in the time gutter, the sheet in the right panel at `--sheet-w`, a pointer drag (D-USE-39).
- **Interfaces:** `RailAddDrag { dayWindow; pxPerHour; onRelease(time) }` wrapping USE-37's +; `AddSheet { dateKey; at?; blockId; tier?; onAdded }` with `add-sheet/form.ts` (pure: the block it lands in, the full line from `reflowItems`, Tier only in Work); the write is `usePlannerWrites` (a dated item) or `useWorkWrites` (a work item and a tiered slot), and no room calls `useRoom().place`.
- **Gotchas:**
  - The canvas title "Add" with the scope line replaces D-USE-16's "Add at 10:15"; the drag's tag shows the time only.
  - The emoji slot opens USE-11's picker at its no-name-yet step.
- **Model:** Opus 5.5 at medium. A smaller model draws the guide solid over content, asks where to put an add that fits, or writes the usual week.
