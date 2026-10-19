---
id: "USE-72"
size: small
objective: "/week at the desk shows \"Plan the week\" with ‹ 12 to 18 Oct ›, the lens switch remembered per person and Today, and the Priority lens: Events, the tiers with their squares and Fits as rows, seven day columns with today marked, chips in surface grey with their meta and due badges worked out per column, \"Work ends <time>\" or \"Nothing slotted yet\" at each foot; plus the empty week, a past day, loading, error and offline, on fixtures"
slice_type: "a desk planning grid; risks a due badge worked out from today instead of its column, a firing time on a chip, a past day saying missed, Fits counted at the bottom of ranges, and the Week shown below 1024"
non_negotiables:
  - "A chip never shows firing time; a due badge shows from two days before its date, worked out for its own column (C-USE-week-5, D-USE-98)."
  - "Fits is a time from USE-8's fitInBlock at the top of the ranges, never a count; red only on \"Due today\" and the Urgent glyph (C-USE-week-8)."
  - "A past day is faded and still editable; nothing says missed (C-USE-week-past-day-1)."
  - "The Week shows only from 1024; below it /week renders the phone's answer link to This week (C-USE-week-4)."
  - "Reads through useWeek and usePool; composes @syn/ui and USE-10's parts; preset tokens only (canon §2)."
  - "The lens choice persists per person through the remembered-toggle hook (C-USE-week-2)."
devs_call: "File split under week/_components/; the 120 px column floor and sideways scroll; the empty pool panel's slot (filled by USE-74); week navigation's query (?week=)."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/week/index.md"
  - "specs/web/epics/USE-daily-use/ux/work/week/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/work/week/states/priority-lens.md"
  - "specs/web/epics/USE-daily-use/ux/work/week/states/empty-week.md"
  - "specs/web/epics/USE-daily-use/ux/work/week/states/past-day.md"
  - "specs/web/epics/USE-daily-use/ux/work/week/states/loading.md"
  - "specs/web/epics/USE-daily-use/ux/work/week/states/error.md"
  - "specs/web/epics/USE-daily-use/ux/work/week/states/offline.md"
  - "C-USE-week-1"
  - "C-USE-week-2"
  - "C-USE-week-4"
  - "C-USE-week-5"
  - "C-USE-week-8"
  - "C-USE-week-priority-lens-1"
  - "C-USE-week-priority-lens-2"
  - "C-USE-week-empty-week-1"
  - "C-USE-week-past-day-1"
  - "C-USE-week-loading-1"
  - "C-USE-week-error-1"
  - "C-USE-week-offline-1"
  - "D-USE-41"
  - "D-USE-42"
  - "D-USE-94"
  - "D-USE-98"
waiver: "The Week's frame and Priority lens, with its edge states (empty week, past day, loading, error, offline), each holding its own criteria; one page."
truth_files: "none: promotion carries work/week/"
qa: Q1
reviewers:
  - assay
focus:
  - "the Priority lens at 1728 against priority-lens-1728 (without the popover), and the empty week, past day, loading, error and offline (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/week/page.tsx"
  - "apps/web/app/(shell)/week/_components/"
  - "apps/web/components/work/"
  - "apps/web/lib/data/use-week-view.ts"
  - "apps/web/lib/data/week-view.test.ts"
  - "apps/web/lib/fixtures/"
  - "apps/web/lib/routes.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-072-week-priority-lens/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-8"
  - "USE-10"
  - "USE-36"
  - "USE-55"
  - "USE-56"
out_of_scope:
  - "The Time lens and the event popover: USE-73; the pool panel: USE-74; drag, + Add to <tier> and its popover: USE-75; the Block panel: USE-76; Spread: USE-77"
  - "A chip's Item sheet (the right panel): USE-64's sheet, opened by link"
  - "The week read itself: USE-36's useWeek"
criteria:
  - id: C1
    statement: "dueBadge for an item due Thu gives Tue \"Due Thu\" and Wed \"Due tomorrow\" in warning, Thu \"Due today\" in danger, and Mon none; fitsLine gives \"Work ends 16:20\" for Monday's fixture and \"Nothing slotted yet\" for a Work day with nothing slotted"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 1728 /week shows the rail with Week current, the pool panel's place at 360, \"Plan the week\" with \"‹ 12 to 18 Oct ›\", Priority / Time and Today, and the Priority lens: Events, Primary, Secondary, Stretch and Fits rows, Mon 12 marked today, Sat and Sun muted with \"No work blocks\", chips with their meta and due badges"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-072-week-priority-lens/evidence/priority-lens-1728.png"
  - id: C3
    statement: "At 1728 the empty week shows blocks and events with every Fits line \"Nothing slotted yet\"; a past day is faded with its chips still openable"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-072-week-priority-lens/evidence/empty-and-past-1728.png"
  - id: C4
    statement: "At 1728 loading shows the rail, header and heads real over still skeleton chips; error shows RegionRetry with Try again in the failing region only; offline shows the StatusLine under the header"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-072-week-priority-lens/evidence/loading-error-offline-1728.png"
  - id: C5
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — week-priority-lens

## Build notes

Wave 2. USE-4 left `/week` a placeholder; this ticket makes it the Week. Match `ux/work/week/captures/priority-lens-1728.png` (the popover and the Tue drop belong to USE-75). Paper page "USE — work", row "Week".

- **Decisions that apply:**
  - D-USE-41: one view, two lenses, the same pool and rules; Priority: an 84 px label column (Events, Primary, Secondary, Stretch, Fits, each tier with its square) and seven equal columns; "+ Add to <tier>" on a cell's hover (USE-75); each foot "Work ends 16:20" or "Nothing slotted yet". An Urgent row shows above Primary only in a week where something is Urgent [ASSUMPTION].
  - Header: "Plan the week" in the display serif (30/36), "‹ 12 to 18 Oct ›" muted; the lens `SegmentedControl` Priority / Time; Today (outline, 36 px). ‹ and › step a week; Today returns to this week [ASSUMPTION].
  - Today's column: "today" in `--color-now` and a 2 px `--color-now` line under its head. Saturday and Sunday heads muted, no ›. A day head's › opens the opened day (USE-58).
  - D-USE-42: chips in surface grey, no border, radius 5; an item can sit in several cells as sessions, "session n of N"; events are plum chips with their time.
  - D-USE-98: due badges per column: warning (D-USE-72's `warning-text` on the warning fill) from two days before, danger (`--color-destructive-text` on red-50) on the day and after; no firing time on a chip.
  - D-USE-94: from 1024 to 1727 the pool stays at 360 and the columns shrink to about 120 px, then the week scrolls sideways.
  - Edges: empty week (blocks and events show; "Nothing slotted yet" each day); past day (faded, editable, no red); loading (skeleton chips and rows, nothing shimmers); error (RegionRetry in the failing region, the other live); offline (StatusLine under the header; placing works and syncs later; Linear lookups wait).
- **Interfaces:** `useWeekView(mondayKey)` builds `WeekView { days: { dateKey; head; isToday; past; events; cells: Record<Tier, ChipView[]>; fits: string }[] }` from `useWeek`, `usePool`, `useLinear`, with pure `dueBadge(dueOn, columnDate)` and `fitsLine(day)` beside it (tested). `weekRoute({ week })` gains `?week=`.
- **Per path:** `week-view.test.ts` holds C1. Scenarios `week-priority`, `week-empty`, `week-past-day`, `week-loading`, `week-error`, `week-offline`. Below 1024 the page shows one line linking Set my days › This week.
- **Gotchas:**
  - The lens is remembered with `use-remembered-toggle`; `?lens=` may override it for captures.
  - Weekend columns with no Work block read "No work blocks" as one region.
- **Model:** Opus 5.5 at medium. A smaller model works the due badge out from today, or shows firing minutes on chips.
