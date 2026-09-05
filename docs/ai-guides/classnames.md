# Tailwind className conventions

> Governs how Tailwind utility strings are composed in app code. The `cn()` helper lives at `@syn/ui/cn` (`packages/ui/src/lib/cn.ts`).

---

## When to use `cn()`

Use `cn()` when a `className` has enough utilities to benefit from chunking:

- Roughly **4+ classes**
- **Breakpoints** (`min-[721px]:`, `lg:`, …)
- **Pseudo-states** (`hover:`, `focus:`, `group-hover:`, `after:`, …)
- **Conditionals** (props, feature flags, open/closed state)

Keep short overrides inline: `className="mt-3"`, `className="shrink-0"`.

Always import from `@syn/ui/cn`:

```ts
import { cn } from '@syn/ui/cn';
```

---

## Chunk order

Each semantic group is a separate `cn()` argument (or module-level constant). Order:

1. **Base** — layout, sizing, color, border (default breakpoint only)
2. **Responsive** — ascending breakpoint (`min-[721px]:` → `lg:` → `min-[1024px]:`, …)
3. **States** — `hover:`, `focus:`, `group-hover:`, `after:`, …
4. **Motion / a11y** — `motion-safe:`, `motion-reduce:`
5. **Conditionals** — last (`isOpen && '…'`, `className` prop overrides)

### Within each chunk

Sort space-separated tokens **alphabetically** by the full class string.

---

## Spacing (design tokens)

Canonical spacing tokens are `--space-1` … `--space-11` in [`preset.css`](../../packages/config/tailwind/preset.css). **Do not map them onto Tailwind's numeric `--spacing-*` theme keys** — the two scales diverge from step 5 upward (`h-11` / `min-h-11` must stay 44px for touch targets; `--space-11` is 160px section padding). Use the parenthetical form for design tokens.

### Prefer `flex` / `grid` + `gap`

For vertical stacks, use **`flex flex-col gap-(--space-N)`** instead of `space-y-*`. Tailwind v4 `space-y` applies `margin-block-end` through a **zero-specificity** `:where()` selector; `@syn/ui` typography (`Text`, `Heading`, `Caption`, `Meta`) ships with **`m-0`**, which wins the cascade and zeroes that margin. The utility is present in the stylesheet but has no visible effect on typography children — this is the most common "space-y is broken" report in the app.

```tsx
// Good — gap does not fight child margins
<div className="flex flex-col gap-(--space-4)">
  <Text as="p" variant="body">…</Text>
  <Sub className="text-muted-foreground">…</Sub>
  <div className="flex gap-(--space-2)">…</div>
</div>
```

`space-y` can still work when **every** direct child lacks an explicit margin reset (rare in this codebase). Do not use it on stacks of `Text` / `Sub` / `Button` primitives.

### `space-y` only affects direct children

`space-y-(--space-3)` on a wrapper with two children (eyebrow + list) moves **one** gap by 4px when stepping from `--space-2` to `--space-3`. To space list items, put `gap` or `space-y` on the `ul`, not the parent.

### Parenthetical vs numeric (different scales)

| Class | Resolves to |
| ----- | ----------- |
| `gap-(--space-5)` | `var(--space-5)` = 24px (design token) |
| `gap-5` | Tailwind default spacing-5 = 20px (not `--space-5`) |
| `h-11` / `min-h-11` | Tailwind spacing-11 = 44px touch target (not `--space-11`) |

Always use `(--space-N)` when you mean the design token. Never assume `gap-N` or `space-y-N` maps to `--space-N`.

### Decision tree

1. **Vertical stack of `@syn/ui` primitives** (`Text`, `Heading`, `Caption`, `Meta`) → **`flex flex-col gap-(--space-N)`** on the parent.
2. **List item rhythm** → `gap` or `space-y` on the `ul` / `ol` / list container, not on a wrapper that only has two children (eyebrow + list).
3. **Single-edge offset** (separate from a border, optical nudge) → `mt-` / `mb-` / `py-` one-offs on the element that needs it.
4. **Form label + control** (`Label` + `Input`) → `space-y-2` is fine when children are not typography `m-0` resets.

### Anti-pattern: dead `space-y` + child margins

Do not pair a `space-y` parent with `mt` / `mb` / `my` on typography children to fake spacing — the parent utility is already dead. Fix the parent stack, then remove redundant child margins.

```tsx
// Bad — space-y does nothing; mt/my are compensating
<div className="space-y-(--space-3)">
  <Text className="mt-(--space-2)">…</Text>
  <Sub className="my-(--space-3)">…</Sub>
</div>

// Good
<div className="flex flex-col gap-(--space-3)">
  <Text>…</Text>
  <Sub>…</Sub>
</div>
```

ESLint warns on new `space-y-(--space-N)` in JSX `className` literals (`packages/config/eslint/spacing.js`); strings inside `cn()` are not flagged yet.

### Padding / margin one-offs

`p-(--space-6)`, `mt-(--space-4)`, etc. remain the right choice for single-edge or non-stack spacing. See [`branding-design-system.md`](./brand-tokens.md) §04.1 for the token table.

---

## Examples

### Good

```tsx
<ItemRow
  className={cn(
    "border-hairline flex min-h-(--row-min) items-center gap-(--space-3) border-b px-(--space-4)",
    "transition-colors duration-(--dur-state) ease-(--ease-settle)",
    isPassed && "opacity-55",
    isOffSchedule && "text-violet-text",
  )}
/>
```

```tsx
const chipClass = cn(
  "border-hairline inline-flex items-center rounded-(--radius) border px-(--space-2)",
  "font-sans text-(length:--fs-caption)",
  isSelected && "bg-primary text-primary-foreground border-transparent",
);
```

### Avoid

```tsx
// A template literal instead of cn(): conditionals become string concatenation
// and tailwind-merge never gets a chance to resolve a conflicting override.
className={`flex items-center px-4 ${isPassed ? "opacity-55" : ""}`}

// A hex. The token file is the only place one may appear.
className="bg-[#FAFAF8] text-[#25231F]"

// An arbitrary spacing value. The scale is 4·8·12·16·24·32·48 and nothing else
// (official spec §9.5); a 14px gap is a decision no one made.
className="gap-[14px] p-[22px]"

// space-y on typography children — see § Spacing. Silently does nothing.
className="space-y-(--space-3)"
```

---


## Layout primitives

Synapse has no `Section` primitive. Conscious Connections needs one because it
has a marketing site with registers and ambience; Synapse has one app, one
ground, and a single content column, so a page composes with `flex`, `gap-`,
and the width tokens (`--content-text` 720px for lists and reviews,
`--content-canvas` 960px for the Schedule, the template editor, and the week
build — cross-cutting §2.3).

If a layout shape appears three times, extract it. Not before.
