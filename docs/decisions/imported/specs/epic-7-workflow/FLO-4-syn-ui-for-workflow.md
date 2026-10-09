# FLO-4 — `@syn/ui` for Workflow: `FiringMark`, `FiringToggle`, `TaskRow`, `LaneHeader`, `NextStrip`, `InlineAddRow`, the static `Board`, `ScreenFrame` `"board"`, the breath token and keyframe, stories

**Epic:** FLO — Workflow · **Phase 2** · Size: L
**Slice type:** New composites in `@syn/ui`, every state a story; one new token group and the repository's first keyframe. The risk class is *a mark frozen dim under reduced motion*, *a firing row that reads louder than the next row*, and *a component that takes a row or computes an order*.
**Vigil:** none. **Vesper review:** below.

**Status:** Complete (2026-10-04)

> **Vesper — story review, both themes, and with the OS set to reduce motion.** Open Storybook. Confirm: the mark is 10px, breathes 1 → 0.35 → 1 over 2.4s, and is the only thing on the *Board, a working day* story that moves; with reduced motion it is still and at full opacity, never dim; a firing row's title is `text-text-secondary` and it has no border, no wash and no note line; the next row is the only row on `bg-surface` and its first word is *next* at weight 500; *firing* and its duration are `text-accent-text`, not the 500; a folded `LaneHeader` shows the mark and the word *next* when it should and neither when it should not; the hue edge is 2px with the name beside it; `InlineAddRow` resting is a ghost row, editing is a field with no button; the board's first column is the widest and stays put while the others scroll sideways at 900px; at 375px one column shows. Nothing shows a count. Say what you would change before FLO-6 composes them.

---

## Outcome

Every piece of the board exists in isolation with its story: a mark that breathes, a toggle that holds it, a task row in its three variants and all its states, a lane's head, the strip that names what is next, a ghost row that becomes a field, and the grid that arranges them — columns across, lanes down, heads that stay. After this ships, **FLO-6 composes a board without writing a class name for a row.** Nothing here reaches a route, fetches, or moves anything: the board is static, and its drag is FLO-9.

## Why / intent

- **UX §9** — the component list and what is reused as it is. **UX §3.1, §3.3, §3.4, §3.5, §4 WF-01** — the anatomy, the states, the accessibility. **UX §6** — the motion table.
- **W5, UX §3.3, TD-42** — the mark, exactly: 10px, `bg-accent-mark`, opacity 1 → 0.35 → 1, 2400ms, `ease-in-out`, continuous; **attached `motion-safe` only**. An infinite animation forced to `0ms` by the global reduced-motion floor resolves to a keyframe state of the browser's choosing; never attaching it is the only way the still mark is reliably at 1.
- **W7, UX §3.4** — the next row: the word and the surface together, never the surface alone.
- **W15** — no counts: no component in this ticket has a count prop.
- **TD-43** — `Board` here is the static grid. It is shaped so FLO-9 can add a `DndContext` inside it without changing its callers.
- **TD-44** — `ScreenFrame` gains a third width, `"board"`.
- **`packages/ui/AGENTS.md`, `component-guidelines.md`** — a folder per component (`<name>.tsx`, `<name>.variants.ts` where a `cva` exists, `index.ts`, `<name>.stories.tsx`), enumerated exports in `src/index.ts` and `package.json`, tokens by name, no `dark:` colours, view models from `@syn/types`, never a row.
- **Ground truth (consumed):** `composed/display/list-row/` (the row's leading/trailing slot pattern), `composed/control/sortable-list/` (the lift look, for `TaskRow`'s `lifted` state), `composed/display/group-heading/`, `composed/control/ellipses-menu/` (passed in as a slot, not imported by the row), `primitives/layout/collapsible/`, `composed/feedback/skeleton-row/`, `composed/layout/screen-frame/`, `lib/committing.ts` (`COMMITTING_PULSE` — a different word; not reused), `hooks/use-prefers-reduced-motion.ts`.
- **FLO-1** — `WorkflowTaskView`, `WorkflowColumnView`, `CategoryKey`, `formatMinutesShort`.
- **What this slice is NOT (binding):** any route or hook; any tRPC import; any drag; `StateWord` reused or amended; a new colour; a second pulse built from `animate-pulse`.

**Rulings this slice makes (labelled, logged):**

- **`TaskRow` takes `now: Date` and computes its own durations** with `formatMinutesShort`; it reads no clock. The caller passes one `now` for the whole board (FLO-6, from `useNow`). Logged.
- **`TaskRow` is three siblings in a `li`, not a button containing buttons**: the toggle, a main button (title, words, note) that opens, and a `menu` slot. The hover and focus surface is drawn on the `li`. Logged.
- **`TaskRow` takes `groupName` and `columnName` only to compose its accessible name** (UX WF-01: title, group, column, state); it does not render them. Logged.
- **The first column is the wide, pinned one, whatever its role.** UX §3.1 says the active column is first and widest; in a view where the person moved it, the grid keeps *first is widest* rather than jumping the wide track around. Vesper's call at authoring; a role-following track is the alternative. Logged.
- **Three layout tokens in `preset.css`**: `--board-col-wide: 320px`, `--board-col: 240px`, and `--dur-breathe: 2400ms`. The widths are tokens because an arbitrary `minmax(320px, …)` in a class is a value nobody named. `--dur-breathe` does not collapse under reduced motion (TD-42). Logged.
- **Component default copy lives in a `copy.ts` beside `TaskRow`** (`WORKFLOW_ROW_COPY`: *next*, *firing*, *back*, and the two toggle labels as functions of the title), overridable by props (`copy-conventions.md`). Logged.
- **`LaneHeader` takes a `handle` slot and `Board` takes nothing drag-related.** FLO-9 fills the slot; until then it is empty and no grip is drawn. Logged.

## Behaviour & states

**No route.** Storybook is the surface.

| Component | Props (contract) | States |
|---|---|---|
| `FiringMark` | `breathing?: boolean` | breathing · still. `aria-hidden`. `size-2.5 rounded-full bg-accent-mark`; `motion-safe:animate-breathe` when `breathing` |
| `FiringToggle` | `pressed`, `onPressedChange(next: boolean)`, `label`, `disabled?` | off (a 10px ring, 1.5px `border-edge`) · on (`FiringMark breathing`) · hover · focus-visible (the product ring, on the control) · disabled. A `button` with `aria-pressed` and `aria-label={label}`; target `size-(--target)`; the ring-to-mark change runs `duration-(--dur-state)` |
| `TaskRow` | `task: WorkflowTaskView`, `variant: "active" \| "plain" \| "closed"`, `isNext?`, `now: Date`, `groupName: string \| null`, `columnName`, `onOpen()`, `onFiringChange?(next)`, `menu?: ReactNode`, `disabled?`, `lifted?`, `copy?` | `active`: firing · back · never fired · next (each with and without a note). `plain`. `closed` (0.55 opacity, still live). Each: hover (`bg-fill-muted`) · focus-visible (ring on the row) · disabled (`text-text-disabled`, no hover) · lifted (1.5px `border-accent-mark`, 0.9 opacity) · long title (one line, ellipsis) |
| `TaskRowSkeleton` | — | The row's shape, 56px |
| `LaneHeader` | `name`, `hue: CategoryKey \| null`, `collapsed`, `onCollapsedChange(next)`, `firstToday?`, `hasFiring?`, `hasNext?`, `menu?`, `handle?`, `plain?` (the *No group* form: no hue, no menu, no handle), `copy?` | expanded · collapsed · collapsed with mark · collapsed with *next* · collapsed with both · *first today* · plain. The disclosure is a 44px `button` with `aria-expanded`, labelled *Collapse {name}* / *Expand {name}* |
| `NextStrip` | `next: { kind: "task"; groupName: string \| null; title: string } \| { kind: "all_firing" } \| null`, `onGo?()` | a task (a `button`; the label *Next*, then *{Group} · {Task}*, the title truncating in the middle) · everything firing (text, not a button) · `null` (renders nothing) |
| `InlineAddRow` | `label`, `placeholder`, `maxLength`, `onSubmit(value)`, `keepOpen?`, `open?`, `onOpenChange?`, `visibility?: "always" \| "lane-focus"`, `disabled?` | resting (ghost row) · editing (a field; `Enter` submits a trimmed non-empty value; `Esc` or an empty blur closes; with `keepOpen` the field empties and stays) · disabled |
| `Board` · `BoardLane` · `BoardCell` · `BoardSkeleton` | `Board`: `columns: WorkflowColumnView[]`, `visibleColumnId?` (compact), `children`. `BoardLane`: `label` (the region's name), `header: ReactNode`, `collapsed`, `children`. `BoardCell`: `columnId`, `label` (*{Group}, {Column}*), `children` | wide (every column; heads sticky; first column pinned left; the grid scrolls sideways inside its own `overflow-x-auto` region) · compact (only `visibleColumnId`'s cells) · a collapsed lane (header only) · loading (`BoardSkeleton`: head text skeletons and two lanes of skeleton rows in the first column) |
| `ScreenFrame` | `width` gains `"board"` | no max-width; the same padding as `canvas` |

Words on an active row, in order, on one line under the title: *next* (weight 500, ink) · then *firing* or *firing · {duration}* (`text-accent-text`) **or** *back · {duration}* (`text-text-secondary`, only when `lastReturnedAt` is set and the task is not firing). A firing row shows no note; a row that is the person's shows the note as one truncating line in `text-text-secondary`.

Stories (both themes): `firing-mark` — *Breathing* · *Still*. `firing-toggle` — *Off* · *On* · *Disabled* · *Focus-visible*. `task-row` — *Firing, 4 min* · *Firing, first minute* · *Back, 2 min, with a note* · *Never fired* · *Next* · *Next and back* · *Plain* · *Closed* · *Lifted* · *Disabled* · *Long title at 320px* · *Skeleton*. `lane-header` — the seven states. `next-strip` — *A task* · *A long title* · *No group* · *Everything firing*. `inline-add-row` — *Resting* · *Editing* · *Keeps open* · *Disabled*. `board` — *A working day* (two lanes, four columns, two firing, one next, one folded lane holding a firing task) · *The queue* (three columns, no toggles) · *First open* · *Loading* · *At 900px, scrolled sideways* · *Compact, one column*. `screen-frame` — *Board width*.

**Failure / edge states:** `TaskRow variant="active"` with no `onFiringChange` renders the toggle disabled · `isNext` on a firing task is ignored (a firing task is never next) · `Board` with one column (no sideways scroll, the one track fills) · `Board` with five · `visibleColumnId` naming no column → the first.

## Non-negotiables (this slice)

- **The breath is `motion-safe` only.** Under reduced motion the mark's computed opacity is 1.
- **Nothing but the mark animates at rest.** The firing row has no border, no wash, no movement.
- **The next row is the only row on `bg-surface`, and it always has the word.**
- **No count prop, no badge, anywhere.**
- **View models in, intents out.** No component imports `@syn/api`, sorts tasks, or decides what is next.
- **Tokens by name; no hex; no `dark:`; no arbitrary spacing.**
- **`StateWord`, `SortableList` and `COMMITTING_PULSE` are not changed.**
- **Every state has a story in both themes.**

## Data & AI

**Schema changes: none.**

**Tables:** none.

**Placement:** `packages/config/tailwind/preset.css` (the three tokens); `packages/ui/src/styles/globals.css` (`@keyframes syn-breathe`, the `animate-breathe` utility); `packages/ui/src/composed/display/firing-mark/`, `composed/control/firing-toggle/`, `composed/display/task-row/` (with `copy.ts`), `composed/display/lane-header/` (with `copy.ts`), `composed/display/next-strip/` (with `copy.ts`), `composed/control/inline-add-row/`, `composed/layout/board/`, `composed/layout/screen-frame/`; `packages/ui/src/index.ts` and `packages/ui/package.json` `exports`; `docs/ai-guides/brand-tokens.md` (one row each for the breath duration and the two board widths). Conventions §4.5; Mason, TD-42, TD-43; assessment §4.

**tRPC / validators:** none.

**AI notes:** **None.**

## Accessibility

- The mark is `aria-hidden`; the word carries the state. The duration is not a live region.
- The toggle: `aria-pressed`, the label from props (*Fire {title}* / *Mark {title} back*), a 44px target.
- A row's accessible name, in order: title, group, column, state — *"Stockpile measurement spec, Fybr, In progress, next, back 2 minutes"*. Durations are spoken in full words.
- `BoardLane` is a `region` named by its label; `BoardCell` a `list` named *{Group}, {Column}*; each row a `listitem`. Not an ARIA `grid`.
- Contrast traps, checked in both themes: *firing* text is `text-accent-text` (600 / 300), never the 500; the receded title at `text-text-secondary` passes AA at row-title size; the hue edge is a 2px non-text edge with the name beside it.
- The focus ring is the product's accent ring with a 2px offset; because the firing row has no accent border, a focused row and a firing row cannot be confused.
- At 200% text the tracks keep their minimum widths and the board's own region scrolls sideways; the page does not.

## Acceptance criteria (observable — Storybook at 375px, 900px and 1280px, both themes)

1. `FiringMark breathing` computes `animation-name: syn-breathe` and `animation-duration: 2.4s`; with `prefers-reduced-motion: reduce` emulated, its computed `animation-name` is `none` and its computed `opacity` is `1`. *(Vesper.)*
2. In *Board, a working day* with motion allowed, the only elements with a running animation are the marks of firing tasks.
3. `FiringToggle` is a `button` with `aria-pressed` reflecting `pressed` and an accessible name equal to `label`; its box is at least 44×44px; pressing it calls `onPressedChange` with the opposite value and changes nothing itself.
4. A firing `TaskRow` renders the title in `--text-secondary`, the word *firing* and its duration in `--accent-text`, no note, and has no border and a transparent background at rest.
5. `TaskRow` with `firingStartedAt` 30 seconds before `now` shows *firing* with no duration and no middot; 4 minutes before, *firing · 4 min*; 72 minutes, *firing · 1 h 12 min*.
6. A `TaskRow` with `isNext` resolves `background-color` to `--surface` and its words line begins with *next*; no other row variant or state resolves to `--surface` at rest. *(Vesper.)*
7. A `closed` row has opacity 0.55 and still calls `onOpen` when pressed.
8. A `TaskRow`'s `li` contains no `button` nested inside another `button`.
9. A collapsed `LaneHeader` with `hasFiring` shows a `FiringMark`; with `hasNext` shows the word *next*; `plain` renders no hue edge, no menu slot and no handle slot.
10. `NextStrip` with a task is a `button` whose text is *Next* followed by *{Group} · {Task}*; with `all_firing` it renders *Everything is firing.* and is not a button; with `null` it renders nothing.
11. `InlineAddRow`: `Enter` on `"  Billing export  "` calls `onSubmit("Billing export")`; `Enter` on whitespace calls nothing; with `keepOpen` the field is empty and focused afterwards; `Esc` restores the ghost row; the field accepts no more than `maxLength` characters.
12. `Board` at 1280px shows every column with the first track wider than the others; at 900px with four columns the board's region scrolls sideways while the first column and the column heads stay in place, and `document.documentElement.scrollWidth` equals `clientWidth`. At 375px with `visibleColumnId` set, only that column's cells render.
13. `ScreenFrame width="board"` has no `max-width`.
14. `grep -rn "count" packages/ui/src/composed/display/task-row packages/ui/src/composed/display/lane-header packages/ui/src/composed/layout/board packages/ui/src/composed/display/next-strip` returns nothing.
15. `packages/ui/src/composed/display/state-word/`, `composed/control/sortable-list/` and `lib/committing.ts` are unchanged in the diff.
16. `yarn workspace @syn/ui run build-storybook --quiet` passes; every story renders in both themes without a console error.
17. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- Tailwind 4, CSS-first: `@keyframes syn-breathe { 0%, 100% { opacity: 1 } 50% { opacity: 0.35 } }` and `--animate-breathe: syn-breathe var(--dur-breathe) ease-in-out infinite` in the theme give an `animate-breathe` utility; check how `globals.css` already declares its theme additions before choosing where the `--animate-*` line goes.
- The grid: one CSS variable for the template (`minmax(var(--board-col-wide), 1.5fr) repeat(n, minmax(var(--board-col), 1fr))`) set on `Board` and inherited by the heads row and each lane's cells row, so the tracks line up without a table.
- Sticky inside a sideways-scrolling region: the first track's cells are `sticky left-0` with `bg-paper`, so rows scrolling beneath them do not show through.
- The criterion-14 grep is plain: write comments in those folders without that word — "no tally of tasks" rather than naming it.
- Truncating a title in the middle (`NextStrip`) is two spans, the second `shrink-0`; a CSS-only end ellipsis is acceptable if the middle form costs more than it is worth — log it.

## Dev's call

Compound components (`Board.Lane`) versus named siblings · how the grid template is passed down · the skeleton's exact row count · where `--animate-breathe` is declared · middle versus end truncation in the strip.

## Out of scope

- **The drag, the grip, the drop line** — FLO-9.
- **The data, the hook, the menus' contents, the sheets** — FLO-6, FLO-7, FLO-8.
- **The view tabs and the compact column tabs** — the existing `Tabs` primitive, composed in FLO-6 and FLO-8.
- **A pulsing-row variant** (§13 #W2's flip) — not built until Taylor flips it.

## Depends on

- **FLO-1** — the view models and `formatMinutesShort`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Seven components whose value is in restraint: a cheaper model ships a livelier board — a border on firing rows, `animate-pulse` on the mark, a count on the lane — each a small, plausible breach of the one thing this surface is for.

---

### Kickoff (paste into the session)

> Build **FLO-4 — `@syn/ui` for Workflow** (attached spec). Model: **Opus**. **One mark moves, and only when motion is allowed; the next row is the only row on a surface; view models in, intents out; no counts.**
> Attach/read first, in order: this spec · `docs/ux/workflow-ux-spec-v0.1.md` §2, §3.1, §3.3–§3.5, §4 WF-01, §6, §7, §9 · `01-technology-assessment.md` §3 (TD-42, TD-43, TD-44), §4 · `packages/ui/AGENTS.md` · root `AGENTS.md` · `docs/ai-guides/component-guidelines.md`, `brand-tokens.md`, `typography-guidelines.md`, `classnames.md`, `copy-conventions.md` · `packages/ui/src/composed/display/list-row/`, `composed/control/sortable-list/`, `composed/layout/screen-frame/` (reuse, don't fork) · FLO-1 · this track's `README.md`, `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Storybook first; every state in both themes. Attach the breath `motion-safe` only and check it with reduced motion emulated. No route, no fetch, no drag. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands, then `yarn workspace @syn/ui run build-storybook --quiet`.
