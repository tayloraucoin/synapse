---
id: MIG-11
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "The imported decision logs are indexed entry by entry: every imported technical decision is found from the ledger by one grep"
slice_type: "records; risks an edit to an append-only imported body"
non_negotiables:
  - "No imported body changes: every file under docs/decisions/imported/specs/ stays byte for byte its blob at f2bfeb1."
  - "One ledger line per entry heading, citing its log file and carrying the heading verbatim (Prettier's _emphasis_ for *emphasis* aside)."
  - "No criterion matches a string the ledger's own header or the checker's comments contain."
  - "tooling/hooks/ is untouched."
devs_call: "The ledger line's shape, the section it sits in, and how the check is written."
cites:
  - "MIG-migration rulings 41"
  - "record 0001"
truth_files: "none: records only; the app's behaviour does not change" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: []
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "docs/decisions/ledger.md"
  - "scripts/check-ledger.mjs"
  - "package.json"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Editing any imported body"
  - "The per-rule bash-guard split (MIG-12) and the bash-guard fixture restore (MIG-13), split out on 2026-10-09"
criteria:
  - id: C1
    statement: "Every dated entry heading in the nine imported TECHNICAL-DECISIONS.md files (111, measured), and each undated one, has exactly one ledger line citing its file and its heading, and no entry line cites a heading that does not exist"
    evidence: check
    command: "yarn check-ledger"
  - id: C2
    statement: "Every imported body is byte-identical: each file under docs/decisions/imported/specs/ hashes to its blob at f2bfeb1, and git reports nothing uncommitted there"
    evidence: check
    command: "yarn check-ledger --bytes"
---

# Contract — MIG-11 day-one-leftovers

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts. Narrowed to part (a) on 2026-10-09: the bash-guard split is MIG-12 and the fixture restore is MIG-13, their lines moved there verbatim.

- **Layer:** 3, part 12.
- **What did not cross:** (a) entry-by-entry indexing: day one wrote one ledger line per log for 111 dated entries in nine TECHNICAL-DECISIONS.md files.
- **Plan:** (a) one ledger line per entry, citing file and heading, bodies untouched.
- **Conflict risk:** low. Trigger: (a) any quiet hour.
- **Estimate:** half a day for (a). An estimate.
