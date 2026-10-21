---
id: USE-149
size: small
objective: "The switch reads as a switch: a rounded-full track and knob, named as the one exception to preset.css's \"nothing is a pill\""
slice_type: "a primitive's look; risks the exception spreading unnamed"
non_negotiables:
  - "The exception is written beside the radii line in preset.css (Taylor, 2026-10-19)."
  - "Colour never alone: the knob's side still carries on and off; aria-checked unchanged."
devs_call: "none"
cites:
  - "packages/config/tailwind/preset.css"
truth_files: "none: a primitive's look; preset.css names the exception"
qa: Q1
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "packages/ui/src/primitives/control/switch/switch.tsx"
  - "packages/config/tailwind/preset.css"
depends_on: []
out_of_scope:
  - "Any other rounded control"
criteria:
  - id: C1
    statement: "The New block sheet's Notify switch at 402 shows a round track and knob"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-149-switch-is-a-pill/evidence/"
---

# Contract — USE-149 switch-is-a-pill

## Build notes

Fix 8 of Taylor's review of 2026-10-19.

- **Approach:** `rounded-full` on the track and knob in `switch.tsx`; preset.css's RADII comment names the switch beside the mark and the dots.
- **Model:** any.
