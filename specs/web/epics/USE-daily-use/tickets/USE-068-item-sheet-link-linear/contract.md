---
id: "USE-68"
size: small
objective: "A work item with no link offers \"Link a Linear issue\", a step listing open issues (Assigned to Taylor first, then Other open issues, by workspace tab, searchable on the device) where one already on today is greyed with where it sits, and a tap links it, taking the issue's title, size, project emoji and description with the notes joined at the end and Undo; with Linear not connected the row reads \"Connect Linear\" and goes to Settings › Connections; a linked row opened from Now keeps the item's own title beside the issue's"
slice_type: "a link step inside a sheet; risks notes lost on link, an issue already on today linked twice, a search that calls Linear per keystroke, and a dead Connect Linear row"
non_negotiables:
  - "Linking keeps the item's notes, added to the end of the description, with Undo (D-USE-36, C-USE-item-sheet-linear-search-2)."
  - "An issue already on today is greyed with \"already on today, in <Tier>\" and cannot be picked (C-USE-item-sheet-linear-search-1)."
  - "Search runs over the snapshot on the device; no request while typing."
  - "It is a step inside the sheet, back on the left with the item's name; never a second sheet."
  - "With Linear not connected the row reads \"Connect Linear\" with \"In Settings, Connections\" and goes there (C-USE-item-sheet-linear-off-1)."
  - "Only @syn/ui components and preset tokens."
devs_call: "File split; the workspace tabs (SegmentedControl); how Undo restores the pre-link title and notes."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/linear-search.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/linear-off.md"
  - "specs/web/epics/USE-daily-use/ux/day/item-sheet/states/linear-item-from-now.md"
  - "C-USE-item-sheet-linear-search-1"
  - "C-USE-item-sheet-linear-search-2"
  - "C-USE-item-sheet-linear-off-1"
  - "C-USE-item-sheet-linear-item-from-now-1"
  - "D-USE-36"
waiver: "Linking an issue, with Linear not connected and the linked item opened from Now: three entries to the same Linear line on one sheet."
truth_files: "none: promotion carries day/item-sheet/"
qa: Q1
reviewers:
  - assay
focus:
  - "Linear search, Linear not connected and the linked item from Now at 402 against their captures (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/planner/item-sheet/"
  - "apps/web/lib/data/use-item-sheet.ts"
  - "apps/web/lib/data/item-sheet-link.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-068-item-sheet-link-linear/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-56"
  - "USE-66"
out_of_scope:
  - "The add sheet the linear-off frame is drawn on (Add to Primary with Name, Tier, Length, Add): the add ticket; this ticket builds its Connect Linear row's behaviour inside the Item sheet"
  - "Settings › Connections itself: USE-85"
  - "Description conflicts (\"Changed in Linear too\"): the Linear wiring"
criteria:
  - id: C1
    statement: "Linking ENG-151 to an item with notes sets its title, size, icon and linear ids from the issue and its notes to the description followed by the old notes; Undo restores the item exactly; ENG-123, already on today, cannot be linked"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 402 the step shows \"‹ <item>\", \"Link a Linear issue\", Search Linear issues, the workspace tabs All, Lighthouse, Studio, Assigned to Taylor with ENG-151 and ENG-142 and their sizes, ENG-123 greyed \"already on today, in Primary\", Other open issues, and the footer line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-068-item-sheet-link-linear/evidence/linear-search-402.png"
  - id: C3
    statement: "At 402 with Linear not connected the row reads \"Connect Linear\" with \"In Settings, Connections\" and a chevron"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-068-item-sheet-link-linear/evidence/linear-off-402.png"
  - id: C4
    statement: "At 402 a linked row tapped on Now opens the sheet with the item's own title, the issue's ID and status, its own title in Linear, and Open in Linear"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-068-item-sheet-link-linear/evidence/linear-item-from-now-402.png"
  - id: C5
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — item-sheet-link-linear

## Build notes

Wave 2, after USE-66. Match `ux/day/item-sheet/captures/linear-search-402.png`, `linear-off-402.png` and `linear-item-from-now-402.png`.

- **Decisions that apply:**
  - The step: back "‹ <item name>"; scope "Work · 9:30 to 12:00 · Primary"; title "Link a Linear issue"; `SearchField` "Search Linear issues"; one tab per connected workspace after "All"; groups "Assigned to Taylor" then "Other open issues"; each row the project emoji, the title, "<project> · <ID> · <length range>", "<points> <size word>" on the right; one already on today greyed with "<ID> · already on today, in <Tier>".
  - Footer [PROPOSED]: "Tap one to link it. The item takes the issue's title, size, project emoji and description; any notes it had are added to the end of the description, with Undo."
  - D-USE-36 and the notes dev note: notes join the description's end on link, with Undo; nothing is lost.
  - D-USE-56: not connected, the row reads "Connect Linear" with "In Settings, Connections" and goes there.
  - From Now: the sheet keeps the item's own title and shows the issue's ID, status and Open in Linear, and the issue's own title when it differs [judgment: the Linear card's content on the locked LinearLine].
  - Loading: `SkeletonRow`s under the tabs; offline: the area's StatusLine above the last-synced issues (offline.md) [ASSUMPTION].
- **Interfaces:** `LinkLinearStep` and `ConnectLinearRow` in `components/planner/item-sheet/`; `useItemSheet` gains `link(issueId)` with Undo. The open issues are `useLinear().notInPool` plus assigned issues already in the pool, matched on the device.
- **Per path:** `item-sheet-link.test.ts` holds C1. Scenarios `item-linear-search`, `item-linear-off`, `item-linear-from-now`.
- **Gotchas:**
  - A link creates no new work item when the item exists: it sets `linearConnectionId`, `linearIssueId` and `linearIdentifier` on it.
  - Search matches title and ID, case-insensitive.
- **Model:** Opus 5.5 at medium. A smaller model drops the notes, links a duplicate, or searches over the network.
