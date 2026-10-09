---
id: MIG-11
size: medium # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "The imported decision logs are indexed entry by entry, and the bash guard can be ruled team rule by rule"
slice_type: "records and harness; risks a guard split that loosens a rule"
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
  - "docs/decisions/ledger.md"
  - ".claude/settings.json"
  - "tooling/hooks/**"
  - "tooling/hooks/fixtures/bash-guard.json"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Editing any imported body"
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

# Contract — MIG-11 day-one-leftovers

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** 3, part 12.
- **What did not cross:** (a) entry-by-entry indexing: day one wrote one ledger line per log for 111 dated entries in nine TECHNICAL-DECISIONS.md files; (b) the per-rule split of bash-guard.ts for a team (ruled operator, team after the merge-side week); (c) six allow-case commands in tooling/hooks/fixtures/bash-guard.json were retargeted from the toolkit's PJ:/DOC-2: to SYN:/WEB-2: because the fixture context cannot set prefixes (a toolkit finding).
- **Plan:** (a) one ledger line per entry, citing file and heading, bodies untouched; (b) the split is built in the toolkit first and installed here after the merge-side week; (c) when the toolkit's fixture context carries prefixes, copy its bash-guard.json byte for byte again.
- **Conflict risk:** low. Trigger: (a) any quiet hour; (b) the merge-side week passed; (c) the toolkit fix lands.
- **Estimate:** half a day each for (a) and (b); minutes for (c). Estimates.
