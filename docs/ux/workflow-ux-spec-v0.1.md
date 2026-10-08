# Workflow UX Spec v0.1 — Synapse, the board for work that waits on a prompt

**Author:** Vesper, Lead UX/UI Designer · §11 is written as the data the screens need, for Mason to shape
**Date:** 3 Oct 2026
**Status:** Draft for Taylor's read. Mason's technology assessment is cut from it ([`docs/specs/epic-7-workflow/01-technology-assessment.md`](../specs/epic-7-workflow/01-technology-assessment.md)); Reeve's tickets follow both.
**Source:** Taylor's stakeholder notes, *Synapse — Epic 2: Workflow*, Draft v0.1, captured from a voice brainstorm on 3 Oct 2026. Cited as `N§n` (its section numbers) and `NQ#` (its seven open questions, §9). The notes are quoted where a ruling depends on their wording.
**Base:** This is a new feature area, not an iteration of the habit day. It stands beside [`ux-spec-v1.3.md`](ux-spec-v1.3.md) and inherits, unchanged, the brand ([`ux-spec-v1.md`](ux-spec-v1.md) §9), the voice (§10), the accessibility floor (§11), and the containers and back behaviour of the cross-cutting document ([`synapse_navigation_and_system_ux_architecture.md`](synapse_navigation_and_system_ux_architecture.md) §1.2–§1.3). Where it amends one of those, the amendment is a numbered ruling in §0.3 and is listed in §0.4.
**Companions:** [`brand-tokens.md`](../ai-guides/brand-tokens.md) for token names · [`synapse_ui_component_needs_and_handoff_v2.md`](synapse_ui_component_needs_and_handoff_v2.md) for the contracts of components this document reuses.

**A naming note, once.** The notes call this *Epic 2*. In this repository Epic 2 is *In use* (`USE-`), and six epics are already cut. This is the **seventh** track: `docs/specs/epic-7-workflow/`. Screens here carry the prefix `WF-`; rulings `W#`; open items `#W#`.

---

## 0. How to read this document

### 0.1 What kind of document this is

The same kind as v1.3: every screen opens with a walk-through (who, the one job, what is seen, what it must never do); copy is in-register and written here; defaults are labelled. Three labels: `[DEFAULT]` a choice made where the notes left room; `[ASSUMPTION]` a fact I needed and did not have; `[OPEN]` something only Taylor or real use can settle. All are collected in §13.

One thing is different from every Synapse document before it, and it is ruled (W2): **this surface is designed wide first.** It lives on a desktop beside a terminal. The compact layout is real and specified, but it derives from the wide one, not the reverse.

### 0.2 Authority ladder

1. Taylor's notes (`N§`), and whatever he says on reading this.
2. This document.
3. The official spec §9–§11 (brand, voice, accessibility) and the cross-cutting document, for everything this document does not amend.
4. The v2 handoff, for the contracts of reused components.
5. My judgment, labelled.

### 0.3 Rulings this version makes

Each row is a decision with a real alternative, stated so it can be flipped in one line.

| # | Ruling | Source | The alternative not taken |
|---|---|---|---|
| W1 | **Workflow is a fourth peer**, after Review, in the rail and the tab bar. It is a second feature area in the same app, not a second app. Amends cross-cutting §1.1's *three peers and one door*. | N header, N§1 | A separate app; or a section inside Settings. |
| W2 | **Wide first.** The board is designed for a desktop window; compact shows one column at a time and keeps every action. Amends the standing *mobile first, always* for this surface only. | N§1 (the person is at a terminal) | Mobile first, with the board as the derived layout. |
| W3 | **The board is lanes by columns.** A group is a lane (a row across the board); a column is a state. The first column of the working view is the active one. This answers NQ2: the *left column* of N§4.1 **is** one of the four, not a panel beside them. | N§4.1, NQ2 | A fixed task panel plus four state columns; or columns with flat cards and a group chip. |
| W4 | **The fourth column is *Done*.** The working view is *In progress · Ongoing · Finish later · Done*. A task moved there is closed, stays for the day, and leaves the board at day close. Answers NQ1. | NQ1 | *Up next* (the queue view already holds it); *Blocked*; *Review*. |
| W5 | **Firing is the time register's *running*.** A firing row carries the accent mark, breathing slowly, the word *firing*, and the elapsed time; its title recedes. The row does not flash and the surface does not wash. Reduced motion holds the mark still. Narrows N§5's *pulses/flashes* to a slow breath on a 10px mark. | N§5, official §2.4 (*nothing flashing*), §9.6 | The whole row pulsing; a flash; a coloured wash. |
| W6 | **Two states, not three.** A task in the active column is *firing* or it is the person's. There is no separate *idle*; a task never fired and a task that has returned are both the person's, and both are candidates for *next*. *back · 3 min* is a caption on a returned task, not a third state. | N§5, N§6.4, the N§5 example loop (task 3 was never fired and is still worked) | A third *not started* state excluded from *next*. |
| W7 | **Next is shown, not left to be read.** Exactly one task on a view carries the word *next*, and the header carries a *Next* strip naming it. Answers NQ3. | NQ3, N§2 (*always know which returned thread to jump to*) | Ordering alone. |
| W8 | **Next is order, nothing else**: the first of the person's tasks in the active column, walking today's group order, then the order inside the group. Return time does not break ties, because there are none: order is total. | N§6.4 | Oldest-returned first. |
| W9 | ***First today* is a one-day pin and it resets itself.** A group pinned *first today* leads the order until the day closes (the person's own day close, the same boundary the habit day uses), then the usual order returns with nothing to undo. Dragging a lane changes the usual order. Answers NQ4. | N§6.3, NQ4 | Persist until changed; or a full separate order per day. |
| W10 | **A view owns its columns; a template is where it started.** Creating a view copies a template's columns. Editing the view's columns changes that view only. *Save as a template* snapshots the current columns under a name. | N§4.2 | A live link, where editing a template changes every view made from it. |
| W11 | **A column has a role, at most one of each per view**: *tasks fire here* (the active column) and *closed tasks land here* (the done column). Firing exists only in the active column; a view may have neither. | N§5 (*multiple tasks live in In Progress*), N§4.2 | Firing available in every column. |
| W12 | **Tasks move by menu and key first, by drag second.** *Move to* on the row menu and `Alt`+arrows are complete on their own; drag is the faster path over the same moves. Answers NQ5: from the queue, *Start* sends a task to the working view's active column. | NQ5, v1.1 §13 #4 (*the fallback ships first*) | Drag as the only way. |
| W13 | **Workflow is separate from the habit day in v0.1.** No link to work focuses, day items, or timers. The seam is recorded in §12, not built. Answers NQ6. | NQ6, P2-2 | Tie a group to a work focus now. |
| W14 | **The toggle is manual and stays the override.** Detection from Claude Code is §12, not this version. Answers NQ7. | N§2 non-goals, NQ7 | Build detection now. |
| W15 | **No counts.** No number of tasks on a column, a lane, or the nav. The only numbers on the board are durations. | apps/web non-negotiables (*no numbers about the day*), carried by choice | Linear-style counts on column heads. |
| W16 | **Opening Workflow does not wait behind the orient frame.** `/workflow` is exempt from the once-a-day orient redirect; the habit tabs keep it. `[DEFAULT]` | — | Orient first, as for every other tab. |
| W17 | **The on-screen noun is *Task*, as Taylor says it.** The habit day's *Task* (a habit type, official §10.2) is a different thing on a different surface; the two never share a screen. In code and data the noun is `workflow task`. | N§3 | *Thread*. |
| W18 | **Archive, never delete** — tasks, groups, views, saved templates. | official §9.1 (*the record is honest*) | Delete with a confirm. |
| W19 | **A task carries one optional note: *where it stands*.** It shows as the row's second line in the active column. It is the thing that makes returning to a thread accurate, which is the notes' stated goal. `[DEFAULT]` | N§2 (*better speed and accuracy*) | Title only. |

### 0.4 What earlier documents said that no longer holds, for this surface

- Cross-cutting §1.1's *three peers* → four (W1). Cross-cutting §3.1's `1`/`2`/`3` gains `4`.
- Cross-cutting §2.3's *max 960px* canvas → the board takes the full content area (§3.1).
- The standing *mobile first, always* (v1.3 §0.1) → wide first here (W2).
- `StateWord`'s reservation of the accent dot for *now* and *soon* → the firing mark is a second, named use of the same register (*running*), and is drawn by its own component so the reservation stays legible (W5, §9).
- [`apps/web/AGENTS.md`](../../apps/web/AGENTS.md) § Scope lists Phase 1's surfaces; Workflow is lifted into scope by Taylor's notes of 3 Oct 2026 and needs its line there when the epic is cut.

Nothing else moves. In particular the never list stands whole on this surface: nothing red, no gradients, no shadow but an overlay's, the accent never fills, colour never alone, no second person, no exclamation marks, no emoji in the app's voice.

---

## 1. Frame

### 1.1 Who is here, in what state

One person, at a desk, mid-work, running several AI-driven threads at once. Their attention is already spent: it is in a terminal, on a prompt they are composing or a result they are reading. They come to this board for **a glance of about a second**, many times an hour, to answer one question — *which one now?* — and to flip one switch.

This is a fifth state beside the brand's four (planning, executing, reviewing, the invited friend). Call it **working**:

| State | When | Budget |
|---|---|---|
| **Working** | At a desk, attention in another window, glancing | One answer readable in under a second · one action per glance, one click or one key · nothing on the board that asks for a decision the person did not come to make |

The same person is in the **planning** state on the queue view — unhurried, arranging what comes after. The queue may afford depth; the working view may not.

### 1.2 The one job

**Say which task is next, and let a task be marked firing or back in one motion.** Everything else on the surface — columns, views, templates, the queue — is arrangement in service of that, and is kept out of the glance path.

### 1.3 The emotional contract

After a glance the person must believe: *nothing is waiting on me that I've forgotten; the thing I should pick up is the one it says; a task that is firing is not my problem right now.* The design makes those three beliefs cheap: one word (*next*) in one place, and firing rows that visibly step back.

The notes describe wait time today as *idle time (phone, distraction)*. The board does not fight that with urgency. It does not count what is waiting, time how long the person has been away, or call anything overdue. A returned task waits quietly; the word *next* is a direction, not a demand.

### 1.4 Vocabulary

| Word | Means | Not |
|---|---|---|
| **Workflow** | The feature area; the fourth peer. | Board, tasks, projects |
| **Task** | One thread of work. A row on the board. | Thread, ticket, card, issue |
| **Group** | A set of tasks, usually a client. A lane. | Project, client (a group *is usually* a client; the app does not say so), team |
| **Column** | A state a task is in. | Status, list, stage |
| **View** | One board: a named set of columns with the tasks in them. | Board, page, tab |
| **Template** | A saved arrangement of columns to start a view from. | Preset, layout |
| **Firing** | A prompt is running; the task is not waiting on the person. | Running, pending, in flight, busy |
| **Back** | The prompt returned; the task is the person's again. | Ready, done, returned, waiting |
| **Next** | The one task to pick up now. | Up next (that is a queue column), priority, urgent |
| **First today** | A group leading the order for this day only. | Pinned, priority 1, boosted |
| **Fire** · **Back** | The two verbs of the toggle. | Start, stop, run, pause |
| **Start** | Send a queued task to the working view. | Activate, promote |
| **Archive** | Take off the board, keep. | Delete, remove |

---

## 2. Guardrails

The apps/web non-negotiables bind this surface as they bind the tabs. Restated only where this surface gives them a new edge:

1. **One mark moves, and it moves slowly.** The firing mark is the only animation on the board at rest. Nothing flashes, nothing bounces, nothing scrolls on its own.
2. **Firing rows recede; the person's rows stand.** The visual weight follows who the task is waiting on. A board where the busiest-looking row is the one that needs nothing is a board that trains the eye wrong.
3. **Exactly one *next*.** Never two, never a ranked list of what follows it. When everything is firing, the board says so in one line and offers nothing to do.
4. **No counts, no totals, no time-away.** The only numbers are durations beside *firing* and *back* (W15).
5. **Optimistic by rule; save as you go** (v1.2 §2 guardrails 4 and 5, carried). The toggle changes on the tap; a failure reverts it with one line. No form on this surface has a *Save* button.
6. **Every drag has a fallback that is complete without it** (W12), and the fallback is the first thing built.
7. **Nothing leaves without a way back.** Archive carries an undo; a move carries an undo; closing carries an undo.
8. **The board never blanks.** Loading draws the columns and skeleton rows in the board's own shape (v1.3 R63, carried).

---

## 3. The model, as design

### 3.1 The board

A view is drawn as a grid: **columns across, lanes down.**

```
 Workflow        [ Working ]  Queue   + New view                      Next  Fybr · Stockpile measurement spec
 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
                 In progress                    Ongoing            Finish later        Done
 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 ▾ Fybr  first today
 │               ◉ Epic tickets                 Weekly report      Billing export      Auth fix
 │                 firing · 4 min
 │               ○ Stockpile measurement spec   
 │                 next · back · 2 min
 │                 Asked for the edge cases
 │               ○ Trickle-down assets
 │               + Add a task
 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 ▾ Viewpoint
 │               ◉ Kurt's onboarding flow       Design review
 │                 firing · 11 min
 │               + Add a task
 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 ▸ Internal      ◉
 ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 + Add a group
```

- **Columns** are states. The active column is first and is the widest: `minmax(320px, 1.5fr)`; the others `minmax(240px, 1fr)`. Column heads are sticky to the top of the board region. Columns are separated by rhythm, not by rules; a hairline runs under the column heads and between lanes, and nowhere else. No cards: a task is a row on paper, as on the List (official §9.5, *no borders on cards*).
- **Lanes** are groups. A lane's head is a full-width row carrying the disclosure, the group's 2px hue edge, the name, and the lane's words. The lane's cells sit beneath it, one per column.
- **A cell** is one group's tasks in one column, in the person's order.
- **Width.** The board takes the whole content area beside the rail, with 32px padding — the 960px canvas cap does not apply (§0.4). When the window is narrower than the columns need, the board scrolls sideways inside its own region with the active column pinned to the left edge; the page itself never scrolls sideways.
- **Compact** (under 768px): one column at a time. See WF-01's compact line.

### 3.2 Tasks

A task has a **title** (required), a **group** (or none), a **column** in a **view**, a place in its cell's order, and optionally a **note** (W19). In the active column it also has its firing state.

A task with no group sits in the lane *No group*, which is always last, cannot be reordered, pinned, renamed or archived, and is drawn only when it holds a task or when there are no groups at all.

### 3.3 Firing

A task in the active column is in one of two states (W6):

| State | Means | Looks like |
|---|---|---|
| **Firing** | A prompt is running. Not the person's. | The toggle shows the accent mark, breathing. The words *firing · 4 min* in the accent text colour. The title at `text-text-secondary`. No note line. |
| **The person's** | Never fired, or back. | The toggle is an empty ring. The title at `text-ink`. The note line, if there is one. If it has returned: *back · 2 min* as a caption. If it is next: the word *next*, first. |

- **The toggle** is the row's leading control, 44px, the same place the List keeps its checkbox. One press fires; one press brings it back. It is a toggle button (`aria-pressed`), not a checkbox: nothing is completed by it.
- **The elapsed time** is minutes, never seconds: *firing* for the first minute, then *firing · 1 min*, *firing · 59 min*, *firing · 1 h 12 min*. It re-renders on the minute. Nothing ticks.
- **Back** stamps the moment. *back · 2 min* counts up the same way and is dropped after the task is fired again or leaves the column. It is a caption in `text-text-secondary`; it is information, never pressure, and it has no upper bound that changes its look.
- **A task that has been firing a long time looks exactly like one that has been firing a short time.** The board does not know whether the prompt is really still running (W14); it will not guess, warn, or nag. `[OPEN #W6]`
- **Leaving the active column ends firing.** A task moved to another column, archived, or sent to another view stops firing; the undo that the move carries restores it.
- **Firing does not exist outside the active column** (W11). Rows in other columns have no toggle.

**The firing mark, exactly.** A 10px filled circle, `bg-accent-mark`, centred in the 44px toggle. Its opacity runs 1 → 0.35 → 1 over 2400ms, `ease-in-out`, continuously. The row gains nothing else: no border, no wash, no movement. Under `prefers-reduced-motion` the mark is still at full opacity, and the word *firing* and the receded title carry the state — both were already there, so reduced motion loses nothing but the breath. Off, the toggle is a 10px ring, 1.5px `border-edge`.

**Why a breath on a mark and not a pulsing row (W5).** The notes ask that a firing row *visibly pulses/flashes — "I'm in prompt, don't wait on me."* The message is right and I keep it. The treatment as literally stated would put the strongest motion on the board on the rows that need nothing, three or four at a time, beside the one row that needs the person. That inverts the glance. So the motion is kept — it is how the eye tells *alive and working* from *stopped* without reading — and it is sized to be seen and not to compete: one small mark per row, slow enough to read as breathing. We lose some at-a-distance visibility of firing; we gain a board where *next* is the loudest thing. *Next* is the product.

### 3.4 Next

Among the active column's tasks that are the person's, **next** is the first one found walking the lanes in today's order and, inside a lane, the cell's order (W8). A collapsed lane is walked like any other.

- The next task carries the word **next** at ink weight 500, first on its words line, and its row sits on `bg-surface`. It is the only row on the board with a surface behind it. Word and surface together; never the surface alone.
- The header carries the **Next strip**: the label *Next*, then *{Group} · {Task title}*, truncating in the middle of the title. It is a button: pressing it scrolls the row into view, opens its lane if collapsed, and focuses the row.
- When every task in the active column is firing: the strip reads *Everything is firing.* and is not a button.
- When the active column is empty, or the view has no active column: no strip.
- Next changes only as a result of something the person did (a toggle, a move, a reorder, a pin). When it changes, the new one is announced once, politely.
- The browser tab's title follows it: *Next: {Task title} — Synapse*; *Everything is firing — Synapse*; otherwise *Workflow — Synapse*. `[DEFAULT]` The board is usually behind another window; the tab strip is the one place it can still answer the question.

### 3.5 Groups and their order

- A group has a **name** and a **hue** — one of the eight category hues (official §9.3), drawn as the lane head's 2px leading edge at the hue's 500. The name is always beside it; the hue is recognition at the edge of vision, never the carrier. A new group takes the next hue in the scale's order; the person may change it. `[DEFAULT]`
- **The usual order** is the order of the lanes. It is changed by dragging a lane's head, or by *Move up* / *Move down* on the lane menu.
- **First today** (W9). The lane menu offers *First today*. The group moves to the top and its head carries the words *first today*. A second group made first today goes above the first. *Back to usual order* on the same menu undoes one. At the person's day close every pin is gone, with no trace and nothing to dismiss.
- While a group is first today, dragging lanes still edits the usual order; pinned lanes hold their place at the top and cannot be dragged past each other.
- **Collapse.** The disclosure folds a lane to its head. A folded lane's head still tells the truth about what is inside: the firing mark if any task in it is firing, and the word *next* if next is inside. Folding is remembered per group, across views.
- All groups appear on every view, in order, whether or not they hold tasks there, so a task can always be added where it belongs. `[DEFAULT #W3]`

### 3.6 Columns, views, templates

- A **view** has a name and one to five columns. `[DEFAULT #W4]` Each column has a name and, optionally, a role (W11).
- Two views exist from the first open, made from the two built-in templates:

| Template | Columns | Roles |
|---|---|---|
| **Working** | In progress · Ongoing · Finish later · Done | *In progress*: tasks fire here · *Done*: closed tasks land here |
| **Queue** | Up next · Later · Someday | none |

- **Views are switched** by the view tabs in the header. The last view opened is the one `/workflow` returns to.
- **A view's columns are edited** in the Columns sheet (WF-04): rename, reorder, add, remove, set roles. Removing a column that holds tasks asks which column takes them.
- **Save as a template** names the view's current columns and adds them to the list a new view starts from. A saved template can be renamed and archived; the two built-in ones cannot. Editing a template never changes an existing view (W10).

### 3.7 The queue, and getting out of it

The queue is a view like any other; what makes it the queue is that it has no active column, so nothing in it fires and nothing in it is *next*. It is where a task is written down before it is worked.

A task leaves the queue two ways (W12, NQ5):

- **Start** — on the row menu of any task in a view with no active column. It moves the task to the end of its group's cell in the active column of the first view, in tab order, that has one. A toast names where it went: *Started in Working*, with *Undo*.
- **Move to view** — on every row menu: pick a view, then a column.

### 3.8 Done

A task moved to the done column is closed. Its row takes the quiet register (0.55 opacity, still live, official §5.9). It stays in the Done column until the person's day close; after that it is listed under **Closed earlier**, a folded section at the foot of the view, newest first, and can be moved back to any column from there. Nothing is counted. `[DEFAULT #W5]`

---

## 4. The screens

### WF-01 The board

**Who is here:** the person working, glancing; or the same person planning, on the queue.
**The one job:** say which task is next; take the toggle.
**It must never:** show two things asking for attention; move on its own; count.

**What is seen, top to bottom (wide):**

1. **Header** (56px, the app header). The `h1` *Workflow*. The view tabs: one per view, in order, then *New view* as a ghost button. On the trailing side: the Next strip (§3.4), then the view menu (an ellipsis button labelled *View options*): *Rename* · *Columns* · *Save as a template* · *Archived* · *Archive this view*.
2. **Status line**, when there is one (offline; the shell's others).
3. **Column heads.** Each column's name, `Text` secondary weight 500, sentence case, sticky. No counts (W15). No role marker on the head: the active column is recognisable by being first, widest and the only one with toggles.
4. **Lanes**, in today's order. Each:
   - **Lane head**: disclosure (44px target, *Collapse {name}* / *Expand {name}*) · hue edge · name at row-title size · words (*first today*; when folded, the firing mark and/or *next*) · the lane menu (ellipsis, *{name} options*): *First today* or *Back to usual order* · *Rename* · *Colour* · *Move up* · *Move down* · *Archive group*. On wide, a grip handle appears at the head's leading edge on hover or focus (*Reorder {name}*).
   - **Cells**, one per column. Each cell's rows in order, then the add row.
5. **Add a group** — a ghost row at the foot. Pressing it turns it into a single field (placeholder *Group, usually a client*); `Enter` creates the lane and puts focus in its first cell's add row; `Esc` or an empty blur puts the ghost row back.
6. **Closed earlier** — the folded section (§3.8), only when it has something in it.

**The task row.** Minimum height 56px.

- In the active column: the toggle (44px) · the title, one line, truncating · beneath it the words line (*next* · *firing · 4 min* or *back · 2 min*) and, on the person's rows only, the note as one truncating line in `text-text-secondary` · the row menu (ellipsis, *{title} options*), visible on hover and focus on wide, always on compact.
- In any other column: the title, one line · the row menu. Nothing else. In the done column, the quiet register.
- Pressing the row (anywhere but the toggle and the menu) opens the task sheet (WF-02).
- **The row menu:** *Open* · *Move to* (the view's columns, the current one marked with a check) · *Move to view* (views, then that view's columns) · *Start* (only in a view with no active column) · *Archive*.

**The add row.** Every cell ends with *Add a task*, a ghost row. In the active column it is always visible; in other columns it is visible when its lane is hovered or holds focus, and always visible on compact. Pressing it turns it into a field (placeholder *Task*). `Enter` creates the task at the end of the cell and leaves the field open and empty for the next; `Esc` or an empty blur closes it. A title is trimmed; an empty one creates nothing. The limit is 120 characters; the field stops accepting at the limit and says nothing.

**Moving and reordering.**

- *By menu* (complete on its own): *Move to* places the task at the end of the target cell in its own lane. Changing a task's group is done in the task sheet.
- *By key*: with a row focused, `Alt`+`↑`/`↓` moves it one place within its cell; `Alt`+`←`/`→` moves it one column, to the end of that cell.
- *By drag* (wide; touch by long-press): a row lifts with the product's lift look (1.5px accent border, 0.9 opacity) and can be dropped at any position in any cell of any lane. Dropping into another lane changes its group. The drop position shows as a 2px ink line. Lanes drag by their grip, among lanes only.
- Every move out of a cell shows a toast for five seconds — *Moved to Finish later* · *Undo* — that restores column, lane, position, and firing. A reorder inside a cell shows none; it is its own undo.
- Moving a task into the done column: *Closed* · *Undo*.

**Keyboard (wide, and an external keyboard on compact).** The board is one roving-focus grid.

| Key | Does |
|---|---|
| `↑` `↓` | Previous / next row in the column, across lanes |
| `←` `→` | Same lane, the neighbouring column's nearest row |
| `Space` | Fire / back, on a row in the active column |
| `Enter` | Open the task sheet |
| `g` | Go to next: focus the next task |
| `n` | New task: open the add row of the focused lane's first column (the first lane's, if nothing is focused) |
| `Alt`+`↑` `↓` `←` `→` | Move the focused task (above) |
| `[` `]` | Previous / next view |
| `4` | (global) Workflow |

`n` on a Workflow route means *New task*; on the habit tabs it keeps meaning *Add a one-off*. Shortcuts are suppressed while a field has focus, as everywhere. They are listed on About → Keyboard under a *Workflow* heading; they are never shown as badges.

**States.**

| State | What is seen |
|---|---|
| **Loading** | The header with the `h1`; view tabs as two skeleton pills; column heads as skeleton text; two lanes of skeleton rows in the active column. No spinner. |
| **First open** | Two views exist (§3.6). No groups: the lane *No group* is drawn with only its add row, and beneath it *Add a group*. Above the lanes, the empty state: *Nothing in progress.* / *Add a task* · *Add a group*. It leaves when the first task or group exists. |
| **A view with no tasks** | The lanes with their add rows. No message. |
| **Everything firing** | The strip reads *Everything is firing.* No row carries *next*. |
| **A long title** | One line, truncated with an ellipsis; the full title is the row's accessible name and is whole in the sheet. |
| **Many lanes** | The page scrolls; column heads and the app header stay. |
| **Toggle fails to save** | The toggle returns to where it was; the status line's inline slot shows the app's standard save-failure sentence (the day list's, reused verbatim), once. |
| **Move fails to save** | The row returns to where it was; the same sentence. |
| **Offline** | The standard offline line. The toggles, add rows, menus and drags are disabled (not hidden); rows still open their sheet, read-only. Phase 1's rule, unchanged. |
| **A view was archived on another device** | The route resolves to the first remaining view. |
| **Hover / focus-visible / active / disabled** | Row hover: `bg-fill-muted`. Focus-visible: the product's ring, 2px accent, 2px offset, on the whole row; on the toggle and menu, on the control. Active: none beyond the browser's. Disabled: `text-text-disabled`, no hover. |

**Accessibility.**

- The board is announced as lanes of lists, not as an ARIA `grid` (a grid would promise cell-by-cell semantics the rows do not have): each lane is a `region` named by its group; each cell a `list` named *{Group}, {Column}*; each row a `listitem`. Roving focus moves between rows; the arrow keys are an enhancement over a tab order that already reaches everything.
- A row's accessible name, in order: title, group, column, then state — *"Stockpile measurement spec, Fybr, In progress, next, back 2 minutes"*; *"Epic tickets, Fybr, In progress, firing 4 minutes"*.
- The toggle: `aria-pressed`, labelled *Fire {title}* when off and *Mark {title} back* when on. Its 44px target is the full leading block of the row.
- The firing mark is decorative (`aria-hidden`); the word carries it. The elapsed time is `aria-live="off"`.
- One live region, polite: announces a change of next (*Next: {title}*), and *Everything is firing.* Toasts announce themselves as they already do. Nothing else speaks.
- Contrast traps, checked: *firing* and its duration are text, so they use `text-accent-text` (600 on paper, 300 on dark), never the 500. The mark at 500 is a non-text marker (3.9:1 on paper) and at its dimmest breath (0.35) it is not the carrier — the word is. The receded title at `text-text-secondary` passes AA at row-title size in both themes. The hue edge is a 2px non-text edge at 500 (passes 3:1); the group's name is always beside it.
- The firing border is not used, so the accent focus ring is never confused with a state.
- Drag: the lift, each move and the drop are announced by the sortable's existing live text; `Esc` cancels and restores.
- At 200% text the columns keep their minimum width and the board scrolls sideways in its own region; the page does not.

**Compact.** The header carries the `h1`, and beneath it two rows: the view tabs (scrolling sideways if they overflow) and the Next strip, full width. Beneath those, the **column tabs** — the view's columns as a second, scrolling tab row; one column is shown at a time and the choice is kept in the URL. The lanes stack; each shows only the chosen column's cell. Rows are edge to edge with 16px padding; the toggle is the leading 56px of the row; the row menu is always visible. Drag is by long-press on a row within the visible column; moving between columns is by the menu. Sheets rise from the bottom. Everything else — words, order, states, actions — is identical (cross-cutting §2.4).

### WF-02 The task sheet

**Who:** the person, having chosen to stop and look at one task. **The one job:** read and change one task. **Never:** a *Save* button; a required field beyond the title.

A sheet (right panel on wide, bottom sheet on compact), opened from a row, addressable in the URL so back closes it.

- **Title** — a single-line field, focused on open with the caret at the end. Required; an emptied title is not saved and the field shows *A task needs a title.* beneath it.
- **Where it stands** — a text area, optional, 2,000 characters. Label *Where it stands*; helper *What was asked, what to check when it comes back.*
- **Group** — a select of the groups in order, then *No group*.
- **Column** — a select of this view's columns.
- **Firing** — only when the task is in the active column: a row reading *Firing* with the same toggle, and the elapsed line beneath.
- Footer: *Archive* (ghost, leading) · *Done* (primary, closes the sheet).

Every field saves as it changes (text on blur and on a short pause; selects on choice), with the app's save status beside the title. A failed save reverts the field and says so in one line. *Archive* closes the sheet and shows *Archived* · *Undo*.

**States:** loading (skeleton fields) · saving · saved · failed · offline (fields read-only, the offline line at the sheet's top) · the task no longer exists (the sheet closes; the board is as it is).

**Accessibility:** focus trapped; `Esc` closes; focus returns to the row, or to the next row in the cell if the task left the cell.

### WF-03 New view

**The one job:** name a view and pick where its columns start.

A sheet. *Name* (required, 40 characters; error *A view needs a name.*). *Start from* — a list, one row per template in the selection grammar (v1.3 R56: surface, 1.5px ink border, a check): the built-in two first, then saved ones in created order; each row's second line is its columns joined by middots. Saved templates carry a row menu: *Rename* · *Archive*. Nothing is preselected. Footer: *Cancel* · *Create view* (primary; pending while it saves). On create the sheet closes and the new view opens. Toast: none; the new tab is the confirmation.

**States:** nothing chosen (primary disabled) · creating · failed (the standard sentence, the sheet stays) · offline (disabled, the line).

### WF-04 Columns

**The one job:** arrange one view's columns.

A sheet titled *Columns*. A reorderable list (the sortable list, with its handle and `Alt`+arrows), one row per column: the name as a field · a row menu: *Tasks fire here* · *Closed tasks land here* (each a checkable item; choosing one clears it from any other column) · *Remove*. Beneath the name, the role as a caption when one is set: *Tasks fire here* / *Closed tasks land here*. *Add a column* as a ghost row at the foot, absent at five. Footer: *Done*.

- Saves as it changes.
- A name is required (40 characters); an emptied field restores the last name on blur.
- **Remove** on an empty column removes it, with *Removed* · *Undo*. On a column with tasks, a dialog: *Move its tasks first.* / *Where should the tasks in {Column} go?* with the remaining columns as radio rows, and *Cancel* · *Move and remove*. The last column cannot be removed (the item is disabled).
- Taking *Tasks fire here* off a column ends firing on every task in it; the dialog says so before it happens: *Tasks in {Column} will stop firing.* / *Cancel* · *Continue*.

### WF-05 Archived

**The one job:** bring something back.

A sheet from the view menu. Two sections under plain headings, each only when it has rows: *Tasks* (title; second line *{Group} · archived {date}*) and *Groups*. Each row has one action, *Restore*. A restored task returns to the end of its cell; if its column is gone, to the view's first column; if its view is archived, to the first view. A restored group returns to the end of the order. Archived views are restored from the *New view* sheet's foot, under *Archived views*. Empty: *Nothing archived.*

### Dialogs

- **Archive group** — only when the group holds tasks: *Archive {Group}.* / *Its tasks move to No group.* / *Cancel* · *Archive*. An empty group archives at once with *Archived* · *Undo*.
- **Archive this view** — *Archive {View}.* / *Its tasks are kept and come back with it.* / *Cancel* · *Archive*. The last view cannot be archived (the item is disabled).
- **Rename** (group, view, saved template) — in place: the name becomes a field; `Enter` or blur saves; `Esc` restores.
- **Colour** — a popover with the eight hues as a swatch row, each labelled by its name (*leaf*, *sky*, …); the current one checked.

---

## 5. Navigation and routes

- **The rail** (wide) gains the row *Workflow* after *Review*, before *Settings*. **The tab bar** (compact) gains the same word tab in the same place: *List · Schedule · Review · Workflow · Settings*. No dot, no badge, ever (W15).
- **Routes** (builders in `lib/routes.ts`, as every route):

| Route | Screen |
|---|---|
| `/workflow` | Resolves to the last view opened, else the first view. Never renders. |
| `/workflow/{view}` | WF-01 |
| `/workflow/{view}?sheet=task&id={task}` | WF-02 over WF-01 |
| `/workflow/{view}?sheet=new-view` | WF-03 |
| `/workflow/{view}?sheet=columns` | WF-04 |
| `/workflow/{view}?sheet=archived` | WF-05 |
| `/workflow/{view}?col={column}` | Compact: the column shown |

- Sheets are URL state and back closes them (cross-cutting §1.3). Switching views is a navigation; focus moves to the `h1`.
- **Entry.** Workflow routes do not wait behind the orient frame (W16). First run still comes first for an account that has not finished it, as for every shell route.
- **Home** stays the List. Nothing in the habit day links to Workflow, and nothing in Workflow links to the habit day (W13).

---

## 6. Motion

| Thing | Motion |
|---|---|
| The firing mark | Opacity 1 → 0.35 → 1, 2400ms, `ease-in-out`, continuous. The one long duration in the product; it needs a token (§9). |
| The toggle changing | 120ms (`--dur-state`): the ring fills / empties. |
| A lane folding | 200ms (`--dur-sheet`), `--ease-settle`. |
| A row settling after a move | 120ms. |
| *Next* moving to another row | No animation. The surface and the word appear on the new row and leave the old. The eye finds it by the strip. |
| Sheets | As everywhere. |

Reduced motion: the mark is still; lanes and rows change without transition; sheets crossfade. Designed, not tolerated — the board is fully legible with nothing moving, because no state was ever carried by motion alone.

---

## 7. Copy deck

Every string on the surface. Sentence case; no exclamation marks; no second person; no emoji.

| Where | String |
|---|---|
| Nav, `h1` | Workflow |
| Built-in views | Working · Queue |
| Built-in columns | In progress · Ongoing · Finish later · Done · Up next · Later · Someday |
| Header | New view · View options |
| Next strip | Next · *{Group} · {Task}* · Everything is firing. |
| Tab title | Next: {Task} — Synapse · Everything is firing — Synapse · Workflow — Synapse |
| Row words | next · firing · firing · {duration} · back · {duration} |
| Lane words | first today |
| Toggle (accessible) | Fire {title} · Mark {title} back |
| Add rows | Add a task (placeholder *Task*) · Add a group (placeholder *Group, usually a client*) · Add a column |
| Row menu | Open · Move to · Move to view · Start · Archive |
| Lane menu | First today · Back to usual order · Rename · Colour · Move up · Move down · Archive group |
| View menu | Rename · Columns · Save as a template · Archived · Archive this view |
| Lane | No group · Collapse {name} · Expand {name} · Reorder {name} |
| Foot | Closed earlier |
| Toasts | Moved to {Column} · Started in {View} · Closed · Archived · Removed · Restored — each with *Undo* |
| Empty | Nothing in progress. · Nothing archived. |
| Task sheet | Title · Where it stands · What was asked, what to check when it comes back. · Group · Column · Firing · A task needs a title. · Archive · Done |
| New view | New view · Name · Start from · A view needs a name. · Archived views · Cancel · Create view |
| Columns | Columns · Tasks fire here · Closed tasks land here · Remove · Move its tasks first. · Where should the tasks in {Column} go? · Move and remove · Tasks in {Column} will stop firing. · Continue |
| Save a template | Save as a template · Name · A template needs a name. · Save |
| Dialogs | Archive {Group}. · Its tasks move to No group. · Archive {View}. · Its tasks are kept and come back with it. · Cancel · Archive |
| Archived | Archived · Tasks · Groups · Restore · {Group} · archived {date} |
| Failure, offline | The app's existing save-failure sentence and the standard offline line, reused verbatim — not rewritten here. |
| Keyboard list | Workflow · Fire or mark back · Open · Go to next · New task · Move a task · Previous view · Next view |

Durations use the product's existing short form (*4 min*, *1 h 12 min*).

---

## 8. What this surface never says or does

- *Overdue*, *waiting on you*, *stale*, *idle*, *behind*, *{n} waiting*, *you*.
- A count on anything. A badge on the nav. A notification of any kind: Workflow sends none in this version.
- A second animated thing. A colour that means *late*.
- A suggestion of what to work on beyond the one word *next*.

---

## 9. Component needs

Audited against `packages/ui/src/`. Reused where a component exists; new only where none does. New reusable pieces go to `@syn/ui` with a story first.

**Reused as they are:** `AppHeader` · `Tabs` (view tabs; column tabs on compact) · `EllipsesMenu` · `ResponsiveSheet` · `SortableList` (WF-04's column list) · `Collapsible` · `EmptyState` · `SkeletonRow` · `StatusLine` · `toastUndo` · `ColorSwatchRow` · `Popover` · `AlertDialog` · `Input` · `Textarea` · `Select` · `SaveStatusText` · `ArchivedSection` (as *Closed earlier*) · `LargeTargetRow` (WF-03's template rows, in the R56 grammar) · `Text` for every string.

**New in `@syn/ui`:**

| Component | What it is | Variants and states |
|---|---|---|
| `FiringToggle` | The 44px toggle with the mark. | `pressed` · `disabled` · focus-visible · reduced motion. Props: `pressed`, `onPressedChange`, `label`, `disabled`. |
| `FiringMark` | The 10px mark alone, for a folded lane's head. | breathing · still. |
| `TaskRow` | A board row. | `variant`: `active` (toggle, words, note) · `plain` · `closed` (quiet register). States: next · firing · back · hover · focus-visible · lifted · disabled · skeleton. Takes a view model, never a row. |
| `LaneHeader` | A group's head. | expanded · collapsed (with mark and/or *next*) · first today · the *No group* form (no menu, no grip, no hue). |
| `NextStrip` | The header's answer. | a task (button) · everything firing (text) · absent. |
| `InlineAddRow` | The ghost row that becomes a field. | resting · editing · disabled. Used for a task, a group, a column. |
| `Board` | The grid: sticky column heads, lanes, cells, the cross-cell drag. | wide · compact (one column); loading. Owns the drag and its announcements; emits a move, never performs one. |

**New token:** one duration for the breath (`--dur-breathe`, 2400ms) and its keyframes. No new colour: the mark is `accent-mark`, the words `accent-text`, the lane edge a category 500, the next row `surface`.

`StateWord` is not reused for *firing* / *back* / *next*: it is the habit day's vocabulary and reserves its dot. The board's words are drawn by `TaskRow`.

---

## 10. Convergence tests

- **Worst moment.** Mid-thought, eyes coming off a terminal for a second: the strip answers *which one*; one key (`g`, then `Space`) acts. Passes. One-handed on a phone: one column, 56px toggle block, menu always visible. Passes.
- **Register.** Nouns and verbs; no question outside a dialog the person opened. Passes.
- **Trust.** Nothing here is shared, sent, or fetched; a task's title and note are the person's and are covered by the one trust line already in Settings and the export. The export must include them (routed to Mason, §11).
- **Alarm.** No red, no countdown, no count, no flash; the only motion is a slow breath on the rows that need nothing. Passes.
- **Contrast.** Traps listed under WF-01 and checked in both themes on paper; to be re-checked on the built surface.
- **State.** Every interactive element has its matrix above.
- **Drift.** Lanes on paper with hairlines and one surface row; no cards, no shadows, no coloured columns. It would not be at home in a kanban template. Passes.
- **Buildability.** Open items are §13; none blocks a first build.

---

## 11. The data the screens need (for Mason)

Stated as needs. The notes' §8 model is a starting point the notes themselves say to adjust; where this differs, the reason is given.

- **A group:** a name, a hue, a place in the usual order, folded or not, archived or not. Per person.
- **Today's pins:** for the person's current day, the groups made *first today*, in the order they were pinned. Gone at day close without anything having to run. (The notes store a whole group order per date; the screens need only the pins, and a whole order would have to be reconciled every time a group is added.)
- **A view:** a name, a place in tab order, its columns, archived or not; and which view was opened last.
- **A column:** a name, a place in its view, at most one of two roles.
- **A saved template:** a name and an ordered list of column names with roles. Nothing refers to it after a view is made from it (W10). The two built-in templates are not the person's data.
- **A task:** a title, a note, a group or none, a view and a column, a place in its cell, when it started firing (or that it is not), when it last came back, when it was closed, archived or not. (The notes carry `isFiring` beside `firingStartedAt`; the screens need one fact, not two that can disagree.)
- **Derived, never stored:** which task is next; today's lane order; a duration.
- **Behaviour the screens depend on:** a toggle that is safe to send twice; a move that is one step even when it changes column, lane and position together; an undo that can restore firing; everything private to the person and present in their export.

---

## 12. Not in this version

Recorded so they are not mistaken for forgotten. Whether any becomes a Phase 2 pin is Taylor's to say (the collection's rule).

| Item | Why it waits |
|---|---|
| **Firing detected from Claude Code** (NQ7) | A non-goal in the notes. The manual toggle stays as the override when it arrives. |
| **A group tied to a work focus; a task placed in the day** (NQ6, P2-2) | Two models to reconcile; the board has to be trusted on its own first. |
| **A weekly rule for *first today*** (*Viewpoint leads on Thursdays*) | The notes' example is weekly, but the ask is a per-day swap. Watch how often the same pin is set by hand. `[OPEN #W1]` |
| **More than one person** | A non-goal in the notes. |
| **How long prompts take; any history of firing** | Nothing asks for it, and it is a Review-shaped surface with a tone rule to write first. |
| **A link on a task** (to the thread, the ticket) | Plausibly the next thing wanted. Not in the notes. `[OPEN #W7]` |
| **Notifications** | Nothing here is a scheduled fact. |
| **Offline writes** | Phase 2 for the whole product. |

---

## 13. Open items and defaults

| # | Tag | Item | Where | The default in force |
|---|---|---|---|---|
| W1 | `[OPEN]` | Should *first today* be able to repeat on a weekday? | §3.5, §12 | No; one day at a time. |
| W2 | `[DEFAULT]` | The firing treatment: a breathing 10px mark, not a pulsing row (W5). The one place this document narrows the notes' own words. | §3.3 | The mark. Flip: add a 1.5px accent border on firing rows, also breathing. |
| W3 | `[DEFAULT]` | Every group shows as a lane on every view, even when empty there. | §3.5 | Shown. Flip: hide lanes with no tasks in the view. |
| W4 | `[DEFAULT]` | A view has one to five columns. The notes say *four for v1*; the queue reads better as three. | §3.6 | 1–5. |
| W5 | `[DEFAULT]` | Closed tasks leave the Done column at day close, into *Closed earlier*. | §3.8 | Day close. Flip: keep a week. |
| W6 | `[OPEN]` | A task left firing for hours (the toggle forgotten). The board says nothing. Real use will show whether that is right. | §3.3 | Says nothing. |
| W7 | `[OPEN]` | A link on a task. | §12 | None. |
| W8 | `[DEFAULT]` | Workflow opens without the orient frame first (W16). | §5 | Exempt. |
| W9 | `[DEFAULT]` | The on-screen noun is *Task* (W17). | §1.4 | *Task*. Flip: *Thread*. |
| W10 | `[DEFAULT]` | The note, *Where it stands* (W19), and its place as the row's second line. | §3.2, WF-02 | Present. |
| W11 | `[DEFAULT]` | Group hues from the eight category hues, assigned in order. | §3.5 | Assigned. Flip: no hue; name only. |
| W12 | `[DEFAULT]` | The tab title follows *next*. | §3.4 | Follows. |
| W13 | `[DEFAULT]` | *Start* targets the first view in tab order that has an active column. | §3.7 | First such view. |
| W14 | `[ASSUMPTION]` | The day that *first today* belongs to is the person's Synapse day (their day close), not midnight. | §3.5 | Day close. |
| W15 | `[COPY]` | Every string in §7 is mine and in register; all are adjustable. *Firing* and *Back* are the notes' own words. | §7 | As written. |

---

## 14. Sign-off

Settled by this document: W1–W19, each flippable in one line. Proposed and reversible: the fifteen defaults in §13. Open and waiting on real use or on Taylor: #W1, #W6, #W7.

The trade named once more, because it is the one that matters: the notes asked for rows that pulse; this document gives a mark that breathes and spends the saved attention on a single word, *next*. If the board is glanced at from across a room, that trade is wrong and #W2 flips it. If it is glanced at from a foot away, between prompts, it is right.

Routed onward: the data shape, the drag's construction, the shell changes and the export to Mason (§11, §9, §5); sequencing to Reeve; the Phase 2 pins in §12 to Taylor.
