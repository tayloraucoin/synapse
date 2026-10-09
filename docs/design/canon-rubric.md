---
title: Design canon — the critic rubric
description: Read when scoring rendered UI against the canon, or when calibrating the critic; the procedure and the fifteen rubric lines every product inherits. Builders never load it.
layer: design
status: ruling
thread: P-A
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes: docs/design/canon.md §3 (v0.1)
load_when: critique
---

# Design canon — the critic rubric

Split from [`canon.md`](canon.md) §3 on 2026-10-01 ([record 0009](../decisions/records/0009-canon-split.md)); the text below is unchanged, except that C-R14 now names canon §2, where the tells it checks live. Plumb owns these lines; the critic (Assay, through `tk-ui-critic`) applies them. The critic loads this file and canon §2, whose tells C-R14 checks by ID. A product may add rubric lines in its package's Verification section; loosening one needs an amendment here.

## Rubric

**Procedure (not a rubric line).**

- **Input.** The critic receives the brief, the package, this rubric, and screenshots at 390, 834 and 1440, in light and dark, with reduced motion, for every `?state=`. It receives nothing from the builder's summary.
- **Review order.** Purpose and clarity; then hierarchy, layout and interaction; then color and state; then polish.
- **Output.**
  - The top 3 priorities.
  - Each line marked PASS, N issues, N/A or UNVERIFIED.
  - Each finding cites a screenshot region or `file:line` and a rule ID.
  - A round verdict.
- **Severity.** Blocking / Should-fix / Consider.
- **Limits.** At most 3 rounds, and at most 3 calibration exemplars in context.
- **Sources:** R04; R06b; R09 C-4; R14; CF-40.

| ID    | Check                                                                                                                                                                                   | Default severity                                      | Rules        | Sources        |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------ | -------------- |
| C-R01 | Evidence: every finding cites a region or `file:line`; uncaptured states are UNVERIFIED, never passed; concrete language ("4 radii", not "inconsistent")                                | procedural (a finding without evidence is withdrawn)  | all          | R04; R06b (SK) |
| C-R02 | Greyscale test: desaturated, the screen has one focal point and secondary information recedes by weight and color                                                                       | Should-fix                                            | C-P01, C-P02 | R08            |
| C-R03 | At most one primary-styled action per view; destructive primary only inside its confirmation                                                                                            | Blocking                                              | C-P02        | R08            |
| C-R04 | At most 4 type sizes; reading text ≥16px; tabular text ≥ the declared minimum                                                                                                           | Should-fix (Blocking below the minimum)               | C-P01        | R06a; R06b     |
| C-R05 | Structure and labels: numbering or eyebrows that encode nothing; a key–value pair that should be a phrase; an input without a visible label; action labels that aren't the outcome verb | Should-fix (unlabeled input: Blocking)                | C-P03, C-P09 | R08; R04       |
| C-R06 | Spacing: an off-scale value; space between groups not greater than space within                                                                                                         | Should-fix                                            | C-P04        | R08; R06a      |
| C-R07 | Separation: a border where space would do; a shadow outside its named level; nested cards                                                                                               | Should-fix                                            | C-P04, C-P06 | R08; R04       |
| C-R08 | Tokens only: raw color, spacing, radius, shadow, font or duration                                                                                                                       | Blocking                                              | C-P06        | R04; R07b M5   |
| C-R09 | Color role: accent used decoratively; one shade with two meanings; meaning by color alone; contrast below AA                                                                            | Blocking (contrast, color alone); Should-fix (others) | C-P05        | R06a; R08      |
| C-R10 | States: every state in `states.md` captured; hover, focus and active above rest; focus visible; empty state designed                                                                    | Blocking (missing state, invisible focus)             | C-P07, C-P08 | R06a; R04      |
| C-R11 | Numbers: tabular, right-aligned, unit placed, baseline shared                                                                                                                           | Should-fix                                            | C-P10        | R08            |
| C-R12 | Motion: the `tk-motion` review checks M1–M12, reported as one line                                                                                                                      | per M#                                                | C-P11        | R07b           |
| C-R13 | Removal test: an element or asset with no stated job                                                                                                                                    | Consider (Should-fix on the focal path)               | C-P12        | R09            |
| C-R14 | Slop tells, checked by ID (canon §2, A-01 to A-20)                                                                                                                                      | Should-fix (A-19, A-20: Blocking)                     | canon §2     | R04; R08; R06a |
| C-R15 | Laws of UX: findings cite LUX rule IDs loaded through `docs/references/README.md` (at most 3 files). A finding with no rule ID of any kind (C-, A-, LUX-, M) is Consider at most        | per LUX rule                                          | references   | R13            |

## Changelog

- 2026-10-01: split from `canon.md` §3 (canon v0.2). Text unchanged; the C-R14 row names canon §2 explicitly.
