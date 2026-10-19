import type { BlockKind } from "@syn/types";

/**
 * The blocks primer's strings — UX v1.3 §4.2 (R47, G2; DAY-8), verbatim.
 *
 * The legend's words are the primer's own (*Morning routine*, not the bare
 * kind word *Morning*), and the band names follow them so the picture and
 * the key say the same thing. The dash between word and line is drawn by the
 * legend, as `InfoDisclosure` draws its own.
 *
 * NO GLYPH IN HERE (v1.2 R29, TD-20). The swatches are the kinds' hue tokens.
 */
export const BLOCKS_PRIMER_COPY = {
  heading: "Days are built in blocks.",
  body: "Nine kinds. Every day uses some of them. Here is one day, as an example.",
  /** Above the axis, muted — the example must never read as the person's day. */
  caption: "An example.",
  /** The axis's accessible name (DAY-8 Accessibility). */
  axisLabel: "An example day",
  /** The shortened band under the axis (v1.3 §4.2: "with the sleep band shortened"). */
  sleep: "Sleep · 22:30 to 7:00",
  /** The nine rows, in the order of a day. */
  legend: [
    { kind: "orient", word: "Orient", line: "the reading and the lines." },
    { kind: "morning", word: "Morning routine", line: "the habits, as much as fits." },
    { kind: "training", word: "Training", line: "a workout, with the travel." },
    { kind: "prep", word: "Getting ready", line: "what has to happen before work." },
    { kind: "work", word: "Work", line: "the container." },
    { kind: "break", word: "Break", line: "a break or a meal inside work." },
    { kind: "transition", word: "After work", line: "the hand-off: home, cook, eat." },
    { kind: "activity", word: "Free time", line: "the evening, chosen from a pool." },
    { kind: "wind_down", word: "Wind-down", line: "back from lights out." },
  ] as const satisfies ReadonlyArray<{ kind: BlockKind; word: string; line: string }>,
} as const;
