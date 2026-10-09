# Synapse — DESIGN.md

Deltas on `docs/design/canon.md`; values in `preset.css`.

**Product:** a day planner for one person that records what happened without judging it.

## Principles

- **D-P01 Two registers.** Geist for the interface; Newsreader only on reflective surfaces (Review headers, the adherence sentence, notes). Tightens C-P01.
- **D-P02 The accent means this moment.** Now line, now/soon dot, the active timer, focus ring; nothing else borrows it. Tightens C-P05.

## Type, color, density

- Font reason (A-01): G-01. Tabular minimum: `caption`, 12px.
- Neutrals warm (ink and paper); temperature and A-06: G-02.
- One density: rows `--row-min`, targets `--target`, one break `wide:`.

## Voice

Sentence case. Strings in `specs/web/ux/_global/copy-register.md`.

## Motion

`--dur-state`, `--dur-sheet`, zero under reduced motion. `--dur-breathe` exceeds C-P11: G-03.
