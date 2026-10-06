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
 * (§4.11) offers `wind_down`'s. Three kinds are deliberately empty: `orient`
 * has one item and it is the person's own words; `training` and `work` are
 * collected as rotations, not habits.
 *
 * UX v1.3 §12.4 (DAY-3). `activity` is no longer empty: free time is a
 * library and a pool (R50 reverses v1.2's *the sheet suggests nothing*) —
 * thirty-two rows in five groups, eight marked *Recommended*, nothing
 * preselected. `transition` (R48) offers the after-work hand-off's eight;
 * `break` is widened by *Lunch* and *Eat something*. The morning rows carry
 * a `group` for the landscape's *All* tab (R66); the group's word is the
 * screen's copy, keyed by the constant's key. Every existing row's title,
 * range and glyph is untouched — people's habits were made from them.
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
  /**
   * The *All* tab's group (UX v1.3 R66) — `MORNING_GROUPS` for `morning`,
   * `ACTIVITY_GROUPS` for `activity`; absent on every other kind.
   */
  readonly group?: MorningGroup | ActivityGroup;
};

/** The morning landscape's groups, in the order *All* shows them (v1.3 R66). */
export const MORNING_GROUPS = ["body", "mind", "practice", "home"] as const;
export type MorningGroup = (typeof MORNING_GROUPS)[number];

/** Free time's groups, in the order *All* shows them (v1.3 R50, R66). */
export const ACTIVITY_GROUPS = ["move", "make", "connect", "rest", "tend"] as const;
export type ActivityGroup = (typeof ACTIVITY_GROUPS)[number];

const emoji = (value: string): EmojiIcon => ({ kind: "emoji", value });

const MORNING_RECOMMENDED: ReadonlyArray<StarterLibraryEntry> = [
  { title: "Breath work", icon: emoji("🌬️"), rangeMin: 5, rangeMax: 10, importance: 5, recommended: true, group: "body" },
  { title: "Cold shower", icon: emoji("🥶"), rangeMin: 3, rangeMax: 10, importance: 5, recommended: true, group: "body" },
  { title: "Meditate", icon: emoji("🧘"), rangeMin: 10, rangeMax: 20, importance: 6, recommended: true, group: "mind" },
  { title: "Stretch", icon: emoji("🤸"), rangeMin: 5, rangeMax: 15, importance: 4, recommended: true, group: "body" },
  { title: "Journal", icon: emoji("✍️"), rangeMin: 5, rangeMax: 10, importance: 4, recommended: true, group: "mind" },
  { title: "Read", icon: emoji("📖"), rangeMin: 15, rangeMax: 30, importance: 4, recommended: true, group: "mind" },
  { title: "Walk", icon: emoji("🚶"), rangeMin: 15, rangeMax: 30, importance: 4, recommended: true, group: "body" },
  { title: "Sunlight", icon: emoji("☀️"), rangeMin: 5, rangeMax: 10, importance: 4, recommended: true, group: "body" },
  { title: "Make the bed", icon: emoji("🛏️"), rangeMin: 2, rangeMax: 5, importance: 3, recommended: true, group: "body" },
  { title: "Plan the day", icon: emoji("🗒️"), rangeMin: 5, rangeMax: 10, importance: 5, recommended: true, group: "mind" },
  { title: "Water", icon: emoji("💧"), rangeMin: 1, rangeMax: 2, importance: 4, recommended: true, group: "body" },
  { title: "Gratitude", icon: emoji("🙏"), rangeMin: 2, rangeMax: 5, importance: 4, recommended: true, group: "mind" },
];

const MORNING_MORE: ReadonlyArray<StarterLibraryEntry> = [
  { title: "Yoga", icon: emoji("🪷"), rangeMin: 20, rangeMax: 45, importance: 4, recommended: false, group: "body" },
  { title: "Mobility", icon: emoji("🦵"), rangeMin: 10, rangeMax: 20, importance: 4, recommended: false, group: "body" },
  { title: "Run", icon: emoji("🏃"), rangeMin: 20, rangeMax: 45, importance: 4, recommended: false, group: "body" },
  { title: "Swim", icon: emoji("🏊"), rangeMin: 30, rangeMax: 60, importance: 4, recommended: false, group: "body" },
  { title: "Pray", icon: emoji("🕊️"), rangeMin: 5, rangeMax: 20, importance: 4, recommended: false, group: "mind" },
  { title: "Language practice", icon: emoji("🔤"), rangeMin: 10, rangeMax: 20, importance: 4, recommended: false, group: "practice" },
  { title: "Music practice", icon: emoji("🎵"), rangeMin: 15, rangeMax: 30, importance: 4, recommended: false, group: "practice" },
  { title: "Write", icon: emoji("✒️"), rangeMin: 20, rangeMax: 45, importance: 4, recommended: false, group: "practice" },
  { title: "Skincare", icon: emoji("🧴"), rangeMin: 5, rangeMax: 10, importance: 3, recommended: false, group: "body" },
  { title: "Vocal warm-up", icon: emoji("🎤"), rangeMin: 5, rangeMax: 15, importance: 4, recommended: false, group: "practice" },
  { title: "Face training", icon: emoji("😌"), rangeMin: 5, rangeMax: 10, importance: 3, recommended: false, group: "body" },
  { title: "Visualise", icon: emoji("🔭"), rangeMin: 5, rangeMax: 10, importance: 4, recommended: false, group: "mind" },
  { title: "Affirmations", icon: emoji("💬"), rangeMin: 2, rangeMax: 5, importance: 4, recommended: false, group: "mind" },
  { title: "Sauna", icon: emoji("🔥"), rangeMin: 10, rangeMax: 20, importance: 3, recommended: false, group: "body" },
  { title: "Ice bath", icon: emoji("🧊"), rangeMin: 2, rangeMax: 5, importance: 4, recommended: false, group: "body" },
  { title: "Tidy", icon: emoji("🧹"), rangeMin: 5, rangeMax: 15, importance: 3, recommended: false, group: "home" },
  { title: "Podcast", icon: emoji("🎧"), rangeMin: 15, rangeMax: 30, importance: 3, recommended: false, group: "mind" },
  { title: "Draw", icon: emoji("✏️"), rangeMin: 15, rangeMax: 30, importance: 4, recommended: false, group: "practice" },
  { title: "Garden", icon: emoji("🌱"), rangeMin: 15, rangeMax: 30, importance: 3, recommended: false, group: "home" },
  { title: "Call someone", icon: emoji("📞"), rangeMin: 10, rangeMax: 20, importance: 4, recommended: false, group: "home" },
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
    // v1.3 §12.4 — widened: inside work, a meal is a break (R48).
    { title: "Lunch", icon: emoji("🍽️"), rangeMin: 20, rangeMax: 45, importance: 4, recommended: false },
    { title: "Eat something", icon: emoji("🥪"), rangeMin: 10, rangeMax: 20, importance: 3, recommended: false },
    { title: "Eyes off screens", icon: emoji("👀"), rangeMin: 5, rangeMax: 10, importance: 3, recommended: false },
  ],
  // v1.3 §12.4, R48 — after work: the hand-off, home, cook, eat. B14 shows all eight.
  transition: [
    { title: "Drive home", icon: emoji("🚗"), rangeMin: 10, rangeMax: 45, importance: 4, recommended: false },
    { title: "Transit home", icon: emoji("🚌"), rangeMin: 15, rangeMax: 60, importance: 4, recommended: false },
    { title: "Groceries", icon: emoji("🛒"), rangeMin: 15, rangeMax: 40, importance: 4, recommended: false },
    { title: "Cook", icon: emoji("🍳"), rangeMin: 20, rangeMax: 45, importance: 4, recommended: false },
    { title: "Dinner", icon: emoji("🍽️"), rangeMin: 20, rangeMax: 45, importance: 4, recommended: false },
    { title: "Shower", icon: emoji("🚿"), rangeMin: 5, rangeMax: 15, importance: 4, recommended: false },
    { title: "Walk the dog", icon: emoji("🐕"), rangeMin: 15, rangeMax: 30, importance: 4, recommended: false },
    { title: "Chores", icon: emoji("🧺"), rangeMin: 15, rangeMax: 45, importance: 4, recommended: false },
  ],
  // v1.3 §12.4, R50 — free time, five groups; the eight marked are *Recommended*.
  activity: [
    { title: "Walk", icon: emoji("🚶"), rangeMin: 20, rangeMax: 45, importance: 4, recommended: true, group: "move" },
    { title: "Run", icon: emoji("🏃"), rangeMin: 20, rangeMax: 45, importance: 4, recommended: false, group: "move" },
    { title: "Shoot hoops", icon: emoji("🏀"), rangeMin: 30, rangeMax: 60, importance: 4, recommended: false, group: "move" },
    { title: "Play a sport", icon: emoji("⚽"), rangeMin: 60, rangeMax: 120, importance: 4, recommended: true, group: "move" },
    { title: "Archery", icon: emoji("🏹"), rangeMin: 45, rangeMax: 90, importance: 4, recommended: false, group: "move" },
    { title: "Climb", icon: emoji("🧗"), rangeMin: 60, rangeMax: 120, importance: 4, recommended: false, group: "move" },
    { title: "Ride", icon: emoji("🚴"), rangeMin: 30, rangeMax: 90, importance: 4, recommended: false, group: "move" },
    { title: "Yoga", icon: emoji("🪷"), rangeMin: 20, rangeMax: 45, importance: 4, recommended: false, group: "move" },
    { title: "Draw", icon: emoji("✏️"), rangeMin: 30, rangeMax: 60, importance: 4, recommended: false, group: "make" },
    { title: "Write", icon: emoji("✒️"), rangeMin: 30, rangeMax: 60, importance: 4, recommended: false, group: "make" },
    { title: "Play music", icon: emoji("🎵"), rangeMin: 20, rangeMax: 60, importance: 4, recommended: false, group: "make" },
    { title: "Cook something new", icon: emoji("🍳"), rangeMin: 45, rangeMax: 90, importance: 4, recommended: true, group: "make" },
    { title: "Photograph", icon: emoji("📷"), rangeMin: 30, rangeMax: 90, importance: 4, recommended: false, group: "make" },
    { title: "Craft", icon: emoji("🧶"), rangeMin: 30, rangeMax: 90, importance: 4, recommended: false, group: "make" },
    { title: "Call someone", icon: emoji("📞"), rangeMin: 15, rangeMax: 45, importance: 4, recommended: true, group: "connect" },
    { title: "Dinner with people", icon: emoji("🍽️"), rangeMin: 60, rangeMax: 150, importance: 4, recommended: false, group: "connect" },
    { title: "Board games", icon: emoji("🎲"), rangeMin: 60, rangeMax: 120, importance: 4, recommended: true, group: "connect" },
    { title: "Chess", icon: emoji("♟️"), rangeMin: 30, rangeMax: 60, importance: 4, recommended: false, group: "connect" },
    { title: "Play with friends", icon: emoji("🎮"), rangeMin: 60, rangeMax: 120, importance: 4, recommended: false, group: "connect" },
    { title: "Read", icon: emoji("📖"), rangeMin: 30, rangeMax: 60, importance: 4, recommended: true, group: "rest" },
    { title: "A film", icon: emoji("🎬"), rangeMin: 90, rangeMax: 150, importance: 4, recommended: true, group: "rest" },
    { title: "A show", icon: emoji("📺"), rangeMin: 30, rangeMax: 60, importance: 4, recommended: false, group: "rest" },
    { title: "A podcast", icon: emoji("🎧"), rangeMin: 30, rangeMax: 60, importance: 4, recommended: false, group: "rest" },
    { title: "Bath", icon: emoji("🛁"), rangeMin: 20, rangeMax: 40, importance: 4, recommended: false, group: "rest" },
    { title: "Nap", icon: emoji("😴"), rangeMin: 20, rangeMax: 40, importance: 4, recommended: false, group: "rest" },
    { title: "A game", icon: emoji("🎮"), rangeMin: 30, rangeMax: 90, importance: 4, recommended: false, group: "rest" },
    { title: "Meditate", icon: emoji("🧘"), rangeMin: 10, rangeMax: 20, importance: 4, recommended: false, group: "rest" },
    { title: "Chores", icon: emoji("🧺"), rangeMin: 20, rangeMax: 60, importance: 4, recommended: false, group: "tend" },
    { title: "Errands", icon: emoji("🛒"), rangeMin: 30, rangeMax: 90, importance: 4, recommended: false, group: "tend" },
    { title: "Garden", icon: emoji("🌱"), rangeMin: 30, rangeMax: 60, importance: 4, recommended: true, group: "tend" },
    { title: "Tidy", icon: emoji("🧹"), rangeMin: 15, rangeMax: 45, importance: 4, recommended: false, group: "tend" },
    { title: "Fix something", icon: emoji("🔧"), rangeMin: 30, rangeMax: 90, importance: 4, recommended: false, group: "tend" },
  ],
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
