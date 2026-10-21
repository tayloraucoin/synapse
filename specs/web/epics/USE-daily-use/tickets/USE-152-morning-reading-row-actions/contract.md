---
id: USE-152
size: medium
objective: "On Settings › Morning reading, rows act at once: drag by the grip or Move up/down to reorder, Turn off with Undo, and Turn on or Delete from Off"
slice_type: "row interactions over existing writes; risks a drag with no keyboard path, an Undo that lands in the wrong place, and a red or one-tap delete"
non_negotiables:
  - "Order saves the section's full active id list on drop or on Move up/down; SaveStatus says \"Saved\" beside that section's heading; no toast (D-USE-128)."
  - "Move up and Move down in ··· are the keyboard path; the first row has no Move up and the last no Move down (D-USE-123)."
  - "Turn off shows the toast with Undo; Undo restores the row's place (turnOn restore); Turn on from Off puts it at the end."
  - "Delete only from an off row, through the AlertDialog with \"Keep it\" and \"Delete\", both in ink; nothing red (D-USE-125)."
  - "A failed drop puts the order back and says so beside the heading."
  - "Only @syn/ui parts and preset tokens; reduced motion: no lift or drop animation."
devs_call: "The announcement wording after a move, within the ledger's [PROPOSED] (\"Moved up, now after <title>\"); how the optimistic order rolls back."
cites:
  - "specs/web/epics/USE-daily-use/ux/account/morning-reading/writing-and-order.md"
  - "D-USE-123"
  - "D-USE-124"
  - "D-USE-125"
truth_files: "none: the epic's own ux/ ledger is the truth; it promotes to specs/web/ux/ with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "row-menu, off-undo and delete-confirm at 402 against their boards: the Turn off line, the toast's words, Keep it and Delete in ink (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/account/morning-reading/row-actions.tsx"
  - "apps/web/components/account/morning-reading/off-list.tsx"
  - "apps/web/components/account/morning-reading/delete-dialog.tsx"
  - "apps/web/components/account/morning-reading/use-row-actions.ts"
  - "apps/web/components/account/morning-reading/row-actions.test.ts"
  - "apps/web/components/account/morning-reading/reading-section.tsx"
depends_on:
  - USE-151
out_of_scope:
  - "The passage and link sheets (USE-153)"
  - "Any server change (USE-150)"
criteria:
  - id: C1
    statement: "?state=morning-reading-reorder, -row-menu, -off-undo, -delete-confirm and -saved-drop at 402 match their boards"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-152-morning-reading-row-actions/evidence/"
  - id: C2
    statement: "Move up on the second passage sends the full id list with it first, and shows Saved beside Passages; the first row offers no Move up"
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "Undo after Turn off calls turnOn with restore and the row is back in its place; Turn on from Off calls it without restore"
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "A drop whose save fails puts the previous order back"
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "Every row action (move, off, Undo, on, delete) is reachable and named by keyboard alone"
    evidence: manual
    reason: "A keyboard walk of the row actions in the browser, at 402"
---

# Contract — USE-152 morning-reading-row-actions

## Build notes

Wave 3, after USE-151, beside USE-153. Read `technical/morning-reading.md`. Captures: `ux/account/morning-reading/captures/` (`reorder`, `row-menu`, `off-undo`, `delete-confirm`, `saved-drop`, `list-off-open`). Paper "Synapse", page "USE — daily use", row "Row label · Morning reading".

- **Ledger criteria built:** C-USE-morning-reading-5, C-USE-morning-reading-9, C-USE-morning-reading-20, C-USE-morning-reading-21, C-USE-morning-reading-22, C-USE-morning-reading-23, C-USE-morning-reading-24, C-USE-morning-reading-26 (in `ux/account/morning-reading/states/` and `words-and-access.md`); this contract's criteria prove them.
- **Approach:** fill the row callbacks USE-151 left. The grip drives `SortableList`, which saves on drop with an optimistic order and rolls back on error. ··· is an `EllipsesMenu` (Edit is wired by USE-153, which passes its opener; until then Edit is hidden). Turn off goes to the `Toaster` with Undo. The Off list rows get "Turn on" and "Delete" text buttons. Delete opens an `AlertDialog`.
- **Decisions that apply:** D-USE-123 (grip, Move up/down, a new row and Turn on at the end); D-USE-124 (off is rest; the toast offers Undo; off rows show Turn on and Delete inline); D-USE-125 (delete only from off; Keep it and Delete, ink, `Button` default); D-USE-128 (`SaveStatus`, never a toast for a visible save).
- **Interfaces:** `useRowActions(kind)`, built on `useMorningReading()`'s mutations; `DeleteDialog`; `OffList`.
- **Per path:** `row-actions.tsx`: the ··· menu and its items, with Turn off's line. `off-list.tsx`: the Off rows' buttons. `delete-dialog.tsx`: the confirm. `use-row-actions.ts`: the optimistic order, Undo and the announcements. `row-actions.test.ts`: C2 to C4. `reading-section.tsx`: only the wiring of these parts.
- **Gotchas:** Undo must call `turnOn` with `restore: true`, or the row lands at the end. The toast and dialog words use the title in curly quotes; an untitled passage uses the ledger's [PROPOSED] lines. The delete dialog's first focus is "Keep it".
- **Model:** Opus 5.5 at medium. Choosing down risks a drag-only order and a lost Undo place.
