# Full-build review — Mason, Forge, Vigil · 2026-09-06

**Scope:** all 39 tickets across the five tracks — infrastructure (INF-1…9),
Epic 1 Setup (SET-1…10), Epic 2 In Use (USE-1…8), Epic 3 Review (REV-1…4), and
cross-cutting system (SYS-1…6). Every spec `Status:` reads Complete; every
`00-build-order.md` checklist is fully ticked; `yarn lint`,
`yarn lint:boundaries`, `yarn check-types` and `yarn build` all pass.

**Reviewers:** Mason (architecture, boundaries, one-way doors) · Forge (code
quality, types, entropy) · Vigil (spec conformance, product promises,
verification honesty).

---

## Verdict

**Pass with conditions.**

The architecture holds. Boundaries are enforced and clean, every user-scoped
query goes through `ctx.rls.execute()`, the privileged bypasses are named and
countable, the pinned dependencies are untouched, no migration was written or
applied, and `apps/mobile/` is still a README. The product's stated promises —
no streaks or scores, no numbers about the day on the execution tabs, nothing
red there, no second person, a trim that is never a miss, a record annotated
rather than rewritten — are each enforced by a code path rather than by copy,
and several are enforced by a pure function that was probed directly.

The condition is singular and large: **almost nothing has been run against a
database or a browser.** No Supabase project is wired to this repository, so
across all 39 tickets the screens, the writes, the RLS policies in practice, and
every Vigil and Vesper review are unexercised. What has been proven is the pure
logic, the rendered SQL, and the greps — and those were proven by running them,
not by reading them. The distinction is recorded ticket by ticket in each
track's `DEVIATIONS.md`.

Three defects were found during this review and **fixed** (all red or orange);
they are listed below with their fixes. The remaining flags are conditions on
launch, not blockers on the code.

---

## Flag key

| Flag | Meaning |
|---|---|
| 🔴 **Red** | Blocking. A correctness, privacy, or trust defect, or a promise the code cannot keep. Must be resolved before launch. |
| 🟠 **Orange** | Should-fix. A real gap that degrades the experience or leaves an edge unhandled, but does not break a promise. |
| 🟡 **Yellow** | Consider. Taste, drift, or a decision worth confirming. Some will rightly be declined. |

---

## 🔴 Red

### R1 — Nothing is verified against a database, a browser, or a device
**Owner:** Taylor · **Found by:** Vigil

No Supabase project is wired to this repository, and no deployable tier exists.
The consequence, stated plainly: **every screen in the product is unrendered,
every mutation is unexecuted, and every RLS policy is untested in practice.**
Across the five tracks this leaves outstanding:

- **Vigil reviews owed on five tickets** — SET-3 (storage probes), SET-10 (the
  five destructive paths), USE-6 (the six shift paths), USE-8 (payload privacy),
  SYS-3 (the three induced paths).
- **Vesper reviews owed on six** — SYS-1 (chrome), USE-2, USE-5 (block
  density), REV-4 (the dashboard test), SYS-4 (the focus ring), SET-5.
- **Mason review owed on one** — SYS-2 AC 6–7 (the re-lay arithmetic against
  real rows).
- **Taylor-owned setup** — the staging migration, the observability dashboards,
  VAPID keys, and device notification tests.

This is not a code defect and no amount of further code work reduces it. It is
the single largest risk in the build, and it is a **launch blocker by
definition**: a product whose privacy guarantee has never been executed has a
privacy guarantee nobody has seen work.

**What partially mitigates it.** Every ticket's `DEVIATIONS.md` closes with an
explicit "what WAS proven / what is unproven" line, so the untested surface is
enumerated rather than assumed. The highest-risk arithmetic — adherence, the
zone re-lay, the shift fit, the capacity trim, the export's completeness, the
category shares — was extracted into pure functions in `@syn/utils` and probed
directly, which is why several of the defects below were caught at all.

**Recommendation:** wire a Supabase project and walk the runtime checklist in
each track's `DEVIATIONS.md` before any launch decision. Prioritise, in order:
SET-10's delete cascade and export contents, INF-5's RLS policies from a second
account, SET-2's auth gate, USE-1's DST boundaries, and USE-6's undo refusals.

---

### R2 — `shift.commit` accepted a stale plan silently — **FIXED**
**Owner:** Mason · **Found by:** Mason · **Status:** fixed in this review

USE-6's ruling requires that `apply` "recomputes with the same service and
refuses (`CONFLICT`) if the day changed since the preview". The recompute was
implemented; the refusal was **dead code**. `applyShift` guarded on
`input.fingerprint !== undefined`, but `shiftApplyInput` had no `fingerprint`
field, so the sheet could never send one and the branch never ran. The sheet's
own `isConflict` re-preview handler was unreachable for the same reason.

**Why it mattered.** The write was always *safe* — the server recomputes the fit
from live rows, so it could never move a done item or cut something that now
fits. But it was **silent**: a person could finish an item while the sheet was
open, press *Shift and cut 2*, and get a different outcome than the screen had
shown them, with no indication anything had changed.

**Fix:** `fingerprint` added to `shiftApplyInput`; `ShiftSheet` now sends
`preview.data.fingerprint`. The `CONFLICT` path and the re-preview are live.

---

### R3 — SYS-4's `n` navigated and then did nothing — **FIXED**
**Owner:** Mason · **Found by:** Vigil · **Status:** fixed in this review

SYS-4 AC 2 requires `n` to open the one-off sheet. The keyboard host pushed
`?sheet=one-off`, but `day-list.tsx` only handled `?sheet=shift` (USE-6's late
offer had introduced the mechanism for one value). Pressing `n` therefore
navigated, stripped the parameter, and opened nothing — a dead key on a
published shortcut list, which is worse than an unlisted one.

**Fix:** the day list's handler now accepts both `shift` and `one-off`, and the
variable is named for the mechanism rather than for USE-6's single use of it.

---

## 🟠 Orange

### O1 — Two components were both exported as `ShiftSheet` — **FIXED**
**Owner:** Forge · **Status:** fixed in this review

`components/shift-sheet/` exported a `ShiftSheet` that **creates** a shift
(SF-01), and `components/schedule-canvas/` exported a `ShiftSheet` that
**reads** one (SC-02). Both were re-exported from their folder barrels, so an
auto-import was a coin flip, and the two files already reference each other
(SC-02 imports `SHIFT_COPY` from SF-01's folder).

**Fix:** SC-02's is now `ShiftRecordSheet`, with a header saying why. SF-01
keeps `ShiftSheet`.

### O2 — `StripState` and `StripSquare` were the same union declared twice — **FIXED**
**Owner:** Forge · **Status:** fixed in this review

`@syn/types` declared `StripState` and `@syn/utils` declared `StripSquare` —
the same seven members, independently. Two places to add an eighth and one place
to forget. Separately, `HabitStrip.days` was a seven-member tuple while both
read models returned `StripSquare[]`, which forced an `as unknown as` cast at
every call site — the type system being talked out of a length invariant the
models actually guarantee.

**Fix:** `StripWeek` now lives in `@syn/types` beside `StripState`;
`StripSquare` is an alias, not a copy; `emptyStripWeek`/`toStripWeek` in
`@syn/utils` narrow at the one boundary where the array is built; both casts in
`components/review-week/` are gone.

### O3 — `storage.ts` claimed to be the only service-role reach; it no longer is — **FIXED**
**Owner:** Mason · **Status:** fixed in this review

SET-3 wrote `services/asset/storage.ts` as "THE ONE PLACE `@syn/api` REACHES FOR
THE SERVICE ROLE … the only other admin call in the product is the read route".
SET-10 and SYS-5 added three more (`request-export.ts`, `delete-account.ts`,
`expire-exports.ts`) without amending it. On a file that documents the privilege
boundary, a stale claim is worse than no claim — a future reader greps this
paragraph instead of the code.

**Fix:** the header now names all four files and points at
`grep -rn "createAdminClient()" packages/api/src apps/web` as the authority
rather than the prose.

### O4 — Three procedures are never called from the app
**Owner:** Mason · **Found by:** Forge

`notification.hasSubscription`, `reason.keep`, and `week.updateOneOff` exist on
the routers and are referenced nowhere in `apps/web`. Each is either a wiring
gap in its own ticket (ST-07, ST-06a, WK-03) or dead API surface that should be
removed. Unused surface is not harmful, but it is untested surface that reads as
supported.

**Recommendation:** confirm each against its ticket. `week.updateOneOff` looks
genuinely redundant — the one-off sheet edits through `week.addOneOff` with an
`itemId` — and if so should be deleted rather than left as a second write path.

### O5 — The capacity trim can overshoot substantially
**Owner:** Vigil · **Logged in** `epic-2-in-use/DEVIATIONS.md`

Official spec §5.8 and §6.6 specify "trim from the lowest until planned −
trimmed ≤ capacity". Measured: a 295-minute plan trimmed to 200 reaches 210
after three items, then takes a 120-minute deep-work block to clear the last
10 — landing at 90, having given up 110 minutes more than asked.

This is the specified behaviour and the document supplies the escape (*Keep
instead* on that block yields §6.8's *Nothing else is flexible. 10 min over.*,
which was verified). But the first experience of the sheet is that asking for
200 minutes silently deletes the afternoon.

**Recommendation:** a Vesper conversation, not a code change. The narrowest fix
would be a hint on the row that would clear the deficit; changing the sort would
make the order unpredictable and is not recommended.

---

## 🟡 Yellow

### Y1 — `CONTACT_EMAIL` is empty, so SY-01's error sentence is truncated
`packages/constants/src/contact.ts` holds `""`, marked `[NEEDS VALUE AT BUILD]`.
About's failure line correctly degrades to *Couldn't send. Try again.* rather
than rendering *or email .* — a deliberate dev's call, logged. But feedback is
the product's only support channel, and with no address a failed send is a dead
end. **Recommendation:** set it before launch.

### Y2 — 33 open copy and content markers remain
`[COPY — needs Vesper sign-off]` ×~28, `[PENDING — Taylor: legal copy]` ×3,
`[NEEDS VALUE]` ×1, `[OPEN:]` ×1. The legal pages ship a placeholder sentence
and the trust line, deliberately, so the About and landing links are not dead —
but **the product currently has no privacy policy or terms**, which is a launch
gate in most jurisdictions regardless of the code.

### Y3 — 16 `[REVISIT]` markers are outstanding
Each is a decision taken with a stated trigger for reversal. The three worth
watching first: SYS-2's immutable `original_scheduled_start` on a re-laid future
item; USE-6's overflow rule counting a pre-existing overlap as a new cut; and
REV-4's category legend using the category's name at read time (a deleted
category's minutes fall into *No category*).

### Y4 — Four hex colours live outside the token preset
`app/layout.tsx` (two `theme-color` metas) and `app/manifest.ts` (background and
theme). The browser reads these before CSS, so a variable genuinely cannot be
used — but they duplicate `--paper` and will drift silently if the brand
changes. **Recommendation:** a comment in `preset.css` naming the two files that
must be updated with it.

### Y5 — `n` on the Schedule navigates to the List
SYS-4's `n` computes its base from the pathname, so on `/today/schedule` it
pushes `/today?sheet=one-off` — leaving the Schedule to add a one-off. Defensible
(the one-off sheet is the List's) and within the ticket's wording, but it is a
tab change the person did not ask for. **Recommendation:** confirm with Vesper.

### Y6 — `?sheet=` and `?item=` are assembled as string literals
`withNotice()` exists as a query-builder precedent, but the sheet and item
parameters are concatenated inline at four call sites. The app's rule is that a
hardcoded *path* is a defect; query parameters have no equivalent builder yet.
**Recommendation:** a `withSheet(route, name)` builder if a fifth call site
appears.

### Y7 — Deep-work `sessions` counts items, not timer sessions
REV-4's WR-01 reports "4 sessions" from the number of deep-work items done, not
from `timer_sessions` rows. A block started and paused twice reads as one
sitting, which is arguably the more useful number, but it is not what the word
usually means. Logged with a `[REVISIT]`.

---

## What was verified, and how

Everything below was **executed**, not read.

| Area | Check | Result |
|---|---|---|
| Boundaries | `yarn lint:boundaries` | clean; no upward or cross-app imports, no suppressions anywhere |
| Privileged access | every raw `db` importer | 4 files, all documented system paths with no session (`context.ts`, `auto-close-days`, `notify`, `expire-exports`) |
| Privileged access | every `createAdminClient()` | 4 files + 1 route, all named |
| Pinned deps | `drizzle-orm`, `drizzle-kit`, `typescript` | unchanged at 0.45.2 / 0.31.10 / 5.9.2 |
| Migrations | git log on `packages/db/migrations` | untouched this session; no migration written or applied |
| Mobile seam | `ls apps/mobile` | README only |
| Escape hatches | `any`, `@ts-ignore`, `as unknown as` in new code | none (the two remaining `as unknown as` in app code predate this work) |
| Product voice | *streak* / *score* in `apps/web` | only in comments explaining the prohibition |
| Product voice | *you* / *your* in the execution tabs' copy | none |
| Destructive token | `variant="destructive"` in `apps/web` | none — the composite applies it (SET-10 AC 11) |
| Device zone | `resolvedOptions().timeZone` | exactly one file (SYS-2 AC 8) |
| Feedback leak | query string in `send-feedback.ts`; validator | none; rejects `?`, `#`, and a relative path (SYS-3 AC 8) |
| Key hints | `<Kbd` in `apps/web` | one file, About's table (SYS-4 AC 7) |
| Dashboard language | *trend* / *last week* / *streak* in `review-week` | none (REV-4 AC 10) |
| Service worker | `caches.` in `sw.js` | none (SYS-5 AC 6) |
| Shortcuts | published list vs. bound keys | exact match; only `Esc` is listed-and-unbound, by ruling |
| Shift fit | 6 cases | hard/done/running/unassigned never move; anchors and the day's close both overflow; a touching end does not; an already-passed hard item is never cut |
| Capacity trim | 6 cases | order is §6.6; hard and spent minutes count but never trim; a second trim brings back highest-priority-first |
| Zone re-lay | 6 cases | 07:00 Vancouver → 07:00 London; a past-midnight item keeps its date; idempotent; round-trips; a DST gap resolves forward |
| Day-key boundary | promotion at 04:30 | **caught a real backwards jump** (see below) |
| Export | archive extracted with system `unzip` | exactly six files; 33 real columns on `items.csv`; CSV round-trips an embedded comma, quote and newline; 17/17 user tables present; push credentials absent |
| Delete gate | 8 inputs | accepts `delete`/`DELETE`/`  Delete  `; rejects `delet`, `nope`, empty, `delete account`, missing |
| Category shares | 8 distributions | every one sums to exactly 100 where plain rounding gives 99 |
| Four-week window | two week keys | 28 distinct days, correct across a year boundary |
| Shift SQL | `toSQL()` | valid, fully parameterised (`make_interval(mins => $n)`, `<> ALL(ARRAY[$n::uuid, …])`) |

### The defect this build's method actually caught

SYS-2's AC 7 asked for a behaviour at a day boundary. Probing it showed the
**existing** promotion logic moved the day key *backwards*: raising the day-close
time from 03:00 to 05:00 meant someone opening the app at 04:30 saw 2026-09-09
become 2026-09-08 — the day they had been living since 03:00 vanished, taking
anything ticked on it onto a day that was no longer today. It was found by
running `resolveDayKey` across the boundary, not by reading it, and it would
have survived any amount of code review. Fixed by clamping the key so a
promotion can only move it forward; a westward flight legitimately advancing the
day still works.

---

## What each reviewer signs

**Mason.** The architecture is sound and the rails held under 39 tickets of
throughput. Placement follows the consumer rule; the four package-boundary
pressures that arose (`isLateOffer` into `@syn/utils` rather than importing
`@syn/api` into a client bundle; `StripWeek` into `@syn/types` rather than
duplicating a union; the export's schema-derived columns; the shift fit as a
pure function) each resolved downward into the correct layer rather than being
worked around. Two one-way doors were approached and neither was opened: no
migration was written, and no pinned dependency moved. One new dependency —
`fflate`, for SET-10's archive — is logged with its alternatives in
`epic-1-setup/TECHNICAL-DECISIONS.md`. **The condition on my sign-off is R1.**

**Forge.** Code quality is good and the entropy is lower at the end than the
middle: three convergences landed during this review (the duplicated union, the
duplicated component name, the tuple casts), and the recurring pattern across
the build was extraction rather than duplication — `applyDecision` shared by
live and batch review writes, `computeShiftFit` shared by preview and commit,
`computeTrim` shared by sheet and service, `isLateOffer` shared by query and
minute-tick. Types carry their contracts; there are no escape hatches in new
code. **There is no test suite, by project rule** — tests are a separate
finalisation pass after human QA — so the proof mechanism throughout was the
type-checker plus targeted probes, which is honest but is not a regression net.
The pure functions in `@syn/utils` are where a suite should start.

**Vigil.** Spec conformance is high and the product's promises are enforced
structurally rather than editorially — the trim that cannot become a miss, the
export that reads its own schema, the delete that is real, the feedback path
that cannot carry an item id, the review that shows no number before its
decisions. Every ticket's deviation log separates what was proven from what was
not, which is the discipline that makes R1 legible instead of hidden. **I cannot
sign off on behaviour.** Not one screen has been rendered, not one mutation
executed, not one policy exercised from a second account. The runtime checklists
exist, ticket by ticket; they have not been walked.

---

## Recommended order of work

1. **Wire a Supabase project** (R1). Everything else waits on it.
2. Walk SET-10's five destructive paths and INF-5's RLS from a second account —
   the two places where being wrong is unrecoverable.
3. Set `CONTACT_EMAIL` (Y1) and obtain legal copy (Y2).
4. Resolve the three unused procedures (O4).
5. Vesper's six review points, and the trim-overshoot conversation (O5).
6. Then, and only then, a test pass over the pure functions in `@syn/utils`.
