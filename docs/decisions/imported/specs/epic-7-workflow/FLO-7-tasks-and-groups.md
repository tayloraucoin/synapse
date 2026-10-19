# FLO-7 — Tasks and groups: the add rows, the task sheet, moves by menu and by key, *Start*, archive with undo, *Closed earlier*; group create, rename, colour, move, *First today*, archive

**Epic:** FLO — Workflow · **Phase 3** · Size: L
**Slice type:** Every write a person makes to a board, from the screen, without a drag. The risk class is *an undo that does not put things back* (position, lane, firing), *a move that shows one thing and stores another*, and *a form that loses a typed sentence*.
**Vigil:** every move's undo; a pin across a day close; the sheet's save-as-you-go under a failing network.

**Status:** Complete (2026-10-04)

> **Vigil — full review.** For each of: *Move to* another column; `Alt`+`→`; `Alt`+`↓`; moving a firing task out of the active column; moving into the done column; *Start* from the queue; *Archive* — press *Undo* inside five seconds and state that the task is back in its lane, column and exact position, and that a task which was firing is firing again with its original minute count. Then: pin a group *First today*, move the local clock past the person's day close, refetch, and state that the usual order is back with nothing to dismiss. Then, with `workflow.task.update` failing: type a note, blur, and state that the field reverts and one line says so, and say plainly what happens to the words that were typed.

---

## Outcome

A person can run a day on the board without leaving it: write a task into any cell and keep writing the next; open a task to change its title, its note, its group or its column; move a task to another column from its menu or with the keyboard; send a queued task into the working view with *Start*; close a task by moving it to *Done* and find it later under *Closed earlier*; archive one and take it back. They can add a group, rename it, give it a colour, move it up or down, put it *first today*, fold it, and archive it. Every move that takes a task out of its cell offers *Undo* for five seconds, and undo restores exactly what was there, firing included. **Arranging views, columns and templates is FLO-8; dragging is FLO-9.**

## Why / intent

- **UX §4 WF-01** — the add row, the row menu, *moving and reordering* (by menu, by key), the keyboard table's `n`, `Enter`, `Alt`+arrows; **WF-02** — the task sheet, whole; **Dialogs** — archive group, rename, colour; **§3.5** — the usual order and *first today*; **§3.7** — *Start* and *Move to view*; **§3.8** — *Closed earlier*.
- **W12** — moves by menu and key are complete on their own. This ticket is where that is made true.
- **W9, TD-37** — *first today* resets itself.
- **W18** — archive, never delete. **W19** — the note, *Where it stands*.
- **UX §2 guardrails 5 and 7** — save as you go; nothing leaves without a way back.
- **TD-39** — every write patches the one cache entry; undo payloads carry `{ columnId, groupId, index, firingStartedAt }`. **TD-35** — the client reorders the array; it never computes an order number.
- **TD-44** — `n` crosses from the chrome to the page as URL state the board reads and clears.
- **Assessment §5** — the failure contract's rows for the move and the missing task.
- **Ground truth (consumed):** `@syn/ui` `EllipsesMenu`, `ResponsiveSheet`, `toastUndo` with `UNDO_SHORT_MS`, `ColorSwatchRow`, `Popover`, `AlertDialog`, `ArchivedSection`, `EmptyState`, `Input`, `Textarea`, `Select`, `SaveStatusText`; `@syn/hooks` `useOptimisticValue` (the save-as-you-go field); `apps/web/lib/hooks/use-sheet.ts`; `apps/web/components/passages/use-passages.ts` (an optimistic reorder and an archive undo — the nearest precedent).
- **FLO-6** — `use-workflow-board.ts` and the cache discipline, extended here, not forked. **FLO-3** — every procedure called. **FLO-4** — `InlineAddRow`, the `menu` slots.
- **What this slice is NOT (binding):** drag of any kind; *New view*, the view menu, the Columns or Archived sheets; a *Save* button anywhere; a delete; a count.

**Rulings this slice makes (labelled, logged):**

- **Undo calls the same procedures with the prior place** (FLO-3's ruling): a move's undo is `task.move` back with `restoreFiringStartedAt`; an archive's is `task.restore` with `toIndex` and `restoreFiringStartedAt`; *Start*'s is `task.move` back to the queue cell and index. One toast at a time, as the toaster already enforces; a second move replaces the first's toast and its undo is gone. Logged.
- **An empty group's archive undo restores the group and then its place**: `group.restore`, then `group.reorder` with the order held from before. Logged.
- **`n` is `?add=1`.** The shell's shortcut host pushes it on a Workflow path; the board opens the add row of the focused lane's first column (the first lane's when nothing is focused) and clears the param with a replace, so back does not reopen it. Logged.
- **The task sheet's fields each save on their own** through `useOptimisticValue`: text on blur and after a short pause (an existing debounce constant, not a new one), selects on choice. A failed text save reverts the field to the last saved value and shows the save-failure sentence beneath it, as UX WF-02 rules. The cost is stated: a long note typed into a failing connection is lost on revert. If the Vigil walk finds that unacceptable in the hand, it is a question back to Vesper (keep the text, mark it unsaved), not a local change. Logged.
- **Changing *Group* or *Column* in the sheet is a move to the end of the new cell** and shows no toast — the sheet is open on the task; the sheet is the context. Logged.
- ***Move to view* is a two-level menu**: views, then that view's columns. It needs each view's columns; they come from one `workflow.view.list` extension or a lazy query when the submenu opens — dev's call, logged. The task leaves this board; the toast reads *Moved to {Column}* with *Undo*.
- ***Closed earlier* is `ArchivedSection`**, folded, fetched with `task.listClosed` when opened; each row is a `TaskRow variant="closed"` with a menu of *Open* and *Move to*. It renders only when the first page is non-empty; the check is a cheap first-page read on mount. Logged.
- **The lane menu's *Move up* / *Move down* reorder the usual order among unpinned lanes**; on a pinned lane they are disabled (UX §3.5: pinned lanes hold their place). Logged.
- **The first-open empty state gains its two actions**: *Add a task* focuses *No group*'s first add row; *Add a group* opens the group add row. Logged.

## Experience & states

**The add row** (UX WF-01). `InlineAddRow` at the end of every cell: always visible in the first column, on lane hover or focus elsewhere, always on compact. `Enter` creates at the end of the cell and keeps the field open and empty. The task appears at once; a failure removes it and shows the line.

**Add a group.** The ghost row at the board's foot; `Enter` creates the lane and focuses its first cell's add row.

**The row menu.** *Open* · *Move to* (this view's columns, the current one checked) · *Move to view* · *Start* (only in a view with no active column) · *Archive*.

**By key**, on a focused row: `Enter` opens the sheet · `Alt`+`↑`/`↓` one place within the cell (no toast) · `Alt`+`←`/`→` one column, to the end of that cell (toast) · `n` new task.

**Toasts** (five seconds, *Undo*): *Moved to {Column}* · *Closed* (into the done column) · *Started in {View}* · *Archived*. A reorder inside a cell shows none.

**The task sheet** (UX WF-02), `?sheet=task&id=`. *Title* (focused, caret at the end; emptied → not saved, *A task needs a title.*) · *Where it stands* (helper *What was asked, what to check when it comes back.*) · *Group* · *Column* · *Firing* (active column only: the toggle and the elapsed line) · footer *Archive* (ghost) · *Done* (primary, closes). `SaveStatusText` beside the title.

**The lane menu.** *First today* or *Back to usual order* · *Rename* (the name becomes a field; `Enter` or blur saves, `Esc` restores) · *Colour* (a popover, `ColorSwatchRow`, each hue labelled by its name, the current one checked) · *Move up* · *Move down* · *Archive group*.

**Archive group.** Empty → at once, *Archived* · *Undo*. Holding tasks → the dialog *Archive {Group}.* / *Its tasks move to No group.* / *Cancel* · *Archive*.

**States (exhaustive):** each sheet field: idle · saving · saved · failed · read-only offline. The sheet: loading (skeleton fields) · open · the task gone (closes). The add row: resting · editing · submitting (the row is already in the list) · failed. A menu item: enabled · disabled (offline; *Move up* on the first lane, *Move down* on the last, both on a pinned lane; *Start* absent where it does not apply). The toast: showing · undone · expired · replaced.

**Failure / edge states:** a move fails → the row returns to its cell and position, firing restored, one line (assessment §5) · undo pressed after the toast's write has not yet settled → the undo waits for it, then runs · the sheet open on a task archived on another device → closes on the next refetch · `?sheet=task&id=` naming no task → closes · `?add=1` on a view while offline → cleared, nothing opens · a title at 120 characters → the field accepts no more and says nothing · renaming a group to an empty string → the old name returns · archiving the group that holds *next* → *next* recomputes; the task is now in *No group*.

## Non-negotiables (this slice)

- **Undo restores lane, column, exact position, and firing.**
- **The screen never shows an order the server will not store**: the client moves the item in the array and sends `toIndex`; it sends no order number.
- **No *Save* button.** *Done* closes.
- **Archive, never delete.** There is no destructive-styled control on this surface.
- **Every menu action that moves a task works with the pointer and with the keyboard, with no drag.**
- **Offline: controls disabled, not hidden; the sheet read-only.**
- **A title or note is never written to the console or a log.**
- **No counts** — not on a toast (*Archived*, never *3 archived*), a dialog, or a menu.

## Data & AI

**Schema changes: none.**

**Tables:** through FLO-3's procedures — `task.create`, `update`, `move`, `start`, `archive`, `restore`, `listClosed`, `setFiring`; `group.create`, `rename`, `setHue`, `reorder`, `archive`, `restore`, `pinToday`, `unpinToday`; `view.list`.

**Placement:** `apps/web/app/(shell)/workflow/[view]/_components/{workflow-board.tsx, use-workflow-board.ts, task-sheet.tsx, use-task-sheet.ts, task-menu.tsx, lane-menu.tsx, closed-earlier.tsx, copy.ts}`; `apps/web/lib/hooks/use-global-shortcuts.ts` and `apps/web/components/shortcuts-host/shortcuts-host.tsx` (`n` on a Workflow path); `apps/web/lib/keyboard/shortcuts.ts` (`n`, `Enter`, `Alt`+arrows under *Workflow*). Rule 9, 10, 12.

**tRPC / validators:** FLO-3's and FLO-1's. The sheet's title field validates with the same schema `task.update` takes.

**AI notes:** **None.**

## Accessibility

- The sheet traps focus; `Esc` closes; focus returns to the row, or to the next row in the cell if the task left it (UX WF-02).
- After a keyboard move, focus stays on the moved row in its new place, so `Alt`+`→` can be pressed again.
- After *Archive* or a move to another view, focus goes to the next row in the cell, else the previous, else the cell's add row.
- The toast announces itself politely, as it already does; its *Undo* is reachable by keyboard before it expires.
- Menus are the existing `EllipsesMenu`: labelled *{title} options* / *{name} options*, arrow keys inside.
- The colour popover's swatches are a radiogroup, each named by its hue's word; colour is never the only label.
- The add row's field is labelled by its ghost text; `Esc` returns focus to where it was.

## Acceptance criteria (observable — the local tier with the seed, at 375px and 1280px; the induced conditions in the Vigil callout)

1. Typing a title in a cell's add row and pressing `Enter` adds the task at the end of that cell at once, leaves the field open and empty, and the task is there after a reload; `Enter` on an empty field adds nothing.
2. *Add a group* creates a lane at the end with the next hue, and focus is in its first cell's add row.
3. *Move to → Finish later* on an active task moves it to the end of that lane's *Finish later* cell and shows *Moved to Finish later*; *Undo* returns it to its original index. *(Vigil.)*
4. The same move on a **firing** task ends its firing; *Undo* returns it firing, with the minute count it had. *(Vigil.)*
5. Moving a task into *Done* shows *Closed*, renders it at 0.55 opacity, and *next* recomputes; *Undo* reopens it in place.
6. `Alt`+`↓` on a focused row swaps it with the row below, shows no toast, keeps focus on it, and the order survives a reload; `Alt`+`→` moves it one column with a toast.
7. On *Queue*, a row's menu has *Start*; choosing it removes the row, shows *Started in Working*, and the task is at the end of its group's *In progress* cell on *Working*; *Undo* returns it to the queue at its index. On *Working*, the menu has no *Start*. *(Vigil.)*
8. *Archive* removes the row and shows *Archived*; *Undo* restores it in place, firing if it was. *(Vigil.)*
9. Pressing a row opens the sheet with the title focused; editing the title and blurring updates the row beneath without a button; emptying it shows *A task needs a title.* and the row keeps its old title.
10. Typing a note and pausing saves it (the save status says so) and the row's second line shows it; with `task.update` failing the field reverts and one save-failure line shows beneath it. *(Vigil.)*
11. Changing *Group* in the sheet moves the row to the end of that lane's cell with no toast; changing *Column* likewise.
12. The sheet's *Firing* row appears only for a task in the active column and its toggle and the row's stay in step.
13. *First today* on the third lane moves it to the top with the words *first today* and the menu now offers *Back to usual order*; pinning a second puts it above the first; *next* follows. After the person's day close and a refetch, the usual order is back and no head says *first today*. *(Vigil.)*
14. *Move up* on the second unpinned lane makes it first among unpinned lanes and survives a reload; on a pinned lane both items are disabled.
15. *Rename* turns the name into a field; `Enter` saves; `Esc` restores. *Colour* changes the lane's edge and the popover shows eight swatches each with a visible or accessible hue name.
16. *Archive group* on a lane with tasks shows the dialog with the two sentences; confirming moves its tasks to *No group* in order and removes the lane. On an empty lane it archives at once with *Undo*, and undo returns it to its place.
17. *Closed earlier* appears at the foot when a task closed before today exists, folded; opening it lists such tasks newest first; *Move to → In progress* on one returns it to the board.
18. `n` on the board opens an add row; `n` on `/today` still opens the one-off sheet; `n` while typing in the add row types the letter.
19. Offline: add rows, menus and the sheet's fields are disabled or read-only and present; the offline line shows in the sheet.
20. Every action above was done once with the keyboard alone.
21. No request made by any criterion above carries a `sortOrder` in its input.
22. FLO-6's criteria 3–8 still hold.
23. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- One `moveTask(id, to, { toast })` in the hook, used by the menu, the keys, the sheet's selects, *Start*'s undo and — later — the drag: capture the prior `{ columnId, groupId, index, firingStartedAt }` from the cache, splice the array, mutate, and build the toast from the prior place. FLO-9 then adds a caller, not a code path.
- Index within a cell is the task's position among the cached tasks with the same `groupId` and `columnId`; `toIndex` is in that cell's terms.
- `useOptimisticValue` returns `committing` and `error`; `SaveStatusText` takes that shape already.
- The toaster shows one toast at a time; a new move's toast replaces the old one, which is the product's existing behaviour — do not queue them.
- *Move to view* needs columns of other views. Extending `view.list` to return each view's columns is one read and keeps the menu instant.
- A task created optimistically needs a temporary id until the server answers; the day list's one-off flow shows the pattern, or generate the uuid on the client and send it — if the latter, `task.create`'s input gains an optional `id` in FLO-1's schema, logged.

## Dev's call

Temporary id versus client-generated uuid for a new task · where *Move to view* gets its columns · the split of `use-task-sheet.ts` from the board hook · the debounce constant for the sheet's text fields (reuse an existing one).

## Out of scope

- **Drag** — FLO-9.
- ***New view*, view rename and archive, Columns, templates, the Archived sheet (where archived tasks and groups are restored), compact column tabs** — FLO-8.
- **A link on a task; a weekly rule for *first today*** — not built (§13 #W7, #W1).
- **Reordering views** — no control in UX v0.1.

## Depends on

- **FLO-6** — the board, the hook, the cache discipline. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Twenty behaviours over one cache entry, where the value is that undo is exact. A cheaper model ships the moves and an undo that returns the task to the end of the cell, not firing.

---

### Kickoff (paste into the session)

> Build **FLO-7 — Tasks and groups** (attached spec). Model: **Opus**. **Every move works by menu and by key; undo restores lane, column, exact position and firing; no Save button; archive, never delete.**
> Attach/read first, in order: this spec · `docs/ux/workflow-ux-spec-v0.1.md` §2, §3.2, §3.5, §3.7, §3.8, §4 WF-01, WF-02, Dialogs, §7 · `01-technology-assessment.md` §3 (TD-35, TD-37, TD-39, TD-44), §5 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules 9–13 · `apps/web/components/passages/use-passages.ts`, `packages/hooks/src/use-optimistic-value.ts`, `apps/web/lib/hooks/use-sheet.ts`, `apps/web/components/shortcuts-host/shortcuts-host.tsx` (reuse, don't fork) · FLO-3, FLO-4, FLO-6 · this track's `README.md`, `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Extend FLO-6's hook; one `moveTask` for every caller. The client sends a place, never an order number. Walk the Vigil callout's undo list and the day-close pin, and say what you ran. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
