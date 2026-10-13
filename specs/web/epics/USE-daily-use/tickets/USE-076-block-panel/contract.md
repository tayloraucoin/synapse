---
id: "USE-76"
size: small
objective: "Any block clicked in the Time lens or Today's day column opens the Block panel at the right (?panel=block&id=&date=), the block ringed in ink and the week and pool still in view: the panel mounts Block view's body for that date (a Work block's tiers, any other block's items, today's block with its checkboxes and Running group), adds Open day, ×, drops from the pool and a right-click menu on a non-work row, and closes on × or Esc"
slice_type: "a desk shell around an existing body; risks a second Block view drawn for the desk, an edit reaching the usual weekday, firing or Start controls in a planning panel, a scrim hiding the week, and focus not returning to the block"
non_negotiables:
  - "The body is Block view's (USE-48, USE-49, USE-50) for that date; nothing in it is drawn twice."
  - "Changes apply to that date only; the usual weekday is unchanged (C-USE-block-panel-non-work-block-2)."
  - "No firing mark, ring, Start or Done in a Work block's panel; checkboxes only on today's non-work block opened from Today or Schedule (C-USE-block-panel-work-block-4, C-USE-block-panel-checking-today-1)."
  - "No scrim: the week and the pool stay in view; × or Esc closes, the ring goes and focus returns to the block (C-USE-block-panel-2)."
  - "Desk only; below 1024 a block opens the phone's Block view (C-USE-block-panel-4)."
  - "Drops call USE-75's place; nothing counts, says missed or turns red (C-USE-block-panel-5)."
devs_call: "File split under components/work/block-panel/; how the ring is drawn on the lens's block; whether the right-click menu reuses USE-18's row menu items."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/block-panel/index.md"
  - "specs/web/epics/USE-daily-use/ux/work/block-panel/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/work/block-panel/states/work-block.md"
  - "specs/web/epics/USE-daily-use/ux/work/block-panel/states/non-work-block.md"
  - "specs/web/epics/USE-daily-use/ux/work/block-panel/states/checking-today.md"
  - "C-USE-block-panel-1"
  - "C-USE-block-panel-2"
  - "C-USE-block-panel-3"
  - "C-USE-block-panel-4"
  - "C-USE-block-panel-5"
  - "C-USE-block-panel-work-block-1"
  - "C-USE-block-panel-work-block-2"
  - "C-USE-block-panel-work-block-3"
  - "C-USE-block-panel-work-block-4"
  - "C-USE-block-panel-non-work-block-1"
  - "C-USE-block-panel-non-work-block-2"
  - "C-USE-block-panel-non-work-block-3"
  - "C-USE-block-panel-checking-today-1"
  - "C-USE-block-panel-checking-today-2"
  - "D-USE-41"
  - "D-USE-74"
  - "D-USE-77"
waiver: "The Block panel: the index holds the frame and each of the Work block, non-work block and checking-today states its own criteria; one panel."
truth_files: "none: promotion carries work/block-panel/"
qa: Q1
reviewers:
  - assay
focus:
  - "a Work block and a non-work block at 1728 against their captures, and today's block from Today with its checkboxes (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/work/block-panel/"
  - "apps/web/app/(shell)/week/_components/"
  - "apps/web/app/(shell)/today/_components/desk/"
  - "apps/web/lib/routes.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-076-block-panel/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-18"
  - "USE-24"
  - "USE-48"
  - "USE-49"
  - "USE-50"
  - "USE-58"
  - "USE-73"
  - "USE-74"
  - "USE-75"
out_of_scope:
  - "Block view's body, its rows, Swap, check and remove: USE-48, USE-49, USE-50"
  - "Schedule's desk block click (D-USE-77): the Schedule ticket, linking this panel's route"
  - "The Item sheet a row opens: USE-64"
criteria:
  - id: C1
    statement: "At 1728 a Work block's panel shows \"Tue 13 › Work\", Open day and ×, the header with \"9:30 to 12:00 · ends 11:40 at the top of the ranges\", the tiers with grips and \"+ Add to <tier>\" rows, and the scope line; the block is ringed in the lens and the pool stays docked; a pool row dropped on Primary lands there on Tue 13"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-076-block-panel/evidence/work-block-1728.png"
  - id: C2
    statement: "At 1728 Training's panel shows \"Mon 12 › Training\", \"8:00 to 8:57 · ends 8:57 as planned\", the drives in italics, \"Workout: gym\" with Swap, \"+ Add to Training\" and \"Changes apply to Monday 12 only. The usual Monday stays as it is.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-076-block-panel/evidence/non-work-block-1728.png"
  - id: C3
    statement: "At 1728 today's Wellness opened from Today's day column shows a checkbox on each item with checked rows staying, faded, and a right-click on a row opens its menu"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-076-block-panel/evidence/checking-today-1728.png"
  - id: C4
    statement: "In the browser at 1728, Esc closes the panel, the ring goes and focus is back on the block, read from the accessibility tree"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-076-block-panel/evidence/close-focus.txt"
  - id: C5
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — block-panel

## Build notes

Wave 2, after the Time lens, placing and Block view. Match `ux/work/block-panel/captures/work-block-1728.png` and `non-work-block-1728.png`.

- **Decisions that apply:**
  - D-USE-41: any block opens a right-hand Block panel: tiers for Work, items for other kinds. It is the phone's Block view at the desk, widened (D-USE-55); USE-48 says Today's right panel mounts its view.
  - Layout: `ResponsiveSheet`'s right panel at `--sheet-w` (drawn 440), no scrim, the block ringed (2 px `--color-foreground`, 1 px offset), the pool docked at 360 to its left. Top line: the `Breadcrumb` "<Day> › <Block>", Open day (semibold ink) and × (32 px round, `--color-surface`). Header: the block's colour bar, its name in the serif (24/30), its span and fit line. The scope line under a hairline: "Tiers belong to Tuesday, not to this block. Items here go first; what's undone carries to the 13:00 Work block." or "Changes apply to Monday 12 only. The usual Monday stays as it is."
  - D-USE-74, D-USE-77: today's non-work block opened from Today or Schedule carries checkboxes; checking records its planned length; nothing says missed. USE-18 leaves the desk's right-click menu on a non-work row to this panel; USE-24 leaves the Running group here.
  - Loading N/A (a block already on screen); offline edits save and sync later (D-USE-64).
- **Interfaces:** `BlockPanel { blockId; dateKey; from: "week" | "today" | "schedule" }` mounting USE-48's view (today) or USE-49/50's editing body (another date), `blockPanelRoute(id, date)`. The Week's Time lens and Today's day column link the route; Open day links `todayRoute({ date })`.
- **Per path:** scenarios `panel-work`, `panel-training`, `panel-checking-today`.
- **Gotchas:** an item's row opens the Item sheet in the same right panel; closing it returns here [ASSUMPTION].
- **Model:** Opus 5.5 at medium. A smaller model redraws Block view for the desk, or shows Start in a planning panel.
