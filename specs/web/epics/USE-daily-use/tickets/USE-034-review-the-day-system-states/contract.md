---
id: "USE-34"
size: small
objective: "Review the day fails and waits region by region: the header paints at once while the tray and column wait as still skeletons with Ready, go disabled as \"Loading the day\", a failed day shows RegionRetry with Ready, go hidden, a failed tray offers its own Try again, and offline the day shows from cache, editable, under one status line"
slice_type: "a screen's system states on fixtures; risks a whole-page error or spinner, Ready, go live over a day that never loaded, one failed region taking the other down, a shimmer under reduced motion, and offline edits refused"
non_negotiables:
  - "Each region fails on its own, in place (D-USE-69): a failed tray never hides the day, and a failed day never hides the tray."
  - "Ready, go is disabled with \"Loading the day\" while loading and hidden when the day failed; it works offline."
  - "Offline, everything stays editable and Ready, go works; one StatusLine says so, nothing else changes."
  - "No error colour, no icon of alarm, no second person; skeletons never shimmer."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
devs_call: "How the fixture scenarios fail one query and not the other; whether the skeleton bands are SkeletonRow or Skeleton composed; where the online flag is read (lib/hooks/use-online)."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/loading.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/error.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/partial.md"
  - "specs/web/epics/USE-daily-use/ux/day/review-the-day/states/offline.md"
  - "C-USE-review-the-day-loading-1"
  - "C-USE-review-the-day-error-1"
  - "C-USE-review-the-day-partial-1"
  - "C-USE-review-the-day-partial-2"
  - "C-USE-review-the-day-offline-1"
  - "C-USE-review-the-day-offline-2"
waiver: "Review the day's four system states, one surface; each state file is a few lines over the success frame USE-31 builds"
truth_files: "none: promotion carries day/review-the-day/"
qa: Q1
reviewers:
  - assay
focus:
  - "loading, error and offline at 402 against review-the-day/captures/, and both partial cases: only the failed region changes (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/review/"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-034-review-the-day-system-states/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-19"
  - "USE-31"
out_of_scope:
  - "Persisting the cache and replaying offline writes across a reload: the offline-persistence ticket (wave 3, C4)"
  - "The tray's own rows and states: USE-19"
criteria:
  - id: C1
    statement: "Loading shows ‹ Orient over the date at once, the tray as two still bars, the column as filled and dashed skeleton bands with no hour labels, Orient line or rail +, and a disabled Ready, go reading \"Loading the day\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-034-review-the-day-system-states/evidence/loading-402.png"
  - id: C2
    statement: "When the day fails, RegionRetry reads \"The day didn't load.\" and \"Nothing is lost. The plan is still there once it loads.\" with Try again; Ready, go is hidden; ‹ Orient works"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-034-review-the-day-system-states/evidence/error-402.png"
  - id: C3
    statement: "When only the to-dos fail, the column and Ready, go show as success and the tray's row reads \"To-dos didn't load.\" with Try again; when only the day fails, the tray shows and the column is the error frame"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-034-review-the-day-system-states/evidence/partial-402.png"
  - id: C4
    statement: "Offline, one StatusLine reads \"Offline. Changes are saved on this phone and sync later.\" under the header, and the day below is the success frame"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-034-review-the-day-system-states/evidence/offline-402.png"
  - id: C5
    statement: "Through the fixtures, Try again on a failed day refetches only the day and lands on success, and a Ready, go made while the scenario is offline is applied once the scenario comes back online"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "It lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — review-the-day-system-states

## Build notes

After USE-31. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — daily use", row "Review the day (cont.)". Captures to match: `ux/day/review-the-day/captures/{loading,error,offline}-402.png`. Partial was not drawn. Take ours at `/today/review?state=review-<loading|error|partial-todos|partial-day|offline>`. C3's capture places the two partial cases side by side.

- **Decisions that apply:**
  - N3's loading row: skeleton bands, and the button disabled with the label "Loading the day". The skeleton starts at x 62 with `--radius-control`; filled bands where Wellness, Training and Work sit, dashed outlines for the meals.
  - N3's error row: `RegionRetry`, matching Orient's (muted words, a secondary Try again on `--color-fill-muted`), with the button hidden.
  - D-USE-69: each region fails on its own. The to-dos row's words follow the error pattern: "To-dos didn't load." and "Try again".
  - D-USE-56 and D-USE-64: edits save offline on the phone and sync later. N3: Ready, go works offline.
  - Reduced motion: skeletons are still. Focus stays on the title, and Try again moves focus into the reloaded region.
- **Interfaces:** the day and the to-dos are two queries (`useToday` and USE-19's to-do hook), so each fails apart. Scenarios: `review-loading`, `review-error`, `review-partial-todos`, `review-partial-day` and `review-offline`. Offline uses TanStack's `onlineManager`, so mutations pause and resume as they will in wave 3.
- **Gotchas:**
  - The header never waits: the date is known on the device.
  - The loading scenario never settles (USE-7). The error scenario rejects until retried.
  - `StatusLine` pushes the tray and column down. It never overlays them.
- **Model:** Opus 5.5 at medium. A smaller model shows one page-wide error or spinner, or leaves Ready, go live over a failed day.
