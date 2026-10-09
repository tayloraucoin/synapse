---
id: MIG-2
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "yarn docs:check-links reports only real broken links again, so the carried House rule 'if a doc moves, run it' can be followed"
slice_type: "tooling; risks hiding a real broken link"
non_negotiables:
  - "Only docs/archive/ and docs/decisions/imported/ are skipped; nothing wider (no docs/ux, docs/product or records skip)."
  - "A pending target is accepted only when tooling/refs-pending.json lists it exactly, file or folder, as check-refs does."
  - "No imported or archived body is rewritten to satisfy the checker."
  - "tooling/check-refs.ts and tooling/refs-pending.json are untouched (copied files)."
devs_call: "How the checker is split for testing (an exported findBroken), the fixture layout, and the test script's name."
cites:
  - "Record 0001, Pointer lines edited after the moves"
truth_files: "none: a docs tooling script; the app's behaviour does not change" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: []
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "scripts/check-doc-links.mjs"
  - "scripts/check-doc-links.test.mjs"
  - "package.json"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Rewriting any archived or imported body to satisfy the checker"
  - "Fixing the breaks left reported: docs/ux and docs/product wait for MIG-1's archive; the records README rows are rewritten by yarn directory-map"
criteria:
  - id: C1
    statement: "The checker reports a real broken link with its file and line, and passes a break inside docs/archive/ or docs/decisions/imported/ and a target listed in refs-pending.json (fixture test)"
    evidence: test
    command: "yarn test:doc-links"
  - id: C2
    statement: "yarn docs:check-links on this repo lists only real breaks: none under docs/decisions/imported/, none listed in refs-pending.json; what remains is docs/ux and docs/product bodies naming old docs/specs paths and the stale generated rows in docs/decisions/records/README.md"
    evidence: manual
    reason: "yarn docs:check-links exits 1 until MIG-1 archives docs/ux and the records README is regenerated; judging that every remaining line is a real break is a read of its output"
---

# Contract — MIG-2 host-link-checker

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** a day-one gap (migrate step 7).
- **What did not cross:** the host's checker (scripts/check-doc-links.mjs) skips only docs/archive/. After the migration it reports 118 broken links (2026-10-09): 57 in the kept copies of the old instruction files, 26 inside the archived spec bodies, 28 in copied practice docs that link toolkit-only files, 6 in docs/ux and docs/product bodies pointing at the old docs/specs paths, and 1 that record 0001 resolves.
- **Plan:** Skip docs/decisions/imported/ as docs/archive/ is skipped (read-only history); read tooling/refs-pending.json and accept a target listed there, as check-refs does; leave docs/ux and docs/product links reported until MIG-1 archives docs/ux. Then the checker exits 0 or lists only real breaks.
- **Conflict risk:** low (one script). Trigger: any time; before the next doc move.
- **Estimate:** one hour. An estimate.
