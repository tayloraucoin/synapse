---
id: USE-153
size: medium
objective: "A passage or a link can be added and edited on Settings › Morning reading, in the passage and link sheets, with discard, a link that cannot open, save failed and offline handled"
slice_type: "two form sheets over existing writes; risks lost words on a failed or offline save, a sheet that clears a passage's images, and a link refused with the wrong words"
non_negotiables:
  - "The passage sheet: Title (optional) and Passage in the house RichTextEditor as built; no Images row (D-USE-120, D-USE-121)."
  - "The link sheet: Title and Link with its hint; a link that cannot open shows the approved line in ink under the field and Save waits."
  - "After Save the sheet closes and the row is in the list, a new one at the end; no toast (D-USE-128)."
  - "A failed save keeps every word, shows one line in ink above Save, and Save is the retry."
  - "Offline the sheet keeps its words, the StatusLine sits above Save, and Save waits; nothing is queued (D-USE-129)."
  - "Leaving with unsaved words asks first (DiscardDialog: Keep editing, Discard)."
  - "Only @syn/ui parts and preset tokens; passage text in Newsreader; no red."
devs_call: "Whether the two sheets share one shell component; when the link line first shows (on Save, then on each change, by default)."
cites:
  - "specs/web/epics/USE-daily-use/ux/account/morning-reading/writing-and-order.md"
  - "D-USE-120"
  - "D-USE-121"
  - "D-USE-129"
truth_files: "none: the epic's own ux/ ledger is the truth; it promotes to specs/web/ux/ with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "add-passage, link-invalid and save-failed at 402 against their boards: the editor's height and toolbar, the ink lines, no red (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/account/morning-reading/passage-sheet.tsx"
  - "apps/web/components/account/morning-reading/link-sheet.tsx"
  - "apps/web/components/account/morning-reading/use-reading-sheet.ts"
  - "apps/web/components/account/morning-reading/reading-sheets.test.ts"
  - "apps/web/components/account/morning-reading/morning-reading-page.tsx"
depends_on:
  - USE-151
out_of_scope:
  - "Passage images (D-USE-121; the dev note); tags"
  - "Row order, off, on and delete (USE-152)"
criteria:
  - id: C1
    statement: "?state=morning-reading-add-passage, -edit-passage, -discard, -add-link, -edit-link and -link-invalid at 402 match their boards, with no Images row"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-153-morning-reading-sheets/evidence/"
  - id: C2
    statement: "?state=morning-reading-saved, -save-failed and -offline-sheet at 402 match their boards"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-153-morning-reading-sheets/evidence/"
  - id: C3
    statement: "A save that fails keeps the title and body as typed and shows the save-failed line; Save calls the write again"
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "Saving an edited passage sends only id, title and bodyMd, never images or tags"
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "\"morning calm playlist\" in Link shows \"That doesn’t open as a link. Paste the address from the browser or from Spotify’s Share.\" and calls no write"
    evidence: test
    command: "yarn workspace web test"
  - id: C6
    statement: "Escape with unsaved words opens the discard dialog; Discard writes nothing; with no change the sheet closes without asking"
    evidence: test
    command: "yarn workspace web test"
---

# Contract — USE-153 morning-reading-sheets

## Build notes

Wave 3, after USE-151, beside USE-152. Read `technical/morning-reading.md`. Captures: `ux/account/morning-reading/captures/` (`add-passage`, `edit-passage`, `discard`, `add-link`, `edit-link`, `link-invalid`, `saved`, `save-failed`, `offline-sheet`). `add-passage-images` and `edit-passage-images` are design only and not built. Paper "Synapse", page "USE — daily use", row "Row label · Morning reading".

- **Ledger criteria built:** C-USE-morning-reading-11, C-USE-morning-reading-12, C-USE-morning-reading-13, C-USE-morning-reading-14, C-USE-morning-reading-15, C-USE-morning-reading-16, C-USE-morning-reading-18, C-USE-morning-reading-19, C-USE-morning-reading-27, C-USE-morning-reading-28, C-USE-morning-reading-32 (in `ux/account/morning-reading/states/` and `words-and-access.md`); this contract's criteria prove them.
- **Approach:** two `ResponsiveSheet`s in the page's sheet slot (USE-151). The passage sheet holds an `Input` for Title and a `RichTextEditor` that fills the sheet. The link sheet holds two `Input`s. Both parse with `passageFormSchema` and `linkFormSchema` before calling `useMorningReading()`'s writes. A row tap, "Add a passage" or "Add a link" opens them, and so does ··· › Edit (pass the opener to USE-152's menu if it has landed; otherwise leave the prop for it).
- **Decisions that apply:** D-USE-120 (the fields and limits; the kind is derived and never chosen); D-USE-121 (no Images row; stored images and tags kept); D-USE-126 (the sheets over the list; `DiscardDialog`; the link line in ink, Save waits); D-USE-128 (no toast; save failed keeps the words); D-USE-129 (offline: the words stay, Save waits).
- **Interfaces:** `PassageSheet`, `LinkSheet`, `useReadingSheet()` (open and close, dirty state, save with its states).
- **Per path:** `passage-sheet.tsx` and `link-sheet.tsx`: the sheets. `use-reading-sheet.ts`: their state. `reading-sheets.test.ts`: C3 to C6. `morning-reading-page.tsx`: only the slot's wiring.
- **Gotchas:** an edit must not spread the list record into the save (images would ride along); send `{ id, title, bodyMd }`. The editor's empty body is "" after trim; Save waits until there are words. Focus returns to the row or add row that opened the sheet.
- **Model:** Opus 5.5 at medium. Choosing down risks lost words on a failed or offline save.
