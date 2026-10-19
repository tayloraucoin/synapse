"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SavedColourRecord } from "@syn/validators";
import type { FixtureServer } from "@/lib/fixtures/server";
import { useDataSource } from "./source";

/**
 * Saved colours (USE-11; D-USE-36): custom colours kept for reuse, newest
 * first. On the fixture server's `listSavedColours`, `writeSavedColour` and
 * `removeSavedColour` now, the routers in wave 3. The cascade to icons
 * already in a colour is the wiring's (wave 3), not this hook's.
 */

export function savedColoursQueryKey(scenario: string) {
  return ["saved-colours", scenario] as const;
}

type SavedColourServer = Pick<
  FixtureServer,
  "listSavedColours" | "writeSavedColour" | "removeSavedColour"
>;

/** The writes, apart from React so they can be proved against the server. */
export function savedColourActions(server: SavedColourServer) {
  return {
    /** A new colour goes first: one past the highest `sortOrder`. */
    async add(hex: string): Promise<SavedColourRecord> {
      const rows = await server.listSavedColours();
      const top = rows.reduce((max, row) => Math.max(max, row.sortOrder), -1);
      return server.writeSavedColour({ hex, sortOrder: top + 1 });
    },
    /** A new hex for a saved colour; its place in the row stays. */
    async update(id: string, hex: string): Promise<SavedColourRecord> {
      const rows = await server.listSavedColours();
      const row = rows.find((r) => r.id === id);
      return server.writeSavedColour({
        id,
        hex,
        sortOrder: row?.sortOrder ?? 0,
      });
    },
    /** Removes it and hands back the row, so Undo can put it back in place. */
    async remove(id: string): Promise<SavedColourRecord | undefined> {
      const rows = await server.listSavedColours();
      await server.removeSavedColour(id);
      return rows.find((r) => r.id === id);
    },
    /** Undo of a remove: the same hex, at the same place. */
    restore(row: SavedColourRecord): Promise<SavedColourRecord> {
      return server.writeSavedColour({
        hex: row.hex,
        sortOrder: row.sortOrder,
      });
    },
  };
}

export function useSavedColours() {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const queryKey = savedColoursQueryKey(source.scenario.name);
  const query = useQuery({
    queryKey,
    queryFn: () => source.server.listSavedColours(),
  });
  const actions = savedColourActions(source.server);
  const onSettled = () => queryClient.invalidateQueries({ queryKey });

  const add = useMutation({ mutationFn: actions.add, onSettled });
  const update = useMutation({
    mutationFn: ({ id, hex }: { id: string; hex: string }) =>
      actions.update(id, hex),
    onSettled,
  });
  const remove = useMutation({ mutationFn: actions.remove, onSettled });
  const restore = useMutation({ mutationFn: actions.restore, onSettled });

  return { query, add, update, remove, restore };
}
