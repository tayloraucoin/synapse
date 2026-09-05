# Synapse — UI Component Needs & Design→Dev Handoff List, v2

**Author:** Vesper (UX), prepared as the joint UI/UX working document
**Date:** 4 Sept 2026
**Supersedes:** `synapse_ui_component_needs_and_handoff.md` (v1, 4 Sept 2026). This is a complete replacement, not a diff. Nothing in v1 needs to be read alongside it.
**Inputs:** official UX spec v1 (§3 data model, §5.9 state matrix, §9 brand, §9.7 variable map, §10 copy); Epic 1 §12, Epic 2 §11, Epic 3 §9, cross-cutting §12 inventories; and — new in v2 — the Conscious Connections codebase at `~/lighthouse/conscious-connections/conscious-connections` (read-only), specifically `docs/architecture/codebase-conventions.md`, `docs/architecture/tech-stack.md`, `docs/ai-guides/{component-guidelines,classnames,copy-conventions,typography-guidelines}.md`, `docs/build-instructions/ui/ui-build-specs.md` Part E, `packages/config/tailwind/preset.css`, `packages/ui/src/**`, `apps/toolkit/{AGENTS.md,app,components,lib}/**`, and the CC-specific Vesper role prompt at `docs/roles/product-design/`.
**Outputs:** (1) the shadcn review re-verified against what CC actually installs (§2); (2) CC's real convention stated as rules, and every Synapse component mapped onto it (§3); (3) per-screen UI needs reconciled with what CC already solved (§4); (4) the full component list with TypeScript props contracts (§5); (5) the install script and the token file (§6); (6) the Phase-1 build order with the critical path (§7); (7) the screen-by-screen parity checklist (§8); (8) counts (§9); declared divergences (§10); blocking questions (§11).

**Role-prompt note.** The CC repo carries a Conscious Connections–specific Vesper prompt (`docs/roles/product-design/Vesper—ux-ui-designer-role-prompt.md`). It binds CC's brand (velvet-and-candlelight, sharp corners, Cormorant/Jost) and CC's handoff v1.3 rationale log. None of that transfers: Synapse's brand is the official spec §9. What does transfer is the working method — one treatment per promise, states are the spec, buildability test — which the universal Vesper prompt already carries. Where the two prompts differ, the universal one governs this document.

---

## 0. How to read this document

- **Status vocabulary.** Every component in §5 carries `Status: reuse | adapt | build new`. *Reuse* means CC's file is copied into the Synapse repo with token names swapped and nothing else. *Adapt* means the structure and contract are kept and the named changes are made. *Build new* means CC has nothing that fits, and the entry says why. "Reuse" never means importing `@cc/ui` as a package — CC's primitives are skinned in CC's brand tokens, and its `darkBackground` register machinery is a marketing-site concern Synapse doesn't have. Copy-and-adapt is the honest mechanism; see §11 Q1 for the one structural question this hides.
- **Labels.** `[VESPER CALL]` marks a judgement I made where the UX docs are silent, with its cost if wrong. `[ASSUMPTION]` marks a fact about the codebase or stack I could not verify. `[PROPOSED — needs sign-off]` marks a value that touches something a UX doc flagged open.
- **Tokens by name only.** No hex anywhere except §6.2, which *is* the token file. Names: `paper`, `ink`, `neutral-{50…900}`, `accent-{100…800}`, `violet-{100…800}`, `cat-{key}-{100|500|700}`, `destructive`. Category 200/800 steps are not in the spec — see §11 Q2.
- **Sizes** in px for targets and rem for type, matching official spec §9.4–§9.5. Spacing is the 4·8·12·16·24·32·48 scale, exposed as `--space-1…--space-7` (§6.2) in CC's idiom.
- **Screen IDs** refer to the four UX documents: `AU/FR/LB/CT/TP/WK/ST` (Epic 1), `SH/LS/DH/IT/SC/SF/TR/PN` (Epic 2), `RV/DR/WR/HS` (Epic 3), `SY` (cross-cutting).

---

## 1. Method and rules

Carried from v1, with two amendments from reading CC.

1. **shadcn is the base, not the ceiling.** Every component is either a shadcn primitive used as installed (token values changed via the variable map) or a composite built from those primitives. No parallel primitives. If a shadcn component is nearly right, compose over it rather than fork it.
2. **CC is the shape, Synapse is the appearance.** CC governs folder taxonomy, file naming, export style, props typing, variant handling, barrels, client/server boundaries, where types and hooks live, and how a composite that owns state is structured. Synapse's official spec §9 governs every visible value. Where CC's *visual* code is quoted below it is as structure to copy, never as a look to copy.
3. **One component, one contract.** If a component appears on two screens with different behaviour, it is two variants of one component, not two components. Variants are typed props (`variant`, `size`, `mode`, `layout`), never a `classes` override — that is CC's rule (component-guidelines §1.3) and it holds here.
4. **Non-standard means: no shadcn primitive and no CC composite does this.** For those, §4 gives the shorthand directions and §5 fixes one. Where CC already solved it, §4 says so and the shorthand is gone.
5. **Both themes, always.** Every component is specified in light and dark by token. Dark mode is class-strategy (`.dark` on `<html>`) via `next-themes`, exactly as CC wires it (`packages/ui/src/providers/theme-provider.tsx`).
6. **Copy is fixed by the UX docs and lives in `copy.ts`.** New from CC (copy-conventions.md): every composed component that owns strings ships a co-located `copy.ts` exporting an `as const` object, and props override it. Every string in the four UX docs has a home this way, and the "if a string isn't in the doc it doesn't exist" rule becomes lintable.
7. **Every `ui/` component has a story.** New from CC (component-guidelines §6): Storybook-first, theme via the toolbar, one story per variant plus an Overview matrix. Data-bound composites in `components/` and `app/**/_components/` do not get stories; they are exercised in the app. `[VESPER CALL: Synapse has no Storybook today; adding `@storybook/react-vite` with CC's `withThemeByClassName` toolbar is a half-day and the biggest single lever against UI drift. Cost if wrong: the same states get verified by hand on a `/dev/components` route instead — slower, not blocking.]`

---

## 2. What shadcn/ui gives us — re-verified against CC's actual install

### 2.1 What CC actually has (facts, not the docs)

- **No `components.json`.** CC never ran the shadcn CLI. Every primitive was vendored by hand into `packages/ui/src/primitives/<kind>/<name>/` and hand-edited. Consequence: CC's "installed" set is whatever it needed, not the catalogue, and several primitives carry local modifications that are convention signals (below).
- **Base: Radix.** `@radix-ui/react-{accordion,alert-dialog,avatar,checkbox,collapsible,dialog,dropdown-menu,popover,radio-group,select,separator,slider,slot,toggle,toggle-group,tooltip}` in `packages/ui/package.json`. No Base UI anywhere. v1's assumption holds; the recommendation stands (§2.2).
- **Output era: pre-`data-slot` shadcn** on most primitives (`React.forwardRef` + `displayName`, `tailwindcss-animate` `animate-in/out` classes, `z-50 bg-black/50` overlays), with `Sidebar` and `Empty` from the newer `data-slot` output. So CC is not on one CLI version — it is on "whatever was current when each was vendored". For Synapse this means the CLI's *current* output is acceptable as-is; matching CC's forwardRef era is not a requirement (§10 D3).
- **Styling stack:** Tailwind v4 CSS-first (`@theme inline` bridge in `preset.css`), `@custom-variant dark (&:is(.dark, .dark *))`, CVA in `*.variants.ts`, `cn()` = clsx + tailwind-merge at `packages/ui/src/lib/cn.ts`. `lucide-react` for icons. `sonner` for toasts. `frimousse` for the emoji picker. `react-day-picker` for the calendar (unused by Synapse). `next-themes` (patched). `embla-carousel` (unused by Synapse). No `vaul`, no `cmdk`, no `@radix-ui/react-tabs`, no `@radix-ui/react-switch`, no `@radix-ui/react-scroll-area`, no `@radix-ui/react-progress`. No crop library — images are re-encoded through a canvas (`apps/toolkit/lib/image/reencode.ts`) and fitted with `object-fit: cover`.
- **Locally modified primitives (convention signals):**
  - `Input` (`primitives/control/input/input.tsx`) folds **label, helper text, error, and a `mode` union** (`text | email | phone | number | money | password | date | time`) into the primitive; `mode="password"` renders a **text** *Show/Hide* button, not an icon; `id`/`aria-describedby`/`aria-invalid` are wired internally. This is why CC has no `field` primitive: the field contract lives on the control. `Textarea` and `SelectField` follow the same shape. **Adopted for Synapse** (§2.5).
  - `Switch` is a **native `<button role="switch">`**, no Radix dep. Adopted.
  - `Collapsible`, `Dialog`, `SheetPanel`, `ConfirmDialog`, `SelectField`, `Table` are **prop-based default exports** over the shadcn parts (component-guidelines §9): callers pass `open/title/description/footer/children`, not DOM. Adopted as the wrapper style for every Synapse overlay.
  - `Avatar` replaces the fallback with a brand mark; `Skeleton` adds a shimmer class; `Badge` carries brand variants; `ToggleGroup` adds a `variant: chip | button` axis and a `label`. Structure reused, skins replaced.
  - `Toaster` wraps Sonner with a position switch at 768px and 5 s duration.
- **Composites CC has that Synapse needs** (harvested in §5): `SideChannelDrawer` and `DrawerDialog` (responsive sheet, breakpoint-switched), `ConfirmDialog`, `EmptyState` + `Empty` parts, `AutosaveBanner` (save-status union), `SearchField`, `SegmentedControl<T>`, `EllipsesMenu`, `Timestamp`, `Text`/`Headline`/`Sub`/`Microcopy`/`MetaLine` typography primitives, `HelperText`, `Label`, `LoadingText`, `TextDisclosureButton`, `BottomNav*`, `Sidebar*`, `StepNav`, `EmojiPicker`, `CheckboxField`, `PageHeader`, `ProgressHairline`; and in the toolkit app: `AvatarPicker` + `useAvatarUpload`, `InstallBanner`/`InstallPrompt` + `useInstallPrompt` + `install-detection.ts` + `push-subscribe.ts` + `service-worker-registration.tsx` + `manifest.ts`, `DeviceAlertsRow`, `NotificationToggles`, `SettingsRootList`, `SignOutRow`, `SessionStatusBar`, `RegionRetry`, `useLeaveGuard`, `useLocalDraft`, `useRememberedToggle`, `useCaptureElapsed`, `useMediaQuery`/`useIsDesktop`, `entryStateToRoute`, `lib/routes.ts`.

### 2.2 Base recommendation

**Stay on Radix.** Reasons: (a) every CC wrapper we harvest is written against Radix parts; (b) Vaul (the `drawer`) and cmdk are Radix-shaped; (c) the current shadcn CLI still ships a Radix base. Cost of Base UI instead: none of §5's *reuse/adapt* entries for overlays, menus, toggles, or selects survive — roughly 20 entries become *build new* — and the drawer has no Base UI equivalent. Nothing in Synapse needs Base UI's differences.

### 2.3 Install strategy (how "as CC installs them" is honoured in a fresh repo)

CC vendored by hand; Synapse starts from nothing. The reconciliation: **the shadcn CLI fetches the primitive code; a one-time re-slot moves each file into CC's folder shape** (§3.2). `components.json` points the `ui` alias at a staging folder (`ui/_shadcn/`) so later `add` calls never write into the re-slotted tree. `[VESPER CALL: this trades the CLI's diff/update commands (which lose track of moved files) for CC's exact layout. CC never used the CLI at all, so nothing is lost that CC had. Cost if wrong: a primitive update is a manual copy, which is what CC does today.]` Full script in §6.1.

### 2.4 Use as installed (token overrides only)

Names are current CLI names; the parenthetical says whether CC has it and in what shape.

`button` (CC: yes, brand-skinned; we install fresh and re-skin) · `input` (CC: yes, **modified** — we adapt CC's, not the CLI's; §5.1) · `textarea` (CC: modified — adapt CC's) · `label` (CC: yes) · `checkbox` (CC: yes + `CheckboxField`) · `radio-group` (CC: yes) · `select` (CC: yes + `SelectField`) · `native-select` (CC: no — install; timezone on compact) · `sheet` (CC: yes + `SheetPanel`) · `drawer` (CC: no — install; §10 D2) · `dialog` (CC: yes, prop-based) · `alert-dialog` (CC: yes + `ConfirmDialog`) · `popover` (CC: yes) · `dropdown-menu` (CC: yes + `EllipsesMenu`) · `tooltip` (CC: yes) · `collapsible` (CC: yes, prop-based) · `toggle-group` (CC: yes, variant/label axis) · `separator` (CC: yes) · `skeleton` (CC: modified — we remove the shimmer) · `sonner` (CC: `Toaster` wrapper — adapt) · `avatar` (CC: modified fallback — adapt) · `badge` (CC: yes) · `tabs` (CC: no — install; icon picker only) · `input-group` (CC: has its own textarea-oriented one; we install the CLI's addon-style one for minutes/units) · `empty` (CC: yes, identical) · `kbd` (CC: no — install; shortcuts list) · `spinner` (CC: no — install; inline button spinner per AU-01) · `sidebar` (CC: yes, `data-slot` era, identical to CLI).

### 2.5 Installed but constrained

- `button`: variants `default` (ink fill) · `secondary` (outline) · `ghost` (text) · `destructive` (one place). The accent never fills a button — enforced by not defining an accent variant. Variant *names* follow official spec §9.7 (shadcn names), not CC's `fill/outline/link` (§10 D4). Size `icon` is 44×44 and requires `aria-label`, as CC's does.
- `input` / `textarea` / `select`: the CC shape — `label`, `helperText`, `error`, `mode` on the control; **no separate `field` primitive is installed**. Non-input controls (Stepper17, SegmentedControl, RangeInput, TimeField) compose `Label` + `HelperText` in the same order with the same `aria-describedby` wiring.
- `badge`: only as the base for `CategoryChip` and `Tag`; never a count.
- `tabs`: the icon picker's three panes only. The app tab bar is `bottom-nav` (CC primitive) + a route-aware leaf, not Tabs.
- `drawer`: compact side of `ResponsiveSheet` only; never opened directly.
- `input-group`: minutes/unit fields only; the password Show/Hide is CC's `Input mode="password"`.
- `sonner`: `visibleToasts={1}`, bottom-centre on both layouts (§10 D5), no icon, no close button, action only.

### 2.6 Not used (and not installed)

`field` (CC's control-owned field contract replaces it) · `item` (CC builds rows from `ul.divide-y` + `Link`/`button`; `ListRow` does the same — §5.5) · `button-group` (a `role="group"` flex of Buttons) · `scroll-area` (native `overflow-y-auto`, as CC) · `progress` (export "preparing" is `LoadingText`, as CC's export does) · `combobox` / `command` (PickerList is `SearchField` + a listbox — no cmdk) · `accordion` (Collapsible covers it) · `alert` (CC uses it for its status strip; Synapse's StatusLine is not an alert — §5.3) · `slider` (spec §9.7: no sliders; CC's `ScaleField` is a slider and is explicitly not reused) · `calendar` / `date-picker` (native `type=date`) · `breadcrumb` · `navigation-menu` · `menubar` · `context-menu` · `hover-card` · `input-otp` · `carousel` · `aspect-ratio` · `table` / `data-table` · `chart` · `pagination` · `resizable` · `toast` · `typography` · `direction` · `card`.

### 2.7 CC-origin primitives adopted (not in the shadcn catalogue)

`helper-text` (CC `primitives/display/helper-text`) · `switch` (CC's native one, in place of the CLI's Radix one) · `text` (CC `primitives/typography/text` — variant/tone axes; re-scaled to Synapse §9.4, §5.1) · `bottom-nav` (CC `primitives/navigation/bottom-nav`) · `checkbox-field` (CC sibling of checkbox).

### 2.8 What nothing provides, which we build

A native-time field with day-zone display · a 1–7 stepper · a bounded minutes stepper · a from/to range pair · a curated-icon grid and a 1:1 crop step (the emoji pane is CC's `EmojiPicker`) · a status line · the item row · the schedule axis, now line, blocks, ghosts, bands · the timer control and display · the growing three-step sheet · the habit strip · the big-number-with-sentence · the category bar · the step frame · the weekday chips · the colour swatch row · the tier rows · the decision panel · the picker list. All in §5.

---

## 3. Directory convention — CC's real rules, mapped onto Synapse

### 3.1 The structural decision first: one app, CC's layering inside it

CC is a Turborepo (`apps/toolkit`, `apps/marketing`, `packages/{ui,hooks,utils,types,constants,validators,…}`). Synapse is a single `create-next-app` at the repo root (Next 16.3, React 19, Tailwind v4, no `src/`, `@/*` → `./*`). CC's own first rule decides placement by *who imports this*: one app → in the app; two apps or mobile → `packages/`. Synapse has one app and no mobile seam declared.

`[VESPER CALL: keep Synapse a single app and mirror CC's layering *inside* it — `ui/` at the repo root is what `packages/ui/src/` is in CC, and `lib/`, `components/`, `types/` are what `apps/toolkit/{lib,components,types}` are. Nothing else changes. Cost if wrong: if Taylor wants a Turborepo from day one, every path in §5 gains an `apps/web/` prefix and `ui/` becomes `packages/ui/src/`; the contracts, folders-within-`ui/`, and file names are unchanged. This is a rename pass, not a rewrite.]` See §11 Q1 for the one variant of this question that would change more.

### 3.2 The rules, as rules

Each rule cites the CC source so it can be checked.

**R1 — Four tiers, decided by "who imports this?"** (conventions §1.1, §3.1, §8.3)

| Tier | Path | What belongs | Story? |
|---|---|---|---|
| Primitive | `ui/primitives/<kind>/<name>/` | shadcn-installed parts plus CC-style prop-based wrappers in the same folder (`SheetPanel` lives in `sheet/`) | yes |
| Composed | `ui/composed/<kind>/<name>/` | presentational composites: props in, callbacks out, no data fetching, no app imports | yes |
| App-level shared | `components/<name>/` or `components/<name>.tsx` | data-bound composites used by **two or more routes** (a sheet that mutates, a canvas that autosaves, the shell) | no — exercised in the app |
| Feature-local | `app/<route>/_components/<name>.tsx` or `…/_components/<feature>/` | single-route client leaves and feature folders | no |

A composite is promoted from feature-local to `components/` on its second route, and from `components/` to `ui/composed/` only if it is presentational (conventions §8.3). Never pre-promote.

**R2 — `<kind>` is by kind, not by feature** (`packages/ui/src/{primitives,composed}/` on disk). Kinds in use in CC: `control` (takes input), `display` (shows), `feedback` (status, loading, empty, toast), `layout` (frames, sheets, dialogs, sections), `navigation`, `typography`, `brand`, `icons`, `media`, and domain-specific `auth`, `legal`. Synapse uses `control · display · feedback · layout · navigation · typography` and adds nothing. v1's `day/ schedule/ setup/ review/` folders are gone; that grouping survives only in the build order (§7) and the parity checklist (§8). CC's precedent for domain composites in kind folders: `composed/display/insight-card`, `composed/display/agreement-table`, `composed/display/person-profile-card`.

**R3 — One folder per component** (component-guidelines §4; conventions §4.5):

```
ui/composed/display/item-row/
  item-row.tsx            # the component; props interface directly above it
  item-row.variants.ts    # optional — cva() variant defs
  item-row.stories.tsx    # mandatory in ui/
  copy.ts                 # optional — default strings, as const
  index.ts                # export { ItemRow, type ItemRowProps, type ItemRowClasses }
```

Sub-parts that only this component uses are siblings in the folder (`checkbox-field.tsx` beside `checkbox.tsx`; `admin-sidebar-nav-item.tsx` beside `admin-shell.tsx`). A feature folder in `app/**/_components/` may grow `components/`, `hooks/`, `utils/`, `types.ts`, `constants.ts` subfolders (CC precedent: `app/(app)/couple/profile/answers/_components/answer-sheet/`).

**R4 — Filenames are kebab-case, always; identifiers keep their casing** (conventions §7). `item-row.tsx` exports `ItemRow`; `use-item-timer.ts` exports `useItemTimer`; `item-row.variants.ts` exports `itemRowVariants`. Dynamic segments kebab inside brackets (`[date]`). Private folders `_components/`, `_actions/`, `_lib/`. Route groups `(auth)`, `(setup)`, `(shell)`.

**R5 — Named exports only** (conventions §8.3). Default exports exist only where Next.js forces them (`page.tsx`, `layout.tsx`, `manifest.ts`, `error.tsx`). Both CC shapes are acceptable and both appear: `export function X(props: XProps)` inline (app code, most composites), or `function X` / `React.forwardRef` … `X.displayName = "X"` … `export { X }` at the bottom (primitives). Rule: **primitives** use the bottom-export form with `displayName`; **composites and app code** use `export function`. `displayName` is set on every forwarded component.

**R6 — Props are `interface`s with the `Props` suffix, declared directly above the component** (conventions §8.2; component-guidelines §1). Never `React.FC`. Extend the underlying element or Radix part (`React.ComponentProps<"input">`, `React.ComponentPropsWithoutRef<typeof Primitive.Root>`) and `Omit` only conflicting keys. Every component accepts `className?: string` and, where it has sub-parts, `classes?: XClasses` — a sibling `interface XClasses { root?: string; label?: string; … }` keyed by DOM part — merged as `cn(base, classes?.part, className)` so the caller wins. `classes` is for one-off layout; **design-system variants are typed props** (`variant`, `size`, `mode`, `layout`), never a `classes` override. Generic props are fine where they type a value (`SegmentedControlProps<T extends string>`).

**R7 — Variants via `cva` in a sibling `.variants.ts`, merged with `cn()`** (conventions §8.3; component-guidelines §1). `cn` lives at `ui/lib/cn.ts` and is imported as `@/ui/lib/cn` (CC: `@cc/ui/cn`). Chunk order inside `cn()`: base → responsive → states → motion/a11y → conditionals; tokens alphabetised within a chunk (classnames.md). Design-token spacing uses the parenthetical form `gap-(--space-4)`, never Tailwind's numeric scale (`gap-4`), because the scales diverge; `h-11`/`min-h-11` stays for the 44px target. Vertical stacks are `flex flex-col gap-(--space-N)` on the parent, not `space-y`, because typography primitives ship `m-0`.

**R8 — State unions are exported named types, one per axis, declared beside the component or in `types/`** (CC: `export type ButtonVariant = "fill" | …`; `TEXT_VARIANTS as const` + `(typeof TEXT_VARIANTS)[number]`). Spelling rule: a union that mirrors the schema keeps the schema's spelling (`"not_assigned"`, `"cut_by_shift"`, `"pending_review"` — CC precedent `NotificationType`); a purely presentational union is kebab-case (`"done-off-schedule"`, `"link-editorial"`). The Synapse unions are fixed in §3.5.

**R9 — Client/server** (conventions §3, §7.3, §8.3). Server Components are the unmarked default. A client component has `"use client"` as the first statement (CC's `ui/` files put the top-of-file doc block before it; app files put it on line 1) and, in `app/`, lives in `_components/`. No `.client.tsx` suffix. Push the client boundary to the leaf: a `page.tsx` is a server shell that fetches and hands data to client leaves.

**R10 — Where things live** (conventions §5, §11):

| Thing | Synapse path | CC analogue |
|---|---|---|
| Presentational vocabulary | `ui/` | `packages/ui/src/` |
| `cn()`, `useMediaQuery` (web-only UI helpers) | `ui/lib/` | `packages/ui/src/lib/` |
| Theme provider, `usePrefersReducedMotion` | `ui/providers/`, `ui/hooks/` | same |
| Token file and global CSS | `ui/styles/tokens.css`, `ui/styles/globals.css` | `packages/config/tailwind/preset.css`, `packages/ui/src/styles/globals.css` |
| Domain unions and view-model types shared across routes | `types/` | `packages/types/src/` + `apps/toolkit/types/` |
| A single component's prop types | inline in its `.tsx` | same |
| A feature's several view types | co-located `*.types.ts` / `types.ts` | same |
| Runtime constants (limits, storage keys, durations in JS) | `lib/constants/` | `packages/constants/src/` |
| Zod schemas (forms and API share one) | `lib/validators/` | `packages/validators/src/` |
| Pure helpers (time formatting, adherence maths) | `lib/utils/<domain>.ts` — grouped by domain, never `helpers.ts` | `packages/utils/src/` |
| Web-only hooks (media query, PWA, timers, leave guard, drafts) | `lib/hooks/use-*.ts` | `apps/toolkit/lib/hooks/` |
| Data hooks (queries, mutations, optimistic updates) | `lib/hooks/use-*.ts` | `apps/toolkit/lib/hooks/` (e.g. `use-session-messages.ts`) |
| Typed route builders | `lib/routes.ts` — `todayRoute()`, `dayRoute(date)`, `reviewDayRoute(date)`; never a hardcoded path in a component | `apps/toolkit/lib/routes.ts` |
| Entry decision tree (cross-cutting §4.2) | `lib/entry/resolve-entry.ts` | `apps/toolkit/lib/onboarding/entry-state-to-route.ts` |
| PWA plumbing | `lib/pwa/{install-detection,push-subscribe,use-install-prompt}.ts`, `app/manifest.ts`, `public/sw.js`, `app/_components/service-worker-registration.tsx` | same names in the toolkit |
| Copy defaults | `copy.ts` beside the composed component | same |

**R11 — A composite that owns state is a feature folder with a headless hook** (CC precedent: `answer-sheet/` = `answer-sheet.tsx` + `hooks/use-answer-sheet.ts` + `components/*` + `types.ts` + `constants.ts` + `utils/*`). The hook owns queries, mutations, drafts, dirty state, and dialogs' open flags and returns a flat object; the component renders presentational children from `ui/` and threads the hook's values down as props. No business rule lives in a component body. For Synapse: `ItemSheet`, `ShiftSheet`, `TrimSheet`, `TemplateEditor`, `WeekGrid`, `DaySheet`, `HabitForm`, `DayReview` are this shape (§5.6–§5.9).

**R12 — Forms** (component-guidelines §8; `packages/hooks/src/use-zod-form.ts`). React Hook Form + `zodResolver` through `useZodForm({ schema })`; errors reach controls via `fieldErrorProps(formState, "name")`. Synapse's Epic 1 §0.3 rule ("validate on submit, then live per field once erred") maps to `useZodForm({ schema, mode: "onSubmit", reValidateMode: "onChange" })` — the hook already exposes both overrides; CC's blur-first default is *not* used (§10 D6). Submit-button gating by `schema.safeParse(watch())` stays permitted.

**R13 — Copy** (copy-conventions.md). Strings live in `copy.ts` as `export const ITEM_SHEET_COPY = { … } as const`, exported from the component's `index.ts`, overridable by props. No inline prose in components; no strings in `lib/constants/`.

**R14 — Stories** (component-guidelines §6). `title: "Composed/Display/ItemRow"` (mirrors the folder), `satisfies Meta<typeof ItemRow>`, one story per variant/state plus an `Overview` matrix tagged `["!autodocs"]`, theme via the toolbar, `parameters.layout` for width. State matrices (the fifteen item states) are one Overview story each.

**R15 — Accessibility floor on controls** (component-guidelines §7, tightened to the official spec §11): focus-visible ring `2px accent-500, offset 2px` (CC uses 3px offset; Synapse's spec says 2px — the token file sets it once, §6.2); `aria-describedby` from field to helper/error; `aria-invalid` when `error` is set; icon-only controls carry `aria-label`; targets ≥ 44px; motion honours `prefers-reduced-motion` via tokens.

### 3.3 The Synapse tree

```
synapse/
├── app/
│   ├── layout.tsx                      # fonts (Geist, Newsreader), ThemeProvider, Toaster, SW registration
│   ├── globals.css                     # @import "tailwindcss"; @import "../ui/styles/tokens.css"; @import "../ui/styles/globals.css"
│   ├── manifest.ts
│   ├── (auth)/{signin,signup,verify,forgot,reset,invite}/page.tsx + _components/
│   ├── (setup)/setup/[step]/page.tsx + _components/
│   ├── (shell)/                        # the signed-in frame: layout.tsx renders AppShell
│   │   ├── layout.tsx
│   │   ├── _components/{app-shell,tab-bar,rail,status-line-slot}.tsx
│   │   ├── today/page.tsx · today/schedule/page.tsx
│   │   ├── day/[date]/page.tsx · day/[date]/schedule/page.tsx · day/[date]/item/[id]/page.tsx
│   │   ├── review/page.tsx · review/day/[date]/page.tsx · review/week/[week]/page.tsx · review/week/[week]/habit/[id]/page.tsx · review/history/page.tsx
│   │   └── settings/{page.tsx, account, habits, habits/[id], templates, templates/[id], week, week/[week], categories, reasons, notifications, day, appearance, data, share, about}/page.tsx + _components/
│   ├── _components/                    # app-wide leaves used from the root layout (service-worker-registration, update-line)
│   ├── api/**/route.ts                 # export download, avatar upload, push subscribe (per tech spec)
│   └── auth/callback/route.ts
├── components/                         # app-level shared, data-bound (2+ routes)
│   ├── item-sheet/ · shift-sheet/ · trim-sheet/ · day-header-sheet/ · one-off-sheet/
│   ├── habit-form/ · template-editor/ · week-grid/ · day-sheet/ · slot-sheet/
│   ├── day-review/ · traded-up-picker/
│   ├── icon-picker/                    # data-bound because of the upload leg
│   └── install-sheet.tsx · sync-issues-sheet.tsx · session-expired-dialog.tsx · timezone-switch-dialog.tsx
├── ui/                                 # = CC packages/ui/src
│   ├── _shadcn/                        # CLI staging only; empty after re-slot; git-ignored except .gitkeep
│   ├── primitives/{control,display,feedback,layout,navigation,typography}/<name>/
│   ├── composed/{control,display,feedback,layout,navigation}/<name>/
│   ├── hooks/use-prefers-reduced-motion.ts
│   ├── lib/{cn,use-media-query}.ts
│   ├── providers/theme-provider.tsx
│   ├── styles/{tokens,globals}.css
│   └── index.ts                        # barrel — the public vocabulary
├── lib/
│   ├── routes.ts · entry/resolve-entry.ts
│   ├── hooks/use-*.ts                  # web-only + data hooks
│   ├── constants/{limits,storage-keys,motion}.ts
│   ├── validators/*.ts
│   ├── utils/{time,adherence,day-parts}.ts
│   └── pwa/{install-detection,push-subscribe,use-install-prompt}.ts
├── types/{domain,ui-state,view}.ts
├── public/{sw.js, icons/}
├── .storybook/{main.ts,preview.ts}
├── components.json
└── docs/ux/                            # this document
```

Layer order (low → high), enforced by convention until an ESLint boundaries rule is added: `ui/styles` → `types/` → `lib/utils`, `lib/constants` → `ui/` → `lib/hooks`, `lib/validators` → `components/` → `app/`. `ui/` never imports `lib/hooks`, `components/`, or `app/`. `[VESPER CALL: CC enforces this with `packages/config/eslint/boundaries.js`; a single-app equivalent is a `no-restricted-imports` rule on `ui/**` — cheap, and worth adding in the same ticket as Storybook.]`

### 3.4 Import style

- From app code: `import { ItemRow } from "@/ui";` (the barrel; CC apps do `import { Text } from "@cc/ui"`) or the direct path `import { ItemRow } from "@/ui/composed/display/item-row";` when tree-shaking matters. Both are fine; the barrel is the default.
- Inside `ui/`: relative imports only (`../../../lib/cn`), as CC does — the vocabulary must not depend on the app alias.
- Prettier import order (CC `prettier.config.mjs`): `server-only` → builtins → `react` → `next` → third-party → `@/` → relative. Double quotes, semicolons, trailing commas, 80 columns.

### 3.5 The Synapse type unions (fixed here; every §5 entry references them)

`types/domain.ts` — schema spelling (official spec §3):

```ts
export type ItemType = "habit" | "task_appointment" | "deep_work";
export type TimeMode = "fixed_time" | "window" | "unscheduled";
export type Scheduling = "hard" | "soft";
export type AssignmentState = "assigned" | "not_assigned" | "cut_by_shift";
export type CompletionState =
  | "upcoming" | "active" | "done" | "missed" | "carried" | "pending_review";
export type MissTier = "circumstance" | "scoping" | "chose_not_to";
export type ItemOrigin = "template" | "one_off" | "carried" | "calendar_import";
export type CategoryKey =
  | "leaf" | "sky" | "clay" | "rose" | "amber" | "slate" | "plum" | "moss";
export type IconValue =
  | { kind: "emoji"; value: string }
  | { kind: "curated"; value: string; colorKey: CategoryKey | null }
  | { kind: "image"; value: string };          // storage path; URL resolved by the caller
export type TimerSessionSource = "timer" | "manual";
```

`types/ui-state.ts` — presentational, derived, kebab-case:

```ts
/** Official spec §5.9 row/block matrix + Epic 2 §2 additions. Derived per render, never stored. */
export type ItemState =
  | "upcoming" | "soon" | "now" | "open" | "closing" | "active" | "passed"
  | "done" | "done-off-schedule" | "deferred" | "carried"
  | "not-assigned" | "cut-by-shift" | "missed" | "pending-review";
export type MultitaskPosition = "none" | "first" | "middle" | "last";
export type StateWordKind =
  | "now" | "soon" | "open" | "closing" | "moved" | "from" | "not-today"
  | "add-unit" | "updated" | "pending" | "archived";
export type DayMode = "live" | "record" | "plan";                 // cross-cutting §8.2
export type Layout = "compact" | "wide";                          // one break at 768px
export type SaveStatus = "idle" | "saving" | "saved" | "retrying" | "failed";
export type ReviewMode = "live" | "pending" | "edit";
export type DecisionState =
  | "undecided" | "deciding" | "decided" | "pending" | "resolved-by-shift" | "changed";
export type StripState =
  | "done" | "done-moved" | "not-counted" | "half" | "didnt-do" | "not-assigned" | "pending";
export type TimerStatus = "idle" | "running" | "paused";
export type StatusLineVariant =
  | "offline" | "syncing" | "sync-issues" | "setup" | "pending-review" | "late-offer"
  | "update" | "timezone" | "install" | "permission";
export type PermissionState =
  | "granted" | "denied" | "not-asked" | "unsupported" | "not-installed";
export type ShiftStep = 1 | 2 | 3;
```

`types/view.ts` — the view models presentational composites receive (the caller maps schema rows to these; `ui/` never sees a DB row):

```ts
import type { CategoryKey, IconValue, ItemOrigin, ItemType, TimeMode } from "./domain";
import type { ItemState, MultitaskPosition } from "./ui-state";

export interface CategoryView { key: CategoryKey; name: string }

export interface DayItemView {
  id: string;
  title: string;
  icon: IconValue;
  type: ItemType;
  category: CategoryView | null;
  timeMode: TimeMode;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  originalScheduledStart: Date | null;
  durationMin: number | null;
  priority: number;                       // resolved, 1–7
  scheduling: "hard" | "soft";
  origin: ItemOrigin;
  carriedFromLabel: string | null;        // "Thu"
  doneAt: Date | null;
  quantityUnit: string | null;
  quantityValue: number | null;
  timerElapsedSec: number | null;         // when active
  state: ItemState;
  multitask: MultitaskPosition;
}

export interface SlotView {
  id: string;
  habitId: string;
  title: string;
  icon: IconValue;
  timeMode: TimeMode;
  startClock: string | null;              // "7:20", already anchored + formatted
  endClock: string | null;
  durationMin: number;
  priority: number;
  overridden: boolean;
  scheduling: "hard" | "soft";
  multitask: MultitaskPosition;
}

export interface HabitSummaryView {
  id: string; title: string; icon: IconValue; type: ItemType;
  category: CategoryView | null; durationMin: number | null; durationMax: number | null;
  lifePriority: number; isWakeAnchor: boolean; archived: boolean;
}

export interface TemplateSummaryView {
  id: string; name: string; itemCount: number; totalMin: number;
  typicalDays: ReadonlyArray<0 | 1 | 2 | 3 | 4 | 5 | 6>;  // Mon = 0
  weeklyTarget: number | null; usedThisWeek: number; archived: boolean;
}

export interface ReasonView { key: string; label: string; tier: "circumstance" | "scoping" | "chose_not_to"; builtIn: boolean }
```

---

## 4. Per-screen UI needs — reconciled

Format per screen: **standard** (shadcn as installed) · **composed** (ours, from primitives) · **CC solves** (path, and reuse/adapt) · **non-standard** (only where nothing in CC applies; the pick is marked `→`). Screen IDs refer to the epic documents. Paths under `CC:` are relative to `packages/ui/src/` unless they start with `apps/`.

### 4.1 Auth (AU-01…06)
- Standard: `input` (email — `mode="email"` sets `type/inputMode/autoComplete`), `button` (primary, secondary full-width Google, ghost links), `spinner` inline, `separator` with the word *or*.
- CC solves: **password field** — `Input mode="password"` renders a text *Show/Hide* button with `aria-pressed`, 44px target, inside the field (`primitives/control/input/input.tsx`). **Reuse**; v1's `PasswordInput` is deleted. **Sign-out confirm** — `ConfirmDialog` (`primitives/feedback/alert-dialog/alert-dialog.tsx`). Reuse. **Auth frame** — CC's `AuthCapturePanel` is CC-brand and Supabase-bound; only its skeleton (wordmark, heading, form, footer link) is worth copying: **adapt** as `AuthFrame`.
- Composed: `AuthFrame`, `TrustLine`.
- Non-standard: **Google button** — → shadcn `secondary` with the G mark at left and centred label, 44px, mark 18px, no brand-colour fill. (Unchanged from v1; CC's Google button is a Path-A crisis component and not shipped.)

### 4.2 First run (FR-01…05)
- Standard: `button`, `native-select` (timezone, compact).
- CC solves: **step navigation** — `StepNav` (`composed/navigation/step-nav`) has `onBack/onContinue/onSkip/continueLabel/continueDisabled`; **adapt** into `StepFrame` (adds the progress label, *Finish later*, and the heading/body slots; drops CC's "I'll skip this one" copy). **Step header** — `apps/toolkit/app/(onboarding)/_components/onboarding-step-header.tsx` (title + subtitle with size presets): adapt as `StepFrame`'s heading block. **Sticky progress chrome** — `onboarding-progress-chrome.tsx` is a data-bound stepper; not needed (five fixed steps, text label).
- Composed: `StepFrame`, `TimeField`, `TimezoneSelect`, `StarterSetChooser`.
- Non-standard: **progress label** — → text *Step 2 of 5* only; CC's `ProgressHairline` is a decorative bar and reads as a funnel — not used. **Starter set chooser** — → inline rows where the row is the toggle, check glyph at right, selected = 2px `ink` left edge, no fill (unchanged).

### 4.3 Habit library (LB-01…03)
- Standard: `dropdown-menu`, `collapsible`, `empty`, `skeleton`, `alert-dialog`.
- CC solves: **search** — `SearchField` (`composed/control/search-field`): `type=search`, required `aria-label`, clear button at 44px, `pending`. **Reuse.** **Row overflow** — `EllipsesMenu` (`composed/control/ellipses-menu`): `items: {label, href?, onClick?, disabled?, variant?}[]`, `label` for the trigger. **Reuse.** **Rows** — `apps/toolkit/app/(app)/settings/_components/settings-root-list.tsx` (a `ul.divide-y` of full-width `Link`/`button` rows with title + description): the structural precedent for `ListRow`; **adapt**. **Archived section** — `Collapsible` prop-based wrapper (`primitives/layout/collapsible`) + `TextDisclosureButton` (`composed/control/text-disclosure-button`, `aria-expanded`, collapsed/expanded labels) as its trigger. Reuse both.
- Composed: `ListRow`, `GroupHeading`, `CategoryChip`, `ItemIcon`, `ArchivedSection`, `EmptyState`.
- Non-standard: **the row's two numbers** (*10–20 min · importance 6*) → muted meta line under the title on compact, right-aligned tabular column on wide via `layout`. **Wake-up mark** → the word *wake-up* as a `Tag`. (Unchanged.)

### 4.4 Habit sheet (LB-02)
- Standard: `input`, `textarea`, `switch`, `collapsible`, `tabs`, `button`.
- CC solves: **segmented type control** — `SegmentedControl<T>` (`composed/control/segmented-control`): `role=radiogroup` of `role=radio` buttons, required `aria-label`. **Adapt** (add the value-keyed helper line; replace Button-outline skin with ink fill/outline). **Emoji pane** — `EmojiPicker` (`composed/control/emoji-picker`): Frimousse, native emoji, dataset served from our own origin (`apps/toolkit/scripts/copy-emoji-data.mjs` copies `emojibase-data` into `public/emoji/`). **Reuse** wholesale, including the copy script — this removes the largest single build in v1's IconPicker. **Image pane** — `AvatarPicker` (`apps/toolkit/app/_components/avatar-picker.tsx`) + `useAvatarUpload` (`apps/toolkit/lib/hooks/use-avatar-upload.ts`) + `reencodeToJpeg` (`apps/toolkit/lib/image/reencode.ts`: canvas re-encode, EXIF/GPS stripped, bounded dimension, orientation baked): **adapt** — the pick/commit/discard split is exactly the "Save button waits while uploading" behaviour LB-02 wants. What CC lacks is the interactive 1:1 crop; see non-standard. **Disclosure "More"** — `TextDisclosureButton` + `Collapsible`. Reuse.
- Composed: `RangeInput`, `Stepper17`, `ChipPicker`, `IconPicker` (+ `CuratedIconGrid`, `ImageCropper`), `ResponsiveSheet`, `HabitForm`.
- Non-standard: **1–7 stepper** → seven 44px cells on `toggle-group type="single"`, selected filled `ink`, number as label, end captions *less/more*, wraps 4+3 under 360px. (CC's `ScaleField`/`LabeledSlider` is a slider; spec §9.7 forbids sliders.) **Crop step** → a fixed 1:1 frame with drag/pinch (compact) or wheel/drag (wide), no rotation, canvas export 256px through CC's `reencodeToJpeg` pipeline. `[VESPER CALL: if the crop UI slips, the pipeline already centre-crops via `object-fit: cover` on display and can export a centred square; the `onChange` contract is identical either way — the crop UI is a Phase-1 nicety, not a contract.]` **Curated icon tint row** → the eight swatches plus *none* as `ColorSwatchRow` with `allowNone`.

### 4.5 Categories (CT-01/02)
- Standard: `input`, `alert-dialog`, `empty`.
- CC solves: `ConfirmDialog` for delete; `ListRow` precedent as above.
- Composed: `ColorSwatchRow`, `ListRow` with a swatch leading slot, `CategorySheet`.

### 4.6 Templates (TP-01…04)
- Standard: `input` (inline name), `popover` (target, usually), `toggle-group` (weekday chips), `dropdown-menu`, `alert-dialog`, `dialog` (TP-04), `empty`.
- CC solves: **autosave status** — `AutosaveBanner` (`composed/feedback/autosave-banner`) has the `"idle" | "saving" | "saved" | "error"` union and `role="status"` text for the quiet states; **adapt** as `SaveStatus` (adds `retrying`, drops the Alert error band — the retry copy is header text in TP-02). **Prop-based dialog** — `Dialog` (`primitives/feedback/dialog`): `open/title/description/header/children`; the base for `ThreeOptionDialog`. Reuse. **Row overflow** — `EllipsesMenu`. Reuse.
- Composed: `TemplateEditor` (canvas), `SlotRow`, `SlotSheet`, `MinutesStepper`, `Stepper17`, `SegmentedControl`, `PickerList`, `InlineQuestionRow`, `ApplyChangesDialog`, `WeekdayChips`, `SaveStatus`.
- Non-standard (unchanged from v1): autosave status as header text; slot row with the time column leading; multitask bracket as a 2px `ink` left line with the word *multitask*; sticky tabular totals footer; the same-start question as a `neutral-100` band with two ghost buttons.

### 4.7 Week build (WK-01…03)
- Standard: `button`, `alert-dialog`, `collapsible`, `empty`.
- CC solves: `ConfirmDialog` (copy week, remove template); `SearchField` inside `PickerList`.
- Composed: `WeekGrid`, `DayRow`, `DaySheet`, `OneOffSheet`, `PickerList`, `TimeField`, `DateField`.
- Non-standard (unchanged): day row/column with a `layout` prop; targets line with one `accent-500` dot before the most-behind template; past days at 0.55 opacity; *Today* as a caption after the date.

### 4.8 Settings (ST-00…12)
- Standard: `switch`, `radio-group`, `avatar`, `input`, `alert-dialog`, `native-select`.
- CC solves: **settings index rows** — `settings-root-list.tsx` (title + description `Link` rows, `ul.divide-y`): **adapt** as `SettingsRow` on `ListRow`. **Notification rows** — `notification-toggles.tsx` (`Label` + `Sub` + `Switch`, `aria-describedby`, optimistic mutation with quiet revert): **adapt** as `NotificationRow` (adds the optional time value). **Permission status** — `device-alerts-row.tsx` has the state union `loading | unsupported | granted | denied | available` and the enable action; **adapt** into `StatusLine variant="permission"` + `PermissionState`. **Push subscribe** — `apps/toolkit/lib/pwa/push-subscribe.ts` (`subscribeToPush(): "subscribed" | "denied" | "unsupported" | "error"`): **reuse**. **Account form** — `account-form.tsx`: name/email/password sections with inline *Saved.* status lines and an `AlertDialog` for photo removal; **adapt** the section shape and the avatar-removal confirm. **Avatar picker** — `AvatarPicker`: reuse (32/64 sizes, initials fallback per §5.5). **Export** — `privacy-data-sections.tsx`: one-tap JSON download with *Gathering…* pending copy and a consequences-first delete confirm; **adapt** the export half (Synapse's export is a server-prepared zip with a 24 h link, so the download is a link, not a client Blob). **Install row** — `install-app-row.tsx` + `useInstallPrompt`: reuse the hook; the row is a `SettingsRow`. **Page header** — `settings-page-header.tsx` is a thin wrapper over `PageHeader`; Synapse's `AppHeader` replaces both.
- Composed: `SettingsRow`, `NotificationRow`, `ReasonGroupHeading`, `TrustLine`, `ReasonSheet`, `TypedConfirmDialog`.
- Non-standard: **delete-account typed confirm** → `alert-dialog` parts with an `Input` between body and footer; destructive button enables on match. CC's `ConfirmDialog` has no body slot and CC's delete is consequences-first without typing — the official spec §4.1 requires typing *delete*, so this is a build (small). **Notification status line** → `StatusLine placement="inline"`.

### 4.9 Shell (SH-00)
- Standard: `sidebar` (wide rail, `collapsible="none"`), `avatar`.
- CC solves: **compact tab bar** — `BottomNav` / `BottomNavList` / `BottomNavItem` (`primitives/navigation/bottom-nav`): `nav aria-label="Main"`, items `asChild` over `Link`, `active` variant; wired by `apps/toolkit/app/(app)/_components/bottom-nav.tsx` from `usePathname()`. **Adapt** (add `aria-current="page"`, safe-area padding, the presence dot slot, and the dimmed-under-scrim state). **Wide rail** — `Sidebar*` (`primitives/navigation/sidebar`) with `SidebarProvider`; reuse in `collapsible="none"` mode. **Top bar** — `app-top-bar.tsx` is a wordmark + bell; Synapse's `AppHeader` is different in kind (title, back, save status, avatar) — build. **Status strip** — `session-status-bar.tsx` (`apps/toolkit/app/tool/conflict-resolution/chat/[id]/_components/chrome/`) renders nothing when there is nothing to say and lets one line win by priority: **adapt the pattern**, not the component — it is an `Alert variant="warning"`, and Synapse's StatusLine is a neutral band with `role="status"`, never an alert. **Shell layout** — `apps/toolkit/app/(app)/layout.tsx` (auth gate → entry-state redirect → `InstallBanner` → top bar → `main` → bottom nav): the skeleton for `app/(shell)/layout.tsx`.
- Composed: `AppShell`, `TabBar`, `Rail`, `AppHeader`, `StatusLine`, `ScreenFrame`.
- Non-standard (unchanged): three word tabs, presence dot 6px `accent-500` after *Review* with visually-hidden *items waiting*; the status line as a full-width `neutral-100` band.

### 4.10 Plain List (LS-00…03)
- Standard: `checkbox` (visual; the row owns the target), `collapsible`, `empty`, `skeleton`, `sonner`.
- CC solves: **undo toast** — `Toaster` + `toast` (`composed/feedback/toaster`): adapt the wrapper (one visible, bottom-centre, no icon, action button); **`UndoToast` becomes a function `toastUndo(text, onUndo, ms)` in the same folder**, not a component. **Empty day** — `EmptyState` (`composed/display/empty-state`, over the `Empty` parts): adapt (no ornament, 1rem text, up to three actions). **Skeleton** — reuse without shimmer. **Section headers** — CC's `Text variant="label"` is the "neutral uppercase label" — Synapse forbids all-caps (§9.4), so `DayPartHeader` is a `Text variant="secondary" tone="muted"`.
- Composed: `DayHeader`, `DayPartHeader`, `ItemRow`, `MultitaskGroup`, `StateWord`, `TimeText`, `ExpanderSection`, `DayCompleteAction`.
- Non-standard (unchanged from v1 §4.10): the 56px row anatomy, the 2px category edge, the state-word colour rules, inline undo in the state-word slot, the quantity tail, 0.55 passed opacity, the day-part heading, and *Day Complete* as a ghost button.

### 4.11 Day header sheet, wake time (DH-01/02)
- CC solves: **the sheet itself** — `SideChannelDrawer` (`composed/layout/side-channel-drawer`): bottom sheet below the breakpoint, right sheet at and above, `title/description/headerAction/footer/children`, `hideClose` when a header action is supplied. This is Synapse's container model exactly (cross-cutting §1.2). **Adapt** as `ResponsiveSheet` (breakpoint 768 not 640; `size`; dirty guard; §10 D2 on drag-to-dismiss). `DrawerDialog` (bottom sheet ↔ centred dialog) is *not* the Synapse model — dialogs are always centred — and is not reused.
- Composed: `ResponsiveSheet` with `ActionRow`s, `TimeField`.

### 4.12 Item sheet (IT-01/02)
- Standard: `input-group` (quantity with unit suffix), `textarea`, `button`.
- CC solves: **elapsed ticking** — `useCaptureElapsed(startedAtMs)` + `formatCaptureClock` (`apps/toolkit/lib/hooks/use-capture-elapsed.ts`): a 500 ms interval producing whole seconds; **adapt** as `useElapsed` at 1 Hz with pause/resume segments (the hook owns nothing about sessions; the sheet's hook does). **Session time** — `Timestamp` (`primitives/typography/timestamp`): a real `<time dateTime>` with an sr-only exact instant; the structural precedent for `TimeText`. Adapt. **Notes draft** — `useLocalDraft(key)` (`apps/toolkit/lib/hooks/use-local-draft.ts`): debounced localStorage draft; reuse for the note while offline. **Feature folder** — the `answer-sheet/` shape (R11).
- Composed: `ItemSheet`, `TimerControl`, `TimerDisplay`, `SessionRow`, `Stepper17`, `CategoryChip`, `PreflightNote`.
- Non-standard (unchanged): 2rem tabular digits, no ring; TimerControl as two fixed positions with changing labels; the quoted preflight block; the right-aligned footer pair.

### 4.13 Schedule (SC-01/02)
- Standard: `button` (earlier/later), `tooltip` (wide).
- CC solves: nothing. The schedule is Synapse's own; CC has no time axis.
- Composed: `ScheduleAxis`, `NowLine`, `ScheduleBlock`, `WindowSpan`, `GhostBlock`, `ShiftBand`, `ShiftDetailSheet`.
- Non-standard: unchanged from v1 §4.13 (64px per hour, block sizes at ≥32/16–32/<16px, window span, ghost, now line, shift band, multitask sharing).

### 4.14 Shift sheet (SF-01)
- Standard: `radio-group`, `checkbox` (Cut), `input-group` (custom minutes), `button`.
- CC solves: `CheckboxField` (`primitives/control/checkbox/checkbox-field.tsx`) — checkbox + body-text label with the optical offset; reuse for the *Cut {title}* rows (label hidden visually, present for AT). `ResponsiveSheet size="tall"`.
- Composed: `ShiftSheet` (growing), `LargeTargetRow`, `TierRadioRows`, `OverflowCutList`.
- Non-standard (unchanged): four 56px targets; steps reveal beneath one another over 200ms; the overflow list with the only right-side checkbox in the product and a live tally.

### 4.15 Trim sheet (TR-01)
- Standard: `input-group`, `button`.
- Composed: `TrimSheet`, `QuickChipRow`, trimmed rows as `ItemRow variant="faded-with-action"`.

### 4.16 Review index (RV-00) and History (HS-01)
- Standard: `collapsible`, `button`, `empty`, `skeleton`.
- CC solves: **region failure** — `RegionRetry` (`apps/toolkit/app/(app)/(dashboard)/_components/region-retry.tsx`): a `Sub role="status"` with an inline *Try again* that refreshes; reuse for a region that fails to load without blanking the tab. **Inline loading** — `LoadingText` (`composed/feedback/loading-text`): `role="status"`, cycling ellipsis in a fixed 3ch slot, frozen under reduced motion; reuse for *Preparing your export…* and *Saving…*.
- Composed: `ReviewRegion`, `WeekRow`, `DayOutcomeRow` (short form).

### 4.17 Day Review (DR-01…07)
- Standard: `radio-group`, `textarea`, `collapsible`, `button`, `alert-dialog`.
- CC solves: `ResponsiveSheet` (traded-up picker), `ConfirmDialog` (discard), `useLeaveGuard` (`apps/toolkit/lib/hooks/use-leave-guard.ts` — intercepts in-app anchor navigation while dirty and hands back `pendingHref` for the discard dialog to resolve): **reuse** for DR-01 edit mode and every dirty form sheet.
- Composed: `DayReview` (feature), `DecisionPanel`, `TierRadioRows`, `ReasonChips`, `TradedUpPicker`, `DecidedLine`, `ReflectionBlock`, `BigNumber`, `FormulaSentence`, `FactLine`.
- Non-standard (unchanged): the hairline-separated decision panel with two 56px targets; tier rows with a 2px `ink` left edge; badge-based reason chips; the Newsreader big number.

### 4.18 Week Review (WR-01…04)
- Standard: `tooltip` (wide), `skeleton`.
- CC solves: nothing beyond `ListRow`.
- Composed: `BigNumber`, `FormulaSentence`, `TemplateUsageRow`, `HabitStrip`, `StripSquare`, `CategoryBar`, `DayOutcomeRow`, `ShiftRow`.
- Non-standard (unchanged): the seven-square strip and its seven glyph states; the single 12px category bar with legend.

### 4.19 System (SY-01…07)
- Standard: `textarea`, `switch`, `button`, `dialog`, `alert-dialog`, `kbd`.
- CC solves: **install instructions** — `InstallPrompt` (`apps/toolkit/app/_components/install-prompt.tsx`): a `Dialog` with numbered `Step` rows per platform and a direct *Install app* button on Android when the deferred prompt exists; **adapt** as `InstallSheet` (a `ResponsiveSheet`, ordered list, no icon, Synapse copy). **Install detection and prompt state** — `lib/pwa/install-detection.ts` (`isPWA/isIOS/isAndroid/isIPadOS/canShowInstallPrompt`) and `use-install-prompt.ts`: **reuse**. **Service worker + manifest** — `service-worker-registration.tsx`, `app/manifest.ts`, `public/sw.js`: reuse the wiring; Synapse's manifest values per cross-cutting §5.1. **Dismiss-until** — the `getDismissedUntil/setDismissedUntil` pair inside `install-banner.tsx` and `useRememberedToggle` (`lib/hooks/use-remembered-toggle.ts`): **adapt** into one `useDismissed(key, scope: "session" | "day" | "forever")` for the status lines. **One-shot toast on arrival** — `close-ceremony-toast.tsx` strips a query flag and fires once; the precedent for *Password changed. Sign in with the new one.* on AU-01 and *Your account was deleted.* — adapt as `NoticeLine` reading a `?notice=` flag. **Session expiry** — no CC precedent; build. **Feedback form** — CC's help page is static; build.
- Composed: `FeedbackForm`, `InstallSheet`, `SyncIssuesSheet`, `SessionExpiredDialog`, `ErrorPage`, `ShortcutsDialog`, `UpdateLine` / `TimezoneLine` / `InstallLine` (StatusLine presets), `TimezoneSwitchDialog`.

---

## 5. Component list — design→dev handoff

Each entry: **Purpose · Status · Folder · File · Built from · Props · Sizes · States · Tokens · A11y · Motion · Used in · Depends on.** `Folder` is the directory; `File` is the component file inside it (the folder also carries `index.ts`, and in `ui/` a `*.stories.tsx`; `.variants.ts` and `copy.ts` are listed where they exist). Type unions come from §3.5 and are not redeclared. Every props block is written in CC's style (R6): `interface`, `Props` suffix, `classes` keyed by part, `className` last.

Shared conventions that every entry inherits and does not restate:
- `className?: string` is always accepted and merged last.
- Controlled values use `value` + `onChange(next)` for our controls, and the Radix names (`onValueChange`, `onCheckedChange`, `onOpenChange`) where the component is a thin wrapper over a Radix part.
- `disabled` is honoured on every control; `busy` is a separate flag where a control keeps its label and shows an inline spinner (official spec §4.1: label unchanged, spinner inline).
- Hover surfaces are `neutral-100` (`neutral-800` dark); focus ring is the global `--ring` rule; hairlines are `neutral-200` (`neutral-600` dark). Stated once here, in `tokens.css`, and not per entry.
- Reduced motion: any duration named below collapses to 0ms under `prefers-reduced-motion`, via the `--dur-*` tokens (§6.2).

### 5.0 Primitives — installed, re-slotted, token-mapped

| CLI name | Folder (`ui/primitives/`) | Status | Wrapper / modification kept |
|---|---|---|---|
| `button` | `control/button/` (`button.tsx`, `button.variants.ts`) | install; re-skin | variants `default · secondary · ghost · destructive`; sizes `sm · md · lg · icon`; `asChild`; `busy?: boolean` renders `spinner` before the label without changing it |
| `input` | `control/input/` (`input.tsx`, `input.variants.ts`, `input-format.ts` dropped) | **adapt CC** | `label/helperText/error/mode`; `mode: "text" \| "email" \| "password" \| "number" \| "time" \| "date"`; password Show/Hide text button; `darkBackground`, `money`, `phone` removed |
| `textarea` | `control/textarea/` | **adapt CC** | `label/helperText/error/autoGrow/resizable`; `appearance` removed |
| `label` | `display/label/` | install | as CLI; typography from `Text variant="secondary" weight=500` |
| `helper-text` | `display/helper-text/` | **reuse CC** | `error` → `role="alert"`; text `ink` when error (never red), `neutral-500` otherwise |
| `checkbox` | `control/checkbox/` (+ `checkbox-field.tsx`) | install + **reuse CC** `CheckboxField` | visual 20px; the parent extends the target |
| `radio-group` | `control/radio-group/` | install | |
| `switch` | `control/switch/` | **reuse CC** (native `role="switch"`) | `checked/onCheckedChange`; track `neutral-300` off / `ink` on |
| `select` | `control/select/` | install + **adapt CC** `SelectField` | `label/helperText/error/options/value/onValueChange/placeholder` |
| `native-select` | `control/native-select/` | install | timezone on compact |
| `sheet` | `layout/sheet/` | install + **adapt CC** `SheetPanel` | `open/onOpenChange/title/description/side/footer/hideClose` |
| `drawer` | `layout/drawer/` | install (Vaul) | compact side of `ResponsiveSheet` only |
| `dialog` | `feedback/dialog/` | install + **adapt CC** prop-based `Dialog` | `open/title/description/header/children`; `register` removed |
| `alert-dialog` | `feedback/alert-dialog/` | install + **adapt CC** `ConfirmDialog` | `variant: "default" \| "destructive"`, `confirmDisabled`, plus a new `children` slot (typed confirm) |
| `popover` | `feedback/popover/` | install | |
| `dropdown-menu` | `feedback/dropdown-menu/` | install | `EllipsesMenu` composes it |
| `tooltip` | `feedback/tooltip/` | install | wide only |
| `collapsible` | `layout/collapsible/` | install + **reuse CC** prop-based `Collapsible` (`trigger/children/open/onOpenChange/defaultOpen`) | |
| `toggle-group` | `control/toggle-group/` | install + **adapt CC** (`variant: "chip" \| "cell"`, `label`) | `cell` = the 44px square used by Stepper17, WeekdayChips, ColorSwatchRow |
| `separator` | `layout/separator/` | install | |
| `skeleton` | `display/skeleton/` | **adapt CC** | shimmer class removed; `aria-hidden`; `neutral-200` (`neutral-700`) |
| `sonner` | `feedback/toaster/` (`toaster.tsx` exports `Toaster`, `toast`, `toastUndo`) | **adapt CC** | `visibleToasts={1}`, bottom-centre, 4000 default, no icon/close, action ghost |
| `avatar` | `display/avatar/` | **adapt CC** | `src/name/size: 32 \| 64/label`; fallback = up to two initials in Geist 500 on `neutral-200`/`neutral-700`, radius full |
| `badge` | `display/badge/` | install | base for `CategoryChip`, `Tag` |
| `tabs` | `control/tabs/` | install | icon picker only |
| `input-group` | `control/input-group/` | install | addon buttons + suffix text |
| `empty` | `display/empty/` | install (= CC) | `Empty · EmptyHeader · EmptyTitle · EmptyDescription · EmptyContent`; `EmptyMedia` unused |
| `kbd` | `display/kbd/` | install | |
| `spinner` | `feedback/spinner/` | install | 16px, `currentColor`; static under reduced motion |
| `sidebar` | `navigation/sidebar/` | install (= CC) | `collapsible="none"` only |
| `bottom-nav` | `navigation/bottom-nav/` | **adapt CC** | `aria-current`, safe-area, `dot` slot, `dimmed` |
| `text` | `typography/text/` | **adapt CC** | §5.1 |

Global overrides, once, in `tokens.css` / `globals.css` (§6.2): `--radius` 6px (10px sheets via `--radius-sheet`); `font-variant-numeric: tabular-nums` on `body`; focus ring `2px accent-500` offset 2px; the two durations and one easing; `prefers-reduced-motion` zeroes the durations; Sonner theme by token, not by Sonner's `theme` prop.

### 5.1 Typography and token primitives (ours, CC-shaped)

**Text** — Purpose: the one typography primitive; every label, row, caption, and heading is a `Text` so the scale can't drift. Status: **adapt CC** (`primitives/typography/text/{text.tsx,text.variants.ts}` — keep the `as`/`variant`/`tone`/`balance`/`truncate` axes and the heading-tag inference; replace the scale and tones; drop `darkBackground`/`lightRegister`). Folder: `ui/primitives/typography/text/`. File: `text.tsx`, `text.variants.ts`. Built from: `span` + `cva`.

```ts
export const TEXT_VARIANTS = [
  "caption",          // 0.75rem / 1.2
  "secondary",        // 0.875rem / 1.4
  "body",             // 1rem / 1.5
  "row-title",        // 1.125rem / 1.4, weight 500
  "heading",          // 1.375rem / 1.3, weight 600 — the one h1 per screen
  "review-headline",  // Newsreader 1.75rem / 1.2 (2.25rem wide)
  "review-sentence",  // Newsreader 1rem / 1.5
] as const;
export type TextVariant = (typeof TEXT_VARIANTS)[number];
export const TEXT_TONES = ["ink", "body", "secondary", "muted", "accent", "violet"] as const;
export type TextTone = (typeof TEXT_TONES)[number];
// ink → neutral-800/100 · body → neutral-600/200 · secondary → neutral-500/300
// muted → neutral-400/400 (large only) · accent → accent-600/300 · violet → violet-600/300

export interface TextClasses { root?: string }
type TextOwnProps = {
  variant?: TextVariant;   // default "body"; h1–h6 infer "heading"
  tone?: TextTone;         // default "ink"
  weight?: 400 | 500 | 600;
  tabular?: boolean;       // default true (body sets it globally; false opts out)
  balance?: boolean;
  truncate?: boolean;
  classes?: TextClasses;
  className?: string;
  children?: React.ReactNode;
};
export type TextProps<E extends React.ElementType = "span"> = TextOwnProps &
  Omit<React.ComponentPropsWithoutRef<E>, keyof TextOwnProps | "as"> & { as?: E };
```

Also exported, as CC exports `Headline/Sub/Microcopy/MetaLine`: `Heading` (`as="h1" variant="heading"`), `Caption` (`variant="caption" tone="secondary"`), `Meta` (`variant="secondary" tone="secondary"`). No all-caps variant exists (§9.4). Used in: everything. Depends on: `cn`.

**HelperText / Label** — as §5.0. Label is 0.875rem `ink` weight 500; helper is 0.75rem `neutral-500`; error helper is 0.75rem `ink` with `role="alert"`. Never a red word, never a red field.

**TimeText** — Purpose: a scheduled or actual time, in the day's zone, tabular, with an accessible exact form. Status: **adapt CC** `Timestamp` (`primitives/typography/timestamp`: `<time dateTime>` + sr-only exact + `suppressHydrationWarning`) — Synapse formats in the *day's* zone, not the viewer's, so the formatter takes `timeZone` and this must still render client-side. Folder: `ui/composed/display/time-text/`. File: `time-text.tsx`. Built from: `Text as="time"` + `lib/utils/time.ts` (`formatClock(date, timeZone, locale)`, `formatWindow`, `formatElapsed`).

```ts
export type TimeTextMode = "at" | "window" | "anytime" | "actual" | "elapsed";
export interface TimeTextProps {
  mode: TimeTextMode;
  start?: Date | null;
  end?: Date | null;
  actual?: Date | null;      // renders "7:20 → 4:32" with mode "actual"
  elapsedSec?: number;       // mode "elapsed": mm:ss under an hour, h:mm:ss after [VESPER CALL]
  timeZone: string;          // the day's zone (cross-cutting §7.3)
  tone?: "body" | "violet" | "secondary";  // violet when moved
  size?: "secondary" | "caption";
  className?: string;
}
```

A11y: `dateTime` carries the ISO instant; the visible short form is `aria-hidden` when it is lossy and an sr-only full form follows (CC's rule). Used in: `ItemRow`, `SlotRow`, `ScheduleBlock`, `ItemSheet`, `DayHeader`, `SessionRow`, `DayOutcomeRow`. Depends on: `Text`.

### 5.2 Shell

**AppShell** — Purpose: the signed-in frame. Status: **adapt CC** `apps/toolkit/app/(app)/layout.tsx` (auth gate → entry redirect → banner → header → `main` → bottom nav) — the layout is the server shell; the client frame is this component. Folder: `app/(shell)/_components/`. File: `app-shell.tsx`. Built from: `Rail` (wide), `TabBar` (compact), `AppHeader`, `StatusLineSlot`, a `main` landmark, a skip link.

```ts
export interface AppShellProps {
  activeTab: "list" | "schedule" | "review" | "settings";
  header: React.ReactNode;              // an <AppHeader/> the route owns
  contentWidth?: "text" | "canvas";     // 720 | 960 max on wide
  reviewHasPending: boolean;
  user: { initials: string; imageUrl: string | null };
  sheetOpen?: boolean;                  // dims the tab bar, aria-hidden on main
  children: React.ReactNode;
}
```

Sizes: header 56px; tab bar 56px + `env(safe-area-inset-bottom)`; rail 220px; content padding 16px compact / 32px wide. States: online/offline (via status line), sheet-open. Tokens: bg `paper`. A11y: landmarks `banner · navigation · main · complementary` (cross-cutting §3.4); skip link *Skip to today's list* first in DOM; on tab switch focus moves to the new header title. Motion: none. Used in: every `(shell)` route. Depends on: `Rail`, `TabBar`, `AppHeader`, `StatusLineSlot`, `useIsWide`.

**TabBar** — Purpose: compact navigation. Status: **adapt CC** `bottom-nav` primitive + `apps/toolkit/app/(app)/_components/bottom-nav.tsx` (route-aware leaf with `NAV_ITEMS` const and `isActive(pathname, href)`). Folder: primitive at `ui/primitives/navigation/bottom-nav/`; leaf at `app/(shell)/_components/`. File: `bottom-nav.tsx` (primitive), `tab-bar.tsx` (leaf). Built from: plain `nav` + `Link`; not `tabs`.

```ts
// primitive
export interface BottomNavItemProps extends React.ComponentProps<"a"> {
  asChild?: boolean;
  active?: boolean;                 // sets aria-current="page"
  dot?: boolean;                    // 6px accent-500 after the label
  dotLabel?: string;                // visually-hidden text, e.g. "items waiting"
}
export interface BottomNavProps extends React.ComponentProps<"nav"> {
  dimmed?: boolean;                 // under a scrim: 0.55 opacity, pointer-events none, aria-hidden
  classes?: { root?: string; list?: string; item?: string };
}
// leaf
export interface TabBarProps { reviewHasPending: boolean; dimmed?: boolean }
```

Sizes: 56px + safe area; each item ≥44px target; label 0.875rem weight 500 active / 400 inactive. Tokens: active `ink`, inactive `neutral-500`, dot `accent-500`. A11y: `nav aria-label="Main"`, `aria-current="page"` (cross-cutting §11 says `tablist` on compact; `[VESPER CALL: these are routes — `aria-current` on links is the honest semantic and what CC ships; a `tablist` would promise arrow-key switching we don't implement. Cost if wrong: one attribute swap.]`). Used in: SH-00 compact.

**Rail** — Purpose: wide navigation. Status: **reuse CC** `sidebar` (`SidebarProvider · Sidebar collapsible="none" · SidebarHeader · SidebarContent · SidebarMenu · SidebarMenuItem · SidebarMenuButton isActive · SidebarFooter`). Folder: `app/(shell)/_components/`. File: `rail.tsx`.

```ts
export interface RailProps {
  active: "list" | "schedule" | "review" | "settings";
  reviewHasPending: boolean;
  user: { initials: string; imageUrl: string | null };
}
```

Sizes: 220px (`--sidebar-width`); rows 44px; wordmark 1rem weight 500 with 24px padding. States: active row `ink` weight 500 with a 2px `ink` left edge; hover `neutral-100`. Tokens: `--sidebar-*` mapped to `paper`/`neutral-*` in `tokens.css`. A11y: `navigation` landmark, `aria-current`. Used in: SH-00 wide.

**AppHeader** — Purpose: title, context, back, avatar, save status. Status: **build new** (CC's `AppTopBar` is a wordmark bar; `PageHeader` is a title stack for page bodies — neither carries back/avatar/save status). Folder: `ui/composed/navigation/app-header/`. File: `app-header.tsx`. Built from: `Button variant="ghost" size="icon"` (back), `Avatar`, `Text variant="heading"`, `SaveStatus`.

```ts
export interface AppHeaderClasses { root?: string; title?: string; subtitle?: string; actions?: string }
export interface AppHeaderProps {
  title: React.ReactNode;                    // rendered as the screen's single h1
  subtitle?: React.ReactNode;                // 0.875rem neutral-500
  onBack?: () => void;                       // renders Back when present
  backLabel?: string;                        // default "Back"
  action?: { label: string; onClick: () => void; busy?: boolean };  // ghost, right
  saveStatus?: SaveStatus;                   // caption right of the title
  dateContext?: { label: string; onToday?: () => void };  // "Thursday 3 Sept" + Today action (record/plan modes)
  zoneLabel?: string;                        // "times in Vancouver"
  avatar?: { initials: string; imageUrl: string | null; onOpen: () => void };  // labelled "Settings"
  classes?: AppHeaderClasses;
  className?: string;
}
```

Sizes: 56px; title 1.375rem weight 600; subtitle 0.875rem. States: with back / without; with save status (`retrying` and `failed` in `ink`, others `neutral-500`); with date context. Tokens: bg `paper`; no border (rhythm separates). A11y: `banner` landmark; title is `h1`; back and avatar carry `aria-label`. Used in: every screen. Depends on: `Avatar`, `SaveStatus`, `Text`.

**StatusLine** — Purpose: one-at-a-time system/context message. Status: **adapt CC pattern** from `session-status-bar.tsx` (render nothing when there is nothing to say; the caller picks the winning line) and `device-alerts-row.tsx` (permission union); the element is new because CC's is an `Alert`. Folder: `ui/composed/feedback/status-line/`. File: `status-line.tsx`, `copy.ts` (the ten fixed strings). Built from: `div role="status"` + `Button variant="ghost"`.

```ts
export interface StatusLineProps {
  variant: StatusLineVariant;
  text: React.ReactNode;                         // defaults from copy.ts by variant
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;                        // renders the dismiss control, labelled dismissLabel
  dismissLabel?: string;                         // "Dismiss for today" | "Dismiss"
  placement?: "shell" | "inline";                // shell: full-width under the header
  className?: string;
}
```

Sizes: min 40px; padding 8/16; text 0.875rem. Tokens: bg `neutral-100` (`neutral-800`), text `neutral-700` (`neutral-200`), action `ink` underlined on hover. Never accent, violet, or destructive. A11y: `role="status" aria-live="polite"` (announces on change). Motion: 120ms opacity in/out. Used in: SH-00, ST-07, SY-02/06/07. Depends on: `Button`, `Text`.

**StatusLineSlot** — Purpose: the shell's priority resolver (offline > setup > pending review > late offer > update > timezone > install). Status: **build new** (data-bound). Folder: `app/(shell)/_components/`. File: `status-line-slot.tsx`. Props: none (reads `useOnline`, setup state, pending count, late-offer eligibility, SW update, zone mismatch, install eligibility from `lib/hooks`); renders one `StatusLine`. Dismissals via `useDismissed(key, scope)`.

**ScreenFrame** — Purpose: standard padding/width wrapper. Status: **build new** (CC's `Section` is a marketing band). Folder: `ui/composed/layout/screen-frame/`. File: `screen-frame.tsx`.

```ts
export interface ScreenFrameProps extends React.ComponentProps<"div"> {
  width?: "text" | "canvas";      // 720 | 960 max, left-aligned on wide
  padded?: boolean;               // default true: 16 compact / 32 wide
  prose?: boolean;                // caps line length at 64ch
}
```

### 5.3 Containers and feedback

**ResponsiveSheet** — Purpose: one API for the compact bottom sheet and the wide right panel (cross-cutting §1.2). Status: **adapt CC** `SideChannelDrawer` (`composed/layout/side-channel-drawer/side-channel-drawer.tsx`: `useMediaQuery` switch, `SheetContent side={isDesktop ? "right" : "bottom"}`, `hideClose` when `headerAction`, pinned header and footer with `min-h-0 flex-1` body). Changes: breakpoint `(min-width: 768px)`; compact side rendered by `drawer` (Vaul) for the drag handle and drag-to-dismiss (§10 D2); `size`; `dirty` guard; `initialFocus`. Folder: `ui/composed/layout/responsive-sheet/`. File: `responsive-sheet.tsx`. Built from: `drawer` (compact), `sheet` side=right (wide), `Text`, `Button`.

```ts
export interface ResponsiveSheetClasses { content?: string; header?: string; title?: string; subtitle?: string; body?: string; footer?: string }
export interface ResponsiveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;                                // announced on open; may be visually replaced by `header`
  subtitle?: React.ReactNode;
  header?: React.ReactNode;                     // replaces the title block (ItemSheet's identity row)
  headerAction?: React.ReactNode;               // e.g. the one-off "Edit" ghost; suppresses the corner close
  footer?: React.ReactNode;                     // pinned above the safe area
  size?: "default" | "tall";                    // compact max-height 60dvh | 90dvh
  dirty?: boolean;                              // when true, a close attempt calls onDiscardRequest instead of closing
  onDiscardRequest?: () => void;                // caller opens DiscardDialog
  initialFocus?: "first-field" | "title";       // cross-cutting §3.4
  children: React.ReactNode;
  classes?: ResponsiveSheetClasses;
  className?: string;
}
```

Sizes: wide 420px; compact drag handle 32×4 `neutral-300`; header 56px; footer padding 16 + safe area; radius `--radius-sheet` (10px) on the compact top edge. States: open, closing, dirty-guarded. Tokens: surface `neutral-50` (`neutral-800`), scrim `--scrim`, shadow `--shadow-overlay`. A11y: `aria-modal`, focus trap, focus returns to the opener on close, Esc closes (through the dirty guard), title announced. Motion: 200ms settle; reduced-motion crossfade. Used in: every sheet in the four docs. Depends on: `useIsWide`, `drawer`, `sheet`.

**ConfirmDialog** — Purpose: two-action confirmation. Status: **adapt CC** (`primitives/feedback/alert-dialog/alert-dialog.tsx` `ConfirmDialog`: `open/onOpenChange/title/description/confirmLabel/cancelLabel/onConfirm/onCancel/variant/confirmDisabled`). Changes: add `children` (rendered between description and footer — the typed-confirm input), `busy`, and the ≤320/≤420 widths. Folder: `ui/primitives/feedback/alert-dialog/` (CC keeps the wrapper beside the parts). File: `alert-dialog.tsx`. Built from: `alert-dialog`, `Button`.

```ts
export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;                         // always a verb (spec §10.3); no default
  cancelLabel: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive";          // destructive only in ST-10a
  confirmDisabled?: boolean;
  busy?: boolean;                               // both buttons disabled, spinner on confirm
  children?: React.ReactNode;
  classes?: ConfirmDialogClasses;
  className?: string;
}
```

A11y: `alertdialog`; initial focus on cancel (`[VESPER CALL — carried from v1]`). Used in: archive/delete/remove/sign-out/copy-week/disconnect/discard/ST-10a/SY-06.

**DiscardDialog** — `ConfirmDialog` preset: *Discard changes?* — **Keep editing** · **Discard**. Status: build (preset). Folder: `ui/composed/feedback/discard-dialog/`. File: `discard-dialog.tsx`, `copy.ts`. Props: `{ open; onKeepEditing; onDiscard }`. Pairs with `useLeaveGuard` (reuse CC `apps/toolkit/lib/hooks/use-leave-guard.ts` → `lib/hooks/use-leave-guard.ts`): while a form is dirty, in-app navigation is intercepted and the `pendingHref` is resolved by this dialog.

**TypedConfirmDialog** — `ConfirmDialog variant="destructive"` with an `Input` child; confirm enables when `value.trim().toLowerCase() === word`. Folder: `ui/composed/feedback/typed-confirm-dialog/`. Props: `{ open; onOpenChange; title; description; word: string; inputLabel: string; confirmLabel; cancelLabel; onConfirm; busy? }`. Used in: ST-10a only.

**ThreeOptionDialog** — Purpose: TP-04. Status: **adapt CC** prop-based `Dialog` (`primitives/feedback/dialog/dialog.tsx`). Folder: `ui/composed/feedback/three-option-dialog/`. File: `three-option-dialog.tsx`. Props: `{ open; onOpenChange; title; body; options: readonly [Option, Option, Option]; busy? }` where `Option = { label: string; onSelect: () => void; emphasis: "default" | "secondary" | "ghost" }`. Buttons stack vertically, full width, in the order given.

**Toaster / toastUndo** — Purpose: the only toast. Status: **adapt CC** `Toaster` (`composed/feedback/toaster/toaster.tsx`). Folder: `ui/primitives/feedback/toaster/`. File: `toaster.tsx`. Exports `Toaster` (mounted once in `app/layout.tsx`), `toast`, and:

```ts
export function toastUndo(input: { text: string; onUndo: () => void; durationMs: 5000 | 10000 }): void;
```

Tokens: bg `neutral-800` (`neutral-100` dark), text inverted, action ghost inverted. `visibleToasts={1}`, bottom-centre, no icon, no close. A11y: `polite`. Used in: LS-01, IT-01, IT-02, SF-01, LS-00, TP-02, WK-01.

**EmptyState** — Purpose: all empties. Status: **adapt CC** (`composed/display/empty-state/empty-state.tsx` over the `Empty` parts; drop the diamond ornament and display-3 headline; `actions` array). Folder: `ui/composed/feedback/empty-state/`. File: `empty-state.tsx`.

```ts
export interface EmptyStateAction { label: string; onClick: () => void; emphasis?: "default" | "secondary" | "ghost" }
export interface EmptyStateProps {
  text: React.ReactNode;                        // one sentence
  actions?: readonly EmptyStateAction[];        // 1–3; third is ghost
  density?: "page" | "inline";
  className?: string;
}
```

Sizes: text 1rem `neutral-600`; 24px gap; no illustration slot. Used in: every list, LS-00, WR-03/04, HS-01.

**SkeletonRow / SkeletonBlock** — Status: **adapt CC** `Skeleton` (no shimmer). Folder: `ui/composed/feedback/skeleton-row/`. Props: `SkeletonRow { leading?: boolean; lines?: 1 | 2 }`, `SkeletonBlock { heightPx: number }`. Row 56px with a 24px leading square and two bars. Used in: all lists, SC-01, WR-01, RV-00.

**LoadingText** — Status: **reuse CC** (`composed/feedback/loading-text`). Folder: `ui/composed/feedback/loading-text/`. Props: `{ label?: string }` (default *Loading*). Used in: ST-10 (*Preparing your export*), any inline wait that isn't on a button.

**SaveStatus** — Purpose: autosave word in a header. Status: **adapt CC** `AutosaveBanner` (`composed/feedback/autosave-banner`: state union + `role="status"` quiet text). Folder: `ui/composed/feedback/save-status/`. File: `save-status.tsx`, `copy.ts` (*Saving… · Saved · Not saved — retrying · Changes aren't saving. Check your connection.*). Props: `{ status: SaveStatus; onRetry?: () => void }`. Renders nothing for `idle`; `retrying`/`failed` in `ink`, others `neutral-500`, 0.75rem. Used in: TP-02, WK-01, WK-02 via `AppHeader`.

**RegionRetry** — Status: **reuse CC** (`apps/toolkit/app/(app)/(dashboard)/_components/region-retry.tsx`). Folder: `ui/composed/feedback/region-retry/`. Props: `{ label: string; onRetry: () => void }`. Used in: RV-00, WR-01 regions.

**TrustLine** — Purpose: the one privacy sentence. Status: build (trivial). Folder: `ui/composed/display/trust-line/`. File: `trust-line.tsx`, `copy.ts`. Props: `{ className?: string }`. 0.75rem `neutral-500`, max 64ch. Used in: AU-01/02, ST-10, ST-11, SY-01.

**NoticeLine** — Purpose: a one-shot line under a heading, driven by a `?notice=` route flag and stripped on first render. Status: **adapt CC** `close-ceremony-toast.tsx` (strip-the-param-once pattern) as a line instead of a toast. Folder: `app/_components/`. File: `notice-line.tsx`. Props: `{ notices: Record<string, string> }` (flag → copy). Used in: AU-01 (*Password changed…*, *Your account was deleted.*, *Sign in again to continue.*), AU-04 (*That link has expired…*).

### 5.4 Form controls

**Stepper17** — Purpose: every 1–7 rating and priority. Status: **build new** (CC's `ScaleField`/`LabeledSlider` is a slider; spec §9.7 forbids sliders). Folder: `ui/composed/control/stepper-17/`. File: `stepper-17.tsx`, `stepper-17.variants.ts`. Built from: `toggle-group type="single" variant="cell"`, `Label`, `HelperText`.

```ts
export type Stepper17Value = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export interface Stepper17Classes { root?: string; label?: string; group?: string; cell?: string; captions?: string; helper?: string }
export interface Stepper17Props {
  value: Stepper17Value | null;
  onChange: (value: Stepper17Value) => void;
  label: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  resting?: Stepper17Value | null;    // the life default shown as a dashed ring while value is null (TP-03/WK-03)
  onReset?: () => void;               // renders the small "reset" ghost when value !== resting
  captions?: boolean;                 // "less" · "more" end captions; default true
  required?: boolean;
  disabled?: boolean;
  classes?: Stepper17Classes;
  className?: string;
}
```

Sizes: seven 44×44 cells, 4px gaps; wraps 4+3 under 360px; number 1rem weight 500. States: unselected (1px `neutral-300` outline), selected (`ink` fill, `paper` number), resting (1px `ink` dashed outline), hover, focus ring, error (helper in `ink` + 1px `ink` outline on the group), disabled 0.4. Tokens: never accent. A11y: `radiogroup`; arrow keys move; number keys 1–7 select directly (cross-cutting §3.3). Motion: 120ms fill. Used in: LB-02, TP-03, WK-03, IT-01, DR-06.

**MinutesStepper** — Purpose: bounded minutes. Status: **build new** (over CLI `input-group`). Folder: `ui/composed/control/minutes-stepper/`. File: `minutes-stepper.tsx`, `copy.ts` (*Bounded to the habit's range.*). Built from: `input-group` (number input, *min* suffix, −/+ addon buttons), `Label`, `HelperText`.

```ts
export interface MinutesStepperProps {
  value: number | null;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: 5 | 1;                       // 5 by button, typing allows 1
  label: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  boundedNote?: boolean;              // show the snap note for 2 s after a clamp
  disabled?: boolean;
  className?: string;
}
```

Sizes: input 88px, addons 44px. States: at-bound (that addon disabled), snapped (note appears), error. A11y: `spinbutton` with `aria-valuemin/max/now`. Used in: TP-03, WK-03.

**NumberUnitInput** — Purpose: numeric with trailing unit and optional preset chips. Status: build (over `input-group`). Folder: `ui/composed/control/number-unit-input/`. Props: `{ value: number | null; onChange; unit: string; min?; max?; decimal?: boolean; chips?: readonly { label: string; delta: number }[]; label; helperText?; error?; disabled? }`. Chips render as a `role="group"` of `Button variant="secondary" size="sm"` beneath. Used in: IT-01 quantity, TR-01, SF-01 custom.

**RangeInput** — Purpose: from/to minutes pair. Status: build. Folder: `ui/composed/control/range-input/`. Props: `{ from: number | null; to: number | null; onChange: (next: { from: number | null; to: number | null }) => void; label; helperText?; error?; required?; disabled? }`. Two 96px `Input mode="number"` with *to* between and *min* after; one shared `HelperText`; `aria-describedby` on both inputs. Validation surfaced by the parent. Used in: LB-02.

**SegmentedControl** — Purpose: 2–3 option choice with a value-keyed helper line. Status: **adapt CC** (`composed/control/segmented-control/segmented-control.tsx` — keep the generic `T`, the `role="radiogroup"`/`role="radio"` structure and required `aria-label`; replace the Button-outline skin with `toggle-group variant="cell"` skin at full width; add `helper`). Folder: `ui/composed/control/segmented-control/`. File: `segmented-control.tsx`, `segmented-control.variants.ts`.

```ts
export interface SegmentedControlOption<T extends string> { value: T; label: React.ReactNode; helper?: React.ReactNode }
export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: React.ReactNode;              // visible Label (Synapse) — CC used aria-label only
  disabled?: boolean;
  classes?: { root?: string; label?: string; group?: string; item?: string; helper?: string };
  className?: string;
}
```

Sizes: full width, 44px, equal segments; selected `ink` fill. A11y: `radiogroup`, arrow keys. Used in: LB-02 type, TP-03 when/timing, WK-03 when/timing.

**ChipPicker** — Purpose: single-select from labelled chips with a create row. Status: build (over `toggle-group variant="chip"` with `badge` skin). Folder: `ui/composed/control/chip-picker/`. Props: `{ options: readonly { value: string; label: string; colorKey?: CategoryKey }[]; value: string | null; onChange: (value: string | null) => void; noneLabel: string; createLabel?: string; onCreate?: () => void; label; disabled? }`. Chips 32px tall with 44px targets via padding, wrap; category chips in `cat-{key}-100/700`; selected gets a 1px `ink` outline. Used in: LB-02 category.

**WeekdayChips** — Status: build (over `toggle-group type="multiple" variant="cell"`). Folder: `ui/composed/control/weekday-chips/`. Props: `{ value: ReadonlyArray<0|1|2|3|4|5|6>; onChange; label; disabled? }`. Seven 44×44 initials M T W T F S S with visually-hidden full names. Used in: TP-02.

**ColorSwatchRow** — Status: build (over `toggle-group type="single" variant="cell"`). Folder: `ui/composed/control/color-swatch-row/`. Props: `{ value: CategoryKey | "none" | null; onChange; allowNone?: boolean; label }`. Eight 32px circles in `cat-{key}-500` inside 44px cells; selected = 2px `ink` ring at 2px offset; the key name (*leaf, sky, …*) is the accessible label and shows beneath on compact, as a tooltip on wide. Used in: CT-02, `CuratedIconGrid`.

**IconPicker** — Purpose: emoji / curated icon + tint / image with crop. Status: **adapt CC** for two of three panes: emoji = **reuse** `EmojiPicker` (`composed/control/emoji-picker/emoji-picker.tsx`, Frimousse, `emojibaseUrl="/emoji"`, plus `scripts/copy-emoji-data.mjs` and the `emoji-data` npm script); image = **adapt** `useAvatarUpload` + `reencodeToJpeg` (pick/commit/discard, EXIF strip, `maxDimension`) with a square crop step. Curated = build. Folder: `components/icon-picker/` (data-bound because of the upload leg) with presentational parts in `ui/composed/control/{curated-icon-grid,image-cropper}/`. Files: `icon-picker.tsx`, `hooks/use-icon-upload.ts`, `curated-icons.ts` (the ~80 Lucide names — content, open §11), `copy.ts`. Built from: a 48px trigger well, `tabs` (three), `EmojiPicker`, `CuratedIconGrid` + `ColorSwatchRow`, `ImageCropper`, `Button`s *Use image · Choose another · Remove image*.

```ts
export interface IconPickerProps {
  value: IconValue;
  onChange: (value: IconValue) => void;
  allowImage?: boolean;              // false on FR-02's starter rows? no — always true in LB-02; false nowhere yet
  imageOnly?: boolean;               // ST-01 avatar
  uploading?: boolean;               // the parent's Save waits while true
  label: React.ReactNode;
  disabled?: boolean;
}
// ui/composed/control/curated-icon-grid
export interface CuratedIconGridProps {
  glyphs: readonly { name: string; label: string }[];   // Lucide names + accessible labels
  value: string | null; onChange: (name: string) => void;
  colorKey: CategoryKey | null; onColorKeyChange: (key: CategoryKey | null) => void;
  search?: boolean;
}
// ui/composed/control/image-cropper
export interface ImageCropperProps {
  file: File;
  outputPx?: 256;
  onCrop: (blob: Blob) => void;      // fed to useIconUpload.commit
  onCancel: () => void;
}
```

States: collapsed, expanded (inline below the well, inside the sheet's scroll), uploading (spinner in the well; parent Save disabled), error (*Couldn't read that image — try a different one.* as HelperText). Tokens: well `neutral-100`; grid cells 44px, hover `neutral-100`; curated glyph tinted `cat-{key}-500` or `neutral-600`. A11y: emoji cells labelled by Frimousse; curated cells by `label`; tabs are a `tablist`. Used in: LB-02, ST-01. Depends on: `EmojiPicker`, `tabs`, `ColorSwatchRow`, `lib/image/reencode.ts` (reuse CC).

**TimeField** — Purpose: native time with our display. Status: **adapt CC** `Input mode="time"` (already sets `type="time"`) — the wrapper adds the day-zone formatted read value and `min/max` bounds. Folder: `ui/composed/control/time-field/`. Props: `{ value: string | null /* "HH:mm" */; onChange: (value: string) => void; label; helperText?; error?; min?: string; max?: string; disabled? }`. 44px; the native picker on both platforms (Epic 1 §0.3). Used in: FR-01, TP-02/03, WK-02/03, DH-02, IT-02, ST-07/08.

**DateField** — `Input mode="date"` in the same shape. Props: `{ value: string | null /* "YYYY-MM-DD" */; onChange; label; min?; max?; disabled? }`. Used in: WK-03 (*Day*) only.

**TimezoneSelect** — Status: build (over `native-select` on compact, `PickerList` on wide). Folder: `ui/composed/control/timezone-select/`. Props: `{ value: string; onChange: (iana: string) => void; label; zones: readonly { region: string; zones: readonly { id: string; label: string }[] }[] }`. Used in: FR-01, ST-08.

**PickerList** — Purpose: searchable grouped list with a trailing *New …* row. Status: build (over CC's `SearchField` — **reuse** `composed/control/search-field` — plus a `listbox`; no cmdk, §2.6). Folder: `ui/composed/control/picker-list/`. File: `picker-list.tsx`, `copy.ts`.

```ts
export interface PickerListItem { id: string; icon?: IconValue; title: string; meta?: React.ReactNode; marker?: boolean /* the single accent dot (WK-02 most-behind) */; disabled?: boolean }
export interface PickerListGroup { heading: string; items: readonly PickerListItem[] }
export interface PickerListProps {
  groups: readonly PickerListGroup[];
  value: string | null;
  onSelect: (id: string) => void;
  noneLabel?: string;                          // a leading "None" row
  createLabel?: string; onCreate?: () => void; // trailing "New …" row
  searchLabel: string;                         // aria-label for the SearchField
  emptyText: string;                           // "No habits match "{query}""
  presentation?: "inline" | "popover";         // inline inside a sheet (default); popover on wide TP-03
}
```

Sizes: rows 48px; search 44px. A11y: `listbox`/`option` with `aria-activedescendant`; typeahead filters by title and meta. Used in: TP-03 habit, WK-03 what, WK-02 template, ST-08 wake habit, `TimezoneSelect` wide.

**TierRadioRows** — Purpose: the three tiers with definitions, optional chips beneath the selected tier. Status: build (over `radio-group`). Folder: `ui/composed/control/tier-radio-rows/`. File: `tier-radio-rows.tsx`, `copy.ts` (the three labels and three definitions).

```ts
export interface TierRadioRowsProps {
  value: MissTier | null;
  onChange: (tier: MissTier) => void;
  reasons?: Readonly<Record<MissTier, readonly ReasonView[]>>;   // when present, chips render under tiers 1 and 2
  selectedReason?: string | null;
  onReasonSelect?: (key: string) => void;
  otherText?: string; onOtherTextChange?: (text: string) => void;
  onKeepReason?: () => void;                    // "Keep this reason"
  lockedTier?: MissTier | null;                 // ST-06a structural built-ins: tier shown, not changeable
  label: React.ReactNode;
  error?: React.ReactNode;
}
```

Sizes: rows 56px; label 1rem; definition 0.75rem `neutral-500`. States: unselected, selected (2px `ink` left edge, no fill), chips revealed (200ms), locked. A11y: `radiogroup`; the chip row is a nested `ReasonChips` labelled *Reason*. Used in: DR-03, SF-01 step 2, ST-06a (no chips).

**ReasonChips** — `toggle-group type="single" variant="chip"` of `badge`-styled chips, wrapping; *Other* reveals an `Input` (maxlength 80) and a ghost *Keep this reason*. Folder: `ui/composed/control/reason-chips/`. Props: `{ reasons: readonly ReasonView[]; value: string | null; onChange; otherText?; onOtherTextChange?; onKeepReason?; label }`. Used in: DR-03 via `TierRadioRows`.

**LargeTargetRow** — four equal `Button variant="secondary"` at 56px in a `role="radiogroup"`; the selected one becomes `default`. Folder: `ui/composed/control/large-target-row/`. Props: `{ options: readonly { value: string; label: string }[]; value: string | null; onChange; label }`. Used in: SF-01 step 1.

**QuickChipRow** — `role="group"` of four `Button variant="secondary" size="sm"`. Folder: `ui/composed/control/quick-chip-row/`. Props: `{ chips: readonly { label: string; delta: number }[]; onApply: (delta: number) => void; label }`. Used in: TR-01.

**StarterSetChooser** — Purpose: FR-02's inline chooser. Status: build. Folder: `ui/composed/control/starter-set-chooser/`. File: `starter-set-chooser.tsx`, `copy.ts` (the ten starter rows per Epic 1 §2 FR-02). Props: `{ items: readonly { id: string; title: string; rangeLabel: string; importance: number; wakeAnchor?: boolean; added: boolean }[]; selected: ReadonlySet<string>; onToggle: (id: string) => void; onAdd: () => void; onClose: () => void; busy?: boolean }`. Rows are the toggle (`role="checkbox"`), check glyph at right, selected = 2px `ink` left edge; footer *Add {n} selected* (disabled at 0) · *Close*; added rows read *Added* and are unselectable. Used in: FR-02, LB-01 empty.

### 5.5 Lists and rows

**ListRow** — Purpose: the generic setup-list row. Status: **adapt CC** (`apps/toolkit/app/(app)/settings/_components/settings-root-list.tsx` and `recent-session-row.tsx`: a `ul.divide-y` of full-width `Link`/`button` rows, title + description as `Text`, a trailing `EllipsesMenu` outside the link so the row and the menu are separate focusables). Not built on shadcn `item` (§2.6). Folder: `ui/composed/display/list-row/`. File: `list-row.tsx`, `list-row.variants.ts`. Built from: `Link`/`button`, `Text`, `ItemIcon`, `CategoryChip`, `Tag`, `EllipsesMenu`.

```ts
export interface ListRowClasses { root?: string; leading?: string; title?: string; meta?: string; trailing?: string }
export interface ListRowProps {
  leading?: React.ReactNode;                // ItemIcon or a swatch
  title: React.ReactNode;
  meta?: React.ReactNode;                   // "10–20 min · importance 6"
  chip?: { key: CategoryKey; name: string };
  tag?: string;                             // "wake-up" | "archived" | "default" | "(archived)"
  trailing?: React.ReactNode;               // chevron | EllipsesMenu | a ghost text action
  layout?: Layout;                          // "compact": stacked meta; "wide": tabular right column
  muted?: boolean;                          // archived rows, 0.55
  href?: string;                            // renders a Link
  onClick?: () => void;                     // renders a button
  ariaLabel?: string;                       // overrides the computed label
  classes?: ListRowClasses;
  className?: string;
}
```

Sizes: min 56px; title 1.125rem weight 500; meta 0.875rem `neutral-500`; 16px horizontal padding; hairline separator via the parent list's `divide-y`. States: default, hover `neutral-100`, pressed, focus ring, muted. A11y: the whole row is one link/button; `trailing` is a sibling focusable. Used in: LB-01, TP-01, CT-01, ST-*, FR-02, LB-03, WR-03/04, HS-01. Depends on: `Text`, `ItemIcon`, `CategoryChip`, `Tag`.

**SettingsRow** — `ListRow` preset: title, description meta, chevron trailing, `href`. Folder: `ui/composed/display/settings-row/`. Props: `{ title: string; description?: React.ReactNode; href: string }`. Used in: ST-00.

**NotificationRow** — Purpose: a switch row with an optional inline time/day value. Status: **adapt CC** `notification-toggles.tsx` (`Label htmlFor` + `Sub id` + `Switch aria-describedby`; a failed save shows *That didn't save — flip it again to retry.* under the description). Folder: `ui/composed/control/notification-row/`. Props: `{ id: string; label: string; description?: string; checked: boolean; onCheckedChange: (next: boolean) => void; value?: { kind: "time"; value: string; onChange: (v: string) => void } | { kind: "day-time"; day: 0|1|2|3|4|5|6; time: string; onChange: (d, t) => void }; note?: string; error?: string; disabled?: boolean }`. Used in: ST-07, ST-12.

**ItemIcon** — Renders an `IconValue`: emoji at 24px, curated Lucide glyph at 20px in a 24px box tinted `cat-{key}-500` or `neutral-600`, image at 24px radius 6, or the neutral dot glyph. Folder: `ui/composed/display/item-icon/`. Props: `{ icon: IconValue | null; size?: 20 | 24 | 48; imageUrl?: string | null /* resolved by the caller from icon.value */; calendar?: boolean /* Phase 2 glyph */ }`. `aria-hidden` always (the title carries meaning). Used everywhere an item appears.

**CategoryChip** — `badge` variant: `cat-{key}-100` bg / `cat-{key}-700` text (dark per §11 Q2), 0.75rem, 24px tall, name only. Folder: `ui/composed/display/category-chip/`. Props: `{ categoryKey: CategoryKey; name: string }`. Used in: rows, sheets, panels.

**Tag** — the muted word tag (*wake-up*, *archived*, *default*, *overridden*, *planned*). `badge` outline-less variant, 0.75rem, `neutral-500`; `tone="accent"` for *overridden* (`accent-600`). Folder: `ui/composed/display/tag/`. Props: `{ children: string; tone?: "muted" | "accent" }`.

**GroupHeading** — 0.875rem `neutral-500` weight 500, 24px top / 8px bottom, optional count. Folder: `ui/composed/display/group-heading/`. Props: `{ children: string; count?: number; as?: "h2" | "h3" }`. Used in: LB-01, TP-01, ST-06, DR-01 sections.

**ArchivedSection** — **reuse CC** `Collapsible` (prop-based) with `TextDisclosureButton` as trigger and muted `ListRow`s carrying a *Restore* ghost. Folder: `ui/composed/display/archived-section/`. Props: `{ count: number; children: React.ReactNode; defaultOpen?: boolean }`. Used in: LB-01, TP-01, ST-06.

**InlineQuestionRow** — Purpose: the same-start question. Status: build. Folder: `ui/composed/feedback/inline-question-row/`. Props: `{ text: React.ReactNode; primary: { label: string; onClick: () => void }; secondary: { label: string; onClick: () => void } }`. A `neutral-100` band, no border, sentence + two ghost buttons; `role="group" aria-label={text}`. Used in: TP-02, TP-03 (replaces the footer), WK-03.

### 5.6 Day (List) components

**DayHeader** — Purpose: the tappable day title. Status: build. Folder: `ui/composed/display/day-header/`. File: `day-header.tsx`, `copy.ts` (*No template · Woke {time} · Shifted +{n} min · Not until {weekday} · Day options*). Built from: `button` ghost, full-width, left-aligned; `Text`.

```ts
export interface DayHeaderProps {
  dateLabel: string;                    // "Friday 4 Sept"
  templateName: string | null;
  wokeAtLabel?: string | null;          // formatted in the day's zone
  shiftedMin?: number | null;
  zoneLabel?: string | null;            // "times in Vancouver" while zones differ
  mode: DayMode;                        // plan mode adds "Not until {weekday}"
  onOpen?: () => void;                  // absent in plan mode for template days? no — plan mode offers Add a one-off only; caller decides
  className?: string;
}
```

Sizes: title 1.375rem weight 600 (the tab's h1); second line 0.875rem `neutral-500`. A11y: `aria-label` *Day options*. Used in: LS-01, SC-01, LS-00.

**DayPartHeader** — Folder: `ui/composed/display/day-part-header/`. Props: `{ part: "morning" | "afternoon" | "evening" | "anytime"; span?: { startLabel: string; endLabel: string } }`. 0.875rem `neutral-500`; span tabular; 32px top spacing; not a control. Used in: LS-01.

**StateWord** — Purpose: the one-word state. Folder: `ui/composed/display/state-word/`. File: `state-word.tsx`, `copy.ts`.

```ts
export interface StateWordProps {
  kind: StateWordKind;
  text?: string;                        // "from Thu" · "add pages"
  withDot?: boolean;                    // now/soon only
  undo?: { label: string; onUndo: () => void };   // the 5 s inline undo occupies this slot
  className?: string;
}
```

Tokens: `accent-600` for now/soon/open/closing (dot `accent-500` 6px for now/soon only), `violet-600` moved, `neutral-500` others. 0.75rem weight 500. A11y: read as part of the row label; the undo is a real button. Used in: `ItemRow`, `ItemSheet`.

**ItemRow** — Purpose: the execution row. Status: **build new** (nothing in CC is a checkbox-led time row). Folder: `ui/composed/display/item-row/`. File: `item-row.tsx`, `item-row.variants.ts`, `copy.ts`. Built from: `checkbox` (visual) inside a 56px-wide target, `ItemIcon`, `Text`, `StateWord`, `TimeText`, category edge, inline undo.

```ts
export type ItemRowVariant = "default" | "faded-with-action" | "read-only";
export interface ItemRowClasses { root?: string; check?: string; title?: string; trailing?: string }
export interface ItemRowProps {
  item: DayItemView;                    // item.state drives every visual (§5.9 matrix)
  variant?: ItemRowVariant;             // faded-with-action: no checkbox, a text action (LS-02/03, TR-01); read-only: plan mode
  timeZone: string;
  onToggleDone?: (item: DayItemView) => void;
  onOpen?: (item: DayItemView) => void;
  action?: { label: string; onClick: (item: DayItemView) => void };   // Bring back · Do it anyway · Keep instead
  undo?: { label: string; onUndo: () => void };                        // shows for 5 s in the state-word slot
  classes?: ItemRowClasses;
  className?: string;
}
```

Sizes: min 56px; checkbox visual 20px centred in the left 56px; icon 24; title 1.125rem; right cluster tabular. States: all fifteen `ItemState`s; opacity 0.55 for `passed`, `deferred`, and `faded-with-action`; `done*` title `neutral-600` with the check filled `ink`; `active` replaces time text with elapsed; `done` with `quantityUnit` and no value shows the *add {unit}* tail. Tokens: edge `cat-{key}-500` 2px absolute left; hover `neutral-100`; no borders. A11y: row `button` labelled "{title}, {time}, {state}[, {category}]"; checkbox labelled "Mark {title} done" / "Mark {title} not done"; keyboard per cross-cutting §3.2 (Space toggles, Enter opens, `s` starts/stops via `onKeyDown` bubbling to the list). Motion: the check draws in 120ms; nothing else. Used in: LS-01, LS-02/03, TR-01, DR-01 (Done rows), record/plan modes. Depends on: `ItemIcon`, `StateWord`, `TimeText`, `Text`.

**MultitaskGroup** — Wrapper: 2px `ink` left line spanning members, the word *multitask* 0.75rem `neutral-500` above; children are `ItemRow`s. Folder: `ui/composed/display/multitask-group/`. Props: `{ children: React.ReactNode; label?: string }`. A11y: `role="group" aria-label="multitask"`. Used in: LS-01, TP-02 (via `SlotRow`).

**ExpanderSection** — **reuse CC** `Collapsible` + `TextDisclosureButton`. Folder: `ui/composed/display/expander-section/`. Props: `{ heading: string; explanation: string; open?: boolean; onOpenChange?; children }`. Used in: LS-02/03.

**DayCompleteAction** — `Button variant="ghost"` at 1.125rem `ink`, centred, 24px above the safe area; after close, a muted line with a *Review* link. Folder: `ui/composed/control/day-complete-action/`. Props: `{ closedAtLabel: string | null; onComplete: () => void; reviewHref: string }`. Used in: LS-01.

**TimerDisplay** — 2rem tabular digits, `ink` (`neutral-500` when idle at 00:00), updated at 1 Hz by the parent's `useElapsed` (**adapt CC** `use-capture-elapsed.ts` → `lib/hooks/use-elapsed.ts`, 1000 ms, `formatElapsed` in `lib/utils/time.ts`). Folder: `ui/composed/display/timer-display/`. Props: `{ elapsedSec: number; status: TimerStatus }`. A11y: `aria-live="off"`; the state line carries the announced value. Used in: IT-01.

**TimerControl** — `role="group"` of two `Button`s in fixed positions: [Start | —] → [Pause | Stop] → [Resume | Stop]; Start/Resume `default`, Pause/Stop `secondary`. Folder: `ui/composed/control/timer-control/`. Props: `{ status: TimerStatus; onStart; onPause?; onResume?; onStop; pauseEnabled?: boolean /* Phase 2 */; busy?: boolean }`. Used in: IT-01, N8.

**SessionRow** — muted row *7:22–7:31 · 9 min* with an *Edit* ghost; manual sessions carry the word *by hand*. Folder: `ui/composed/display/session-row/`. Props: `{ startLabel: string; endLabel: string; minutes: number; source: TimerSessionSource; onEdit: () => void }`. Used in: IT-01.

**PreflightNote** — the quoted block: 2px `neutral-300` left edge, `neutral-600` text, caption label *Before starting*. Folder: `ui/composed/display/preflight-note/`. Props: `{ children: string }`. Used in: IT-01.

**ActionRowSheet** — `ResponsiveSheet` preset of action rows (DH-01): title, subtitle, N rows, *Close*. Folder: `ui/composed/layout/action-row-sheet/`. Props: `{ open; onOpenChange; title; subtitle?; rows: readonly { label: string; onSelect: () => void; hidden?: boolean }[]; closeLabel }`. Rows are 56px `ListRow`-shaped buttons. Used in: DH-01.

**ItemSheet** — Purpose: IT-01. Status: build (feature folder, R11). Folder: `components/item-sheet/`. Files: `item-sheet.tsx`, `hooks/use-item-sheet.ts` (timer, quantity, note draft via CC `useLocalDraft`, reflection saves, done/undo/not-today, remove/edit for one-offs), `components/{identity-row,time-line,state-line,timer-region,quantity-region,reflection-region,footer}.tsx`, `types.ts`, `copy.ts`. Built from: `ResponsiveSheet` (`header` = identity row, `headerAction` = *Edit* for one-offs), `ItemIcon`, `CategoryChip`, `Tag`, `TimeText`, `StateWord`, `PreflightNote`, `TimerDisplay`, `TimerControl`, `SessionRow`, `NumberUnitInput`, `Stepper17`, `Textarea`, `Button`s.

```ts
export interface ItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;                 // the hook loads the item; null renders nothing
  mode: DayMode;                         // record hides Not today; plan is read-only with "Edit in week"
  timeZone: string;
  onEditOneOff?: (itemId: string) => void;    // → OneOffSheet
  onEditInWeek?: (date: string) => void;      // → WK-02
}
```

States: upcoming · active · paused · done · deferred · saving (primary keeps its label, spinner inline) · error (*Couldn't save. Your changes are kept — try again.*) · offline (local). Footer: *Not today* ghost · *Done* default; when done → *Undo done* secondary alone; one-offs add *Remove* ghost before *Not today* (cross-cutting §9.3 G1); template items show the muted *From {template}* line; archived habits show *archived* as a `Tag` beside the type word. Used in: LS-01, SC-01, PN-01/02/03/08, `/day/{date}/item/{id}`. Depends on: everything above plus `useElapsed`, `useLocalDraft`, `ConfirmDialog` (remove).

**AddTimeSheet** — IT-02. Folder: `components/item-sheet/components/add-time-sheet.tsx` (a sibling because only the item sheet opens it). Props: `{ open; onOpenChange; mode: "add" | "edit"; initial: { start: string; end: string }; bounds: { min: string; max: string }; onSave: (s: { start: string; end: string }) => void; onRemove?: () => void; error?: string }`. Two `TimeField`s, a computed *{n} min* line, footer *Cancel · Save*, edit adds *Remove this session* (ghost) with a 5 s `toastUndo`.

**DayHeaderSheet** — DH-01/02. Folder: `components/day-header-sheet/`. Files: `day-header-sheet.tsx`, `wake-time-sheet.tsx`, `hooks/use-day-header.ts`, `copy.ts`. Built from: `ActionRowSheet`, `ResponsiveSheet`, `TimeField`. Props: `{ open; onOpenChange; date: string; mode: DayMode; onShift: () => void; onTrim: () => void; onAddOneOff: () => void }`. Rows hide per day state (closed: no shift/trim; plan: only Add a one-off).

**ShiftSheet** — Purpose: SF-01. Status: build (feature folder). Folder: `components/shift-sheet/`. Files: `shift-sheet.tsx`, `hooks/use-shift.ts` (computes overflow against hard anchors and `day_close_time`, pre-checks cuts lowest-priority-first, live tally, applies, 10 s undo), `components/{amount-step,reason-step,fit-step}.tsx`, `copy.ts`. Built from: `ResponsiveSheet size="tall"`, `LargeTargetRow`, `NumberUnitInput`, `TierRadioRows` (grouped reasons, no chips) + `ReasonChips` for *Other*, `OverflowCutList`, `Button`s.

```ts
export interface ShiftSheetProps { open: boolean; onOpenChange: (open: boolean) => void; date: string }
// internal step state, exported for stories of the presentational children:
export interface ShiftFit { movedCount: number; doneStayCount: number; overflow: readonly DayItemView[]; passedHard: readonly DayItemView[]; collidesWithLabel: string | null; overMin: number }
```

States: step 1 · 2 · 3-fits · 3-over · applying · error (*Couldn't shift. Nothing changed — try again.*) · offline (Phase 1 disabled with the line). Motion: each step's block expands beneath the previous over 200ms; reduced-motion appears instantly. Used in: SF-01, the late-offer status line.

**OverflowCutList** — rows: `ItemIcon`, title, new time, duration, priority number `Tag`, a right-side `CheckboxField` labelled *Cut {title}*; a tally line in tabular beneath; a second muted list *Already passed — will show as late:*. Folder: `ui/composed/control/overflow-cut-list/`. Props: `{ items: readonly (DayItemView & { newStartLabel: string })[]; cut: ReadonlySet<string>; onChange: (next: ReadonlySet<string>) => void; overMin: number; passedHard: readonly DayItemView[] }`. Used in: SF-01 step 3.

**TrimSheet** — TR-01. Folder: `components/trim-sheet/`. Files: `trim-sheet.tsx`, `hooks/use-trim.ts`, `copy.ts`. Built from: `ResponsiveSheet`, `NumberUnitInput` (prefilled planned), `QuickChipRow`, a result block, trimmed `ItemRow variant="faded-with-action"` (*Keep instead*), footer *Cancel · Apply*. Props: `{ open; onOpenChange; date: string }`. States: idle · fits · over · applying · offline (Phase 1 disabled).

### 5.7 Schedule components (Phase 2)

**ScheduleAxis** — Purpose: the vertical time grid. Status: build new. Folder: `ui/composed/display/schedule-axis/`. File: `schedule-axis.tsx`. Built from: a positioned layer inside a native scroll container (no `scroll-area`, §2.6).

```ts
export interface ScheduleAxisProps {
  startMin: number;                    // minutes from day start
  endMin: number;
  pxPerHour?: 64 | 96;                 // 96 at ≥150% text scale (30-min hairlines)
  timeZone: string;
  locale?: string;
  onExtend?: (direction: "earlier" | "later") => void;
  children: React.ReactNode;           // absolutely positioned blocks/spans/ghosts/bands
  className?: string;
}
```

Sizes: gutter 48px; hour labels 0.75rem `neutral-500`; 15-min hairlines 1px `neutral-200` (`neutral-700`); hour lines `neutral-300` (`neutral-600`). A11y: `role="grid"` with a row per 15-min band and `aria-rowindex`; blocks focusable in time order. Used in: SC-01.

**NowLine** — 1px `accent-500` rule full width, 6px dot on the gutter, time tag 0.75rem `accent-600` at the right; repositioned by re-render each minute; absent in record/plan modes; reads *closed* on closed days. Folder: `ui/composed/display/now-line/`. Props: `{ atMin: number; label: string; closed?: boolean }`.

**ScheduleBlock** — Purpose: an item in time. Folder: `ui/composed/display/schedule-block/`. File: `schedule-block.tsx`, `schedule-block.variants.ts`.

```ts
export type ScheduleBlockSize = "full" | "compact" | "hairline";   // ≥32px | 16–32px | <16px
export interface ScheduleBlockProps {
  item: DayItemView;
  topPx: number; heightPx: number;
  size?: ScheduleBlockSize;            // derived from heightPx when omitted
  multitask?: { index: number; count: number };   // share the band width, 4px gutters
  timeZone: string;
  onOpen: (item: DayItemView) => void;
}
```

States: upcoming (`neutral-100` fill, 1px `neutral-200`), passed (0.55), active (1.5px `accent-500`), done (`neutral-200` fill + check), done-off-schedule (1.5px `violet-500` + *moved* 0.75rem `violet-600` top-right), fixed (anchor glyph 14px before the title, `aria-label` *fixed*), hairline (2px `ink` rule + 0.75rem tag). A11y: `button` labelled "{title}, {start}–{end}, {state}". Used in: SC-01.

**WindowSpan** — `neutral-50` (`neutral-900`) fill, 1px dashed `neutral-300` outline, radius 6, not focusable. Props: `{ topPx; heightPx }`. **GhostBlock** — outline 1px `neutral-300`, title `neutral-400` strikethrough, *planned* 0.75rem beneath; focusable; opens the live item. Props: `{ item: DayItemView; topPx; heightPx; onOpen }`. **ShiftBand** — 20px band, `violet-100` (`violet-800`), 0.75rem `violet-700` (`violet-200`), a `button`. Props: `{ topPx; deltaMin; reasonLabel; onOpen }`. All in `ui/composed/display/`.

**ShiftDetailSheet** — SC-02. Folder: `components/shift-detail-sheet.tsx`. Props: `{ open; onOpenChange; shiftId: string | null }`. Read-only lines + conditional *Undo this shift* ghost within 10 minutes.

### 5.8 Setup canvases and sheets

**StepFrame** — Purpose: the first-run frame. Status: **adapt CC** `StepNav` (`composed/navigation/step-nav`: back/continue/skip trio, continue-never-disabled rule dropped because FR steps do gate) and `OnboardingStepHeader` (title + subtitle presets). Folder: `ui/composed/layout/step-frame/`. File: `step-frame.tsx`, `copy.ts` (*Step {n} of {total} · Finish later · Skip for now*).

```ts
export interface StepFrameProps {
  step: number; total: number;
  heading: string;
  body?: React.ReactNode;                 // at most one paragraph, ≤64ch
  onBack?: () => void;
  onFinishLater: () => void;
  onSkip?: () => void;
  primary: { label: string; onClick: () => void; disabled?: boolean; busy?: boolean };
  offline?: boolean;                      // disables primary and shows the standard line
  children: React.ReactNode;
}
```

Sizes: progress caption 0.75rem `neutral-500` top-left; *Finish later* ghost top-right; heading 1.375rem; primary last. A11y: heading is the h1; the progress caption is `aria-live="off"` static text. Used in: FR-01…05.

**HabitForm** — Purpose: LB-02 as a form. Status: build (feature folder; form via `useZodForm`, R12). Folder: `components/habit-form/`. Files: `habit-form.tsx`, `hooks/use-habit-form.ts`, `components/{more-section,wake-anchor-switch}.tsx`, `copy.ts`. Built from: `Input` (name, unit, reflection axes), `SegmentedControl` (type), `IconPicker`, `ChipPicker` (category, `onCreate` → `CategorySheet` inline), `RangeInput`, `Stepper17`, `Collapsible` *More* via `TextDisclosureButton`, `Textarea` (note), `Switch` (wake anchor), footer `Button`s, `ConfirmDialog` (range-shrink warning), `ResponsiveSheet`.

```ts
export interface HabitFormProps {
  open: boolean; onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  habitId?: string;                       // edit
  initialType?: ItemType;                 // Task when opened from WK-03
  onSaved: (habit: HabitSummaryView) => void;
  readOnly?: boolean;                     // archived habit opened from the archived section: footer Restore · Close
}
```

States per Epic 1 LB-02: create · edit · saving · error (field-level; form-level *Couldn't save. Try again.*) · offline · image uploading (Save waits) · archived read-only. Used in: LB-02 (from LB-01, FR-02, TP-03, WK-03, ST-08).

**CategorySheet** — CT-02. Folder: `components/category-sheet/`. Built from: `ResponsiveSheet`, `Input`, `ColorSwatchRow`, footer. Props: `{ open; onOpenChange; mode: "create" | "edit"; categoryId?: string; onSaved: (c: CategoryView) => void }`.

**ReasonSheet** — ST-06a. Folder: `components/reason-sheet/`. Built from: `ResponsiveSheet`, `Input`, `TierRadioRows` (no chips; `lockedTier` for structural built-ins), footer. Props: `{ open; onOpenChange; mode; reasonKey?: string; onSaved: (r: ReasonView) => void }`.

**TemplateEditor** — Purpose: TP-02 canvas. Status: build (feature folder; autosave via the hook; no CC canvas precedent beyond the feature-folder shape). Folder: `components/template-editor/`. Files: `template-editor.tsx`, `hooks/use-template-editor.ts` (autosave with retry and `SaveStatus`, collision detection, apply-changes prompt on leave), `components/{settings-line,slot-list,totals-footer,collision-row}.tsx`, `types.ts`, `copy.ts`. Built from: `AppHeader` (inline name `Input`, `SaveStatus`) — omitted when `embedded`, `Popover` ×3 (Starts at → `TimeField`; Target → a 0–7 stepper; Usually → `WeekdayChips`), `SlotRow` list with `MultitaskGroup`, `InlineQuestionRow`, `Button` *Add an item*, sticky totals footer, *Manage habits* link, `SlotSheet`, `ThreeOptionDialog` (TP-04), `EmptyState`.

```ts
export interface TemplateEditorProps {
  templateId: string | null;              // null = create
  embedded?: boolean;                     // FR-03: no AppHeader; name field inline in the step body
  defaults?: { name?: string; anchorTime?: string };
  onLeave?: () => void;                   // after TP-04 resolves
}
```

Sizes: canvas 960 wide; rows 56px; totals footer 44px tabular. States: create · edit · saving · saved · retrying · failed (*Changes aren't saving. Check your connection.*) · offline (read-only) · in-use (header line *Applied to {n} days this week*). Used in: TP-02, FR-03.

**SlotRow** — `ListRow` variant with a leading 64px tabular time column in `ink`, `ItemIcon`, title, meta (*15 min · 6 overridden · Flexible*), overflow `EllipsesMenu` (*Move up · Move down · Duplicate · Remove*). Folder: `ui/composed/display/slot-row/`. Props: `{ slot: SlotView; onOpen: (slot: SlotView) => void; menu: readonly { label: string; onClick: () => void; hidden?: boolean }[] }`. Multitask grouping via `MultitaskGroup` in the parent. Used in: TP-02.

**SlotSheet** — TP-03. Folder: `components/slot-sheet/`. Files: `slot-sheet.tsx`, `hooks/use-slot-sheet.ts`, `copy.ts`. Built from: `ResponsiveSheet`, `PickerList` (Habit; `createLabel` *New habit* → `HabitForm`), a muted range/importance line, `SegmentedControl` When, `TimeField`(s), `MinutesStepper` Takes + *Edit range* ghost, `Stepper17` with `resting`, `SegmentedControl` Timing, footer, `InlineQuestionRow` replacing the footer on same-start. Props: `{ open; onOpenChange; templateId: string; slotId?: string; onSaved: (slot: SlotView) => void }`.

**ApplyChangesDialog** — `ThreeOptionDialog` preset for TP-04. Folder: `components/template-editor/components/apply-changes-dialog.tsx`, `copy.ts`. Props: `{ open; templateName: string; dayLabels: readonly string[]; onApplyAll; onApplyFromTomorrow; onDontApply; busy?; error?: string }`.

**WeekGrid** — WK-01 canvas. Status: build (feature folder). Folder: `components/week-grid/`. Files: `week-grid.tsx`, `hooks/use-week.ts`, `components/{week-header,targets-line,day-row}.tsx`, `copy.ts`. Built from: `Button` ghosts (Previous/Next/This week), targets line (one 6px `accent-500` dot before the most-behind), the unplanned hint line, seven `DayRow`s, *Copy last week* ghost + `ConfirmDialog`, *Templates* link, `DaySheet`.

```ts
export interface WeekGridProps { week: string /* YYYY-Www */; embedded?: boolean /* FR-04 */; onOpenDay?: (date: string) => void }
```

**DayRow** — presentational. Folder: `ui/composed/display/day-row/`. Props: `{ date: string; weekdayLabel: string; dateLabel: string; isToday: boolean; isPast: boolean; templateName: string | null; anchorLabel: string | null; oneOffCount: number; layout: Layout; onOpen: (date: string) => void }`. Compact = a `ListRow` with weekday+date leading and two-line meta; wide = a column cell with hairline separators. Past = 0.55; *Today* as a caption after the date.

**DaySheet** — WK-02. Folder: `components/day-sheet/`. Files: `day-sheet.tsx`, `hooks/use-day-sheet.ts`, `copy.ts`. Built from: `ResponsiveSheet`, `PickerList` (templates with target meta and `marker`; `noneLabel`; `createLabel` *New template* → `TemplateEditor` in a sheet), `TimeField` Starts at, one-off `ListRow`s + *Add a one-off*, `Collapsible` preview of read-only `ItemRow variant="read-only"`, footer *Remove template* ghost + `ConfirmDialog` / *Done*. Props: `{ open; onOpenChange; date: string }`. States: no template · applied · past day (template/start read-only) · loading · offline.

**OneOffSheet** — WK-03. Folder: `components/one-off-sheet/`. Files: `one-off-sheet.tsx`, `hooks/use-one-off.ts`, `copy.ts`. Built from: `ResponsiveSheet`, `PickerList` + a *Just a title* text toggle → `Input`, `DateField` *Day* (when opened from the day header), `SegmentedControl` When, `TimeField`(s), `MinutesStepper`, `SegmentedControl` Timing, `Stepper17`, footer, `InlineQuestionRow` on same-start. Props: `{ open; onOpenChange; date: string; itemId?: string /* edit */; showDateField?: boolean; onSaved: (item: DayItemView) => void }`.

### 5.9 Review components

**ReviewRegion** — RV-00 region. Folder: `ui/composed/display/review-region/`. Props: `{ title: string; status: React.ReactNode; action?: { label: string; onClick: () => void; emphasis: "default" | "ghost" }; loading?: boolean; error?: { label: string; onRetry: () => void } }`. Heading 1.125rem, status 0.875rem `neutral-600`, one button; `RegionRetry` on error. Used in: RV-00.

**DayReview** — DR-01 as a feature. Folder: `components/day-review/`. Files: `day-review.tsx`, `hooks/use-day-review.ts` (decisions, finish/finish-later, edit-mode dirty guard via `useLeaveGuard`, recompute), `components/{review-header,summary-line,to-decide-section,done-section,reflections-section,footer}.tsx`, `copy.ts`. Built from: `AppHeader`, `Text`, `GroupHeading`, `DecisionPanel`, `Collapsible` (Done, Reflections), `ItemRow variant="read-only"` (done rows with an *edit* link → `ItemSheet mode="record"`), `ReflectionBlock`, footer `Button`s, `DiscardDialog`, `TradedUpPicker`. Props: `{ date: string; mode: ReviewMode; returnTo: "review" | "list"; scrollToItemId?: string }`.

**DecisionPanel** — DR-02/05. Folder: `ui/composed/control/decision-panel/`. File: `decision-panel.tsx`, `copy.ts` (*Carry forward · Missed · Change · Carried {n} times since {date}. · Changed from the shift's reason.*).

```ts
export interface Decision =
  | { kind: "carry" }
  | { kind: "missed"; tier: MissTier; reasonKey: string | null; reasonText: string | null; tradedUpItemId: string | null; verdict: "not-counted" | "half" | "missed" };
export interface DecisionPanelProps {
  item: DayItemView;
  state: DecisionState;
  decision: Decision | null;
  reasons: Readonly<Record<MissTier, readonly ReasonView[]>>;
  canCarry: boolean;                       // tasks/appointments only
  carriedCount?: number; carriedSince?: string;
  shiftContext?: { deltaMin: number };     // resolved-by-shift panels
  timeZone: string;
  onCarry: () => void;
  onMissed: () => void;                    // reveals TierRadioRows
  onDecide: (decision: Decision) => void;
  onChange: () => void;                    // reopen chooser
  onTradedUp: () => void;                  // open TradedUpPicker
  note?: string; onNoteChange?: (note: string) => void;
}
```

Sizes: hairline-separated section, 24px vertical padding, no card; two 56px targets (*Carry forward* secondary, *Missed* default; habits show *Missed* alone full width). Motion: chooser reveals 200ms. Used in: DR-01.

**DecidedLine** — 1rem `neutral-600` with the weight phrase in `ink` weight 500; *Change* ghost at right; optional second caption line. Folder: `ui/composed/display/decided-line/`. Props: `{ text: React.ReactNode; weightPhrase: string; onChange: () => void; note?: string }`.

**TradedUpPicker** — DR-04. Folder: `components/traded-up-picker/`. Built from: `ResponsiveSheet`, rows (`ItemIcon`, title, *priority n*, *done 12:40* / *running*, verdict tail 0.75rem `neutral-500`), last row *Something not on the list* → `Input`, footer *Cancel*. Props: `{ open; onOpenChange; missedItem: DayItemView; candidates: readonly (DayItemView & { verdict: "not-counted" | "half" })[]; onPick: (itemId: string) => void; onOther: (text: string) => void }`.

**ReflectionBlock** — per item: `ItemIcon` + title, per axis a `Stepper17` (`captions={false}`), `Textarea` Note. Folder: `ui/composed/control/reflection-block/`. Props: `{ item: DayItemView; axes: readonly { key: string; label: string; value: Stepper17Value | null }[]; note: string; onRate: (axis: string, v: Stepper17Value) => void; onNoteChange: (note: string) => void }`. Used in: DR-06, IT-01.

**BigNumber / FormulaSentence / FactLine** — Folder: `ui/composed/display/big-number/` (one folder, three exports; CC precedent: `Headline/Sub/Microcopy` from one `text/` folder). Props: `BigNumber { value: number | null; size: "day" | "week" }` (Newsreader 1.75rem / 2.25rem wide, `ink`, tabular; renders nothing when null); `FormulaSentence { terms: readonly { count: number; label: string; weight?: "½" | "0" | "not counted" }[]; credit: number; counted: number; percent: number | null }` (Newsreader 1rem `neutral-600`, ≤64ch, zero terms omitted; *Nothing was counted today.* when counted = 0); `FactLine { children: React.ReactNode }` (Geist 0.875rem `neutral-600`). Used in: DR-07, WR-01.

**TemplateUsageRow** — `ListRow` preset: name + *2 of 2* / *used 3* tabular trailing. Folder: `ui/composed/display/template-usage-row/`. Props: `{ name: string; used: number; target: number | null }`.

**HabitStrip / StripSquare** — Folder: `ui/composed/display/habit-strip/` (both exports).

```ts
export interface HabitStripProps {
  habit: HabitSummaryView;
  days: readonly [StripState, StripState, StripState, StripState, StripState, StripState, StripState];  // Mon–Sun
  dayLabels: readonly string[];                 // "Monday" … for aria-labels
  credit: number; counted: number;
  layout: "inline" | "stacked";
  size?: 16 | 20 | 24;
  onOpen: () => void;
}
export interface StripSquareProps { state: StripState; size: 16 | 20 | 24; label: string /* "Tuesday, done" */ }
```

Square rendering: filled `ink` · filled with a 4px `paper` dot · 1px `neutral-400` outline · left-half `ink` fill with outline · outline with a diagonal hairline · nothing (a spacer) · dotted outline. Radius 2. Tooltip on wide. Never colour. Used in: WR-01, WR-02.

**CategoryBar** — 12px flex row, radius full, segments `cat-{key}-500` (uncategorised `neutral-300`) with 1px `paper` gaps; legend rows beneath. Folder: `ui/composed/display/category-bar/`. Props: `{ segments: readonly { key: CategoryKey | null; name: string; minutes: number }[] }`. A11y: `role="img"` with a text summary; the legend is the accessible content. Used in: WR-01.

**DayOutcomeRow / ShiftRow / WeekRow** — Folder: `ui/composed/display/day-outcome-row/`, `shift-row/`, `week-row/`. `DayOutcomeRow { weekday: string; timeLabel?: string; outcome: React.ReactNode; weightPhrase?: string; minutes?: number; quantity?: string; form: "long" | "short"; onOpen?: () => void }`; `ShiftRow { weekday: string; deltaMin: number; atLabel: string; reason: string; cutCount: number; onOpen?: () => void }`; `WeekRow` = `Collapsible` trigger row `{ rangeLabel: string; status: React.ReactNode; onOpenWeek: () => void; children }` expanding to short `DayOutcomeRow`s. Used in: WR-02, WR-04, HS-01.

### 5.10 System components

**FeedbackForm** — SY-01. Folder: `app/(shell)/settings/about/_components/feedback-form.tsx`. Built from: `Textarea` (1000), `Switch` with helper, `Button` Send, sent/error lines. Props: `{ context: { screen: string; version: string } }`.

**InstallSheet** — SY-07. Status: **adapt CC** `InstallPrompt` (`apps/toolkit/app/_components/install-prompt.tsx`; numbered `Step` rows per platform; direct *Install* on Android when `deferredPrompt` exists) into a `ResponsiveSheet` with an `ol`. Folder: `components/install-sheet.tsx`. Props: `{ open; onOpenChange; platform: "ios" | "android" | "desktop"; canPrompt: boolean; onInstall: () => Promise<void> }`. Depends on: `lib/pwa/use-install-prompt.ts` (**reuse CC**), `lib/pwa/install-detection.ts` (**reuse CC**).

**SyncIssuesSheet** — SY-03 (Phase 2). Folder: `components/sync-issues-sheet.tsx`. `ResponsiveSheet` of rows (`ItemIcon`, title, change words, *Try again* / *Discard* ghosts), footer *Try all again* / *Close*. Props: `{ open; onOpenChange; issues: readonly { id: string; item: DayItemView; changeLabel: string }[]; onRetry: (id) => void; onDiscard: (id) => void; onRetryAll: () => void }`.

**SessionExpiredDialog** — SY-04. Folder: `components/session-expired-dialog.tsx`. Prop-based `Dialog`, non-dismissable, one `default` button. Props: `{ open: boolean; timerRunning: boolean; onSignIn: () => void }`.

**TimezoneSwitchDialog** — SY-06. `ConfirmDialog` preset. Folder: `components/timezone-switch-dialog.tsx`. Props: `{ open; onOpenChange; deviceZone: string; storedZone: string; onSwitch: () => void }`.

**ErrorPage** — SY-05. Folder: `ui/composed/layout/error-page/`. Props: `{ variant: "not-found" | "unrecoverable"; onOpenToday: () => void; onReload?: () => void }`. `ScreenFrame` with heading 1.375rem, body, one or two buttons. Used by `app/not-found.tsx` and `app/error.tsx`.

**ShortcutsDialog** — SY-01 `?`. Folder: `ui/composed/feedback/shortcuts-dialog/`. Props: `{ open; onOpenChange; shortcuts: readonly { keys: readonly string[]; label: string }[] }`. `Dialog` with `ListRow`s carrying `Kbd` trailing; wide only.

**UpdateLine / TimezoneLine / InstallLine / PermissionLine** — `StatusLine` presets in `ui/composed/feedback/status-line/presets.tsx` with copy from `copy.ts`; the shell slot chooses them.

---

## 6. Install script and token file

### 6.1 Install, in dependency order

Run from the Synapse repo root (Next 16.3.4, React 19.2, Tailwind v4 already present; Yarn is CC's manager, but Synapse was scaffolded with npm — use whichever the tech spec picks, the commands are the same).

```bash
# 0. Dependencies CC uses that the CLI won't add
npm i next-themes lucide-react sonner class-variance-authority clsx tailwind-merge frimousse emojibase-data react-hook-form @hookform/resolvers zod
npm i -D @storybook/react-vite @storybook/addon-essentials @storybook/addon-themes storybook @tailwindcss/vite vite

# 1. Init — answers: base Radix · style New York · base colour neutral (overridden by tokens.css) · CSS variables yes · icons lucide
#    Then replace the generated components.json with §6.3 so the `ui` alias points at the staging folder.
npx shadcn@latest init

# 2. Foundation primitives (nothing composes without these)
npx shadcn@latest add button label separator skeleton spinner badge kbd empty

# 3. Form primitives
npx shadcn@latest add checkbox radio-group select native-select toggle-group input-group tabs

# 4. Overlays and menus
npx shadcn@latest add dialog alert-dialog sheet drawer popover dropdown-menu tooltip collapsible

# 5. Navigation and feedback
npx shadcn@latest add sidebar sonner

# 6. Not installed via CLI — copied from CC and adapted (paths relative to packages/ui/src unless noted):
#    input (control/input), textarea (control/textarea), helper-text (display/helper-text), switch (control/switch),
#    checkbox-field (control/checkbox/checkbox-field.tsx), text (typography/text), bottom-nav (navigation/bottom-nav),
#    avatar (display/avatar — fallback replaced), toaster (composed/feedback/toaster), loading-text, region-retry (toolkit),
#    search-field, segmented-control, ellipses-menu, text-disclosure-button, emoji-picker, side-channel-drawer,
#    empty-state, autosave-banner, step-nav, use-media-query (lib), use-prefers-reduced-motion (hooks), theme-provider (providers),
#    and from apps/toolkit: lib/hooks/{use-leave-guard,use-local-draft,use-remembered-toggle,use-capture-elapsed,use-avatar-upload}.ts,
#    lib/image/reencode.ts, lib/pwa/{install-detection,push-subscribe,use-install-prompt}.ts, app/_components/service-worker-registration.tsx,
#    app/manifest.ts, public/sw.js, scripts/copy-emoji-data.mjs (+ the "emoji-data" npm script and the predev/prebuild hook).

# 7. Emoji dataset served from our own origin (CC pattern)
npm pkg set scripts.emoji-data="node scripts/copy-emoji-data.mjs" scripts.predev="npm run emoji-data" scripts.prebuild="npm run emoji-data"
```

**Re-slot step (once per primitive, after each `add`).** Move `ui/_shadcn/<name>.tsx` → `ui/primitives/<kind>/<name>/<name>.tsx`; extract the `cva()` call into `<name>.variants.ts`; add `index.ts` exporting the parts and types; add `<name>.stories.tsx`; adjust the `cn` import to the relative path. The kind for each is in §5.0. `ui/_shadcn/` is then empty and stays git-ignored except for a `.gitkeep`.

### 6.2 `ui/styles/tokens.css` — official spec §9.7 in CC's Tailwind v4 idiom

CC's `preset.css` has three layers: raw tokens (`--cc-*`), semantic tokens, and the shadcn bridge at `:root`, with `.dark` overriding the bridge, and `@theme inline` exposing the bridge to Tailwind. Synapse keeps the same three layers with its own names. Hex values below are the official spec §9.3 tables verbatim; this file is the one place hex is permitted.

```css
/**
 * Synapse design tokens — official UX spec §9.3–§9.7, in CC's Tailwind v4 idiom.
 * Three layers: raw scales (--syn-*) → semantic (--paper, --ink, …) → shadcn bridge (--background, …).
 * Apps: @import "tailwindcss"; @import "../ui/styles/tokens.css"; @import "../ui/styles/globals.css";
 */

@custom-variant dark (&:is(.dark, .dark *));

:root {
  /* ---- RAW: neutral (warm ink and paper) ---- */
  --syn-neutral-50:  #FAFAF8;
  --syn-neutral-100: #F3F2EE;
  --syn-neutral-200: #E7E5DF;
  --syn-neutral-300: #D2CFC7;
  --syn-neutral-400: #A6A299;
  --syn-neutral-500: #78746C;
  --syn-neutral-600: #57534C;
  --syn-neutral-700: #3B3834;
  --syn-neutral-800: #25231F;
  --syn-neutral-900: #151412;

  /* ---- RAW: accent (verdigris) ---- */
  --syn-accent-100: #E4F1EE; --syn-accent-200: #C3E1DB; --syn-accent-300: #94C8BE; --syn-accent-400: #5FAA9C;
  --syn-accent-500: #2F8F80; --syn-accent-600: #24736A; --syn-accent-700: #1C5A53; --syn-accent-800: #14423D;

  /* ---- RAW: violet (off-schedule) ---- */
  --syn-violet-100: #EFEAF8; --syn-violet-200: #DCD2F0; --syn-violet-300: #BFAEE1; --syn-violet-400: #9E88CE;
  --syn-violet-500: #7C63B8; --syn-violet-600: #644D9A; --syn-violet-700: #4D3B78; --syn-violet-800: #372A57;

  /* ---- RAW: destructive (one surface: Delete account) ---- */
  --syn-destructive-500: #B4463C;

  /* ---- RAW: category hues (100 / 500 / 700 per spec; 200 / 800 are PROPOSED — see §11 Q2) ---- */
  --syn-cat-leaf-100:  #E6F0E4; --syn-cat-leaf-500:  #4F8A5B; --syn-cat-leaf-700:  #2F5A38;
  --syn-cat-sky-100:   #E4EDF6; --syn-cat-sky-500:   #4B7FB3; --syn-cat-sky-700:   #2C5478;
  --syn-cat-clay-100:  #F6E8E2; --syn-cat-clay-500:  #C0714F; --syn-cat-clay-700:  #7E4530;
  --syn-cat-rose-100:  #F7E6EA; --syn-cat-rose-500:  #B85C74; --syn-cat-rose-700:  #7B3A4B;
  --syn-cat-amber-100: #F8EFDD; --syn-cat-amber-500: #C2923A; --syn-cat-amber-700: #7C5B1F;
  --syn-cat-slate-100: #E8EAEE; --syn-cat-slate-500: #6B7689; --syn-cat-slate-700: #434B5A;
  --syn-cat-plum-100:  #F0E7F1; --syn-cat-plum-500:  #8E5A93; --syn-cat-plum-700:  #5C3860;
  --syn-cat-moss-100:  #EDEFE0; --syn-cat-moss-500:  #7E8B3F; --syn-cat-moss-700:  #4F5826;
  /* [PROPOSED — needs sign-off] dark-theme chip pairings derived, not authored: 800 = 500 mixed 60% into neutral-900; 200 = 100 mixed 25% into 500. */
  --syn-cat-leaf-800:  color-mix(in oklch, var(--syn-cat-leaf-500)  40%, var(--syn-neutral-900));
  --syn-cat-leaf-200:  color-mix(in oklch, var(--syn-cat-leaf-100)  75%, var(--syn-cat-leaf-500));
  --syn-cat-sky-800:   color-mix(in oklch, var(--syn-cat-sky-500)   40%, var(--syn-neutral-900));
  --syn-cat-sky-200:   color-mix(in oklch, var(--syn-cat-sky-100)   75%, var(--syn-cat-sky-500));
  --syn-cat-clay-800:  color-mix(in oklch, var(--syn-cat-clay-500)  40%, var(--syn-neutral-900));
  --syn-cat-clay-200:  color-mix(in oklch, var(--syn-cat-clay-100)  75%, var(--syn-cat-clay-500));
  --syn-cat-rose-800:  color-mix(in oklch, var(--syn-cat-rose-500)  40%, var(--syn-neutral-900));
  --syn-cat-rose-200:  color-mix(in oklch, var(--syn-cat-rose-100)  75%, var(--syn-cat-rose-500));
  --syn-cat-amber-800: color-mix(in oklch, var(--syn-cat-amber-500) 40%, var(--syn-neutral-900));
  --syn-cat-amber-200: color-mix(in oklch, var(--syn-cat-amber-100) 75%, var(--syn-cat-amber-500));
  --syn-cat-slate-800: color-mix(in oklch, var(--syn-cat-slate-500) 40%, var(--syn-neutral-900));
  --syn-cat-slate-200: color-mix(in oklch, var(--syn-cat-slate-100) 75%, var(--syn-cat-slate-500));
  --syn-cat-plum-800:  color-mix(in oklch, var(--syn-cat-plum-500)  40%, var(--syn-neutral-900));
  --syn-cat-plum-200:  color-mix(in oklch, var(--syn-cat-plum-100)  75%, var(--syn-cat-plum-500));
  --syn-cat-moss-800:  color-mix(in oklch, var(--syn-cat-moss-500)  40%, var(--syn-neutral-900));
  --syn-cat-moss-200:  color-mix(in oklch, var(--syn-cat-moss-100)  75%, var(--syn-cat-moss-500));

  /* ---- SEMANTIC (light) — the names this document uses ---- */
  --paper: var(--syn-neutral-50);
  --ink: var(--syn-neutral-800);
  --surface: var(--syn-neutral-100);          /* sheets, skeleton */
  --hairline: var(--syn-neutral-200);
  --text-body: var(--syn-neutral-600);
  --text-secondary: var(--syn-neutral-500);
  --text-muted: var(--syn-neutral-400);       /* large text only */
  --text-disabled: var(--syn-neutral-300);
  --accent: var(--syn-accent-500);            /* now line, markers, ring — never text */
  --accent-text: var(--syn-accent-600);
  --accent-hover-surface: var(--syn-accent-100);
  --violet: var(--syn-violet-500);            /* borders */
  --violet-text: var(--syn-violet-600);
  --violet-band: var(--syn-violet-100);
  --violet-band-text: var(--syn-violet-700);
  --destructive: var(--syn-destructive-500);
  --scrim: rgba(21, 20, 18, 0.4);
  --shadow-overlay: 0 8px 24px rgba(21, 20, 18, 0.12);
  --chip-bg-step: 100; --chip-fg-step: 700;   /* category chip pairing, light */

  /* ---- TYPOGRAPHY ---- */
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-serif: var(--font-newsreader), Georgia, serif;
  --fs-caption: 0.75rem;   --lh-caption: 1.2;
  --fs-secondary: 0.875rem; --lh-secondary: 1.4;
  --fs-body: 1rem;         --lh-body: 1.5;
  --fs-row-title: 1.125rem; --lh-row-title: 1.4;
  --fs-heading: 1.375rem;  --lh-heading: 1.3;
  --fs-review-headline: 1.75rem; --fs-review-headline-wide: 2.25rem; --lh-review-headline: 1.2;
  --fs-timer: 2rem;
  --measure: 64ch;

  /* ---- SPACING (4px base; only these steps) ---- */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px;
  --row-min: 56px; --target: 44px;
  --content-text: 720px; --content-canvas: 960px;
  --header-h: 56px; --tabbar-h: 56px; --rail-w: 220px; --sheet-w: 420px;

  /* ---- RADII ---- */
  --radius: 6px; --radius-sheet: 10px; --radius-full: 9999px;

  /* ---- MOTION ---- */
  --ease-settle: cubic-bezier(0.2, 0, 0, 1);
  --dur-state: 120ms; --dur-sheet: 200ms;

  /* ---- shadcn bridge (light) — official spec §9.7 map ---- */
  --background: var(--syn-neutral-50);
  --foreground: var(--syn-neutral-800);
  --card: var(--syn-neutral-50);
  --card-foreground: var(--syn-neutral-800);
  --popover: var(--syn-neutral-100);
  --popover-foreground: var(--syn-neutral-800);
  --primary: var(--syn-neutral-800);          /* ink, not accent */
  --primary-foreground: var(--syn-neutral-50);
  --secondary: var(--syn-neutral-100);
  --secondary-foreground: var(--syn-neutral-800);
  --muted: var(--syn-neutral-100);
  --muted-foreground: var(--syn-neutral-500);
  --accent: var(--syn-accent-100);            /* hover surfaces only */
  --accent-foreground: var(--syn-accent-700);
  --destructive: var(--syn-destructive-500);
  --destructive-foreground: var(--syn-neutral-50);
  --border: var(--syn-neutral-200);
  --input: var(--syn-neutral-300);
  --ring: var(--syn-accent-500);
  --sidebar: var(--syn-neutral-50);
  --sidebar-foreground: var(--syn-neutral-800);
  --sidebar-primary: var(--syn-neutral-800);
  --sidebar-primary-foreground: var(--syn-neutral-50);
  --sidebar-accent: var(--syn-neutral-100);
  --sidebar-accent-foreground: var(--syn-neutral-800);
  --sidebar-border: var(--syn-neutral-200);
  --sidebar-ring: var(--syn-accent-500);
  --sidebar-width: var(--rail-w);
}

.dark {
  --paper: var(--syn-neutral-900);
  --ink: var(--syn-neutral-100);
  --surface: var(--syn-neutral-800);
  --hairline: color-mix(in srgb, var(--syn-neutral-400) 40%, transparent);
  --text-body: var(--syn-neutral-200);
  --text-secondary: var(--syn-neutral-300);
  --text-muted: var(--syn-neutral-400);
  --text-disabled: var(--syn-neutral-500);
  --accent-text: var(--syn-accent-300);
  --accent-hover-surface: var(--syn-accent-800);
  --violet-text: var(--syn-violet-300);
  --violet-band: var(--syn-violet-800);
  --violet-band-text: var(--syn-violet-200);
  --chip-bg-step: 800; --chip-fg-step: 200;

  --background: var(--syn-neutral-900);
  --foreground: var(--syn-neutral-100);
  --card: var(--syn-neutral-800);
  --card-foreground: var(--syn-neutral-100);
  --popover: var(--syn-neutral-700);
  --popover-foreground: var(--syn-neutral-100);
  --primary: var(--syn-neutral-100);
  --primary-foreground: var(--syn-neutral-900);
  --secondary: var(--syn-neutral-700);
  --secondary-foreground: var(--syn-neutral-100);
  --muted: var(--syn-neutral-700);
  --muted-foreground: var(--syn-neutral-300);
  --accent: var(--syn-accent-800);
  --accent-foreground: var(--syn-accent-200);
  --border: var(--syn-neutral-600);
  --input: var(--syn-neutral-600);
  --ring: var(--syn-accent-400);
  --sidebar: var(--syn-neutral-900);
  --sidebar-foreground: var(--syn-neutral-100);
  --sidebar-primary: var(--syn-neutral-100);
  --sidebar-primary-foreground: var(--syn-neutral-900);
  --sidebar-accent: var(--syn-neutral-800);
  --sidebar-accent-foreground: var(--syn-neutral-100);
  --sidebar-border: var(--syn-neutral-600);
  --sidebar-ring: var(--syn-accent-400);
}

@media (prefers-reduced-motion: reduce) {
  :root { --dur-state: 0ms; --dur-sheet: 0ms; }
}

@theme inline {
  /* bridge → Tailwind colour utilities (bg-background, text-muted-foreground, …) */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* semantic names → utilities (bg-paper, text-ink, border-hairline, text-accent-text, …) */
  --color-paper: var(--paper);
  --color-ink: var(--ink);
  --color-surface: var(--surface);
  --color-hairline: var(--hairline);
  --color-text-body: var(--text-body);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --color-text-disabled: var(--text-disabled);
  --color-accent-text: var(--accent-text);
  --color-accent-mark: var(--syn-accent-500);
  --color-violet-mark: var(--syn-violet-500);
  --color-violet-text: var(--violet-text);
  --color-violet-band: var(--violet-band);
  --color-violet-band-text: var(--violet-band-text);

  /* raw scales → utilities (bg-neutral-100, border-accent-500, bg-cat-leaf-500, …) */
  --color-neutral-50: var(--syn-neutral-50);   --color-neutral-100: var(--syn-neutral-100);
  --color-neutral-200: var(--syn-neutral-200); --color-neutral-300: var(--syn-neutral-300);
  --color-neutral-400: var(--syn-neutral-400); --color-neutral-500: var(--syn-neutral-500);
  --color-neutral-600: var(--syn-neutral-600); --color-neutral-700: var(--syn-neutral-700);
  --color-neutral-800: var(--syn-neutral-800); --color-neutral-900: var(--syn-neutral-900);
  --color-accent-100: var(--syn-accent-100); --color-accent-200: var(--syn-accent-200);
  --color-accent-300: var(--syn-accent-300); --color-accent-400: var(--syn-accent-400);
  --color-accent-500: var(--syn-accent-500); --color-accent-600: var(--syn-accent-600);
  --color-accent-700: var(--syn-accent-700); --color-accent-800: var(--syn-accent-800);
  --color-violet-100: var(--syn-violet-100); --color-violet-200: var(--syn-violet-200);
  --color-violet-300: var(--syn-violet-300); --color-violet-400: var(--syn-violet-400);
  --color-violet-500: var(--syn-violet-500); --color-violet-600: var(--syn-violet-600);
  --color-violet-700: var(--syn-violet-700); --color-violet-800: var(--syn-violet-800);
  --color-cat-leaf-100: var(--syn-cat-leaf-100);   --color-cat-leaf-200: var(--syn-cat-leaf-200);   --color-cat-leaf-500: var(--syn-cat-leaf-500);   --color-cat-leaf-700: var(--syn-cat-leaf-700);   --color-cat-leaf-800: var(--syn-cat-leaf-800);
  --color-cat-sky-100: var(--syn-cat-sky-100);     --color-cat-sky-200: var(--syn-cat-sky-200);     --color-cat-sky-500: var(--syn-cat-sky-500);     --color-cat-sky-700: var(--syn-cat-sky-700);     --color-cat-sky-800: var(--syn-cat-sky-800);
  --color-cat-clay-100: var(--syn-cat-clay-100);   --color-cat-clay-200: var(--syn-cat-clay-200);   --color-cat-clay-500: var(--syn-cat-clay-500);   --color-cat-clay-700: var(--syn-cat-clay-700);   --color-cat-clay-800: var(--syn-cat-clay-800);
  --color-cat-rose-100: var(--syn-cat-rose-100);   --color-cat-rose-200: var(--syn-cat-rose-200);   --color-cat-rose-500: var(--syn-cat-rose-500);   --color-cat-rose-700: var(--syn-cat-rose-700);   --color-cat-rose-800: var(--syn-cat-rose-800);
  --color-cat-amber-100: var(--syn-cat-amber-100); --color-cat-amber-200: var(--syn-cat-amber-200); --color-cat-amber-500: var(--syn-cat-amber-500); --color-cat-amber-700: var(--syn-cat-amber-700); --color-cat-amber-800: var(--syn-cat-amber-800);
  --color-cat-slate-100: var(--syn-cat-slate-100); --color-cat-slate-200: var(--syn-cat-slate-200); --color-cat-slate-500: var(--syn-cat-slate-500); --color-cat-slate-700: var(--syn-cat-slate-700); --color-cat-slate-800: var(--syn-cat-slate-800);
  --color-cat-plum-100: var(--syn-cat-plum-100);   --color-cat-plum-200: var(--syn-cat-plum-200);   --color-cat-plum-500: var(--syn-cat-plum-500);   --color-cat-plum-700: var(--syn-cat-plum-700);   --color-cat-plum-800: var(--syn-cat-plum-800);
  --color-cat-moss-100: var(--syn-cat-moss-100);   --color-cat-moss-200: var(--syn-cat-moss-200);   --color-cat-moss-500: var(--syn-cat-moss-500);   --color-cat-moss-700: var(--syn-cat-moss-700);   --color-cat-moss-800: var(--syn-cat-moss-800);

  /* type, radius, motion → utilities */
  --font-sans: var(--font-sans);
  --font-serif: var(--font-serif);
  --radius-sm: var(--radius); --radius-md: var(--radius); --radius-lg: var(--radius); --radius-xl: var(--radius-sheet);
  --ease-settle: var(--ease-settle);
  --breakpoint-wide: 768px;                    /* the one break: `wide:` variant */
}
```

`ui/styles/globals.css` (the parts that are not tokens): `body { background: var(--paper); color: var(--ink); font-family: var(--font-sans); font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; }` · `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }` · `button { cursor: pointer } button:disabled { cursor: not-allowed }` · the `min-h-screen-safe` / `h-screen-safe` dvh utilities from CC's globals (reuse) · `.tabular-off { font-variant-numeric: normal }` for prose · `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0ms !important; animation-duration: 0ms !important; } }`. No decorative keyframes; CC's grain, glow, diamond, and shimmer classes are not carried.

`app/layout.tsx` wires fonts as create-next-app already does for Geist, plus `Newsreader({ subsets: ["latin"], axes: ["opsz"], variable: "--font-newsreader" })`, and mounts `ThemeProvider attribute="class" defaultTheme="system"` (CC `providers/theme-provider.tsx`), `Toaster`, `ServiceWorkerRegistration`.

### 6.3 `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/ui/_shadcn",
    "ui": "@/ui/_shadcn",
    "utils": "@/ui/lib/cn",
    "lib": "@/ui/lib",
    "hooks": "@/ui/hooks"
  }
}
```

`[VESPER CALL: the `base` (Radix vs Base UI) field is whatever the current CLI schema names it; the answer is Radix. Cost if the CLI's key differs from the day this was written: one line.]`

### 6.4 Storybook

`.storybook/main.ts` and `preview.ts` are CC's (`packages/ui/.storybook/`) with three changes: `stories: ["../ui/**/*.stories.@(ts|tsx)"]`, the `next/link` alias path, and the preview decorator reduced to the theme toggle plus a `bg-paper text-ink` wrapper (CC's marketing-register surfaces are removed). Fonts are loaded in `.storybook/fonts.css` from Google Fonts for stories only.

---

## 7. Build order — Phase 1, in dependency order

Waves run top to bottom; nothing in a wave imports from a later wave. **Bold** entries are on the critical path to a usable Phase 1 (auth → library → templates → week build → Plain List → completion → timers → minimal Day Review). Everything else in a wave can trail by a ticket or two without blocking the next wave. Entries added by the parity pass (§8.2) are included.

**Wave 0 — Foundation (blocks everything)**
1. **`ui/styles/tokens.css`**, **`ui/styles/globals.css`**, fonts in `app/layout.tsx`, **`ThemeProvider`** (reuse CC), **`cn`**, **`useMediaQuery` / `useIsWide`** (reuse CC), `usePrefersReducedMotion` (reuse CC), `types/{domain,ui-state,view}.ts`, `lib/routes.ts`, Storybook.

**Wave 1 — Primitives (install, re-slot, story)**
2. **`button` · `label` · `separator` · `skeleton` · `spinner` · `badge` · `empty`** · `kbd`
3. **`text`** (adapt CC) · **`helper-text`** (reuse CC)
4. **`input`** (adapt CC) · **`textarea`** (adapt CC) · `switch` (reuse CC) · **`checkbox` + `checkbox-field`** · `radio-group` · **`select` + `SelectField`** · `native-select` · **`toggle-group`** (adapt CC) · `input-group` · `tabs`
5. **`dialog`** (adapt CC) · **`alert-dialog` + `ConfirmDialog`** (adapt CC) · **`sheet` + `SheetPanel`** · **`drawer`** · `popover` · **`dropdown-menu`** · `tooltip` · **`collapsible`** (reuse CC wrapper)
6. **`sidebar`** · **`bottom-nav`** (adapt CC) · **`toaster` + `toastUndo`** (adapt CC) · **`avatar`** (adapt CC)

**Wave 2 — Shared composites**
7. **`Text` presets · `TimeText`** · `Tag` · **`CategoryChip`** · **`ItemIcon`** · `GroupHeading`
8. **`ListRow`** · `SettingsRow` · **`EmptyState`** · `SkeletonRow` · `LoadingText` · `RegionRetry` · `TrustLine` · `NoticeLine`
9. **`ResponsiveSheet`** · **`DiscardDialog`** · `TypedConfirmDialog` · `ThreeOptionDialog` · `ArchivedSection` · `ExpanderSection` · `InlineQuestionRow`
10. **`StatusLine`** (+ presets) · **`SaveStatus`** · **`ScreenFrame`** · **`AppHeader`**

**Wave 3 — Shell and entry**
11. **`AppShell` · `TabBar` · `Rail` · `StatusLineSlot`** · `lib/entry/resolve-entry.ts` · `(shell)/layout.tsx` · `ErrorPage` (`not-found.tsx`, `error.tsx`)

**Wave 4 — Form controls**
12. **`SegmentedControl`** (adapt CC) · **`Stepper17`** · `CountStepper` · **`MinutesStepper`** · **`RangeInput`** · **`TimeField`** · `DateField` · `TimezoneSelect`
13. **`ChipPicker`** · `WeekdayChips` · **`ColorSwatchRow`** · **`PickerList`** (over CC `SearchField`) · `NotificationRow`
14. **`IconPicker`**: `EmojiPicker` (reuse CC, with `copy-emoji-data.mjs`) → **`CuratedIconGrid`** → `ImageCropper` + `useIconUpload` (adapt CC `useAvatarUpload` + `reencode.ts`). `[The critical path needs emoji + curated; the image pane can land a ticket later.]`
15. `TierRadioRows` · `ReasonChips` · `StarterSetChooser`

**Wave 5 — Auth and first run**
16. **`AuthFrame` · `OAuthButton`** · **AU-01…05 pages** (Input `mode="email"` / `mode="password"`, `NoticeLine`) · `useLeaveGuard` (reuse CC)
17. **`StepFrame`** · FR-01, FR-02, FR-05 pages (FR-03/04 embed Wave 6 canvases)

**Wave 6 — Setup**
18. **`HabitForm`** (+ `CategorySheet` inline) · `ReasonSheet` · LB-01 / CT-01 / ST-06 pages
19. **`SlotRow` → `SlotSheet` → `TemplateEditor`** (+ `ApplyChangesDialog`) · TP-01 page · FR-03
20. **`DayRow` → `OneOffSheet` → `DaySheet` → `WeekGrid`** · FR-04 · `ReminderPermissionSheet` (first fixed-time save)

**Wave 7 — The day**
21. **`StateWord` · `DayPartHeader` · `DayHeader` · `ItemRow`** · `MultitaskGroup` · `DayCompleteAction` · LS-00 / LS-01 (+ record and plan modes on `/day/{date}`)
22. **`useElapsed` · `TimerDisplay` · `TimerControl` · `SessionRow` · `PreflightNote` · `AddTimeSheet` · `ItemSheet`**
23. `ActionRowSheet` → `DayHeaderSheet` (wake time; shift/trim rows arrive in Phase 2)

**Wave 8 — Minimal Day Review**
24. **`ReviewRegion`** · RV-00 page
25. **`DecisionPanel` · `DecidedLine` · `TradedUpPicker` · `BigNumber` / `FormulaSentence` / `FactLine` · `DayReview`** (live, pending, edit)

**Wave 9 — Settings and system**
26. ST-00/01/07/08/09/10/11 pages · `InstallSheet` (+ PWA plumbing reuse) · `SessionExpiredDialog` · `TimezoneSwitchDialog` · `FeedbackForm` · `ShortcutsDialog` · SY-01 page · N1/N4/N5/N6 landings

**Phase 2 waves (recorded so tickets can be cut later, not sequenced here):** Schedule (`ScheduleAxis`, `NowLine`, `ScheduleBlock`, `WindowSpan`, `GhostBlock`, `ShiftBand`, `ShiftDetailSheet`) → Shift and trim (`LargeTargetRow`, `OverflowCutList`, `ShiftSheet`, `QuickChipRow`, `TrimSheet`, the late-offer line, DH-01's two rows) → Quantity and reflection (`NumberUnitInput`, `ReflectionBlock`, `TimerControl` pause) → Week Review and history (`TemplateUsageRow`, `HabitStrip` / `StripSquare`, `CategoryBar`, `DayOutcomeRow`, `ShiftRow`, `WeekRow`) → Offline (`SyncIssuesSheet`, syncing / sync-issues status lines) → Calendar (ST-12).

---

## 8. Parity checklist — every screen, its components

### 8.1 Screen → components

Composites only; primitives are implied by the composites' `Built from`. Pages are the route files in §3.3.

| Screen | Components | Gap? |
|---|---|---|
| AU-01 Sign in | `AuthFrame`, `OAuthButton`, `Input mode=email`, `Input mode=password`, `Button busy`, `TrustLine`, `NoticeLine`, `StatusLine variant=offline` | — |
| AU-02 Create account | `AuthFrame`, `OAuthButton`, `Input` ×3, `Button`, `TrustLine`, `Text` (invite line) | — |
| AU-03 Check your email | `AuthFrame`, `Button busy` (resend with countdown label), `Text` | — |
| AU-04 Forgot password | `AuthFrame`, `Input mode=email`, `Button`, `NoticeLine` (expired link) | — |
| AU-05 Reset password | `AuthFrame`, `Input mode=password` ×2, `Button` | — |
| AU-06 Sign out | `ConfirmDialog` | — |
| FR-01 Your day | `StepFrame`, `TimeField`, `TimezoneSelect` | — |
| FR-02 Habits | `StepFrame`, `StarterSetChooser`, `ListRow` + `EllipsesMenu`, `HabitForm`, `ConfirmDialog`, `SkeletonRow` | — |
| FR-03 A first template | `StepFrame`, `TemplateEditor embedded` (+ `SlotRow`, `SlotSheet`, `HabitForm`) | — |
| FR-04 This week | `StepFrame`, `WeekGrid embedded` (+ `DayRow`, `DaySheet`, `OneOffSheet`, `EmptyState`) | — |
| FR-05 Ready | `StepFrame` | — |
| LB-01 Library | `AppHeader action`, `SearchField` (CC), `GroupHeading`, `ListRow` (+ `ItemIcon`, `CategoryChip`, `Tag`), `EllipsesMenu`, `ArchivedSection`, `ConfirmDialog`, `EmptyState`, `StarterSetChooser`, `SkeletonRow`, `StatusLine inline` | — |
| LB-02 Habit sheet | `HabitForm` → `ResponsiveSheet`, `Input`, `SegmentedControl`, `IconPicker`, `ChipPicker`, `CategorySheet`, `RangeInput`, `Stepper17`, `Collapsible` + `TextDisclosureButton`, `Textarea`, `Switch`, `ConfirmDialog`, `DiscardDialog` | — |
| LB-03 Habit detail | `AppHeader`, `GroupHeading`, `ListRow`, `EmptyState` | — |
| CT-01 Categories | `AppHeader`, `ListRow` (swatch leading), `EllipsesMenu`, `ConfirmDialog`, `EmptyState` | — |
| CT-02 Category sheet | `CategorySheet` → `ResponsiveSheet`, `Input`, `ColorSwatchRow` | — |
| TP-01 Template list | `AppHeader`, `ListRow`, `EllipsesMenu`, `ConfirmDialog`, `ArchivedSection`, `EmptyState` | — |
| TP-02 Template editor | `TemplateEditor` → `AppHeader` + `SaveStatus`, `Popover` ×3 (`TimeField`, `CountStepper`, `WeekdayChips`), `SlotRow`, `MultitaskGroup`, `InlineQuestionRow`, `EmptyState`, `ApplyChangesDialog`, `toastUndo` | `CountStepper` was missing — added §8.2 |
| TP-03 Slot sheet | `SlotSheet` → `ResponsiveSheet`, `PickerList`, `SegmentedControl` ×2, `TimeField`, `MinutesStepper`, `Stepper17 resting`, `InlineQuestionRow`, `HabitForm` | — |
| TP-04 Apply changes | `ApplyChangesDialog` → `ThreeOptionDialog` | — |
| WK-01 Week build | `WeekGrid` → `AppHeader` + `SaveStatus`, `Button` ghosts, targets line, `DayRow`, `ConfirmDialog` (copy week), `SkeletonRow` | — |
| WK-02 Day sheet | `DaySheet` → `ResponsiveSheet`, `PickerList marker`, `TimeField`, `ListRow`, `Collapsible`, `ItemRow read-only`, `ConfirmDialog`, `TemplateEditor` (in a sheet) | — |
| WK-03 One-off sheet | `OneOffSheet` → `ResponsiveSheet`, `PickerList`, `Input`, `DateField`, `SegmentedControl` ×2, `TimeField`, `MinutesStepper`, `Stepper17`, `InlineQuestionRow`, `HabitForm` | — |
| ST-00 Settings index | `AppHeader`, `ListRow` (avatar card), `SettingsRow`, `StatusLine variant=setup` row, `Button ghost` (sign out), `ConfirmDialog` | — |
| ST-01 Account | `AppHeader`, `AvatarPicker` (CC) / `IconPicker imageOnly`, `Input` ×n, `Button`, `ConfirmDialog` (remove photo) | — |
| ST-06 Reasons | `AppHeader`, `GroupHeading` (tier definitions), `ListRow`, `Tag`, `EllipsesMenu`, `ArchivedSection` | — |
| ST-06a Reason sheet | `ReasonSheet` → `ResponsiveSheet`, `Input`, `TierRadioRows lockedTier` | — |
| ST-07 Notifications | `AppHeader`, `StatusLine placement=inline variant=permission`, `GroupHeading`, `NotificationRow` (with time / day-time values), `InstallSheet variant=notifications` (*How*), `ReminderPermissionSheet` | `InstallSheet variant`, `ReminderPermissionSheet` were missing — added §8.2 |
| ST-08 Day & time | `AppHeader`, `TimeField` ×3, `ListRow` (wake-up habit → LB-01), `TimezoneSelect`, `Button` | — |
| ST-09 Appearance | `AppHeader`, `radio-group` rows | — |
| ST-10 Your data | `AppHeader`, `TrustLine`, `Button busy`, `LoadingText`, `Text` (ready line + download link), `Button ghost` → ST-10a | — |
| ST-10a Delete account | `TypedConfirmDialog` | — |
| ST-11 Share the app | `AppHeader`, `Text`, `Button` (Web Share / copy, `useShare` hook) | — |
| ST-12 Calendar (P2) | `AppHeader`, `Button`, `NotificationRow` (calendars, rules), `ConfirmDialog` | — |
| SH-00 Shell | `AppShell`, `TabBar`, `Rail`, `AppHeader`, `StatusLineSlot` → `StatusLine` | — |
| LS-00 Empty day | `DayHeader`, `EmptyState` (2–3 actions), `toastUndo` | — |
| LS-01 Plain List | `DayHeader`, `DayPartHeader`, `ItemRow`, `MultitaskGroup`, `StateWord`, `TimeText`, `ExpanderSection` ×2, `DayCompleteAction`, `SkeletonRow`, `toastUndo` | — |
| LS-02 / LS-03 Expanders | `ExpanderSection`, `ItemRow variant=faded-with-action` | — |
| DH-01 Day header sheet | `DayHeaderSheet` → `ActionRowSheet` | — |
| DH-02 Set wake time | `DayHeaderSheet` (wake-time-sheet) → `ResponsiveSheet`, `TimeField`, `Button ghost` (Clear) | — |
| IT-01 Item sheet | `ItemSheet` → `ResponsiveSheet header/headerAction`, `ItemIcon`, `CategoryChip`, `Tag`, `TimeText`, `StateWord`, `PreflightNote`, `TimerDisplay`, `TimerControl`, `SessionRow`, `NumberUnitInput` (P2), `ReflectionBlock` (P2), `Textarea`, `Button`s, `ConfirmDialog` (remove one-off), `OneOffSheet` (edit) | — |
| IT-02 Add time by hand | `AddTimeSheet` → `ResponsiveSheet`, `TimeField` ×2, `toastUndo` | — |
| SC-01 Schedule (P2) | `DayHeader`, `ScheduleAxis`, `NowLine`, `ScheduleBlock`, `WindowSpan`, `GhostBlock`, `ShiftBand`, `SkeletonBlock`, `EmptyState` | — |
| SC-02 Shift band detail (P2) | `ShiftDetailSheet` | — |
| SF-01 Shift my day (P2) | `ShiftSheet` → `ResponsiveSheet tall`, `LargeTargetRow`, `NumberUnitInput`, `TierRadioRows`, `ReasonChips` (Other), `OverflowCutList`, `toastUndo` | — |
| Late offer (P2) | `StatusLine variant=late-offer` | — |
| TR-01 Less time (P2) | `TrimSheet` → `ResponsiveSheet`, `NumberUnitInput`, `QuickChipRow`, `ItemRow faded-with-action` | — |
| PN-01…09 | routes + `ItemSheet` / `DayReview` / `WeekGrid` landings; no new components | — |
| RV-00 Review tab | `AppHeader`, `ReviewRegion` ×3, `ListRow` (pending days), `RegionRetry`, `SkeletonRow` | — |
| DR-01 Day Review | `DayReview` → `AppHeader`, `Text` (summary), `GroupHeading`, `DecisionPanel`, `Collapsible` (Done, Reflections), `ItemRow read-only`, `ReflectionBlock` (P2), `Button`s, `DiscardDialog`, `useLeaveGuard` | — |
| DR-02 / DR-05 Panels | `DecisionPanel`, `DecidedLine` | — |
| DR-03 Tier chooser | `TierRadioRows`, `ReasonChips`, `Input` (Other), `Textarea` (note) | — |
| DR-04 Traded-up picker | `TradedUpPicker` | — |
| DR-06 Reflections (P2) | `Collapsible`, `ReflectionBlock` | — |
| DR-07 Finished | `AppHeader`, `BigNumber`, `FormulaSentence`, `FactLine`, `Button` | — |
| WR-01 Week Review (P2) | `AppHeader`, `BigNumber`, `FormulaSentence`, `FactLine`, `TemplateUsageRow`, `HabitStrip` / `StripSquare`, `ListRow` (deep work, tasks, shifts), `CategoryBar`, `SkeletonRow`, `EmptyState` | — |
| WR-02 Habit strip detail (P2) | `AppHeader`, `HabitStrip size=24`, `DayOutcomeRow form=long`, `FactLine` | — |
| WR-03 Carried (P2) | `AppHeader`, `ListRow`, `EmptyState` | — |
| WR-04 Shifts (P2) | `AppHeader`, `ShiftRow`, `Text` (summary), `EmptyState` | — |
| HS-01 History (P2) | `AppHeader`, `WeekRow` → `DayOutcomeRow form=short`, `Button ghost` (Show earlier weeks), `EmptyState` | — |
| SY-01 About & feedback | `AppHeader`, `Text`, `FeedbackForm`, `ListRow` + `Kbd` (shortcuts, wide), `TrustLine` | — |
| SY-02 Update available | `StatusLine variant=update` | — |
| SY-03 Sync issues (P2) | `StatusLine variant=sync-issues`, `SyncIssuesSheet` | — |
| SY-04 Session expired | `SessionExpiredDialog` | — |
| SY-05 Error page | `ErrorPage` | — |
| SY-06 Time-zone mismatch | `StatusLine variant=timezone`, `TimezoneSwitchDialog` | — |
| SY-07 Install | `StatusLine variant=install`, `InstallSheet` | — |
| Record / plan mode (cross-cutting §8.2) | `AppHeader dateContext`, `DayHeader mode`, `ItemRow read-only`, `ItemSheet mode`, `DayHeaderSheet mode`, `ConfirmDialog` (remove on a reviewed day) | — |
| `?` Shortcuts | `ShortcutsDialog` | — |

### 8.2 Gaps found by the checklist, closed here

Four components that the four UX docs require and neither v1 nor §5 above named. They are part of the list from this point; counts in §9 include them.

**AuthFrame** — Purpose: the one skeleton for AU-01…05. Status: **adapt CC** `AuthCapturePanel` skeleton only (`composed/auth/auth-capture/auth-capture-panel.tsx`: wordmark → heading → form → footer links; Supabase wiring and CC copy removed). Folder: `ui/composed/layout/auth-frame/`. File: `auth-frame.tsx`. Props: `{ heading: string; lead?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; trustLine?: boolean; offline?: boolean }`. Width `max-w-sm`, centred on wide; heading 1.375rem; the wordmark is `Text weight=500`, no logo. Used in: AU-01…05.

**OAuthButton** — Purpose: *Continue with Google*. Status: build (CC's Google button belongs to an unshipped Path-A surface). Folder: `ui/composed/control/oauth-button/`. Props: `{ provider: "google"; label: string; onClick: () => void; busy?: boolean; disabled?: boolean }`. `Button variant="secondary"` full width, 44px, the G mark 18px at left, label centred, no brand fill; loading state on this button only. Used in: AU-01, AU-02.

**CountStepper** — Purpose: the small 0–7 integer stepper (TP-02 weekly target). Status: build (over `input-group`). Folder: `ui/composed/control/count-stepper/`. Props: `{ value: number; min: number; max: number; onChange: (value: number) => void; label: React.ReactNode; helperText?: React.ReactNode; zeroLabel?: string /* "none" */; disabled? }`. 44px addons, 56px value cell, tabular; `spinbutton` semantics. Used in: TP-02 (inside the Target popover).

**ReminderPermissionSheet** — Purpose: the in-context permission ask (official spec §8.3; Epic 1 §8.7). Status: build (CC asks from a banner and a settings row, never in context). Folder: `components/reminder-permission-sheet.tsx`, `copy.ts` (*Want a reminder at {time} when this comes up? Reminders are only ever the times you set.* — **Turn on reminders** · **Not now**; iOS-not-installed variant with *How to install*). Props: `{ open; onOpenChange; timeLabel: string; platform: "ios-not-installed" | "supported"; onTurnOn: () => Promise<PermissionState>; onNotNow: () => void; onHowToInstall?: () => void }`. Depends on: `lib/pwa/push-subscribe.ts` (reuse CC), `useRememberedToggle` (reuse CC) for the never-again flag. Used in: TP-03 / WK-03 first fixed-time save; ST-07's *Turn on reminders*.

**InstallSheet `variant`** (amendment to §5.10) — add `variant: "install" | "notifications"` so ST-07's *How* opens the same sheet with the OS notification-settings steps per platform. No new component.

---

## 9. Counts and phasing

Counted against §5 plus the four §8.2 additions.

| Layer | Entries | Reuse (copy) | Adapt | Build new | Notes |
|---|---|---|---|---|---|
| Primitives (§5.0, §2.7) | 31 | 6 (`helper-text`, `switch`, `checkbox-field`, `empty`, `sidebar`, `collapsible` wrapper) | 11 (`input`, `textarea`, `select`+`SelectField`, `sheet`+`SheetPanel`, `dialog`, `alert-dialog`+`ConfirmDialog`, `toggle-group`, `skeleton`, `toaster`, `avatar`, `bottom-nav`, `text`) | 14 CLI installs, re-skinned | 27 via the shadcn CLI, 4 CC-origin |
| Composites — shell (§5.2) | 7 | 1 (`Rail`) | 3 (`AppShell`, `TabBar`, `StatusLine`) | 3 | |
| Composites — typography (§5.1) | 2 | — | 2 (`Text`, `TimeText`) | — | |
| Composites — containers & feedback (§5.3) | 11 | 2 (`LoadingText`, `RegionRetry`) | 5 (`ResponsiveSheet`, `EmptyState`, `SkeletonRow`, `SaveStatus`, `NoticeLine`) | 4 | |
| Composites — form controls (§5.4 + `CountStepper`, `OAuthButton`) | 22 | — | 4 (`SegmentedControl`, `IconPicker`, `TimeField`, `DateField`) | 18 | `PickerList` and `IconPicker` embed CC's `SearchField` and `EmojiPicker` unchanged |
| Composites — lists & rows (§5.5) | 9 | 1 (`ArchivedSection`) | 3 (`ListRow`, `SettingsRow`, `NotificationRow`) | 5 | |
| Composites — day (§5.6) | 18 | 1 (`ExpanderSection`) | 1 (`TimerDisplay` via `useElapsed`) | 16 | |
| Composites — schedule (§5.7) | 7 | — | — | 7 | all Phase 2 |
| Composites — setup (§5.8 + `AuthFrame`) | 13 | — | 2 (`StepFrame`, `AuthFrame`) | 11 | |
| Composites — review (§5.9) | 16 | — | — | 16 | 7 are Phase 2 |
| Composites — system (§5.10 + `ReminderPermissionSheet`) | 9 | — | 1 (`InstallSheet`) | 8 | |
| **Composites total** | **114** | **5** | **21** | **88** | v1 had 89; the difference is honest splitting (`CuratedIconGrid`, `ImageCropper`, `AddTimeSheet`, `DayHeaderSheet`, `StatusLineSlot`, `TypedConfirmDialog`, `NoticeLine`, `Tag`, `Text`, `TimeText`, presets) plus the four gaps |

Of the 88 build-new composites, 31 are presets or thin wrappers under ~40 lines (`DiscardDialog`, `TypedConfirmDialog`, `ThreeOptionDialog`, `TrustLine`, `Tag`, `GroupHeading`, `CategoryChip`, `ItemIcon`, `DayPartHeader`, `StateWord`, `PreflightNote`, `SessionRow`, `QuickChipRow`, `LargeTargetRow`, `WeekdayChips`, `ColorSwatchRow`, `DateField`, `TimezoneSelect`, `MultitaskGroup`, `DayCompleteAction`, `ActionRowSheet`, `ReviewRegion`, `DecidedLine`, `TemplateUsageRow`, `FactLine`, `WindowSpan`, `GhostBlock`, `ShiftBand`, `NowLine`, `TimezoneSwitchDialog`, `SessionExpiredDialog`).

**Files reused from CC outside the component list** (copied, token-swapped): `lib/cn.ts`, `lib/use-media-query.ts`, `hooks/use-prefers-reduced-motion.ts`, `providers/theme-provider.tsx`, `.storybook/*`; from the toolkit: `use-leave-guard.ts`, `use-local-draft.ts`, `use-remembered-toggle.ts`, `use-capture-elapsed.ts` (→ `use-elapsed.ts`), `use-avatar-upload.ts` (→ `use-icon-upload.ts`), `image/reencode.ts`, `pwa/install-detection.ts`, `pwa/push-subscribe.ts`, `pwa/use-install-prompt.ts`, `service-worker-registration.tsx`, `manifest.ts` (values replaced), `public/sw.js`, `scripts/copy-emoji-data.mjs`, the `routes.ts` builder pattern, the `entry-state-to-route.ts` pattern. Twenty files that v1 would have written from scratch.

**Phase 1** needs 92 of the 114 composites — everything except the 22 in the Phase 2 waves (§7): the seven schedule pieces, `ShiftSheet`, `OverflowCutList`, `LargeTargetRow`, `TrimSheet`, `QuickChipRow`, `NumberUnitInput`, `ReflectionBlock`, `TemplateUsageRow`, `HabitStrip`, `StripSquare`, `CategoryBar`, `DayOutcomeRow`, `ShiftRow`, `WeekRow`, `SyncIssuesSheet`. The Phase-1 **critical path** is the 46 bold entries in §7.

**What CC materially removes from the build:** the emoji picker and its self-hosted dataset; the image re-encode/EXIF pipeline and the pick/commit/discard upload grammar; the responsive sheet switch; the prop-based confirm/dialog/sheet wrappers; the field-owns-its-label input family with the text Show/Hide; the leave guard and local draft hooks; every piece of PWA plumbing (manifest, service worker, install detection and prompt, push subscribe); the sidebar; the toast wrapper; the typography primitive's axis design; the Storybook config. Roughly a fifth of Phase 1 by ticket count, and the fifth with the most platform edge cases.

---

## 10. Divergences declared (CC convention vs. Synapse UX or Synapse repo)

Each is a place where this document does not follow CC, with the reason and what it would cost to align. Taylor may want CC updated, or the divergence justified — either is fine; none is silent.

| # | CC does | Synapse does | Why | Cost to align to CC |
|---|---|---|---|---|
| D1 | Turborepo; UI vocabulary in `packages/ui` | Single app; vocabulary in `ui/` | CC's own rule #1 (one app → in the app); Synapse has no second app | A folder move plus path prefixes (§3.1); zero contract change |
| D2 | Bottom sheet = Radix `Sheet side="bottom"`; no drag handle, no drag-to-dismiss | Compact sheet = `drawer` (Vaul) with handle and drag-to-dismiss | Epic 1 §0.3 and cross-cutting §2.2 specify the handle and drag-to-dismiss; every sheet in the product is a one-handed surface | Drop Vaul, keep CC's bottom Sheet: lose drag-to-dismiss (swipe still closes via system back/Esc/button). One dependency and ~30 lines in `ResponsiveSheet` |
| D3 | Primitives in the `forwardRef` + `displayName` era with `tailwindcss-animate` | Primitives as the current CLI emits them (`data-slot`, ref-as-prop on React 19, `tw-animate-css`) | Synapse installs fresh; rewriting current output to an older shape buys nothing; CC itself mixes both eras | Mechanical per-file edit; not recommended |
| D4 | Button variants `fill · outline · ghost · link · link-editorial · destructive` | `default · secondary · ghost · destructive` | Official spec §9.7 names them; there is no link variant because text links are `Link` + `Text` | A rename map if the packages ever merge |
| D5 | Toasts bottom-centre <768, bottom-right ≥768, 5 s, `theme="dark"` | Bottom-centre always, 4 s default (5/10 s for undo), themed by token | Official spec §9.7: bottom, one at a time, 4 s | Three props on `Toaster` |
| D6 | Forms validate blur-first (`mode: "onBlur"`) | Validate on submit, then live per erred field | Epic 1 §0.3 rule | Two options on the same `useZodForm` call |
| D7 | Presentation breakpoint `sm` (640px) | One break at 768px (`wide:`) | Cross-cutting §2.1 | A string in `useIsWide` |
| D8 | `Label` and `Text variant="label"` are uppercase, tracked | No all-caps anywhere; labels are 0.875rem weight 500 sentence case | Official spec §9.4 | Skin only |
| D9 | Status strip is `Alert variant="warning"` | `StatusLine` is a neutral `role="status"` band, never an alert | Official spec §9.3 (nothing amber/red on the tabs); v1 rule | Skin and role only |
| D10 | Helper error text in `--destructive` (rust) | Error helper in `ink`, `role="alert"`; no red field | Epic 1 §0.3: "no field turns red" | One token |
| D11 | Focus ring offset 3px | 2px | Official spec §5.9 | One CSS line |
| D12 | Delete account = consequences-first inline confirm | Typed *delete* confirm | Official spec §4.1 and §10.3 | — (UX authority) |
| D13 | `EmptyState` carries the diamond ornament and a display headline | No ornament; one 1rem sentence; 1–3 actions | Official spec §9.7: two lines, no illustrations | Props |
| D14 | Compact tab bar items lack `aria-current` (active by class only) | `aria-current="page"` on the active item | A11y floor | Worth back-porting to CC |
| D15 | Timer clock ticks at 500 ms | 1 Hz, `aria-live="off"` | Official spec §9.6/§11: digits change, nothing else moves | One constant |

---

## 11. Blocking questions for Taylor

Only the two that change what gets built, not how it looks.

**Q1 — Repo shape: standalone, or `apps/synapse` inside the CC Turborepo consuming `@cc/*`?** This document assumes standalone (D1). If Synapse instead joins the CC monorepo, "reuse" changes meaning: the primitives would be *imported* from `@cc/ui` rather than copied, and CC's brand tokens would leak unless every reused primitive grows a register/theme axis — which is exactly the `darkBackground`-style complexity CC is trying to retire. I recommend standalone with copy-and-adapt; the cost is that CC and Synapse drift independently, which for two products with different brands is correct. Answer needed before Wave 1 starts.

**Q2 — Category hues, steps 200 and 800.** Official spec §9.3 defines chips as "100 background / 700 text in light, 800 background / 200 text in dark" but the table only gives 100, 500, 700 per key. §6.2 ships 200/800 as `color-mix()` derivations marked `[PROPOSED — needs sign-off]`. Either confirm the derivation or supply sixteen hexes; the `CategoryChip` contract is unchanged either way. Needed before the Wave 2 `CategoryChip` story is signed off in dark.

Not blocking, recorded as assumptions: `[ASSUMPTION: data transport is Supabase client + TanStack Query, not tRPC — the data-bound composites' hooks are written transport-agnostic (a `use-<feature>.ts` in `lib/hooks/` owning queries/mutations), so either choice fits without touching §5.]` · `[ASSUMPTION: the ~80 curated Lucide glyph names and the IANA zone grouping are content files (`components/icon-picker/curated-icons.ts`, `lib/constants/timezones.ts`) supplied at build time, not decisions this document makes.]`

---

## 12. Calls made in this pass (flip freely)

1. Single app mirroring CC's layering; not a Turborepo (§3.1, D1).
2. Radix base, current CLI output era, re-slotted into CC's folder shape via a staging alias (§2.2, §2.3, D3).
3. Vaul for the compact sheet; CC's Radix bottom sheet otherwise (D2).
4. No `field`, `item`, `button-group`, `scroll-area`, `progress`, `command` — CC's equivalents instead (§2.6).
5. `PickerList` on `SearchField` + a listbox; no cmdk.
6. `Text` becomes the single typography primitive with a Synapse scale; v1's per-component rem values are now `variant`s.
7. `TimeText` formats in the day's zone through `Intl.DateTimeFormat`; no date library in `ui/`.
8. The elapsed timer shows mm:ss under an hour and h:mm:ss after.
9. Tab bar uses `aria-current` links, not a `tablist` (cross-cutting §11 said `tablist`; §5.2 explains).
10. The image crop UI is a Phase-1 nicety; the upload pipeline and contract don't depend on it.
11. Storybook is adopted for `ui/`; data-bound composites are exercised in the app.
12. `useDismissed(key, scope)` unifies CC's three dismissal mechanisms for the status lines.
13. The four §8.2 gaps are closed here rather than sent back to the epic docs; their copy is already in those docs.

## 13. Sign-off

Vesper — CC has been read as a codebase, not as a tree: its rules are stated as rules in §3.2 with the file that proves each one, every one of the 114 composites has a folder, a file, a status against CC, and a props contract in CC's typing style, the primitives are re-verified against what CC actually vendored, the token file is written in CC's Tailwind v4 idiom with the official spec's map, the Phase-1 build order has a marked critical path, and the parity pass found and closed four gaps. Fifteen divergences are declared with their cost, and two questions genuinely block. Ready for tickets after Q1.
