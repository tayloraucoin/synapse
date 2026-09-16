# RUN-4 — Passages and the quote bank: `passage.*`, the `passage` upload kind, `quote.today`, and the orient read model with the carousel and the third line

**Epic:** RUN — The first run rebuilt (UX v1.2) · **Phase 1** · Size: M
**Slice type:** Services over two new tables and a bucket, plus one read model amended. The risk class is *a leak across the privacy line* (a passage image served to the wrong owner; a quote query that reads unpublished rows) and *the app speaking* (a quote surfaced in the app's voice, or chosen by anything about the person).
**Vigil:** the asset read route's owner check on the new bucket (a foreign path must 404, never 403 — SET-3's rule); `quote.today` on an unpublished row.

**Status:** Not started

> **Vigil — privacy on the new bucket and the catalogue.** Induce: a signed-in user A requesting `/api/assets/passages/{B}/{file}` → 404; A requesting their own → 200; an unpublished quote never appears in `quote.today` for any user; two users on the same date opted in receive the same quote (nothing keyed to the person). State the four probes.

---

## Outcome

A person's passages are a collection the app can read and write: `passage.list`, `save`, `archive`, `reorder`; a passage's images upload through the existing signed-URL path with a `passage` kind into the `passages` bucket and read back through the session-gated asset route exactly as an icon does; the quote bank has one read, `quote.today`, that returns the published quote for today's date by list order across the bank, or null; and the orient read model (`day.orient`) now returns the person's passages in order with today's index, the quote when opted in, the three ask-switches, and the morning mode — everything the frame needs to render a carousel and a third line. After this ships, **RUN-9 has the data for screen 6 and the frame.** No admin write exists (RUN-14); no screen changes here.

## Why / intent

- **v1.2 §3.12, R36** — passages: title, Markdown body, ≤ 4 images, tags, ordered; *"one passage per day: the frame opens on the next in list order after yesterday's, advancing at day-open, wrapping"*; `[DEFAULT §13 #21]` nothing about which was read is recorded; the quote *"chosen by date order over the bank, so two people on the same day see the same quote and nobody sees one 'for them'"*.
- **TD-13** — `quotes` is a catalogue; the read filters `published_at IS NOT NULL`; the write path is RUN-14's.
- **TD-15** — Markdown body; the `passages` bucket; the icon path grammar; the read route's 404-never-403.
- **v1.2 §5.2** — the frame's data: `passages`, `quote`, `askGratitude`, `askIntention`, `askVisualisation`, `morningMode`, and `lastNight` as before (the collapse is the frame's, not the read's).
- **v1.2 §11.4** — the table; `users.orient_passage` stops being read (the backfill moved it).
- **Ground truth (consumed):** `services/asset/{create-upload-url,storage}.ts`, `apps/web/app/api/assets/[bucket]/…` (the read route), `ASSET_BUCKET_BY_KIND`, `READABLE_ASSET_BUCKETS` (RUN-2 added `passages`), `services/day/orient.ts` (`readOrient`, `OrientView`), `routers/day.ts`, RUN-1's `passageFormSchema`, RUN-2's tables.
- **What this slice is NOT (binding):** the admin surface and any write to `quotes` (RUN-14); the `RichTextEditor` (RUN-7); screen 6 and the frame's rendering (RUN-9); *Set from the plan* (RUN-5 adds `andSetDay` to `saveMorning`; this ticket does not touch `saveMorning`).

**Rulings this slice makes (labelled, logged):**

- **The cycle index is pure arithmetic, not state**: `todayIndex = daysSince(epoch, today) mod n` over the ordered active passages (plus one slot for the quote when opted in, placed last), where `epoch` is a fixed date constant. Nothing is written when the frame is read (§13 #21). A person who adds a passage sees the cycle shift; that is fine and cheaper than a cursor. Logged.
- **`quote.today` picks by `daysSince(epoch, today) mod count` over published quotes ordered by `published_at, id`**; the same date gives every person the same quote. Logged.
- **`passage.reorder` takes the full ordered id list** and rewrites `sort_order` in one transaction; a list that omits an active id is refused. Logged.
- **Archiving a passage does not delete its images** (the export may still reference them; orphan reaping is a later concern, as for icons). Logged.
- **Markdown is stored as sent**; the service trims and enforces `PASSAGE_BODY_MAX`; it does not sanitise — the reader renders through the same editor's read-only mode (RUN-7), never `dangerouslySetInnerHTML`. Logged.

## Behaviour & states

**No surface.** The procedures:

- `passage.list` → `PassageView[]` (id, title, bodyMd, images as bucket-qualified paths, tags, sortOrder), active only, by `sort_order`; `passage.save({ id?, title, bodyMd, images, tags })` upserts (a new row lands at the end); `passage.archive({ id })`; `passage.reorder({ ids })`.
- `asset.createUploadUrl({ kind: "passage", contentType })` → a signed URL in the `passages` bucket at `{user_id}/{uuid}.{ext}`; the read route serves `passages/{user_id}/{file}` with the owner check.
- `quote.today` → `QuoteView | null` (`text`, `attribution`, `source`); null when opted out or the bank is empty.
- `day.orient` → `OrientView` += `passages: PassageView[]`, `todayIndex: number | null`, `quote: QuoteView | null` (already resolved for opt-in), `askIntention`, `askVisualisation`, `morningMode`; `passage: string | null` **removed** (the old single field).

**States (exhaustive):** per procedure — success · refused · not found (own row archived → `NOT_FOUND`; foreign row → `NOT_FOUND`, never a hint). **Failure / edge states:** zero passages and opted out → `passages: []`, `quote: null`, `todayIndex: null` (the frame shows the placeholder) · zero passages and opted in with an empty bank → the same · a `bodyMd` of 8001 characters → refused with the limit's sentence `[COPY]` · five images → refused · an image path not under the caller's owner segment → refused (the service re-checks the path's second segment against the session).

## Non-negotiables (this slice)

- **Nothing about the person decides the quote.** Date and order only.
- **Nothing is written when the frame is read.**
- **A foreign asset path answers 404, never 403.**
- **`quotes` is never written from the app** in this slice.
- **Markdown is stored, never HTML.**
- **Every user-scoped query through `ctx.rls.execute()`;** `quote.today` reads through the catalogue policy under the same bridge.

## Data & AI

**Schema changes: none.**

**Tables:** `passages` (read, write) · `quotes` (read) · `users` (read — the switches) · `journal_entries` (read, as today) · `days` (read, as today).

**Placement:** `packages/api/src/services/library/passages.ts` (new), `services/system/quotes.ts` (new; read only), `services/day/orient.ts` (amended), `services/asset/create-upload-url.ts` (+ the kind); `routers/passage.ts` (new), `routers/quote.ts` (new), `routers/day.ts`, `routers/asset.ts`, `root.ts`; `packages/validators/src/passage.ts` (RUN-1), `asset.ts`; `packages/utils/src/day/cycle.ts` (new — `cycleIndex(count, today, epoch)`, pure). Rule 3, rule 6 (the pure index in utils).

**tRPC / validators:** `passage.list` · `passage.save` · `passage.archive` · `passage.reorder` · `quote.today` · `asset.createUploadUrl` (kind widened) · `day.orient` (view widened).

**AI notes:** **None.** Tags are stored; nothing reads them but the list (ledger §25's later layer is phase 2).

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — local tier; probes through the server caller; the read route through `curl` with a session cookie)

1. `passage.save` with a title, a body, two image paths under the caller's segment, and three tags creates a row at `sort_order = <count>`; `passage.list` returns it last; `save` with the id updates in place.
2. `passage.save` with `images` of five paths, or a path whose second segment is another user's id, is refused; a body of 8001 characters is refused.
3. `passage.reorder({ ids: [c, a, b] })` rewrites `sort_order` to 0,1,2 in that order; a list missing an active id is refused; `passage.archive` removes a row from `list` and leaves its images in the bucket.
4. `asset.createUploadUrl({ kind: "passage", contentType: "image/webp" })` returns a URL for the `passages` bucket at `{user_id}/{uuid}.webp`; after upload, `GET /api/assets/passages/{user_id}/{uuid}.webp` returns 200 for the owner and **404** for another signed-in user. *(Vigil.)*
5. With two published quotes and one unpublished: `quote.today` for two different users on the same date returns the same published quote; the unpublished one never appears across 30 consecutive dates (probe by injecting the date); opted-out users receive null. *(Vigil.)*
6. `day.orient` returns `passages` in order, `todayIndex` in `0…n−1` (or `n` for the quote slot when opted in), `quote` only when opted in, the three ask flags and `morningMode`; the old `passage` field is gone; with no passages and opted out, `passages: []`, `todayIndex: null`, `quote: null`.
7. `cycleIndex(3, "2026-09-16", EPOCH)` and `cycleIndex(3, "2026-09-17", EPOCH)` differ by one modulo 3 (probe pasted); `cycleIndex(0, …)` returns null.
8. `grep -rn "dangerouslySetInnerHTML" packages/api apps/web` returns nothing new.
9. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `readOrient` already joins `users` and last night's journal; add `passages` and `quotes` as two more reads in the same function, not a second procedure the frame calls.
- The read route's allow-list is `READABLE_ASSET_BUCKETS` (RUN-2 added `passages`); confirm the route iterates that constant rather than a literal.
- `EPOCH` as a constant in `@syn/constants` (`CYCLE_EPOCH = "2026-01-01"`), so the two cycles (passages, quotes) agree.

## Dev's call

Whether `quote.today` is its own router or a `day.orient` field only (both are fine; the router exists for RUN-14's list to sit beside) · error names.

## Out of scope

- **The admin surface and any quote write** — RUN-14.
- **`RichTextEditor`, `PassageCarousel`, `TagInput`** — RUN-7.
- **Screen 6, the frame, Settings → Before the day** — RUN-9.
- **`saveMorning`'s `andSetDay`** — RUN-5.

## Depends on

- **RUN-2** — `passages`, `quotes`, the bucket, the columns. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** A privacy boundary (the bucket, the owner segment) and a fairness rule (date and order only) with two induced probes; a cheaper model serves a foreign image with a 403 that leaks existence, or "helpfully" picks a quote by tag.

---

### Kickoff (paste into the session)

> Build **RUN-4 — Passages and the quote bank** (attached spec). Model: **Opus**. **Nothing about the person decides the quote; nothing is written when the frame is read; a foreign asset path is a 404; Markdown in, Markdown out.**
> Attach/read first, in order: this spec · v1.2 §3.12, §5.2, §11.4, §11.6 · `docs/ai-guides/trpc-foundation-patterns.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · SET-3 (the asset route and upload path — reuse, don't fork) · DYN-13 (`orient.ts`) · RUN-1 (`passageFormSchema`) · RUN-2 (the tables, the bucket) · `packages/db/SCHEMA_REFERENCE.md` (passages, quotes, users) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-13, TD-15).
> Induce the four Vigil probes and paste them. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
