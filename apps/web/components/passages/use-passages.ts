"use client";

import * as React from "react";

import type { PassageView } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

/**
 * The passage list's behaviour — UX v1.2 §4.6 (RUN-9).
 *
 * THE LIST WRITES AT ONCE (§4, R30): a reorder is `passage.reorder` the
 * moment the row lands; an archive is `passage.archive` the moment the menu
 * says so, with a five-second inline undo that calls `passage.restore`. The
 * sheet is the one place a write waits for *Save* — a half-written passage
 * is not a fact.
 *
 * THE ORDER IS OPTIMISTIC: the rows re-sort on the drop and the list refetches
 * behind; a refused reorder puts the server's order back.
 */

export const UNDO_MS = 5000;

export function usePassages() {
  const utils = trpc.useUtils();
  const list = trpc.passage.list.useQuery();
  const reorder = trpc.passage.reorder.useMutation();
  const archive = trpc.passage.archive.useMutation();
  const restore = trpc.passage.restore.useMutation();

  const [localOrder, setLocalOrder] = React.useState<string[] | null>(null);
  const [archived, setArchived] = React.useState<PassageView | null>(null);
  const undoTimer = React.useRef<number | null>(null);

  const rows = React.useMemo(() => {
    const data = list.data ?? [];
    if (localOrder === null) return data;
    const byId = new Map(data.map((row) => [row.id, row]));
    const ordered = localOrder.map((id) => byId.get(id)).filter((row): row is PassageView => row !== undefined);
    for (const row of data) if (!localOrder.includes(row.id)) ordered.push(row);
    return ordered;
  }, [list.data, localOrder]);

  const refresh = React.useCallback(() => utils.passage.list.invalidate(), [utils]);

  const onReorder = React.useCallback(
    async (ids: string[]) => {
      setLocalOrder(ids);
      try {
        await reorder.mutateAsync({ ids });
      } catch {
        // The server's order stands.
      } finally {
        await refresh();
        setLocalOrder(null);
      }
    },
    [refresh, reorder],
  );

  const onArchive = React.useCallback(
    async (row: PassageView) => {
      if (undoTimer.current !== null) window.clearTimeout(undoTimer.current);
      setArchived(row);
      try {
        await archive.mutateAsync({ id: row.id });
        await refresh();
      } catch {
        setArchived(null);
        return;
      }
      undoTimer.current = window.setTimeout(() => {
        undoTimer.current = null;
        setArchived(null);
      }, UNDO_MS);
    },
    [archive, refresh],
  );

  const onUndo = React.useCallback(async () => {
    const row = archived;
    if (row === null) return;
    if (undoTimer.current !== null) window.clearTimeout(undoTimer.current);
    undoTimer.current = null;
    setArchived(null);
    try {
      await restore.mutateAsync({ id: row.id });
    } finally {
      await refresh();
    }
  }, [archived, refresh, restore]);

  React.useEffect(
    () => () => {
      if (undoTimer.current !== null) window.clearTimeout(undoTimer.current);
    },
    [],
  );

  return {
    rows,
    loading: list.isLoading,
    refresh,
    onReorder,
    onArchive,
    onUndo,
    /** The row whose undo line is showing, or null. */
    archived,
  };
}
