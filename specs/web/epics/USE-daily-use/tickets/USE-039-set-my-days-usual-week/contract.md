---
id: "USE-39"
size: medium
objective: "Set my days opens at /days on the week, and the usual week can be built: seven rows with strips and lines, a weekday's column at 96 px an hour with Orient locked at Up at, the bounds, the + menu, a tapped time, out-of-bounds blocks, SaveStatus, loading, error and the once-only install offer, every state by ?state= on fixtures"
slice_type: "a new pushed surface on fixtures; risks a column that guesses heights, a strip or line that counts, colour carrying a kind alone, a grey suggestion saved as a time, a tab bar on a pushed screen, and a layout that jumps when the week switch changes"
non_negotiables:
  - "Data only through useWeek, useSetUpDay and usePlannerWrites (the set-up fixtures ticket); no surface file imports lib/fixtures."
  - "Strips, out-of-bounds edges, tapped slots and the first free time come from the set-up pure functions."
  - "Only @syn/ui components and preset tokens (canon §2; A-01 to A-20 by ID). Life's yellow is #C9A227 / #F6EDC4 until a token exists (D-USE-79)."
  - "No second person, no count about the day, nothing red; every kind named in words beside its colour (C-USE-set-my-days-7)."
  - "Edits save as made; no Save button. A grey suggestion in Up at or Lights out is never saved as a time."
  - "Pushed, with no tab bar below 1024; the rail shows from 1024 with nothing current."
  - "Every state of this ticket is reachable by ?state= (canon C-P08)."
devs_call: "File split inside days/_components/; whether the week list and strip go to components/planner/; DayColumn's new props' names; the tapped slot's mark drawing."
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/index.md"
  - "D-USE-32"
  - "D-USE-39"
  - "D-USE-49"
  - "D-USE-82"
  - "D-USE-83"
truth_files: "none: specs/web/ux/set-my-days/ is promoted with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "usual week, empty first day, out of bounds and the + menu at 402 against set-my-days/set-my-days/captures/ (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/days/"
  - "apps/web/app/(shell)/_components/"
  - "apps/web/components/planner/"
  - "apps/web/lib/routes.ts"
  - "apps/web/lib/fixtures/scenarios/"
  - "specs/web/epics/USE-daily-use/tickets/USE-039-set-my-days-usual-week/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-31"
  - "USE-36"
out_of_scope:
  - "This week's week and day, item icons, the day menu, reach, own changes, overlap and drag, offline and the 1024 list-detail: Set my days part 2"
  - "Copy from, the copy offer and the empty day's card: the Copy from ticket"
  - "The New block sheet that Block, Transition, a tapped time and Change its time open: its ticket"
  - "The avatar menu's Set my days row and the install sheet behind How: the account tickets"
  - "Block view: its tickets"
criteria:
  - id: C1
    statement: "Opened from the avatar menu, the week shows \"‹ Now\" over \"Set my days\", Usual week selected, \"Every week\" with the arrows hidden in place, and seven rows each with bounds, a strip in kind colours and a line in words, never a count"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-039-set-my-days-usual-week/evidence/usual-week-402.png"
  - id: C2
    statement: "With nothing set, Monday shows \"Set when the day starts and ends.\", its line, and Up at and Lights out labelled above with grey 7:00 and 22:30; no column, no + until both are set"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-039-set-my-days-usual-week/evidence/empty-first-day-402.png"
  - id: C3
    statement: "The usual Saturday shows Orient at 8:00, Wellness with icon items, the dashed meal bands, and Errands as a moss To-dos block holding only \"Fills from To-dos each Saturday, any type, picked on the day.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-039-set-my-days-usual-week/evidence/usual-saturday-402.png"
  - id: C4
    statement: "The usual Thursday's evening shows \"Free until 19:00.\" on open rail, Dinner with friends as a yellow Life block with its drives in italic, the gap, then Evening as the wind-down"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-039-set-my-days-usual-week/evidence/usual-thursday-evening-402.png"
  - id: C5
    statement: "The + on a usual day opens \"Add to Thursday\" with Block, Transition, a separator and From a saved block, no Event, and the + reads ×"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-039-set-my-days-usual-week/evidence/plus-menu-empty-day-402.png"
  - id: C6
    statement: "Tapping empty rail at 17:00 marks the slot (the rail's ink time tag, a dashed outline, \"+ New block\" over \"17:00 to 18:00\") and sets ?sheet=new-block with that start and end"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-039-set-my-days-usual-week/evidence/tap-a-time-402.png"
  - id: C7
    statement: "With Up at moved to 7:45, Orient sits at 7:45 and Wellness keeps 7:05 to 8:00 with a dashed edge, \"Before Up at. Kept, not run.\" and Change its time; nothing is moved or deleted"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-039-set-my-days-usual-week/evidence/out-of-bounds-402.png"
  - id: C8
    statement: "SaveStatus reads Saving with a spinner, then Saved for 2 s, and on failure \"Not saved · Try again\" in ink with the edit kept; this capture is the failure"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-039-set-my-days-usual-week/evidence/not-saved-402.png"
  - id: C9
    statement: "Loading paints the header, chips, bounds and Orient at once, block-shaped skeletons in the column and a disabled +"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-039-set-my-days-usual-week/evidence/loading-402.png"
  - id: C10
    statement: "Error shows RegionRetry under Orient, \"The day didn't load.\" and \"Nothing was lost. The other days still open from the chips.\" with Try again, nothing red, the + disabled and the chips live"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-039-set-my-days-usual-week/evidence/error-402.png"
  - id: C11
    statement: "After the first day is saved, below 1024 and not installed, \"Synapse can go on the home screen.\" with How sits bottom left beside the +, once"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-039-set-my-days-usual-week/evidence/install-offer-402.png"
  - id: C12
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C13
    statement: "Lint passes"
    evidence: check
    command: "yarn lint"
---

# Contract — set-my-days-usual-week

## Build notes

Set my days, part 1. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — set up", rows "Set my days" (y 0) and "(cont.)" (y 1260). Captures to match: `ux/set-my-days/set-my-days/captures/` (usual-week, empty-first-day, usual-saturday, usual-thursday-evening, plus-menu-empty-day, tap-a-time, out-of-bounds, saved, loading, error, install-offer, all 402). Take ours at `/days?week=usual&state=<state>`.

- **Decisions that apply:**
  - D-USE-49 (the lock): it opens on the week (B), a day pushes from it (A) with "‹ Week". "‹ Now" names the tab it came from.
  - Layout (`layout.md`): the header, the which-week `SegmentedControl`, the stepper ("Every week", arrows hidden at opacity 0 in Usual week), rows (17 px day in a 110 px slot, 13 px bounds, a chevron, an 8 px strip with 2 px gaps, one 13 px line). On a day: `WeekdayChips` 44 × 48 with a dot under a built day; the day line with compact Up at and Lights out and the ···; the column at 96 px an hour, Orient as an ink line with a lock, "Orient · 5 min"; the + a 56 px ink circle.
  - Usual week Work blocks hold their time and "The time is kept every week." / "Work goes in on This week."; a To-dos block holds its rule (`usual-saturday.md`). Open time reads "Free until <time>." only (`usual-thursday-evening.md`).
  - D-USE-32: out-of-bounds blocks keep their place with a dashed edge; Orient moves with Up at, labelled "Orient · 7:45". D-USE-87: past Lights out reads "After Lights out. Kept, not run.".
  - The + menu (`plus-menu.md`): a shadcn dropdown (D-USE-28) titled "Add to <weekday>": Block ("Wellness, Training, Work, Break, Evening"), Transition, Event (This week only), a separator, From a saved block. Block and Transition open `?sheet=new-block` at the first free time.
  - Saved (`saved.md`): "Saving", "Saved" for 2 s then nothing, "Not saved · Try again". Hidden offline, absent loading and on error.
  - Install offer: once ever, only while not installed and below 1024; gone when How is tapped or Set my days is left.
  - Access (`words-and-access.md`): focus opens on the title; chips a radio group "Day"; a row a button "<day>, <bounds>, <its line>"; Orient is text "Orient, 5 minutes, always first"; strips `aria-hidden`; below 356 px the chips scroll sideways (D-USE-87).
- **Interfaces:** `routes.ts` gains `daysRoute({ week, day })`. `DayColumn` (USE-31) gains props for the Orient lock line, a block's edge (`boundsEdge`), its rule or Work lines, an open-time line and a tapped-slot mark; it stays props-only. `/days` joins the shell's pushed list (no tab bar below 1024).
- **Per path:** `days/page.tsx` the server page; `days/_components/` the week, the day, the header and the + menu; scenarios `usual-week`, `empty-first-day`, `usual-saturday`, `usual-thursday-evening`, `plus-menu-empty-day`, `tap-a-time`, `out-of-bounds`, `saving`, `saved`, `not-saved`, `loading`, `error`, `install-offer`.
- **Gotchas:**
  - The install offer's "once" is `useDismissed` on fixtures; per account comes with the wiring.
  - Keep the ··· button in the day line; its menu is part 2's.
  - Run Prettier only on files written here.
- **Model:** Opus 5.5 at medium. A smaller model sizes blocks to their text, counts in the lines, or shows the tab bar here.
