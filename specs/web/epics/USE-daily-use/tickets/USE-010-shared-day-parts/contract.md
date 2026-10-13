---
id: "USE-10"
size: medium
objective: "The parts every USE screen is built from exist once: @syn/ui gains FiringMark's USE form, LinearStatusShape, LinearLine, the running card's countdown face and the tier square on a heading, each with stories, and apps/web/components gains the block band and header, the item row, the work row in its firing and done forms, and the tier group, all rendering from props only"
slice_type: "shared presentational parts; risks parts that fetch or derive their own data, a firing form drawn in verdigris or red alarm, colour carrying a state alone, a domain-aware part leaking into @syn/ui, and two screens later drawing the same row twice"
non_negotiables:
  - "Props only: nothing under components/{planner,work} imports lib/data, lib/fixtures or tRPC, and no part reads the clock; the caller passes every figure and state."
  - "Only @syn/ui components and preset tokens (canon §2; A-01 to A-20 by ID). Firing is a --color-category-clay-dot mark in a --color-fill-muted halo with --color-red-700 words (D-USE-49), never verdigris."
  - "Colour never alone: a tier square sits beside its word, a status shape beside its word, firing beside its words, the client tile with its letter."
  - "Nothing domain-aware enters @syn/ui: a Linear status is a shape type and a fill, a tier is a hue and a word."
  - "Each @syn/ui addition gets a story for each of its states, its own exports subpath and a row in apps/web/docs/design/components.md."
  - "The breathing mark is still under reduced motion, at full strength."
devs_call: "TierHeading or a leading slot on GroupHeading (the slot first; a new part only if it cannot carry the square cleanly); TimerDisplay's countdown mode or a separate face; file names inside the two folders; how the parts register on /dev/parts."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/today/index.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/working.md"
  - "D-USE-45"
  - "D-USE-48"
  - "D-USE-49"
  - "D-USE-51"
  - "C-USE-today-working-1"
waiver: "Shared parts with no screen of their own; Today's index holds their anatomy, and the working state holds the firing and done forms and the reminder line. Each wave 2 screen cites its own file and builds from these."
truth_files: "none: no screen changes; the wave 2 screens use these"
qa: Q1
reviewers:
  - assay
focus:
  - "the work row's idle, Next, firing and done forms at 402 and 1440 against the working, prompt sent and brought back captures (assay)"
operator_review: false
planned_paths:
  - "packages/ui/src/composed/display/firing-mark/"
  - "packages/ui/src/composed/display/linear-status-shape/"
  - "packages/ui/src/composed/display/linear-line/"
  - "packages/ui/src/composed/display/timer-display/"
  - "packages/ui/src/composed/display/group-heading/"
  - "packages/ui/src/composed/display/tier-heading/"
  - "packages/ui/src/index.ts"
  - "packages/ui/package.json"
  - "apps/web/docs/design/components.md"
  - "apps/web/components/planner/"
  - "apps/web/components/work/"
  - "apps/web/lib/fixtures/parts.ts"
  - "tests/use-parts.test.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-010-shared-day-parts/evidence/"
depends_on:
  - "USE-7"
out_of_scope:
  - "The running card, the lifted Next card, Step away's bar and the Next strip: Today's ticket (wave 2), from these parts"
  - "Swipe to fire, the long-press and right-click work menu, keys: Today's ticket"
  - "The To-dos tray, the Item sheet, the pool rows and week chips: their own tickets"
  - "Formatting rules beyond what a part prints from its props: each screen passes its words"
criteria:
  - id: C1
    statement: "At 402 the work row shows its idle, Next (shaded --color-surface, no border), firing (the breathing mark, title muted, meta at 60 %, \"firing\" over \"n min\") and done (the done mark, title receded, \"Took 1 h 10 · fired 32 min\") forms, with the phone's trimmed meta"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-010-shared-day-parts/evidence/work-row-402.png"
  - id: C2
    statement: "At 1440 the same forms carry the desk meta: client tile and name, project emoji and name, ID, priority chip with its glyph, size chip, \"session 1 of 3\", or \"No Linear\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-010-shared-day-parts/evidence/work-row-1440.png"
  - id: C3
    statement: "The tier group shows its heading with the colour square beside the word, Urgent only when it holds a row; the item row shows a non-work item unchecked, checked, and with its time"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-010-shared-day-parts/evidence/tier-and-item-402.png"
  - id: C4
    statement: "The block band at 1440 and the block header at 402 show the kind's colour, the name and its span, the header's ··· and, when asked for, the Step away pill"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-010-shared-day-parts/evidence/block-band-and-header.png"
  - id: C5
    statement: "Storybook shows LinearStatusShape for backlog, unstarted, started (part filled by its place in the group), completed and canceled, each with its word; LinearLine; and the countdown face counting down, under a minute over in warning and well over in danger, the word over always beside it"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-010-shared-day-parts/evidence/ui-stories.png"
  - id: C6
    statement: "No file under apps/web/components/planner or apps/web/components/work imports lib/data, lib/fixtures, the tRPC client or a clock hook; each new @syn/ui part has a story file and an exports subpath"
    evidence: test
    command: "yarn test:root"
  - id: C7
    statement: "The web app and @syn/ui type-check"
    evidence: check
    command: "yarn check-types"
  - id: C8
    statement: "The boundaries hold"
    evidence: check
    command: "yarn lint:boundaries"
---

# Contract — shared-day-parts

## Build notes

Wave 2, first, after USE-7; parallel to USE-11. Each wave 2 screen composes these and passes its data from its hook. A part prints what it is given.

- **Decisions that apply:**
  - Today's work row: a 44 × 44 lead slot holding the 10 px ring, the firing mark or the done mark; the project emoji in its own 18 px slot, 7 px gap (D-USE-48); the title; the meta; the length range ("30 to 60 min") or the firing time on the right. Phone meta trims to the client tile, project emoji, ID, priority chip and size chip (D-USE-51). Sub-issues: checkboxes under the issue at the desk, "› 2 sub-issues · 1 done" on the phone. Hover shades `--color-surface`.
  - D-USE-49: firing is rust on grey; verdigris means only Taylor's hands. Next is shaded `--color-surface`, with 12 px vertical padding and size chips on `--color-background` inside the shade.
  - D-USE-47: a fired item keeps "worked n min" while firing, and "fired n min" once brought back. The reminder line sits once under the first firing row (a slot on the row group; the pick is USE-8's).
  - D-USE-48: done reads "Took <work> · fired <firing>", and "fired" is left off when it never fired.
  - D-USE-42: priority chips are Urgent red, High yellow, Normal blue and Low grey, each with its glyph. The size chip reads "3 Medium".
  - D-USE-38: the tier squares step red, leaf, amber, slate.
  - D-USE-35: a Linear status is drawn as Linear draws it, In progress yellow and part filled.
  - D-USE-29: over the range counts up as "n min over", warning under a minute and danger at a minute or more.
  - D-USE-47: the running clock is labelled WORK TIME and counts down from the top of the range, with "worked n min since 9:45" under it.
- **Interfaces:** `@syn/ui`: `FiringMark` (restyled to D-USE-49; its live importers are FLO parts whose screens are legacy), `LinearStatusShape { type: "backlog" | "unstarted" | "started" | "completed" | "canceled"; progress?: number; color }`, `LinearLine`, the countdown face and the tier square. `apps/web/components/work/`: `WorkRow`, `TierGroup`. `apps/web/components/planner/`: `DayBlockBand`, `DayBlockHeader`, `PlannerItemRow`. Each takes a view model of plain fields and callbacks (`onToggleFiring`, `onDone`, `onOpen`). None takes a record or a hook.
- **Per path:** each part registers its forms in `lib/fixtures/parts.ts` for `/dev/parts?state=<name>` (USE-7's host), with fixture props built from the default scenario. `tests/use-parts.test.ts` holds C6, reading the files as text.
- **Gotchas:**
  - Name the web parts apart from `@syn/ui`'s legacy `BlockBand`, `BlockHeader` and `ItemRow`. Compose those where they fit; never fork them.
  - The lead slot is 44 × 44 even though the ring is 10 px.
  - A part never reads `?state=`.
  - Run Prettier only on files written here.
- **Model:** Opus 5.5 at medium. A smaller model fetches inside a row, draws firing in verdigris, or hard-codes colours past the tokens.
