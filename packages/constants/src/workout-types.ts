/**
 * The curated workout types — UX v1.2 §4.10, §12.4. A type is a label: picking
 * one fills the workout's name and glyph when they are empty (R29 — the glyph
 * becomes `habits.icon`), and `habits.workout_type` stores the key so the list
 * can grow without a migration (TD-11's reasoning applied to a label).
 *
 * This file is on the emoji lint rule's exception list for `icon.value`
 * positions only (`packages/config/eslint/no-emoji.js`).
 */

import type { EmojiIcon } from "./starter-library";

export type WorkoutTypeEntry = {
  readonly key: string;
  readonly title: string;
  readonly icon: EmojiIcon;
};

const emoji = (value: string): EmojiIcon => ({ kind: "emoji", value });

export const WORKOUT_TYPES: ReadonlyArray<WorkoutTypeEntry> = [
  { key: "upper_body", title: "Upper body", icon: emoji("🏋️") },
  { key: "lower_body", title: "Lower body", icon: emoji("🦵") },
  { key: "full_body", title: "Full body", icon: emoji("🏋️‍♀️") },
  { key: "core", title: "Core", icon: emoji("🎽") },
  { key: "hiit", title: "HIIT", icon: emoji("⚡") },
  { key: "yoga", title: "Yoga", icon: emoji("🪷") },
  { key: "cardio", title: "Cardio", icon: emoji("🚴") },
  { key: "sport", title: "Sport", icon: emoji("⚽") },
  { key: "swim", title: "Swim", icon: emoji("🏊") },
  { key: "mobility", title: "Mobility", icon: emoji("🤸") },
  { key: "climb", title: "Climb", icon: emoji("🧗") },
  { key: "hike", title: "Hike", icon: emoji("🥾") },
  /** *Other* fills nothing — the person names it. */
  { key: "other", title: "Other", icon: emoji("💪") },
] as const;

export type WorkoutTypeKey = (typeof WORKOUT_TYPES)[number]["key"];
