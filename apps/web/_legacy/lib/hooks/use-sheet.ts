"use client";

import { parseAsString, useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";

/**
 * A sheet is URL state (cross-cutting §1.3).
 *
 * WHY THE URL AND NOT `useState`. Back must close a sheet before it leaves the
 * screen. With the sheet in the query string and `history: "push"`, the
 * browser's own back button does that for free — on Android's system back too,
 * which no amount of React state would reach. It also makes a sheet
 * shareable and restorable, which is what `/day/{date}/item/{id}` needs.
 *
 * `?sheet=item&id=abc` — one sheet open at a time per route, which is the
 * document's rule (§1.2: sheets never stack).
 */
export type SheetState = {
  open: boolean;
  /** The record the sheet is about, when it has one. */
  id: string | null;
  openWith: (id?: string) => void;
  close: () => void;
};

export function useSheet(name: string): SheetState {
  const [state, setState] = useQueryStates(
    { sheet: parseAsString, id: parseAsString },
    // Push, not replace: a replaced entry is one back cannot pop.
    { history: "push" },
  );

  const open = state.sheet === name;

  const openWith = useCallback(
    (id?: string) => {
      void setState({ sheet: name, id: id ?? null });
    },
    [name, setState],
  );

  const close = useCallback(() => {
    void setState({ sheet: null, id: null });
  }, [setState]);

  return useMemo(
    () => ({ open, id: open ? state.id : null, openWith, close }),
    [open, state.id, openWith, close],
  );
}
