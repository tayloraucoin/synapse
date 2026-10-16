---
size: medium
objective: "yarn check-specs knows the Paper ledger's file kinds and the narrative kind again, so the USE ledger and the toolkit's own fixtures pass and the Tickets gate can be green"
slice_type: "tooling that restores two approved practice amendments whose edits to tracked files were lost uncommitted; risks a check that passes the ledger by skipping it rather than checking it"
non_negotiables:
  - "The rules are the adaptation entries' rules, as written in docs/pem/adaptations/2026-10-09-narrative-ux-spec.md and 2026-10-12-paper-ux-ledger.md; nothing is invented or loosened."
  - "Every fixture under tooling/fixtures/specs/ behaves as its name says: pass-* passes, fail-* fails with the message its test expects."
  - "A kind is worked out from the path; no file is exempted by name."
  - "No USE ux/ file is edited to satisfy the check, except a split the check itself asks for."
devs_call: "How uxKind is written; the exact wording of each new message, where the fixtures do not already fix it; whether the stage and glossary prose is restored here or listed for MIG-24."
cites:
  - "docs/pem/adaptations/2026-10-12-paper-ux-ledger.md"
  - "docs/pem/adaptations/2026-10-09-narrative-ux-spec.md"
waiver: "the two amendments are one change set to one function (checkUx); each adaptation is the spec for its half"
truth_files: "none: practice tooling; no app behaviour changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "tooling/check-specs.ts"
  - "tooling/lib/specs.ts"
  - "tooling/budget.ts"
  - "tooling/fixtures/specs/"
  - "docs/pem/adaptations/"
  - "docs/design/templates/"
  - "docs/product/operator-notes.template.md"
  - "docs/decisions/changelog.md"
depends_on: []
out_of_scope:
  - "The prose in docs/workflows/stages/ux.md, design.md, tracks/ and glossary.md: MIG-24, unless the builder restores it here"
  - "docs/decisions/imported/ux/: the old UX imports found untracked; Taylor files or drops them"
criteria:
  - id: C1
    statement: "check-specs' fixture run reports every pass-* fixture passing and every fail-* fixture failing with its expected message, the seven ledger fixtures and three narrative fixtures included"
    evidence: test
    command: "yarn check-specs"
  - id: C2
    statement: "check-specs reports no A8 or A10 problem under specs/web/epics/USE-daily-use/ux/boards/ or ux/narrative/: a coverage index carries page: and no target:, a narrative carries no target: and is capped at 4,000"
    evidence: check
    command: "yarn check-specs"
  - id: C3
    statement: "A coverage-index row marked specced whose carrier does not list the artboard is refused, and so is an artboard claimed by two carriers"
    evidence: test
    command: "yarn test:tooling"
  - id: C4
    statement: "The tooling type-checks"
    evidence: check
    command: "yarn check-types:tooling"
id: MIG-23
---

# Contract — ledger-checks

## Build notes

Found by the USE captain on 2026-10-16. The narrative amendment (2026-10-09) and the Paper ledger amendment (2026-10-12, Taylor approved its defaults that day) each changed tracked files and added new ones. Only the new files survive, untracked in the shared tree: the adaptation entries, the four ledger templates, the narrative and operator-notes templates, and ten fixtures. Every edit to a tracked file is gone (no commit, stash or branch holds `isBoardsIndex` or `isNarrative`). The likeliest cause is USE-45's `checkout -- .` on 2026-10-15. The USE ledger was written to the amended rules, so at HEAD `yarn check-specs` reports 96 problems, all A8 or A10 under `ux/boards/` and `ux/narrative/`.

- **Approach:** rebuild the lost code from the two entries' Files sections, and test it against the surviving fixtures, which pin the messages.
  - `tooling/lib/specs.ts`: `SPEC_FILE_CAPS` gains `narrative` (4,000), `surface-index`, `state`, `interaction`, `dev-note` (2,000 each) and `boards` (4,000); add `isNarrative`, `isBoardsIndex`, `uxKind(path)`, `BOARD_STATUSES`, `readBoardRows`.
  - `tooling/check-specs.ts`: `checkUx` takes the kind from `uxKind`, says how to split each kind, and leaves narrative and boards out of the proposal rules (no `target:`, no `promoted:`). `checkLedger` is new and checks coverage both ways:
    - every `specced` or `dev note` row names a carrier that lists the artboard;
    - every artboard a carrier lists is in an index, and only one file claims it;
    - `not picked` rows cite a D-line;
    - `superseded` rows name a ruling and the replacement's carrier;
    - `specced` names follow `<surface> / <state> / <width> / <scheme>`;
    - a coverage index carries `page:` and no `target:`;
    - a flat `<surface>.md` and a surface directory never coexist.
  - `tooling/budget.ts`: the critic row's "cited surface" leaves out the narrative and coverage indexes.
- **Messages the fixtures expect:** "a narrative carries no target:", "over the 4000 cap for a narrative file", "a coverage index carries no target:", "which no coverage index", "which does not list it under boards:", "cites no D-line", "is superseded; name the ruling", "lists the artboards it carries in boards:". `pass-narrative-in-ux` holds a narrative of about 2,840 tokens and must pass.
- **Commit the survivors with it:** the adaptation entries, templates and fixtures above, plus a `docs/decisions/changelog.md` line. Leave `docs/decisions/imported/ux/` alone.
- **Gotchas:** the 2026-10-12 entry says `truth:promote` already skips files with no target; check that before changing it. A `test:tooling` test for C3 can build its tree from the `pass-ledger-desk-and-phone` fixture.
- **Model:** Opus 5.5 at medium. A smaller model exempts `ux/boards/` by path and calls it done.
