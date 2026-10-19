---
status: approved
---

# The UX handoff from Paper writes a ledger of the boards

**Date:** 2026-10-12 · **PEM source:** `docs/workflows/stages/ux.md`, `design.md`, `glossary.md`, `tooling/check-specs.ts`, `tooling/lib/specs.ts` at `62d344b`; the four templates are new · **In Synapse:** the same paths, `docs/design/templates/ux-surface-index.template.md`, `ux-state.template.md`, `ux-interaction.template.md`, `ux-boards.template.md`, and seven fixtures under `tooling/fixtures/specs/` · **For:** PEM · **Status:** proposed

## What changed

The UX stage's handoff pass, run after the Design stage's lock, used to write each surface as one file of at most 2,000 tokens, "a diff, not a transcription". Dense boards came out condensed, and nothing showed which artboard a line came from. At a handoff from Paper the pass now writes a **ledger of the boards**: a directory that pairs with the canvas.

- **Mapping.** The pass maps every page row by row. It finds the row labels, then each row's artboards by their `top`, because a whole-page query stops at 200 nodes.
- **Surfaces and states.** Each surface gets an `index.md` holding the job, entry and exit, layout, primary action, words, access, criteria, Platforms and the interactions opened from it. Each state gets `states/<state>.md`, one file per state at every width.
- **Board references.** A state's frontmatter lists each artboard that draws it: the name exactly as in Paper, the page, x and y, the note it sits over, and the capture path. The body carries the note in full, what each ruling D-line decided, and the variations not picked. A state with no artboard has `boards: []` and `not_drawn:`.
- **Interactions and dev notes.** Flows that cross surfaces, and overlays opened from several surfaces, go in `ux/interactions/`. A canvas dev note goes in full into the flow it explains, or into `ux/dev-notes/`.
- **One carrier per artboard.** Each artboard is carried by exactly one file; other files cite it.
- **Coverage index.** `ux/boards/<page>.md`, one per Paper page, gives every artboard a status and the file that carries it. It has no `target:` and is never promoted.
- **Caps.** Every file keeps its cap, and a file past its cap is split (a state by width, an index by row), never trimmed.
- **Promotion.** `target:` still mirrors the path, so `truth:promote` copies the nested files unchanged.
- **Captures.** The Design stage's lock puts the captures beside the surface (`<area>/<surface>/captures/`) when the ledger follows.

`check-specs` now works out a file's kind from its path. The new kinds are surface index, state, interaction and dev note (2,000 tokens each) and boards (4,000). It checks coverage in both directions:

- every `specced` or `dev note` row names a carrier that lists the artboard;
- every artboard a carrier lists is in an index, and only one file claims it;
- `not picked` rows cite a D-line;
- `superseded` rows name a ruling and the carrier of the replacement;
- `specced` names follow `<surface> / <state> / <width> / <scheme>`;
- a coverage index carries `page:` and no `target:`;
- a flat `<surface>.md` and a surface directory never coexist.

CI cannot reach Paper, so the index stands in for the canvas, and the handoff thread maps the pages against it.

## Files

- `docs/workflows/stages/ux.md`: §3 a Loads row for the ledger templates. §4 the handoff-pass line ("a ledger of the boards, not a summary") and a new subsection, the ledger of the boards, in six numbered rules. §5 the ledger's writes and what the check enforces.
- `docs/workflows/stages/design.md`: §7 lock, where captures go before a ledger handoff, and the requirement that every artboard has a note and every row a label before lock.
- `docs/workflows/glossary.md`: Ledger of the boards (told apart from the Q3 ledger).
- `docs/design/templates/ux-surface-index.template.md`, `ux-state.template.md`, `ux-interaction.template.md`, `ux-boards.template.md`: new.
- `docs/design/templates/ux-surface.template.md`: one line naming the ledger templates for a handoff from Paper. `docs/design/templates/README.md`: one sentence.
- `tooling/lib/specs.ts`: `SPEC_FILE_CAPS` gains five kinds; `isBoardsIndex`, `uxKind`, `BOARD_STATUSES`, `readBoardRows`.
- `tooling/check-specs.ts`: `checkUx` uses `uxKind`, says how to split each kind, and leaves boards out of the proposals; `checkLedger` is new.
- `tooling/budget.ts`: the critic row's "cited surface" leaves out the narrative and coverage indexes, which a critic never cites.
- `tooling/fixtures/specs/pass-ledger-desk-and-phone` (a state drawn at 1728 and 402, a phone-only state, a not-drawn state, a superseded frame, a variation not picked, two dev notes, and every non-spec status) and six failing fixtures: `fail-ledger-board-not-in-index`, `-carrier-does-not-list`, `-superseded-without-ruling`, `-not-picked-without-d-line`, `-state-without-boards`, `-boards-with-target`.

## Why

Taylor asked for it on 2026-10-10, before the USE epic's first handoff from Paper:

- the UX spec is the source of truth, so detail is the point and is never minimised to fit a limit;
- the spec is a directory spread over as many files as needed;
- everything on the boards is represented, and each part names its board, so a future agent can pair spec and board quickly;
- interactions and flows have a folder of their own;
- every change to the process goes in an adaptation entry.

The shape was tested against the real boards before it was built. The USE item sheet is drawn on all three pages, including an archived round redrawn on another page. Today is named `today / …` at 1728 and `phone-today / …` at 402. Notes come both as one artboard per frame and as strips. The decision to carry one state across widths in one file is judgment (Vesper): splitting by width would separate the frames a builder compares. Taylor approved the convention with its defaults on 2026-10-12.

## For a PEM sync

Carry back whole. Synapse-specific, to generalise first:

- **Paper.** The tool's name, and the MCP's 200-node and 100-artboard limits behind "map row by row". The toolkit's Design stage already names Paper, so this may stand.
- **Board layout.** The row-label column at x -560 is a Synapse canvas habit, not a rule.
- **Widths.** The fixture's widths, 402 and 1728.

The fixtures use the toolkit's existing fixture shape. The coverage check has no Paper dependency: it reads only the index and the spec files.
