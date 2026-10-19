---
id: "USE-82"
size: small
objective: "A Work day with nothing slotted is met calmly: when work was left open on the last workday, the desk docks the pool beside a start card offering each item at its old tier (one by one or all as they were) and Plan the week, the tiers taking drops and + Add, and the phone's start card checks them for Bring these in with Open the pool; when nothing was left open, each tier shows its add row with Plan the week; on fixtures"
slice_type: "two empty states on Today; risks a count or \"missed\" on what was left open, a left-open item written as a state instead of derived, Bring these in placing the unchecked ones, and the two states confused"
non_negotiables:
  - "No count, no \"missed\": \"Anything not brought stays in the pool. Nothing is marked missed.\" (C-USE-today-nothing-planned-1)."
  - "What was left open is derived from the last workday's undone work slots, never stored."
  - "Bring these in places only the checked items, each at its old tier; the rest stay in the pool (C-USE-today-nothing-planned-2)."
  - "Placing goes through USE-75's place; the docked pool is USE-74's panel; Open the pool is USE-79's sheet. Nothing is drawn twice."
  - "Nothing planned differs from no work slotted only by whether anything was left open [ASSUMPTION, as the state file]."
  - "@syn/ui components and preset tokens only; the start card on --color-surface."
devs_call: "Where leftOpen lives (a pure helper in @syn/utils/work beside USE-8's, or in the hook's select); the drop zone's dashed edge."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/today/states/nothing-planned.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/no-work-slotted.md"
  - "C-USE-today-nothing-planned-1"
  - "C-USE-today-nothing-planned-2"
  - "C-USE-today-no-work-slotted-1"
  - "D-USE-42"
  - "D-USE-56"
  - "D-USE-65"
waiver: "Nothing planned and no work slotted: the two empty states of the same Work block, told apart by whether anything was left open."
truth_files: "none: promotion carries work/today/"
qa: Q1
reviewers:
  - assay
focus:
  - "nothing planned at 1728 and 402, and no work slotted at 402, against their captures (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/components/work/"
  - "apps/web/lib/data/use-today-work.ts"
  - "apps/web/lib/data/left-open.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-082-today-nothing-planned/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-55"
  - "USE-57"
  - "USE-58"
  - "USE-61"
  - "USE-74"
  - "USE-75"
  - "USE-79"
out_of_scope:
  - "The Week that Plan the week opens at the desk: USE-72; on the phone, Set my days › This week: USE-42"
criteria:
  - id: C1
    statement: "leftOpen gives the last workday's undone work slots with their tiers, none from a weekend or from a day with nothing open; Bring these in with one unchecked places the others at their old tiers today and leaves the unchecked one in the pool"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 1728 at 8:40 the pool docks beside the content, the strip reads \"Nothing slotted yet\" each day, the band is Training \"8:00 to 8:57 · Work starts at 9:30\", and the start card reads \"Nothing set for today yet.\", its line, \"Left open on Friday\" with each item's \"was Primary\" and Add to Primary, Add both as they were and Plan the week; Primary is a dashed drop zone \"Drop here, or + Add to Primary\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-082-today-nothing-planned/evidence/nothing-planned-1728.png"
  - id: C3
    statement: "At 402 the start card reads \"Nothing planned for this block\", \"Left open on Friday, at the tier it had:\", each item checked with its tier square and word, Open the pool and Bring these in, and under it \"Anything not brought stays in the pool. Nothing is marked missed.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-082-today-nothing-planned/evidence/nothing-planned-402.png"
  - id: C4
    statement: "At 402 with nothing left open, \"Nothing is slotted for this block yet. Add here, or plan the week in Set my days.\", each tier heading with its add row, and Plan the week with \"Set my days › This week, with the pool\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-082-today-nothing-planned/evidence/no-work-slotted-402.png"
  - id: C5
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — today-nothing-planned

## Build notes

Wave 2, after the pool panel, placing and the pool sheet. Match `ux/work/today/captures/nothing-planned-1728.png`, `nothing-planned-402.png` and `no-work-slotted-402.png`.

- **Decisions that apply:**
  - D-USE-42: a day with nothing planned docks the pool with a start card offering what was left open, at its old tier. D-USE-56: the phone's start card is its answer to the docked pool.
  - Desk: "Nothing set for today yet."; "Drag from the pool into a tier, or start from what was left open last week."; "Left open on Friday", each with "was Primary" and Add to Primary (or Secondary); Add both as they were (primary) and Plan the week (to the Week). The header has no Step away; the day column shows the usual week's blocks.
  - Phone: "Nothing planned for this block", "Left open on Friday, at the tier it had:", each item checked; Open the pool (the pool sheet over Now, set to today [ASSUMPTION]) and Bring these in (primary); under it "Anything not brought stays in the pool. Nothing is marked missed."
  - No work slotted (D-USE-65): phone "Nothing is slotted for this block yet. Add here, or plan the week in Set my days." with each tier's add row and the Plan the week card ("Set my days › This week, with the pool"); desk "Nothing is slotted for today yet. Add here, or plan the week." with Plan the week to the Week (not drawn). No Step away, no Next.
- **Interfaces:** `StartCard` in `components/work/`; `leftOpen(lastWorkday)` (pure, tested); `useTodayWork` gains `leftOpen` and `bringIn(slotIds)` over `usePlace`. The tiers' add rows open USE-51's `NewTaskSheet` with the tier (USE-61).
- **Per path:** `left-open.test.ts` holds C1. Scenarios `today-nothing-planned` (8:40 at the desk, 10:20 on the phone) and `today-no-work-slotted`.
- **Gotchas:** "the last workday" is the last date before today with a Work block, Friday on a Monday.
- **Model:** Opus 5.5 at medium. A smaller model counts the left-open items, or places the unchecked ones.
