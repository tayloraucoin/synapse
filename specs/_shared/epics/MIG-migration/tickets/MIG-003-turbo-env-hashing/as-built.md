# As-built — MIG-3

## Shipped against the contract

- C1: `yarn lint` ran to green from the sandboxed session with `.env.local` (root and `apps/web`) and `packages/db/.env` present; before the change the same command failed at the hash (`I/O error while hashing apps/web/.env.local: Operation not permitted`).
- C2: `yarn check-types` ran to green from the same session.
- C3: `yarn check-turbo-env` (new, `scripts/check-turbo-env.mjs`): a dry run of lint and check-types hashes no env file globally or in any task.
- C4: `yarn check-turbo-env --build`, run unsandboxed: `apps/web/.env.local` is in `web#build`'s inputs and in no other task's; `apps/web/turbo.json` declares `["$TURBO_EXTENDS$", ".env*"]`.

## Deviations

- Planned paths grew from two to seven: the criteria need a yarn script (`scripts/check-turbo-env.mjs`, `package.json`), `web#build`'s inputs live in a package configuration (`apps/web/turbo.json`, as the toolkit's EN-15), and two docs argued the other way (`docs/developer-guides/environments.md` §6 told readers never to remove the globs; `docs/decisions/changelog.md` records the ruling). [ASSUMPTION] A package configuration, not a root `web#build` entry: the root form overwrites the whole task and loses `dependsOn` and `outputs` unless repeated.
- `globalPassThroughEnv: ["TMPDIR"]` added to `turbo.json`, beyond the plan: with the hash fixed, lint and check-types still failed in the sandbox because strict env mode hid `TMPDIR` and Yarn fell back to `/tmp`. The toolkit's `turbo.json` has the same line.
- [ASSUMPTION] The check is a criterion, not a `verify` step: `verify` already runs lint and check-types, which fail in the sandbox if the globs return.
- [ASSUMPTION] `reviewers: [mason]` kept as drafted; at Q1 no review runs (qa-levels), so Mason's seat is the operator's to raise.
- `yarn verify` ran after commit 1 (green), once over commits 2 and 3 together (commit 3 fixed what commit 2 exposed; red on `check-refs` alone, because `tooling/refs-pending.json` still listed `apps/web/turbo.json` as staying in the toolkit, dropped in the docs commit), and after the docs commit.
- [ASSUMPTION] `.gitignore` gained the toolkit's two `specs/**/evidence/` lines: `contract:run` logs showed as untracked here, and the practice never files them.
- The migration is not merged into `main` (`main` is at `f2bfeb1`); the ticket was built on `feature/pem-migration`, where the MIG folders live.

## Not verified

- A build cache miss on an edited `apps/web/.env.local` was proven by Turbo's own contract (the file is in `web#build`'s hashed inputs), not by editing the file: this thread never reads or writes a real env file.
- `yarn build` inside the sandbox on a machine with `apps/web/.env.local`: out of scope by design.

## Next

MIG-4 (check-migrations, Q3) can now run its proofs sandboxed; only `yarn build` and `yarn verify` still need the unsandboxed yes where `apps/web/.env.local` exists. `cost` and the Mason seat wait for the hardening pass.
