---
id: "USE-38"
size: small
objective: "After a late wake, Review the day lays out from the wake: Orient's line at 8:10, the block under way starting after it and keeping its end, passed blocks folded into \"Planned before 8:10 · Wellness\", a row that opens to a card per passed block with Move later and Leave; nothing says late or missed"
slice_type: "a derived layout and one disclosure on fixtures; risks a passed block drawn grey or red, a word that says late, a block under way that loses its end, Move later landing somewhere the ruling does not say, and a layout stored instead of derived"
non_negotiables:
  - "No word, mark or colour says missed, late, behind or skipped; passed blocks are words, not grey (note 62)."
  - "The layout is layoutFromWake over the day, derived on read; only Move later writes, today only, with Undo."
  - "Move later lands right after Orient at the wake and slides the blocks after it by its length (D-USE-69)."
  - "Leave writes nothing that marks the block; it stays folded and is not run."
  - "Only @syn/ui components and preset tokens; colour never alone."
devs_call: "The disclosure's part (Collapsible); the card's layout at 402; where the folded names are joined (\"Wellness, Training\")."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/late.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/late-passed-open.md"
  - "C-USE-review-the-day-late-1"
  - "C-USE-review-the-day-late-2"
  - "C-USE-review-the-day-late-3"
  - "C-USE-review-the-day-late-passed-open-1"
  - "C-USE-review-the-day-late-passed-open-2"
waiver: "Review the day's late state and its own disclosure, one surface; late-passed-open.md opens the row late.md draws"
truth_files: "none: promotion carries day/review-the-day/"
qa: Q1
reviewers:
  - assay
focus:
  - "late and passed open at 402 against review-the-day/captures/: nothing reads late, Training 8:15 to 8:57 (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/review/"
  - "apps/web/components/planner/day-column/"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-038-review-the-day-late/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-31"
  - "USE-35"
  - "USE-37"
out_of_scope:
  - "A later start's sheet and its once-a-day opening: the Make room and later-start sheets ticket"
  - "Orient's half (the wake stamp): USE-12"
criteria:
  - id: C1
    statement: "With the wake at 8:10 against Up at 7:00, the column starts at 8 with Orient's line at 8:10, Training 8:15 to 8:57, then Breakfast, Work, Lunch; one row under the tray reads \"Planned before 8:10 · Wellness\" with a chevron; nothing is grey, red or worded late"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-038-review-the-day-late/evidence/late-402.png"
  - id: C2
    statement: "The row opened shows a card per passed block, \"Wellness\" over \"7:05 to 8:00\" with its 3 px leaf edge, Move later and Leave, and the column moves down by it"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-038-review-the-day-late/evidence/late-passed-open-402.png"
  - id: C3
    statement: "Through the fixtures, Move later puts Wellness right after Orient at 8:15 for today only with the later blocks slid by its length, and Undo restores the day; Leave writes nothing"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C5
    statement: "It lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — review-the-day-late

## Build notes

After USE-31, the engine (USE-35) and the edits ticket, whose `useDayEdits` and `useUndoToast` this one uses. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — daily use", row "Review the day". Captures to match: `ux/day/review-the-day/captures/late-402.png` and `late-passed-open-402.png`. Take ours at `/today/review?state=review-late` and `?state=review-late-passed-open`.

- **Decisions that apply:**
  - N3's "woke late" row: the column starts at the real wake, passed blocks fold into one row that opens, and nothing is marked missed. The fixture's wake is 8:10 (D-USE-8's morning).
  - The block under way keeps its end and starts after Orient; go mode starts at the first block after Orient (open-1, as drawn).
  - D-USE-69: Move later lands right after Orient at the wake, the blocks after it sliding by its length, with an Undo Toaster.
  - Words: "Planned before <wake> · <block>[, <block>]"; "Move later"; "Leave". "Up at" is the day's, from `useToday` (USE-14's bounds once wired; the scenario's value on fixtures).
  - The row is a disclosure button with `aria-expanded`. The cards are `--color-surface` with `--radius-control`; Move later is an outlined small `Button`, Leave a muted ghost.
- **Interfaces:** the view model runs `layoutFromWake(day, { upAt, wokeAt })` from USE-35, with `wokeAt` taken from `dayRecord.orientedAt`. Move later applies `moveLater`'s plan through `useDayEdits`. Scenarios: `review-late` and `review-late-passed-open`, both with now at 8:10.
- **Gotchas:**
  - A tap on Leave removes the card and keeps the row's name. Nothing is written, and no "skipped" is recorded.
  - The later-start sheet must not open on these two scenarios. They pin its once-a-day flag as already seen, so the captures stay as drawn.
- **Model:** Opus 5.5 at medium. A smaller model greys the passed block, words it late, or stores the shifted layout.
