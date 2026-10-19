---
title: Skills — adoption rulings, load order, and the review procedure
description: Read before installing, updating, editing or triggering any design skill, or when a skill fires on the wrong task; holds what is adopted, mined, rejected or deferred, the load order, and the review checklist.
layer: design
status: ruling
thread: "04"
role: Plumb
date: 2026-09
last_reviewed: 2026-10-01
supersedes:
load_when: ui-build, critique
---

# Skills

Lifted from Plumb's adoption ruling ([`design-skills-adoption.md`](../research/design-tools/design-skills-adoption.md), read 2026-09-30) and the motion adoption note ([`motion-skill.md`](../research/courses/motion-skill.md) §5), with `conflicts.md` CF-18, CF-19, CF-22 and CF-30–33 applied. Provenance for every installed skill is in [`.claude/skills/REGISTRY.md`](../../.claude/skills/REGISTRY.md).

## The ruling

Third-party design skills are untrusted code. Two enter the repo, both only after edits: shadcn's official `shadcn` skill, and Vercel's Web Interface Guidelines as the house skill `tk-ui-code-lint`, copied in and pinned. **Nothing enters as-is.** The rest are mined into `canon.md` or rejected. The reason is structural: every generation skill tells the agent to invent a palette, a typeface and "one real aesthetic risk" per brief, which is off-system by definition for a product with tokens; every review skill fights the critic for the same trigger phrases; and the most popular packs reach the network or run code in ways that can change after review.

| Skill                                  | Verdict                                                           | What happens                                                                                                                                                      |
| -------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shadcn` (shadcn-ui/ui)                | **Adopt after edits** (A1–A6 below)                               | Installed in Phase 3 at `.claude/skills/shadcn/`, keeping its name                                                                                                |
| Vercel Web Interface Guidelines        | **Adopt after edits** (B1–B5 below)                               | Becomes the house skill `tk-ui-code-lint`, with a provenance header                                                                                               |
| `tk-ui-critic`                         | **House**                                                         | Procedure only; the rubric is `canon-rubric.md` (CF-20, record 0009)                                                                                              |
| `tk-ui-diverge`                        | **House**                                                         | Three directions on one named axis; reads `docs/references/README.md` for the layout step (CF-31)                                                                 |
| `tk-motion`                            | **House**, from thread 07                                         | Model-invocable on a narrow trigger, conditional on its trigger test (CF-30); bundle archived at `docs/research/courses/motion-skill-files/`                      |
| Anthropic `frontend-design`            | **Mined, not installed**                                          | Its plan step writes new hex values; its trigger fires on existing-UI work; it reads memory                                                                       |
| `impeccable`                           | **Rejected; bans mined**                                          | Downloaded binary, approval-independent hooks in a gitignored file, reported telemetry, root design-file writes                                                   |
| `taste-skill`                          | **Rejected; four lines mined**                                    | Excludes dashboards and tables in its own first lines; 85 KB; conflicts on icons and tokens                                                                       |
| Claude Design repackages               | **Rejected**                                                      | Adapted from a non-public system prompt; unclear provenance and license                                                                                           |
| Shift Nudge `sn-ui-checklist`          | **Mined into the rubric, not installed**                          | Its triggers would compete with the critic on every verification                                                                                                  |
| GSAP skills                            | **Rejected for product UI**; deferred for marketing sites (CF-32) | CSS plus `motion/react` covers the whole motion catalog                                                                                                           |
| `emil-design-eng`                      | **Not installed**                                                 | Overlaps `tk-motion`; its defaults conflict (200–500ms modals, bounce 0.2). Its `STANDARDS.md` may be vendored read-only as source material after a license check |
| AccessLint                             | **Deferred**                                                      | Until the accessibility auditor reads it in full; its excerpts say it auto-launches Chrome                                                                        |
| Anthropic frontend-aesthetics cookbook | **Reference, not a skill** (CF-33)                                | Extracted by the library batch to `docs/references/practitioners/`                                                                                                |

## Edits required before adoption

**A. `shadcn`**

1. Pin the CLI: add `shadcn` to devDependencies at a fixed version and replace every `npx shadcn@latest` (including the `` !`…` `` load-time injection) with `yarn shadcn …`.
2. Delete "Check community registries too." Add: "Only the @shadcn registry and the sources ruled in `docs/design/component-sources.md`, which holds the review an `add` passes. A third-party item is addressed by a GitHub path pinned to a full commit SHA, never a namespace. Any new primitive requires a justification in the package and a ruling per the product's `components.md`; propose, do not add." (Amended by CS-08, 2026-10-04.)
3. Delete the third-party registry examples, and add "Never run `add --all`, `apply`, or `init --force`."
4. Frontmatter: `allowed-tools: Bash(yarn shadcn info *) Bash(yarn shadcn docs *) Bash(yarn shadcn add * --dry-run) Bash(yarn shadcn add * --diff *)`; `paths` per CF-23 (`apps/*/app/**`, `apps/*/src/**`, `packages/ui/**`, and `packages/catalog/**` per CS-07).
5. Pointer line: "Tokens and component law live in `docs/design/canon.md` and the product's `tokens.md` and `components.md`; they override this skill."
6. Read and copy in the nine reference files (`rules/styling.md`, `forms.md`, `composition.md`, `icons.md`, `chat.md`, `base-vs-radix.md`, `cli.md`, `registry.md`, `customization.md`) before committing. They were not opened in thread 04, so this step is not optional. Delete `chat.md` if no product surface has chat UI.

**B. `tk-ui-code-lint`** (Vercel's guidelines, made ours)

1. `.claude/skills/tk-ui-code-lint/SKILL.md` plus `references/command.md`, copied from vercel-labs/web-interface-guidelines at a fixed commit, with a provenance header (source URL, commit SHA, date read, reviewer).
2. Delete the "Fetch fresh guidelines" section; replace it with "Read references/command.md."
3. Replace "Title Case for headings/buttons (Chicago style)" with "Case per the product `DESIGN.md` voice."
4. House lines: "Destructive actions on records need confirmation or an undo window." Product lines go in the product's copy of the skill as `[FILL]` (thread 04's examples were product-bound and are cut).
5. Frontmatter: `disable-model-invocation: true`, `allowed-tools: Read Grep Glob`, `disallowed-tools: WebFetch Bash`. Remove "audit design" and "review UX" from the description.

## Load order

Layered context first, then skills as needed:

1. `CLAUDE.md` → `AGENTS.md` and `docs/index.md`, which point to `canon.md` §2 for the slop tells (CF-02).
2. The design layer: `canon.md` plus the product's `DESIGN.md`, `tokens.md`, `components.md`, `anti-patterns.md`, `states.md`, loaded by `.claude/rules/ui.md` on UI files.
3. `shadcn`, auto-invoked on component work only. `tk-motion`, auto-invoked on its narrow motion trigger (CF-30).
4. Manual-only skills, on demand: `tk-ui-diverge`, `tk-ui-critic` (forked), `tk-ui-code-lint`.

House skills carry the `tk-` prefix so no personal skill can shadow them (name clashes resolve enterprise over personal over project). Turn off any installed `frontend-design` plugin skill with `skillOverrides` `[ASSUMPTION: skillOverrides applies to plugin-provided skills; confirm with /skills]`.

## Trigger design

| Task                                 | Fires                                                                                        | Invocation                                                                                                                | Description (trigger text)                                                                                                                                                                                                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generate a new screen from a package | No design skill; `CLAUDE.md` plus the package plus the design layer; `shadcn` for components | auto (`shadcn` only)                                                                                                      | shadcn: "Add, compose, or fix components from `@pem/ui` in this repo. Use when editing files that import `@pem/ui` or when a component is needed. Never adds third-party registry items."                                                                                   |
| Diverge into 3 directions            | `tk-ui-diverge`                                                                              | manual: `/tk-ui-diverge <feature> <axis>`                                                                                 | "Build exactly three Storybook stories or routes for `specs/<feature>/package.md` that differ on one named axis (layout strategy by default), using only tokens and `@pem/ui`. Manual only." `disable-model-invocation: true`                                               |
| Converge onto the system             | `shadcn` plus the product `components.md`                                                    | auto                                                                                                                      | as above; `paths` scoped to component and app directories                                                                                                                                                                                                                   |
| Verify a build                       | `tk-ui-critic` (forked), which calls `tk-ui-code-lint`                                       | manual: `/tk-ui-critic <feature>`                                                                                         | "Screenshot 390/834/1440, light and dark, reduced motion and every state in `states.md` with Playwright; score against `docs/design/canon-rubric.md`; max 3 rounds. Never edits code." `context: fork`, `disable-model-invocation: true`, Bash limited to `yarn playwright` |
| Code-level UX and accessibility lint | `tk-ui-code-lint`                                                                            | manual, or called by `tk-ui-critic`                                                                                       | "Check UI source files against the pinned Web Interface Guidelines in references/command.md; output file:line findings."                                                                                                                                                    |
| Motion work                          | `tk-motion`                                                                                  | auto, narrow (CF-30): motion nouns only, `paths` per CF-23, `allowed-tools: Read Grep Glob`, `disallowed-tools: WebFetch` | The thread 07 description, retargeted to the house tokens. **Trigger test:** 10 known tasks, 5 with motion and 5 without. If it fires on more than 1 of the 5 without, flip it to `disable-model-invocation: true` and the critic carries the motion line (C-R12).          |
| Accessibility audit                  | The auditor's gate skill (TBD; AccessLint candidate) plus `tk-ui-code-lint`                  | manual, owned by the accessibility auditor                                                                                | NOT DECIDED: pending the auditor's full read (ledger SK-13)                                                                                                                                                                                                                 |

Skill trigger tests live with each skill at `.claude/skills/<name>/tests/triggers.md`: five prompts that must trigger and five that must not (CF-10). At most 12 model-invocable skills, descriptions of at most 400 characters (index budget).

## Review procedure (every adoption and every update)

- [ ] Clone at a fixed commit, never a branch: `git clone <repo> /tmp/skill-review && git -C /tmp/skill-review checkout <sha>`. Never let `yarn dlx skills add` or an installer write straight into the repo or into `~/.claude`.
- [ ] Inventory the folder: `find . -type f | sort` and `wc -l SKILL.md`. Reject if SKILL.md exceeds 500 lines without a strong reason.
- [ ] Grep for execution and network reach: `grep -rnE 'WebFetch|curl|wget|https?://|npx|yarn dlx|pnpm dlx|bunx|@latest|!\x60|allowed-tools|hooks:|context: fork|\.claude-plugin|settings(\.local)?\.json|OPENAI_API_KEY|env' .`
- [ ] Read SKILL.md and every file it references, in full. List each instruction that touches tools, files outside the task, memory or the network.
- [ ] Read the description as a trigger. Write down the three unrelated tasks it would hijack, then narrow it.
- [ ] Copy remote content into the repo and pin it. Replace every runtime fetch with a local file carrying a provenance header (source URL, commit SHA, date read, reviewer).
- [ ] Set `allowed-tools` to the minimum and add `disallowed-tools: WebFetch` wherever no fetch is needed. `[ASSUMPTION: Cursor does not honour allowed-tools; keep Cursor's own permissions as the real boundary.]`
- [ ] Decide invocation: side effects, or overlap with a house skill, means `disable-model-invocation: true`.
- [ ] After any installer runs, diff `.claude/settings.json`, `.claude/settings.local.json`, `.cursor/hooks.json` and `.gitignore`, and remove hooks you did not approve.
- [ ] Check for shadowing: `ls ~/.claude/skills` and `/skills` for same-named personal or plugin skills. Turn off conflicting plugin skills with `skillOverrides`.
- [ ] Run it once against a known screen in the demo app (the records table and the destructive dialog) whose correct output you already know. Reject it if it proposes off-system tokens, fonts or components.
- [ ] Check context cost: run `/context` before and after. Record the listing and body cost in `REGISTRY.md`, and name what the skill displaces.
- [ ] Get the accessibility auditor's sign-off for any accessibility-gate skill.
- [ ] Re-review on every version bump. Updates go through a PR with a diff of the copied files, never an in-place `update` command.

## How skills load in Claude Code (verified 2026-09-30, thread 04)

- Model-invocable skills show their name and description in every request; the combined description is truncated at 1,536 characters in the listing.
- The body loads when invoked and stays in context for the rest of the session, so every line is a recurring cost. Supporting files load only when the body sends the agent to them. Scripts are executed, not loaded.
- `allowed-tools` pre-approves; it restricts nothing. `disallowed-tools` removes tools while the skill is active.
- `disable-model-invocation: true` takes the skill out of the listing; only a person can invoke it.
- `` !`command` `` lines run before the model sees the skill.
- Skills are discovered at `.claude/skills/<name>/SKILL.md`; a nested level such as `_adopted/<name>/` is not documented (code.claude.com/docs/en/skills, read 2026-10-01), which is why CF-19 keeps the folder flat.

## Changelog

- 2026-10-01: v0.1, lifted from ruling 04 for the toolkit. House names prefixed `tk-` (CF-18); flat skill folders with `REGISTRY.md` (CF-19); yarn commands (CF-22); `tk-motion` model-invocable on its trigger test (CF-30, amends ruling 04's manual-only row); GSAP rejected for product UI (CF-32); the cookbook routed to references (CF-33); the critic's rubric moved to `canon.md` §3 (CF-20). The mined `DESIGN.md` lines live in `canon.md` §1 and the mined bans in `canon.md` §2; ruling 04's motion line is retired (CF-34). Product lines in edit B4 cut.
- 2026-10-01: the critic's rubric moved from `canon.md` §3 to `canon-rubric.md` (record 0009); `tk-ui-critic` loads it with canon §2.
- 2026-10-04: edit A2 admits the sources ruled in `component-sources.md`, by commit-pinned GitHub address (CS-08); edit A4's `paths` gains `packages/catalog/**` (CS-07, record 0011).
