---
id: "USE-6"
size: small
objective: "A block's one repeat rule expands to the dates it hits, and a pure readDay turns blocks, dated changes and slots into the day's ordered blocks, each with its slots, so the day is read, never built"
slice_type: "pure date logic; risks a rule landing on the wrong days (month ends, leap day, interval weeks, count), a dated change applied to the wrong date, a DST date giving wrong instants, and a slot silently dropped"
non_negotiables:
  - "Pure and platform-free, over YYYY-MM-DD keys; instants only through day/wall-clock.ts."
  - "One rule per block, stored as RFC 5545 text a library could read; no EXDATE (a skipped date is a block_changes row)."
  - "A rule the expander cannot run is refused with a reason, never half-expanded."
  - "Never a date before the rule's start, nor after its UNTIL or COUNT."
  - "readDay drops no slot: one whose block is not on its date comes back as unplaced."
  - "@syn/utils never imports @syn/validators; input types are structural and generic."
  - "No new dependency."
devs_call: "Parser internals; how occursOn counts COUNT (iterating from the start is fine at this scale); helper names; test-table layout."
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/states/repeats-menu.md"
  - "C-USE-new-block-sheet-repeats-menu-3"
  - "D-USE-80"
  - "D-USE-87"
truth_files: "none: no behaviour ships; the New block sheet and Today read this in wave 2"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/utils/src/planner/rrule.ts"
  - "packages/utils/src/planner/rrule.test.ts"
  - "packages/utils/src/planner/day-read.ts"
  - "packages/utils/src/planner/day-read.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "packages/utils/src/index.ts"
depends_on:
  - "USE-3"
out_of_scope:
  - "Wording a rule (\"Weekly on Sunday\") and the Custom… form: the New block sheet ticket"
  - "This one, This and following, or All: the blocks wiring (wave 3)"
  - "The usual week's line for monthly and yearly blocks (D-USE-87): the Set my days ticket"
  - "Block items, day events and the pull rule: the data hooks and their own tickets"
criteria:
  - id: C1
    statement: "Each preset made from a start date (Daily, Weekly on its weekday, Monthly on its nth weekday, Annually on its date, Every weekday) is one rule, and over a month it hits exactly the dates Google's preset does; Does not repeat makes no rule"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Custom rules expand right: every N days, weeks, months or years; several weekdays; monthly by day or by nth or last weekday; ending on an UNTIL date (inclusive) or after COUNT dates"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Monthly on day 31 skips shorter months, annually on 29 February hits only leap years, a fifth weekday skips months without one, and no date falls before the start"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "parseRule refuses an unknown FREQ, an unsupported part such as BYSETPOS or BYHOUR, a missing DTSTART and malformed text, each with a reason"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "readDay returns the date's rule hits and one-date blocks, ordered by start; a block change skips the block or changes its times on its own date only; archived blocks are gone; each block carries its slots in sort order"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "On both DST change dates, each block's start and end instants are wallClockToInstant's for that date, and an end of 24:00 is the next date's 00:00"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "A slot whose block does not occur on its date, because it was skipped or its rule moved, is returned as unplaced"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "@syn/utils and its importers type-check"
    evidence: check
    command: "yarn check-types"
---

# Contract — repeat-rule-day-read

## Build notes

Wave 1, after USE-3, parallel to USE-5. Data contract: "A day is read, not built. Expand every block's rule for the date, apply `block_changes`, then join the slots." Rabbit hole 5: a pure expander covers Google's presets and Custom….

- **The stored text** (decided at this gate) is two RFC 5545 lines, `DTSTART;VALUE=DATE:20261018` then `RRULE:FREQ=WEEKLY;BYDAY=SU`. The start anchors INTERVAL and COUNT, and "This and following" can later end one rule and start another. `blocks.rrule` stays text, so no schema changes. USE-3's rrule shape check expects both lines.
- **Decisions that apply:**
  - D-USE-80: Repeats is Google Calendar's presets, worded from the start date. They are Does not repeat, Daily, Weekly on <day>, Monthly on the <nth> <day>, Annually on <date>, Every weekday (Monday to Friday), then Custom…. A block stores one rule, not one copy per weekday.
  - The default is weekly on the block's day from the usual week, and Does not repeat from This week (`repeats-menu.md`).
  - Custom… (`custom-recurrence.md`) is every N days, weeks, months or years. With week it takes weekdays; with month, a day ("on day 18") or an nth weekday ("on the third Sunday"). It ends Never, On a date, or After N times.
  - D-USE-87: monthly and yearly blocks show in This week on their dates only.
- **Supported parts:**
  - FREQ: DAILY, WEEKLY, MONTHLY or YEARLY.
  - INTERVAL.
  - BYDAY: a weekday list with WEEKLY; one ordinal weekday with MONTHLY, 1 to 5 or -1.
  - BYMONTHDAY: one, 1 to 31.
  - BYMONTH: one, with YEARLY.
  - UNTIL: a date, or a UTC date-time read as its date.
  - COUNT.
  - WKST: MO (the default) or SU, honoured for interval weeks.

  A rule with no BY part takes it from the start: its weekday, day of the month, or month and day. Monthly on the nth weekday uses nth = ceil(day / 7), and a fifth becomes -1.
- **Interfaces:**
  - `planner/rrule.ts`:
    - `RepeatPreset = "none" | "daily" | "weekly" | "monthly" | "annually" | "weekdays"`;
    - `presetRule(preset, startKey): string | null` (null for "none": the block takes `on_date`);
    - `parseRule(text): { ok: true; rule: RepeatRule } | { ok: false; reason: string }`;
    - `occursOn(rule, dateKey): boolean`;
    - `occurrences(rule, fromKey, toKey): string[]`, inclusive.
  - `planner/day-read.ts`:
    - `readDay<B extends DayBlock, S extends DaySlot>({ dateKey, timeZone, blocks, changes, slots })` returns `{ blocks: DayOccurrence<B, S>[]; unplaced: S[] }`;
    - `DayOccurrence { block; startsAt; endsAt; start: Date; end: Date; changed: boolean; slots: S[] }`;
    - `DayBlock { id; startsAt; endsAt; rrule; onDate; archivedAt }`; `DayBlockChange { blockId; onDate; skipped; startsAt; endsAt }`; `DaySlot { id; blockId; onDate; sortOrder }`. Times are `HH:MM`, and the names match USE-3's records.
- **Per path:**
  - `rrule.test.ts`: C1 to C4.
  - `day-read.test.ts`: C5 to C7.
  - Name each `describe` after its criterion. Use real dates in `America/Vancouver`: 1 November 2026 and 14 March 2027 for DST, and 29 February 2028 for the leap day.
  - `planner/index.ts` and `src/index.ts`: re-export.
- **Gotchas:**
  - Reuse `day/wall-clock.ts` and `day/week.ts` (`addDays`, `weekdayIndex`, `wallClockToInstant`); never hand-roll a zone offset.
  - A rule whose start does not match its own pattern is undefined in RFC 5545. Count only real hits.
  - An unparseable rule reads as no hits, and `readDay` never throws on it. The validator stops bad text earlier.
  - USE-5 adds to the same barrels in parallel. Append; never reorder.
- **Model:** Opus 5.5 at medium. A smaller model gets month ends and COUNT wrong, or reaches for an rrule library.
