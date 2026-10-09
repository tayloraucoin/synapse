---
id: MIG-9
size: medium # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "apps/web has its design layer, so ui.md loads Synapse's tokens, components, states and anti-patterns by path"
slice_type: "design system documentation; risks a layer that restates the canon"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
  - "[FILL: decision and criterion IDs from it, as D-OB2-1 or OB2-W3]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "apps/web/docs/design/**"
  - "toolkit.json"
  - ".claude/rules/ui.md"
  - "tooling/refs-pending.json"
depends_on: [MIG-1] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Token or component changes in code"
criteria:
  - id: C1
    statement: "[FILL: what is true when this is done, observable by a user or caller]"
    evidence: test
    command: "[FILL: yarn <script>; a package.json script that runs this criterion's test]"
  - id: C2
    statement: "[FILL]"
    evidence: check
    command: "[FILL: yarn <script>]"
---

# Contract — MIG-9 design-layer

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** 3, part 9 (signals P4, V2).
- **What did not cross:** the product's design files (DESIGN.md, tokens.md, components.md, states.md, anti-patterns.md, coverage-gaps.md from docs/design/templates/). Inputs exist: packages/config/tailwind/preset.css (V2 scored 0), docs/ux/branding-guide.md (derived), docs/ai-guides/brand-tokens.md, typography-guidelines.md, component-guidelines.md, the v2 component handoff.
- **Plan:** Its own thread after the promotion: fill the six templates under apps/web/docs/design/ as deltas from the canon; fold the product non-negotiables (apps/web/docs/product-rules.md) into anti-patterns.md so ui.md loads them by path (Mason, 2026-10-09); set apps.web.designLayer in toolkit.json; drop the design-layer entries from tooling/refs-pending.json; keep the product layer within the budget's design-layer row (about 1,130 tokens beside canon.md).
- **Conflict risk:** low in code. Trigger: MIG-1 closed.
- **Estimate:** a day. An estimate.
