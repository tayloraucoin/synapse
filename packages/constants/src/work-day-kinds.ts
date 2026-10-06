/**
 * The work-day kinds — UX v1.2 §3.8, §4.3, §12.4 (R32, TD-14). Picking one on
 * a work-day type card fills the type's name and glyph when they are empty;
 * *Other* fills neither. `key` spells `WorkDayKind` in `@syn/types`.
 *
 * On the emoji lint rule's exception list for `icon.value` positions only.
 */

import type { EmojiIcon } from "./starter-library";

export type WorkDayKindEntry = {
  readonly key: "remote" | "coworking" | "office" | "other";
  readonly title: string;
  readonly icon: EmojiIcon;
};

const emoji = (value: string): EmojiIcon => ({ kind: "emoji", value });

export const WORK_DAY_KINDS: ReadonlyArray<WorkDayKindEntry> = [
  { key: "remote", title: "Remote", icon: emoji("🏠") },
  { key: "coworking", title: "Coworking", icon: emoji("☕") },
  { key: "office", title: "Office or site", icon: emoji("🏢") },
  { key: "other", title: "Other", icon: emoji("💼") },
] as const;

export type WorkDayKindValue = (typeof WORK_DAY_KINDS)[number]["key"];
