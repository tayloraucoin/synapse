---
id: "USE-18"
size: small
objective: "On Now a row's long-press opens Swap, Edit, Move up, Move down and Not today over a scrim, and a row's grip drags it with an ink edge and a drop line, a row dropped above the lifted card becoming next up; Not today and every reorder change today only, on fixtures"
slice_type: "touch interactions over one list; risks a reorder or Not today that rewrites the usual week, a dropped row stealing the current item, a menu reachable only by long-press, and a drag that glides under reduced motion"
non_negotiables:
  - "Today only: a reorder writes the date's slots' sortOrder, and Not today writes the set item's slot with skipped true (USE-14); the block's items and rule never change."
  - "A row dropped above the lifted card becomes next up; the current item stays current (D-USE-26)."
  - "Move down is disabled on the last undone row and Move up on the first; they are the grip's tap and keyboard fallback."
  - "The menu has a keyboard and screen-reader path: the row's context-menu key or a More action opens it."
  - "Only @syn/ui components (SortableList, DropdownMenu, Toaster) and preset tokens; the dragged row has no shadow (D-USE-17)."
devs_call: 'Long-press timing (the platform''s, about 500 ms); the scrim''s lifted-row clone; Toaster wording for Not today''s Undo ("<item> is off today." with Undo).'
cites:
  - "specs/web/epics/USE-daily-use/ux/day/now/states/row-long-press.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/reordering.md"
  - "C-USE-now-row-long-press-1"
  - "C-USE-now-row-long-press-2"
  - "C-USE-now-reordering-1"
  - "C-USE-now-reordering-2"
  - "D-USE-70"
waiver: "One surface, Now: its two row-interaction states, which share the row they act on."
truth_files: "none: an epic proposal; promotion carries day/now/"
qa: Q1
reviewers:
  - assay
focus:
  - "Not today and a drop above the card leave the usual week and the current item alone (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/components/planner/"
  - "apps/web/lib/data/use-now.ts"
  - "apps/web/lib/data/now-rows.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-018-now-row-menu-reorder/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-14"
  - "USE-16"
out_of_scope:
  - "Swap and Edit's Item sheet (?sheet=item&id=): the Item sheet's ticket; the items ship here and open that URL"
  - "Move to… and Pick a day: the Move to ticket"
  - "The desk's right-click ContextMenu on a non-work row: the desk Block panel's ticket"
  - "A work row's menu (Move to tier, Back to the pool): phone Today's ticket"
criteria:
  - id: C1
    statement: "Cold bath held: a grey scrim over the screen and tabs, the row lifted above it, and a menu of Swap, Edit, a separator, Move up, Move down greyed (the last row), a separator, Not today, each with its icon"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-018-now-row-menu-reorder/evidence/row-long-press-402.png"
  - id: C2
    statement: "Cold bath dragged above the card: a 2 px ink drop line under Start the cold bath, the row on --color-surface with a 1 px ink edge and no shadow, Meditate still lifted below"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-018-now-row-menu-reorder/evidence/reordering-402.png"
  - id: C3
    statement: "Not today on a set item writes its slot for today with skipped true, the row leaves Now, the next day's read still holds the item, and Undo restores the row"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "A row dropped above the lifted card is next up and the current item is unchanged; Move up and Move down move one place; every reorder writes only the date's slots and leaves block items untouched"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: 'From the keyboard, a row''s More action opens the same menu and Escape returns focus to the row; the grip is named "Reorder <item>"'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-018-now-row-menu-reorder/evidence/keyboard.txt"
  - id: C6
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — now-row-menu-reorder

## Build notes

After USE-16, beside USE-17. Captures to match: `ux/day/now/captures/{row-long-press,reordering}-402.png`; Paper `01M49AX02VV4SSBKNCN6NRTS6Y`, "USE — daily use", row "Now" (frames at x 1928 and 2892, y 11130). Taken at `/today?state=row-long-press` and `?state=reordering`.

- **Decisions that apply:**
  - D-USE-17: long-press stays the row's menu; a visible grip on every undone row; dragging lifts it with a drop line.
  - D-USE-26: the menu gains Move up and Move down; a row dropped above the lifted card becomes next up and the current item stays current.
  - D-USE-70: Not today takes the item off today only; its usual day keeps it. A Toaster with Undo, as Move to [ASSUMPTION, as drawn].
  - D-USE-28: menus are dropdowns, background token, hairline, 10 px radius, one soft shadow. The lifted row sits above the scrim on `--color-background` with `--radius-card`, inset 8 px wider than the row.
  - Words: "Swap", "Edit", "Move up", "Move down", "Not today". Reduced motion: a dragged row moves without a glide.
- **Interfaces:**
  - `useSlotWrites` (USE-16) gains `reorder(itemIds)` and `notToday(item)` / `undoNotToday(item)`. A set item is placed on first touch (`placeSlotInput`, then `slotUpdateInput` with `skipped` or `sortOrder`); a to-do's slot in a To-dos block is removed, so it returns to the pool (USE-9's `todoPool`).
  - `useNow` drops skipped slots and their set items from the block.
  - `components/planner/`: `RowMenu` (long-press, context-menu key and More), `SortableItemRows` over `@syn/ui`'s `SortableList`.
  - Scenarios: `row-long-press` (view.open on Cold bath), `reordering` (view.drag frozen mid-drag over the drop line, for the capture only).
- **Per path:** `now-rows.test.ts` holds C3 and C4 against the fixture server and `readDay` (USE-6) for the next day. `keyboard.txt` is read from the browser pane's accessibility tree.
- **Gotchas:**
  - `SortableList`'s sensors must not start a drag on long-press: the grip drags, the row's body opens the menu.
  - Undo for Not today deletes the skipped slot only when the slot was written by Not today; a slot touched before keeps its other fields and gets `skipped` false.
  - The frozen drag in the `reordering` scenario is a view flag the screen honours; it is never reachable outside `?state=`.
- **Model:** Opus 5.5 at medium. A smaller model reorders the block's items for every week or lets the dropped row take the card.
