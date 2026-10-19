# The Paper map, and how the handoff threads write the ledger

Written by the UX handoff pass, thread 1 (2026-10-12), for threads 2 to 8. Not a spec file: `check-specs` reads nothing here.

- `p-3-0.tsv`, `p-4-0.tsv`, `p-6-0.tsv`: every root artboard on "USE — daily use" (370), "USE — set up" (259) and "USE — work" (96), mapped read-only on 2026-10-12, with name (exact), x, y, w, h (blank where Paper reports fit-content), node ID and the row label above it. The counts match Paper's root-child counts.
- `p-*-notes.md`: every note, notes strip, dev note and row label on each page, verbatim, headed `## <name> @ x <x>, y <y>`. Many notes on "USE — set up" are named "Frame"; tell them apart by x and y.
- Paper's export writes to `~/Downloads` only; copy each capture into the surface's `captures/` (the sandbox blocks deleting from Downloads, so the originals stay there).
- The step 0 board's name has "board" for a width, so it is `superseded` in `ux/boards/use-daily-use/step-0.md`, cited and not carried (D-USE-59 thread). Watch for other names that fail `<surface> / <state> / <width> / <scheme>`.

The brief each writer followed, as thread 1 used it (paths in it assume `E` = `specs/web/epics/USE-daily-use`; the map now lives here, not in `ux/boards/_map/`):

## Shared brief: the USE ledger of the boards (UX handoff pass, thread 1)

You write part of the USE epic's UX spec as a **ledger of the boards**. Repo: /Users/taylor/lighthouse/synapse. Epic: `specs/web/epics/USE-daily-use/` (call it `E`). Branch feature/paper-ux; do not commit. No code, no canvas edits: Paper is READ ONLY except `export` to write capture PNGs to disk.

## Read first (in this order)
1. `docs/workflows/stages/ux.md` §4 (from "The ledger of the boards") and §5.
2. The templates: `docs/design/templates/ux-surface-index.template.md`, `ux-state.template.md`, `ux-interaction.template.md`, `ux-boards.template.md`. Delete each template's "Who fills" block in what you write.
3. The passing fixture, for the exact shape: `tooling/fixtures/specs/pass-ledger-desk-and-phone/specs/web/epics/WK1-work/ux/` (states, boards index, interaction, dev note).
4. The map: `E/refs/paper-map/<pageId>.tsv` (name, x, y, w, h, node_id, row_label for every root artboard) and `E/refs/paper-map/<pageId>-notes.md` (every note, notes strip, dev note and row label in full, headed `## <name> @ x <x>, y <y>`). Pages: p-3-0 "USE — daily use", p-4-0 "USE — set up", p-6-0 "USE — work". Paper file 01M49AX02VV4SSBKNCN6NRTS6Y.
5. The decision log, `E/ux/day/decisions/*.md` (later lines win; D-USE-40 to 58 supersede older now-work frames where they differ; D-USE-59 to 62 are this thread's answers from Taylor). The Open list, `E/ux/day/open/open-*.md`. Read only the lines your surface needs (grep by surface, state and step).
6. The approved narrative `E/ux/narrative/` (N1 to N6), the sections your brief names, and the intent-pass flat file for your surface.
7. Roles, skim: `docs/roles/product-design/vesper-ux-ui-designer.md` (lead), `gloss-content-designer.md` (words), `threshold-accessibility-auditor.md` (access). Canon bans A-01 to A-20 (`docs/design/canon.md` §2); product rules `apps/web/docs/product-rules.md` (bent here by Taylor where a D-line says so; name the bend).

## Rules from Taylor (binding)
- The spec is the source of truth: carry **every** detail on the boards. Never condense to fit a length; split into more files instead. Caps (check-specs, tokens ≈ chars/4 after collapsing whitespace): surface index, state, interaction, dev note 2,000; boards row file 4,000.
- Every state names each artboard that draws it in `boards:` frontmatter: `name` exactly as in Paper (copy from the TSV, every character), `page` (page name, e.g. "USE — set up"), `at: [x, y]`, `note` (a note artboard by name, e.g. "Note · success", or a strip as "Notes · phone, Today (row 5) @ x 964" giving the frame's x), `capture` (repo-root path). The body carries that frame's note **in full** under "The notes on the boards" (for a strip, the card for that frame in full).
- Each artboard has exactly one carrying file. Flows that cross surfaces and overlays opened from several surfaces live in `E/ux/interactions/` (a flow with drawn steps of its own: `interactions/<flow>/index.md` plus `states/<step>.md`), cited elsewhere, never repeated. A canvas dev note goes in full into the interaction it explains (`dev_note:` frontmatter), else `E/ux/dev-notes/<topic>.md`.
- Variations not picked, archived directions and superseded frames get a status row in the boards index citing their D-line, not a spec file (a state file may list `not_picked:` and say why in Rulings).
- One file per state listing every width drawn (402, 1024, 1440, 1728); split by width only past the cap. A state drawn at one width says what the other width does (a D-line) or `[NEEDS DECISION]` with the default.
- Markers: `[ASSUMPTION: …]`, `[PROPOSED]`, `[NEEDS DECISION]` (with a default). Placeholder data on the canvas is `[placeholder]`. No emoji in prose. No second person in product words. Never invent: where the boards and the log are silent, say so with a marker.
- Do NOT create new D-USE numbers. If something needs Taylor's ruling, write `[NEEDS DECISION]` with the drawn default in the file and list it in your reply.
- Frontmatter of every spec file: `target: specs/web/ux/<path under E/ux/>` exactly mirroring the path, `status: draft`, `promoted:` empty. State files also `boards:`, `not_picked:` (or omit when none), `rulings: [D-USE-n, …]`; `boards: []` plus `not_drawn: "<reason>"` for an undrawn state. Interactions: `boards:` (may be []), `dev_note:` (may be ""), `rulings:`.
- Criteria IDs: `C-USE-<surface>-<n>` in an index, `C-USE-<surface>-<state>-<n>` in a state, `C-USE-<flow>-<n>` in an interaction. Evidence names a capture path where it can.

## Captures
For each artboard a state or interaction file carries (not notes), export a PNG at 1x to `E/ux/<area>/<surface>/captures/<state>-<width>.png` (interactions: `E/ux/interactions/<flow>/captures/<step>-<width>.png`, or `E/ux/interactions/captures/<flow>-<step>-<width>.png` for a single-file flow). Load the Paper export tool with ToolSearch (`select:mcp__paper__export,mcp__paper__get_guide`; try `mcp__Paper__…` if lowercase fails), call get_guide({topic:"paper-mcp-instructions"}) once, and use the node_id from the TSV. If export can't write to the repo path directly, export where it can and move the file with Bash. If export fails entirely, keep the `capture:` path, and say so in your reply; don't stop the spec work. Don't take screenshots except where a note is ambiguous and you must see the frame (scale ≤ 0.5).

## The coverage index (boards)
Write per row, `E/ux/boards/<page-slug>/<row-slug>.md` (page slugs: `use-daily-use`, `use-set-up`, `use-work`; row slug from the row label, e.g. "Row label · Phone, Today" → `phone-today.md`, "Item sheet (cont.)" → `item-sheet-cont.md`). Frontmatter: `page: "<page name>"`, `page_id`, `file: "01M49AX02VV4SSBKNCN6NRTS6Y"`, `row: "<row label name>"`, `mapped: 2026-10-12`, `status: draft`; no `target:`. One table with columns exactly `| Artboard | x | y | Status | Carried by | Ruling |`, the name in backticks, the carrier as a path relative to `E/ux/` in backticks, or `—`. Statuses: specced, not picked, superseded, archived, note, dev note, row label, progress, safe to delete. A `note` row's carrier is the file carrying the frame above it (or `—` for a strip). A `superseded` row names its ruling and the carrier of its replacement. List only the artboards you account for, in x order; a row file you share with a later thread stays partial (say so in one line under the table: "Rows to be added by <area> thread: …"). Only write the row files your brief assigns you.

## Open items
When you carry an item from `E/ux/day/open/open-*.md` into your files, append " Carried: `<file>`." to the end of that item's text (re-Read the file right before each Edit; other writers edit these files at the same time).

## Finish
Run `yarn check-specs` from the repo root. Errors are allowed only for: `day/overview.md`-type cap errors in files you didn't touch, and carriers or boards that belong to another writer of this thread that hasn't finished (name them). Fix everything else of yours. Reply in under 300 words: files written (count and tree), boards rows (count by status), captures exported or failed, Open items carried, every `[NEEDS DECISION]` you raised with its default, and anything you couldn't place.
