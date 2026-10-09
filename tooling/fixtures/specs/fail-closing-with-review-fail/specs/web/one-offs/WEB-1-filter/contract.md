---
id: WEB-1
size: small
objective: Filter the records table by status.
slice_type: UI behavior on an existing surface; the risk is a broken empty state.
non_negotiables:
  - Filtering never hides the empty state's action.
devs_call: The control's placement within the toolbar.
cites:
  - tooling/fixtures/specs/fail-closing-with-review-fail/specs/web/ux/records/table.md
  - REC-T1
truth_files:
  - tooling/fixtures/specs/fail-closing-with-review-fail/specs/web/ux/records/table.md
reviewers:
  - vigil
planned_paths:
  - apps/web/lib/records/filter.ts
depends_on: []
out_of_scope:
  - Saved filters.
criteria:
  - id: C1
    statement: Filtering by status keeps only matching rows.
    evidence: test
    command: yarn test:tooling --test-name-pattern C1
  - id: C2
    statement: Tooling types pass.
    evidence: check
    command: yarn check-types:tooling
  - id: C3
    statement: The filter reads well to a person.
    evidence: manual
    reason: a judgment of wording
  - id: review:vigil
    statement: Vigil reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run vigil <id>
---

# Contract — WEB-1 filter

## Notes

Synthetic fixture.
