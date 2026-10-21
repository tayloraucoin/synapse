/**
 * Suggested items (USE-155; D-USE-135, D-USE-136, dev note "Suggested
 * items"): what a block's kind offers under its add row, and what Swap's
 * library lists. Derived on read; nothing is stored.
 *
 * Structural on purpose: `@syn/utils` never imports `@syn/validators` or
 * `@syn/types`, so the records are spelled by the fields read here.
 */

/** A block, as far as its kind. */
export interface UsedBeforeBlock {
  id: string;
  kind: string;
}

/** A block item, as far as the list reads it. */
export interface UsedBeforeItem<TIcon> {
  id: string;
  blockId: string;
  title: string;
  icon: TIcon | null;
  lengthMin: number | null;
  isTransition: boolean;
  meal: boolean;
  onDate: string | null;
  /** When it last changed: the latest one per title gives the length. */
  updatedAt?: string;
}

export interface UsedBeforeOptions {
  /** Titles already in this block; they are not offered. */
  inBlock?: ReadonlyArray<string>;
  /**
   * A date: an item dated to another day is left out. Omitted, dated items
   * count as used before like any other.
   */
  date?: string;
}

/** One title, case-insensitive: "Walk" and "walk " are one item. */
export function titleKey(title: string): string {
  return title.trim().toLowerCase();
}

/**
 * Every item in any block of `kind`, one per title (case-insensitive), with
 * the icon and length of the one changed last; transitions and meals left
 * out, and anything whose title is in `inBlock`. On equal or missing
 * `updatedAt` the first in the records' order wins, so the order is the
 * records' order of each title's first item.
 */
export function usedBefore<TIcon, TItem extends UsedBeforeItem<TIcon>>(
  records: {
    blocks: ReadonlyArray<UsedBeforeBlock>;
    blockItems: ReadonlyArray<TItem>;
  },
  kind: string,
  options: UsedBeforeOptions = {},
): TItem[] {
  const blocks = new Set(
    records.blocks.filter((block) => block.kind === kind).map((b) => b.id),
  );
  const here = new Set((options.inBlock ?? []).map(titleKey));
  const order: string[] = [];
  const latest = new Map<string, TItem>();
  for (const item of records.blockItems) {
    if (!blocks.has(item.blockId) || item.isTransition || item.meal) continue;
    if (options.date !== undefined && item.onDate !== null) {
      if (item.onDate !== options.date) continue;
    }
    const key = titleKey(item.title);
    if (key === "" || here.has(key)) continue;
    const seen = latest.get(key);
    if (!seen) {
      order.push(key);
      latest.set(key, item);
    } else if ((item.updatedAt ?? "") > (seen.updatedAt ?? "")) {
      latest.set(key, item);
    }
  }
  return order.map((key) => latest.get(key)!);
}

/** A seed row, structurally `StarterLibraryEntry`. */
export interface SuggestedSeedEntry<TIcon> {
  title: string;
  icon: TIcon;
  rangeMin: number;
}

/** One row of the suggestion list. */
export interface SuggestedRow<TIcon> {
  /** Stable within the list: the used item's id, or `seed:<title>`. */
  key: string;
  title: string;
  icon: TIcon | null;
  lengthMin: number;
}

export interface SuggestedItems<TIcon> {
  usedBefore: SuggestedRow<TIcon>[];
  seed: SuggestedRow<TIcon>[];
}

/**
 * The list under a block's add row: "Used before" first, then the kind's
 * seed with any title already used before, already in the block, or
 * repeated in the seed dropped. A used item with no length takes
 * `defaultLengthMin`.
 */
export function suggestedItems<TIcon>(input: {
  usedBefore: ReadonlyArray<{
    id: string;
    title: string;
    icon: TIcon | null;
    lengthMin: number | null;
  }>;
  seed: ReadonlyArray<SuggestedSeedEntry<TIcon>>;
  inBlock?: ReadonlyArray<string>;
  defaultLengthMin: number;
}): SuggestedItems<TIcon> {
  const taken = new Set((input.inBlock ?? []).map(titleKey));
  const used = input.usedBefore
    .filter((item) => !taken.has(titleKey(item.title)))
    .map(
      (item): SuggestedRow<TIcon> => ({
        key: item.id,
        title: item.title,
        icon: item.icon,
        lengthMin: item.lengthMin ?? input.defaultLengthMin,
      }),
    );
  for (const row of used) taken.add(titleKey(row.title));
  const seed: SuggestedRow<TIcon>[] = [];
  for (const entry of input.seed) {
    const key = titleKey(entry.title);
    if (taken.has(key)) continue;
    taken.add(key);
    seed.push({
      key: `seed:${entry.title}`,
      title: entry.title,
      icon: entry.icon,
      lengthMin: entry.rangeMin,
    });
  }
  return { usedBefore: used, seed };
}
