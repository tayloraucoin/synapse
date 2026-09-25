/**
 * The example day the blocks primer draws — UX v1.3 §4.2, §12.4, R47 (G2).
 *
 * Taylor's own day, 7:00 to 7:00 the next morning, as twelve spans in
 * minutes from the first day's midnight (so the sleep band ends at 1860, the
 * next morning's 7:00). It is constants, not a plan: it never changes with
 * the person's answers, and the primer's caption says *An example.*
 *
 * WHY A NOUN IS ALLOWED HERE. The second break carries `name: "Lunch"` — a
 * noun on the example, the same exception the starter library's titles use:
 * a label drawn inside a band, not a sentence the app speaks. The block words
 * themselves are `BLOCK_KIND_WORDS`; the legend lines are the primer's copy.
 * No glyph lives in this file.
 *
 * `sleep` is not a block kind (v1.3 §3.1) — it is the span between lights
 * out and up, drawn as the quiet band.
 */

import type { BlockKindValue } from "./block-kinds";

export type ExampleDaySpan = {
  readonly kind: BlockKindValue | "sleep";
  /** Minutes from the first day's midnight. */
  readonly startMin: number;
  readonly endMin: number;
  /** A band's own name where it differs from the kind's word. */
  readonly name?: string;
};

const at = (hours: number, minutes = 0): number => hours * 60 + minutes;

/** v1.3 §12.4 — orient 7:00 … sleep 22:30–7:00. Contiguous; twenty-four hours. */
export const EXAMPLE_DAY: ReadonlyArray<ExampleDaySpan> = [
  { kind: "orient", startMin: at(7), endMin: at(7, 5) },
  { kind: "morning", startMin: at(7, 5), endMin: at(8) },
  { kind: "training", startMin: at(8), endMin: at(9) },
  { kind: "prep", startMin: at(9), endMin: at(9, 30) },
  { kind: "work", startMin: at(9, 30), endMin: at(15) },
  { kind: "break", startMin: at(15), endMin: at(15, 15) },
  { kind: "break", startMin: at(15, 15), endMin: at(15, 45), name: "Lunch" },
  { kind: "work", startMin: at(15, 45), endMin: at(19) },
  { kind: "transition", startMin: at(19), endMin: at(19, 30) },
  { kind: "activity", startMin: at(19, 30), endMin: at(21) },
  { kind: "wind_down", startMin: at(21), endMin: at(22, 30) },
  { kind: "sleep", startMin: at(22, 30), endMin: at(31) },
];
