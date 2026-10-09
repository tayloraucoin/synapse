---
id: MIG-1
size: large # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "The product's UX source in docs/ux/ becomes living truth in specs/web/ux/, read by every UI ticket, and docs/ux/ is archived"
slice_type: "product spec, from documents and code; risks a spec that disagrees with shipped behaviour"
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
  - "specs/web/ux/**"
  - "docs/ux/"
  - "docs/decisions/imported/ux/"
  - "docs/index.md"
  - "packages/ui/AGENTS.md"
  - "docs/README.md"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "The design layer files (MIG-9)"
  - "Any code change"
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

# Contract — MIG-1 promote-ux-spec

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** 3, part 9 (living truth); a day-one gap (rulings 41: docs/ux stays until promoted).
- **What did not cross:** docs/ux/ (14 files: ux-spec-v1, v1.1, v1.2, v1.3, workflow-ux-spec-v0.1, three epic architecture documents, the navigation document, two component handoffs, branding-guide.md, landing-page-ux.md, README.md) stayed in place: it is cited by the precedence ladder (docs/index.md rung 1) and packages/ui/AGENTS.md:14, and it is today's product truth. specs/web/ux/ holds only .gitkeep.
- **Plan:** Open with the promotion prompt the migration printed (tk-prompt, track product spec, lead Vesper). Read docs/ux against the code surface by surface; write specs/web/ux/ from docs/design/templates/ux-overview.template.md and ux-surface.template.md, one overview per area and one file per surface, every reachable state named; where code and spec disagree, the code's behaviour is the truth and the disagreement is listed for Taylor. Then git mv docs/ux docs/decisions/imported/ux, point ladder rung 1 at specs/web/ux/, edit the pointer lines (packages/ui/AGENTS.md:14, docs/README.md, docs/ai-guides), and add the folder to docs/decisions/imported/README.md.
- **Conflict risk:** low in code (specs and docs only). Trigger: Taylor opens the promotion thread; the first UI ticket under the practice waits for it.
- **Estimate:** one to three days, by the spec's size (about 9,000 lines today). An estimate.
