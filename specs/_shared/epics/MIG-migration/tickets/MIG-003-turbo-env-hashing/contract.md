---
id: MIG-3
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "lint and check-types run in a sandboxed agent session without reading env files, so verify needs the operator's unsandboxed yes only for build"
slice_type: "build config; risks a stale Turbo cache for a task whose output depends on env"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
  - "[FILL: decision and criterion IDs from it, as D-OB2-1 or OB2-W3]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [mason] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "turbo.json"
  - ".claude/rules/turbo.md"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Changing what build reads"
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

# Contract — MIG-3 turbo-env-hashing

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** a day-one gap (layer 2; rulings 51).
- **What did not cross:** turbo.json names **/.env.*local and *_/.env in globalDependencies (and .env_ in build's inputs), so every Turbo task hashes the env files before it runs, and a sandboxed session fails at the hash under the floor's env-file read deny. Today every yarn verify and verify:fast runs unsandboxed with Taylor's yes.
- **Plan:** As the toolkit did for its own tree (changelog EN-15): drop the env files from globalDependencies and name them only in the inputs of the task that reads them (web#build), then prove yarn lint and yarn check-types run sandboxed with an env file present, and yarn build still misses the cache when an env file changes. Update .claude/rules/turbo.md's last sentence.
- **Conflict risk:** medium (turbo.json is shared by every task). Trigger: any quiet hour.
- **Estimate:** one to two hours. An estimate.
