# PEM in Synapse

Synapse works the practice's way. The practice is Product Engineering Mastery (PEM), `git@github.com:tayloraucoin/product-engineering-mastery.git`, adopted at toolkit commit `62d344b` as an **overlay**, in place: Synapse's history, its own rules and its own conventions are kept, and what the practice replaced is archived in [`../decisions/imported/`](../decisions/imported/README.md). The rulings, the lines carried and not carried, and where each record went are in [record 0001](../decisions/records/0001-adopt-the-practice.md).

## What came from PEM

- The spine's shape: `AGENTS.md` as the contract, `CLAUDE.md` as a shim, [`../index.md`](../index.md) as the map and the precedence ladder.
- The work loop: the prompt builder, tracks, stages and QA levels ([`../workflows/`](../workflows/)), the roles ([`../roles/`](../roles/)) and the subagents generated from them.
- The practice's design, engineering, measurement and runbook docs ([`../design/`](../design/), [`../engineering/`](../engineering/), [`../measurement/`](../measurement/), [`../runbooks/`](../runbooks/)), and the decision ledger and records format ([`../decisions/`](../decisions/)).
- The tooling under `tooling/` (contracts, status, budget, the checks in `yarn verify`), the hooks and the path rules in `.claude/`.
- `toolkit.json`, which tells that tooling where Synapse's apps, specs and migrations live.
- The docs app, `apps/docs` (`yarn docs:dev`, port 3001), which renders `docs/` and `specs/` for reading. It came after the migration; see the first adaptation below.

## Adaptations

[`adaptations/`](adaptations/) logs each change Synapse made to something that came from PEM, one dated file per change, so a PEM sync can read what to carry back (into the toolkit or its migrate runbook) and what to leave as Synapse's own.

| Date       | Adaptation                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------ |
| 2026-10-09 | [The docs app, brought in after the migration](adaptations/2026-10-09-docs-app-in-migration.md) |
