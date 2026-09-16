/**
 * The archetype cards' glyphs — UX v1.2 §4.1, §12.4. The one place a glyph
 * sits on the app's own copy (R29's stated exception): the four cards name
 * kinds of people, not the app. Keyed by `ScheduleShape` (`@syn/types`); the
 * names themselves stay in the setup screen's `copy.ts` as placeholders
 * (v1.1 §13 #12, P2-16) and change with the names.
 *
 * On the emoji lint rule's exception list for `icon.value` positions only.
 */

import type { EmojiIcon } from "./starter-library";

export type ScheduleShapeValue =
  | "own_structure_dynamic"
  | "consistent_shifts"
  | "varying_shifts"
  | "fluid";

const emoji = (value: string): EmojiIcon => ({ kind: "emoji", value });

export const SCHEDULE_SHAPE_ICONS: Record<ScheduleShapeValue, EmojiIcon> = {
  consistent_shifts: emoji("🗓️"),
  varying_shifts: emoji("🔁"),
  own_structure_dynamic: emoji("🧭"),
  fluid: emoji("🌊"),
};
