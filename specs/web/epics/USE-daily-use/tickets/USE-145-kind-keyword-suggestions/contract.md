---
id: USE-145
size: small
objective: "Suggested in the icon picker never comes up empty for a named block: when the name matches nothing, the block's kind's words are matched instead, on the device"
slice_type: "a pure matching rule in @syn/utils wired to the picker step; risks a model call or a network request sneaking in"
non_negotiables:
  - "A small kind→keywords map in @syn/utils beside icon-suggest.ts; no request, no model call (record 0001, D-USE-35)."
  - "The name's own matches always come first; the kind is a fallback only when they are empty."
devs_call: "The words per kind."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/icon-picker/index.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/icon-picker/states/emoji-suggested.md"
  - "C-USE-icon-picker-2"
truth_files: "none: the epic's own ux/ ledger is amended in the same commit (interactions/icon-picker/index.md); it promotes to specs/web/ux/ with USE"
waiver: "One control or rule seen from two ledger files of the same surface family; one change owns both."
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/utils/src/planner/icon-suggest.ts"
  - "packages/utils/src/planner/icon-suggest.test.ts"
  - "packages/utils/src/planner/kind-keywords.ts"
  - "packages/utils/src/planner/index.ts"
  - "packages/utils/src/index.ts"
  - "apps/web/components/planner/icon-picker-step.tsx"
  - "apps/web/components/planner/new-block-sheet/new-block-sheet.tsx"
  - "specs/web/epics/USE-daily-use/ux/interactions/icon-picker/index.md"
depends_on: []
out_of_scope:
  - "Item suggestions in a new block (prompt 2)"
criteria:
  - id: C1
    statement: "suggestIconsFor(\"Zzz\", \"wellness\", entries) returns the wellness words' matches; a matching name's own come first"
    evidence: test
    command: "yarn workspace @syn/utils test"
---

# Contract — USE-145 kind-keyword-suggestions

## Build notes

Fix 4 of Taylor's review of 2026-10-19.

- **Approach:** `KIND_KEYWORDS: Record<NewBlockKind | "transition", string>` in `kind-keywords.ts`; `suggestIconsFor(name, kind, entries, limit)` runs `suggestIcons` on the name, then on the kind's words when empty. IconPickerStep takes an optional `kind`; the New block sheet passes its form's kind.
- **Model:** any.
