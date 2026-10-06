# Customer-facing copy conventions

> Where user-facing strings live, how to override them, and what not to put in `@syn/constants`.

---

## Layers

| Layer | Location | What lives here |
| ----- | -------- | --------------- |
| **Shared UI defaults** | Co-located `copy.ts` next to the composed component | Strings the component owns when callers don't override (dialog title, button labels, error fallbacks) |
| **Surface / campaign copy** | `apps/web/content/` | Marketing voice, questionnaire preamble, section dividers keyed by `section_key` |
| **Route glue** | Thin `_lib/` re-exports or assemblers | Import from `content/`; no prose inline in route components |

**Not** `@syn/constants` — that package is for domain-neutral runtime values (storage keys, limits), not customer-facing prose.

---

## Shared UI defaults (`copy.ts`)

Place a `copy.ts` beside composed components that ship with default copy:

```
packages/ui/src/composed/control/auth-capture/
  copy.ts
  auth-capture-dialog.tsx   # defaults from copy.ts
  auth-capture-panel.tsx
```

Shape:

```ts
export const AUTH_CAPTURE_COPY = {
  dialog: { title: "…", description: "…" },
  panel: { preferPassword: "…", … },
  errors: { … },
} as const;
```

Export from the component's `index.ts` so Storybook and apps can import:

```ts
import { AUTH_CAPTURE_COPY } from "@syn/ui/auth-capture";
```

**Storybook:** stories import from `copy.ts` and demonstrate default vs overridden props.

---

## Marketing surface copy (`apps/web/content/`)

Campaign- and surface-specific prose:

```
apps/web/content/
  auth-capture.ts
  questionnaires/
    practitioner-wave-1.ts    # section divider strings + types
    practitioner-wave-1.cover.tsx   # JSX preamble
```

Surface modules may re-export UI defaults until copy diverges:

```ts
import { AUTH_CAPTURE_COPY } from "@syn/ui/auth-capture";

export const MARKETING_AUTH_CAPTURE_COPY = {
  dialog: AUTH_CAPTURE_COPY.dialog,
  successCta: AUTH_CAPTURE_COPY.dialog.title,
} as const;
```

Route `_lib/` files stay thin — re-export from `content/` to keep existing import paths stable:

```ts
// apps/web/app/.../ _lib/cover-copy.tsx
export { SECTION_DIVIDER_COPY, getCoverCopy, … } from "@/content/…";
```

---

## Override order

When the same string can come from multiple places:

1. **Component props** at the call site (highest priority)
2. **Surface `content/`** module (`MARKETING_AUTH_CAPTURE_COPY`, questionnaire files)
3. **UI `copy.ts` defaults** (lowest — used when nothing is passed)

---

## Conventions

- Use `as const` objects with named keys — not scattered string literals in components.
- When a display name is immediately followed by a word in JSX or a template literal, use `withTrailingGap(name)` from `@syn/utils` so the gap lives inside the expression (`{withTrailingGap(habitTitle)}runs at…`). Use `{ enSpace: true }` under a `Badge`. Skip for possessives (`{name}&apos;s`) and terminal names (`Invite ${name}`).
- Plain strings in `.ts`; JSX preamble in a `.cover.tsx` sibling (e.g. `practitioner-wave-1.cover.tsx`) when markup is required.
- No i18n layer yet — structure copy so locale files can replace these modules later.
- New questionnaires: add `content/questionnaires/<slug>.ts` (+ `.tsx` if needed); wire via `COVER_COPY_BY_SLUG` in the route re-export.

## Emoji (UX v1.2 R29, §12.1; TD-20)

**The product's copy never contains an emoji.** A thing the person owns may carry one as its icon — a habit, a step, a workout, a focus, a fixture, a passage, a day plan, the two evening times, and (the one chrome exception) the four archetype cards, which name kinds of people. No heading, body line, button, caption, status line, dialog, notification, or sentence in the app's voice ever carries one.

The rule is lint, not review: `packages/config/eslint/no-emoji.js` fails any `copy.ts` (every package, through the base config) and all of `packages/constants/src/` on an emoji in a string or template literal. The six seed files that legitimately carry glyphs (`starter-library`, `workout-types`, `fixture-kinds`, `work-day-kinds`, `schedule-shapes`, `placed-rows`) are the rule's exception list, and they carry a glyph only in `icon.value` as `{ kind: "emoji", value }` — never in a `title`. A glyph that reaches a screen does so as `IconValue` data through `EmojiSlot` / `ItemIcon`, `aria-hidden`, with the title as the accessible name.

---

## Related

- [Component Guidelines](./component-guidelines.md) — props, `classes`, Storybook
- [Codebase conventions](../architecture/codebase-conventions.md) — `@syn/constants` scope
