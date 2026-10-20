---
epic: USE
status: ratified
role: Mason
support: Warden (personal data, the first hard delete in USE)
date: 2026-10-20
ratified: 2026-10-20
---

# Delta: Settings › Morning reading

The Technical stage for the approved ledger `ux/account/morning-reading/` (D-USE-119 to D-USE-133), read against the code at `9bfd3c62`. It adds to this folder and changes nothing above it. Every morning-reading ticket reads this file.

## Placement, by who imports it

| Part | Path | Why there |
| --- | --- | --- |
| Inputs | `packages/validators/src/passage.ts`, `link.ts` (reuse `passageFormSchema` and `linkFormSchema`); a new `morning-reading.ts` for `readingKindInput` (`"passage" \| "link"`), `reorderReadingInput` (`kind`, `ids`), `readingRowInput` (`kind`, `id`), `turnOnInput` (`kind`, `id`, `restore`), and the list record | The web app's data layer parses them before a call, and so does the router. Today only `_legacy` imports the two form schemas |
| Rules and store | `packages/api/src/services/morning/reading-list.ts`: `listReading`, `savePassage`, `saveLink`, `reorderReading`, `turnOff`, `turnOn`, `deleteOffRow`, `normaliseLinkUrl`, a `ReadingListStore` over `passages` and `links`, and `ReadingRuleError` | Services live in `@syn/api` (AGENTS.md). The `_legacy/services/library/` files are a reference, never imported |
| Procedures | `packages/api/src/routers/morning.ts`: `morning.list` (query), plus the mutations `savePassage`, `saveLink`, `reorder`, `turnOff`, `turnOn` and `delete`, each through `ctx.rls.execute()` | It is Orient's router, and the same tables |
| Route | `apps/web/lib/routes.ts`: `morningReadingRoute()` → `/settings/morning-reading`; `apps/web/app/(shell)/settings/morning-reading/page.tsx` | As `connectionsRoute()` and its page |
| Settings row | `apps/web/components/account/settings-list.tsx`: a `SettingsRow` after Connections, with no second line (D-USE-132) | As built (USE-85) |
| Screen | `apps/web/components/account/morning-reading/` (the page, the sections, the two sheets) with `copy.ts` | Only this route imports it |
| Data | `apps/web/lib/data/` gains a `morningReading` domain, fixture and live (`live/morning-reading.ts`), and `lib/fixtures/scenarios/morning-reading.ts` with the 22 `morning-reading-<key>` scenarios | As the `orient` and `settings` domains |

`@syn/ui` gains nothing new: every part on the boards exists (`SortableList`, `ArchivedSection`, `SaveStatus`, `InlineAddRow`, `AlertDialog`, `DiscardDialog`, `RichTextEditor`, `ResponsiveSheet`). The link row's 13 px host (D-USE-131) belongs to the screen's row and is not a `LinkCallout` change.

## Data contract

- **No schema change.** `passages` and `links` already carry `title`, `body_md`/`url`, `kind`, `sort_order`, `archived_at`, `images`, `tags`, and owner-private CRUD policies, delete included (0007 `passages_delete`, 0009 `links_delete`). No ticket here is Q3.
- **List:** one read returns `{ passages, passagesOff, links, linksOff }`. Active rows are in `sort_order`, then `created_at`, then `id`, the same order as Orient's `activePassages`. Off rows are ordered by `archived_at` descending. This is one region, as D-USE-133 says.
- **Save passage:** `{ id?, title, bodyMd }` through `passageFormSchema`. The service ignores `images` and `tags` and keeps a row's stored ones (D-USE-121); its write never touches those columns. A new row gets `max(sort_order of active rows) + 1`.
- **Save link:** `{ id?, title, url }` through `linkFormSchema`. The service applies `normaliseLinkUrl` (a `spotify:` URI becomes `https://open.spotify.com/...`; a `spotify:` without a type and an id is refused as `unopenable`) and then `kind = deriveLinkKind(url)` (`@syn/utils`). Nothing is fetched.
- **Reorder:** `{ kind, ids }` is the section's full list of active ids. One that omits an active row, or names an off or foreign row, is refused as `incomplete_reorder`. Ids become `sort_order` 0 to n−1 in one transaction. Off rows keep their `sort_order`.
- **Turn off:** sets `archived_at = now()` and leaves `sort_order` alone. **Turn on:** clears `archived_at`. With `restore: true` (the toast's Undo) the row keeps its old `sort_order` and goes back where it was. Otherwise (the Off list) it gets `max + 1` and lands at the end (D-USE-123).
- **Delete:** `{ kind, id }` removes the row only when `archived_at IS NOT NULL`. On an active row, or on a foreign or missing id, it is refused as `not_off` (D-USE-125). A passage's bucket images are not touched (see Rabbit holes).
- **Words:** the validators' messages change to the approved words in `ux/account/morning-reading/words-and-access.md` (the link line; the limit lines). Their old `[COPY]` notes go. The service's refusals map to the same lines in the client's `refusals.ts`.
- **Schema comments:** "ARCHIVE, NEVER DELETE" in `packages/db/src/schema/library/passages.ts` and `links.ts` becomes "Archive is rest; delete only from archive (D-USE-125)". This is a comment only, with no migration.

## Offline

Read only (D-USE-129). The page reads from the persisted TanStack cache (C4). Every control that writes waits while `navigator.onLine` is false. These mutations set `networkMode: "always"`, so a write that loses the connection mid-flight fails and shows its line (`save-failed`) instead of pausing and replaying later. Nothing is queued: this departs from C4's paused-mutation replay for this screen only, by the ledger's ruling.

## One-way doors

- **The first hard delete of a person's own words in USE.** The row is gone: there is no tombstone and no restore, and the export no longer holds it. It is gated by off first, then the confirm dialog, and refused server-side on an active row. RLS already allows it as owner-only. Ratified as R1.
- No migration, no RLS change, no new dependency, no new env.

## Calls, as ratified

| # | Call | Ruling |
| --- | --- | --- |
| R1 | Delete is a hard delete of the row (D-USE-125's "for good"), with no soft-delete column | **Hard delete** (Taylor, 2026-10-20, the recommendation). A soft delete needs a migration (Q3) and a second meaning of "off". The confirm and the off-first rule already guard it |

## Test shape

| Risk | Test |
| --- | --- |
| Delete on an active row; an incomplete or foreign reorder; the `spotify:` rewrite and kind; Turn on at the end against Undo in place; a save that would drop images or tags | Unit tests on `reading-list.ts` against a fake `ReadingListStore` (as `morning.ts`'s store seam) |
| A procedure that skips `ctx.rls.execute()` | The router test pattern (`routers/outputs.test.ts`) and the existing static RLS check; no Postgres (test-shape.md) |
| Orient reading a different order from this screen | A data-layer test: after a reorder in the fixture domain, Orient's `readReading` returns the same order |
| Offline queueing a write | A data-layer test: an offline write is not called, and nothing is persisted as a paused mutation |
| The 22 states | Captures at `/dev/parts?state=morning-reading-<key>`, audited by Assay against the locked boards |

## Rabbit holes

- **Images on delete:** USE has no passage images and the sheet builds none (D-USE-121), so Delete removes the row and leaves any bucket objects for the later orphan reaper (the schema comment's "later concern"). Out of bounds here.
- **Tags:** kept as stored, never shown and never cleared.
- **The quote bank and journal prompts:** Open, not here.
- **Concurrent edits from two devices:** last write wins per row, and reorder refuses a stale list (`incomplete_reorder`), which the client shows as save-failed and refetches.
