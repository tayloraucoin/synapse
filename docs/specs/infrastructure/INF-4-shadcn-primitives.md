# INF-4 — shadcn primitives: install, re-slot into CC's folders, skin, story

**Epic:** INF — Infrastructure · **Phase 1** · Size: L
**Slice type:** Vocabulary install — mechanical but wide. The failure class is a primitive that keeps the CLI's default look (a generic dashboard) or lands in a flat `components/ui/` folder instead of CC's kind-first tree.
**Vesper review:** the Overview story of every primitive in both themes; the four constrained primitives (`button`, `input`, `badge`, `sonner`) against v2 handoff §2.5.

**Status:** Complete (2026-09-04) — Vesper review pending

> **Vesper — visual review.** Every primitive gets one look in each theme before closing. Name the ones checked. The known traps: a `button` with an accent fill; an `input` whose error state turns red; a `badge` used as a count; a `skeleton` that shimmers; a `switch` track in accent.

---

## Outcome

`@syn/ui` holds the full shadcn primitive set Synapse needs — twenty-seven CLI installs plus CC's four non-catalogue primitives — each in `packages/ui/src/primitives/<kind>/<name>/` with `<name>.tsx`, an extracted `<name>.variants.ts` where a `cva()` exists, a `<name>.stories.tsx`, and an `index.ts`; each token-skinned to the official spec; each exported from the barrel and as a `package.json` subpath. CC's prop-based wrappers (`SheetPanel`, `Dialog`, `ConfirmDialog`, `Collapsible`, `SelectField`, `CheckboxField`) ride along in their primitive's folder. The CLI's staging folder is empty afterwards. No composed component other than the wrappers is built — the v2 handoff §5.2–§5.10 composites belong to the feature epics.

## Why / intent

- **v2 handoff §2.3 (install strategy), §2.4 (use as installed), §2.5 (constrained), §2.6 (not installed), §2.7 (CC-origin), §5.0 (the primitive table with kinds and modifications), §6.1 (the install script), §6.3 (`components.json`).** This ticket executes those sections.
- **CC `codebase-conventions.md` §4.5** — one folder per component, story mandatory; **CC `component-guidelines.md` §1 (`classes`), §3 (`forwardRef`/`displayName` on interactive primitives), §4 (index exports), §5 (doc block), §9 (prop-based default exports).**
- **The founder's phrase "a components/ui dir for all of the components (ShadCN default/base)"** is honoured as *the full shadcn base, installed as the vocabulary*, but the folder is CC's `primitives/<kind>/<name>/`, not a flat `components/ui/` — README § Locked scope says CC's conventions win, and CC has no `components/ui`. The CLI writes to a staging folder that is emptied by the re-slot. Logged below.
- **What this slice is NOT (binding):** no composed components except the CC wrappers named; no `ItemRow`, `ResponsiveSheet`, `StatusLine`, etc. — those are feature-epic tickets that cite the handoff.
- **Ground truth:** INF-3 landed `cn`, tokens, `Text`, `ThemeProvider`, Storybook, and the `@syn/ui` package shell.

**Rulings this slice makes (labelled, logged):**

- **Staging alias then re-slot** (handoff §2.3): `components.json` aliases `ui` and `components` to `@syn/ui/_shadcn`; after each `add`, the file is moved to its kind folder. `src/_shadcn/` keeps only a `.gitkeep`. Logged.
- **Current CLI output era is kept** (handoff D3): `data-slot`, ref-as-prop on React 19, `tw-animate-css`. CC's `forwardRef` + `displayName` is applied only where the CLI output does not already expose a ref-able element — in practice, the CC wrappers copied on top. Logged.
- **Four CC-origin primitives replace catalogue entries:** `switch` (CC's native `role="switch"` button, no Radix), `helper-text`, `bottom-nav`, `checkbox-field`. `input` and `textarea` are **adapted from CC**, not installed, because CC's fold label/helper/error/`mode` into the control (handoff §2.1) and that is why no `field` primitive is installed. Logged.
- **Not installed, per handoff §2.6:** `field`, `item`, `button-group`, `scroll-area`, `progress`, `combobox`, `command`, `accordion`, `alert`, `slider`, `calendar`, `card`, `table`, `chart`, and the rest of that list. If a later epic needs one, it is a one-line `add` plus a re-slot — not a foundation concern. Logged.

## Behaviour & states

**Surfaces:** Storybook only.

### Install (from `packages/ui/`)

1. Write `packages/ui/components.json` per handoff §6.3 (aliases: `components` and `ui` → `@syn/ui/_shadcn`, `utils` → `@syn/ui/cn`, `lib` → `@syn/ui/lib`, `hooks` → `@syn/ui/hooks`; `tailwind.css` → `src/styles/globals.css`; `baseColor: neutral`; `cssVariables: true`; `iconLibrary: lucide`; base **Radix**). The CLI may need a `tsconfig` path alias `@syn/ui/*` → `src/*` to resolve the aliases inside the package — add it to `packages/ui/tsconfig.json` `paths`.
2. `npx shadcn@latest add button label separator skeleton spinner badge kbd empty`
3. `npx shadcn@latest add checkbox radio-group select native-select toggle-group input-group tabs`
4. `npx shadcn@latest add dialog alert-dialog sheet drawer popover dropdown-menu tooltip collapsible`
5. `npx shadcn@latest add sidebar sonner avatar`
6. Add `lucide-react ^0.553`, `sonner ^2`, `frimousse ^0.3` (the emoji picker's dependency, so the boundaries rule's `frimousse → ui` owner is real from day one), `vaul` (arrives with `drawer`), the Radix packages the CLI adds, to `packages/ui/package.json` dependencies.

### Re-slot map (kind → name; the `Status` column is what changes after the move)

| Kind | Name | Status after move |
|---|---|---|
| `control` | `button` | variants re-skinned: `default` (ink fill, paper text) · `secondary` (1px `hairline` outline, ink text) · `ghost` (text, hover `neutral-100`) · `destructive` (destructive-500 fill; one place); sizes `sm` 36 · `md` 44 · `lg` 48 · `icon` 44×44 (`aria-label` required, documented); add `busy?: boolean` (renders `Spinner` before the label; label unchanged); `asChild` kept; radius `--radius` |
| `control` | `input` | **adapt CC** `primitives/control/input/input.tsx` + `input.variants.ts`: keep `label/helperText/error/mode`, the id/`aria-describedby`/`aria-invalid` wiring, the password Show/Hide text button (44px target, `aria-pressed`); `mode: "text" \| "email" \| "password" \| "number" \| "time" \| "date"`; delete `money`, `phone`, `darkBackground`, `input-format.ts`, the `cc-input` class; skin: 44px, `--radius`, 1px `--input` border, `--paper` fill, error = 1px `ink` border + helper in `ink` (never red) |
| `control` | `textarea` | **adapt CC**: `label/helperText/error/autoGrow/resizable`; delete `appearance`, `darkBackground` |
| `display` | `label` | CLI; typography = `Text variant="secondary" weight={500}` tokens |
| `display` | `helper-text` | **reuse CC**; error → `role="alert"`, text `ink`; default `neutral-500`; 0.75rem |
| `control` | `checkbox` + `checkbox-field.tsx` | CLI + **reuse CC** `CheckboxField`; visual 20px, checked = ink fill + paper check; the parent extends the target |
| `control` | `radio-group` | CLI; checked = ink dot |
| `control` | `switch` | **reuse CC** native switch; track `neutral-300` off / `ink` on; thumb `paper` |
| `control` | `select` (+ `SelectField`) | CLI + **adapt CC** `SelectField` (`label/helperText/error/options/value/onValueChange/placeholder`); trigger shares `input`'s skin |
| `control` | `native-select` | CLI; same skin as `select` trigger |
| `control` | `toggle-group` | CLI + **adapt CC**: add `variant: "chip" \| "cell"` (`cell` = 44×44 square, selected ink fill) and `label` (renders `Label` + `aria-labelledby`) |
| `control` | `input-group` | CLI (addon buttons + text suffix); addons 44px |
| `control` | `tabs` | CLI; underline indicator 2px `ink`; no fill |
| `layout` | `sheet` (+ `SheetPanel`) | CLI + **adapt CC** `SheetPanel` (`open/onOpenChange/title/description/side/footer/hideClose/classes`); right panel 420px; overlay `--scrim`; shadow `--shadow-overlay`; radius `--radius-sheet` on the compact top edge |
| `layout` | `drawer` | CLI (Vaul); handle 32×4 `neutral-300`; surface `--surface` |
| `feedback` | `dialog` (+ prop-based `Dialog`) | CLI + **adapt CC** `Dialog` (`open/onOpenChange/title/description/header/children/classes`; `register` removed); ≤320 compact / ≤420 wide |
| `feedback` | `alert-dialog` (+ `ConfirmDialog`) | CLI + **adapt CC** `ConfirmDialog` with the handoff §5.3 contract (`confirmLabel` and `cancelLabel` required, `variant`, `confirmDisabled`, `busy`, `children` slot); initial focus on cancel |
| `feedback` | `popover` | CLI; `--popover` surface, hairline border, `--shadow-overlay` |
| `feedback` | `dropdown-menu` | CLI; items 44px |
| `feedback` | `tooltip` | CLI; wide only (documented) |
| `layout` | `collapsible` (+ prop-based `Collapsible`) | CLI + **reuse CC** wrapper (`trigger/children/open/onOpenChange/defaultOpen/classes`) |
| `layout` | `separator` | CLI; `hairline` |
| `display` | `skeleton` | **adapt CC**: `aria-hidden`, `neutral-200`/`neutral-700`, **no shimmer** |
| `feedback` | `toaster` | **adapt CC** `composed/feedback/toaster/toaster.tsx` → `primitives/feedback/toaster/`: `visibleToasts={1}`, `position="bottom-center"` always, `duration={4000}`, no icon, no close button, bg `neutral-800`/`neutral-100` dark, text inverted, action ghost; export `Toaster`, `toast`, and `toastUndo({ text, onUndo, durationMs })` |
| `display` | `avatar` | **adapt CC**: `src/name/size: 32 \| 64/label`; fallback = up to two initials (`getInitials` from `@syn/utils`) in Geist 500 on `neutral-200`/`neutral-700`, radius full; Radix lifecycle kept (`delayMs={0}`) |
| `display` | `badge` | CLI; variants `outline` (hairline, 0.75rem) and `text` (no border) only — no filled variant; never a count (documented) |
| `display` | `empty` | CLI (parts: `Empty · EmptyHeader · EmptyTitle · EmptyDescription · EmptyContent`; `EmptyMedia` exported but unused) |
| `display` | `kbd` | CLI |
| `feedback` | `spinner` | CLI; 16px `currentColor`; `motion-reduce:animate-none` |
| `navigation` | `sidebar` | CLI as-is (CC's is the same output); `--sidebar-*` tokens already in the preset; `collapsible="none"` is the only mode Synapse uses |
| `navigation` | `bottom-nav` | **adapt CC** `primitives/navigation/bottom-nav/*`: add `active` → `aria-current="page"`, `dot?: boolean` + `dotLabel?: string` (6px `accent-500` after the label, visually-hidden text), `dimmed?: boolean` (0.55 opacity, `pointer-events-none`, `aria-hidden`), `padding-bottom: env(safe-area-inset-bottom)` |

Every folder: `index.ts` exporting the parts and types; a `<name>.stories.tsx` with `title: "Primitives/<Kind>/<Name>"`, one story per variant/state, an `Overview` matrix tagged `["!autodocs"]`; a top-of-file doc block (contexts, token bindings, gotchas) per CC §5. `packages/ui/src/index.ts` re-exports each folder; `package.json` `exports` gains one subpath per folder (`./button`, `./input`, … `./bottom-nav`, `./toaster`).

**States (exhaustive, per primitive, in the Overview story):** default · hover · active · focus-visible · disabled · error (where a control) · loading/busy (`button`) · open/closed (overlays) · light and dark via the toolbar.

**Failure / edge states:** a CLI `add` that writes outside `_shadcn/` (alias misconfigured) → fix `components.json`, delete the stray, re-run. A primitive whose CLI version imports `@/lib/utils` → rewrite the import to the relative `../../../lib/cn` (CC's rule: relative imports inside the package).

## Non-negotiables (this slice)

- **Nothing stays in `src/_shadcn/` after the ticket** except `.gitkeep`.
- **No accent fill anywhere.** `--primary` is ink; `button` has no accent variant by construction.
- **No red.** Error states are `ink` + words; `destructive` appears on one button variant only.
- **Every primitive has a story and an `index.ts`.** A primitive without both is not installed.
- **Relative imports inside `packages/ui`;** the `@syn/ui/*` path alias exists for the CLI only and is not used in source.
- **Radius `--radius` (6px) everywhere; `--radius-sheet` (10px) on sheets; `--radius-full` on avatars and the checkbox mark only.**

## Data & AI

**Schema changes: none.** **Tables:** none. **Placement:** `packages/ui/src/primitives/<kind>/<name>/` per the table; Vesper's call from the v2 handoff §5.0. **tRPC / validators:** none. **AI notes: None.** **Instrumentation: none.**

## Accessibility

- 44px targets on every interactive primitive (`button` sizes, `switch`, `checkbox`'s parent rule, addon buttons, menu items, radio rows).
- `aria-describedby` from `input`/`textarea`/`select` to helper/error; `aria-invalid` on error; `role="alert"` on error helper only.
- `size="icon"` buttons require `aria-label` — documented in the doc block and the story.
- Overlays: focus trap, Esc closes, focus returns to the opener (Radix defaults kept; do not override).
- Reduced motion: `tw-animate-css` classes gated with `motion-reduce:animate-none` as CC does.

## Acceptance criteria (observable)

1. `packages/ui/src/primitives/` contains exactly the folders in the re-slot table, each with `<name>.tsx`, `index.ts`, and `<name>.stories.tsx`; every `cva()` lives in a sibling `.variants.ts`.
2. `packages/ui/src/_shadcn/` contains only `.gitkeep`.
3. `packages/ui/package.json` has one `exports` subpath per primitive folder and `packages/ui/src/index.ts` re-exports each.
4. `grep -rn "bg-primary\b" packages/ui/src/primitives/control/button` shows the ink fill resolves from `--primary`, and no primitive uses a `--syn-accent-*` background. *(Vesper.)*
5. The `button` Overview story shows `default · secondary · ghost · destructive` × `sm · md · lg · icon` × `busy` in both themes; the `input` Overview shows `text · email · password · number · time · date` with label, helper, and error; the password story's Show/Hide is a text button. *(Vesper.)*
6. `Toaster` story: one toast visible at a time, bottom-centre, 4 s; `toastUndo` shows an action that fires `onUndo`.
7. `Avatar` story: two-initial fallback for "Taylor Aucoin" → "TA"; image fallback swap does not reflow.
8. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build`, `yarn ui:build-storybook` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The CLI's `sidebar` install pulls `sheet`, `tooltip`, `separator`, `skeleton`, `input`, `button` — run it last so the earlier installs' re-slots are in place and the CLI does not re-write them; if it does, re-slot again.
- `sonner`'s CLI output is a `Toaster` wrapper reading `next-themes`; CC's replaces the theme prop with class-driven tokens. Keep CC's approach.
- Vaul's `Drawer` needs `shouldScaleBackground={false}` to avoid the iOS scale effect the spec never asks for.

## Dev's call

Story naming beyond the `Primitives/<Kind>/<Name>` prefix · whether `badge`'s two variants are `cva` variants or two exports · the doc-block wording.

## Out of scope

- **Every composed component in v2 handoff §5.2–§5.10** (`ResponsiveSheet`, `ItemRow`, `StatusLine`, `Stepper17`, …) — the feature epics' tracks, which cite the handoff by entry.
- **`EmojiPicker`, `SearchField`, `SegmentedControl`, `EllipsesMenu`, `LoadingText`, `EmptyState`** — CC composites the handoff reuses; they land with the first feature ticket that needs them, not here.
- **The `_shadcn` staging folder's removal** — never; it stays as the CLI's landing zone.

## Depends on

- **INF-3** — tokens, `cn`, `Text`, Storybook. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet**, with Opus only if the CLI output diverges from what the spec anticipates (a renamed component, a Base-UI default). The work is wide and mechanical against a precise table; the review is Vesper's.

---

### Build kickoff (paste into the session)

> Build **INF-4 — shadcn primitives** (attached spec). Model: **Sonnet**. **Install the named set through the staging alias, re-slot every file into `primitives/<kind>/<name>/`, skin to the tokens, story everything — no accent fills, no red, no `components/ui`.**
> Attach/read first, in order: this spec · `docs/ux/synapse_ui_component_needs_and_handoff_v2.md` §2.3–§2.7, §5.0, §6.1, §6.3 · CC `docs/ai-guides/component-guidelines.md` §1, §3, §4, §5, §6, §9 · CC `packages/ui/src/primitives/{control/input,control/textarea,control/switch,control/checkbox,display/helper-text,display/avatar,display/skeleton,navigation/bottom-nav,layout/sheet,feedback/dialog,feedback/alert-dialog,layout/collapsible,control/select,control/toggle-group}/*` · CC `packages/ui/src/composed/feedback/toaster/*` · CC `packages/ui/package.json` (the exports shape) · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Run the five `add` commands in order; move each file; extract variants; add index + story; skin per the table. Close in three places; run `yarn lint && yarn lint:boundaries && yarn check-types && yarn build && yarn ui:build-storybook`.
