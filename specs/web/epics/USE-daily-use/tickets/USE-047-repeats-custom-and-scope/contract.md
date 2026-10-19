---
id: "USE-47"
size: small
objective: "Repeats › Custom… opens a step inside the sheet (every N days, weeks, months or years; weekdays; by date or nth weekday; never, on a date or after N times) that stores one RRULE and reads back in words, and changing a repeating block from a dated day asks This one, This and following, or All, on fixtures"
slice_type: "a sheet step and a scope question on fixtures; risks a rule stored per weekday instead of one RRULE, words that disagree with the rule, a This and following that drops or doubles a date, and an edit on one date that silently changes every week"
non_negotiables:
  - "One RFC 5545 rule per block (D-USE-80), built and read by pure functions in @syn/utils that USE-6's parseRule accepts."
  - "The summary line and the Repeats trigger read the rule in words, never a count of dates."
  - "This one writes a change for that date; This and following ends the old rule the day before and starts the new from that date; All edits the block. No date is dropped or doubled."
  - "The step is inside its sheet, back on the left, never a second sheet; the To-do sheet reaches the same step."
  - "Only @syn/ui components and preset tokens; nothing red."
  - "Every state of this ticket is reachable by ?state= (canon C-P08)."
devs_call: "Where the question shows (a dialog or a sheet step); the month choice's control; file split; names inside the pure module."
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/states/custom-recurrence.md"
  - "C-USE-new-block-sheet-custom-recurrence-1"
  - "C-USE-new-block-sheet-custom-recurrence-2"
  - "D-USE-80"
  - "D-USE-87"
truth_files: "none: specs/web/ux/set-my-days/ is promoted with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "the custom step and the scope question at 402, and the rule's words against its dates (assay)"
operator_review: false
planned_paths:
  - "packages/utils/src/planner/rule-words.ts"
  - "packages/utils/src/planner/rule-words.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "apps/web/components/planner/new-block-sheet/"
  - "apps/web/components/planner/repeat-scope/"
  - "apps/web/lib/fixtures/planner/"
  - "apps/web/lib/data/use-planner-writes.ts"
  - "apps/web/app/(shell)/days/"
  - "specs/web/epics/USE-daily-use/tickets/USE-047-repeats-custom-and-scope/evidence/"
depends_on:
  - "USE-4"
  - "USE-6"
  - "USE-7"
  - "USE-10"
  - "USE-36"
  - "USE-42"
  - "USE-46"
out_of_scope:
  - "The To-do sheet's own Repeats menu: USE-28 opens this step"
  - "A monthly or yearly block's line in the usual week's day row: Gloss's words, then Set my days"
criteria:
  - id: C1
    statement: "Custom… for Sunday reset shows \"Sunday reset · New block\" over \"Custom recurrence\", every 1 week on W and S, Ends Never, and \"Every Wednesday and Sunday, 13:00 to 16:00. It shows on both days in the usual week.\" with Done"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-047-repeats-custom-and-scope/evidence/custom-recurrence-402.png"
  - id: C2
    statement: "Moving a repeating block's times on a This week date asks This one, This and following, or All, with This one first"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-047-repeats-custom-and-scope/evidence/repeat-scope-402.png"
  - id: C3
    statement: "buildRule turns the step's choices into one rule parseRule accepts (every week on Wednesday and Sunday, month by day 18 or the third Sunday, until a date, after 13 times), and describeRule words it back (\"Weekly on Wednesday and Sunday\")"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "Through the fixtures, This and following on 15 October leaves the old block's dates before it and the new block's from it, with no date dropped or doubled; This one writes one block change; All edits the block"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "The web app and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "Lint passes"
    evidence: check
    command: "yarn lint"
---

# Contract — repeats-custom-and-scope

## Build notes

After the New block sheet (its Repeats menu ends at Custom…) and Set my days part 2 (its This week edits). Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — set up", row "New block sheet" (y 5040). Capture to match: `ux/set-my-days/new-block-sheet/captures/custom-recurrence-402.png`. Take ours at `/days?…&sheet=new-block&state=custom-recurrence` and `?state=repeat-scope`.

- **Decisions that apply:**
  - D-USE-80: Custom… is this form; it stores one RRULE.
  - The step: back chevron left; the caption "<name> · New block" over "Custom recurrence"; Repeat every (a number and day, week, month or year, with "day, week, month or year" under it); Repeat on (seven round toggles, with week); with month, on day 18 or on the third Sunday [ASSUMPTION: a two-way choice]; Ends: Never, On (a date field that wakes), After (n times); the summary line; Done returns with Repeats reading the rule in words; back returns with no change.
  - Editing a repeating block later asks This one, This and following, or All, as Google does, extending D-USE-24's scoped menu [ASSUMPTION: the same question on a drag or a delete of a repeating block]. It is asked only from a dated day; the usual week's edits are every week's (C-USE-set-my-days-4) and This week's default is the date (C-USE-set-my-days-5), so This one leads.
  - D-USE-87: a monthly or yearly block appears in This week on its dates only.
- **Interfaces:**
  - `@syn/utils` planner `rule-words.ts`: `buildRule(form: { every: number; unit: "day" | "week" | "month" | "year"; weekdays: number[]; monthBy: "day" | "nth" | null; ends: { kind: "never" } | { kind: "on"; date } | { kind: "after"; count } }, startKey): string` and `describeRule(rule: RepeatRule): string`.
  - `RepeatScope { onAnswer(scope: "this" | "following" | "all") }` in `components/planner/repeat-scope/`.
  - The fixture write `splitBlock({ id, fromDate, patch })` beside USE-36's writes, with its Undo; `usePlannerWrites` gains `editRepeating({ id, date, patch, scope })`.
- **Per path:** `rule-words.test.ts` holds C3; the planner fixtures' test gains C4.
- **Gotchas:**
  - Weekdays are Monday 0, as `RepeatRule`.
  - UNTIL on the old rule is the day before `fromDate`; COUNT on a split rule is recounted, or the split refused in words.
  - Append to `planner/index.ts`; others add lines at the same time.
- **Model:** Opus 5.5 at medium. A smaller model stores a rule per weekday, or edits every week when one date was asked.
