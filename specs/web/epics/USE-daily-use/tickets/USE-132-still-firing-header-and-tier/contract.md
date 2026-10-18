---
id: "USE-132"
size: small
objective: "When Work ends with an item firing, the next block's header reads \"· Work again at 13:00\" and the firing row's meta names its tier: \"KES-42 · Primary · worked 40 min\""
slice_type: "words on Now's firing carry-over; risks losing where the item waits"
non_negotiables:
  - "Match the Paper artboard that carries the cited state file; on-disk decisions (D-USE-*) win over a stale frame and are named."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
  - "Every state stays reachable by ?state= (canon C-P08)."
devs_call: "The smallest change that makes the capture match; whether it lands in the shared component, the screen or the fixture."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/firing.md"
truth_files: "none: a fix toward the drawn state; no behaviour changes"
qa: Q1
reviewers:
  - assay
focus: []
planned_paths:
  - "apps/web/app/(shell)/today/_components/now/"
depends_on: []
out_of_scope:
  - "The minors in the same assay pass (spacing, glyphs, wording)"
criteria:
  - id: C1
    statement: "?state=now-firing-still-firing at 402 shows \"12:00 to 13:00 · Work again at 13:00\", the meta \"KES-42 · Primary · worked 40 min\", the block's colour bar, and Bring back and Done"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-132-still-firing-header-and-tier/evidence/firing-still-firing-402.png"
---

# Contract — USE-132 still-firing-header-and-tier

## Build notes

Drafted from the Paper assay of Day (Review the day, Block view, Item sheet) on 2026-10-18; fixes USE-110 C6.

- **What is wrong:** Assay against Paper: phone-today / Lunch, work still firing draws "12:00 to 13:00 · Work again at 13:00" and the meta "KES-42 · Primary · worked 40 min". Ours shows the span alone, the meta as chips (avatar, KES-42, High, 3 Medium, worked 40 min) with no tier, and a meal glyph where the header has the colour bar.
- **Approach:** compare the capture with the artboard named above (file 01M49AX02VV4SSBKNCN6NRTS6Y, board maps in `specs/web/epics/USE-daily-use/ux/boards/`), change the smallest thing, and recapture.
- **Decisions that apply:** those cited in the state file(s) above.
- **Gotchas:** capture on `/dev/parts?state=…` (item sheets add `&sheet=item&id=`); the host draws the shell's tab bar, which is not a difference.
- **Model:** Opus; a smaller model tends to restyle the shared component for every caller.
