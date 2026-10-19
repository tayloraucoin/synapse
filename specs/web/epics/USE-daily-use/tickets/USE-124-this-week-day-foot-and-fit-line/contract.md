---
id: USE-124
size: small
objective: "On the phone's This week day, Pool and the + sit above the tabs where the thumb reaches them, and the Work block's fit line reads whole"
slice_type: "a fix found by the Paper assay (thread C, 2026-10-18) on USE-81 C1 and C3; risks content hidden under fixed chrome at other heights, and a block's text clipped by its time-height"
non_negotiables:
  - "Pool and the + sit wholly above BottomNav at 402 × 874, with nothing they cover; the day's last block scrolls clear of them."
  - 'The fit line "Doesn''t fit by 40 min at the top of the ranges" shows whole, in ink, medium, never red (D-USE-105).'
  - "A Work block open to its tiers grows to hold its rows and fit line, or the fit line sits under it; its text is never cut by the block's height."
  - "Offline, Pool stays live and the + reads as read-only, both visible."
  - "Pool is 52 px high and the + a --size-row circle, both above the 44 px target."
  - "Only @syn/ui components and preset tokens (canon §2)."
devs_call: "Whether the open Work block grows past its time-height or the hour scale stretches around it."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/this-week/words-and-access.md"
  - "C-USE-this-week-1"
  - "D-USE-105"
truth_files: "none: the-day.md and words-and-access.md already say it; the code is brought to them"
qa: Q1
reviewers:
  - assay
focus:
  - "the day at 402 against `this-week / the day, work tiers, Pool entry / 402 / light` (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/days/"
  - "apps/web/components/work/this-week/"
  - "specs/web/epics/USE-daily-use/tickets/USE-124-this-week-day-foot-and-fit-line/evidence/"
depends_on:
  - "USE-81"
out_of_scope:
  - "The pool and place sheets"
  - "The desk's day column (USE-121)"
criteria:
  - id: C1
    statement: 'At 402 × 874 on /dev/parts?state=this-week-day, Pool''s and the +''s bounding boxes end above BottomNav''s top, and the Work block shows "Doesn''t fit by 40 min at the top of the ranges" uncut'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-124-this-week-day-foot-and-fit-line/evidence/the-day-402.png"
  - id: C2
    statement: "At 402 on this-week-offline, the StatusLine, Pool and the read-only + all show above the tabs"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-124-this-week-day-foot-and-fit-line/evidence/offline-402.png"
  - id: C3
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
---

# Contract — USE-124 this-week-day-foot-and-fit-line

## Build notes

Found by the Paper assay of thread C on 2026-10-18: USE-81 C1 judged **mismatch**. Measured on `this-week-day` at 402 × 874: Pool y 806–858 and Add 802–858, with BottomNav's top at 817. Both sit mostly under the tabs. The Work block (9:30 to 12:00) clips its fit line at its bottom edge. Evidence: `USE-081-this-week-day/evidence/the-day-402.png` and `edges-402.png`.

- **Approach:** offset the foot actions by BottomNav's height plus the safe area (the shell already knows the nav's height for the page's bottom padding; reuse it), and pad the scroll region so the last block clears them. Let an open Work block size to its content.
- **Decisions that apply:** D-USE-105: the fit line "Doesn't fit by 40 min at the top of the ranges", kept as drawn, lengths only, in ink, never red. this-week words-and-access: "Pool is 52 px high and the + a `--size-row` circle, both above the 44 px phone target, in thumb reach at the foot."
- **Interfaces:** none new.
- **Per path:** `days/`, the foot's position; `this-week/`, the open Work block's height and fit line.
- **Gotchas:** USE-4's tabs-402 capture says nothing may hide under BottomNav, so check a long day scrolled to its end too.
- **Model:** Sonnet is enough.
