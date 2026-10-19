---
id: "USE-52"
size: small
objective: "From Linear on a tier's add row opens the issue picker with Size: search, the Assigned, Not done and Size chips, issues grouped by client with team and project lines, each with its points word and length range, several ticked at once, an issue already on the day faded, and a line naming where the tier ends, on fixtures"
slice_type: "a picker over a Linear snapshot on fixtures; risks a length not taken from the size, an issue placed twice on one date, a consequence line in red or as a count, a workspace shown when only one is connected, and anything written back to Linear"
non_negotiables:
  - "Issues come from the Linear snapshot shape (USE-32's linearIssueSchema) in a fixture scenario; no request to Linear."
  - "An issue's length comes from its size, the size from Linear's estimate; with no estimate, 30 min (size-and-length.md)."
  - "An issue already on that day is faded with no checkbox and names its day and tier; it can't be added twice (one item, one block a day)."
  - "The line above Add uses USE-8's fitInBlock: where the tier ends at the top of its ranges and what waits, in words, never red; hidden with nothing ticked."
  - "Placing an issue creates its work item and a slot in the tier for that date; nothing is written to Linear (D-USE-57)."
  - "Only @syn/ui components and preset tokens; a workspace shows on an item only with more than one connected."
  - "Every state of this ticket is reachable by ?state= (canon C-P08)."
devs_call: "Whether the picker is shared with the pool's From Linear tab now or later; file split; the Size chip's popover."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/add/states/from-linear-by-size.md"
  - "C-USE-add-from-linear-by-size-1"
  - "C-USE-add-from-linear-by-size-2"
  - "D-USE-57"
  - "D-USE-77"
truth_files: "none: interactions/add/ is promoted with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "rows ticked with their sizes and ranges, the faded already-on-day row and the consequence line at 402 (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/work/from-linear/"
  - "apps/web/lib/fixtures/"
  - "apps/web/lib/data/use-linear-issues.ts"
  - "apps/web/lib/data/use-work-writes.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-052-from-linear-by-size/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-8"
  - "USE-10"
  - "USE-32"
  - "USE-50"
  - "USE-51"
out_of_scope:
  - "The pool sheet's From Linear tab and Place: the place-from-the-pool ticket reuses this list"
  - "Real sync, connections and writes: Linear's wave 3 tickets"
criteria:
  - id: C1
    statement: "From Linear for Mon 12's Primary shows \"Mon 12 · Work · Add to Primary\", search, the chips, rows with project, ID, length range and points word, two ticked, ENG-123 faded \"already on Mon 12, in Primary\", the line \"With this, Primary runs to 13:00 at the top of its ranges: past Work's end at 12:00. Secondary and Stretch wait.\" in ink, and Add to Primary"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-052-from-linear-by-size/evidence/from-linear-by-size-402.png"
  - id: C2
    statement: "Through the fixtures, adding ticked issues creates a work item per issue with the size's range (no estimate: 30 min), slots each in the tier for that date, refuses one already on that date, and writes nothing to Linear"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C4
    statement: "Lint passes"
    evidence: check
    command: "yarn lint"
---

# Contract — from-linear-by-size

## Build notes

Opened from USE-50's Add to <tier> › From Linear. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — set up", frame `set-my-days / from Linear, by size / 402 / light`. Capture to match: `ux/interactions/add/captures/from-linear-by-size-402.png`. Take ours at `/days/block/<id>?date=2026-10-12&sheet=from-linear&state=from-linear-by-size`.

- **Decisions that apply:**
  - Step 8's picker with Size added: × left; the scope caption over "From Linear"; "Search Linear issues"; chips "Assigned to <name>" and "Not done" (on, ink outline) and "Size" (off) [PROPOSED]; a row is a checkbox, the issue's icon, the name, and under it project · ID · length range ("Sync engine · ENG-151 · 30 min to 1 h"), the points word right ("2 Small").
  - D-USE-57: the list groups by client, then team and project lines; the frame's All-plus-workspace switch is superseded. Nothing added here is written to Linear.
  - D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks stand as drawn: the line changes as rows are ticked and hides with none; the Size chip offers the five words, any number at once.
  - Size words and ranges: 1 Quick 15 to 30 min, 2 Small 30 min to 1 h, 3 Medium 1 to 2 h, 5 Large 2 to 4 h, 8 Huge (no top).
  - Placing an issue creates its `work_items` row (data contract).
- **Interfaces:** `FromLinearSheet { dateKey; blockId; tier; onAdded }` in `components/work/from-linear/`; `useLinearIssues()` over a fixture snapshot (two clients, two teams, issues with and without estimates, one already placed); `useWorkWrites().placeIssues({ issueIds, dateKey, blockId, tier })`.
- **Gotchas:**
  - Linear's estimate is points; the size word maps from it, and the range from the word.
  - The test runs on the fixture server, `describe`d by criterion.
- **Model:** Opus 5.5 at medium. A smaller model fetches Linear, places an issue twice, or ignores the estimate.
