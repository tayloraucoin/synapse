---
size: small
objective: "Set my days' day column draws the date's Google events on fixtures: an accepted meeting as a plum band ending in 'Google' with the work after it re-flowed, a maybe or unanswered one as a dashed band with Add to day, a declined one not at all"
slice_type: "a wave 2 UI gap on fixtures; risks a dashed band that reads as an error, an Add to day with no Undo, and colour alone telling yes from maybe"
non_negotiables:
  - "Only @syn/ui components and preset tokens; no raw colour, spacing or radius."
  - "Yes and maybe differ by line style and words, never by colour alone."
  - "Add to day writes a day event for that date only, through the fixture server's writeDayEvent, with a toast and Undo."
  - "Every state is reachable by ?state= on /dev/parts or /days."
  - "Nothing is written to Google."
devs_call: "The band part's file under components/planner/; the scenario names."
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/states/google-events.md"
  - "C-USE-set-my-days-google-events-1"
  - "C-USE-set-my-days-google-events-2"
  - "C-USE-set-my-days-google-events-3"
truth_files: "none: set-my-days/ is promoted with USE"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/components/planner/"
  - "apps/web/app/(shell)/days/_components/"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
depends_on:
  - "USE-89"
  - "USE-42"
  - "USE-53"
  - "USE-56"
out_of_scope:
  - "Reading real calendars: USE-103"
  - "Push for an event's start: none (D-USE-92)"
criteria:
  - id: C1
    statement: "An accepted Google event draws as a plum band at its time, its times read-only and 'Google' at its end"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-109-google-events-on-the-day/evidence/days-google-events-402.png"
  - id: C2
    statement: "A maybe or unanswered event draws as a dashed band with Add to day; Add to day lands a day event for that date with a toast whose Undo removes it"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "Work placed after an accepted event re-flows past it, as it does for a day event"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "A declined event is not drawn, and the Usual week view shows no Google events at all"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
id: USE-109
---

# Contract — google-events-on-the-day

## Build notes

Vigil's pre-flight (2026-10-16) found no ticket that draws Google events on the day. USE-42, USE-53 and USE-73 sent them to "the Google Calendar ticket", and USE-56 sent them to "the Schedule and day tickets". USE-103 is the server side only, so this is the UI on USE-56's fixtures (its two workspaces' calendars).

- **Decisions that apply:**
  - D-USE-87, as the state file has it: an answered-yes event is a band; maybe or not answered is a dashed band with Add to day; no is hidden.
  - D-USE-82: several calendars, each on or off.
- **Approach:**
  - A pure `googleBandsOf(day, events)` in `lib/data/`, beside `set-up-events.ts`. Check the wip branch `wip/use-50-53-drafts`, which holds USE-53's draft of that file.
  - It maps each event's answer to `band | dashed | hidden` (hidden for every event on the usual week); the column draws the band part. A yes band is busy time to the fit and re-flow, through USE-53's re-flow over day events.
  - Add to day calls `writeDayEvent` with the event's title and times, through `useUndoToast`.
- **Per path:**
  - `lib/data/google-bands.test.ts`: C2 and C3.
  - Scenario `days-google-events` (Tuesday 13, one yes, one maybe, one declined).
- **Model:** Opus 5.5 at medium.
