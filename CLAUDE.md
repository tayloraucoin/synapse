@AGENTS.md
@docs/index.md

## Claude Code only

- Path rules in `.claude/rules/` load on matching files, the `house-*` rules among them.
- Hooks in `.claude/settings.json` and the operator's `settings.local.json` enforce the shell rules. A denial message is an instruction: do what it says, and never pursue the same outcome through another form of the command.
- Subagents in `.claude/agents/` are generated from `docs/roles/`. Hand an evaluator (`assay`, `vigil`) the contract and the evidence, never your summary.
- House skills: `tk-prompt` is the front door for new work; `tk-batch` builds named tickets. Ask the builder's interview through the question tool.
- Use plan mode before changing `docs/design/canon.md`, `docs/index.md`, the boundaries graph, or `docs/decisions/records/`.
