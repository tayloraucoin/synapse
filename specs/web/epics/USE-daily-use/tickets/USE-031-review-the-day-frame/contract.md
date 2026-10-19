---
id: "USE-31"
size: small
objective: "/today/review shows the day already written in, focused: ‹ Orient over the date, the To-dos tray pinned, the day column at 96 px an hour with Orient's locked line, blocks with their bullet grid, meals, Work by tier and transitions, and Ready, go on its fade, which stamps the day and hands off to the welcome; at 1440 one capped column; on fixtures through useToday"
slice_type: "a new day-column screen on fixtures with two @syn/ui additions; risks cells that grow instead of counting \"+n more\", the tray covering the day, tabs or a rail on a focused screen, Ready, go writing twice, and a block taller than its time"
non_negotiables:
  - "Focused at every width: no AppHeader, no tabs, no rail, no avatar (D-USE-10, D-USE-39)."
  - "96 px an hour (D-USE-23); a block's height is its span; bullets sit in two fixed cells a line and \"+n more\" counts only what does not fit."
  - "Ready, go writes readyAt once and goes to the welcome; after it, /today/review goes on to the welcome or Now (D-USE-71)."
  - "The tray pushes the column down and never shows a count."
  - "Breadcrumb and the bullet grid are presentational @syn/ui additions with stories; nothing domain-aware enters @syn/ui."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID); kinds named in words, never colour alone; no second person, nothing red."
devs_call: "File split under today/review/_components; DayColumn's view model; how the column scrolls to Orient on open; the bullet grid's cell maths at 402 and 1440."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/success.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/tray-open.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/words-and-access.md"
  - "C-USE-review-the-day-success-1"
  - "C-USE-review-the-day-success-2"
  - "C-USE-review-the-day-success-3"
  - "C-USE-review-the-day-tray-open-1"
  - "C-USE-review-the-day-tray-open-2"
  - "C-USE-review-the-day-1"
  - "C-USE-review-the-day-3"
  - "C-USE-review-the-day-4"
  - "C-USE-review-the-day-6"
  - "D-USE-7"
  - "D-USE-10"
  - "D-USE-23"
  - "D-USE-25"
  - "D-USE-39"
  - "D-USE-65"
waiver: "One surface, Review the day: the success frame, the tray-open state that only places USE-19's tray, and the index's own criteria and access, kept in words-and-access.md"
truth_files: "none: promotion carries day/review-the-day/"
qa: Q1
reviewers:
  - assay
focus:
  - "success at 402 and 1440 and the tray open against review-the-day/captures/: the 96 px hour, fixed cells and \"+n more\", Ready, go on its fade (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/review/"
  - "apps/web/components/planner/day-column/"
  - "packages/ui/src/composed/navigation/breadcrumb/"
  - "packages/ui/src/composed/display/schedule-block/"
  - "packages/ui/src/index.ts"
  - "packages/ui/package.json"
  - "apps/web/docs/design/components.md"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
  - "packages/utils/src/planner/bullet-grid.ts"
  - "packages/utils/src/planner/bullet-grid.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-031-review-the-day-frame/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-12"
  - "USE-19"
out_of_scope:
  - "Loading, error, partial and offline: the system-states ticket"
  - "The rail + and its hint, the first-change line, swap's Toaster, remove, late and no-work: the edits ticket"
  - "The Sunday frames and the now-line: the loose-day ticket"
  - "The tray's rows, reminders and To-do sheet: USE-19; the Item sheet, Block view and add sheet: their tickets"
  - "The welcome: its ticket; this one routes to it"
criteria:
  - id: C1
    statement: "At 402 a usual Monday shows ‹ Orient over \"Monday, 12 October\", the closed tray, Orient's locked line \"Orient · 5 min\" at the top, Wellness with three bullets and \"+2 more\", Training with its drives as dashes, Breakfast and Lunch as dashed bands, Work with Primary and Secondary, and Ready, go on its fade; no tabs, no avatar"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-031-review-the-day-frame/evidence/success-402.png"
  - id: C2
    statement: "At 1440 one column centred and capped at --content-text, the axis at 96 px an hour, Wellness's bullets on one line with \"+2 more\", Ready, go right-aligned at 240; no rail, no tabs"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-031-review-the-day-frame/evidence/success-1440.png"
  - id: C3
    statement: "With the tray open, its rows push the column down and nothing overlaps the day; no count shows"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-031-review-the-day-frame/evidence/tray-open-402.png"
  - id: C4
    statement: "A bullet opens ?sheet=item&id=<slot>, a block opens /today/block/<id>, ‹ Orient goes to /orient, and Ready, go goes to /today/ready; then /today/review goes on to the welcome; each read from the URL after the tap"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-031-review-the-day-frame/evidence/routes.txt"
  - id: C5
    statement: "bulletGrid lays items into two fixed cells a line within a block's height, the last cell \"+n more\" with n what does not fit, and none when all fit"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "Through the fixture server, Ready, go writes readyAt once and a second press keeps the first; resolveDayEntry then answers welcome"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "The web app, @syn/ui and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
  - id: C8
    statement: "They lint clean"
    evidence: check
    command: "yarn lint"
---

# Contract — review-the-day-frame

## Build notes

Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — daily use", rows "Review the day" (y 3900) and "(cont.)" (y 5160). Captures to match: `ux/day/review-the-day/captures/success-402.png`, `success-1440.png`, `tray-open-402.png`. Take ours at `/today/review?state=review-success` and `?state=review-tray-open`.

- **Decisions that apply:**
  - D-USE-7 and D-USE-23: the bullet grid at 96 px an hour. Variations B, C and D were not picked.
  - D-USE-10: `Breadcrumb` "‹ Orient" (a 14 px chevron and the word, label size, muted) over the date title. It replaces N3's "Back to Orient".
  - D-USE-25: Ready, go floats on a fade from transparent to `--color-background`, with any Toaster above it.
  - D-USE-39 and D-USE-65: focused at every width. At 1440 the column is capped at 720, the gutter 56 px, and Ready, go right-aligned, a fixed 240 wide. The desk's `/today` before Ready, go is this frame (Today's ticket redirects to it).
  - D-USE-71: Ready, go opens the welcome, then Now.
  - success.md has every size: blocks from x 60, 322 wide, the kind's chip fill with a 3 px edge in its dot colour; cells 145 px with 8 by 4 px gaps and a 6 px dot; transitions as a 6 × 1.5 px dash in muted italic; meals as dashed bands with the fork-and-knife glyph.
  - Access: focus opens on the title (`tabIndex -1`). A block is a button "<name>, <start> to <end>". A bullet is a button "<item>, in <block>". "+2 more" belongs to the block's button.
- **Interfaces:**
  - `@syn/ui`: `Breadcrumb { label; href; ariaLabel }`, and `ScheduleBlock` gains `bullets?: { label; tone: "dot" | "transition" }[]` with `moreCount`.
  - `bulletGrid(items, { heightPx, cellsPerLine: 2, lineHeightPx }): { shown; more }` in `@syn/utils` planner.
  - `components/planner/day-column/`: `DayColumn { hours; orient; blocks; onBlock; onBullet }` from props only. Schedule and Block view reuse it later.
  - Fixtures: `readyGo(dateKey, at)`. Scenarios `review-success` (D-USE-8's Monday, now 6:58) and `review-tray-open`. Orient's line sits at the day's Up at, from `useToday`.
- **Per path:** `routes.txt` is read in the browser pane after each tap. `todayBlockRoute(id)` is added to `routes.ts` if Block view has no helper yet.
- **Gotchas:**
  - Name the web column apart from the legacy `ScheduleOverlays`. Compose `ScheduleAxis`; don't fork it.
  - Bullets are 20 px lines, below the 44 px target. The block's button carries the tap, with the bullet as a shortcut.
  - The Toaster slot above Ready, go is laid out here and filled by the edits ticket.
- **Model:** Opus 5.5 at medium. A smaller model lets blocks grow to fit their bullets, drops the fixed cells, or shows tabs on a focused path.
