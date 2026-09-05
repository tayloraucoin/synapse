# `@syn/ui` — package-local rules

**Read the root [`AGENTS.md`](../../AGENTS.md) first.**

This is the **one web-only package**. It may reach for the DOM; nothing else
shared may. That is what makes the future Expo app a re-skin rather than a
rewrite — logic stays platform-pure in `@syn/{types,constants,utils,validators,hooks}`,
and only this package is rebuilt.

## Before building anything

1. **Audit first.** `packages/ui/src/primitives/` already holds the shadcn set,
   re-slotted into `<kind>/<name>/`. Check there, then
   [`../../docs/ux/synapse_ui_component_needs_and_handoff_v2.md`](../../docs/ux/synapse_ui_component_needs_and_handoff_v2.md)
   §5 for the contract before inventing one.
2. **Read** [`../../docs/ai-guides/component-guidelines.md`](../../docs/ai-guides/component-guidelines.md)
   and [`../../docs/ai-guides/brand-tokens.md`](../../docs/ai-guides/brand-tokens.md).

## Structure

Every component is a folder: `<name>.tsx`, `<name>.variants.ts` (wherever a
`cva()` exists — it never stays in the component file), `index.ts`, and
`<name>.stories.tsx`. A component without a story is not finished.

`src/_shadcn/` is the CLI's landing zone. It holds `.gitkeep` and nothing else;
every `add` is followed by a re-slot into `primitives/<kind>/<name>/`.

## Rules

- **Enumerated exports.** `src/index.ts` and `package.json`'s `exports` list
  every entry. No `"./*"` wildcard.
- **Relative imports inside the package.** The `@syn/ui/*` path alias in
  `tsconfig.json` exists for the shadcn CLI and is not used in source.
- **Tokens by name; no hex.** `packages/config/tailwind/preset.css` is the only
  file where a hex may appear.
- **No `dark:` colours.** Tones map to semantic tokens that already flip.
- **`@syn/ui` never imports an app, `@syn/db`, `@syn/auth`, or `@syn/api`.**
  A component receives a view model from `@syn/types` — never a DB row.

## The handoff's paths, remapped

The v2 handoff was written against a single-app layout. Read every `Folder:`
line through this table:

| Handoff | Here |
|---|---|
| `ui/primitives/<kind>/<name>/` | `packages/ui/src/primitives/<kind>/<name>/` |
| `ui/composed/<kind>/<name>/` | `packages/ui/src/composed/<kind>/<name>/` |
| `ui/lib/`, `ui/hooks/`, `ui/providers/`, `ui/styles/` | `packages/ui/src/{lib,hooks,providers,styles}/` |
| `ui/styles/tokens.css` | `packages/config/tailwind/preset.css` |
| `.storybook/` | `packages/ui/.storybook/` |
| `components.json` | `packages/ui/components.json` |
| `@/ui/...` imports | relative, inside the package |
