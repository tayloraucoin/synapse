---
id: MIG-9
size: medium # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "apps/web has its design layer, so ui.md loads Synapse's tokens, components, states and anti-patterns by path"
slice_type: "design system documentation; risks a layer that restates the canon"
non_negotiables:
  - "Six files under apps/web/docs/design/, each a delta: a canon line is cited by ID, never restated."
  - "Every token and component named is read from preset.css or packages/ui/src; a gap goes to coverage-gaps.md, never invented."
  - "The product non-negotiables (apps/web/docs/product-rules.md) are folded into anti-patterns.md."
  - "The product layer fits the budget's design-layer row beside canon.md (about 1,130 tokens)."
  - "No token or component change in code; no edit to canon.md."
devs_call: "Which product rules become principles, rows or gaps; the wording; how terse each file is to fit the room."
cites:
  - "specs/web/ux/_global/system-states.md"
truth_files: "none: design documentation; the app's behaviour does not change"
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: []
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "apps/web/docs/design/**"
  - "toolkit.json"
  - ".claude/rules/ui.md"
  - "tooling/refs-pending.json"
depends_on: [] # MIG-1 dropped 2026-10-09: the layer reads only promoted _global files; see Build notes
out_of_scope:
  - "Token or component changes in code"
  - "Archiving brand-tokens.md, typography-guidelines.md and component-guidelines.md (drafted as its own ticket)"
criteria:
  - id: C1
    statement: "Every design-layer path the templates and ui.md name resolves, with no apps/web/docs/design/ entry left in tooling/refs-pending.json"
    evidence: check
    command: "yarn check-refs"
  - id: C2
    statement: "yarn budget passes with the product layer counted inside the design-layer row"
    evidence: check
    command: "yarn budget"
  - id: C3
    statement: "toolkit.json sets apps.web.designLayer to apps/web/docs/design, and ui.md names the six files"
    evidence: manual
    reason: "read toolkit.json and .claude/rules/ui.md"
  - id: C4
    statement: "Each file is a delta: no canon line restated, every P-A row maps to a product non-negotiable, every token and component named exists in code"
    evidence: manual
    reason: "read the six files against canon.md, product-rules.md, preset.css and packages/ui/src"
---

# Contract — MIG-9 design-layer

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** 3, part 9 (signals P4, V2).
- **What did not cross:** the product's design files (DESIGN.md, tokens.md, components.md, states.md, anti-patterns.md, coverage-gaps.md from docs/design/templates/). Inputs exist: packages/config/tailwind/preset.css (V2 scored 0), docs/ux/branding-guide.md (derived), docs/ai-guides/brand-tokens.md, typography-guidelines.md, component-guidelines.md, the v2 component handoff.
- **Plan:** Its own thread after the promotion: fill the six templates under apps/web/docs/design/ as deltas from the canon; fold the product non-negotiables (apps/web/docs/product-rules.md) into anti-patterns.md so ui.md loads them by path (Mason, 2026-10-09); set apps.web.designLayer in toolkit.json; drop the design-layer entries from tooling/refs-pending.json; keep the product layer within the budget's design-layer row (about 1,130 tokens beside canon.md).
- **Conflict risk:** low in code. Trigger: MIG-1 closed.
- **Estimate:** a day. An estimate.
- **[ASSUMPTION]** depends_on MIG-1 dropped at start (2026-10-09): MIG-1 is open on its own checks, but the files this layer points to (specs/web/ux/_global/) are promoted and approved on disk.
