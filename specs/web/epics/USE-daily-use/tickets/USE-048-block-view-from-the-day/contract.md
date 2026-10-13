---
id: "USE-48"
size: medium
objective: "Block view opens a block from the day at /today/block/{id}, its span stretched so every short item reads: check, swipe to remove with Undo, Edit to drag by the grip, the header's scoped menu with Delete asking once, the now-line while current, past rows still live, and loading, error and offline, all for today only, on fixtures"
slice_type: "a child page of the day on fixtures; risks a checked row hidden, a remove or reorder that reaches the usual week, a red Remove, rows under 56 px, a past block that says missed, a now-line on a block not current, and a gesture with no keyboard path"
non_negotiables:
  - "Every change here is today's only, through the date-only writes (a skipped slot, the date's sort order, a dated item); the weekday's usual never changes."
  - "A check writes the slot's done with the planned length (D-USE-13); a checked row stays in place, faded with its check."
  - "Remove, Delete block and every destructive word in ink; nothing red; nothing says missed, late or skipped."
  - "Rows at least 56 px and taller by length; checkbox, grip, Edit, ··· and Undo at least 44 × 44."
  - "Every gesture has a non-gesture path: Remove and Move up, Move down on the row's long-press menu; Space lifts and drops a grip."
  - "Data through useBlockView and usePlannerWrites; times and overflow from reflowItems; only @syn/ui components and preset tokens."
  - "Every state of this ticket is reachable by ?state= (canon C-P08)."
devs_call: "The swipe's implementation (TaskRow's or the drag layer's, no new dependency); file split; the Delete confirm's words beyond the default."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/block-view/words-and-access.md"
  - "C-USE-block-view-1"
  - "C-USE-block-view-2"
  - "C-USE-block-view-3"
  - "C-USE-block-view-4"
  - "C-USE-block-view-6"
  - "C-USE-block-view-7"
  - "D-USE-17"
  - "D-USE-24"
  - "D-USE-28"
  - "D-USE-30"
  - "D-USE-64"
  - "D-USE-69"
truth_files: "none: day/block-view/ is promoted with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "success, checked and swipe, Edit dragging, the header menu, current and past at 402 against day/block-view/captures/ (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/block/"
  - "apps/web/components/planner/block-view/"
  - "packages/ui/src/composed/navigation/breadcrumb/"
  - "apps/web/lib/routes.ts"
  - "apps/web/lib/fixtures/scenarios/"
  - "specs/web/epics/USE-daily-use/tickets/USE-048-block-view-from-the-day/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-11"
  - "USE-18"
  - "USE-31"
  - "USE-36"
out_of_scope:
  - "Editing mode from Set my days and the kinds' editors: the Block view editing tickets"
  - "The Item sheet and its swap list: the Item sheet's ticket"
  - "The add row's typing beyond adding a 5 min item after the last: the editing ticket's empty state"
  - "At the desk, Today's right panel: Today's ticket mounts this view"
criteria:
  - id: C1
    statement: "From Review the day, \"‹ Today › Wellness\", the leaf bar with \"Wellness\" over \"7:05 to 8:00\", Edit beside ···, rows with rail times, checkboxes and lengths (10 min rows taller, none under 56 px), the add row, \"Free until 8:00\", the 8:00 line and the Training peek"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-048-block-view-from-the-day/evidence/success-402.png"
  - id: C2
    statement: "Two rows checked stay in place, faded with their checks, and a third swiped left shows Remove filling the row's end in ink"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-048-block-view-from-the-day/evidence/checked-swipe-402.png"
  - id: C3
    statement: "After Remove the later items move up by its length, the add row to 7:28, and a Toaster reads \"Start the cold bath removed.\" with Undo"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-048-block-view-from-the-day/evidence/removed-undo-402.png"
  - id: C4
    statement: "··· opens \"Today's Wellness only\": Rename, Icon and colour, a separator, Delete block, icons leading, nothing red"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-048-block-view-from-the-day/evidence/header-menu-402.png"
  - id: C5
    statement: "Delete block asks once, naming today's Wellness only, before the block goes with Undo"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-048-block-view-from-the-day/evidence/delete-confirm-402.png"
  - id: C6
    statement: "Edit shows Done, the hint \"Drag a grip to reorder. Swipe left to remove. Changes apply to today.\", grips on every row, and a lifted row with an ink edge and no shadow over a drop line, its rail reading 7:10"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-048-block-view-from-the-day/evidence/edit-dragging-402.png"
  - id: C7
    statement: "Opened from Schedule at 7:14, the verdigris now-line crosses Meditate with \"7:14\" on the rail, and the tabs show with Schedule selected"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-048-block-view-from-the-day/evidence/current-402.png"
  - id: C8
    statement: "At 9:40 the finished block has no now-line, checked rows faded, Cold bath still checkable, and no word of missed"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-048-block-view-from-the-day/evidence/past-402.png"
  - id: C9
    statement: "Loading paints the crumb and header at once and four skeleton rows; ?state=partial renders as loading"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-048-block-view-from-the-day/evidence/loading-402.png"
  - id: C10
    statement: "Error shows RegionRetry with \"Wellness didn't load.\" and Try again under a live header, nothing red"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-048-block-view-from-the-day/evidence/error-402.png"
  - id: C11
    statement: "Offline, \"Offline. Checks are saved on this phone and sync later.\" sits under the header, a check made offline shows, and Edit and ··· stay live"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-048-block-view-from-the-day/evidence/offline-402.png"
  - id: C12
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C13
    statement: "Lint passes"
    evidence: check
    command: "yarn lint"
---

# Contract — block-view-from-the-day

## Build notes

Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — daily use", row "Block view" (y 6420, notes y 7350). Captures to match: `ux/day/block-view/captures/` (success, checked-swipe, removed-undo, header-menu, edit-dragging, current, past, loading, error, offline; all 402). Take ours at `/today/block/<id>?state=<state>`.

- **Decisions that apply:**
  - The job (`index.md`): one block as a child page of the day, its span stretched to fill the screen; back by the breadcrumb, to the day it came from, scrolled as left.
  - D-USE-24: Edit is a visible text button beside a round ···; the ··· opens a pull-down titled with its scope, "Today's <Block> only": Rename, Icon and colour, a separator, Delete block. D-USE-28: shadcn dropdown, leading muted icons.
  - D-USE-69: Delete block asks once, then the block goes from today, Block view returns to the day and a Toaster offers Undo; the usual keeps it. The row's long-press menu (Swap, Edit, Not today) gains Move up and Move down. Unused time is a dashed "Free until <block end>" under the add row.
  - D-USE-17: no grips until Edit; the lift has an ink edge, a surface fill, no shadow, and a drop line; release re-flows the times around pinned items (round 8).
  - D-USE-13: a checkbox does what Done does, recording the planned length; checking ahead or after the block's end is allowed.
  - D-USE-30: the now-line (verdigris, a dot at the rail, the time tag) only on the current block.
  - D-USE-64, D-USE-56: offline, checks and edits save on the phone and sync later; the StatusLine words stand until Gloss widens them.
  - Rename makes the header's name a field in place; Icon and colour opens USE-11's picker; both today only [ASSUMPTION].
  - Access (`words-and-access.md`): focus on the block's name, a level-1 heading; the breadcrumb a `nav`; a checkbox "<item>, <start>, <length>"; a grip "Reorder <item>"; announced "<item> removed." and "<item> moved to 7:10".
- **Interfaces:** `todayBlockRoute(id)` in `routes.ts` (if Review the day's ticket has not added it); `Breadcrumb` gains a trailing current crumb ("‹ Today › Wellness"); `BlockView { mode: "day" | "editing"; … }` in `components/planner/block-view/`, which the editing tickets extend; the row long-press menu is USE-18's, with this view's items.
- **Gotchas:**
  - The header paints from the day already loaded; only the rows wait.
  - At the desk Remove sits in the row's menu, since a pointer can't swipe.
  - Reduced motion: the lift and re-flow without animation; the swipe snaps.
- **Model:** Opus 5.5 at medium. A smaller model hides checked rows, writes today's removal to the usual block, or colours Remove red.
