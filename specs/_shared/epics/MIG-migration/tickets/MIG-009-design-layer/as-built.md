# As-built — MIG-9

## Shipped against the contract

- C1: `apps/web/docs/design/` holds `DESIGN.md`, `tokens.md`, `components.md`, `states.md`, `anti-patterns.md`, `coverage-gaps.md` and `refs/README.md`. Every `apps/web/docs/design/` entry left `tooling/refs-pending.json`, and `yarn check-refs` resolves them all.
- C2: `yarn budget` counts the product layer at 1,081 tokens, so canon plus layer is 4,951 of 5,000 (49 to spare beside the 1,130 room).
- C3: `toolkit.json` sets `apps.web.designLayer` to `apps/web/docs/design`. Item 2 of `.claude/rules/ui.md` names the six files and no longer points to `house-ui.md` as the stand-in.
- C4: every file cites canon IDs and does not restate them. Each of the nine P-A rows in `anti-patterns.md` is one bullet of the product non-negotiables in `apps/web/docs/product-rules.md`. The scope and route table stay in `product-rules.md`, because they are not design. Every token is in `packages/config/tailwind/preset.css`. Every component is exported from `packages/ui/src`, checked by grep: `Button`, `StateWord`, `StatusLine`, `Toaster`, `EmptyState`, `SkeletonRow`, `RegionRetry`, `ErrorPage`, `ResponsiveSheet`, `BigNumber`, `FormulaSentence`, `CategoryChip`.
- Plumb's line: the canon already holds colour never alone (C-P05) and streaks (A-19), so those rows say only what Synapse tightens and cite the ID. Turner's line: values stay in code; the layer names roles.

## Deviations

- [ASSUMPTION] `depends_on: [MIG-1]` was dropped at start. MIG-1 is still open on its own checks, but the files the layer points to (`specs/web/ux/_global/`) are promoted and `status: approved` on disk.
- `refs/README.md` was added so check-refs resolves `apps/web/docs/design/refs/`, which `docs/design/templates/refs/README.md` names. It says no set exists yet. `budget.ts` counts only the top-level `.md` files, so the README sits outside the budget.
- The room forced a terse layer. The component inventory points to `packages/ui/src/` and lists only the jobs with a product-specific choice. The per-surface states point to each `specs/web/ux/` States table.
- Five gaps are filed, not invented. G-01: Geist has no recorded reason (A-01). G-02: `--surface` (#F3F2EE) is near A-06's cream. G-03: `--dur-breathe` (2400ms) passes C-P11's 300ms. G-04: the shadcn bridge redeclares `--accent`. G-05: `?state=` is not wired per surface. G-01 to G-03 are [NEEDS DECISION].

## Do the domain guides now restate the layer?

- `brand-tokens.md`: in part. Its colour roles, the accent trap and the destructive, violet and chip rules restate `tokens.md`. Its name-to-type map and three-layer explanation do not.
- `typography-guidelines.md`: in part. "Two families" restates D-P01. Variant choice, presets, tones and common mistakes do not.
- `component-guidelines.md`: no. It is `@syn/ui` authoring guidance (the `classes` prop, `forwardRef`, stories, the a11y checklist). Only §9 copy overlaps `copy-register.md`.
- Archiving them is drafted as MIG-21 (retire-domain-guides). Nothing was archived here.

## Not verified

- No rendered check. The layer is documentation, and no UI changed.
- C3 and C4 are manual: the builder read the files against `toolkit.json`, `ui.md`, `canon.md`, `product-rules.md`, `preset.css` and `packages/ui/src`, and checked the component names by grep. No second reader has checked them.

## Next

Plumb rules on G-01 to G-03. Build MIG-21 to cut the overlap between the domain guides and the layer.
