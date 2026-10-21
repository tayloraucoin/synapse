---
id: USE-150
size: medium
objective: "The morning reading can be written: one list read (active and off) and the writes for passages and links (save, reorder, turn off, turn on, delete an off row), as tRPC procedures through ctx.rls.execute()"
slice_type: "server writes on the existing passages and links tables; risks a delete that reaches an active row, a reorder that drops a row, and a save that clears images or tags"
non_negotiables:
  - "Every procedure runs inside ctx.rls.execute() with the caller's id; never the singleton db."
  - "Delete removes a row only when archived_at is set; otherwise it refuses as not_off (D-USE-125, R1: a hard delete)."
  - "Reorder takes a section's full list of active ids; one that omits an active row or names an off or foreign row is refused as incomplete_reorder."
  - "Save passage never writes images or tags; a stored passage keeps both (D-USE-121)."
  - "A link's spotify: URI is stored as its open.spotify.com address and kind is derived with deriveLinkKind; nothing is fetched (D-USE-120)."
  - "No migration and no RLS change: the columns and owner-only delete policies exist (0007, 0009)."
  - "The _legacy library services are a reference only, never imported."
devs_call: "One kind-parametered procedure per verb (the default, as technical/morning-reading.md) or one per table; the store's exact shape."
cites:
  - "specs/web/epics/USE-daily-use/ux/account/morning-reading/writing-and-order.md"
  - "D-USE-120"
  - "D-USE-123"
  - "D-USE-124"
  - "D-USE-125"
truth_files: "none: no behaviour a person sees changes until USE-151; the ledger in the epic's ux/ already says what these writes do"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/validators/src/morning-reading.ts"
  - "packages/validators/src/passage.ts"
  - "packages/validators/src/link.ts"
  - "packages/validators/src/index.ts"
  - "packages/validators/src/morning-reading.test.ts"
  - "packages/api/src/services/morning/reading-list.ts"
  - "packages/api/src/services/morning/reading-list.test.ts"
  - "packages/api/src/routers/morning.ts"
  - "packages/db/src/schema/library/passages.ts"
  - "packages/db/src/schema/library/links.ts"
depends_on: []
out_of_scope:
  - "Any UI, route or data hook (USE-151 to USE-153)"
  - "Passage images and their bucket (D-USE-121, the dev note)"
  - "The quote bank and journal prompts (Open)"
criteria:
  - id: C1
    statement: "deleteOffRow removes an off passage or link; on an active, missing or foreign id it refuses with not_off and removes nothing"
    evidence: test
    command: "yarn workspace @syn/api test"
  - id: C2
    statement: "reorderReading writes sort_order 0..n-1 for a full active list and refuses a list that omits an active row or names an off one"
    evidence: test
    command: "yarn workspace @syn/api test"
  - id: C3
    statement: "turnOn with restore keeps the row's sort_order; without it the row gets max+1 of the active rows; turnOff sets archived_at and leaves sort_order"
    evidence: test
    command: "yarn workspace @syn/api test"
  - id: C4
    statement: "saveLink stores spotify:playlist:abc as https://open.spotify.com/playlist/abc with kind spotify, and refuses spotify:abc as unopenable"
    evidence: test
    command: "yarn workspace @syn/api test"
  - id: C5
    statement: "savePassage on a row with images and tags leaves both as stored; a new passage lands at the end of the active order"
    evidence: test
    command: "yarn workspace @syn/api test"
  - id: C6
    statement: "listReading returns passages, passagesOff, links and linksOff, active in Orient's order and off by archived_at, newest first"
    evidence: test
    command: "yarn workspace @syn/api test"
  - id: C7
    statement: "The validators carry the approved words: the link line \"That doesn’t open as a link. Paste the address from the browser or from Spotify’s Share.\" and the limit lines"
    evidence: test
    command: "yarn workspace @syn/validators test"
---

# Contract — USE-150 morning-reading-writes

## Build notes

Wave 1. Read `specs/web/epics/USE-daily-use/technical/morning-reading.md` first; it is the contract this ticket implements.

- **Ledger criteria built:** C-USE-morning-reading-3, C-USE-morning-reading-9, C-USE-morning-reading-17, C-USE-morning-reading-23, C-USE-morning-reading-25 (in `ux/account/morning-reading/states/` and `words-and-access.md`); this contract's criteria prove them.
- **Approach:** a `ReadingListStore` seam over `passages` and `links` inside the caller's RLS transaction (as `morningStore` in `services/morning/morning.ts`), and pure rule functions over it. The unit tests run on a fake store. The router adds `morning.list` and the mutations `savePassage`, `saveLink`, `reorder`, `turnOff`, `turnOn` and `delete`, each `ctx.rls.execute((tx) => fn(readingListStore(tx, userId), input))`.
- **Decisions that apply:** D-USE-120: "A passage is an optional title (80) and a Markdown body (required, 8,000)… A link is a title (required, 80) and a URL (2,048), either `https:` or a `spotify:` URI the server rewrites to `open.spotify.com`. Its kind is derived, and nothing is fetched." D-USE-123: "A new row lands at the end. A row turned on comes back at the end of its list." D-USE-124: "'Turn off' sets `archived_at`… the toast offers Undo", and Undo puts the row back where it was (`restore: true`). D-USE-125: "Delete exists only on an off row." R1: a hard delete.
- **Interfaces:** `@syn/validators`: `readingKind`, `reorderReadingInput {kind, ids}`, `readingRowInput {kind, id}`, `turnOnInput {kind, id, restore?}`, `readingListRecord`, plus `passageFormSchema` and `linkFormSchema` reused with new messages. `@syn/api`: `morning.list`, `morning.savePassage`, `morning.saveLink`, `morning.reorder`, `morning.turnOff`, `morning.turnOn`, `morning.delete`. `ReadingRuleError` codes: `not_off`, `incomplete_reorder`, `unopenable`, `not_found`.
- **Per path:** `morning-reading.ts` (validators): the new inputs and the list record. `passage.ts` and `link.ts`: the messages only, with the `[COPY]` notes removed. `index.ts`: the exports. `reading-list.ts` (api): the store, the rules, `normaliseLinkUrl` (ported from `_legacy/services/library/links.ts`, not imported). `routers/morning.ts`: the procedures. `passages.ts` and `links.ts` (db): the header comment "ARCHIVE, NEVER DELETE" becomes "Archive is rest; delete only from archive (D-USE-125)", comment only.
- **Gotchas:** `savePassage` must build its `set` from title and body only; spreading the parsed form writes `images: []` over stored images. The live client's refusals map by code in USE-151, so keep the codes stable. `sort_order` is a smallint.
- **Model:** Opus 5.5 at medium. Choosing down risks a store that skips the transaction or a delete without the `archived_at` guard.
