---
id: MIG-3
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "lint and check-types run in a sandboxed agent session without reading env files, so verify needs the operator's unsandboxed yes only for build"
slice_type: "build config; risks a stale Turbo cache for a task whose output depends on env"
non_negotiables:
  - "web#build keeps every apps/web/.env* file in its hash: an edited env file still misses build's cache."
  - "The fix lives in Turbo's config, never in a sandbox read allow for env files (.claude/settings.json is untouched)."
  - "No env file is read or printed by this thread or by any proof it leaves behind."
devs_call: "Where web#build's inputs are declared (a package configuration or a root package#task entry) and how the dry-run check is written."
cites:
  - "MIG-migration rulings 51"
  - "EN-15"
truth_files: "none: build configuration; the app's behaviour does not change" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers:
  - mason
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "turbo.json"
  - "apps/web/turbo.json"
  - "scripts/check-turbo-env.mjs"
  - "package.json"
  - ".claude/rules/turbo.md"
  - "docs/developer-guides/environments.md"
  - "docs/decisions/changelog.md"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Changing what build reads"
  - "Running build inside the sandbox on a machine that holds apps/web/.env.local: web#build hashes that file on purpose"
criteria:
  - id: C1
    statement: "yarn lint runs to green from a sandboxed agent session while .env.local and .env files are present in the checkout"
    evidence: check
    command: "yarn lint"
  - id: C2
    statement: "yarn check-types runs to green from the same sandboxed session"
    evidence: check
    command: "yarn check-types"
  - id: C3
    statement: "A dry run of lint and check-types names no env file among Turbo's global inputs or any task's inputs"
    evidence: check
    command: "yarn check-turbo-env"
  - id: C4
    statement: "A dry run of build lists every apps/web/.env* file that exists under web#build's inputs and under no other task's, and apps/web/turbo.json declares .env* as a build input"
    evidence: check
    command: "yarn check-turbo-env --build"
---

# Contract — MIG-3 turbo-env-hashing

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** a day-one gap (layer 2; rulings 51).
- **What did not cross:** turbo.json names **/.env.*local and *_/.env in globalDependencies (and .env_ in build's inputs), so every Turbo task hashes the env files before it runs, and a sandboxed session fails at the hash under the floor's env-file read deny. Today every yarn verify and verify:fast runs unsandboxed with Taylor's yes.
- **Plan:** As the toolkit did for its own tree (changelog EN-15): drop the env files from globalDependencies and name them only in the inputs of the task that reads them (web#build), then prove yarn lint and yarn check-types run sandboxed with an env file present, and yarn build still misses the cache when an env file changes. Update .claude/rules/turbo.md's last sentence.
- **Conflict risk:** medium (turbo.json is shared by every task). Trigger: any quiet hour.
- **Estimate:** one to two hours. An estimate.
