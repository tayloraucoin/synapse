---
id: WEB-1
size: small
objective: Filter the records table by status.
slice_type: UI behavior on an existing surface; the risk is a broken empty state.
non_negotiables:
  - Filtering never hides the empty state's action.
devs_call: The control's placement within the toolbar.
cites:
  - tooling/fixtures/specs/fail-contract-over-cap/specs/web/ux/records/table.md
  - REC-T1
truth_files: "none: the fixture changes no living UX file"
reviewers: []
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
---

# Contract — WEB-1 filter

## Notes

Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. Synthetic padding to break the cap. 

- Synthetic note 0: the filter keeps every matching row and drops none of them.
- Synthetic note 1: the filter keeps every matching row and drops none of them.
- Synthetic note 2: the filter keeps every matching row and drops none of them.
- Synthetic note 3: the filter keeps every matching row and drops none of them.
- Synthetic note 4: the filter keeps every matching row and drops none of them.
- Synthetic note 5: the filter keeps every matching row and drops none of them.
- Synthetic note 6: the filter keeps every matching row and drops none of them.
- Synthetic note 7: the filter keeps every matching row and drops none of them.
- Synthetic note 8: the filter keeps every matching row and drops none of them.
- Synthetic note 9: the filter keeps every matching row and drops none of them.
- Synthetic note 10: the filter keeps every matching row and drops none of them.
- Synthetic note 11: the filter keeps every matching row and drops none of them.
- Synthetic note 12: the filter keeps every matching row and drops none of them.
- Synthetic note 13: the filter keeps every matching row and drops none of them.
- Synthetic note 14: the filter keeps every matching row and drops none of them.
- Synthetic note 15: the filter keeps every matching row and drops none of them.
- Synthetic note 16: the filter keeps every matching row and drops none of them.
- Synthetic note 17: the filter keeps every matching row and drops none of them.
- Synthetic note 18: the filter keeps every matching row and drops none of them.
- Synthetic note 19: the filter keeps every matching row and drops none of them.
- Synthetic note 20: the filter keeps every matching row and drops none of them.
- Synthetic note 21: the filter keeps every matching row and drops none of them.
- Synthetic note 22: the filter keeps every matching row and drops none of them.
- Synthetic note 23: the filter keeps every matching row and drops none of them.
- Synthetic note 24: the filter keeps every matching row and drops none of them.
- Synthetic note 25: the filter keeps every matching row and drops none of them.
- Synthetic note 26: the filter keeps every matching row and drops none of them.
- Synthetic note 27: the filter keeps every matching row and drops none of them.
- Synthetic note 28: the filter keeps every matching row and drops none of them.
- Synthetic note 29: the filter keeps every matching row and drops none of them.
- Synthetic note 30: the filter keeps every matching row and drops none of them.
- Synthetic note 31: the filter keeps every matching row and drops none of them.
- Synthetic note 32: the filter keeps every matching row and drops none of them.
- Synthetic note 33: the filter keeps every matching row and drops none of them.
- Synthetic note 34: the filter keeps every matching row and drops none of them.
- Synthetic note 35: the filter keeps every matching row and drops none of them.
- Synthetic note 36: the filter keeps every matching row and drops none of them.
- Synthetic note 37: the filter keeps every matching row and drops none of them.
- Synthetic note 38: the filter keeps every matching row and drops none of them.
- Synthetic note 39: the filter keeps every matching row and drops none of them.
- Synthetic note 40: the filter keeps every matching row and drops none of them.
- Synthetic note 41: the filter keeps every matching row and drops none of them.
- Synthetic note 42: the filter keeps every matching row and drops none of them.
- Synthetic note 43: the filter keeps every matching row and drops none of them.
- Synthetic note 44: the filter keeps every matching row and drops none of them.
- Synthetic note 45: the filter keeps every matching row and drops none of them.
- Synthetic note 46: the filter keeps every matching row and drops none of them.
- Synthetic note 47: the filter keeps every matching row and drops none of them.
- Synthetic note 48: the filter keeps every matching row and drops none of them.
- Synthetic note 49: the filter keeps every matching row and drops none of them.
- Synthetic note 50: the filter keeps every matching row and drops none of them.
- Synthetic note 51: the filter keeps every matching row and drops none of them.
- Synthetic note 52: the filter keeps every matching row and drops none of them.
- Synthetic note 53: the filter keeps every matching row and drops none of them.
- Synthetic note 54: the filter keeps every matching row and drops none of them.
- Synthetic note 55: the filter keeps every matching row and drops none of them.
- Synthetic note 56: the filter keeps every matching row and drops none of them.
- Synthetic note 57: the filter keeps every matching row and drops none of them.
- Synthetic note 58: the filter keeps every matching row and drops none of them.
- Synthetic note 59: the filter keeps every matching row and drops none of them.
- Synthetic note 60: the filter keeps every matching row and drops none of them.
- Synthetic note 61: the filter keeps every matching row and drops none of them.
- Synthetic note 62: the filter keeps every matching row and drops none of them.
- Synthetic note 63: the filter keeps every matching row and drops none of them.
- Synthetic note 64: the filter keeps every matching row and drops none of them.
- Synthetic note 65: the filter keeps every matching row and drops none of them.
- Synthetic note 66: the filter keeps every matching row and drops none of them.
- Synthetic note 67: the filter keeps every matching row and drops none of them.
- Synthetic note 68: the filter keeps every matching row and drops none of them.
- Synthetic note 69: the filter keeps every matching row and drops none of them.
- Synthetic note 70: the filter keeps every matching row and drops none of them.
- Synthetic note 71: the filter keeps every matching row and drops none of them.
- Synthetic note 72: the filter keeps every matching row and drops none of them.
- Synthetic note 73: the filter keeps every matching row and drops none of them.
- Synthetic note 74: the filter keeps every matching row and drops none of them.
- Synthetic note 75: the filter keeps every matching row and drops none of them.
- Synthetic note 76: the filter keeps every matching row and drops none of them.
- Synthetic note 77: the filter keeps every matching row and drops none of them.
- Synthetic note 78: the filter keeps every matching row and drops none of them.
- Synthetic note 79: the filter keeps every matching row and drops none of them.
- Synthetic note 80: the filter keeps every matching row and drops none of them.
- Synthetic note 81: the filter keeps every matching row and drops none of them.
- Synthetic note 82: the filter keeps every matching row and drops none of them.
- Synthetic note 83: the filter keeps every matching row and drops none of them.
- Synthetic note 84: the filter keeps every matching row and drops none of them.
- Synthetic note 85: the filter keeps every matching row and drops none of them.
- Synthetic note 86: the filter keeps every matching row and drops none of them.
- Synthetic note 87: the filter keeps every matching row and drops none of them.
- Synthetic note 88: the filter keeps every matching row and drops none of them.
- Synthetic note 89: the filter keeps every matching row and drops none of them.
- Synthetic note 90: the filter keeps every matching row and drops none of them.
- Synthetic note 91: the filter keeps every matching row and drops none of them.
- Synthetic note 92: the filter keeps every matching row and drops none of them.
- Synthetic note 93: the filter keeps every matching row and drops none of them.
- Synthetic note 94: the filter keeps every matching row and drops none of them.
- Synthetic note 95: the filter keeps every matching row and drops none of them.
- Synthetic note 96: the filter keeps every matching row and drops none of them.
- Synthetic note 97: the filter keeps every matching row and drops none of them.
- Synthetic note 98: the filter keeps every matching row and drops none of them.
- Synthetic note 99: the filter keeps every matching row and drops none of them.
- Synthetic note 100: the filter keeps every matching row and drops none of them.
- Synthetic note 101: the filter keeps every matching row and drops none of them.
- Synthetic note 102: the filter keeps every matching row and drops none of them.
- Synthetic note 103: the filter keeps every matching row and drops none of them.
- Synthetic note 104: the filter keeps every matching row and drops none of them.
- Synthetic note 105: the filter keeps every matching row and drops none of them.
- Synthetic note 106: the filter keeps every matching row and drops none of them.
- Synthetic note 107: the filter keeps every matching row and drops none of them.
- Synthetic note 108: the filter keeps every matching row and drops none of them.
- Synthetic note 109: the filter keeps every matching row and drops none of them.
