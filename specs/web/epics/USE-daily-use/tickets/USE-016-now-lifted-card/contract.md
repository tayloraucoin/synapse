---
id: "USE-16"
size: medium
objective: 'On the phone, /today after Ready, go is Now for a non-work block: the header, the closed To-dos line, the block''s header and rows, the current item lifted with Start and Done, Done recording the planned length with "Took n min · Change" and the time-taken sheet, and a tapped row made current, all on fixtures through useNow'
slice_type: "the first go-mode screen and its data hook; risks a current item or block computed in the component instead of a pure function, Done storing nothing or the clock's figure instead of the plan, a count of what is left, and a desk layout guessed at a phone width"
non_negotiables:
  - "Only the active block shows; no count of what is left anywhere, no second person, nothing red (C-USE-now-4)."
  - "The active block and the current item come from pure functions in @syn/utils; the screen reads them through useNow and never derives them itself."
  - "A plain Done writes the slot's doneAt and tookMin = the planned length through the fixture server; the row's box does the same; unchecking clears both."
  - "Composes USE-10's DayBlockHeader and PlannerItemRow and @syn/ui's Card, ItemIcon, Button, ResponsiveSheet and MinutesStepper; never a second row or header."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20). The current item is the lifted card, never only its verdigris dot."
  - "Below 1024 only (split:hidden); the desk's /today is not touched."
devs_call: "File split under today/_components/now/; how the Took line times out (about six seconds, the house Toaster's time); the row-tap state's home (component state, seeded from the scenario's view); the view-model shape."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/now/index.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/success.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/done-next-lifts.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/row-tapped.md"
  - "specs/web/epics/USE-daily-use/ux/day/running/states/took-change.md"
  - "specs/web/epics/USE-daily-use/ux/day/running/states/time-taken-sheet.md"
  - "C-USE-now-1"
  - "C-USE-now-2"
  - "C-USE-now-3"
  - "C-USE-now-4"
  - "C-USE-now-success-1"
  - "C-USE-now-done-next-lifts-1"
  - "C-USE-now-row-tapped-1"
  - "C-USE-running-took-change-1"
  - "C-USE-running-time-taken-sheet-1"
  - "D-USE-13"
  - "D-USE-26"
waiver: "One surface, Now: its index, words and the three states built here. Folds running/states/took-change.md and time-taken-sheet.md: a plain Done's record is drawn on Now's Done and opened from its row, so it ships with Done here; the timed forms stay with Running (USE-23)."
truth_files: "none: an epic proposal; promotion carries day/now/"
qa: Q1
reviewers:
  - assay
focus:
  - "success, done next lifts, row tapped and the time-taken sheet at 402 against now/captures and running/captures (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/page.tsx"
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/components/planner/"
  - "apps/web/lib/data/use-now.ts"
  - "apps/web/lib/data/source.ts"
  - "apps/web/lib/data/now.test.ts"
  - "apps/web/lib/fixtures/"
  - "packages/utils/src/planner/now-block.ts"
  - "packages/utils/src/planner/now-block.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "packages/validators/src/planner.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-016-now-lifted-card/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
out_of_scope:
  - "··· menu, behind, a meal between blocks, before Ready, go, Checklist blocks: USE-17"
  - "Long-press menu, Not today, reordering: USE-18"
  - "The tray open, empty and from a reminder: USE-19"
  - "All done, ahead, the empties: USE-20; a To-dos block, offline, error, loading: USE-21; meals with topics: USE-22"
  - "Start's running card and every timed Done: USE-23"
  - "Header +: the add sheet's ticket; the avatar menu: the account tickets; the desk's /today: work Today's ticket"
  - "Swap and Edit (the Item sheet): its own ticket"
criteria:
  - id: C1
    statement: 'At 402 mid-Wellness: "Now" and the avatar, the closed To-dos line, the leaf bar with "Wellness" and "7:05 to 8:00" and ··· alone, three faded done rows, Meditate lifted with its icon, verdigris dot, "10 min · 7:10", Start and Done, then Cold bath with its grip, and Now current in the tabs'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-016-now-lifted-card/evidence/success-402.png"
  - id: C2
    statement: 'After Done on Meditate, it sits checked and faded in place with "Took 10 min · Change" under it, and Cold bath is lifted'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-016-now-lifted-card/evidence/done-next-lifts-402.png"
  - id: C3
    statement: 'Cold bath tapped: it is lifted with "10 min · 7:20" and Meditate is back to a row in its own place; nothing is reordered'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-016-now-lifted-card/evidence/row-tapped-402.png"
  - id: C4
    statement: 'Change opens the sheet over a scrim: × on the left, "Start the cold bath · planned 2 min", "Time taken", the MinutesStepper at 2 and Save'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-016-now-lifted-card/evidence/time-taken-sheet-402.png"
  - id: C5
    statement: "Done on the lifted item writes doneAt and tookMin equal to its planned length and lifts the next undone item in order; a row's box completes it without lifting it; unchecking clears doneAt and tookMin"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "Saving 14 in the time-taken sheet records tookMin 14; closing it with × records nothing new, so the plan stands"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "activeBlock returns the block under way, else the next one today, else none; currentItem returns the first undone item in order unless one was made current"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: 'The accessibility tree names the lifted card "Meditate, now", Done "Done, Meditate", a row''s box "Cold bath, 10 min", the row "Cold bath, make current", the grip "Reorder Cold bath" and ··· "Wellness options", with the block''s name as the level-1 heading'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-016-now-lifted-card/evidence/a11y.txt"
  - id: C9
    statement: "The web app, @syn/utils and @syn/validators type-check"
    evidence: check
    command: "yarn check-types"
  - id: C10
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — now-lifted-card

## Build notes

The first of Now's tickets; USE-17 to USE-22 build on its screen, hook and scenarios. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — daily use", row "Row label · Now" (y 10200). Captures to match: `ux/day/now/captures/{success,done-next-lifts,row-tapped}-402.png`, `ux/day/running/captures/{took-change,time-taken-sheet}-402.png`. Taken at `/today?state=<name>` at 402.

- **Decisions that apply:**
  - D-USE-26: variation A, the lifted card with the tray closed; the header carries ··· alone.
  - D-USE-7: the lifted card. D-USE-17: a grip on every undone row (dragging is USE-18's).
  - D-USE-13: Done is one tap, no menu; it records the planned length; the row shows "Took 10 min · Change" for a few seconds, then the length; Change opens the `MinutesStepper` (1 min steps, floor 1, as the state file assumes) and Save.
  - Note 60: order is a plan, not a rule; a tapped row becomes current, the old one goes back to its place, times do not re-flow.
  - D-USE-39 (1): from 768 to 1023 the column is capped at `--content-text` and centred, Start and Done a fixed 160, right-aligned. D-USE-74: BottomNav to 1023.
  - Words: "Now", "To-dos", "<start> to <end>", "<n> min · <time>", "Start", "Done", "Took <n> min · Change", "<item> · planned <n> min", "Time taken", "Save". Announce a Done politely: "<item> done. <next> is next."
- **Interfaces:**
  - `@syn/utils` `planner/now-block.ts`: `activeBlock(blocks, now)` and `currentItem(items, chosenId | null)`, pure.
  - `lib/data/use-now.ts`: `useNow(dateKey)` over `useToday` (USE-7), returning `{ block, items, current, next }` derived in `select`, and `useSlotWrites()` with `done(item)`, `undo(item)`, `setTook(item, min)`.
  - `@syn/validators`: `slotUpdateInput { id; doneAt?; tookMin?; sortOrder?; skipped?; blockId? }`. The fixture server gains `writeSlots(placeSlotInput | slotUpdateInput)`: a set item's slot is placed on first touch.
  - `Scenario` gains `view?: { currentItemId?; open?: string }`, the UI a capture starts in, read once through `source.ts`. USE-17 onward set `open` for their menus and sheets.
  - `components/planner/`: `LiftedCard` and `TodosTrayLine` (closed only: "To-dos" and the first title ellipsised, "To-dos" alone when none; USE-19 opens it). `today/_components/now/`: `NowScreen`, `TookLine`, `TimeTakenSheet`.
  - Scenarios: `success` (the base Monday at 7:14 in Wellness), `done-next-lifts`, `row-tapped`, `took-change`, `time-taken-sheet`.
- **Per path:** `today/page.tsx` renders `NowScreen` in `split:hidden` and keeps the desk placeholder in `hidden split:block`. `lib/data/now.test.ts` holds C5 and C6 against the fixture server; `now-block.test.ts` holds C7. `a11y.txt` is read from the browser pane's accessibility tree.
- **Gotchas:**
  - The fixture's Monday must be Taylor's (D-USE-8): Wellness 7:05 to 8:00 with Pee and weigh 2, Water 1, Start the cold bath 2, Meditate 10, Cold bath 10; Training 8:00 to 8:57; Breakfast 9:00 to 9:30; Work 9:30 to 12:00.
  - Tests run on the hook's selectors and the fixture server; `apps/web`'s vitest is node-only.
  - USE-17 to USE-22 run in parallel on these files: append scenarios, never reorder; keep `NowScreen` a composition of block-form parts.
- **Model:** Opus 5.5 at medium. A smaller model derives the current item in JSX or shows "3 left".
