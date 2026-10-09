---
id: MIG-10
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "verify checks formatting repo-wide, read-only, first in the chain"
slice_type: "formatting; risks a rebase storm"
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
  - "**/*.{ts,tsx,md}"
  - "package.json"
  - ".prettierignore"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Any other change in the same commit"
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

# Contract — MIG-10 format-all

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** 3, part 10 (signal C5).
- **What did not cross:** a read-only format check; format writes only (prettier --write "**/*.{ts,tsx,md}"). verify:fast checks formatting on changed files only. .prettierignore keeps the copied practice files, the imported records, docs/index.md, product-rules.md and specs/_status.md out.
- **Plan:** One commit in a quiet window: yarn format over the repo, nothing else; then a format:check script (prettier --check with the same glob) first in verify.
- **Conflict risk:** high by definition (every file). Trigger: the window, after every open branch has merged.
- **Estimate:** an hour, plus the wait for the window. An estimate.
