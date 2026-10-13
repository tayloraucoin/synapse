---
id: "USE-17"
size: small
objective: 'Now''s other block forms on the phone: the ··· pull-down "<Block>, today", the quiet "Planned to end at <time>" once a block runs past its end, a meal with no topics between blocks, the List before Ready, go, and Checklist blocks, with and without a span, on fixtures through useNow'
slice_type: "variants of one screen; risks a late block turning a colour or saying late, a checklist that lifts a card, an all-day checklist that hides a set-time block, and the List tab label picked in the component instead of from the day record"
non_negotiables:
  - 'Behind is one muted line, "Planned to end at <time>"; nothing changes colour and no word for late appears (product rules).'
  - "A Checklist block has no card, no lengths, no times and no Start; a checked row fades in place and nothing lifts."
  - "On a checklist day a set-time block is the active block while it runs, and the checklist returns after it (D-USE-72), decided by activeBlock in @syn/utils."
  - "Before Ready, go is read from the day record (readyAt null); the tab reads List and the title is the date."
  - "Only @syn/ui components and preset tokens; menus are @syn/ui DropdownMenu with one soft shadow (D-USE-28)."
devs_call: "File split under today/_components/now/; how the behind line is announced once (aria-live polite, keyed on the block); the before-go list's row part."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/now/states/header-menu.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/behind.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/transition.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/before-ready-go.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/checklist-block.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/sunday-checklist.md"
  - "C-USE-now-header-menu-1"
  - "C-USE-now-header-menu-2"
  - "C-USE-now-behind-1"
  - "C-USE-now-transition-1"
  - "C-USE-now-before-ready-go-1"
  - "C-USE-now-checklist-block-1"
  - "C-USE-now-checklist-block-2"
  - "C-USE-now-sunday-checklist-1"
  - "C-USE-now-sunday-checklist-2"
waiver: "One surface, Now: six of its states, each a block form on the screen USE-16 builds."
truth_files: "none: an epic proposal; promotion carries day/now/"
qa: Q1
reviewers:
  - assay
focus:
  - "behind (no colour, no late) and the two checklist forms at 402 against now/captures (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/components/planner/"
  - "apps/web/lib/data/use-now.ts"
  - "apps/web/lib/data/now-forms.test.ts"
  - "apps/web/lib/fixtures/"
  - "apps/web/lib/routes.ts"
  - "packages/utils/src/planner/now-block.ts"
  - "packages/utils/src/planner/now-block.test.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-017-now-block-forms/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-16"
out_of_scope:
  - "What Complete <Block> opens (the close card): USE-25; the item ships here and calls onComplete, which USE-25 supplies"
  - "The Block view that Edit block opens, and Review the day that its button opens: their own tickets; the links use routes.ts builders"
  - "The all-done footer a meal's Done leads to: USE-20"
  - "Meals with topics: USE-22; the long-press menu and reordering a checklist: USE-18"
  - "Schedule's content behind See the whole day: USE-27"
criteria:
  - id: C1
    statement: '··· shows filled ink and a pull-down titled "Wellness, today" with Complete Wellness, Edit block, a separator and See the whole day, each with its icon, with no scrim'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-017-now-block-forms/evidence/header-menu-402.png"
  - id: C2
    statement: 'At 8:04 in Wellness one muted line "Planned to end at 8:00" sits under the span; the bar, the card and the rows look as at 7:14'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-017-now-block-forms/evidence/behind-402.png"
  - id: C3
    statement: 'At 9:02 Breakfast shows the fork-and-knife glyph in the bar''s place, "9:00 to 9:30", and one card on a neutral tile with "30 min · 9:00" and a full-width Done, no Start, no rows'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-017-now-block-forms/evidence/transition-402.png"
  - id: C4
    statement: 'Before Ready, go the title is "Monday, 12 October", the tab reads List, the blocks are listed with bar, name and span (Breakfast muted with no bar), and Review the day floats on the footer fade'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-017-now-block-forms/evidence/before-ready-go-402.png"
  - id: C5
    statement: 'A Checklist block reads "10:00 to 13:00 · Checklist" and lists every item with a box and a grip, no card, no lengths, Water the plants checked and faded'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-017-now-block-forms/evidence/checklist-block-402.png"
  - id: C6
    statement: 'On a checklist day at 11:20 the header reads "All day · Checklist · next: Lunch with Sam, 13:00" with the rows and Add to the checklist'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-017-now-block-forms/evidence/sunday-checklist-402.png"
  - id: C7
    statement: "activeBlock returns Lunch with Sam from 13:00 to 14:30 on a checklist day and the checklist before and after; behindSince returns the block's end once now passes it and null before"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "Checking checklist rows out of order completes each in place and leaves current null; Add to the checklist adds a row and keeps the input open; See the whole day goes to todayScheduleRoute()"
    evidence: test
    command: "yarn test"
  - id: C9
    statement: "The web app and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
  - id: C10
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — now-block-forms

## Build notes

Wave after USE-16, on its `NowScreen`, `useNow` and scenarios. Captures to match: `ux/day/now/captures/{header-menu,behind,transition,before-ready-go,checklist-block,sunday-checklist}-402.png`; Paper `01M49AX02VV4SSBKNCN6NRTS6Y`, "USE — daily use", rows "Now" and "Now (cont.)". Each is taken at `/today?state=<name>` with the scenario of the same name.

- **Decisions that apply:**
  - D-USE-24, D-USE-26, D-USE-28: ··· alone on Now's header opens a pull-down titled with its scope: "<Block>, today", Complete <Block> (circled tick), Edit block (pencil), a separator, See the whole day (calendar). Background token, hairline, 10 px radius, one soft shadow; it covers the trailing part of the rows, no scrim.
  - N4, behind: once the planned end passes, "Planned to end at <time>" (label, muted) under the span, announced once, politely. The next block does not slide on its own.
  - N4, between blocks: a meal with no topics shows its glyph, not a colour bar; one card on a `--color-fill-muted` tile, Done full width, no Start.
  - D-USE-5 and D-USE-25: before Ready, go the tab reads List and the screen is the day's List with Review the day on the footer fade. The canvas caption "[placeholder: …]" is not shipped.
  - D-USE-28: Checklist is a block's setting; with no span it is the All day checklist. D-USE-72: on a checklist day Now is the checklist, and a set-time block lifts above it at its time.
  - D-USE-17: a grip on every undone row, checklists included.
- **Interfaces:**
  - `@syn/utils` `planner/now-block.ts`: `activeBlock` learns all-day checklists (a timed block wins while it runs); `behindSince(block, now): Date | null`.
  - `useNow` gains `phase: "before-go" | "live"` from the day record and `block.form: "items" | "meal" | "checklist" | "all-day-checklist"`. `AppShell`'s `firstTab` (USE-4) gets "List" before go.
  - `components/planner/`: `NowBlockMenu`, `ChecklistRows`. `today/_components/now/`: `BeforeGoList`.
  - Scenarios: `header-menu` (view.open), `behind` (8:04), `transition` (9:02), `before-ready-go` (7:02, readyAt null), `checklist-block` (a Sunday reset 10:00 to 13:00 at 10:20), `sunday-checklist` (Sunday 18 October at 11:20, with Lunch with Sam 13:00 to 14:30).
  - `routes.ts`: `todayReviewRoute()` and `blockRoute(id)` if absent, for Review the day and Edit block.
- **Per path:** `now-forms.test.ts` holds C8 against the fixture server; `now-block.test.ts` gains C7.
- **Gotchas:**
  - Checklist items are placeholders as drawn: Groceries, Laundry, Water the plants, Meal prep, Tidy the flat, Plan the week.
  - The scenarios set `now` to the frame's minute; the status bar is the device's, not drawn.
  - USE-18 to USE-22 edit `useNow` in parallel: append fields, never rename.
- **Model:** Opus 5.5 at medium. A smaller model turns the behind line amber or lets the checklist lift a card.
