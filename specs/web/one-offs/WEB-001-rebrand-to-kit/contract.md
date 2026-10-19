---
id: WEB-1
size: medium # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "Synapse's app and brand docs match the operator's brand kit (Design System artifact EhNLGGfozdciR27ukmtmxL): its tokens, type, mark, shape and trust line"
slice_type: "cross-cutting re-theme; risks a token pair falling out of step across the raw, role and shadcn layers, a contrast pair failing on a real screen, and the docs drifting from preset.css"
non_negotiables:
  - "The kit wins where it and the repo disagree; the kit is read-only data."
  - "A raw colour value lives only in packages/config/tailwind/preset.css."
  - "Newsreader on Review screens only; Public Sans everywhere else, weights 400, 500, 600."
  - "No teal fill and no teal text in brand-500; text in the brand colour is link."
  - "Red only on Delete account; missed, errors and warnings are foreground or muted-foreground."
  - "No shadows; nothing round except the mark and a category dot."
  - "Layout and behaviour are unchanged; the branch's unrelated uncommitted docs work is never committed here."
devs_call: "How the old semantic names reach the kit roles (alias or rename), the shape of check-brand, which components lose a shadow or a pill and what replaces it (a border, radius-control)."
cites:
  - "specs/web/ux/_global/copy-register.md"
truth_files: "none: layout and behaviour do not change; the trust line already reads as the kit has it"
qa: Q2 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers:
  - assay
focus: []
operator_review: true
planned_paths:
  - "packages/config/tailwind/preset.css"
  - "apps/web/app/layout.tsx"
  - "apps/web/app/manifest.ts"
  - "apps/web/app/favicon.ico"
  - "apps/web/public/icons/"
  - "apps/web/app/"
  - "apps/web/components/"
  - "packages/ui/src/"
  - "tooling/check-brand.ts"
  - "package.json"
  - "docs/ux/branding-guide.md"
  - "docs/archive/branding-guide.md"
  - "docs/ai-guides/brand-tokens.md"
  - "docs/ai-guides/typography-guidelines.md"
  - "apps/web/docs/design/DESIGN.md"
  - "apps/web/docs/design/tokens.md"
  - "docs/ux/ux-spec-v1.3.md"
  - "docs/decisions/ledger.md"
  - "docs/architecture/directory-map.md"
depends_on: []
out_of_scope:
  - "A designed logo or wordmark: the kit's mark is a placeholder, recorded as an open brand item"
  - "Copy changes beyond the trust line: voice breaks are listed as drafted follow-ups"
  - "Layout, behaviour and route changes"
  - "docs/design/canon.md, unless a delta belongs there and plan mode approves it"
criteria:
  - id: C1
    statement: "Every kit colour token has a role in preset.css that resolves to the exact kit value, in light and in dark"
    evidence: capture
    path: "specs/web/one-offs/WEB-001-rebrand-to-kit/evidence/tokens.txt"
  - id: C2
    statement: "Every contrast.md pair holds on the List, Schedule, Review and Delete account screens, in both themes, computed from the rendered colours"
    evidence: capture
    path: "specs/web/one-offs/WEB-001-rebrand-to-kit/evidence/contrast.txt"
  - id: C3
    statement: "Public Sans loads as the interface face and Newsreader loads on Review screens only"
    evidence: capture
    path: "specs/web/one-offs/WEB-001-rebrand-to-kit/evidence/fonts.txt"
  - id: C4
    statement: "The PWA icons, the favicon and the in-app mark are drawn from the kit's mark"
    evidence: capture
    path: "specs/web/one-offs/WEB-001-rebrand-to-kit/evidence/mark.txt"
  - id: C5
    statement: "No shadow utility or shadow token, no pill or circle outside the mark and the category dots, and no raw colour outside preset.css"
    evidence: check
    command: "yarn check-brand shape"
  - id: C6
    statement: "The brand docs name the same tokens, values and fonts as preset.css"
    evidence: check
    command: "yarn check-brand docs"
  - id: C7
    statement: "The trust line reads exactly as the kit has it"
    evidence: check
    command: "yarn check-brand trust"
  - id: C8
    statement: Taylor has looked this ticket over and approved it.
    evidence: manual
    reason: "operator_review: true; the builder defers it with what to look at"
---

# Contract — WEB-1 rebrand-to-kit

## Build notes

Source of truth: the kit artifact (README, tokens.json, contrast.md, voice.md, brand-pillars.md, Logos). Read it with the Artifact tool; values come from tokens.json, never a screenshot.

- **Approach:** re-map preset.css in three layers (raw `--syn-neutral|brand|violet|red-*`, the kit's role tokens, the shadcn bridge), swap Geist for Public Sans in the root layout, draw the mark and icons from the kit's `mark.svg`, then strip shadows and pills from the components. Docs follow preset.css; `check-brand` holds them together.
- **Decisions that apply:** kit README "Colour", "Type", "Space, shape and motion", "Logo"; contrast.md tables; the trust line "Only you can see your data. Not the people who built this, not anyone you invite."
- **Interfaces:** CSS custom properties and their Tailwind utilities (`bg-background`, `text-link`, `bg-now`, `bg-category-<hue>-chip`, `text-title`, …); `yarn check-brand <shape|docs|trust>`; `SynapseMark` in `@syn/ui`.
- **Per path:** preset.css holds every value; layout.tsx the fonts; manifest, favicon and icons the mark; `packages/ui/src` the shadow and pill removals and the mark; tooling/check-brand.ts the three checks; the docs the rewritten guide and token references.
- **Gotchas:** the shadcn bridge used to redeclare `--accent` as a teal hover wash; it becomes `surface`. Spacing names differ from the kit (`space-5/6/7` are the kit's `space-6/8/12`), so a rename runs top-down. `--space-8` is referenced in three places and never defined.
- **Model:** Opus 5.5 at medium; a smaller model misses token pairs across the three layers.
