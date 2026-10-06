/**
 * The glyphs of the rows the app places for the person — UX v1.2 §7.1, §12.4
 * (S10.6): *Phone away* (the devices-off pin), *Lights out*, and *A few lines*
 * (the journal closer). They are the person's two evening times and their
 * journal, which is why they carry a glyph under R29; fixed, not editable.
 * The wind-down starter rows for the journal and the phone carry the same two,
 * so the Today tab reads one vocabulary.
 *
 * On the emoji lint rule's exception list for `icon.value` positions only.
 */

import type { EmojiIcon } from "./starter-library";

const emoji = (value: string): EmojiIcon => ({ kind: "emoji", value });

export const PLACED_ROW_ICONS = {
  devicesOff: emoji("📵"),
  lightsOut: emoji("🌙"),
  journal: emoji("✍️"),
} as const satisfies Record<string, EmojiIcon>;

export type PlacedRowKey = keyof typeof PLACED_ROW_ICONS;
