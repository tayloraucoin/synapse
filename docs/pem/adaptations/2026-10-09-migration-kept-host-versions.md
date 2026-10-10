# The migration kept the host's version of every derived file

**Date:** 2026-10-09 · **PEM source:** `docs/runbooks/migrate/README.md` and `manifest.json` at `62d344b` (the `derive` entries) · **In Synapse:** `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/README.md`, `docs/index.md`, `.claude/rules/{ts,ui,next}.md`, `.claude/settings.json`, `tooling/tsconfig.json` · **For:** PEM · **Status:** proposed

## What changed

The migrate runbook marks 16 files `derive`: written from the interview's rulings, never copied. On Synapse, every one of them ended up as Synapse's version with PEM's lines fitted in. Its own rules came first: the "locked" conventions doc ranked above PEM's, the old six-rung ladder sat in `docs/index.md`, and `ts.md` said `docs/architecture/` "wins on any conflict". The tracked settings also missed several PEM floor rows. Taylor then ruled PEM the default for every shared file (2026-10-09), and a second pass (audit `specs/_shared/audits/2026-10-09-pem-default.md`, tier A) rewrote the files listed above from PEM's text. That pass kept only these adjustments:

- **The `@syn` scope and Synapse's facts:** the app description, the commands, the design-layer and UX paths, the hosts.
- **The platform split** (the Expo seam).
- **Four named exceptions to PEM's conventions:** services in `@syn/api`; `@syn/ui` imports `@syn/hooks`; the `@syn/ui` barrel; page data through the tRPC caller.
- **The House rules not yet re-homed.**
- **`testing.md`** ("no capture harness yet").
- **`turbo.md`** (MIG-3's env hashing).
- **The operator rows of rulings 22.**

The other derived files keep Synapse's content by design: the ledger, the changelog and `refs-pending.json`. `bash-guard.json` is MIG-13's.

## Files

- `AGENTS.md`: PEM's sections and lines. The role and skill listing was cut to fit the 4,000-token cap (the runbook's cut order). The House rules that PEM or a check already covers were dropped: Yarn (now in the setup line) and `proxy.ts` (`next.md`, `apps/web/AGENTS.md`).
- `CLAUDE.md`: PEM's text, plus the `house-*` rules and the operator's `settings.local.json`.
- `docs/index.md`: PEM's map and seven-rung ladder. The imported decision and deviation logs sit at rung 4, and `docs/ux/` at rung 5 until MIG-1. Layer rows were added for Synapse's own folders. Measurement and runbooks were folded into one line to fit the cap.
- `README.md`, `docs/README.md`: PEM's shape with Synapse's facts. This drops the stale "Foundation complete" status and the chain from before `verify`.
- `.claude/rules/ts.md`, `ui.md`, `next.md`: PEM's text, `@syn`, Synapse's paths. `next.md`'s "never `app/_components/`" is back; three entries break it, and MIG-8 owns moving them.
- `.claude/settings.json`: PEM's deny, ask and allow rows, `allowLocalBinding` and the env-file `denyRead` are added. Synapse's hosts, allows and comments are kept.
- `tooling/tsconfig.json`: extends `@syn/config/tsconfig/base.json`, as PEM's extends `@pem/config`.

## Why

Taylor asked for PEM as the default (2026-10-09), so the handoff from PEM to a host stays clean and a PEM sync can diff like for like. Judgment: the cause is the runbook, not the operator. `derive` gives no starting text, so the agent started from the host's file. Its round 3 then carried every human line verbatim, and its round 4 kept the host's conventions governing the code (Synapse's rulings 42).

## For a PEM sync

Carry back as a runbook change:

- **`derive` starts from PEM's file.** The interview's rulings become named adjustments, and each adjustment carries a reason the app needs it. Record them in a host log like `docs/pem/`, so the next sync can tell PEM's text from the host's.
- **Round 4 should not offer "the host's conventions govern its code" as the default.** The default is PEM's conventions plus named exceptions.
- **The always-on cap leaves almost no room.** PEM's own spine nearly fills 4,000 tokens, so a host's description, commands and House rules force cuts. The runbook should budget a host's share explicitly.
- **The floor fixture missed rows.** The tracked settings from step 5 lacked PEM's own rows (`rm -rf /*`, `dropdb`, bare `git reset --hard`, the `gh pr` and `vercel` asks), because the floor fixture holds fewer rows than PEM's own `settings.json`. The floor should be PEM's full set.
