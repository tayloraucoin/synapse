# Synapse — Component Guidelines

> **Implementation contracts for `@syn/ui` primitives.** Visual and token decisions live in [`branding-design-system.md`](./brand-tokens.md). Functional inventory lives in [`ui-build-specs.md`](../ux/synapse_ui_component_needs_and_handoff_v2.md). This file governs **how** shared components are built — props, structure, exports, and Storybook conventions.

---

## 1. The `classes` prop

Shared primitives expose an optional **`classes`** prop: a plain object of optional Tailwind class strings keyed by sub-part. This allows callers to adjust layout or emphasis without forking the component.

### Shape

Each component defines its own `*Classes` interface. Keys map to internal DOM nodes:

```ts
// Input example
interface InputClasses {
  root?: string;    // outer field wrapper
  label?: string;   // forwarded to Label
  input?: string;   // <input> element
  prefix?: string;  // money-mode currency glyph
  suffix?: string;  // password-mode toggle
  helper?: string;  // forwarded to HelperText
}
```

```ts
// Label example
interface LabelClasses {
  root?: string;
}
```

```ts
// HelperText example
interface HelperTextClasses {
  root?: string;
}
```

### Rules

1. **Merge with `cn()`** — always `cn(baseStyles, classes?.part, className)` so caller overrides win last on the same element.
2. **Forward nested keys** — when a parent composes a child (e.g. `Input` → `Label`, `Input` → `HelperText`), forward the matching `classes` key to the child's `classes` prop.
3. **Do not use `classes` for variants** — use typed props (`variant`, `mode`, `size`) for design-system variants; reserve `classes` for one-off layout or page-specific tweaks.
4. **Document keys** in the component's top-of-file doc block when non-obvious.

### Usage

```tsx
<Input
  label="your email"
  classes={{
    root: "max-w-md",
    helper: "text-center",
  }}
/>
```

### Tailwind class strings

When composing Tailwind utilities in JSX (especially in apps), follow **[classnames.md](./classnames.md)** — use `cn()` from `@syn/ui/cn`, chunk by concern, and alphabetize tokens within each chunk.

**Vertical rhythm:** put stack spacing on the parent (`flex flex-col gap-(--space-N)`), not per-child `mt` / `mb` on typography primitives. See [classnames.md § Spacing](./classnames.md#spacing-design-tokens) for the `m-0` vs `space-y` cascade issue and the decision tree.

### Layout primitives

- **`Section`** (`@syn/ui/section`) — page-band shells with `register`, surface-specific `type` presets (padding is one effect of `type`), `align`, `entrance`, and built-in `DarkAmbience` when `register="darkAmbience"` (defaults: `ambience.position` center, `ambience.drift` false). Props are alphabetical.

---

## 2. `darkBackground` prop

Shared bridge components (`Button`, `Input`, `Textarea`, `Label`, `SegmentedControl`, …) accept **`darkBackground?: boolean`**.

| Surface | When to pass |
| ------- | ------------ |
| **Marketing** dark-register section | **Pass** on every control in that section. Do **not** add `.dark` to the section container. |
| **Marketing** light-register section | **Omit** |
| **App** (normal) | **Omit** — `next-themes` toggles `.dark` on `<html>` |
| **App** opposing-surface edge case | Prefer nesting `.dark` / `.light` on the container (§02.6). Use `darkBackground` only when container wrap is impractical. |

### Implementation

**`Button` and composed controls that use it** (e.g. `SegmentedControl`): when `darkBackground` is `true`, add the `dark` class **on the control itself** so `dark:` variant styles in CVA apply:

```tsx
cn(buttonVariants({ variant, size }), darkBackground && "dark", className);
```

**Other primitives** (`Input`, `Textarea`, `Text`, …) may still wrap with `<span className="dark contents">` until aligned — prefer the on-element `dark` class pattern for new work.

**`SegmentedControl`** is the canonical pattern for marketing audience toggles and single-select choice rows on dark register (waitlist audience toggle, future chip rows). Compose from `Button variant="outline"` + `darkBackground`; active/inactive styling lives in `segmentedItemVariants`, not new Button variant keys.

---

## 3. `forwardRef` and `displayName`

- All interactive primitives use `React.forwardRef` so forms and Radix compositions can attach refs.
- Set **`displayName`** on every forwarded component (aids React DevTools and Storybook).
- Prefer `ComponentProps<"input">` (or the matching element) and `Omit` only when replacing conflicting props (e.g. `Input` omits `type` when `mode` owns it).

---

## 4. Index exports

Each primitive lives in its own folder:

```
primitives/control/input/
  input.tsx
  input.variants.ts   // optional — cva styles
  input.stories.tsx
  index.ts            // export { Input, type InputProps, … }
```

`packages/ui/src/index.ts` re-exports public API surface. Do not export stories or internal variant helpers unless intentionally public (`buttonVariants`, `inputVariants`).

**Textarea** imports `inputVariants` from `input.variants.ts` — field skin (fill, border, placeholder, focus) is shared with `Input`; skin changes apply to both.

---

## 5. Top-of-file doc block

Every primitive includes a concise block comment with:

1. **Contexts** — marketing vs app usage
2. **Token bindings** — bridge token names, not hex
3. **Theming / surface** — `darkBackground` behavior
4. **Non-obvious gotchas** — mode restrictions, a11y requirements
5. **`[PENDING]` flags** — unresolved design-system items the component depends on

See `input.tsx` and `button.tsx` for reference.

---

## 6. Storybook conventions

- **Theme:** use the Storybook toolbar (`withThemeByClassName` on `document.documentElement`). **Do not** create separate light/dark story pairs — toggle the toolbar to review both themes.
- **One story per variant/mode** plus an **Overview/matrix** story for at-a-glance review.
- **`OnDarkBackground`** — dedicated story for marketing `darkBackground` on a dark-register surface (not a theme toggle substitute).
- **Args/controls** — expose interactive props on `Default` and mode stories.
- **`tags: ["!autodocs"]`** on large matrix/overview stories to keep Docs lean.
- **Layout:** use `parameters.layout` and decorators for consistent max-width (`max-w-sm` for fields).
- **Overview labels:** use `StorySectionLabel` from `packages/ui/src/composed/_storybook/story-section-label.tsx` (wraps `Text variant="label" tone="muted"`) — not `Eyebrow`, not inline Tailwind label strings.

---

## 7. Accessibility checklist (controls)

- `focus-visible` ring: 2px `--ring`, offset 3px (§11.3)
- `aria-describedby` linking field → helper/error text
- `aria-invalid` when `error` is set
- Icon-only affordances: mandatory `aria-label` (password show/hide toggle, send, close)
- Touch targets ≥ 44px on interactive suffixes (password toggle)
- Honor `prefers-reduced-motion` — use motion tokens; no bounce/spring

---

## 8. Typography primitives

**Which text component to use** (Eyebrow vs Text vs Label vs Headline) is documented in [`typography-guidelines.md`](./typography-guidelines.md). Read that file before adding raw `font-(--font-body)` / `text-(length:--fs-label)` classes to pages or stories.

---

## 9. Prop-based default exports

Some primitives ship as **building blocks** (multiple sub-parts composed manually in JSX). When a standard use case repeats across pages, add a **prop-based default export** that wraps those primitives so callers pass data, not DOM structure.

### When to add a wrapper

Add a prop-based default export when:

1. A caller must import **more than two sub-parts** to render a standard instance.
2. The same header/body/footer (or columns/rows) assembly appears in multiple places.
3. The wrapper can cover **80%+ of real usage** without blocking custom layouts.

Keep the raw primitives exported for advanced composition (DnD tables, custom footers, trigger-based dialogs).

### Naming convention

| Layer | Name | Role |
| ----- | ---- | ---- |
| Primitive wrapper | `*Root` | Low-level shell that accepts `children` (e.g. `TableRoot`) |
| Default export | Same base name | Prop-driven API for the common case (e.g. `Table`) |
| Overlay panels | Descriptive name | `Dialog`, `SheetPanel`, `ConfirmDialog` |

### Canonical example: `Table`

**Default export** — pass `columns` and `rows`; optional `cell` render functions for rich cells:

```tsx
import { Table, type TableColumn } from "@syn/ui/table";

const columns: TableColumn<Questionnaire>[] = [
  { key: "title", header: "Title", cellClassName: "font-medium" },
  {
    key: "status",
    header: "Status",
    cell: (row) => <Badge>{row.isActive ? "Active" : "Inactive"}</Badge>,
  },
];

<Table
  columns={columns}
  rows={questionnaires}
  getRowKey={(row) => row.id}
  emptyState={<Text tone="muted">No questionnaires yet.</Text>}
/>
```

**Primitive composition** — use `TableRoot` + `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell` when the layout is non-standard (e.g. drag-and-drop reordering).

### Other references

| Component | Default export | Primitives (custom layout) |
| --------- | -------------- | ---------------------------- |
| Table | `Table` (`columns`, `rows`, `getRowKey`, optional `label`) | `TableRoot`, `TableHeader`, … |
| Dialog | `Dialog` (`open`, `title`, `description`, `children`) | Radix primitives not exported |
| Sheet | `SheetPanel` (`open`, `title`, `description`, `side`, `footer`, `children`) | `Sheet`, `SheetContent`, … |
| Alert dialog | `ConfirmDialog` (`open`, `title`, `onConfirm`, …) | `AlertDialog`, `AlertDialogContent`, … |
| Select | `SelectField` (`label`, `options`, …) | `Select`, `SelectTrigger`, … |

### Rules for new work

1. **Pages and features import the default export** unless they need primitive flexibility.
2. **Define column/item types** at the call site or in a shared module — do not hard-code domain types inside `@syn/ui`.
3. **Support `emptyState`** on list/table wrappers for zero-row UX.
4. **Optional `label`** — render `Text variant="label"` above the grid (shadcn-style). Page titles use `Headline`; do not use `<caption>` inside the table.
5. **Support `classes`** on wrappers for one-off layout tweaks (§1).
6. When adding a new primitive with 3+ sub-parts, **plan the prop-based wrapper in the same PR** or file a follow-up before shipping the second copy-pasted assembly.

---

## 8. Form validation

Zod-backed forms use **`useZodForm`** from `@syn/hooks` (not raw `useForm` + `zodResolver`). It defaults to blur-first validation (`mode: "onBlur"`, `reValidateMode: "onChange"`).

Field errors must surface only after **blur** or **submit** — never while the user is still typing. Pass errors to `Input`, `Textarea`, and `SelectField` via **`fieldErrorProps(formState, "fieldName")`**, or use **`visibleFieldError`** when rendering `HelperText` manually (e.g. bare `Textarea` or split label/error layout).

Submit-button gating may still use `schema.safeParse(watch())` when the button should stay disabled until the full form passes, without showing errors early.

---

## 9. Customer-facing copy

User-facing strings follow a dedicated convention — **not** inline in components and **not** in `@syn/constants`. See **[copy-conventions.md](./copy-conventions.md)** for:

- Co-located `copy.ts` defaults in `@syn/ui` composed components
- `apps/web/content/` for surface-specific prose
- Override order: props → surface content → UI defaults

---

_End of Component Guidelines. When visual decisions conflict with this file, `branding-design-system.md` wins._
