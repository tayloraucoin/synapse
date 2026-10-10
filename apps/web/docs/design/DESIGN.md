# Synapse — DESIGN.md

Deltas on `docs/design/canon.md`; values in `preset.css`.

**Product:** a day planner for one person that records what happened without judging it.

## Principles

- **D-P01 Two registers.** Public Sans for the interface (400, 500, 600); Newsreader on Review screens only (the Day and Week Review titles and summary). The brand kit's type (WEB-1). Tightens C-P01.
- **D-P02 Verdigris means this moment.** `now` draws the now line, the current-item dot and the focus ring; `link` sets the few words in the brand colour; nothing is filled with it. Tightens C-P05.
- **D-P03 Quiet wins.** The kit's pillars, ranked: Quiet, Candid, Deliberate; when two pull apart, Quiet wins. No shadow; nothing round but the mark, a category dot and the current-item dot.

## Type, color, density

- Font reason (A-01): the brand kit names Public Sans and Newsreader (G-01 closed). Tabular minimum: `caption`, 12px; times and counts in `figure`.
- Neutrals warm (the kit's ramp, hue 85 to 106: paper and ink); temperature and A-06: G-02.
- One density: rows `--row-min`, targets `--target`, one break `wide:`.

## Voice

Sentence case. Strings in `specs/web/ux/_global/copy-register.md`.

## Motion

`--dur-state`, `--dur-sheet`, zero under reduced motion. `--dur-breathe` exceeds C-P11: G-03.
