# FLO-8 — Views, columns, templates, the archive, the compact column tabs: *New view*, the view menu, the Columns sheet with roles and remove-with-move, *Save as a template*, the Archived sheet

**Epic:** FLO — Workflow · **Phase 3** · Size: L
**Slice type:** The planning layer — arranging boards rather than working one. The risk class is *a column change that strands or silently un-fires tasks*, *the last view or the last column removed*, and *a template edit that changes a view it should not* (W10).
**Vigil:** removing a column that holds firing tasks; taking the firing role off a column; the last view; the last column.

**Status:** Not started

> **Vigil — full review.** State what happened for each: (1) *Remove* on an empty column, then *Undo*; (2) *Remove* on a column holding tasks, choosing a destination — every task, in order, in the destination; (3) the same where the removed column was the active one and held a firing task — the dialog said firing would stop, and it did; (4) *Tasks fire here* moved from one column to another — exactly one column fires, and the old one's tasks are not firing; (5) *Remove* on the only column — disabled; (6) *Archive this view* on the only view — disabled; (7) a view made from a saved template, then the template renamed and archived — the view unchanged; (8) a view archived and restored — its tasks back with it.

---

## Outcome

A person can shape the tool to the work: make a new view from *Working*, *Queue* or a template they saved; rename a view or archive it; open *Columns* to rename, reorder, add and remove a view's columns and to say which one tasks fire in and which one closed tasks land in; save a view's columns as a template under a name; and open *Archived* to bring back a task, a group or a view. On a phone, the view's columns become a second row of tabs and one column shows at a time. After this ships, **every user story in the notes' §7 can be done from the screen.** Dragging is FLO-9.

## Why / intent

- **UX §3.6** — views, columns, roles, templates; **§4 WF-03, WF-04, WF-05** — the three sheets, whole; **§4 Dialogs** — archive view, rename; **§4 WF-01** — the header's *New view* and *View options* menu, and the compact line; **§5** — `?sheet=new-view`, `?sheet=columns`, `?sheet=archived`, `?col=`.
- **W10** — a view owns its columns; a template is where it started; editing either never touches the other.
- **W11, TD-34** — one active and one done column per view at most, held by the database; the sheet makes the swap one choice.
- **W4, §13 #W4** — one to five columns.
- **W18** — archive, never delete.
- **Assessment §5** — the failure contract's rows for the removed column and the archived view.
- **`DEVIATIONS.md` (authoring, 2026-10-03)** — *Save as a template* is a dialog with one *Name* field, *Cancel* and *Save*; UX §7 has its strings and UX §4 has no screen for it.
- **Ground truth (consumed):** `@syn/ui` `ResponsiveSheet`, `SortableList` (unchanged — its handle, `Alt`+arrows and live text are the column list's reorder), `LargeTargetRow` in the R56 selection grammar, `EllipsesMenu`, `AlertDialog`, `Dialog`, `Tabs`, `InlineAddRow`, `toastUndo`, `EmptyState`; `apps/web/lib/hooks/use-sheet.ts`; `apps/web/components/passages/passage-list.tsx` (a `SortableList` caller with save-as-you-go rows).
- **FLO-3** — `view.*`, `column.*`, `template.*`, `task.listArchived`, `task.restore`, `group.restore`. **FLO-6, FLO-7** — the header, the hook, the cache.
- **What this slice is NOT (binding):** a live link between a template and a view; a sixth column; a delete; a control to reorder view tabs (none in UX v0.1); a settings screen for Workflow.

**Rulings this slice makes (labelled, logged):**

- **The Columns sheet edits the board behind it live.** Each change is a write and a patch of the board's cache entry; closing the sheet is only closing. Logged.
- **Roles are two checkable menu items per column row** (*Tasks fire here*, *Closed tasks land here*). Checking one calls `column.setRole`; the server clears it from any other column; the list re-renders from the response. Unchecking clears it. Logged.
- **Taking *Tasks fire here* off a column that holds a firing task — by unchecking it, or by checking it on another column — asks first**: *Tasks in {Column} will stop firing.* / *Cancel* · *Continue*. When no task in it is firing, no dialog. Logged.
- **Removing a column that is the active one and holds firing tasks shows the move dialog only**, with the stop-firing sentence added beneath its question — one dialog, not two. Logged.
- **An empty column's removal undo is `column.save` plus `column.reorder`** to its old place (and `setRole` if it had one). Logged.
- **`?col=` holds a column id; absent or unknown means the first column.** It is replaced, not pushed, on a tab change — back should leave the board, not walk through columns. Logged.
- **View order is creation order and has no control in this version.** The procedure `view.reorder` exists and is unused by this ticket. Logged.
- **Archived views are restored from the foot of the *New view* sheet** (UX WF-05), under *Archived views*; a restored view returns at the end and opens. Logged.

## Experience & states

**Header (wide).** After the view tabs: *New view* (ghost). Trailing, after the Next strip: the ellipsis *View options* — *Rename* · *Columns* · *Save as a template* · *Archived* · *Archive this view*.

**Rename** — the current tab's name becomes a field; `Enter` or blur saves; `Esc` restores; an empty name restores.

**WF-03 New view** — per UX. *Name* (40; *A view needs a name.*) · *Start from*: the built-in two, then saved templates in created order, each a `LargeTargetRow` whose second line is its columns joined by middots; saved ones carry a menu *Rename* · *Archive*. Nothing preselected; *Create view* disabled until a name and a choice exist; pending while it saves; on success the sheet closes and the new view opens. At the foot, when any exist: *Archived views*, each with *Restore*.

**WF-04 Columns** — per UX. A `SortableList` of rows: the name as a field (40; an emptied field restores on blur) · a caption for the role when set · a menu: *Tasks fire here* · *Closed tasks land here* · *Remove*. *Add a column* as an `InlineAddRow` at the foot, absent at five. Footer *Done*.
- *Remove*, empty column → gone; *Removed* · *Undo*.
- *Remove*, column with tasks → dialog *Move its tasks first.* / *Where should the tasks in {Column} go?* / the remaining columns as radio rows / *Cancel* · *Move and remove* (disabled until one is chosen).
- *Remove* on the last column → the item is disabled.

**Save as a template** — a dialog: *Save as a template* / *Name* (40; *A template needs a name.*) / *Cancel* · *Save*. On success it closes; the template is in WF-03's list.

**WF-05 Archived** — per UX. *Tasks* (title; *{Group} · archived {date}*) and *Groups*, each row with *Restore*; each section only when it has rows; *Nothing archived.* when neither does. *Restored* · no undo (restore is its own inverse: archive again).

**Archive this view** — dialog *Archive {View}.* / *Its tasks are kept and come back with it.* / *Cancel* · *Archive*; then the first remaining view opens. Disabled on the last view.

**Compact.** Under the view tabs and the Next strip: the column tabs, one per column, scrolling sideways if they overflow; the board shows the chosen column's cells (`Board visibleColumnId`). *New view* and *View options* sit in the header's trailing slot as on wide.

**States (exhaustive):** each sheet: loading (skeleton) · open · saving a row · a row's save failed (the row reverts; one line) · offline (controls disabled, the line at the sheet's top). WF-03: nothing chosen · chosen · creating · failed (the sentence; the sheet stays). The dialogs: idle · confirming · failed.

**Failure / edge states:** creating a view fails → the sheet stays with the name and choice intact · a sixth column attempted through a stale sheet → the server's `too_many_columns`; the add row disappears on refetch · two columns claim a role from two devices → the database's unique index refuses the second; the sheet shows the save-failure line and refetches · a template archived while the *New view* sheet is open on another device → creating from it fails with the sentence and the list refetches · the view being viewed is archived elsewhere → the next navigation or refetch lands on the first remaining view (FLO-6) · restoring a task whose view is archived → it appears in the first view's first column (FLO-3).

## Non-negotiables (this slice)

- **A view's columns and a template's columns never change each other.**
- **A column that holds tasks is never removed without the person naming where they go.**
- **Firing never stops silently**: a role change or a removal that ends firing says so before it happens.
- **The last view and the last column cannot be removed**, and the control says so by being disabled, not by failing.
- **No *Save* button in the Columns sheet.** The *Save* in *Save as a template* is that dialog's verb, and creates something.
- **Nothing preselected in *Start from*.**
- **Archive, never delete; no counts.**

## Data & AI

**Schema changes: none.**

**Tables:** through FLO-3's procedures — `view.create`, `rename`, `archive`, `restore`, `list`; `column.save`, `reorder`, `setRole`, `remove`; `template.list`, `save`, `rename`, `archive`; `task.listArchived`, `task.restore`; `group.restore`.

**Placement:** `apps/web/app/(shell)/workflow/[view]/_components/{view-tabs.tsx, view-menu.tsx, new-view-sheet.tsx, columns-sheet.tsx, save-template-dialog.tsx, archived-sheet.tsx, column-tabs.tsx, use-view-settings.ts, copy.ts}`; `workflow-board.tsx` and `use-workflow-board.ts` (the header slots, `?col=`). Rules 9, 10, 12.

**tRPC / validators:** FLO-3's and FLO-1's; the *New view* and template name fields validate with the schemas their procedures take.

**AI notes:** **None.**

## Accessibility

- Each sheet traps focus; `Esc` closes; focus returns to the control that opened it (the *New view* button, the *View options* button).
- The column list reorders by its handle and by `Alt`+`↑`/`↓`, with the sortable's existing announcements.
- The role items are `menuitemcheckbox`; the role caption under the name is text, so the role is never carried by the menu's check alone.
- The template rows are a radiogroup in the R56 grammar: surface, a 1.5px ink border, a check.
- The remove dialog's destinations are a radiogroup; *Move and remove* is disabled until one is chosen and says why by its label, not by colour.
- The compact column tabs are the existing `Tabs`; the chosen column's name is also the visible heading of the cells beneath, so the board is not a list of unlabelled rows.
- After a view is created or restored, focus moves to the `h1` as on any navigation.

## Acceptance criteria (observable — the local tier with the seed, at 375px and 1280px; the cases in the Vigil callout)

1. *New view* opens the sheet with nothing chosen and *Create view* disabled; naming it *Client reviews* and choosing *Queue* creates a view with *Up next · Later · Someday*, opens it, and its tab is last.
2. On that view, *Columns* → renaming *Later* to *This week* updates the column head behind the sheet at once and survives a reload; *Queue*'s own columns are unchanged. 
3. Reordering columns by the handle and by `Alt`+`↓` changes the board's column order; the first column is the wide one.
4. *Add a column* adds one at the end; at five, the add row is absent.
5. *Tasks fire here* on a second column leaves exactly one column with that caption; toggles appear on its rows and disappear from the former's. When the former held a firing task, the stop-firing dialog showed first; *Cancel* changed nothing. *(Vigil.)*
6. *Remove* on an empty column removes it and *Undo* returns it to its place with its role. *(Vigil.)*
7. *Remove* on a column with three tasks shows the dialog; *Move and remove* is disabled until a destination is chosen; after confirming, the three tasks are at the end of the destination's cells in their original order and the column is gone. *(Vigil.)*
8. *Remove* is disabled on a view's only column; *Archive this view* is disabled on the only view. *(Vigil.)*
9. *Save as a template* with the name *Reviews* closes the dialog; *New view*'s list then shows *Working*, *Queue*, *Reviews*, the last with its columns on its second line and a menu.
10. A view created from *Reviews* is unchanged after *Reviews* is renamed and after it is archived; editing that view's columns does not change *Reviews*. *(Vigil.)*
11. *Rename* and *Archive* are absent or disabled on the two built-in templates.
12. *Archive this view* shows the two sentences; confirming opens the first remaining view; the archived view is listed under *Archived views* in the *New view* sheet; *Restore* brings it back last, with its tasks. *(Vigil.)*
13. *Archived* lists a task archived in FLO-7's flow with its group and date; *Restore* returns it to the end of its cell; an archived group's *Restore* returns the lane, empty, at the end. With nothing archived it reads *Nothing archived.*
14. At 375px the column tabs show the view's columns; choosing one shows only that column's cells and sets `?col=`; back leaves the board rather than stepping through columns; the page does not scroll sideways.
15. `[` and `]` switch between views including one created in this ticket.
16. Offline, every control in the three sheets is disabled and present, with the offline line.
17. With a second device's change making a role conflict, the sheet shows one save-failure line and then the true state; nothing is red.
18. Every sheet and dialog above was operated once by keyboard alone.
19. Nothing rendered by this ticket shows a number of tasks, columns, views or templates.
20. FLO-6's criteria 4–6 and FLO-7's criteria 3, 7 and 13 still hold.
21. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `SortableList`'s `onReorder(ids)` maps straight onto `column.reorder`; `passage-list.tsx` shows the optimistic local order around it.
- Whether a column *holds a firing task* is known from the board's cache; the dialog decision needs no request.
- The column tabs and the view tabs are both `Tabs`; the view tabs are links (navigation), the column tabs set a query param (state).
- `use-view-settings.ts` can hold the three sheets' mutations; keep `use-workflow-board.ts` about the board.
- After `view.create`, navigate with `router.push(workflowViewRoute(id))`; the new board's first read is a normal server read.

## Dev's call

One hook or three for the sheets · whether *Rename* of a saved template is in place or a small dialog (UX says in place) · the date format in *archived {date}* (the product's existing short calendar day).

## Out of scope

- **Drag of rows, lanes or columns on the board** — FLO-9 (rows and lanes); columns reorder only in this sheet.
- **Reordering view tabs** — no control in UX v0.1.
- **Editing a saved template's columns** — a template is a snapshot (W10); save another.
- **A Settings → Workflow screen** — none in UX v0.1.

## Depends on

- **FLO-7** — the header's slots, the menus' patterns, archive and restore from the board. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Three sheets whose risk is in four edge cases — the role swap, the remove-with-move, the last one, the snapshot. A cheaper model ships the sheets and lets a role change un-fire tasks without a word.

---

### Kickoff (paste into the session)

> Build **FLO-8 — Views, columns, templates, the archive, the compact column tabs** (attached spec). Model: **Opus**. **A view owns its columns and a template is a snapshot; a column with tasks is never removed without a destination; firing never stops silently; the last view and the last column stay.**
> Attach/read first, in order: this spec · `docs/ux/workflow-ux-spec-v0.1.md` §3.6, §4 WF-01 (header, compact), WF-03, WF-04, WF-05, Dialogs, §5, §7 · `01-technology-assessment.md` §3 (TD-34, TD-40, TD-41), §5 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules 9–13 · `apps/web/components/passages/passage-list.tsx`, `packages/ui/src/composed/control/sortable-list/` (reuse unchanged) · FLO-3, FLO-6, FLO-7 · this track's `README.md`, `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> The Columns sheet edits the live board; no Save button there. Ask before firing stops. Walk the eight Vigil cases and say what happened in each. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
