# INF-3 — Design tokens, theme (light/dark), the typography primitive, and Storybook

**Epic:** INF — Infrastructure · **Phase 1** · Size: L
**Slice type:** Design-system foundation — the token file, the theme runtime, the one typography primitive, and the workshop. The failure class is a wrong token value or a brand leak from CC that every component then inherits.
**Vesper review:** the rendered token sheet in Storybook against the official spec §9.3 tables, both themes; the `Text` scale against §9.4; the theme control's three states.

**Status:** Complete (2026-09-04) — Vesper review pending

> **Vesper — visual review.** Before closing: open Storybook, toggle the toolbar theme, and check (1) the palette story shows every neutral/accent/violet step and the eight category hues at 100/500/700 with the spec's hex; (2) the `Text` overview shows seven variants at the §9.4 sizes with tabular numerals on; (3) nothing gold, crimson, parchment, or Cormorant survives from CC. State which theme(s) were checked.

---

## Outcome

`packages/config/tailwind/preset.css` is the official spec §9.7 variable map in CC's three-layer Tailwind v4 idiom; `packages/ui/src/styles/globals.css` carries the resets and the focus ring; `@syn/ui` exposes `ThemeProvider`, `useAppTheme`, a `ThemeControl` (System · Light · Dark), the `Text` primitive with Synapse's scale, `cn`, `useMediaQuery`/`useIsWide`, and `usePrefersReducedMotion`; and Storybook runs with CC's theme toolbar and a palette story. Geist Sans and Newsreader are wired through `next/font` in the app (INF-7 mounts them; this ticket defines the CSS variables they fill). No shadcn component is installed yet — INF-4.

## Why / intent

- **Official spec §9.3–§9.7** — colour scales, typography, spacing, motion, the variable map. **v2 handoff §6.2** is that map already written in CC's idiom; **§5.1** is the `Text` contract; **§6.4** the Storybook adaptation. **README § Locked scope:** light/dark via `next-themes`, class strategy.
- **CC `packages/config/tailwind/preset.css`** — the three-layer shape (raw → semantic → bridge, `.dark` overrides, `@theme inline`). **CC `packages/ui/src/styles/globals.css`** — `@custom-variant dark`, resets, the dvh utilities. **CC `providers/theme-provider.tsx` + `hooks/use-theme.ts`** — the runtime. **`taylor-aucoin/app/admin/_components/theme-toggle.tsx`** — the roving-tabindex group and the `useSyncExternalStore` hydration guard (the pattern; not its icons or its scoping to `/admin`).
- **CC `component-guidelines.md` §6** — Storybook conventions; **CC `packages/ui/.storybook/*`**.
- **What this slice is NOT (binding):** it installs no shadcn primitives, writes no composed component beyond `ThemeControl`, and does not touch `apps/web` except to note what INF-7 must import.
- **Ground truth:** `packages/ui` is an emptied workspace (INF-1); `packages/config/tailwind/preset.css` is a header comment.

**Rulings this slice makes (labelled, logged):**

- **The token file is the v2 handoff §6.2 verbatim**, including the `[PROPOSED]` category 200/800 `color-mix()` derivations, which stay marked until Taylor answers handoff §11 Q2. Logged.
- **`ThemeProvider` is CC's** (`attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`) **plus `storageKey` from `STORAGE_KEYS.THEME`** (taylor-aucoin's namespacing, so an unrelated app on `localhost` cannot hand Synapse a theme). `enableColorScheme` stays on (default) — Synapse has no light-scoped subtree to protect, unlike the admin tree that motivated turning it off. Logged.
- **`ThemeControl` is a composed component in `@syn/ui`, not app code**, because ST-09 (settings) and the Storybook toolbar both need it, and the future mobile app will re-skin it over the same `useAppTheme`. It renders three **labelled** radio rows (System · Light · Dark), per Epic 1 ST-09, not icon-only buttons — official spec §9.9: icons never stand alone. Logged.
- **Fonts via `next/font/google`** (Geist and Newsreader), exposing `--font-geist-sans` and `--font-newsreader`; the scaffold's `GeistVF.woff` files were deleted in INF-1. Reason: no font files to vendor, Next self-hosts at build. `[REVISIT: if the offline PWA (Phase 2) needs guaranteed font availability without a network, switch to `next/font/local`.]` Logged.
- **Storybook 8 on `@storybook/react-vite`** exactly as CC (CC's `.storybook/main.ts` explains why not `@storybook/nextjs` on Next 16). Logged.

## Behaviour & states

**Surfaces:** Storybook only.

### Files to create (exact)

**`packages/config/tailwind/preset.css`** — the v2 handoff §6.2 file, verbatim, with two edits: the header comment names the file's location; the `@custom-variant dark` line moves to `globals.css` (CC puts it there, after `@import "tailwindcss"`). Everything else — raw `--syn-*` scales, semantic names, the shadcn bridge, the `.dark` block, the reduced-motion block, `@theme inline` — as written.

**`packages/ui/src/styles/globals.css`** — CC's file with the brand removed:
```css
@import "tailwindcss";
@plugin "tw-animate-css";            /* what the current shadcn CLI expects; CC used tailwindcss-animate */
@custom-variant dark (&:is(.dark, .dark *));
@import "@syn/config/tailwind/preset.css";
@source "../**/*.{ts,tsx}";
```
then: the `min-h-screen-safe` / `h-screen-safe` / `max-h-screen-safe` utilities (copy), `*,*::before,*::after { box-sizing: border-box }`, `body { margin:0; background: var(--paper); color: var(--ink); font-family: var(--font-sans); font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; }`, `button { cursor: pointer } button:disabled { cursor: not-allowed }`, `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }`, `.tabular-off { font-variant-numeric: normal }`, and the reduced-motion block from the handoff §6.2 prose. **Nothing else from CC's globals**: no scrollbars, no `.cc-*` classes, no keyframes, no grain, no glow, no ornament.

**`packages/ui/src/lib/cn.ts`** — copy CC's. **`packages/ui/src/lib/use-media-query.ts`** — copy CC's; add `export function useIsWide(): boolean { return useMediaQuery("(min-width: 768px)"); }` (v2 handoff D7). **`packages/ui/src/hooks/use-prefers-reduced-motion.ts`** — copy CC's.

**`packages/ui/src/providers/theme-provider.tsx`** — copy CC's; add `storageKey={STORAGE_KEYS.THEME}` (import from `@syn/constants`); rewrite the doc block for Synapse (no marketing register). **`packages/ui/src/hooks/use-theme.ts`** — copy CC's `useAppTheme` verbatim.

**`packages/ui/src/composed/control/theme-control/`** — `theme-control.tsx`, `theme-control.stories.tsx`, `copy.ts`, `index.ts`. Contract:
```ts
export interface ThemeControlProps {
  label?: React.ReactNode;          // default "Appearance"
  helperText?: React.ReactNode;     // default "Follows your device unless you choose."
  className?: string;
}
```
Renders a `role="radiogroup"` of three 56px rows (System · Light · Dark) with a native `<input type="radio">` each (visually replaced per INF-4's radio-group skin once it exists; until then a plain styled radio), roving tabindex as in taylor-aucoin's toggle, the `useSyncExternalStore` hydration guard so the server render has no pressed state, and `useAppTheme().setTheme` on change. Selection applies immediately; no save button (Epic 1 ST-09).

**`packages/ui/src/primitives/typography/text/`** — `text.tsx`, `text.variants.ts`, `text.stories.tsx`, `index.ts`: the v2 handoff §5.1 contract (variants `caption · secondary · body · row-title · heading · review-headline · review-sentence`; tones `ink · body · secondary · muted · accent · violet`; `weight`, `tabular`, `balance`, `truncate`; heading-tag inference; the `Heading`, `Caption`, `Meta` presets). Structure copied from CC's `text.tsx`/`text.variants.ts`; `darkBackground` and `lightRegister` removed; tones map to `text-ink`, `text-text-body`, `text-text-secondary`, `text-text-muted`, `text-accent-text`, `text-violet-text` (all theme-responsive through the semantic tokens). `review-*` variants use `font-serif`.

**`packages/ui/src/branding/`** — `tokens.ts` (typed mirrors of the token names, CC's shape, Synapse's names), `palette.stories.tsx` (a story rendering every raw step as a swatch with its token name and computed hex, both themes via the toolbar), `index.ts`.

**`packages/ui/src/index.ts`** — exports `cn`, `ThemeProvider`, `useAppTheme`, `useMediaQuery`, `useIsWide`, `usePrefersReducedMotion`, `Text`, `Heading`, `Caption`, `Meta`, `textVariants`, `TEXT_VARIANTS`, `TEXT_TONES`, `ThemeControl`, branding.

**`packages/ui/package.json`** — CC's shape: `exports` enumerated (`.`, `./providers/theme-provider`, `./hooks/use-theme`, `./hooks/use-prefers-reduced-motion`, `./cn`, `./text`, `./theme-control`, `./styles/globals.css`); dependencies `@syn/constants`, `@syn/utils`, `class-variance-authority ^0.7`, `clsx ^2`, `tailwind-merge ^3`, `next-themes ^0.4` (CC patches it — check whether the patch is still needed on the current `next-themes`; if it is, copy `.yarn/patches/` and the `patch:` resolution; log either way); devDependencies `@syn/config`, `@storybook/addon-essentials ^8.6`, `@storybook/addon-themes ^8.6`, `@storybook/react-vite ^8.6`, `storybook ^8.6`, `@tailwindcss/vite ^4.1`, `vite ^6`, `tailwindcss ^4.1`, `tw-animate-css`, `next 16.3.4`, `react 19.2.8`, `react-dom 19.2.8`, `@types/react`, `@types/react-dom`, `eslint`, `typescript 5.9.2`; peerDependencies `next >=16`, `react ^19`, `react-dom ^19`, `tailwindcss ^4`.

**`packages/ui/.storybook/`** — copy CC's `main.ts`, `preview.ts`, `next-link-mock.tsx`; `main.ts` `stories: ["../src/**/*.stories.@(ts|tsx)"]` and `staticDirs` pointing at `../../../apps/web/public`; `preview.ts` reduced to `withThemeByClassName({ themes: { light: "", dark: "dark" }, defaultTheme: "light" })` and a wrapper `div.bg-paper.text-ink.min-h-[280px].p-8` — the marketing-register branches are removed; `fonts.css` loads Geist and Newsreader from Google Fonts for stories only.

**`apps/web/app/globals.css`** — becomes `@import "tailwindcss"; @import "@syn/config/tailwind/preset.css"; @import "@syn/ui/styles/globals.css"; @source "../../**/*.{ts,tsx}";` (CC's toolkit `globals.css` shape). `apps/web/package.json` gains `@syn/ui`, `@syn/config` and `next-themes`. INF-7 mounts the provider; this ticket only makes the import resolvable.

**States (exhaustive):** Storybook boots (`yarn ui:storybook`) · toolbar toggles `.dark` on `<html>` and every token story re-renders · `Text` overview renders all variants × tones · `ThemeControl` story cycles System/Light/Dark and `document.documentElement.classList` follows · reduced-motion emulation zeroes the duration tokens.

## Non-negotiables (this slice)

- **No CC brand value survives.** No gold, crimson, parchment, rose, earth, sage; no Cormorant or Jost; no `--cc-*` name.
- **No hex outside `preset.css`.** Every component references a token name.
- **Tabular numerals on by default** (`body`), with an opt-out class, never the reverse.
- **The accent never fills a surface.** `--primary` is ink.
- **Theme is class strategy on `<html>` with `suppressHydrationWarning`** (INF-7 sets it); never inline `style` colour on `<html>`.

## Data & AI

**Schema changes: none.** **Tables:** none. **Placement:** README path remap; CC `packages/ui/src/{lib,hooks,providers,styles,branding,primitives/typography,composed/control}`. **tRPC / validators:** none. **AI notes: None.** **Instrumentation: none.**

## Accessibility

- `ThemeControl`: `radiogroup` with a visible label; each option a real radio with a visible text label; arrow keys move focus, Space selects; no icon-only affordance.
- `Text` presets set the heading level explicitly (`Heading as="h1"`); one `h1` per screen is a consumer rule, restated in the story docs.
- Focus ring 2px `accent-500` at 2px offset in both themes (spec §5.9), verified on the `ThemeControl` story.

## Acceptance criteria (observable)

1. `packages/config/tailwind/preset.css` defines every `--syn-neutral-{50…900}`, `--syn-accent-{100…800}`, `--syn-violet-{100…800}`, `--syn-destructive-500`, `--syn-cat-{leaf,sky,clay,rose,amber,slate,plum,moss}-{100,500,700}` with the official spec §9.3 hex, the derived `-200`/`-800` marked `[PROPOSED — needs sign-off]`, the semantic layer, the shadcn bridge in light and `.dark`, and the `@theme inline` block. *(Vesper.)*
2. `grep -rEi "cormorant|jost|parchment|crimson|--cc-" packages/` returns nothing.
3. `yarn ui:storybook` boots; the palette story renders both themes via the toolbar; the `Text` overview shows seven variants; the `ThemeControl` story switches `<html>` between `light`, `dark`, and system. *(Vesper.)*
4. `localStorage` key for the theme is `syn:theme` (from `@syn/constants`), verified in the browser after a toggle.
5. `useIsWide()` flips at exactly 768px (resize the Storybook canvas).
6. `apps/web/app/globals.css` imports the preset and the ui globals; `yarn build` passes with the page rendering in `--paper`/`--ink`.
7. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build`, `yarn ui:build-storybook` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- Tailwind v4 mis-parses `font-(--font-display)` as a weight (CC's `text.variants.ts` comment); use `font-sans`/`font-serif` mapped in `@theme inline`.
- CC patches `next-themes` (`.yarn/patches/next-themes-npm-0.4.6-*.patch`); read the patch before deciding to carry it.
- `tw-animate-css` vs `tailwindcss-animate`: the current shadcn CLI writes `@import "tw-animate-css"`; pick one and make INF-4's install match it.

## Dev's call

Whether `ThemeControl` uses a plain radio or waits for INF-4's `radio-group` (either is acceptable; the contract is the rows) · the palette story's layout · the Storybook `fonts.css` source.

## Out of scope

- **shadcn primitives** — INF-4. **Mounting `ThemeProvider`, fonts, `Toaster` in the app** — INF-7. **ST-09 Appearance page** — Epic 1 feature track (it composes `ThemeControl`). **Category 200/800 hex** — Taylor (handoff §11 Q2).

## Depends on

- **INF-2** — `@syn/constants` (`STORAGE_KEYS`) and `@syn/utils`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The token file is long and every value is load-bearing; the theme runtime has a hydration trap; and CC's globals must be stripped of a brand without stripping a reset. A cheaper model will carry a `.cc-*` class or a gold `--ring` and the whole primitive set will be re-skinned twice.

---

### Build kickoff (paste into the session)

> Build **INF-3 — Design tokens, theme, typography, Storybook** (attached spec). Model: **Opus**. **The official spec §9 as CC's three-layer token file; light/dark on `<html>`; one `Text` primitive; Storybook with the theme toolbar — and no CC brand value anywhere.**
> Attach/read first, in order: this spec · `docs/ux/synapse_ui_component_needs_and_handoff_v2.md` §5.1, §6.2, §6.4 (or the official spec §9.3–§9.7 + `docs/ux/synapse_ui_component_needs_and_handoff.md` §5.0 if v2 is absent — log it) · `docs/ux/habit_tracker_official_ux_spec_v1.md` §9 · CC `packages/config/tailwind/preset.css` · CC `packages/ui/src/styles/globals.css` · CC `packages/ui/src/{lib/cn.ts,lib/use-media-query.ts,hooks/*,providers/theme-provider.tsx}` · CC `packages/ui/src/primitives/typography/text/*` · CC `packages/ui/.storybook/*` · CC `docs/ai-guides/component-guidelines.md` §6 · `~/lighthouse/taylor-aucoin/app/admin/_components/{theme-provider,theme-toggle}.tsx` · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Transcribe the token file; strip CC's brand from globals; copy the theme runtime; build `Text` and `ThemeControl` to the contracts. Close in three places; run `yarn lint && yarn lint:boundaries && yarn check-types && yarn build && yarn ui:build-storybook`.
