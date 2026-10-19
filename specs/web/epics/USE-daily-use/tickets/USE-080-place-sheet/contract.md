---
id: "USE-80"
size: small
objective: "Place on a pool row opens the place sheet: the item, Days (one or more, more making sessions), Tier, a fit line per day said as a time and \"past Work's end\" in words, and \"Place on <Day> and <Day>\"; placing closes on the day shown with a toast and Undo; a day whose Work can't hold the item gets the doesn't-fit card with by how much, Spread it across the week, the next day with room and Place anyway; on fixtures"
slice_type: "the phone's tap-to-place; risks nothing-moves-until-the-action broken, two days placed as copies, a fit counted at the bottom of the range, a doesn't-fit card in red or with a count, and Undo leaving one session behind"
non_negotiables:
  - "Nothing moves until the sheet's action (C-USE-this-week-2)."
  - "Two days make one item's sessions, \"n of 2\" on each (C-USE-place-from-the-pool-place-sheet-3)."
  - "Fit is USE-8's fitInBlock at the top of every range; past Work's end is muted words with the time, never red (C-USE-place-from-the-pool-place-sheet-2)."
  - "The next day with room is USE-8's firstDayWithRoom; the card names lengths only (C-USE-place-from-the-pool-doesnt-fit-1)."
  - "Placing calls USE-75's place and writes nothing to Linear; Undo removes every session it made (C-USE-place-from-the-pool-placed-undo-2)."
  - "@syn/ui ResponsiveSheet, WeekdayChips, the tier SegmentedControl with squares, and preset tokens only."
devs_call: "File split; whether doesn't-fit replaces the fit line in the same sheet or is a step (the drawn card in the sheet first)."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/place-from-the-pool/phone.md"
  - "specs/web/epics/USE-daily-use/ux/work/this-week/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/work/this-week/states/no-work-block.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/place-from-the-pool/index.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/place-from-the-pool/states/place-sheet.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/place-from-the-pool/states/placed-undo.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/place-from-the-pool/states/doesnt-fit.md"
  - "C-USE-this-week-2"
  - "C-USE-this-week-no-work-block-1"
  - "C-USE-place-from-the-pool-5"
  - "C-USE-place-from-the-pool-phone-1"
  - "C-USE-place-from-the-pool-phone-2"
  - "C-USE-place-from-the-pool-phone-3"
  - "C-USE-place-from-the-pool-place-sheet-1"
  - "C-USE-place-from-the-pool-place-sheet-2"
  - "C-USE-place-from-the-pool-place-sheet-3"
  - "C-USE-place-from-the-pool-placed-undo-1"
  - "C-USE-place-from-the-pool-placed-undo-2"
  - "C-USE-place-from-the-pool-placed-undo-3"
  - "C-USE-place-from-the-pool-doesnt-fit-1"
  - "C-USE-place-from-the-pool-doesnt-fit-2"
  - "C-USE-place-from-the-pool-doesnt-fit-3"
  - "D-USE-54"
  - "D-USE-57"
  - "D-USE-58"
waiver: "Place on the phone: the steps file, with the place sheet, placed with Undo, doesn't fit and no Work block states, each holding its own criteria."
truth_files: "none: promotion carries interactions/place-from-the-pool/"
qa: Q1
reviewers:
  - assay
focus:
  - "the place sheet, placed with Undo and doesn't fit at 402 against their captures (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/work/pool-sheet/"
  - "apps/web/lib/data/use-place.ts"
  - "apps/web/lib/data/place-sheet.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-080-place-sheet/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-8"
  - "USE-10"
  - "USE-55"
  - "USE-75"
  - "USE-78"
  - "USE-79"
out_of_scope:
  - "B, placing mode (not picked, D-USE-58)"
  - "The day's own fit line after placing: USE-81"
criteria:
  - id: C1
    statement: "placeSheetView for KES-58 with Tue and Wed picked in Primary gives each day's runs-to time, marks a day past Work's end with its time, and offers \"Place on Tue and Wed\"; a day whose Primary can't hold it gives the doesn't-fit card with overMin and firstDayWithRoom's day"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 402 the place sheet shows \"Pool · Kestrel Health · KES-58 · 3 Medium · due Wed\", \"Place <title>\", the sessions line, Days with Tue and Wed picked, Tier with Primary, \"Tue's Primary runs to <time> at the top of its ranges.\" and \"Place on Tue and Wed\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-080-place-sheet/evidence/place-sheet-402.png"
  - id: C3
    statement: "At 402 after placing, the day shows the new row marked once and the toast \"Placed on Tue and Wed, in Primary.\" with Undo; a day now past Work's end says \"Doesn't fit by 40 min at the top of the ranges\" in ink"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-080-place-sheet/evidence/placed-undo-402.png"
  - id: C4
    statement: "At 402 doesn't fit shows \"Tue's Work doesn't fit it by 1 h 40\" with its reason, Spread it across the week, \"<Day> <date> has room, <length>\" with Use <Day>, and Place on Tue anyway"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-080-place-sheet/evidence/doesnt-fit-402.png"
  - id: C5
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — place-sheet

## Build notes

Wave 2, after the pool sheet and Spread's sheet. Match `ux/interactions/place-from-the-pool/captures/place-sheet-402.png`, `placed-undo-402.png` and `doesnt-fit-402.png`; the steps are `phone.md`.

- **Decisions that apply:**
  - D-USE-54, D-USE-58: tap to place (A, picked and locked); Placed with Undo; doesn't fit. D-USE-55: the phone needs no drag.
  - Place sheet: "Pool · <client> · <ID> · <size> · due <Day>"; "Place <title>"; "One day places it. Two or more days make it sessions of one task, each “Done for today” on its own day."; "Days"; "Tier"; "<Day>'s <Tier> runs to <time> at the top of its ranges."; "past Work's end at <time>"; "Place on <Day> and <Day>". A day with no Work block is greyed with its reason in words (C-USE-this-week-no-work-block-1).
  - Placed: the sheet closes on the day shown, the new row marked once, toast "Placed on <Day> and <Day>, in <Tier>." with Undo ("Placed on Tue, in Primary." for one) [ASSUMPTION]. Undo: both sessions gone, the item back in the pool as it was.
  - Doesn't fit [ASSUMPTION for the next day, as the state file]: "Tier: <Tier>"; "<Day>'s Work doesn't fit it by <length>"; "<size> runs <range>; <Day>'s <Tier> already holds <length> at the top of its ranges."; "Spread it across the week" (opens USE-78's sheet for this item); "<Day> <date> has room, <length>" with "Use <Day>"; "Place on <Day> anyway" (placed; the day's fit line says by how much, in ink).
  - Offline: Place lands and syncs when back online (D-USE-56).
- **Interfaces:** `PlaceSheet { itemRef; dateKey }`, `DoesntFitCard` in `components/work/pool-sheet/`; pure `placeSheetView` beside `usePlace` (tested).
- **Per path:** `place-sheet.test.ts` holds C1. Scenarios `place-sheet`, `placed-undo`, `doesnt-fit`.
- **Model:** Opus 5.5 at medium. A smaller model places on a day tap, colours the overflow, or copies the item for the second day.
