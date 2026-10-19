---
id: "USE-70"
size: small
objective: "On the phone a work row swiped right past its reveal fires (Prompt sent), with a one-time hint, the screen's left edge left to the browser and a firing row never swiped; a long-press opens the work menu on the side with room (Start, Prompt sent, Done, Move to tier ›, Move to another day, Back to the pool, Open in Linear) and a tap still opens the Item sheet; at the desk a right-click or the context-menu key opens the same menu"
slice_type: "touch and pointer gestures on rows; risks a swipe that steals the edge-back gesture, a swipe that brings back, a long-press that also opens the sheet, the hint shown twice, and a menu with only a gesture way in"
non_negotiables:
  - "A swipe from the screen's left edge is left to the browser; the row does not move (C-USE-today-thumb-firing-2)."
  - "A firing row ignores the swipe; only a tap on its mark brings it back (C-USE-today-thumb-firing-4)."
  - "Every swipe and long-press has a tap or key alternative: the ring, the menu's Prompt sent, the context-menu key (D-USE-53)."
  - "The hint shows until used once or closed, then never again, per device (use-dismissed) (C-USE-today-thumb-firing-3)."
  - "The menu's actions call USE-59, USE-60 and USE-69's functions; it writes nothing of its own."
  - "Only @syn/ui components and preset tokens; the reveal is surface grey with the firing mark and \"Prompt sent\" in dark rust (D-USE-49)."
devs_call: "The swipe's threshold and edge width; whether the long-press is shared with the Now thread's row menu (USE-18; reuse its hook if landed); ContextMenu from @syn/ui or shadcn's, added through the design layer."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/today/states/thumb-firing.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/work-menu.md"
  - "C-USE-today-thumb-firing-1"
  - "C-USE-today-thumb-firing-2"
  - "C-USE-today-thumb-firing-3"
  - "C-USE-today-thumb-firing-4"
  - "C-USE-today-work-menu-1"
  - "C-USE-today-work-menu-2"
  - "D-USE-53"
  - "D-USE-57"
  - "D-USE-65"
waiver: "The thumb's firing gesture, with the work menu (work-menu.md) folded in: both are the phone's row gestures on the same work row, and the desk's right-click is the menu's other way in."
truth_files: "none: promotion carries work/today/"
qa: Q1
reviewers:
  - assay
focus:
  - "thumb firing mid-swipe with the hint, and the work menu, at 402; the ContextMenu at 1440 (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/components/work/"
  - "apps/web/lib/hooks/use-swipe-row.ts"
  - "apps/web/lib/hooks/use-swipe-row.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-070-today-swipe-work-menu/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-59"
  - "USE-60"
  - "USE-67"
  - "USE-69"
out_of_scope:
  - "Desk keys and drag between tiers: USE-71"
  - "Reordering by the grip on Now: the Now thread's row menu ticket"
  - "The edge swipe in standalone mode on Taylor's iPhone: an operator check (test-shape.md)"
criteria:
  - id: C1
    statement: "useSwipeRow reports fire for a rightward swipe past the reveal that starts beyond the edge zone, nothing for one inside the edge zone or short of the reveal, and nothing on a firing row"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 402 the hint (\"Swipe a work row right to send it firing. The ring on the row still does it with one tap.\" with ×) shows under the Work header and a row mid-swipe reveals the firing mark over \"Prompt sent\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-070-today-swipe-work-menu/evidence/thumb-firing-402.png"
  - id: C3
    statement: "At 402 a long-press dims the screen, lifts the row with its trimmed meta and opens the menu on the side with room: Start, Prompt sent, Done, a rule, Move to tier ›, Move to another day, Back to the pool, a rule, Open in Linear, each with its glyph"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-070-today-swipe-work-menu/evidence/work-menu-402.png"
  - id: C4
    statement: "At 1440 a right-click on a work row opens the same actions as a ContextMenu"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-070-today-swipe-work-menu/evidence/context-menu-1440.png"
  - id: C5
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — today-swipe-work-menu

## Build notes

Wave 2, after USE-59. Match `ux/work/today/captures/thumb-firing-402.png` and `work-menu-402.png`.

- **Decisions that apply:**
  - Thumb firing: swipe right past the reveal fires in place, as Prompt sent; the reveal is surface grey with the firing mark over "Prompt sent" in dark rust and a hairline at the row's leading edge. The lead slot is a 44 × 44 target (D-USE-53). The hint is one-time: "Swipe a work row right to send it firing. The ring on the row still does it with one tap." [PROPOSED]; it addresses no one.
  - D-USE-57: tap a row for its sheet; long-press for the work menu with seven actions in this order: Start (asks first if one runs, USE-60), Prompt sent (reads "Bring back" on a firing row [ASSUMPTION]), Done, Move to tier › (a submenu of the tiers), Move to another day (USE-69 from the menu), Back to the pool, Open in Linear (hidden on a Synapse-only item [ASSUMPTION]). A tap outside closes it.
  - D-USE-65: at the desk, right-click (and the keyboard's context-menu key) opens the same menu as a `ContextMenu`.
  - Reduced motion: the reveal and the lift change without movement.
- **Interfaces:** `useSwipeRow({ disabled, onFire })` in `apps/web/lib/hooks/` (DOM pointer events, web-only); `WorkMenu { view; actions }` in `components/work/`, rendered as the phone's lifted menu or the desk's `ContextMenu`.
- **Per path:** `use-swipe-row.test.ts` holds C1 over the hook's pure decision function (start x, distance, row state), so it runs in node. Scenarios `today-thumb-firing` (hint shown, a row mid-swipe) and `today-work-menu`.
- **Gotchas:**
  - Long-press must cancel the tap that opens the sheet; a scroll cancels both.
  - Move to tier writes through `writeSlots`; on a session it asks as USE-67 does.
- **Model:** Opus 5.5 at medium. A smaller model takes the edge swipe, brings back on a swipe, or opens both the menu and the sheet.
