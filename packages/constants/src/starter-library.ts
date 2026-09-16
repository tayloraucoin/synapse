/**
 * The starter library, per block — UX v1.1 §12.4, with the glyphs UX v1.2
 * §12.4 gives every row (R29: a glyph is the row's default `icon`, never a
 * character in a title).
 *
 * WHY PROSE IS ALLOWED HERE. The same exception `DEFAULT_REASONS` documents:
 * these titles are candidate library rows the person confirms by ticking, not
 * copy the app speaks. Nothing is pre-checked, ever (v1.1 §4.8: "hospitality,
 * not persuasion").
 *
 * WHY GLYPHS ARE ALLOWED HERE, AND NOWHERE IN COPY. R29 puts emoji on the
 * person's nouns only. A starter row becomes the person's habit with its
 * glyph as `habits.icon`; the glyph is data (`icon.value`), and the lint rule
 * in `packages/config/eslint/no-emoji.js` forbids one anywhere else — this
 * file is on its exception list for `icon.value` positions only. Where the
 * same noun appears in two blocks (Walk, Stretch, Meditate, Journal, Skincare)
 * it carries the same glyph, so the Today tab reads one vocabulary.
 *
 * KEYED BY BLOCK KIND. The landscape screen (v1.2 §4.8) shows `morning`
 * under *Recommended* (the twelve marked) and *All*; the getting-ready screen
 * (§4.7) offers `prep`'s rows; the builder's 13f offers `break`'s; screen 11
 * (§4.11) offers `wind_down`'s. Four kinds are deliberately empty: `orient`
 * has one item and it is the person's own words; `training` and `work` are
 * collected as rotations, not habits; `activity` suggests nothing by rule —
 * "the sheet suggests nothing; it asks *What's on tonight?*"
 *
 * `placed` marks the two wind-down rows the app places itself from the
 * profile (the journal as the closer, *Phone away* as the devices-off pin —
 * §7.1); they appear in the library so a person can see them, never as
 * something to tick. Their glyphs are `PLACED_ROW_ICONS`' too.
 *
 * A range is the whole habit door to door. Priority is 1–7, 7 highest
 * (official spec R7); every row starts at the middle of the scale except the
 * few a first morning genuinely depends on, and the person changes it on the
 * ranked screen (v1.2 §4.9).
 */

import type { BlockKindValue } from "./block-kinds";

/**
 * The emoji arm of `IconValue`, spelled here because `@syn/constants` sits
 * beside `@syn/types` and may not import it. Structurally the same object.
 */
export type EmojiIcon = {
  readonly kind: "emoji";
  readonly value: string;
};

export type StarterLibraryEntry = {
  readonly title: string;
  /** The row's default glyph — v1.2 §12.4; the person's to change. */
  readonly icon: EmojiIcon;
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

const emoji = (value: string): EmojiIcon => ({ kind: "emoji", value });

const MORNING_RECOMMENDED: ReadonlyArray<StarterLibraryEntry> = [
  { title: "Breath work", icon: emoji("🌬️"), rangeMin: 5, rangeMax: 10, importance: 5, recommended: true },
  { title: "Cold shower", icon: emoji("🥶"), rangeMin: 3, rangeMax: 10, importance: 5, recommended: true },
  { title: "Meditate", icon: emoji("🧘"), rangeMin: 10, rangeMax: 20, importance: 6, recommended: true },
  { title: "Stretch", icon: emoji("🤸"), rangeMin: 5, rangeMax: 15, importance: 4, recommended: true },
  { title: "Journal", icon: emoji("✍️"), rangeMin: 5, rangeMax: 10, importance: 4, recommended: true },
  { title: "Read", icon: emoji("📖"), rangeMin: 15, rangeMax: 30, importance: 4, recommended: true },
  { title: "Walk", icon: emoji("🚶"), rangeMin: 15, rangeMax: 30, importance: 4, recommended: true },
  { title: "Sunlight", icon: emoji("☀️"), rangeMin: 5, rangeMax: 10, importance: 4, recommended: true },
  { title: "Make the bed", icon: emoji("🛏️"), rangeMin: 2, rangeMax: 5, importance: 3, recommended: true },
  { title: "Plan the day", icon: emoji("🗒️"), rangeMin: 5, rangeMax: 10, importance: 5, recommended: true },
  { title: "Water", icon: emoji("💧"), rangeMin: 1, rangeMax: 2, importance: 4, recommended: true },
  { title: "Gratitude", icon: emoji("🙏"), rangeMin: 2, rangeMax: 5, importance: 4, recommended: true },
];

const MORNING_MORE: ReadonlyArray<StarterLibraryEntry> = [
  { title: "Yoga", icon: emoji("🪷"), rangeMin: 20, rangeMax: 45, importance: 4, recommended: false },
  { title: "Mobility", icon: emoji("🦵"), rangeMin: 10, rangeMax: 20, importance: 4, recommended: false },
  { title: "Run", icon: emoji("🏃"), rangeMin: 20, rangeMax: 45, importance: 4, recommended: false },
  { title: "Swim", icon: emoji("🏊"), rangeMin: 30, rangeMax: 60, importance: 4, recommended: false },
  { title: "Pray", icon: emoji("🕊️"), rangeMin: 5, rangeMax: 20, importance: 4, recommended: false },
  { title: "Language practice", icon: emoji("🔤"), rangeMin: 10, rangeMax: 20, importance: 4, recommended: false },
  { title: "Music practice", icon: emoji("🎵"), rangeMin: 15, rangeMax: 30, importance: 4, recommended: false },
  { title: "Write", icon: emoji("✒️"), rangeMin: 20, rangeMax: 45, importance: 4, recommended: false },
  { title: "Skincare", icon: emoji("🧴"), rangeMin: 5, rangeMax: 10, importance: 3, recommended: false },
  { title: "Vocal warm-up", icon: emoji("🎤"), rangeMin: 5, rangeMax: 15, importance: 4, recommended: false },
  { title: "Face training", icon: emoji("😌"), rangeMin: 5, rangeMax: 10, importance: 3, recommended: false },
  { title: "Visualise", icon: emoji("🔭"), rangeMin: 5, rangeMax: 10, importance: 4, recommended: false },
  { title: "Affirmations", icon: emoji("💬"), rangeMin: 2, rangeMax: 5, importance: 4, recommended: false },
  { title: "Sauna", icon: emoji("🔥"), rangeMin: 10, rangeMax: 20, importance: 3, recommended: false },
  { title: "Ice bath", icon: emoji("🧊"), rangeMin: 2, rangeMax: 5, importance: 4, recommended: false },
  { title: "Tidy", icon: emoji("🧹"), rangeMin: 5, rangeMax: 15, importance: 3, recommended: false },
  { title: "Podcast", icon: emoji("🎧"), rangeMin: 15, rangeMax: 30, importance: 3, recommended: false },
  { title: "Draw", icon: emoji("✏️"), rangeMin: 15, rangeMax: 30, importance: 4, recommended: false },
  { title: "Garden", icon: emoji("🌱"), rangeMin: 15, rangeMax: 30, importance: 3, recommended: false },
  { title: "Call someone", icon: emoji("📞"), rangeMin: 10, rangeMax: 20, importance: 4, recommended: false },
];

export const STARTER_LIBRARY: Record<
  BlockKindValue,
  ReadonlyArray<StarterLibraryEntry>
> = {
  orient: [],
  morning: [...MORNING_RECOMMENDED, ...MORNING_MORE],
  training: [],
  prep: [
    { title: "Breakfast", icon: emoji("🍳"), rangeMin: 10, rangeMax: 30, importance: 7, recommended: true },
    { title: "Coffee", icon: emoji("☕"), rangeMin: 5, rangeMax: 10, importance: 5, recommended: true },
    { title: "Shower", icon: emoji("🚿"), rangeMin: 5, rangeMax: 15, importance: 7, recommended: true },
    { title: "Get dressed", icon: emoji("👕"), rangeMin: 5, rangeMax: 10, importance: 7, recommended: false },
    { title: "Walk", icon: emoji("🚶"), rangeMin: 10, rangeMax: 30, importance: 5, recommended: true },
    { title: "Transit", icon: emoji("🚌"), rangeMin: 15, rangeMax: 60, importance: 7, recommended: true },
    { title: "Drive", icon: emoji("🚗"), rangeMin: 10, rangeMax: 45, importance: 7, recommended: false },
    { title: "Walk the dog", icon: emoji("🐕"), rangeMin: 15, rangeMax: 30, importance: 7, recommended: true },
    { title: "Kids' school run", icon: emoji("🎒"), rangeMin: 20, rangeMax: 45, importance: 7, recommended: false },
    { title: "Pack lunch", icon: emoji("🥪"), rangeMin: 5, rangeMax: 10, importance: 4, recommended: false },
  ],
  work: [],
  break: [
    { title: "Walk", icon: emoji("🚶"), rangeMin: 10, rangeMax: 20, importance: 4, recommended: true },
    { title: "Stretch", icon: emoji("🤸"), rangeMin: 5, rangeMax: 10, importance: 4, recommended: true },
    { title: "Meditate", icon: emoji("🧘"), rangeMin: 5, rangeMax: 15, importance: 4, recommended: true },
    { title: "Nap", icon: emoji("😴"), rangeMin: 15, rangeMax: 25, importance: 3, recommended: false },
    { title: "Lunch away from the desk", icon: emoji("🥗"), rangeMin: 20, rangeMax: 40, importance: 4, recommended: true },
    { title: "Eyes off screens", icon: emoji("👀"), rangeMin: 5, rangeMax: 10, importance: 3, recommended: false },
  ],
  activity: [],
  wind_down: [
    { title: "Read", icon: emoji("📖"), rangeMin: 15, rangeMax: 30, importance: 4, recommended: true },
    { title: "Stretch", icon: emoji("🤸"), rangeMin: 5, rangeMax: 15, importance: 4, recommended: true },
    { title: "Meditate", icon: emoji("🧘"), rangeMin: 5, rangeMax: 15, importance: 4, recommended: true },
    { title: "Bath", icon: emoji("🛁"), rangeMin: 15, rangeMax: 30, importance: 3, recommended: false },
    { title: "Tidy the kitchen", icon: emoji("🧽"), rangeMin: 5, rangeMax: 15, importance: 3, recommended: false },
    { title: "Lay out tomorrow", icon: emoji("👔"), rangeMin: 5, rangeMax: 10, importance: 4, recommended: true },
    { title: "Skincare", icon: emoji("🧴"), rangeMin: 5, rangeMax: 10, importance: 3, recommended: false },
    { title: "Tea", icon: emoji("🍵"), rangeMin: 5, rangeMax: 10, importance: 3, recommended: false },
    { title: "Journal", icon: emoji("✍️"), rangeMin: 5, rangeMax: 10, importance: 5, recommended: true, placed: true },
    { title: "Phone away", icon: emoji("📵"), rangeMin: 1, rangeMax: 1, importance: 6, recommended: true, placed: true },
  ],
};
