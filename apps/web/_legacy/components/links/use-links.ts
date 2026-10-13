"use client";

import * as React from "react";

import type { LinkView } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

/**
 * The person's links — UX v1.3 R53, §3.17, TD-28 (DAY-10), on DAY-5's
 * `link.*`.
 *
 * A LINK'S KIND IS THE SERVER'S: the sheet sends a title and a URL and the
 * service derives and stores the kind from the host; this hook never sets
 * one. NOTHING IS FETCHED from the link itself — no title, no artwork.
 *
 * *Remove* archives at once and the row leaves the list; the list refetches
 * after every write so the order and the kinds are the server's.
 */
export function useLinks() {
  const utils = trpc.useUtils();
  const list = trpc.link.list.useQuery(undefined);
  const save = trpc.link.save.useMutation();
  const archive = trpc.link.archive.useMutation();
  const [hidden, setHidden] = React.useState<ReadonlySet<string>>(new Set());

  const rows: LinkView[] = React.useMemo(
    () => (list.data ?? []).filter((row) => !hidden.has(row.id)),
    [list.data, hidden],
  );

  const refresh = React.useCallback(async () => {
    await utils.link.list.invalidate();
  }, [utils]);

  const onSave = React.useCallback(
    async (input: { id?: string; title: string; url: string }) => {
      await save.mutateAsync(input);
      await refresh();
    },
    [save, refresh],
  );

  /** Optimistic: the row leaves on the tap; a refusal brings it back. */
  const onRemove = React.useCallback(
    async (row: LinkView) => {
      setHidden((current) => new Set(current).add(row.id));
      try {
        await archive.mutateAsync({ id: row.id });
        await refresh();
      } finally {
        setHidden((current) => {
          const next = new Set(current);
          next.delete(row.id);
          return next;
        });
      }
    },
    [archive, refresh],
  );

  return { rows, loading: list.isLoading, onSave, onRemove, saving: save.isPending };
}
