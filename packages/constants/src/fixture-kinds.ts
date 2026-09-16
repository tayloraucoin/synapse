/**
 * The fixture kinds — UX v1.2 §3.6, §4.4, §12.4 (R42). A kind is a label and
 * a default glyph and a default block; nothing in materialisation reads it.
 * The sheet opens on none selected — a vocabulary, never a suggestion.
 *
 * `key` spells `FixtureKind` in `@syn/types`; `@syn/db`'s `fixture_kind` enum
 * is checked against that union. `@syn/constants` may not import `@syn/types`,
 * so the tuple carries the literals itself.
 *
 * On the emoji lint rule's exception list for `icon.value` positions only.
 */

import type { BlockKindValue } from "./block-kinds";
import type { EmojiIcon } from "./starter-library";

export type FixtureKindEntry = {
  readonly key:
    | "meeting"
    | "appointment"
    | "class"
    | "event"
    | "social"
    | "chore"
    | "other";
  readonly title: string;
  readonly icon: EmojiIcon;
  /** *Meeting · Appointment* → work; the rest → the evening (`activity`). */
  readonly defaultBlockKind: Extract<BlockKindValue, "work" | "activity">;
};

const emoji = (value: string): EmojiIcon => ({ kind: "emoji", value });

export const FIXTURE_KINDS: ReadonlyArray<FixtureKindEntry> = [
  { key: "meeting", title: "Meeting", icon: emoji("🗣️"), defaultBlockKind: "work" },
  { key: "appointment", title: "Appointment", icon: emoji("📌"), defaultBlockKind: "work" },
  { key: "class", title: "Class", icon: emoji("🎓"), defaultBlockKind: "activity" },
  { key: "event", title: "Event", icon: emoji("🎟️"), defaultBlockKind: "activity" },
  { key: "social", title: "Social", icon: emoji("🍽️"), defaultBlockKind: "activity" },
  { key: "chore", title: "Chore", icon: emoji("🧺"), defaultBlockKind: "activity" },
  { key: "other", title: "Other", icon: emoji("📍"), defaultBlockKind: "activity" },
] as const;

export type FixtureKindValue = (typeof FIXTURE_KINDS)[number]["key"];

/** The glyph and block a kind implies — the service's default when the sheet sends none. */
export function fixtureKindDefaults(kind: FixtureKindValue): FixtureKindEntry {
  return FIXTURE_KINDS.find((entry) => entry.key === kind) ?? FIXTURE_KINDS[FIXTURE_KINDS.length - 1]!;
}
