# SYS-4 — Keyboard and focus: global shortcuts, the `?` dialog, list and canvas navigation, and form submit keys — does not gate launch

**Epic:** SYS — Cross-cutting · **Phase 3** · Size: M
**Slice type:** Bindings over built surfaces. The risk class is *a key that fires in a field*: a shortcut stealing a typed letter, arrow keys fighting a radiogroup, Enter submitting from a textarea.
**Vigil:** none. **Vesper review:** the focus ring on rows and blocks; the roving focus in time order.

**Status:** Complete (2026-09-06)

---

## Outcome

On a laptop, `1` `2` `3` switch tabs, `,` opens Settings, `t` scrolls to now, `n` adds a one-off, `Esc` closes the topmost sheet, `?` shows the list. In the List and the Schedule, `↑` `↓` move between rows and blocks in time order, `Space` toggles done, `Enter` opens the item, `s` starts or stops its timer. In a form, `Enter` in a single-line field submits and `Cmd/Ctrl+Enter` submits from a textarea. None of it fires while an input has focus, and none of it is shown as a badge anywhere.

## Why / intent

- **Cross-cutting §3.1** — the global shortcuts, desktop only, never badges, listed on About; single keys, no modifiers, suppressed while any input has focus (§13 call 9). §3.2 — within the List and Schedule: `↑`/`↓` in time order, `Space` toggle, `Enter` open, `s` timer; the focus ring 2px accent, 2px offset, on the whole row. §3.3 — forms: Tab order as the *Reads* list, primary last, `Enter` submits a single-line field, `Cmd/Ctrl+Enter` from a textarea; the 1–7 stepper is a radiogroup with number keys (built); segmented controls are radiogroups (built); time pickers native. §3.4 — focus management (SYS-1 did tab switch and sheet return; the row focus is here).
- **Epic 2 LS-01** — `s` "bubbles to the list, which owns the timer" (the `ItemRow` doc block).
- **Ground truth:** SYS-3's `SHORTCUTS` data and About table; `ShortcutsDialog`; USE-2's `day-list/` (rows are `li` with a checkbox and a button), USE-5's `schedule-canvas/` (a grid of block buttons), USE-3's `timer.start/stop`, `useSheet` (SYS-1), `syn:scroll-to-now`; `useSynapseForm`; `useIsWide`; `ResponsiveSheet` (Radix closes on Esc already — verify the topmost-only rule with nested sheets).
- **What this slice is NOT (binding):** no visible key hints; no shortcuts on compact without an external keyboard (they simply do nothing when no `keydown` arrives); no remapping UI.

**Rulings this slice makes (labelled, logged):**

- **One key handler**, `useGlobalShortcuts()` mounted in `shell-providers.tsx`, on `window` `keydown`, ignoring events whose target is an `input`, `textarea`, `select`, `[contenteditable]`, or inside a Radix `dialog` (except `Esc`, which the dialog owns); dispatching by `SHORTCUTS` keys. Logged.
- **Roving focus in the List and Schedule** is a `useRovingFocus(containerRef, selector)` hook (`apps/web/lib/hooks/`): `↑`/`↓` move `tabIndex` and focus among `[data-item-row]` elements in DOM order (which is time order by construction), wrapping never; `Space` triggers the row's checkbox `click`, `Enter` the row body's `click`, `s` dispatches a `syn:toggle-timer` `CustomEvent` on the row that the List handles (calling `timer.start`/`stop`). Logged.
- **`n` opens `?sheet=one-off` for today** (the day header's *Add a one-off*, for today only). Logged.
- **`Esc` closes only the topmost sheet** — Radix does this; the ruling is that `useGlobalShortcuts` never handles `Esc` itself. Logged.
- **`Cmd/Ctrl+Enter` in a textarea submits the enclosing form** via a `useSubmitShortcut(formRef)` hook `useSynapseForm` consumers opt into (the sheets' forms); `Enter` in a single-line input is the browser default. Logged.
- **Focus-visible on rows and blocks** is the existing ring (`ItemRow` and `ScheduleBlock` already carry `focus-visible:ring-2 focus-visible:ring-ring`); verify the 2px offset and the whole-row extent per §3.2 and adjust the composite if not (log). Logged.

## Experience & states

### Global

`SHORTCUTS` (SYS-3) → bindings: `1` → `todayRoute()`; `2` → `todayScheduleRoute()`; `3` → `reviewRoute()`; `,` → `settingsRoute()`; `t` → dispatch `syn:scroll-to-now`; `n` → `openWith` on the one-off sheet (only on the List and Schedule routes); `?` → `ShortcutsDialog open` with `SHORTCUTS`. `Shift+/` is `?` on US layouts — read `event.key === "?"`.

### List and Schedule

The List's `ul` and the Schedule's grid get `useRovingFocus`; the first row is focusable on mount (`tabIndex=0`), the rest `-1`; the focused row is remembered per tab for the session (with the scroll memory). `s` on a focused row → the List's handler → `timer.start` if not active, `timer.stop` if active; the row's elapsed appears/disappears as USE-3 built.

### Forms

Every `ResponsiveSheet` form in the app (LB-02, CT-02, TP-03, WK-03, ST-06a, IT-02, the feedback form) opts into `useSubmitShortcut` where it has a textarea: LB-02 (preflight note), IT-01's note (saves on close — no submit; skip), SF-01's *Other* text (an input), the feedback form. A short list; the ticket enumerates and wires them.

**States (exhaustive):** wide-with-keyboard · compact-with-external-keyboard (works the same; no detection) · input-focused (suppressed) · dialog-open (suppressed except Esc) · shortcuts-dialog-open.

**Failure / edge states:** a non-US layout where `?` needs a different physical key → `event.key` handles it · a row removed while focused (done → still present; removed one-off) → focus moves to the next row · `n` on Settings → nothing (the document scopes it to the day).

## Non-negotiables (this slice)

- **No shortcut fires while an input, textarea, select, or contenteditable has focus.**
- **No key hint is ever shown on a control.** The list lives on About and behind `?`.
- **Single keys, no modifiers**, except `Cmd/Ctrl+Enter` in a textarea (§3.3).
- **Roving focus never changes visual order** — DOM order is time order.

## Data & AI

**Schema changes: none.** **Tables:** none.

**Placement:** `lib/hooks/{use-global-shortcuts,use-roving-focus,use-submit-shortcut}.ts`; `components/shortcuts-dialog-host/` (or inside `shell-providers.tsx`); edits in `components/day-list/`, `components/schedule-canvas/`, and the enumerated forms (re-check USE-2 AC 14 and USE-5 AC 13 after).

**tRPC / validators:** none new.

**AI notes:** **None.**

## Accessibility

- Roving `tabIndex` is the standard pattern for a list of many rows (one Tab stop into the list, arrows within); announce nothing extra.
- `ShortcutsDialog` is a Radix dialog with a table (`Kbd` cells).
- The focus ring meets 3:1 against paper and dark paper (`--ring` is accent-500/400 — verify both).
- Nothing here changes screen-reader semantics of rows or blocks.

## Acceptance criteria (observable — wide, hardware keyboard; then compact with a Bluetooth keyboard or a browser emulation)

1. On `/today`, `2` → `/today/schedule`; `3` → `/review`; `1` → `/today`; `,` → `/settings`; each moves focus to the new `h1` (SYS-1).
2. `t` on the List scrolls to the now/soon row; on the Schedule to the now line; `n` opens the one-off sheet for today; `?` opens the shortcuts dialog listing exactly `SHORTCUTS`; `Esc` closes it; `Esc` with a sheet over a sheet closes only the top one.
3. With focus in the search field on `/settings/habits`, typing `1`, `t`, `n`, `?` inserts the characters and navigates nowhere.
4. On the List, Tab reaches the first row; `↓` moves to the next row in time order (the ring on the whole row, 2px, 2px offset); `↑` back; `Space` toggles done on the focused row with the 5-second undo; `Enter` opens its sheet; `s` starts its timer and `s` again stops it. *(Vesper — the ring.)*
5. On the Schedule, the same keys move between blocks in time order and `Enter` opens the block's sheet.
6. In LB-02 with the cursor in *Note before starting*, `Cmd/Ctrl+Enter` submits (the same as *Save*); `Enter` in *Name* submits; `Enter` in the textarea inserts a newline.
7. No control anywhere renders a key hint (`grep -rn "<Kbd" apps/web` matches only About and the dialog host).
8. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `isEditable(target)`: `target.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')`.
- Roving focus: keep `activeIndex` in a ref; on `↓` set `tabIndex` on the new element and `focus({ preventScroll: false })`; `scroll-margin` on rows keeps them clear of the header.
- `syn:toggle-timer` carries `{ itemId }`; the List has the store and the mutations.

## Dev's call

Whether roving focus lives in `@syn/hooks` (it is DOM — no; `apps/web/lib/hooks/`) · the exact forms wired for `Cmd+Enter` beyond those enumerated.

## Out of scope

- **Shortcuts on compact without a keyboard** — nothing to do.
- **Rebinding** — never.
- **The About table** — SYS-3 (built).

## Depends on

- **USE-2** — the List's rows. Complete in `../epic-2-in-use/PROGRESS.md`.
- **USE-5** — the Schedule's blocks. Complete in `../epic-2-in-use/PROGRESS.md`.
- **SYS-3** — `SHORTCUTS` and the dialog host. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet.** Bindings with a suppression rule and an enumerated list. The failure mode of choosing down is a shortcut firing in a field — the acceptance criterion types into one.

---

### Kickoff (paste into the session)

> Build **SYS-4 — Keyboard and focus** (attached spec). Model: **Sonnet**. **No shortcut fires in a field; no key hint anywhere; single keys; roving focus in DOM order; Esc belongs to the dialog.**
> Attach/read first, in order: this spec · cross-cutting §3.1–§3.4, §13 call 9 · Epic 2 LS-01 (the row's keyboard note) · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · SYS-3 (`SHORTCUTS`) · SYS-1 (`shell-providers.tsx`, `useSheet`, `syn:scroll-to-now`) · USE-2 (`day-list/`) · USE-5 (`schedule-canvas/`) · USE-3 (`timer.start/stop`) · `packages/ui/src/composed/feedback/shortcuts-dialog/` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
