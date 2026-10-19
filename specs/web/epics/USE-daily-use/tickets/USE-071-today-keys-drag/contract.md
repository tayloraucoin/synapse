---
id: "USE-71"
size: small
objective: "At the desk Today answers the keyboard and the pointer: F fires the focused row or brings it back, D is Done, J and K move focus down and up through the rows, Enter goes to Next, keys act only outside fields, menus and sheets, the tab's title reads \"Next: <title> — Synapse\", and a row drags between tiers"
slice_type: "desk keys and drag on an existing screen; risks keys firing while typing, focus that animates or skips To-dos, a key with no visible focus, and a drag with no keyboard path"
non_negotiables:
  - "Keys act only when focus is not in a text field, an open menu or a sheet (index › Access) [ASSUMPTION, as drawn]."
  - "F, D and Enter call USE-59's functions; they write nothing of their own, and do nothing on an opened day (C-USE-today-opened-day-2)."
  - "J and K move focus through the rows in order, tiers then To-dos, without animation (A-15)."
  - "Dragging between tiers has a keyboard path (the work menu's Move to tier, USE-70)."
  - "Desk only: no key handler or drag handle renders below 1024."
devs_call: "Where the key handler lives (one listener on the desk's main column); the drag's sensors (dnd-kit, as the repo uses); how the title updates (document.title from the derived Next)."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/today/words-and-access.md"
  - "C-USE-today-5"
  - "D-USE-62"
truth_files: "none: promotion carries work/today/"
qa: Q1
reviewers:
  - assay
focus:
  - "the focus ring on a row, the title, and a drag between tiers at 1440 (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/desk/"
  - "apps/web/components/work/"
  - "apps/web/lib/hooks/use-today-keys.ts"
  - "apps/web/lib/hooks/use-today-keys.test.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-071-today-keys-drag/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-57"
  - "USE-58"
  - "USE-59"
  - "USE-70"
out_of_scope:
  - "Shortcuts help (ShortcutsDialog): not drawn for USE"
  - "Drag from the pool onto Today: USE-82 and USE-75"
criteria:
  - id: C1
    statement: "The key map gives F on an idle row fire, on a firing row bring back; D Done; J and K the next and previous row across tiers then To-dos; Enter focus on Next; and nothing while focus is in an input, a textarea, an open menu or a sheet, or on a planning day"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 1440 a focused row shows the ring, and the browser tab reads \"Next: <title> — Synapse\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-071-today-keys-drag/evidence/focus-and-title-1440.png"
  - id: C3
    statement: "At 1440 a row dragged from Secondary to Primary lands in Primary with the drop shown by a line, and the write moves the slot's tier"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-071-today-keys-drag/evidence/drag-between-tiers-1440.png"
  - id: C4
    statement: "In the browser at 1440, F, D, J, K and Enter act as the key map says, read back from the accessibility tree and the fixture's events"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-071-today-keys-drag/evidence/keys.txt"
  - id: C5
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — today-keys-drag

## Build notes

Wave 2, after USE-70. No ledger capture draws the keys; C4 is a text log, as USE-4's keyboard.txt.

- **Decisions that apply:**
  - D-USE-62, D-USE-117: F fires the focused row, or brings it back when firing; D is Done on the focused row; J and K move focus down and up through the rows in order (tiers, then To-dos); Enter goes to Next (focuses it; on the strip it is Go).
  - Index › Access: keys act only when focus is not in a text field or an open menu or sheet [ASSUMPTION]; focus moves without animation (A-15). Focus order: rail, week strip, header (Step away, + Add), Next strip's Go, rows top to bottom (each row: lead slot, then the row as a link to its sheet, then its card buttons), To-dos, day column.
  - D-USE-43: the tab title is "Next: … — Synapse" at the desk.
  - The work menu's note: drag between tiers stays at the desk (N6).
  - Names: the row "<title>, <tier>, <length>", with ", next" on Next.
- **Interfaces:** `todayKeyAction(key, { focusedRow, inField, menuOpen, sheetOpen, planning }): Action | null` (pure, tested) and `useTodayKeys(rows, actions)` in `apps/web/lib/hooks/`. The drag uses `@dnd-kit/core` and `sortable` (already in the app), calling `writeSlots` with the new tier and sort order.
- **Per path:** `use-today-keys.test.ts` holds C1.
- **Gotchas:**
  - J past the last To-do stays there; K above the first row stays there.
  - The title falls back to "Today — Synapse" when there is no Next.
- **Model:** Opus 5.5 at medium. A smaller model fires while typing in Notes, or drops To-dos from J and K.
