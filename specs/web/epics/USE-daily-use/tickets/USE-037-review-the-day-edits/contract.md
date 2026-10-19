---
id: "USE-37"
size: small
objective: "Review the day takes today-only edits with Undo: the rail + with its one-time hint, the first-change line once ever, the swap's landing with \"Swapped for Yoga. Training ends 8:50.\" and Undo, a band swiped away with Undo, and an empty Work block's Add to Primary, Add to Secondary and Open This week, all through useDayEdits on fixtures"
slice_type: "today-only writes and their undo on fixtures, plus three one-time and empty states; risks an edit reaching the usual week, an Undo that restores half, a hint that comes back, a count on the tray, and swap's drives removed by the app"
non_negotiables:
  - "Every edit here changes today only; the usual week, its blocks and items, never change (note 18, C-USE-review-the-day-2)."
  - "Every edit has an Undo that restores exactly what it changed."
  - "The hint and the first-change line each show until dismissed once, then never again on any morning (localStorage through useDismissed)."
  - "A swapped gym workout keeps its drives (D-USE-60 (1)); the app removes nothing it was not asked to."
  - "Only @syn/ui components and preset tokens; no second person, no count of items, nothing red."
  - "Screens call useDayEdits; nothing under app/ imports lib/fixtures."
devs_call: "Swipe threshold and the band's slide (opacity only under reduced motion); where the Undo toast helper lives (lib/hooks); the + position maths for \"the next free time\"."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/first-edit.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/first-mornings.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/after-swap-undo.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/no-work.md"
  - "C-USE-review-the-day-first-edit-1"
  - "C-USE-review-the-day-first-edit-2"
  - "C-USE-review-the-day-first-mornings-1"
  - "C-USE-review-the-day-first-mornings-2"
  - "C-USE-review-the-day-after-swap-undo-1"
  - "C-USE-review-the-day-after-swap-undo-2"
  - "C-USE-review-the-day-after-swap-undo-3"
  - "C-USE-review-the-day-no-work-1"
  - "D-USE-18"
  - "D-USE-60"
  - "D-USE-22"
waiver: "Review the day's edit states, one surface; first-edit.md holds \"Adjusting in place\", which every other file here applies"
truth_files: "none: promotion carries day/review-the-day/"
qa: Q1
reviewers:
  - assay
focus:
  - "first mornings, first change, after swap with Undo and no work at 402 against review-the-day/captures/; Undo restoring exactly (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/review/"
  - "apps/web/components/planner/day-column/"
  - "apps/web/lib/data/use-day-edits.ts"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
  - "apps/web/lib/hooks/use-undo-toast.ts"
  - "apps/web/lib/routes.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-037-review-the-day-edits/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-14"
  - "USE-31"
out_of_scope:
  - "The + drag, tapping empty time and the add sheet, including its preset Add to Primary form: add-from-the-rail's ticket (this one opens ?sheet=add)"
  - "The Swap library itself: the Item sheet's ticket; this one owns where the swap lands"
  - "Open This week's landing: Set my days' ticket (this one links to it)"
  - "The late wake and the passed row: the late-wake ticket"
criteria:
  - id: C1
    statement: "On the first mornings the callout beside the + reads \"Tap to add. Hold and drag up or down to pick the time.\" with Got it, over the Lunch band"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-037-review-the-day-edits/evidence/first-mornings-402.png"
  - id: C2
    statement: "After the first change ever, a band under the header reads \"Changes apply to today. Monday's usual stays as it is.\" and the tray and column move down by it"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-037-review-the-day-edits/evidence/first-edit-402.png"
  - id: C3
    statement: "After a swap, Training reads 8:00 to 8:50 with Drive to the YMCA, Yoga, Drive home, the + beside 8:50, and a Toaster above Ready, go: \"Swapped for Yoga. Training ends 8:50.\" with Undo"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-037-review-the-day-edits/evidence/after-swap-undo-402.png"
  - id: C4
    statement: "An empty Work block reads \"Nothing slotted for today. Work is set with the week, in This week.\" with + Add to Primary, + Add to Secondary and › Open This week, and no tier sub-heads"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-037-review-the-day-edits/evidence/no-work-402.png"
  - id: C5
    statement: "Through useDayEdits on the fixtures, a swap, an add and a remove each change only today's records, leave every usual-week record equal, and Undo returns today's records to exactly what they were"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "Got it, or a first drag, dismisses the hint for every later morning, and the first-change line shows on the first edit only"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "A band swiped away leaves with an Undo Toaster that puts it back; Add to Primary and Add to Secondary open ?sheet=add preset to their tier, and Open This week links to this week at today and its Work block"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-037-review-the-day-edits/evidence/actions.txt"
  - id: C8
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C9
    statement: "It lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — review-the-day-edits

## Build notes

After USE-31, using USE-14's dated items and skipped slots. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — daily use", row "Review the day". Captures to match: `ux/day/review-the-day/captures/{first-mornings,first-edit,after-swap-undo,no-work}-402.png`. Take ours at `/today/review?state=review-<name>`.

- **Decisions that apply:**
  - first-edit.md, "Adjusting in place": swap from the Item sheet; reorder in Block view; add with the rail + or a block's own "Add to …"; remove a band by swiping, with Undo. A change changes today only, and a long morning of edits never times out.
  - D-USE-18: the + teaches itself, with up and down marks and the hint until the first drag or Got it. A tap alone doesn't dismiss it.
  - D-USE-15: one + in the rail (40 × `--spacing-row`, a 1 px ink border), at the next free time.
  - D-USE-60 (1): the drives stay after a swap. D-USE-12: Swap names where the block ends, so the Toaster's "ends 8:50" is no surprise.
  - D-USE-22 and D-USE-2: an empty Work block has Add to Primary, Add to Secondary and Open This week; there is no Add to Urgent or Add to Stretch here.
  - Words: "Changes apply to today. <Weekday>'s usual stays as it is."; "Swapped for <item>. <Block> ends <time>."; "Undo"; "Got it"; and no-work's three rows, exactly as drawn.
  - Access: the Toaster announces politely, and Undo is reachable by keyboard before it leaves. The first-change line is announced once.
- **Interfaces:**
  - `useDayEdits(dateKey)` returns `{ swap(slotOrItem, withItem), add(blockId, item), remove(target), reorder(blockId, ids), undo(token) }`. Each call returns an undo token.
  - The fixture server applies today-only writes in USE-14's shapes: a swap is a skipped slot plus a dated `block_items` row, a remove a skipped slot or a `block_changes` skip, and an add a dated item or slot. It keeps the inverse for `undo`.
  - `useUndoToast()` shows the house `Toaster` with Undo above Ready, go. Later screens reuse it.
  - Scenarios: `review-first-mornings`, `review-first-edit`, `review-after-swap-undo` and `review-no-work`.
- **Per path:** `actions.txt` records each action in the browser pane and the URL or toast that followed.
- **Gotchas:**
  - The swap's landing arrives from the Item sheet as a mutation. Here it is staged by its scenario, and `swap` is tested directly.
  - The hint's dismissal reuses `useDismissed`; never add a second mechanism.
  - The weekday in the first-change line follows the day being reviewed.
- **Model:** Opus 5.5 at medium. A smaller model writes the swap onto the usual block, undoes only part of a change, or removes the drives.
