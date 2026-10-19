---
paths:
  - "apps/*/app/**"
  - "apps/*/src/**"
  - "packages/ui/**"
  - "**/*.tsx"
---

# UI files

Before writing or reviewing UI, read, in order:

1. `docs/design/canon.md` — the universal floor (principles and the A-01–A-20 tells). The critic's rubric is `canon-rubric.md`; builders don't load it.
2. The product's design layer, `apps/web/docs/design/` (`DESIGN.md`, `tokens.md`, `components.md`, `states.md`, `anti-patterns.md`, `coverage-gaps.md`).
3. The ticket's contract and the one UX surface it cites (`specs/web/ux/<area>/<surface>.md`), when they exist; for an area not yet promoted, the `docs/ux/` source the precedence ladder names (MIG-1).

Then work only in the vocabulary in `AGENTS.md`: `@syn/ui` components, tokens, every state reachable by `?state=`. Motion follows canon C-P11. Need a reference? Go through `docs/references/README.md`, at most three files.

`apps/docs` is the docs reader, not a product surface: it uses the tokens and `@syn/ui`, and the canon's product rules (states matrix, one primary action) do not bind it.
