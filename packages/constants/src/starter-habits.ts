/**
 * The starter set — Epic 1 FR-02, "Start from a small set", verbatim.
 *
 * WHY PROSE IS ALLOWED HERE. `@syn/constants` never holds copy a person reads;
 * that rule exists so strings live in a `copy.ts` beside the thing that
 * renders them. These ten titles are the exception the ticket names: they are
 * *data*, not copy. The chooser offers them as candidate library rows, and the
 * person confirms each one by saving it — after which it is their habit, with
 * their words, editable like any other. The dev seed writes the same rows for
 * the smoke account; SET-4's procedure writes them for a real person. One
 * table, two writers, one home.
 *
 * Every value is FR-02's: title · range · importance. All type `habit`, no
 * category, no quantity, no reflection axes. The first carries the wake
 * anchor mark ("This is my wake-up habit"). Official spec §0.3 R7: 7 is highest.
 */

export type StarterHabit = {
  readonly title: string;
  /** Minutes — the low end of "how long it might take". */
  readonly rangeMin: number;
  /** Minutes — the high end. */
  readonly rangeMax: number;
  /** `life_priority`, 1–7 with 7 highest (official spec §3.3, R7). */
  readonly importance: number;
  /** Only the first row: the habit whose completion sets the day's wake time (R5). */
  readonly wakeAnchor: boolean;
};

export const STARTER_HABITS: ReadonlyArray<StarterHabit> = [
  { title: "Wake up immediately", rangeMin: 1, rangeMax: 2, importance: 7, wakeAnchor: true },
  { title: "Cold shower or bath", rangeMin: 3, rangeMax: 8, importance: 5, wakeAnchor: false },
  { title: "Meditate", rangeMin: 10, rangeMax: 20, importance: 6, wakeAnchor: false },
  { title: "Stretch or yoga", rangeMin: 10, rangeMax: 30, importance: 4, wakeAnchor: false },
  { title: "Breathwork", rangeMin: 5, rangeMax: 10, importance: 4, wakeAnchor: false },
  { title: "Read", rangeMin: 15, rangeMax: 30, importance: 4, wakeAnchor: false },
  { title: "Walk", rangeMin: 20, rangeMax: 40, importance: 4, wakeAnchor: false },
  { title: "Lift", rangeMin: 40, rangeMax: 60, importance: 6, wakeAnchor: false },
  { title: "Write tomorrow's plan", rangeMin: 5, rangeMax: 10, importance: 5, wakeAnchor: false },
  { title: "Lights out on time", rangeMin: 1, rangeMax: 1, importance: 6, wakeAnchor: false },
] as const;
