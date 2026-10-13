---
id: "USE-20"
size: small
objective: 'When a block is all done Now keeps its rows faded and floats a footer, "<Block> complete", "Next: <Block>, <time>" and Start <Block>, with the add row while time is left and the quiet ahead line when done early; an empty Break offers End break; and after the day''s last block Now reads "The day''s blocks are done." with the tray open, on fixtures'
slice_type: "end-of-block and empty forms of Now; risks a count or a minutes-ahead figure, starting early moving the next block's span, a stale footer after a row is unchecked, and a close card shown where the footer belongs"
non_negotiables:
  - "No numbers about the day: no count of what was done or left, no minutes ahead; only block names, times and lengths."
  - "Start <next> makes that block the one in focus with its first item lifted; its span does not move (D-USE-72)."
  - "The footer shows only while every item is done; unchecking a row or adding an item takes it away, and the item lifts."
  - "An all-done block never shows the close card (D-USE-28); the close card is USE-25's, for the not-done case."
  - "The add row shows only while the block's end is still ahead (D-USE-30)."
  - "Only @syn/ui components and preset tokens; the footer floats on the fade from transparent to the background token (D-USE-25)."
devs_call: "The footer part's split; where the device keeps the block in focus (see Gotchas); the empty state's spacing."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/now/states/all-done-start-next.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/all-done-add-more.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/ahead.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/empty-break.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/empty-no-blocks.md"
  - "C-USE-now-all-done-start-next-1"
  - "C-USE-now-all-done-start-next-2"
  - "C-USE-now-all-done-add-more-1"
  - "C-USE-now-all-done-add-more-2"
  - "C-USE-now-ahead-1"
  - "C-USE-now-ahead-2"
  - "C-USE-now-empty-break-1"
  - "C-USE-now-empty-break-2"
  - "C-USE-now-empty-no-blocks-1"
  - "C-USE-now-empty-no-blocks-3"
waiver: "One surface, Now: the five states at a block's end and the day's end, which share the footer and the focus rule."
truth_files: "none: an epic proposal; promotion carries day/now/"
qa: Q1
reviewers:
  - assay
focus:
  - "the footer, ahead and empty states at 402: no counts, the next block's span unchanged (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/components/planner/"
  - "apps/web/lib/data/use-now.ts"
  - "apps/web/lib/data/now-end.test.ts"
  - "apps/web/lib/fixtures/"
  - "packages/utils/src/planner/now-block.ts"
  - "packages/utils/src/planner/now-block.test.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-020-now-all-done-empties/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-16"
  - "USE-17"
  - "USE-19"
out_of_scope:
  - "The add sheet that Add to <Block> opens: the add-from-the-rail ticket; the row opens its URL"
  - "The close card for a block with items left, and the last block's card: USE-25"
  - "The evening close: its own surface (D-USE-73)"
  - "Storing the block in focus on the server: the blocks-and-days wiring (wave 3)"
criteria:
  - id: C1
    statement: 'Wellness all done at 7:34: every row checked and faded, "Took 12 min · Change" under Cold bath, no card and no grips, and the footer with the check circle, "Wellness complete", "Next: Training, 8:00" and Start Training'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-020-now-all-done-empties/evidence/all-done-start-next-402.png"
  - id: C2
    statement: 'With time left, "+ Add to Wellness" and "Free until 8:00" sit above the footer'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-020-now-all-done-empties/evidence/all-done-add-more-402.png"
  - id: C3
    statement: 'Done before the end, the footer adds "Done before 8:00. Starting early is fine: Training keeps its end, 8:57." and, under Start Training, "Or a to-do until 8:00"'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-020-now-all-done-empties/evidence/ahead-402.png"
  - id: C4
    statement: 'An empty Break at 15:02 shows the cup glyph, "Break", "15:00 to 15:10", ··· and End break on the fade; no card, no rows, no Done'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-020-now-all-done-empties/evidence/empty-break-402.png"
  - id: C5
    statement: 'At 18:40 after the last block Now shows the tray open, then "The day''s blocks are done." and See the whole day, with no block header'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-020-now-all-done-empties/evidence/empty-no-blocks-402.png"
  - id: C6
    statement: "Start Training at 7:34 puts Training in focus with its first item current and its span still 8:00 to 8:57; End break puts the next block in focus; with no block left the view is empty"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "The footer is present only while every item is done: an unchecked row or an added item removes it and lifts that item; the add row is absent once the block's end has passed; Or a to-do opens the tray"
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

# Contract — now-all-done-empties

## Build notes

After USE-17 and USE-19. Captures to match: `ux/day/now/captures/{all-done-start-next,all-done-add-more,ahead,empty-break,empty-no-blocks}-402.png`; Paper `01M49AX02VV4SSBKNCN6NRTS6Y`, "USE — daily use", rows "Now" and "Now (cont.)". Each at `/today?state=<name>`.

- **Decisions that apply:**
  - D-USE-28: a fully checked block keeps its rows with this footer; the close card stays for the not-done case.
  - D-USE-25: the footer floats on the fade; Start <Block> is the primary, full width, ink, 52 px.
  - D-USE-72: starting early just starts the block; its span does not move. Adding an item to a done block un-completes it. The ahead line and the to-do link stand as drawn.
  - D-USE-30: a done block keeps an add row while it has time. D-USE-69: "Free until <time>" names unused time.
  - D-USE-74: End break opens the next block on Now with no close card; past its end the Break keeps End break and shows "Planned to end at <time>" (USE-17's line).
  - D-USE-26: the tray is closed by default; on the empty state it is open, as drawn, since the day holds nothing else.
  - Words: "<Block> complete", "Next: <Block>, <time>", "Start <Block>", "Add to <Block>", "Free until <time>", "Done before <end>. Starting early is fine: <next> keeps its end, <time>.", "Or a to-do until <end>", "Break", "End break", "The day's blocks are done.", "See the whole day".
- **Interfaces:**
  - `@syn/utils` `planner/now-block.ts`: `activeBlock` takes `focus: { blockId; at } | null`: a block put in focus by Start or End break is active from then until its own end, and an all-done or closed block yields to it. `blockEnding(block, items, now): { allDone; ahead; freeUntil: Date | null }`.
  - `useNow` gains `footer`, `addRow` and `empty`, and `useBlockFocus()` with `start(blockId)` and `endBreak()`.
  - `components/planner/`: `BlockDoneFooter`. `today/_components/now/`: `NowEmpty`, `EndBreakFooter`.
  - Scenarios: `all-done-start-next`, `all-done-add-more`, `ahead`, `empty-break`, `empty-no-blocks`.
- **Per path:** `now-end.test.ts` holds C6 and C7 against the fixture server and the selectors; `now-block.test.ts` gains the focus cases.
- **Gotchas:**
  - Nothing in 0012 records a block put in focus early. Keep it on the device for the day (`lib/hooks/use-remembered-toggle`'s storage, keyed by date, read in try/catch) and pass it to `activeBlock`; the wiring decides the server's home. This default is named in the gate table.
  - The two all-done frames differ only by the add row and Change's underline; one footer part draws both.
  - The fixture's last block is Wind-down [placeholder]; the empty state's tray is USE-19's `TodosTray` opened by view.
- **Model:** Opus 5.5 at medium. A smaller model prints "5 of 5 done" or moves Training's start to 7:34.
