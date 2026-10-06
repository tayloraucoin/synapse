import * as React from "react";

/**
 * useCardEntries — one ordered list of setup cards that never remounts
 * (UX v1.3 §10.2 *"the card never remounts on its first write"*; T10.1,
 * T10.2; DAY-2).
 *
 * THE DEFECT IT REPLACES. The lists kept drafts apart from rows: a draft
 * card was keyed `draft-N` until the refetch carried its row, then the
 * draft was dropped and the row's card mounted keyed by its id — collapsed,
 * rebuilt from the server row (where an empty *Usual days* read as
 * *Flexible*). Under a slow network the person watched their open card
 * close and forget what they had chosen.
 *
 * ONE ENTRY PER CARD, ONE KEY FOR ITS LIFE. Rows the screen did not create
 * are keyed by their id, in the order the list returns them. A card added
 * here is keyed by its draft key for the life of the screen: when its
 * create lands (`created(key, id)`), the entry's row becomes the row — or
 * the seed the card handed back, until the refetch carries it — and the key
 * stays, so React keeps the same instance and the card's own state. Added
 * cards follow the rows, in the order they were added.
 *
 * A REMOVED CARD STAYS GONE. `removed(key)` hides its row id too, so a
 * refetch still in flight cannot bring it back as a new card for a frame.
 */
export interface CardEntry<Row, Seed = Row> {
  /** React's key and the card's `data-draft` — stable for the card's life. */
  key: string;
  /** The row, the seed a create handed back before the refetch, or nothing yet. */
  row: Row | Seed | null;
  /** Added on this screen (opens on mount); a row the list already had does not. */
  added: boolean;
}

type Added<Seed> = { key: string; id: string | null; seed: Seed | null };

export function useCardEntries<Row extends { id: string }, Seed extends { id: string } = Row>(
  rows: readonly Row[],
) {
  const [added, setAdded] = React.useState<Added<Seed>[]>([]);
  const [hidden, setHidden] = React.useState<ReadonlySet<string>>(new Set());
  const next = React.useRef(0);
  const addedRef = React.useRef(added);
  addedRef.current = added;

  const entries = React.useMemo<CardEntry<Row, Seed>[]>(() => {
    const claimed = new Set(added.flatMap((entry) => (entry.id === null ? [] : [entry.id])));
    const byId = new Map(rows.map((row) => [row.id, row]));
    return [
      ...rows
        .filter((row) => !claimed.has(row.id) && !hidden.has(row.id))
        .map((row) => ({ key: row.id, row, added: false })),
      ...added.map((entry) => ({
        key: entry.key,
        row: (entry.id === null ? null : byId.get(entry.id)) ?? entry.seed,
        added: true,
      })),
    ];
  }, [added, hidden, rows]);

  const add = React.useCallback(() => {
    const key = `draft-${next.current++}`;
    setAdded((current) => [...current, { key, id: null, seed: null }]);
  }, []);

  /** The card's create landed: the entry holds the row id; its key does not change. */
  const created = React.useCallback((key: string, id: string, seed: Seed | null = null) => {
    setAdded((current) => current.map((entry) => (entry.key === key ? { ...entry, id, seed } : entry)));
  }, []);

  /** The card is gone — discarded before a create, or archived after one. */
  const removed = React.useCallback((key: string) => {
    const entry = addedRef.current.find((candidate) => candidate.key === key);
    // A row the list already had is keyed by its id.
    const id = entry === undefined ? key : entry.id;
    if (id !== null) setHidden((ids) => new Set(ids).add(id));
    setAdded((current) => current.filter((candidate) => candidate.key !== key));
  }, []);

  /** Added cards whose create has not landed — open, not yet a row. */
  const pending = added.filter((entry) => entry.id === null).length;

  return { entries, add, created, removed, pending };
}
