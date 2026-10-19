---
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "A UI build reads each design rule in one place: the domain guides keep only what the design layer does not say"
slice_type: "docs consolidation; risks losing the name-to-type guidance builders use"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
truth_files: "none: design documentation; the app's behaviour does not change"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "docs/ai-guides/brand-tokens.md"
  - "docs/ai-guides/typography-guidelines.md"
  - "docs/ai-guides/component-guidelines.md"
  - "docs/archive/**"
  - ".claude/rules/house-ui.md"
depends_on: [ MIG-9 ]
out_of_scope:
  - "Token or component changes in code"
criteria:
  - id: C1
    statement: "[FILL]"
    evidence: check
    command: "[FILL: yarn <script>]"
id: MIG-21
---

# Contract — retire-domain-guides

## Build notes

Drafted by MIG-9 on 2026-10-09; the criteria are written when the ticket starts.

- **Why:** MIG-9 wrote apps/web/docs/design/. Three domain guides now overlap it (MIG-9 as-built): brand-tokens.md restates tokens.md's roles (accent trap = G-04, destructive, violet, chips) beside its own name-to-type map; typography-guidelines.md "Two families" restates D-P01, while its variant choice, presets and tones do not; component-guidelines.md is @syn/ui authoring (classes prop, forwardRef, stories, a11y checklist) and overlaps only in §9 copy (copy-register.md).
- **Plan:** cut the restated sections; move what is left where its importer reads it (the name-to-type map and variant choice beside the layer or in packages/ui/AGENTS.md); superseded text to docs/archive/ (House rule); repoint .claude/rules/house-ui.md; mind the path-rules budget row (1,445 of 1,500).
- **Estimate:** half a day. An estimate.
