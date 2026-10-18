---
id: USE-125
size: small
objective: "On the phone's This week, a day with no Work block still has Pool at its foot, and Pool still opens the pool sheet there; Place then lists no tier"
slice_type: "a fix found by the Paper assay (thread C, 2026-10-18) on USE-81 C2; risks offering a tier that does not exist, or a Place that writes nowhere"
non_negotiables:
  - "Pool shows at the foot of every This week day, a weekend or a day off included."
  - "On a day with no Work block, Pool opens the pool sheet as on any day; the place sheet opened from it lists no tier for that day and says so in words."
  - "Nothing is written until the place sheet's action, as C-USE-this-week-2 says."
  - "Pool sits above the tabs, as USE-124 places it."
  - "Only @syn/ui components and preset tokens (canon §2)."
devs_call: "The words the place sheet uses for a day with no Work block, kept to the register (no second person, nothing about a miss)."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/this-week/words-and-access.md"
  - "C-USE-this-week-2"
truth_files: "none: index.md already says \"Pool still opens; Place lists no tier\"; the code is brought to it"
qa: Q1
reviewers:
  - assay
focus:
  - "Saturday 17 at 402 with Pool and the sheet open (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/days/"
  - "apps/web/components/work/this-week/"
  - "apps/web/components/work/pool-sheet/"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-125-this-week-pool-without-work/evidence/"
depends_on:
  - "USE-81"
  - "USE-124"
out_of_scope:
  - "The empty first day's Up at and Lights out form, apart from adding Pool under it"
criteria:
  - id: C1
    statement: "Rendering This week on Saturday 17 (no Work block), a button named \"Pool\" is present and pressing it opens the dialog named \"Pool\""
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 402 on /dev/parts?state=this-week-no-work, Pool shows at the foot and opens the pool sheet over Saturday 17"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-125-this-week-pool-without-work/evidence/pool-no-work-402.png"
  - id: C3
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
---

# Contract — USE-125 this-week-pool-without-work

## Build notes

Found by the Paper assay of thread C on 2026-10-18: USE-81 C2 judged **mismatch**. On `this-week-no-work` (Saturday 17) the page shows only the "Set when the day starts and ends." form with Up at and Lights out. The DOM holds no button named for the pool, so "on a day with no Work block it still opens" cannot happen.

- **Approach:** the day's foot (Pool and the +) renders only when the day has blocks. Render it on every day, and let the place sheet handle a date with no Work block: no tier, with a line saying so.
- **Decisions that apply:** this-week index, states table: "no Work block | `states/no-work-block.md` | Pool still opens; Place lists no tier." C-USE-this-week-2: "Pool, then Place on any row: the place sheet opens; nothing moves until its action."
- **Interfaces:** the place sheet accepts a date with no Work block.
- **Per path:** `days/` and `this-week/`, the foot on every day; `pool-sheet/place-sheet.tsx`, the no-tier case; `lib/fixtures/`, a scenario with the sheet open on Saturday if the capture needs one.
- **Gotchas:** no-work-block.md is `not_drawn`; take the frame from the-day's foot. Build after USE-124, so the foot sits above the tabs.
- **Model:** Sonnet is enough.
