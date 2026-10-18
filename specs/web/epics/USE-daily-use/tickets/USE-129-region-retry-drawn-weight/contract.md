---
id: "USE-129"
size: small
objective: "A failed region reads as drawn: its title semibold in ink at body size, the muted detail under it, and Try again as a filled secondary button, on Review the day and Block view"
slice_type: "a shared @syn/ui composite's look; risks changing every other RegionRetry caller"
non_negotiables:
  - "Match the Paper artboard that carries the cited state file; on-disk decisions (D-USE-*) win over a stale frame and are named."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
  - "Every state stays reachable by ?state= (canon C-P08)."
devs_call: "The smallest change that makes the capture match; whether it lands in the shared component, the screen or the fixture."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/error.md"
  - "specs/web/epics/USE-daily-use/ux/day/block-view/states/error.md"
waiver: "One surface, several of its state files drawn on the same row"
truth_files: "none: a fix toward the drawn state; no behaviour changes"
qa: Q1
reviewers:
  - assay
focus: []
planned_paths:
  - "packages/ui/src/composed/feedback/region-retry/"
  - "apps/web/app/(shell)/today/review/_components/"
  - "apps/web/app/(shell)/today/block/[id]/_components/today-block-screen.tsx"
depends_on: []
out_of_scope:
  - "The minors in the same assay pass (spacing, glyphs, wording)"
criteria:
  - id: C1
    statement: "?state=review-error and ?state=block-view-error at 402 show the semibold ink title, the muted detail and a filled secondary Try again, nothing red, under a hairline-ruled live header"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-129-region-retry-drawn-weight/evidence/errors-402.png"
  - id: C2
    statement: "@syn/ui and the web app type-check"
    evidence: check
    command: "yarn check-types"
---

# Contract — USE-129 region-retry-drawn-weight

## Build notes

Drafted from the Paper assay of Day (Review the day, Block view, Item sheet) on 2026-10-18; fixes USE-34 C2, USE-48 C10.

- **What is wrong:** Assay against Paper: review-day / error and block-view / error draw the title as body semibold ink, the detail muted, and Try again as a secondary Button on --color-fill-muted (Review the day also has a hairline under the header). Ours, through RegionRetry, renders a small muted title, a caption-size detail and a ghost small Try again. A variant or prop keeps other callers as they are; Orient's error is the reference.
- **Approach:** compare the capture with the artboard named above (file 01M49AX02VV4SSBKNCN6NRTS6Y, board maps in `specs/web/epics/USE-daily-use/ux/boards/`), change the smallest thing, and recapture.
- **Decisions that apply:** those cited in the state file(s) above.
- **Gotchas:** capture on `/dev/parts?state=…` (item sheets add `&sheet=item&id=`); the host draws the shell's tab bar, which is not a difference.
- **Model:** Opus; a smaller model tends to restyle the shared component for every caller.
