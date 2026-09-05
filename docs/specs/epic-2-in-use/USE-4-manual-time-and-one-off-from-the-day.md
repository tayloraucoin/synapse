# USE-4 — Manual time, sessions, pause and resume, and a one-off edited from the day: IT-02, G1, and the *From {template}* line

**Epic:** USE — In Use · **Phase 2** · Size: M
**Slice type:** Four additions to the item sheet over the timer engine and the one-off sheet. The risk class is *a session that lies*: overlapping sessions on one item, a manual edit that loses the `source`, a removed one-off with no undo.
**Vigil:** none; USE-3's timer review covers the engine. Induce the overlap error and the remove-undo.

**Status:** Not started

---

## Outcome

A person who forgot the timer can add the time by hand; one who started it can pause and resume; every session is listed and editable; a session can be removed with a five-second undo. A one-off on today can be edited (*Edit*) or removed (*Remove*, with undo) from its sheet; a template-derived item shows *From {template}* instead, so the absence of those actions is explained; an archived habit's item shows *archived* beside the type word. **Nothing else about the sheet changes.**

## Why / intent

- **Official spec §5.4** — pause/resume supported, lower priority, each segment a `timer_session`; "Manual entry of start/end after the fact is always available on the sheet (*Add time by hand*)".
- **Epic 2 §4 (IT-01's session list and *Add time by hand*; IT-02)** — every read, the defaults (scheduled start and start + duration), the bounds (the day), the two errors (*"To" should be after "from".* · *This overlaps another session on this item.*), `source: manual`, *Remove this session* with a 5-second undo toast.
- **Cross-cutting §9.3 G1** — for `origin = one_off` only: *Edit* in the header row → WK-03 in edit mode; *Remove* in the footer before *Not today* → dialog *Remove {title} from today?* — **Keep** · **Remove** (undo toast 5 s); template-derived items show neither and gain a muted *From {template}*. §8.1 — editing a one-off's time after it has started or been done writes a ghost like a late start. §8.2 — removal on a reviewed day asks *Remove {title} from {date}? It was {outcome}.* — **Keep** · **Remove**, and the number recomputes. §8.3 — *archived* beside the type word.
- **Ground truth:** USE-3's `components/item-sheet/`, `timer.start/stop`, the store; SET-6's `OneOffSheet` (edit mode via `itemId`) and `week.updateOneOff`/`removeOneOff` (returns the payload for undo); SET-1's `day_items.template_name_snapshot` (SET-6's column); `@syn/ui` `TimeField`, `SessionRow onEdit`, `TimerControl pauseEnabled onPause onResume`, `ConfirmDialog`, `Text`, `toastUndo`.
- **What this slice is NOT (binding):** no new sheet beyond IT-02; no change to the one-timer rule; no Schedule (USE-5).

**Rulings this slice makes (labelled, logged):**

- **Pause and resume are `timer.pause` / `timer.resume`**: pause ends the open session; resume opens a new one; the store's `accumulatedSec` carries the closed sessions' total; `status` cycles `running → paused → running`. `completion_state` stays `active` while paused. Logged.
- **Manual sessions may overlap other items' sessions but not the same item's** (the document's rule); the check is in the service with `CONFLICT` `{ code: "session_overlap" }` mapped to the sentence. Logged.
- **IT-02 bounds `From`/`To` to the day's window** (USE-1's `dayWindow` in the day's zone) via `TimeField min/max`; the server clamps and rejects outside it. Logged.
- **Editing a one-off's time after it has started or been done** goes through `week.updateOneOff`, which applies the late-start rule from USE-3 (`scheduled_start` moves, `original_scheduled_start` stays) — the same service function, not a second rule. Logged.
- **Removing a one-off on a reviewed day** uses the §8.2 dialog body with `{outcome}` from the item's decided line (`done 7:24` · `missed — {reason}` · `carried`); on an open day, the G1 body. Both delete the row via `week.removeOneOff` and offer `toastUndo("Removed {title}", 5 s)` whose undo re-inserts the payload (`week.restoreOneOff`) with the same id where possible `[Dev's call: same id via explicit insert; recommend yes so a notification deep link survives an undo]`. Logged.
- **`From {template}`** reads `template_name_snapshot`; when the item is template-derived and the snapshot is null (materialised before `0002`), the line is *From a template* `[COPY — needs Vesper sign-off]`. Logged.

## Experience & states

### IT-01 additions

- Under the timer: the text link *Add time by hand* → IT-02 (create). Each `SessionRow` gains `onEdit` → IT-02 (edit, prefilled). `TimerControl pauseEnabled` with `onPause`/`onResume`; while paused the display holds and the row's elapsed holds (the store stops ticking for that id).
- Header row, one-off only: a text action *Edit* → `OneOffSheet itemId date` (edit mode, stacked over the item sheet on compact / beside on wide — same pattern as SET-4's stacked sheets); on save the item sheet re-reads.
- Header, template-derived only: `Text tone="secondary"` *From {template}*.
- Beside the type word, when the habit is archived (the read model gains `habitArchived: boolean` — a one-line extension of USE-1's `to-view.ts`; re-check its AC 9): `StateWord kind="archived"`.
- Footer, one-off only, before *Not today*: *Remove* (ghost) → `ConfirmDialog` per the ruling → on confirm the sheet closes, the row disappears, the toast offers undo.

### IT-02 Add time

`ResponsiveSheet` *Add time* / *Edit time* · `TimeField label="From"` · `TimeField label="To"` (both `min`/`max` = the day's window in the day's zone; defaults: scheduled start and start + duration, or the session's values) · a computed line *{n} min* (updates live; *—* when invalid) · footer *Cancel* · *Save* · in edit: *Remove this session* (ghost) → immediate delete with `toastUndo("Removed session", 5 s)` `[COPY — needs Vesper sign-off: the document says "deletes with a 5-second undo toast" without the label]`. Errors under *To*: *"To" should be after "from".* and *This overlaps another session on this item.*

Save → `timer.addManual({ itemId, startedAt, endedAt })` (`source = manual`) or `timer.updateSession({ id, startedAt, endedAt })` (keeps `source`); the state line and the session list update; the store re-seeds `accumulatedSec`.

**States (exhaustive):** IT-02: create · edit · saving · field error · overlap error · offline. IT-01 additions: paused · one-off (Edit/Remove present) · template-derived (*From {template}*) · archived-habit · remove-dialog · reviewed-day-remove-dialog.

**Failure / edge states:** a manual session entirely in the future → allowed? **No** — `endedAt` must be ≤ now; error `[COPY — needs Vesper sign-off]` · pause on a multitask sibling → independent · a one-off edited to a different date from the item sheet → the *Day* field is not shown here (`allowDateChange` false from this entry) · removing the item currently ticking → `timer.stop` first, then remove.

## Non-negotiables (this slice)

- **Manual edits are marked `source: manual`; timer sessions keep `source: timer`** through an edit.
- **Sessions on one item never overlap.**
- **Only one-offs can be edited or removed from the day.** Template-derived items say where they came from instead.
- **A removed one-off is restorable for five seconds** with its sessions and notes.
- **Every string is Epic 2 §4 / cross-cutting §9.3 verbatim**; the three gaps are marked.

## Data & AI

**Schema changes: none.**

**Tables:** `timer_sessions` (insert manual, update, delete) · `day_items` (update via `week.updateOneOff`; delete/restore via `week.removeOneOff`/`restoreOneOff`) · `days` (`review_edited_at` on a closed day).

**Placement:** `timer.pause`, `timer.resume`, `timer.addManual`, `timer.updateSession`, `timer.removeSession`, `timer.restoreSession` on the timer router; `week.restoreOneOff` on the week router; services beside USE-3's; validators in `timer.ts`; `components/item-sheet/manual-time-sheet.tsx` (IT-02 lives inside the item-sheet folder — nothing else opens it).

**tRPC / validators:** as above; `manualSessionInput` with the two messages as `superRefine` errors (the overlap is server-only).

**AI notes:** **None.**

## Accessibility

- The computed *{n} min* line is `aria-live="polite"`, updated on blur not keystroke.
- *Remove this session* and *Remove* are ghost buttons with the item or session in their accessible names.
- The stacked one-off sheet returns focus to *Edit* on close.
- `TimerControl`'s paused state is announced through its button labels (*Resume*, *Stop*), not colour.

## Acceptance criteria (observable — compact and wide)

1. *Add time by hand* opens IT-02 with *From* at the scheduled start and *To* at start + duration; saving writes a `timer_sessions` row with `source = manual`; the state line reads *time logged: {n} min in 1 sessions*.
2. *To* before *From* shows *"To" should be after "from".*; a range overlapping an existing session on the same item shows *This overlaps another session on this item.*; an overlap with another item's session saves.
3. A session row's edit opens IT-02 prefilled; changing the times keeps `source = timer` for a timer session; *Remove this session* deletes with *Removed session* [*Undo*] for 5 s and undo restores it.
4. *Pause* ends the open session and holds the display and the row; *Resume* opens a new session; `completion_state` stays `active` throughout; *Stop* while paused ends nothing new and returns the item to `upcoming`.
5. A one-off's sheet shows *Edit* in the header and *Remove* before *Not today*; a template-derived item's sheet shows neither and reads *From {template}*.
6. *Edit* opens the one-off sheet in edit mode; changing the time of a done one-off moves `scheduled_start` and keeps `original_scheduled_start`; the row reads *moved*.
7. *Remove* → *Remove {title} from today?* — **Keep** · **Remove**; confirming removes the row and shows *Removed {title}* [*Undo*] for 5 s; undo restores the item with its sessions and notes (verify the rows).
8. On a reviewed day (`reviewed_at` set), *Remove* reads *Remove {title} from {date}? It was {outcome}.*; confirming stamps `review_edited_at`.
9. An item whose habit is archived shows *archived* beside the type word.
10. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- The overlap check is one query: `SELECT 1 FROM timer_sessions WHERE day_item_id = $1 AND id <> $2 AND tstzrange(started_at, COALESCE(ended_at, now())) && tstzrange($from, $to)`.
- `restoreOneOff` with the original id: insert the saved payload including `id`; the `days` row still exists.
- The store's `accumulatedSec` after a manual add: re-seed from the refetched `DayView` (its `timerElapsedSec` already sums sessions for the active item; for idle items the sheet reads the session list).

## Dev's call

Same-id restore (recommended) · whether IT-02 is a nested drawer or replaces the item sheet's content on compact (recommend nested — the sheet is one level deep and returns).

## Out of scope

- **Drawing sessions on the Schedule** — USE-5 draws the item's live block; sessions are not drawn in v1.
- **N8 persistent timer notification** — Phase 2.
- **Editing template-derived items' times** — never in v1 (cross-cutting §8.1).

## Depends on

- **USE-3** — the item sheet, the engine, the store. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet.** Additions over a settled engine with precise rules and two induced errors. The failure mode of choosing down is an overlap check that misses the open session (`ended_at IS NULL`) — the advisory query says how.

---

### Kickoff (paste into the session)

> Build **USE-4 — Manual time, sessions, pause and resume, and a one-off edited from the day** (attached spec). Model: **Sonnet**. **Manual is `source: manual`; sessions on one item never overlap; only one-offs edit or remove from the day; a removed one-off is restorable for five seconds.**
> Attach/read first, in order: this spec · Epic 2 §4 (IT-01 sessions, IT-02) · official spec §5.4 · cross-cutting §8.1, §8.2, §8.3, §9.3 (G1) · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · USE-3 (`item-sheet/`, the timer router, the store — extend) · SET-6 (`OneOffSheet` edit mode, `week.updateOneOff/removeOneOff`) · `packages/ui/src/composed/{control/timer-control,display/session-row,control/time-field}/` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `../epic-1-setup/DEVIATIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
