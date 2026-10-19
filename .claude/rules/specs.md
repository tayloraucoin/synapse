---
paths:
  - "specs/**"
---

# Specs: tickets, contracts, proofs

- A ticket folder is `specs/<app>/one-offs/<APP-n>-<slug>/` or `specs/<app>/epics/<EPIC>-<slug>/tickets/<EPIC-n>-<slug>/`, created by `yarn contract:init`, never by hand. New folders pad the number to three digits (`STK-026-slug`, id `STK-26`); older folders keep their names. Also under `specs/<app>/`: `explorations/<slug>/`, `audits/` and `reports/`, written by their tracks (`docs/workflows/tracks/`).
- `contract.md` frontmatter follows `docs/engineering/schemas/contract.schema.json`: criteria each with an evidence type (`test` | `check` | `capture` | `manual`) and a yarn script, path or reason; one cited surface (more needs `waiver:`); `truth_files` or `none: <reason>`; `qa`, `reviewers` and `focus` as the operator confirmed them (`docs/workflows/qa-levels.md`). The level is never computed; change it with `yarn contract:qa <id> <level> [--reviewers <role,role>]`. The body's Build notes say what to build. At most 2,500 tokens. `yarn verify` is never a criterion: it runs once at batch close.
- **Proof.** `yarn contract:run <id>` runs each distinct command once and notes pass or fail in `results.json`; `yarn contract:record` records a capture or manual check. Only tooling writes `results.json`: never edit it. A check only a person can make is recorded `--verdict deferred` and listed under Operator checks in `specs/_status.md`.
- **Below Q3, `results.json` is a status note:** nothing in it goes stale, and a review happens in the thread with no criterion and no file. **At Q3 it is the ledger:** each reviewer is a `review:<role>` criterion recorded by `yarn review:run <role> <id>`, its review file is kept, and `yarn check-specs --strict` checks the proofs for staleness once, before a merge.
- **A ticket's proofs are its own.** Never re-prove or re-review another ticket. A commit to a shared file reopens nothing.
- Built: `yarn contract:built <id>`. Close: `yarn cost <id> --record`, unsandboxed.
- `as-built.md` (the template's four sections) is written at Q2 and Q3, or when something deviated.
- Not committed: prompt files, `contract:run` logs (git ignores them), review files below Q3.
- **Archive.** `yarn specs:archive [--dry-run]` moves closed one-offs, and epics with every ticket closed, to `specs/<app>/_archive/<YYYY>/<MM>/` by close month. It holds anything not closed, uncommitted, or with an unpromoted approved proposal. Records are never rewritten, and every tool reads the archive, so no id or prefix is reused. Only the operator runs it; never move a folder by hand.
- `specs/<app>/ux/` is the living truth; an epic's own `ux/` holds proposals that mirror those paths, with `target:`, `status:` and `promoted:` in their frontmatter.
