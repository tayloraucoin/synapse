---
id: "USE-8"
size: small
objective: "Pure functions every device runs the same way: which work item is Next, whether an item fits a Work block at the top of its range (and by how much it doesn't), each session's n of m and the next one, and the one daily reminder shown while something fires"
slice_type: "pure logic over a day's slots; risks Next landing on a firing, running or waiting item, a fit counted at the bottom of a range or ignoring a meeting inside the block, sessions counted in array order, and the reminder line showing when nothing fires or everything does"
non_negotiables:
  - "Pure and platform-free: no Date.now(), no I/O, no React; the caller passes every instant and the clock states."
  - "Next is order only: Urgent, Primary, Secondary, Stretch, then sort order; never by time, size or due date."
  - "Fit is counted at the top of every range, in whole minutes; it returns lengths, never words."
  - "Total: any input yields one answer and never throws."
  - "@syn/utils never imports @syn/validators; inputs are structural, tiers and sizes from @syn/constants."
  - "No new dependency."
devs_call: "Helper names; whether fit returns Dates or minutes from the block's start beside runsTo; test-table layout."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/today/index.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/place-from-the-pool/states/doesnt-fit.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/sessions.md"
  - "D-USE-43"
  - "D-USE-45"
  - "D-USE-57"
  - "C-USE-sessions-1"
waiver: "Four small pure functions with no UI; each reads its rule from a different surface (Next from Today, fit from Place, sessions from Sessions), and one ticket owns the work/ folder's first barrel."
truth_files: "none: no behaviour ships; Today, Place and the Item sheet read these in wave 2"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/utils/src/work/next.ts"
  - "packages/utils/src/work/next.test.ts"
  - "packages/utils/src/work/fit.ts"
  - "packages/utils/src/work/fit.test.ts"
  - "packages/utils/src/work/sessions.ts"
  - "packages/utils/src/work/sessions.test.ts"
  - "packages/utils/src/work/while-it-fires.ts"
  - "packages/utils/src/work/while-it-fires.test.ts"
  - "packages/utils/src/work/index.ts"
  - "packages/utils/src/index.ts"
  - "packages/utils/package.json"
depends_on:
  - "USE-3"
  - "USE-5"
out_of_scope:
  - "The words (\"fits, 40 min free\", \"doesn't fit it by 1 h 40\", \"session 1 of 3\"): each surface's ticket"
  - "Status fill and the Waiting group's statuses from Linear: the Linear sync ticket; Next takes waiting as a flag"
  - "This session or All sessions, and Spread's preview: the Item sheet and Spread tickets"
  - "The to-do pool, the pull rule and client resolution: USE-9"
criteria:
  - id: C1
    statement: "resolveWorkNext walks Urgent, Primary, Secondary, Stretch, then sort order, and returns the first slot not firing, running, done or waiting; a brought-back slot first in order is Next again"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "With nothing in hand, nothing left to do and at least one slot firing, it returns all_firing; with no candidates and nothing firing, none"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "fitInBlock places the item at the end of its tier after the tiers above it, at the top of every range, minus day events inside the block counted once where they overlap, and returns runsTo with freeMin when it fits or overMin when it doesn't"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "topMinutes takes a session's own length, then the item's top, then its size's default top; Huge with no top never fits; firstDayWithRoom returns the first later day whose tier holds the item, or none"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "countSessions numbers one item's slots by date as n of m, and nextSession returns the first undone session after a date; a session's Done never marks the task done"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "pickWhileItFires returns the first undone daily reminder by time only while something fires and not everything does, and nothing otherwise"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "@syn/utils and its importers type-check"
    evidence: check
    command: "yarn check-types"
---

# Contract — work-pure-functions

## Build notes

Wave 1, after USE-3 and USE-5, parallel to USE-7 and USE-9. Every device derives the same answer; the hooks call these and the fixtures never precompute them.

- **Decisions that apply:**
  - D-USE-43: Next is order only, after FLO-6's resolve-next: Urgent, Primary, Secondary, Stretch, then tier order; the first item neither firing nor done. When everything fires: "Everything is firing."
  - D-USE-45: while an item runs, the running card holds the lift and Next is the outlined row, so the running slot is never Next.
  - D-USE-78: Blocked, Paused and In review leave the tiers for Waiting, so a waiting slot is never Next.
  - Size and length (dev note): the day plans with the top of a range. Defaults: Quick 15 to 30 min, Small 30 to 60, Medium 1 to 2 h, Large 2 to 4 h, Huge 4 h or more.
  - Doesn't fit: "<size> runs <range>; <Day>'s <Tier> already holds <length> at the top of its ranges"; the next day with room is the first later day this week whose chosen tier holds the item at the top of its range [ASSUMPTION, as the file says].
  - D-USE-57, D-USE-65: a session's Done names the next session; the last session's Done does not mark the task done.
  - D-USE-53: "While it fires: <reminder>" shows once while a daily reminder is undone; when everything fires, the reminder line hides.
- **Interfaces** (`work/`):
  - `resolveWorkNext({ slots: { id; tier; sortOrder; waiting: boolean }[]; states: ReadonlyMap<string, SlotClockState> }): WorkNext`, where `WorkNext = { kind: "slot"; slotId } | { kind: "all_firing" } | { kind: "none" }`. A slot missing from `states` is idle.
  - `topMinutes({ lengthMin; lengthMaxMin; size }): number | null`. `null` means no top (Huge with no range). An unsized item with no length counts 0.
  - `fitInBlock({ block: { start: Date; end: Date }; slots: { tier; topMin: number | null }[]; busy: { start: Date; end: Date }[]; tier; topMin }): { fits: true; runsTo: Date; freeMin } | { fits: false; runsTo: Date | null; overMin: number | null }`. It counts the tiers at and above `tier`. A lower tier slides; Stretch gives first.
  - `firstDayWithRoom(days: { dateKey; block: { start; end } | null; slots; busy }[], tier, topMin): string | null`.
  - `countSessions(slots: { id; workItemId; onDate; doneAt }[]): Map<string, { n: number; of: number }>`, and `nextSession(slots, workItemId, afterDateKey): string | null`.
  - `pickWhileItFires({ todos: { id; remindAt; rrule; onDate; doneAt; archivedAt; createdAt }[]; dateKey; next: WorkNext; firingCount: number })`. It returns a to-do id or null. A daily reminder has a `remindAt` and a `FREQ=DAILY` rule (`parseRule`), and is dated on or before `dateKey` or undated.
- **Per path:** one test file per function, `describe` named after its criterion. `work/index.ts` is this folder's barrel, and `src/index.ts` re-exports it under a `/* ---- work (USE-8) ---- */` banner.
- **Gotchas:**
  - Tier order comes from `WORK_TIERS` in `@syn/constants`. If `packages/utils/package.json` lacks it, add `"@syn/constants": "workspace:*"`.
  - USE-9 adds `work/client.ts` in parallel. Whichever lands second appends to `work/index.ts`; never reorder.
  - A `done` slot holds its top in fit (the plan, not the clock).
  - Merge `busy` before subtracting, so two overlapping meetings are not counted twice.
  - `resolveNext` in `workflow/` is legacy FLO code. Read it for the shape; do not import or edit it.
- **Model:** Opus 5.5 at medium. A smaller model lets the running item be Next, plans with the bottom of a range, or counts sessions in array order.
