---
id: "USE-45"
size: small
objective: "One day takes another built day's blocks: the copy offer under Orient and the empty day's card copy at once with Undo, Copy from… and Other day… open a picker of built days with strips, a day with blocks asks Replace once, and From a saved block lands one block with its items, all on fixtures"
slice_type: "a short flow over Set my days on fixtures; risks an ask on an empty day, no ask on a built one, a picker that lists the day being set or a day not built, a strip with no words, and an Undo that restores less than it took"
non_negotiables:
  - "Empty copies at once; a day with blocks asks Replace first, naming what goes; either way a Toaster offers Undo, which restores the day exactly."
  - "Only built days are listed; the day being set never is."
  - "The copy goes through usePlannerWrites' copyDay; nothing here decides what copies."
  - "Replace and every destructive word in ink, never red; the ask names what goes in words."
  - "Offline the copy offer and Copy from… are read-only (D-USE-82)."
  - "Only @syn/ui components and preset tokens; a strip is aria-hidden and its row names the blocks."
  - "Every state of this ticket is reachable by ?state= (canon C-P08)."
devs_call: "Whether the picker and the saved-block picker share one component; file split; focus return details beyond the access notes."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/copy-from/index.md"
  - "C-USE-copy-from-1"
  - "C-USE-copy-from-2"
  - "C-USE-copy-from-3"
  - "C-USE-copy-from-4"
  - "D-USE-32"
  - "D-USE-33"
  - "D-USE-87"
waiver: "The flow's two entry states live in Set my days: set-my-days/states/copy-offer.md and empty-day.md, and the + menu's From a saved block (plus-menu.md, D-USE-87's default) uses this picker's form."
truth_files: "none: interactions/copy-from/ is promoted with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "the copy offer, the empty day's card, the picker, Replace and the copied toast against interactions/copy-from/captures/ and set-my-days/set-my-days/captures/ (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/days/"
  - "apps/web/components/planner/"
  - "apps/web/lib/fixtures/scenarios/"
  - "specs/web/epics/USE-daily-use/tickets/USE-045-copy-from/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-36"
  - "USE-42"
out_of_scope:
  - "Review the day's Copy another day: Review the day's ticket opens this picker for today"
  - "Slotted work in a copy: copied as time only (D-USE-87); the dev note's later pass"
criteria:
  - id: C1
    statement: "Thursday with bounds set and other days built shows Orient, then \"Copy from Monday\" and \"or tap a time to add a block\" under it, left-aligned"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-045-copy-from/evidence/copy-offer-402.png"
  - id: C2
    statement: "An empty usual Thursday shows \"Every Thursday\", undated chips and the dashed card under Orient: \"Nothing on Thursday yet.\", Copy from Wednesday (the last built weekday before it), Other day… and \"or tap a time, or +, to add a block\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-045-copy-from/evidence/empty-day-402.png"
  - id: C3
    statement: "Copy from… on Thursday lists Monday, Tuesday, Wednesday and Sunday, each with its strip and its blocks named, Sunday's dashed with \"One checklist, no times\"; Thursday, Friday and Saturday are absent"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-045-copy-from/evidence/copy-picker-402.png"
  - id: C4
    statement: "Monday picked while Thursday has blocks opens \"Replace Thursday with Monday?\" naming Thursday's Wellness and Work and that this week's Thursday follows, with Cancel and Replace in ink"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-045-copy-from/evidence/replace-confirm-402.png"
  - id: C5
    statement: "After Replace, Thursday holds Monday's blocks and a Toaster reads \"Thursday copied from Monday\" with Undo"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-045-copy-from/evidence/copied-undo-402.png"
  - id: C6
    statement: "From a saved block lists other days' blocks in the picker's form; the picked one lands with its items at the first free time, with a Toaster and Undo"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-045-copy-from/evidence/saved-block-picker-402.png"
  - id: C7
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C8
    statement: "Lint passes"
    evidence: check
    command: "yarn lint"
---

# Contract — copy-from

## Build notes

On Set my days (parts 1 and 2). Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — set up". Captures to match: `ux/interactions/copy-from/captures/` (copy-picker, replace-confirm, copied-undo) and `ux/set-my-days/set-my-days/captures/` (copy-offer, empty-day). Take ours at `/days?week=usual&day=thu&state=<state>`.

- **Decisions that apply:**
  - D-USE-32: the picker of built days with strips, Replace only when the day has blocks, then the Toaster with Undo, which restores the day as it was.
  - D-USE-33: in the usual week the ask's last line is "This week's <Day> follows."; in This week the dated form "Replace Thursday, 15 October with Monday?" with no follows line [ASSUMPTION].
  - D-USE-87: the empty day's button names the last built weekday before the day open (the frame's "Monday" is an example word); From a saved block opens a picker in Copy from's form.
  - What copies: blocks, their times, kinds and items; Up at and Lights out stay the day's own; Orient stays first and locked; Work blocks as time only, reading "Work goes in on This week." in the usual week.
  - No built day to offer: the ··· item and Other day… do not show [ASSUMPTION].
  - Access: the picker is a sheet that traps focus, × named "Close", each row one button "<Day>: <blocks named>"; the ask is an `AlertDialog`, focus on Cancel, Esc cancels, focus back to the ···; Undo reachable by Tab, named "Undo copy", not timing out while focused.
  - Desk: the picker in the right-panel sheet, the ask a centred `AlertDialog`.
- **Interfaces:** `CopyPicker { title; helper; days: { key; name; strip; line }[]; onPick; onClose }` in `components/planner/`, reused by the saved-block picker with blocks in place of days. Scenarios `copy-offer`, `empty-day`, `copy-picker`, `replace-confirm`, `copied-undo`, `saved-block-picker`.
- **Gotchas:**
  - The strip is the same part as the week list's; one strip, never two.
  - The toast sits above the + on the fade.
- **Model:** Opus 5.5 at medium. A smaller model asks on an empty day, lists every weekday, or restores only the blocks on Undo.
