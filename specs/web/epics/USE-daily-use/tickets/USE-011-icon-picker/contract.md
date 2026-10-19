---
id: "USE-11"
size: medium
objective: "One icon picker, a step inside whichever sheet opens it: Emoji and Icon tabs of one height, suggestions matched on the phone from the name, every emoji and every Lucide icon in groups with a pinned group bar, the colour row with Saved colours, a Linear-style custom colour with N2's bad-hex words, and editing a saved colour, running on fixtures"
slice_type: "a heavy interactive control; risks a network call per search, the whole emoji and Lucide sets loaded with the sheet, an icon stored as anything but a Lucide name plus hex, a bad hex that changes the colour, and the tabs jumping in height"
non_negotiables:
  - "Search and Suggested run on the device: no request while typing or matching, and no model call (record 0001)."
  - "The emoji data and the Lucide set load lazily, when the picker opens, from our own origin and the bundle; no third-party request."
  - "An icon is stored as { kind: lucide, value: name, hex }, an emoji as its character, through iconValueSchema; a saved colour through savedColourInput."
  - "A bad hex keeps the old colour and shows exactly \"Not a colour. Try 6 characters, like 2F6F62. The colour stays as it was.\""
  - "It is a step inside its sheet with back on the left, never a second sheet; the two tabs keep one height."
  - "Only @syn/ui components and preset tokens; colour never alone (each swatch is named)."
  - "Saved colours come through a lib/data hook on fixtures; the picker never imports lib/fixtures."
devs_call: "Virtualisation approach (no new dependency); the saturation area and hue slider's drawing; how Recent is kept (per device, localStorage through the existing hooks); split between @syn/ui pieces and the web wrapper."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/icon-picker/index.md"
  - "C-USE-icon-picker-1"
  - "C-USE-icon-picker-2"
  - "C-USE-icon-picker-3"
  - "D-USE-35"
  - "D-USE-36"
truth_files: "none: the sheets that open it are wave 2 tickets; promotion carries interactions/icon-picker/"
qa: Q1
reviewers:
  - assay
focus:
  - "all six states at 402 against interactions/icon-picker/captures/, and the tabs' equal height (assay)"
operator_review: false
planned_paths:
  - "packages/ui/src/composed/control/icon-picker/"
  - "packages/ui/src/composed/control/colour-popover/"
  - "packages/ui/src/index.ts"
  - "packages/ui/package.json"
  - "packages/utils/src/planner/icon-suggest.ts"
  - "packages/utils/src/planner/icon-suggest.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "packages/utils/src/index.ts"
  - "scripts/build-lucide-meta.mjs"
  - "apps/web/docs/design/components.md"
  - "apps/web/components/planner/icon-picker-step.tsx"
  - "apps/web/lib/data/use-saved-colours.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-011-icon-picker/evidence/"
depends_on:
  - "USE-7"
out_of_scope:
  - "Mounting it in the Item sheet, To-do sheet, New block sheet, add sheet and meal topics: each sheet's ticket"
  - "Saved colours' real writes and the cascade to stored icons: the wiring (wave 3)"
  - "Uploaded images as icons, and client logos (D-USE-42): their own ticket"
criteria:
  - id: C1
    statement: "Opened for \"Meditate\", the Emoji tab shows the back link, the two tabs, search, \"Suggested for Meditate\", Recent, Everyday and every Unicode group with the pinned group bar; opened with no name, the Suggested row is one muted line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-011-icon-picker/evidence/emoji-402.png"
  - id: C2
    statement: "The Icon tab shows the colour row (eight kind colours, a rule, the custom swatch), Saved newest first with Edit, search, Suggested, Everyday and every Lucide group, each icon drawn in the picked colour, at the Emoji tab's height"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-011-icon-picker/evidence/icon-tab-402.png"
  - id: C3
    statement: "The custom swatch opens the popover with hex, saturation area and hue slider; a bad hex shows N2's words and leaves the colour as it was; Edit then a saved swatch opens Edit saved colour with Remove from Saved"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-011-icon-picker/evidence/colours-402.png"
  - id: C4
    statement: "suggestIcons matches a name's words against each entry's keywords, best first, at most five, and returns none for an empty name"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "Picking an icon returns { kind: lucide, value, hex } that iconValueSchema accepts, and an emoji its character; a saved colour added, edited or removed through useSavedColours lands in the fixture server, a new one first"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "With the picker open, typing a search and opening the Icon tab make no network request after the data has loaded once, and none to a third-party origin at all"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-011-icon-picker/evidence/network.txt"
  - id: C7
    statement: "The web app, @syn/ui and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
---

# Contract — icon-picker

## Build notes

Wave 2, after USE-7; parallel to USE-10. Captures are taken at `/dev/parts?state=icon-picker-<state>` (USE-7's host), one per drawn state: `emoji-suggested`, `no-name-yet`, `icon-tab`, `custom-colour`, `bad-hex`, `saved-colours`.

- **Decisions that apply:**
  - D-USE-35: every emoji and every Lucide icon, both tabs searchable and grouped with a shortlist on top. The custom colour is a Linear-style picker: swatches, then a custom swatch opening hex, a saturation area and a hue slider.
  - D-USE-36: custom colours are saved for reuse. D-USE-37 and D-USE-60 (2) approve them with Saved colours.
  - The dev note: both tabs run search, then Suggested from the name, then Recent, then Everyday, then every group, with a pinned group bar at the foot. Emoji use the Unicode groups, with skin tones on long press. Icons use Lucide's own categories, drawn in the picked colour. The colour row sits above the icons. Load lazily and render the grid virtualised. Pin the Lucide version. Very light custom colours are darkened a little for contrast on paper.
  - The states' words: "Colour"; "Saved · #<hex>" or "Custom · #<hex>"; "Saved"; "Edit"; "Search icons"; "Suggested for <name>"; "Matched from the name, on this phone"; "Everyday"; "Hex #"; "Tap a colour to change it; × removes it"; "Done"; "Edit saved colour"; "Changes this saved colour and every item that uses it, with Undo in the toast."; "Remove from Saved"; "Items already in it keep their colour. Undo in the toast."
  - One tap picks, saves to what opened it, and returns [ASSUMPTION, as the index says].
- **Reuse:** `EmojiPicker` (frimousse over the self-hosted Emojibase data, `yarn emoji-data`), `CuratedIconGrid`'s cell, `ColorSwatchRow`, `SearchField` and `SegmentedControl` or `Tabs`. Lucide icons come from `lucide-react/dynamic`. No new dependency.
- **Lucide's groups and keywords** do not ship in `lucide-react`. `scripts/build-lucide-meta.mjs` writes a committed `lucide-meta.json` (name, category, tags) once, from Lucide's metadata at the exact version the lockfile pins. Rerun it when that pin moves. This was Taylor's call at the Tickets gate.
- **Interfaces:**
  - `suggestIcons(name: string, entries: readonly { id: string; keywords: readonly string[] }[], limit = 5): string[]` in `@syn/utils`.
  - `IconPicker` in `@syn/ui` takes data and callbacks only.
  - `IconPickerStep { name; value: IconValue | null; backLabel; onPick; onBack }` in `components/planner/` wires the suggestions and `useSavedColours()`.
  - `useSavedColours()` returns `{ query, add, update, remove }` over the fixture server's `listSavedColours`, `writeSavedColour` and `removeSavedColour`. The default scenario gains four saved colours, newest first.
- **Gotchas:**
  - `#2F6F62` is shown uppercase but stored lowercase (`savedHexSchema`).
  - The bad-hex words replace the field's helper; they are not a toast.
  - C6 is a network log taken from the browser pane while searching (`read_network_requests`), saved as text.
- **Model:** Opus 5.5 at medium. A smaller model loads every set eagerly, searches over the network, or stores the icon's SVG.
