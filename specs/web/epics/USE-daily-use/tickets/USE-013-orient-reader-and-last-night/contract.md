---
id: "USE-13"
size: small
objective: "From Orient, Read all opens the passage full screen in the serif with swipe and dots, and Read last night's reflections opens the Last night sheet with the evening's three lines read back, read only, both closing back to Orient with focus on their trigger"
slice_type: "two overlays on one screen; risks a reader that loses the passage on close, an editable or writing sheet, empty evening lines drawn as blanks, the first prompt not re-tensed, and focus lost on close"
non_negotiables:
  - "The Last night sheet writes nothing and holds no field or button; an empty evening line is left out."
  - "Only the first prompt is re-tensed (\"What I want to make happen tomorrow\" reads \"… today\"); every other caption and line is the person's own, unchanged."
  - "Both overlays are dialogs that move focus in and return it to their trigger; × sits on the left."
  - "The reader is full screen at every width, the text capped at the reading measure; no button in it."
  - "Reduced motion: no slide; the carousel snaps."
  - "Only @syn/ui components and preset tokens; no time, count or second person."
devs_call: "Whether the reader is a route or an in-page dialog (no history entry is the default); swipe handling (pointer events, no new dependency); the sheet's height (fits its content)."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/orient/states/passage-open.md"
  - "specs/web/epics/USE-daily-use/ux/day/orient/states/last-night-open.md"
  - "C-USE-orient-passage-open-1"
  - "C-USE-orient-passage-open-2"
  - "C-USE-orient-passage-open-3"
  - "C-USE-orient-last-night-open-1"
  - "C-USE-orient-last-night-open-2"
  - "C-USE-orient-last-night-open-3"
  - "C-USE-orient-last-night-open-4"
  - "D-USE-9"
  - "D-USE-14"
waiver: "Two overlays of one surface, Orient; each state file holds its own frame and criteria, and Orient's index names both as its only overlays"
truth_files: "none: promotion carries day/orient/"
qa: Q1
reviewers:
  - assay
focus:
  - "passage open and last night open at 402 against their captures, and focus returning to each trigger (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/orient/_components/"
  - "packages/ui/src/composed/display/passage-reader/"
  - "packages/ui/src/index.ts"
  - "packages/ui/package.json"
  - "apps/web/docs/design/components.md"
  - "apps/web/lib/fixtures/"
  - "packages/utils/src/planner/last-night.ts"
  - "packages/utils/src/planner/last-night.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-013-orient-reader-and-last-night/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-12"
out_of_scope:
  - "Orient's frame and its states: USE-12"
  - "Writing the evening lines: Close the day, USE-21"
  - "The journal prompts' settings: legacy Settings"
criteria:
  - id: C1
    statement: "Read all fills the screen with the reader bar (× left, \"Morning reading\"), the passage's title and every paragraph in the serif, and the dots at the foot"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-013-orient-reader-and-last-night/evidence/passage-open-402.png"
  - id: C2
    statement: "Read last night's reflections opens the sheet with the evening's date, \"Last night\" and three entries under their captions, the first re-tensed to \"What I want to make happen today\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-013-orient-reader-and-last-night/evidence/last-night-open-402.png"
  - id: C3
    statement: "A swipe in the reader shows the next passage and moves the dots; × returns to Orient at that passage with focus on Read all; the sheet's ×, drag down or scrim close it with focus on its trigger"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-013-orient-reader-and-last-night/evidence/focus-and-swipe.txt"
  - id: C4
    statement: "At 1440 the reader stays full screen with its text capped and centred, and the sheet is the right panel at --sheet-w"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-013-orient-reader-and-last-night/evidence/desk-1440.png"
  - id: C5
    statement: "lastNightEntries reads the three read-back keys from a journal entry in order, re-tenses only the first caption, and leaves out a key that is missing or blank"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "The web app, @syn/ui and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "They lint clean"
    evidence: check
    command: "yarn lint"
---

# Contract — orient-reader-and-last-night

## Build notes

Wave 2, after USE-12. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — daily use", row "Orient". Captures to match: `ux/day/orient/captures/passage-open-402.png` and `last-night-open-402.png`. Take ours at `/orient?state=orient-passage-open` and `?state=orient-last-night-open`; each scenario opens its overlay.

- **Decisions that apply:**
  - D-USE-9: the passage clamps on Orient with Read all, which opens a full-screen reader.
  - D-USE-14: Read last night's reflections opens a sheet, "Last night", holding the evening's three lines under their own captions.
  - D-USE-39: at the desk the sheet is `ResponsiveSheet`'s right panel at `--sheet-w`. The reader stays full screen [ASSUMPTION].
  - Built read-back (`ORIENT_READBACK_KEYS`): `make_happen_tomorrow`, shown as "What I want to make happen today"; `visualisation` ("Tomorrow, as I see it"); `looking_forward` ("Looking forward to"). Captions come from the person's prompts, falling back to `DEFAULT_JOURNAL_PROMPTS`.
  - Reader: × on the left with the name "Close"; the caption, medium and muted; the title in sans at `--text-review-title`; paragraphs in Newsreader at `--text-heading` with review-body leading, 16 px apart; dots 8 px wide, 8 px apart, current `--color-foreground`.
  - Sheet: a grab handle, × on the left, the date as a muted caption over "Last night"; each entry has a hairline above, its caption, then the line in body at heading leading.
- **Interfaces:**
  - `PassageReader { passages; index; onIndexChange; onClose; caption }` in `@syn/ui`: presentational, with a story per state (one passage, several, a long one scrolling).
  - `lastNightEntries(entry, prompts): { caption; text }[]` in `@syn/utils` planner, pure.
  - The sheet composes `ResponsiveSheet`, and its trigger is USE-12's `TextDisclosureButton` with `aria-haspopup="dialog"`.
- **Per path:** `focus-and-swipe.txt` is read from the browser pane's accessibility tree after each step.
- **Gotchas:**
  - The reader opens on the carousel's current passage and closes back to that same one.
  - The quote slide reads in the reader as a quote, attributed.
  - Don't fork `PassageCarousel`. Share its slide type.
- **Model:** Opus 5.5 at medium. A smaller model makes the sheet editable, re-tenses every caption, or loses focus on close.
