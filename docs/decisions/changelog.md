---
title: Changelog — amendments to the practice in Synapse
description: Read before changing a practice file in this repo, to see what changed, when and why.
layer: decisions
status: adopted
date: 2026-10-09
last_reviewed: 2026-10-09
supersedes:
load_when:
---

# Changelog

## 2026-10-09 — SYN: Vitest is the workspace test runner (MIG-5)

Layer 2 left one smoke test on `node:test` and a Turbo `test` task no workspace had a script for. The ruling, judgment rather than a measurement: Vitest **5.0.3**, pinned exactly in each workspace that has tests, because workspace source imports extensionless relative paths and `@syn/*` TypeScript entry points that `node:test` cannot load without a loader, and the React workspaces will need a DOM environment that Vitest hosts and `node:test` does not. `node:test` stays where code runs on bare Node: the root `tests/`, `tooling/` and `scripts/`. `yarn test` is now `turbo run test && yarn test:root`; `test:root` runs `tests/*.test.ts`, the smoke test among them. `@syn/utils` is the first workspace (`vitest run`, string and number helpers); no other workspace takes a test script until it has a test, because Vitest exits 1 on zero test files and that is the guard. `tests/test-runner.test.ts` proves the wiring: the root script goes through Turbo, every workspace script is `vitest run` without `passWithNoTests`, and an empty suite fails. Coverage thresholds are MIG-14, after a measurement. Ledger: MIG-5.

## 2026-10-09 — SYN: Turbo stops hashing env files globally (MIG-3)

`turbo.json` named `**/.env.*local` and `**/.env` in `globalDependencies`, and the root `build` task listed `.env*` for every package. Turbo reads every file it hashes and the sandbox denies env-file reads, so `yarn lint`, `yarn check-types` and `yarn verify` failed in a sandboxed session (`I/O error while hashing apps/web/.env.local: Operation not permitted`) and ran unsandboxed with Taylor's yes (rulings 51). As the toolkit did for its own tree (EN-15): the two globs are gone, the root `build` inputs are `$TURBO_DEFAULT$`, and `apps/web/turbo.json` (`extends: ["//"]`, `inputs: ["$TURBO_EXTENDS$", ".env*"]`) keeps env files in `web#build`'s hash alone, because Next loads `apps/web/.env*` inside that task and the bundle embeds the `NEXT_PUBLIC_*` values. No other task reads an env file: `lint` and `check-types` run `eslint` and `tsc` (`next typegen` loads env but emits nothing from it), the smoke test runs outside Turbo, `packages/db/.env` feeds only the uncached `db:*` tasks, and the root `.env.local` is loaded by nothing. A package configuration extends the root rather than replacing it, so `^build` ordering is kept; a root `web#build` entry would overwrite the whole task. `yarn check-turbo-env` (`scripts/check-turbo-env.mjs`, names only, never contents) dry-runs lint and check-types and fails if any task but `web#build` or the global inputs hash an env file; `--build` adds that every `apps/web/.env*` present is in `web#build`'s inputs. A second sandbox stop surfaced once the hash no longer failed first: strict env mode hid `TMPDIR` from every task, so Yarn fell back to `/tmp` (`EPERM: mkdir /tmp/xfs-*`); `globalPassThroughEnv: ["TMPDIR"]`, as the toolkit's `turbo.json`, and a pass-through variable never enters a hash. `.claude/rules/turbo.md` and `environments.md` §6 say so; `verify` still runs unsandboxed where `apps/web/.env.local` exists, for the build step only.

## 2026-10-09 — SYN: Synapse adopts the practice (migrate, near path)

- Layer 1 and layer 2 on `feature/pem-migration` from `main` at `f2bfeb1`, toolkit `62d344b`: `toolkit.json`, the copied practice and tooling, the derived spine, rules and settings, `yarn verify` in CI, the old specs and roles archived in `decisions/imported/`, MIG-1 to MIG-11 drafted. Record 0001; rulings in `specs/_shared/epics/MIG-migration/rulings.md`.
