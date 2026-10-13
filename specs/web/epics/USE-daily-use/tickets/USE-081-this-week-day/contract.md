---
id: "USE-81"
size: small
objective: "Set my days › This week's day gains its work parts on the phone (D-USE-107): the Work block open to its tiers in place, each with its square and word, session marks (\"2 of 3\" with the link glyph), due words worked out for that day, the fit line in ink, and Pool beside the + at the foot opening the pool sheet; a day with no Work block still opens Pool, and past day, loading, error and offline hold, on fixtures"
slice_type: "work parts mounted in another ticket's day pane; risks a second day column, a fit line in red or as a count, due words worked out from today, a tier square with no word, and the + made unreachable offline by mistake"
non_negotiables:
  - "The day pane is USE-42's; this ticket adds the work parts into it and never draws a second day column (D-USE-107)."
  - "The fit line says the length in ink, never red, never a count (C-USE-this-week-the-day-3)."
  - "Due words are worked out for the day shown (C-USE-this-week-the-day-4, D-USE-98)."
  - "No count of the day, no \"missed\", no red; tier squares with their words (C-USE-this-week-4)."
  - "Offline, Pool and Place work and the + is read-only (C-USE-this-week-offline-1)."
  - "Reads through USE-36's day hooks and USE-55's pool; @syn/ui and preset tokens only."
devs_call: "Whether the tiers in place reuse USE-50's tier sections (yes, if they fit the drawn row); the Pool pill's component."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/this-week/index.md"
  - "specs/web/epics/USE-daily-use/ux/work/this-week/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/work/this-week/states/the-day.md"
  - "specs/web/epics/USE-daily-use/ux/work/this-week/states/past-day.md"
  - "specs/web/epics/USE-daily-use/ux/work/this-week/states/loading.md"
  - "specs/web/epics/USE-daily-use/ux/work/this-week/states/error.md"
  - "specs/web/epics/USE-daily-use/ux/work/this-week/states/offline.md"
  - "C-USE-this-week-1"
  - "C-USE-this-week-3"
  - "C-USE-this-week-4"
  - "C-USE-this-week-the-day-1"
  - "C-USE-this-week-the-day-2"
  - "C-USE-this-week-the-day-3"
  - "C-USE-this-week-the-day-4"
  - "C-USE-this-week-past-day-1"
  - "C-USE-this-week-loading-1"
  - "C-USE-this-week-error-1"
  - "C-USE-this-week-offline-1"
  - "C-USE-this-week-offline-2"
  - "D-USE-55"
  - "D-USE-98"
  - "D-USE-107"
  - "D-USE-108"
waiver: "This week's day: the index holds the frame, and the day, past day, loading, error and offline states hold their own criteria; one day pane's work parts."
truth_files: "none: promotion carries work/this-week/"
qa: Q1
reviewers:
  - assay
focus:
  - "the day with its Work tiers and Pool at 402 against the-day-402, and past day, no Work block, loading, error and offline (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/days/"
  - "apps/web/components/work/this-week/"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-081-this-week-day/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-8"
  - "USE-10"
  - "USE-36"
  - "USE-42"
  - "USE-50"
  - "USE-55"
  - "USE-79"
  - "USE-80"
out_of_scope:
  - "The day pane, its chips, ‹ Week, Saved, the + menu and the 1024 list-detail: USE-42"
  - "The pool sheet and the place sheet: USE-79 and USE-80"
  - "Replaying queued placings in order on reconnect: the offline persistence ticket (C4); here the scenario holds them"
criteria:
  - id: C1
    statement: "At 402 Tuesday 13 shows Breakfast, Work open to its tiers (Primary with ALD's \"2 of 3\" and its link glyph and KES-58's \"due Wed\", Secondary, Stretch with \"+ Add to Stretch\"), the fit line \"Doesn't fit by 40 min at the top of the ranges\" in ink, Lunch, the 15:30 Dentist band, and Pool beside the + at the foot"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-081-this-week-day/evidence/the-day-402.png"
  - id: C2
    statement: "At 402 Pool opens the pool sheet over the day; on a day with no Work block it still opens"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-081-this-week-day/evidence/pool-and-no-work-402.png"
  - id: C3
    statement: "At 402 a past day is faded and editable with no \"missed\"; loading shows the header, chips, tabs and filters real over still skeleton rows; error shows a RegionRetry naming the failed region with Try again; offline shows the StatusLine with Pool live and the + read-only"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-081-this-week-day/evidence/edges-402.png"
  - id: C4
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C5
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — this-week-day

## Build notes

Wave 2, after USE-42 and the pool and place sheets. Match `ux/work/this-week/captures/the-day-402.png`.

- **Decisions that apply:**
  - D-USE-107: the frame draws the day short; the build keeps Set my days' day column and adds this frame's work parts: the Work block's tiers in place, the session marks, the due words, the fit line and Pool beside the +.
  - D-USE-108 (3): at 1024 Set my days' day pane keeps Pool; the pool and place sheets open as `ResponsiveSheet`'s right panel.
  - D-USE-55: this is the phone's answer to the Week; from 1024 the desk has the Week instead (C-USE-this-week-3), and This week is Set my days' list-detail.
  - The day: the Work block (sky chip fill, a 3 px sky-dot edge, 12 × 14 padding), "Work" with its span; each tier a 7 px square with its word; rows with the emoji first; the session mark (a 12 px link glyph and "2 of 3", D-USE-102) or "due Wed" at the right; an empty tier's "+ Add to <tier>"; a sky rule, then the fit line (label, medium, ink). Urgent only when it holds something.
  - The foot: Pool at the left (a 52 px pill, `--color-primary`, a layers glyph and "Pool"), the + at the right, both in thumb reach.
  - Edges: no Work block (Pool still opens; Place lists no tier; that day greyed with its reason); past day (faded, editable, nothing missed); loading (nothing shimmers); error (the day, the pool or a sync, only that region, no red); offline (the StatusLine; Pool and Place work; the + read-only; Linear waits).
- **Interfaces:** `WorkTiersInPlace { day }` and `PoolButton` in `components/work/this-week/`, mounted by USE-42's day pane when the week is `this`; the fit line from USE-8's `fitInBlock`.
- **Per path:** scenarios `this-week-day`, `this-week-no-work`, `this-week-past`, `this-week-loading`, `this-week-error`, `this-week-offline`.
- **Gotchas:** the drawn Stretch square is sky; build it slate (D-USE-79).
- **Model:** Opus 5.5 at medium. A smaller model draws a second day column, or works due words out from today.
