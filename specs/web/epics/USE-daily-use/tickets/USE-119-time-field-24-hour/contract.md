---
id: USE-119
size: small
objective: "The To-do sheet's reminder TimeField shows its whole value at the drawn width in any locale, on the native picker, so \"12:30\" (or a 12-hour locale's \"12:30 PM\") is never clipped"
slice_type: "a native control's width and glyph fitted to its frame; risks re-litigating the native picker (Epic 1 §0.3), which stays"
non_negotiables:
  - "The native time picker stays (TimeField's header, Epic 1 §0.3); no custom picker."
  - "The value stays a wall-clock \"HH:mm\" string."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
devs_call: "How the field sizes to its value (min width from the formatted value, or a wider slot); whether the browser's clock glyph shows."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/todo-sheet/states/reminder-on.md"
  - "D-USE-3"
  - "D-USE-37"
truth_files: "none: the epic's ux/ already describes the drawn form; the build catches up to it"
qa: Q1
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "packages/ui/src/composed/control/time-field/"
  - "apps/web/components/planner/todo-sheet/"
  - "specs/web/epics/USE-daily-use/tickets/USE-119-time-field-24-hour/evidence/"
depends_on: []
out_of_scope:
  - "The day select beside it (Today, Tomorrow, Pick a day…)"
  - "Reminder scheduling (USE-30)"
criteria:
  - id: C1
    statement: "Reminder on in a browser set to en-GB shows the At row's TimeField reading \"12:30\" in full, outlined, beside \"Today\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-119-time-field-24-hour/evidence/reminder-on-en-gb-402.png"
  - id: C2
    statement: "The same sheet in a browser set to en-US reads \"12:30 PM\" in full, nothing clipped, the row on one line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-119-time-field-24-hour/evidence/reminder-on-en-us-402.png"
  - id: C3
    statement: "@syn/ui and the web app type-check"
    evidence: check
    command: "yarn check-types"
  - id: C4
    statement: "They lint clean"
    evidence: check
    command: "yarn lint"
---

# Contract — time-field-24-hour

## Build notes

Found by the assay pass against Paper (2026-10-18, thread A, USE-28 C4). In headless Chromium (en-US) the At row's TimeField reads "12:30 PM", clipped at the field's edge, with the browser's clock glyph inside. Paper's `todo-sheet / reminder on / 402 / light` (p-4-0, x 1446, y 8820) draws "12:30" in a compact outlined field. The rest of the day reads 24-hour, and Taylor's phone may well show 24-hour. Even so, a 12-hour locale must not clip.

- **Approach:** size the field to its formatted value and keep the native input. Capture under both locales with Playwright's `locale` option at `/dev/parts?state=reminder-on&sheet=todo&id=00000000-0000-4000-8000-600000000301`.
- **Decisions that apply:** D-USE-3: "the sheet holds N4's reminder field." D-USE-37: "approved as drawn". TimeField: "THE NATIVE PICKER, ON BOTH PLATFORMS (Epic 1 §0.3)".
- **Interfaces:** none new.
- **Per path:** `time-field/` the width rule and a story at both locales; the To-do sheet's At row only if its slot is what clips.
- **Gotchas:** the slug says 24-hour; the fix is the clipping, not forcing a 24-hour display. Forcing one would fight the native picker the ruling keeps.
- **Model:** Sonnet 5.5 at medium; a smaller model restyles past the frame or drops the existing behaviour.
