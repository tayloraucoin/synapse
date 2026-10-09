---
id: MIG-1
size: medium # sized medium because contract:init refuses large; the operator cut this as one ticket in nine threads, not split. small: under half a day, the default; medium: half a day to two days; large: split it
objective: "The product's UX source in docs/ux/ becomes living truth in specs/web/ux/, read by every UI ticket, and docs/ux/ is archived"
slice_type: "product spec, from documents and code; risks a spec that disagrees with shipped behaviour"
non_negotiables:
  - "No code change, not even a comment; code comments that cite docs/ux paths are listed in the as-built, not edited."
  - "Nothing under docs/ux/ is edited or deleted; it moves by one git mv, after every area is approved."
  - "Where the code and docs/ux disagree, the file says what the code does and the area overview lists the item as [NEEDS DECISION] with the spec's text beside it; never resolved silently, never edited into docs/ux."
  - "Every state row is seen in the running app at 390, 834 and 1440, light and dark, or marked [inferred from source: <file>]; no state table shorter than the base six."
  - "Tokens, type, colour, motion and component contracts are not restated in specs/web/ux/; they are MIG-9's."
  - "The product non-negotiables (apps/web/docs/product-rules.md) bind every state row; A-01 to A-20 never appear in one."
  - "Each area passes only on the operator's word; rulings become D-WEB-n lines in that area's overview."
devs_call: "How an area's surfaces split across files (trivial siblings share one), each surface file's name, the order within an area, and which docs/ux sections and DEVIATIONS entries each file cites."
cites:
  - "MIG-migration rulings 41"
  - "the detail test, stages ux.md §6"
truth_files: "none: this ticket creates specs/web/ux/ whole from docs/ux and the code rather than editing a living file; the paths are in planned_paths" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q2 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers:
  - vigil
focus:
  - "first-run and settings/your-day: every state row checked against the code (vigil)"
  - "_global shell and system states: every state row checked against the code (vigil)"
operator_review: true # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "specs/web/ux/**"
  - "docs/ux/"
  - "docs/decisions/imported/ux/"
  - "docs/decisions/imported/README.md"
  - "docs/index.md"
  - "docs/README.md"
  - "README.md"
  - "packages/ui/AGENTS.md"
  - "docs/ai-guides/README.md"
  - "docs/architecture/codebase-conventions.md"
  - "docs/architecture/directory-map.md"
  - ".claude/rules/ui.md"
  - "apps/web/docs/product-rules.md"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "The design layer files (MIG-9)"
  - "Any code change"
  - "Any edit to a docs/ux body"
criteria:
  - id: C1
    statement: "check-specs passes with every specs/web/ux/ file under its cap (overview 1,500 tokens, surface 2,000)"
    evidence: check
    command: "yarn check-specs"
  - id: C2
    statement: "Every path built in apps/web/lib/routes.ts maps to one surface file under specs/web/ux/, and the as-built's inventory table says which"
    evidence: manual
    reason: "No script maps routes to surface files, and writing one is a code change this ticket excludes; the inventory is checked by hand against routes.ts at the close"
  - id: C3
    statement: "After the git mv and the pointer edits, no markdown link that resolved at 72320e0 is broken (yarn docs:check-links reported 117 broken there, all pre-existing)"
    evidence: manual
    reason: "yarn docs:check-links exits non-zero on the 117 pre-existing breaks, so the proof is its output before and after, compared by hand; the checker's own fate is MIG-2"
  - id: C4
    statement: "The operator approved each of the eight areas at its gate, and each approval is dated in that area's overview"
    evidence: manual
    reason: "An approval is the operator's word in the thread; eight gates, one per area, recorded as the overview's status and promoted date"
  - id: C5
    statement: Taylor has looked this ticket over and approved it.
    evidence: manual
    reason: "operator_review: true; the builder defers it with what to look at"
---

# Contract — MIG-1 promote-ux-spec

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria were written when the ticket started, 2026-10-09.

- **Layer:** 3, part 9 (living truth); a day-one gap (rulings 41: docs/ux stays until promoted).
- **What did not cross:** docs/ux/ (14 files: ux-spec-v1, v1.1, v1.2, v1.3, workflow-ux-spec-v0.1, three epic architecture documents, the navigation document, two component handoffs, branding-guide.md, landing-page-ux.md, README.md) stayed in place: it is cited by the precedence ladder (docs/index.md rung 1) and packages/ui/AGENTS.md:14, and it is today's product truth. specs/web/ux/ holds only .gitkeep.
- **Plan:** nine threads. Thread 1 opens the ticket and proposes the inventory (area, surface file, route or trigger, the docs/ux sections drawn on, the DEVIATIONS entries that amend them) and stops for the operator. One thread per area, in build order: _global, auth, first-run, day, review, settings, workflow, landing. Each reads the route, its components and the tRPC procedures it calls, walks the surface in the running app against the local seeded database, and fills `docs/design/templates/ux-overview.template.md` (one per area) and `ux-surface.template.md` (one per surface; B1 to B17 are seventeen files) in full: Job, Layout and components (`@syn/ui` names only), every state, Words, Access, Instrumentation (what the code fires today, or "none today"), Criteria as C-WEB-<surface>-n; decisions as D-WEB-n in the overview; the Artboard column is "—". Where code and docs/ux disagree, the code's behaviour is written and the overview's Open section lists the item as [NEEDS DECISION] with the code's behaviour as the default. `_global` carries behaviour rules only: overview, navigation, shell, system-states (error, not-found, offline, PWA install and update, session expiry), time-and-day, record-integrity, offline-and-sync, copy-register. Each area thread ends at its gate, commits its own files, and prints the next prompt. The closing thread: Vigil reviews in a subagent (the two focus lines in full, a sample elsewhere, against the running code); black and red fixed, orange when cheap; then, in plan mode, `git mv docs/ux docs/decisions/imported/ux` and the pointer edits (docs/index.md rung 1 to specs/web/ux/; docs/README.md ux table; README.md lines 16 and 17; packages/ui/AGENTS.md line 14; docs/ai-guides/README.md lines 18 and 21; docs/architecture/codebase-conventions.md line 8; .claude/rules/ui.md line 14; apps/web/docs/product-rules.md lines 12 and 17; the docs/ux row in docs/decisions/imported/README.md moves from kept to archived); `yarn docs:check-links`, `yarn directory-map`, `yarn check-specs`, `yarn verify` once; the as-built gathers every [NEEDS DECISION] from the eight overviews into one table and lists the code comments that still cite docs/ux paths.
- **Conflict risk:** low in code (specs and docs only). Trigger: Taylor opens the promotion thread; the first UI ticket under the practice waits for it.
- **Estimate:** one to three days, by the spec's size (about 9,000 lines today). An estimate.
- **Inventory approved 2026-10-09** (thread 1), with six rulings: (1) a truth file's frontmatter is `source:` (the docs/ux files and the code commit), `status: approved`, `promoted: <approval date>`, no `target:`; (2) handler and redirect routes (`/logout`, `/auth/callback`, `/auth/confirm`, `/api/assets/*`, `/`, `/workflow`, `/day/{date}/item/{id}`) are a row in the owning overview's routes table, and C2 reads "a surface file or a routes row"; (3) the legal pages are one file in the landing area; (4) the builder is eighteen files, B15a and B15b separate; (5) settings/your-day is one file per embedded screen, citing the first-run file it embeds; (6) size stays `medium`, the estimate stands. The eight area rows of the inventory travel in each area thread's prompt; the closing thread rebuilds the whole table from the overviews.
