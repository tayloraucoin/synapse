---
id: USE-144
size: small
objective: "A Lucide icon draws wherever it is set: the New block icon tile, Block view rows and the add row; the block's ··· Icon and colour shows the block's own icon in its colour, the dashed circle only when unset"
slice_type: "a display fix in a shared @syn/ui component; risks a row that loses its indent or a server render that fetches"
non_negotiables:
  - "ItemIcon draws kind \"lucide\" in its colour (a kind's dot token, or the hex), from the picker's own lazy set; until it loads the box holds its size."
  - "IconTile and ItemIcon share one drawing, not two."
  - "aria-hidden always; the name beside it is the meaning."
devs_call: "How the menu row takes a glyph; the default is an optional node beside the Lucide icon."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/icon-picker/index.md"
  - "specs/web/epics/USE-daily-use/ux/day/block-view/states/header-menu.md"
  - "C-USE-icon-picker-3"
truth_files: "none: the epic's own ux/ ledger is amended in the same commit (day/block-view/states/header-menu.md); it promotes to specs/web/ux/ with USE"
waiver: "One control or rule seen from two ledger files of the same surface family; one change owns both."
qa: Q1
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "packages/ui/src/composed/display/item-icon/**"
  - "packages/ui/src/composed/display/icon-tile/**"
  - "apps/web/components/planner/now-block-menu.tsx"
  - "apps/web/app/(shell)/days/block/[id]/_components/days-block-screen.tsx"
  - "apps/web/app/(shell)/today/block/[id]/_components/today-block-screen.tsx"
  - "apps/web/components/planner/item-icon.test.tsx"
  - "specs/web/epics/USE-daily-use/ux/day/block-view/states/header-menu.md"
depends_on: []
out_of_scope:
  - "Server-rendering the Lucide drawing (it stays the picker's lazy chunk)"
criteria:
  - id: C1
    statement: "ItemIcon with a lucide value renders the glyph box in the kind's dot colour or the hex, never the empty dot"
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "?state=header-menu at 402 shows Icon and colour with the block's icon; the New block tile and a Block view row show a picked Lucide icon"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-144-lucide-icons-draw/evidence/"
---

# Contract — USE-144 lucide-icons-draw

## Build notes

Fix 3 of Taylor's review of 2026-10-19.

- **Approach:** the Lucide drawing (`useLucideDrawing`, the kind tint map) moves from IconTile into `item-icon/lucide-glyph.tsx` ("use client"); ItemIcon renders it for kind "lucide"; IconTile's glyph goes through ItemIcon. `NowBlockMenuRow` gains `glyph?: ReactNode`, drawn in place of `icon`; both block screens pass the block's icon bare when set.
- **Gotchas:** ItemIcon is imported by server-rendered rows; the lazy load runs in an effect only.
- **Model:** Opus 5.5.
