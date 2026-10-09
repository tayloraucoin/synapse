---
id: MIG-2
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "yarn docs:check-links reports only real broken links again, so the carried House rule 'if a doc moves, run it' can be followed"
slice_type: "tooling; risks hiding a real broken link"
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
  - "scripts/check-doc-links.mjs"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Rewriting any archived or imported body to satisfy the checker"
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

# Contract — MIG-2 host-link-checker

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** a day-one gap (migrate step 7).
- **What did not cross:** the host's checker (scripts/check-doc-links.mjs) skips only docs/archive/. After the migration it reports 118 broken links (2026-10-09): 57 in the kept copies of the old instruction files, 26 inside the archived spec bodies, 28 in copied practice docs that link toolkit-only files, 6 in docs/ux and docs/product bodies pointing at the old docs/specs paths, and 1 that record 0001 resolves.
- **Plan:** Skip docs/decisions/imported/ as docs/archive/ is skipped (read-only history); read tooling/refs-pending.json and accept a target listed there, as check-refs does; leave docs/ux and docs/product links reported until MIG-1 archives docs/ux. Then the checker exits 0 or lists only real breaks.
- **Conflict risk:** low (one script). Trigger: any time; before the next doc move.
- **Estimate:** one hour. An estimate.
