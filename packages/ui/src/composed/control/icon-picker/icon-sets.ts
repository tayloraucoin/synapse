/**
 * The icon picker's two sets (USE-11), loaded when the picker opens and kept
 * for the life of the page.
 *
 * EMOJI: Emojibase's compact English data, from our own origin (the same
 * self-hosted copy `EmojiPicker` reads, staged by `yarn emoji-data`), so the
 * keywords Suggested and search match on are on the device and no request
 * leaves the origin.
 *
 * ICONS: every Lucide icon. The drawings come from `lucide-react`'s `icons`
 * map in one lazy chunk of our own bundle; the groups and keywords come from
 * `lucide-meta.json`, written at the pinned version by
 * `scripts/build-lucide-meta.mjs`. One chunk rather than `lucide-react/dynamic`'s
 * chunk per icon, so typing a search fetches nothing (C6).
 */
import type { LucideIcon } from "lucide-react";

export interface PickerEntry {
  /** The emoji's character, or the Lucide icon's name. */
  id: string;
  /** The accessible name: an emoji's label, an icon's name in words. */
  label: string;
  keywords: readonly string[];
  /** An emoji's skin tones, offered on a long press. */
  skins?: readonly { id: string; label: string }[];
}

export interface PickerGroup {
  id: string;
  title: string;
  entries: readonly PickerEntry[];
}

export interface EmojiSet {
  kind: "emoji";
  groups: readonly PickerGroup[];
  /** Every emoji and skin, by its character with no variation selector. */
  byId: ReadonlyMap<string, PickerEntry>;
}

export interface IconSet {
  kind: "icon";
  version: string;
  groups: readonly (PickerGroup & { icon: string })[];
  byId: ReadonlyMap<string, PickerEntry>;
  draw: (name: string) => LucideIcon | undefined;
}

/** Emojibase's group numbers, in the app's words; 2 (skin components) is not offered. */
const EMOJI_GROUPS: readonly [number, string, string][] = [
  [0, "smileys-emotion", "Smileys"],
  [1, "people-body", "People"],
  [3, "animals-nature", "Animals and nature"],
  [4, "food-drink", "Food and drink"],
  [5, "travel-places", "Travel and places"],
  [6, "activities", "Activities"],
  [7, "objects", "Objects"],
  [8, "symbols", "Symbols"],
  [9, "flags", "Flags"],
];

/** An emoji's identity, with the variation selector that some keyboards add. */
export function emojiKey(text: string): string {
  return text.replace(/️/g, "");
}

interface CompactEmoji {
  group?: number;
  label: string;
  tags?: string[];
  unicode: string;
  skins?: { label: string; unicode: string }[];
}

let emojiLoad: Promise<EmojiSet> | null = null;

export function loadEmojiSet(dataUrl: string): Promise<EmojiSet> {
  emojiLoad ??= fetch(`${dataUrl}/compact.json`)
    .then((response) => {
      if (!response.ok) throw new Error(`Emoji data: ${response.status}`);
      return response.json() as Promise<CompactEmoji[]>;
    })
    .then((rows) => {
      const byId = new Map<string, PickerEntry>();
      const buckets = new Map<number, PickerEntry[]>();
      for (const row of rows) {
        if (row.group === undefined) continue;
        const entry: PickerEntry = {
          id: row.unicode,
          label: row.label,
          keywords: [row.label, ...(row.tags ?? [])],
          skins: row.skins?.map((skin) => ({
            id: skin.unicode,
            label: skin.label,
          })),
        };
        byId.set(emojiKey(entry.id), entry);
        for (const skin of row.skins ?? []) {
          byId.set(emojiKey(skin.unicode), {
            id: skin.unicode,
            label: skin.label,
            keywords: entry.keywords,
          });
        }
        buckets.set(row.group, [...(buckets.get(row.group) ?? []), entry]);
      }
      const groups = EMOJI_GROUPS.map(([n, id, title]) => ({
        id,
        title,
        entries: buckets.get(n) ?? [],
      }));
      return { kind: "emoji" as const, groups, byId };
    })
    .catch((error: unknown) => {
      emojiLoad = null;
      throw error;
    });
  return emojiLoad;
}

interface LucideMeta {
  version: string;
  categories: { id: string; title: string; icon: string }[];
  icons: { n: string; g: string; t: string[] }[];
}

/** `arrow-up-0-1` to `ArrowUp01`, the key `lucide-react` exports it under. */
function pascal(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

let iconLoad: Promise<IconSet> | null = null;

export function loadIconSet(): Promise<IconSet> {
  iconLoad ??= Promise.all([
    import("./lucide-meta.json").then(
      (module) => (module.default ?? module) as LucideMeta,
    ),
    import("lucide-react").then((module) => module.icons),
  ])
    .then(([meta, icons]) => {
      const drawings = icons as unknown as Record<string, LucideIcon>;
      const draw = (name: string) => drawings[pascal(name)];
      const byId = new Map<string, PickerEntry>();
      const buckets = new Map<string, PickerEntry[]>();
      for (const icon of meta.icons) {
        if (!draw(icon.n)) continue;
        const entry: PickerEntry = {
          id: icon.n,
          label: icon.n.replace(/-/g, " "),
          keywords: [icon.n.replace(/-/g, " "), ...icon.t],
        };
        byId.set(entry.id, entry);
        buckets.set(icon.g, [...(buckets.get(icon.g) ?? []), entry]);
      }
      const groups = meta.categories
        .map((category) => ({
          id: category.id,
          title: category.title,
          icon: category.icon,
          entries: buckets.get(category.id) ?? [],
        }))
        .filter((group) => group.entries.length > 0);
      return {
        kind: "icon" as const,
        version: meta.version,
        groups,
        byId,
        draw,
      };
    })
    .catch((error: unknown) => {
      iconLoad = null;
      throw error;
    });
  return iconLoad;
}

/** "Everyday": the curated emoji, three rows of eight (the boards). */
export const EVERYDAY_EMOJI = [
  "🧗",
  "🚴",
  "🏊",
  "🤸",
  "🏃",
  "🧘",
  "🧗‍♀️",
  "🎾",
  "🎨",
  "🎸",
  "📚",
  "✍️",
  "🎧",
  "🧩",
  "🌱",
  "☕",
  "🧹",
  "🧺",
  "🛒",
  "💻",
  "📝",
  "🛏️",
  "🌙",
  "☀️",
] as const;

/** "Everyday": the shortlist of icons, two rows of eight (the boards). */
export const EVERYDAY_ICONS = [
  "sun",
  "moon",
  "droplet",
  "leaf",
  "heart",
  "droplets",
  "book-open",
  "coffee",
  "dumbbell",
  "bike",
  "bed",
  "house",
  "smartphone",
  "shopping-cart",
  "laptop",
  "clock",
] as const;

/** Search, on the device: every word of the query begins one of the entry's words. */
export function searchEntries(
  entries: Iterable<PickerEntry>,
  query: string,
): PickerEntry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const found: PickerEntry[] = [];
  for (const entry of entries) {
    const terms = entry.keywords.flatMap((k) =>
      k.toLowerCase().split(/[\s-]+/),
    );
    if (words.every((word) => terms.some((term) => term.startsWith(word)))) {
      found.push(entry);
    }
  }
  return found;
}
