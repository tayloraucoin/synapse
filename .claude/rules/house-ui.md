---
paths:
  - "apps/*/app/**"
  - "packages/ui/**"
  - "**/*.tsx"
---

# House rules: UI

**Audit before you build.** `packages/ui/src/primitives/` already holds the full shadcn set, re-slotted; the v2 handoff §5 already has the contract for most composites. Building a second one is how a design system forks.

**Storybook-first:** new reusable UI belongs in `@syn/ui` with a `.stories.tsx` before any feature uses it. App-local composition stays in the app. `yarn ui:storybook`.

**Tokens by name; no hex outside `packages/config/tailwind/preset.css`.** See [`brand-tokens.md`](../../docs/ai-guides/brand-tokens.md).

| Kind of work                                        | Guide                                                                       |
| --------------------------------------------------- | --------------------------------------------------------------------------- |
| Which token to type for a colour, size, or duration | [`brand-tokens.md`](../../docs/ai-guides/brand-tokens.md)                   |
| Which typography component                          | [`typography-guidelines.md`](../../docs/ai-guides/typography-guidelines.md) |
| `className` / Tailwind patterns                     | [`classnames.md`](../../docs/ai-guides/classnames.md)                       |
| Component anatomy, props, stories                   | [`component-guidelines.md`](../../docs/ai-guides/component-guidelines.md)   |
| Anything a person will read                         | [`copy-conventions.md`](../../docs/ai-guides/copy-conventions.md)           |
