---
paths:
  - "apps/*/app/**"
  - "packages/ui/**"
  - "**/*.tsx"
---

# UI files

Before writing or reviewing UI, read, in order:

1. `docs/design/canon.md` — the universal floor (principles and the A-01–A-20 tells). The critic's rubric is `canon-rubric.md`; builders don't load it.
2. The product's design layer, `apps/web/docs/design/`: `DESIGN.md`, `tokens.md`, `components.md`, `states.md`, `anti-patterns.md` (the product non-negotiables) and `coverage-gaps.md`.
3. The ticket's contract and the one UX surface it cites (`specs/web/ux/<area>/<surface>.md`), when they exist; before the promotion, the UX source in `docs/ux/` the precedence ladder names.

Then work in the repo's own vocabulary: `@syn/ui` components and the tokens in `packages/config/tailwind/preset.css`, until layer 3 lands the practice's preset and kit. Motion follows canon C-P11.
