---
id: "USE-61"
size: small
objective: "Today's header gets + Add ⌄ (USE-51's menu) and its tiers handle their edges: only Primary set folds Secondary and Stretch to headings with + Add, Urgent shows only while it holds something and takes the lifted card, a tier past its usual number gets a soft helper line and still takes the add, and the day's second Work block shows only what is still open, with a quiet line and anything firing still firing"
slice_type: "tier rules on an existing screen; risks a cap that blocks or warns in red, an empty Urgent heading, a done item repeated in the later block, a firing item dropped at the block's end, and the helper read as an alert"
non_negotiables:
  - "A cap never blocks and never warns: a muted helper tied to its heading by aria-describedby, never an alert (C-USE-today-9)."
  - "Urgent has no heading while it holds nothing and no cap at any number (C-USE-today-urgent-above-primary-2, -3)."
  - "The later Work block shows only undone items; what was done stays in its own block; a firing item shows in its tier, still firing (C-USE-today-later-work-block-1, -2)."
  - "Next stays resolveWorkNext's answer across both blocks; the screen orders nothing itself."
  - "Only @syn/ui components and preset tokens; no count, no \"missed\" (canon §2, A-01 to A-20)."
devs_call: "Where the usual numbers live (a constant beside WORK_TIERS); how a folded heading's + Add carries its tier to the add sheet's route."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/today/index.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/primary-only.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/urgent-above-primary.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/past-a-cap.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/later-work-block.md"
  - "C-USE-today-9"
  - "C-USE-today-primary-only-1"
  - "C-USE-today-primary-only-2"
  - "C-USE-today-primary-only-3"
  - "C-USE-today-urgent-above-primary-1"
  - "C-USE-today-urgent-above-primary-2"
  - "C-USE-today-urgent-above-primary-3"
  - "C-USE-today-past-a-cap-1"
  - "C-USE-today-past-a-cap-2"
  - "C-USE-today-past-a-cap-3"
  - "C-USE-today-later-work-block-1"
  - "C-USE-today-later-work-block-2"
  - "D-USE-38"
  - "D-USE-65"
waiver: "Today's tier edges: the index's rule and each of primary only, Urgent above Primary, past a cap and the later Work block hold their own criteria; one tier list."
truth_files: "none: promotion carries work/today/"
qa: Q1
reviewers:
  - assay
focus:
  - "primary only, Urgent above Primary, past a cap and the later Work block at 402 against work/today/captures/ (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/components/work/"
  - "apps/web/lib/data/use-today-work.ts"
  - "apps/web/lib/data/tier-edges.test.ts"
  - "packages/constants/src/"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-061-today-tier-edges/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-8"
  - "USE-10"
  - "USE-51"
  - "USE-57"
  - "USE-59"
out_of_scope:
  - "The add menu, the Add sheet and New task themselves: USE-51; this ticket mounts them"
  - "Meetings inside the block: USE-62"
  - "Nothing planned and no work slotted: USE-82"
criteria:
  - id: C1
    statement: "The later-block view keeps only undone slots of the day's Work, keeps a firing one in its tier, and names the earlier block's start; a cap helper appears only above two Primary or four Secondary and leaves when the tier drops back"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 402 with only Primary set, Secondary and Stretch show only their headings, each with \"+ Add\", and no Urgent heading shows"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-061-today-tier-edges/evidence/primary-only-402.png"
  - id: C3
    statement: "At 402 an Urgent item with nothing in hand shows Urgent above Primary and takes the lifted card; the old Next is back in its row"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-061-today-tier-edges/evidence/urgent-above-primary-402.png"
  - id: C4
    statement: "At 402 a third Primary is in the tier with \"Two is the usual for Primary.\" muted under the heading"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-061-today-tier-edges/evidence/past-a-cap-402.png"
  - id: C5
    statement: "At 402 the second Work block shows only what is open, with \"What's still open from the morning's Work. What was done stays in the 9:30 block.\" and the firing item still firing"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-061-today-tier-edges/evidence/later-work-block-402.png"
  - id: C6
    statement: "At 1440 hovering or focusing an empty tier shows \"+ Add to <tier>\", and + Add ⌄ in the header opens Task to a tier, From the pool, To-do and Event"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-061-today-tier-edges/evidence/add-on-hover-1440.png"
  - id: C7
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C8
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — today-tier-edges

## Build notes

Wave 2, after USE-59. Match `ux/work/today/captures/primary-only-402.png`, `urgent-above-primary-402.png`, `past-a-cap-402.png` and `later-work-block-402.png`.

- **Decisions that apply:**
  - D-USE-38: Urgent only when it holds something, then Primary, Secondary, Stretch; the squares step red, leaf, amber, slate, each with its word.
  - Primary only: Secondary and Stretch fold to their headings with "+ Add", which opens Add with that tier set; at the desk an empty tier shows "+ Add to <tier>" on hover or focus.
  - Urgent above Primary: an item added to Urgent with nothing in hand lifts as Next; any number, no cap line.
  - D-USE-65: the caps are soft: "Two is the usual for Primary." and "Four is the usual for Secondary."; the add goes through; the helper leaves when the tier drops back.
  - Later Work block [PROPOSED words, as drawn]: "What's still open from the morning's Work. What was done stays in the 9:30 block." The time is the earlier block's start. An item firing when the first block ended shows in its tier, still firing (D-USE-44: it fires until brought back).
- **Interfaces:** `TIER_USUAL = { primary: 2, secondary: 4 }` beside `WORK_TIERS` in `@syn/constants` [ASSUMPTION: Urgent and Stretch have none, as drawn]. `useTodayWork` adds `capHelper` per tier and the later-block filter, both pure helpers tested in `tier-edges.test.ts` (C1).
- **Per path:** scenarios `today-primary-only`, `today-urgent`, `today-past-cap`, `today-later-block`. The header's + Add ⌄ is USE-51's `AddMenu`; a folded heading's + Add and "+ Add to <tier>" open USE-51's `NewTaskSheet` with `tier` set.
- **Gotchas:**
  - "+ Add" on a folded heading is a link with the tier in its name ("Add to Secondary"), not a bare plus.
  - The later block's done items stay in the 9:30 block on Schedule and Review; this screen only leaves them out.
- **Model:** Opus 5.5 at medium. A smaller model blocks the third Primary, shows an empty Urgent, or drops the firing item at noon.
