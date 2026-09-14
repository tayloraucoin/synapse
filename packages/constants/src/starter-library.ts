/**
 * The starter library, per block — UX v1.1 §12.4, verbatim.
 *
 * WHY PROSE IS ALLOWED HERE. The same exception `DEFAULT_REASONS` documents:
 * these titles are candidate library rows the person confirms by ticking, not
 * copy the app speaks. Nothing is pre-checked, ever (v1.1 §4.8: "hospitality,
 * not persuasion").
 *
 * KEYED BY BLOCK KIND. The landscape screen (v1.1 §4.8) shows `morning`
 * under *Recommended* (the twelve marked) and *All*; the prep screen (§4.7)
 * offers `prep`'s rows as its chooser band; `break` and `wind_down` feed their
 * block editors' *Add*. Four kinds are deliberately empty: `orient` has one
 * item and it is the person's own words; `training` and `work` are collected
 * as rotations, not habits; `activity` suggests nothing by rule — "the sheet
 * suggests nothing; it asks *What's on tonight?*"
 *
 * `placed` marks the two wind-down rows the app places itself from the
 * profile (the journal as the closer, *Phone away* as the devices-off pin —
 * §7.1); they appear in the library so a person can see them, never as
 * something to tick.
 *
 * A range is the whole habit door to door. Priority is 1–7, 7 highest
 * (official spec R7); every row starts at the middle of the scale except the
 * few a first morning genuinely depends on, and the person changes it on the
 * *Selected* tab.
 */

import type { BlockKindValue } from "./block-kinds";

export type StarterLibraryEntry = {
  readonly title: string;
  /** Minutes — the low end of "how long it might take". */
  readonly rangeMin: number;
  /** Minutes — the high end. */
  readonly rangeMax: number;
  /** `life_priority`, 1–7 with 7 highest. */
  readonly importance: number;
  /** Shown under *Recommended* on the landscape screen. */
  readonly recommended: boolean;
  /** Placed by the app from the profile; shown, never ticked. */
  readonly placed?: boolean;
};

const MORNING_RECOMMENDED: ReadonlyArray<StarterLibraryEntry> = [
  { title: "Breath work", rangeMin: 5, rangeMax: 10, importance: 5, recommended: true },
  { title: "Cold shower", rangeMin: 3, rangeMax: 10, importance: 5, recommended: true },
  { title: "Meditate", rangeMin: 10, rangeMax: 20, importance: 6, recommended: true },
  { title: "Stretch", rangeMin: 5, rangeMax: 15, importance: 4, recommended: true },
  { title: "Journal", rangeMin: 5, rangeMax: 10, importance: 4, recommended: true },
  { title: "Read", rangeMin: 15, rangeMax: 30, importance: 4, recommended: true },
  { title: "Walk", rangeMin: 15, rangeMax: 30, importance: 4, recommended: true },
  { title: "Sunlight", rangeMin: 5, rangeMax: 10, importance: 4, recommended: true },
  { title: "Make the bed", rangeMin: 2, rangeMax: 5, importance: 3, recommended: true },
  { title: "Plan the day", rangeMin: 5, rangeMax: 10, importance: 5, recommended: true },
  { title: "Water", rangeMin: 1, rangeMax: 2, importance: 4, recommended: true },
  { title: "Gratitude", rangeMin: 2, rangeMax: 5, importance: 4, recommended: true },
];

const MORNING_MORE: ReadonlyArray<StarterLibraryEntry> = [
  { title: "Yoga", rangeMin: 20, rangeMax: 45, importance: 4, recommended: false },
  { title: "Mobility", rangeMin: 10, rangeMax: 20, importance: 4, recommended: false },
  { title: "Run", rangeMin: 20, rangeMax: 45, importance: 4, recommended: false },
  { title: "Swim", rangeMin: 30, rangeMax: 60, importance: 4, recommended: false },
  { title: "Pray", rangeMin: 5, rangeMax: 20, importance: 4, recommended: false },
  { title: "Language practice", rangeMin: 10, rangeMax: 20, importance: 4, recommended: false },
  { title: "Music practice", rangeMin: 15, rangeMax: 30, importance: 4, recommended: false },
  { title: "Write", rangeMin: 20, rangeMax: 45, importance: 4, recommended: false },
  { title: "Skincare", rangeMin: 5, rangeMax: 10, importance: 3, recommended: false },
  { title: "Vocal warm-up", rangeMin: 5, rangeMax: 15, importance: 4, recommended: false },
  { title: "Face training", rangeMin: 5, rangeMax: 10, importance: 3, recommended: false },
  { title: "Visualise", rangeMin: 5, rangeMax: 10, importance: 4, recommended: false },
  { title: "Affirmations", rangeMin: 2, rangeMax: 5, importance: 4, recommended: false },
  { title: "Sauna", rangeMin: 10, rangeMax: 20, importance: 3, recommended: false },
  { title: "Ice bath", rangeMin: 2, rangeMax: 5, importance: 4, recommended: false },
  { title: "Tidy", rangeMin: 5, rangeMax: 15, importance: 3, recommended: false },
  { title: "Podcast", rangeMin: 15, rangeMax: 30, importance: 3, recommended: false },
  { title: "Draw", rangeMin: 15, rangeMax: 30, importance: 4, recommended: false },
  { title: "Garden", rangeMin: 15, rangeMax: 30, importance: 3, recommended: false },
  { title: "Call someone", rangeMin: 10, rangeMax: 20, importance: 4, recommended: false },
];

export const STARTER_LIBRARY: Record<
  BlockKindValue,
  ReadonlyArray<StarterLibraryEntry>
> = {
  orient: [],
  morning: [...MORNING_RECOMMENDED, ...MORNING_MORE],
  training: [],
  prep: [
    { title: "Breakfast", rangeMin: 10, rangeMax: 30, importance: 7, recommended: true },
    { title: "Coffee", rangeMin: 5, rangeMax: 10, importance: 5, recommended: true },
    { title: "Shower", rangeMin: 5, rangeMax: 15, importance: 7, recommended: true },
    { title: "Get dressed", rangeMin: 5, rangeMax: 10, importance: 7, recommended: false },
    { title: "Walk", rangeMin: 10, rangeMax: 30, importance: 5, recommended: true },
    { title: "Transit", rangeMin: 15, rangeMax: 60, importance: 7, recommended: true },
    { title: "Drive", rangeMin: 10, rangeMax: 45, importance: 7, recommended: false },
    { title: "Walk the dog", rangeMin: 15, rangeMax: 30, importance: 7, recommended: true },
    { title: "Kids' school run", rangeMin: 20, rangeMax: 45, importance: 7, recommended: false },
    { title: "Pack lunch", rangeMin: 5, rangeMax: 10, importance: 4, recommended: false },
  ],
  work: [],
  break: [
    { title: "Walk", rangeMin: 10, rangeMax: 20, importance: 4, recommended: true },
    { title: "Stretch", rangeMin: 5, rangeMax: 10, importance: 4, recommended: true },
    { title: "Meditate", rangeMin: 5, rangeMax: 15, importance: 4, recommended: true },
    { title: "Nap", rangeMin: 15, rangeMax: 25, importance: 3, recommended: false },
    { title: "Lunch away from the desk", rangeMin: 20, rangeMax: 40, importance: 4, recommended: true },
    { title: "Eyes off screens", rangeMin: 5, rangeMax: 10, importance: 3, recommended: false },
  ],
  activity: [],
  wind_down: [
    { title: "Read", rangeMin: 15, rangeMax: 30, importance: 4, recommended: true },
    { title: "Stretch", rangeMin: 5, rangeMax: 15, importance: 4, recommended: true },
    { title: "Meditate", rangeMin: 5, rangeMax: 15, importance: 4, recommended: true },
    { title: "Bath", rangeMin: 15, rangeMax: 30, importance: 3, recommended: false },
    { title: "Tidy the kitchen", rangeMin: 5, rangeMax: 15, importance: 3, recommended: false },
    { title: "Lay out tomorrow", rangeMin: 5, rangeMax: 10, importance: 4, recommended: true },
    { title: "Skincare", rangeMin: 5, rangeMax: 10, importance: 3, recommended: false },
    { title: "Tea", rangeMin: 5, rangeMax: 10, importance: 3, recommended: false },
    { title: "Journal", rangeMin: 5, rangeMax: 10, importance: 5, recommended: true, placed: true },
    { title: "Phone away", rangeMin: 1, rangeMax: 1, importance: 6, recommended: true, placed: true },
  ],
};
