# Epic 1 — Setup: how to work this folder

**Read [`../README.md`](../README.md) first** — it holds the global build order, the placement rules, and the cross-track dependencies. This file adds only what is local to Epic 1.

**Governs:** the domain schema (the root of every track), auth, first run, the habit library, categories, templates, the week build, and settings — every screen a person meets before and outside execution mode. **Source document:** [`docs/ux/epic1_setup_ux_architecture.md`](../../ux/epic1_setup_ux_architecture.md) (screens `AU-`, `FR-`, `LB-`, `CT-`, `TP-`, `WK-`, `ST-`), under the official spec §3, §4, §8, §9, §10. **Register:** planning mode — depth is allowed, one primary action per screen, forms save on the primary, canvases autosave.

**Authors:** Vesper · Mason · Reeve, 2026-09-05. **Executor:** an Opus thread per ticket.

---

## Folder layout

| Path | What |
|---|---|
| `README.md` | This file — kickoff contract, precedence, locked scope, non-negotiables |
| `00-build-order.md` | The ordered, checkable queue with the critical path |
| `SET-1…SET-10-*.md` | One implementable slice each |
| `PROGRESS.md` | The authoritative "what is Complete" view |
| `DEVIATIONS.md` | Append-only: one line per intentional divergence |
| `TECHNICAL-DECISIONS.md` | Append-only: one section per architectural choice with real alternatives |
| `_templates/slice-spec.md` | The blank ticket |

---

## What Vesper decided for this epic (the UI, against what is built)

Every Epic 1 screen composes existing `@syn/ui` exports; **no new composite is needed for this epic.** The decisions that shape every ticket:

- **Sheets are `ResponsiveSheet`** — bottom drawer on compact, right panel on wide, with `dirty` + `onDiscardRequest` driving `DiscardDialog`. Form sheets: LB-02, CT-02, TP-03, WK-02, WK-03, ST-06a. The one exception is TP-02, which is a **screen** (a canvas), never a sheet, even when first run embeds it.
- **Lists are `ListRow` inside `GroupHeading` sections**, with `ArchivedSection` at the bottom and `EmptyState` (`density="page"`) when empty. Overflow is `EllipsesMenu`. Confirmations are `ConfirmDialog`; the three-way apply is `ThreeOptionDialog`; typed delete is `TypedConfirmDialog`.
- **Forms are `useSynapseForm`** over a `@syn/validators` schema, fields rendered by the composites that already own their contract: `Stepper17` (importance, priority), `RangeInput` (time it might take), `MinutesStepper` (takes), `CountStepper` (weekly target), `SegmentedControl` (type, when, timing), `ChipPicker` (category), `ColorSwatchRow` (hue), `WeekdayChips`, `TimeField`, `TimezoneSelect`, `PickerList` (habit / template / what), `CuratedIconGrid` + `EmojiPicker` + `ImageCropper` (the three icon tabs, in `Tabs`).
- **Headers are `AppHeader`** — the screen's one `h1`, with `saveStatus` on the two canvases and `action` for *Add* / *New*.
- **First run is the `(setup)` group's own frame** — progress label, back, *Finish later* — around the same LB-02 / TP-02 / WK-01 the settings screens use. Nothing is a first-run-only variant.
- **Copy is the document's, verbatim.** Epic 1 §9 gives every validation string; the ticket's validator carries it as the zod message.

---

## Source precedence

1. **Product behaviour** → official spec §0.3 (signed) and §3–§4, §8–§10 → `epic1_setup_ux_architecture.md` for its screens → the cross-cutting document (§8 record integrity, §9 coverage) between them → the v2 handoff for component contracts.
2. **Architecture & placement** → [`../README.md`](../README.md) § Placement rules → `codebase-conventions.md` → the domain guides (`db-and-rls-authoring.md`, `drizzle-orm-conventions.md`, `trpc-foundation-patterns.md`, `copy-conventions.md`).
3. **App rules** → [`apps/web/AGENTS.md`](../../../apps/web/AGENTS.md) (route map, scope, non-negotiables).
4. **This track's rulings**, each labelled and logged in the ticket and summarised in `TECHNICAL-DECISIONS.md`.
5. **On-disk reality + `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`** override any stale string in a ticket or document.

---

## The kickoff contract (one ticket per thread)

```
You are building ONE ticket from docs/specs/epic-1-setup/: <TICKET-ID>.

OBJECTIVE
Ship the ticket's Acceptance criteria — nothing more (scope creep), nothing less.

BEFORE WRITING CODE
1. State the ticket ID and title in your first message.
2. Confirm every entry in the ticket's "Depends on" shows Complete in the owning
   track's PROGRESS.md (dependencies may live in epic-2-in-use/ or
   cross-cutting-system/). If any is not Complete, STOP and say so.
3. Read the ticket spec end to end, then its attach-list in order.
4. Read this track's DEVIATIONS.md and TECHNICAL-DECISIONS.md, and the
   infrastructure track's — on-disk reality + those logs override any stale
   string in a spec or a UX document.
5. State the exact file paths you will create or change before implementing.

CONSTRAINTS
- Honor every non-negotiable verbatim. If the spec would force you to break one,
  STOP and ask — never silently contradict it.
- Every string a person reads comes from the UX document, verbatim, in a copy.ts.
- Filenames kebab-case; named exports only; Server Components default; client
  leaves in _components/ (or a components/<feature>/ folder) with "use client"
  line 1; routes from lib/routes.ts; every user-scoped query through
  ctx.rls.execute(); one env.ts reader.
- Audit @syn/ui before building a component. Nothing in this epic needs a new
  composite; if you believe one is needed, STOP and say why.
- No tests. No AI. No domain table beyond what the ticket names.
- Schema work: author the migration and the journal entry, regenerate
  SCHEMA_REFERENCE.md, verify on a LOCAL database, and STOP before db:migrate on
  any hosted tier — a human applies it.
- If you modify files owned by an upstream Complete ticket, re-check that ticket's
  affected acceptance criteria before finishing.

DEFINITION OF DONE
1. yarn lint · yarn lint:boundaries · yarn check-types · yarn build pass (run as
   four separate commands).
2. Happy path exercised against the local database when the slice touches
   DB/tRPC flows; every acceptance criterion checked and stated.
3. The ticket's Status line set to: Status: Complete (YYYY-MM-DD).
4. PROGRESS.md row + checklist ticked.
5. One DEVIATIONS.md line per divergence: YYYY-MM-DD · <ticket-id> · <what> · <why>.
   Architectural choices with real alternatives → TECHNICAL-DECISIONS.md.
6. yarn directory-map if files were added/moved/removed; yarn db:schema-reference
   if the schema changed.
7. Close with 3–5 lines: what shipped, deviations, the one thing the next ticket
   must know.

Do not start the next ticket.
```

---

## Completion protocol

Three places, every time: the ticket's `Status:` line, `PROGRESS.md` (row + checklist), `DEVIATIONS.md` (one line per divergence; `TECHNICAL-DECISIONS.md` when a choice had alternatives). Then tick `00-build-order.md`, which mirrors the event and is not a source of truth. "The agent said done" is not done.

---

## Locked scope (do not re-litigate)

- **Official spec §0.3 R1–R7 are signed.** In this epic: R5 (wake time comes from the wake-anchor habit; the flag lives on `users.wake_anchor_habit_id`), R7 (7 is highest).
- **Phase 1 only.** No Google Calendar (ST-12 hidden; the `calendar_event_id` column exists as a seam and nothing writes it). No offline writes. No AI, billing, social surface.
- **The v2 handoff's component contracts stand.** LB-02's icon picker is the three built tabs; the 1–7 control is `Stepper17`, never a slider; the range is two fields (`RangeInput`), never a slider.
- **The schema is official spec §3 in full, in one migration (SET-1),** shaped for every phase from day one (R4). Later tickets in every track add columns only by a logged deviation.
- **`week_plans` is not a table.** Week status is derived from the week's days (SET-1 ruling). `WeekPlanStatus` remains the type the week read model returns.
- **Materialisation is immediate** (official §4.5): applying a template writes the day's items at absolute times. There is no lazy "materialise on open".
- **Nothing in this epic is reachable from the execution tabs** except through the two doors the official spec allows (empty-day actions, the day-header sheet), and both lead here rather than editing in place.

---

## Non-negotiables (every ticket honours these)

- **Every domain table is owner-private.** `ownerPrivateCrudPolicies` on every table this epic creates; a denormalised `user_id` on every one of them; every read and write through `ctx.rls.execute()`. There is no admin read. The one exception — `feedback_messages` — is SYS-3's and is not touched here.
- **Archive, never delete.** Habits, templates, and reasons archive. The only deletes in the product are a one-off item, a timer session, a category (which unassigns), and the account.
- **The record is annotated.** A `day_items` row snapshots `title`, `icon`, `quantity_unit`, `reflection_axes`, and `notes_preflight` at materialisation; editing the habit rewrites only untouched future items (SET-4 ruling) and never a started, done, reviewed, or past one.
- **Fixed/Flexible in the interface; `hard`/`soft` in the schema.** Official §10.2. A screen that shows the schema word is a defect.
- **One primary action per screen, last in reading order.** Forms save on the primary; TP-02, WK-01, WK-02 autosave with `SaveStatusText` in the header and never prompt to discard.
- **Validation copy is Epic 1 §9, verbatim, as the zod message.** The form and the procedure share the schema; the person reads one sentence.
- **Secrets never reach a browser bundle; uploads go through minted signed URLs;** the icon and avatar buckets stay private.
- **Never migrate a hosted tier from an agent.** Author, journal, verify locally, stop.

---

## Canonical paths & known-stale warnings

- The route skeleton, route builders, and `(auth)` / `(setup)` / `(shell)` layouts exist (INF-7). Epic 1 **replaces placeholder pages**; it never adds a route that is not in `lib/routes.ts`.
- The `user` router (`me`, `updatePreferences`) and `services/user/preferences.ts` exist (INF-8). Account-shaped procedures extend that router; do not create an `account` router.
- `packages/db/src/schema/` holds only `users` and `web_push_subscriptions`. Every other table arrives in SET-1. `SCHEMA_REFERENCE.md` is regenerated, never hand-edited.
- `packages/db/src/seed/index.ts` seeds nothing; SET-1 gives it the starter set and the default reasons.
- `apps/web/components/` does not exist yet. SET-4 creates it with the first feature folder.
- Epic 1's ST-07 lists Phase-2 notification rows (N2, N3, N7, N8, N9). They render as rows with switches (the preference is real, the sender is not); the ticket says which.
- The status line's `setup` copy in `packages/ui/src/composed/feedback/status-line/copy.ts` is marked for Vesper sign-off. **Signed here:** text *Setup isn't finished*, action *Continue* (Epic 1 §0.5). SYS-1 applies it.
