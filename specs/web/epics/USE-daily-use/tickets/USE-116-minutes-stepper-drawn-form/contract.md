---
id: USE-116
size: small
objective: "The Time taken sheet's MinutesStepper takes its drawn form: a round − and + either side of a large typeable figure with \"min\" beside it over an underline"
slice_type: "a composite's look brought to its frame; risks the typed value, the bounds and the 44 px targets breaking while the shape changes"
non_negotiables:
  - "The figure stays typeable and starts at the planned length (D-USE-13)."
  - "− and + are 44 px round targets keeping the names the component already gives them."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID); no count-up or tweened value (A-14)."
devs_call: "Whether the drawn form is a variant or the stepper's only form (check its other callers first); the figure's type token."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/running/states/time-taken-sheet.md"
  - "D-USE-13"
truth_files: "none: the epic's ux/ already describes the drawn form; the build catches up to it"
qa: Q1
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "packages/ui/src/composed/control/minutes-stepper/"
  - "apps/web/app/(shell)/today/_components/now/time-taken-sheet.tsx"
  - "specs/web/epics/USE-daily-use/tickets/USE-116-minutes-stepper-drawn-form/evidence/"
depends_on: []
out_of_scope:
  - "Took … · Change and the sheet's other parts (USE-16, as built)"
  - "Anything about how a time taken is recorded"
criteria:
  - id: C1
    statement: "Change opens the sheet with the stepper as drawn: a round − on the left, \"2\" large with \"min\" beside it over an underline, a round + on the right, and Save"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-116-minutes-stepper-drawn-form/evidence/time-taken-sheet-402.png"
  - id: C2
    statement: "Storybook shows the MinutesStepper at its start value, at its lower bound (− disabled) and while typed"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-116-minutes-stepper-drawn-form/evidence/minutes-stepper-stories.png"
  - id: C3
    statement: "@syn/ui and the web app type-check"
    evidence: check
    command: "yarn check-types"
  - id: C4
    statement: "They lint clean"
    evidence: check
    command: "yarn lint"
---

# Contract — minutes-stepper-drawn-form

## Build notes

Found by the assay pass against Paper (2026-10-18, thread A, USE-16 C4). Built, the stepper is a compact boxed row (− 2 min +) inside the sheet; Paper's `done / time-taken sheet / 402 / light` (x 2410, y 13980) draws round − and + targets either side of a large figure over an underline. The states file says it in words: "a round − on the left, \"2\" large with \"min\" beside it over an underline (the typeable field), a round + on the right".

- **Approach:** change the stepper's layout in `@syn/ui`, keep its value, bounds and typing logic; update its stories; recapture at `/dev/parts?state=now-time-taken-sheet` (or `/today?state=time-taken-sheet`).
- **Decisions that apply:** D-USE-13: "Change opens the `MinutesStepper`. The \"Other…\" chip and its sheet (N4) are gone."
- **Interfaces:** none new; `MinutesStepper`'s props unchanged unless a variant is added.
- **Per path:** the stepper's folder holds the form and its stories; `time-taken-sheet.tsx` only if it passes a variant.
- **Gotchas:** grep the stepper's other callers before changing its only form. The figure is an input: it must keep a visible label for screen readers (A-16).
- **Model:** Sonnet 5.5 at medium; a smaller model restyles past the frame or drops the existing behaviour.
