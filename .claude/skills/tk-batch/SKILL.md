---
name: tk-batch
description: "Build or harden one named ticket to done at its QA level. Use whenever the operator names a ticket to build, harden or finish, as in 'build STK-5' or 'harden STK-6'."
argument-hint: <id>
---

Take the named ticket through the pass the operator asked for; the work is yours until it is finished. `docs/workflows/stages/build.md` and `harden.md` beside it are the full protocol.

## One ticket per thread

Never a batch: named several, take the first and list the rest under `Not done`. The operator says one of two things:

- **"build <id>"**: the build pass. Code and its own proof, ending on five lines and the links.
- **"harden <id>"**: the hardening pass, after the operator has walked the build. Every proof and review the level asks for, once.

"fix" in a build thread: change it, end on five lines again.

## Yours, and the operator's

**Yours.** Every command. A command the sandbox blocks is run again unsandboxed. Every reversible choice: decide, note it as `[ASSUMPTION]`, go on. A follow-up you discover is drafted as its own ticket (`yarn contract:init <EPIC | app> <slug> --from <draft> --draft`) and named in the report.

**The operator's, only these.** A choice that cannot be undone; spending money; scope that outgrows the ticket; a file agents cannot write (`.claude/settings.json`); a credential or an account; the merge. Ask everything in one message, each with a recommendation, and keep building whatever does not wait on the answer. If the prompt or contract names an involvement other than autonomous, also stop where it says.

**Not yours.** Another ticket's proofs, reviews or files. A stale proof on someone else's ticket is theirs; name it in the report if it blocks you.

## Where the work goes

The branch that is checked out. Only when the operator or the prompt says "on its own branch": `git worktree add .claude/worktrees/<name> -b agent/<name>` from the current branch, `yarn install` there, do everything there, and report `Branch: agent/<name>, ready for a pull request.` On "merge it back", merge it into the main checkout's branch and remove the folder and the branch.

## Both passes

`yarn status` once at the start and once at the close; never `check-specs` mid-ticket. One commit per outcome, `<id>: <outcome>`, staging only this ticket's paths; never `git add -A`. Give up on one failure only after three different fixes, and say what you tried. Close a thread past 200k tokens after a break instead of resuming it.

## Build

1. **Start.** `yarn contract:init <EPIC | app> <slug>`, unless it has started. Read the contract: its Build notes, its model, QA level, reviewers and `focus` lines, and the one file it cites.
2. **Build**, updating the living UX file when behaviour changes.
3. **Prove in scope.** The ticket's own tests, then the affected workspace's suite and `check-types` at the close. Never `yarn verify` or the whole `yarn test`.
4. **No review** (`qa-levels.md`, the phase table). Warden only the first time a door path in `technical.md` is built.
5. **No** ledger, captures, as-built or headless review.

End on five lines: built, assumed, to look at, dev-server links per surface and `?state=`, left for hardening.

## Harden

1. **Prove once.** `yarn contract:run <id>`, and `yarn contract:record <id> <criterion> --evidence <path>` for capture and manual criteria; take the captures once. A check that truly needs a person is recorded `--verdict deferred` with the steps to take. To change the level when the operator asks: `yarn contract:qa <id> <Q0 | Q1 | Q2 | Q3> [--reviewers <role,role>]`.
2. **Write down what the level asks for.** An as-built at Q2 and Q3, or at Q1 when something deviated.
3. **Review once per seat.** Q2: one subagent given the contract, the changed files and the reviewer's role, never your summary; one run per ticket, a FAIL included. Q3: `yarn review:run <role> <id>` per confirmed seat, unsandboxed, one at a time; Warden and Mason only on door paths `technical.md` names. Fix black, red and cheap orange findings, then `yarn contract:run` once; draft the rest as follow-ups. A PASS is final; at Q3 a FAIL earns one re-review; any further run needs the operator's word (`--operator "<reason>"`, recorded as a `focus` line): ask for it in the report, never run it.
4. **Close the epic** when this is its last hardening thread, or a one-off: `yarn verify` once, `yarn check-specs --strict`, `yarn truth:promote <EPIC>` when it has `ux/` proposals, and commit. Another thread's failing file is named, left alone.

Never push or merge, and never edit `results.json` or a review file by hand.

## The closing report, after hardening

Six lines at most, in this shape, and nothing else:

```
Done: <ids>.
Not done: <id>: <one line why>.
Needs you:
1. <a decision with a recommendation, or an action only a person can take>
To look at when you like: <operator checks handed over, drafted follow-ups>
What went wrong: <two lines at most>
Cost: <calls> calls, <weighted> weighted, <context at last call> context, <cache-read> read, <output> out
```

Leave out any line that is empty. Never put a command for the operator to run in it. When everything is done and nothing waits: `Done: <ids>. Nothing needs you.` The `Cost` line is read from the ticket's `cost` block, which `yarn cost <id> --record` (unsandboxed) writes into `results.json` at close; one line per ticket when there are several. When the transcripts cannot be read, leave the line out rather than estimate.
