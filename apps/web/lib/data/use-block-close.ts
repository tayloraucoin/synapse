"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  closesWithCard,
  undoLater as undoLaterWrite,
  writeLater,
  type CloseItem,
  type NowClosing,
} from "./block-close";
import { useDataSource } from "./source";
import { useBlockFocus } from "./use-block-focus";
import { todayQueryKey } from "./use-today";
import { todosQueryKey } from "./use-todos";

/**
 * The blocks closed with items left on a date, and the close card up
 * (USE-25). Nothing in 0012 records a close: it lives as USE-20's focus
 * does, per device for as long as the day's data source, so the card does
 * not come back on reload and `activeBlock` reads the block as no longer
 * holding the screen.
 */
export interface BlockCloseCard {
  blockId: string;
  /** The "Not done: …" disclosure. */
  open: boolean;
  /** The card's own list once acted on; null reads the records' (a seed). */
  items: CloseItem[] | null;
  /** From `?state=`: the last block's pause holds, so a capture holds still. */
  seeded: boolean;
}

export interface BlockCloseState {
  closed: readonly string[];
  card: BlockCloseCard | null;
}

const EMPTY: BlockCloseState = { closed: [], card: null };
const states = new Map<string, BlockCloseState>();
const listeners = new Set<() => void>();

function put(key: string, next: BlockCloseState) {
  states.set(key, next);
  listeners.forEach((listener) => listener());
}

/** A scenario's `view.open`: "close:<block id>" or "close-open:<block id>". */
export function closeSeed(open: string | undefined): BlockCloseCard | null {
  for (const [prefix, expanded] of [
    ["close:", false],
    ["close-open:", true],
  ] as const) {
    if (open?.startsWith(prefix)) {
      return {
        blockId: open.slice(prefix.length),
        open: expanded,
        items: null,
        seeded: true,
      };
    }
  }
  return null;
}

export function useBlockClose(
  dateKey: string,
  seed: BlockCloseCard | null = null,
) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const blockFocus = useBlockFocus(dateKey);
  const key = `${source.scenario.name}:${dateKey}`;
  if (!states.has(key) && seed !== null) {
    states.set(key, { closed: [seed.blockId], card: seed });
  }

  const state = React.useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => states.get(key) ?? EMPTY,
    // The seed is already stored above, so both snapshots read the store.
    () => states.get(key) ?? EMPTY,
  );

  const current = () => states.get(key) ?? EMPTY;

  /** One item of the card changed; a seeded list is taken from `closing`. */
  function setItem(
    closing: NowClosing,
    id: string,
    change: Partial<CloseItem>,
  ) {
    const { card } = current();
    if (card === null) return;
    const items = (card.items ?? closing.left).map((item) =>
      item.id === id ? { ...item, ...change } : item,
    );
    put(key, { ...current(), card: { ...card, items } });
  }

  async function settle() {
    await queryClient.invalidateQueries({
      queryKey: todayQueryKey(source.scenario.name),
    });
    await queryClient.invalidateQueries({
      queryKey: todosQueryKey(source.scenario.name),
    });
  }

  return {
    state,
    /** The card's list: its own once acted on, else the records'. */
    itemsOf: (closing: NowClosing) => state.card?.items ?? closing.left,
    /**
     * Complete <Block> (USE-17's menu): the card, unless every item is
     * done, when USE-20's footer already stands. True when the card shows.
     */
    complete(
      blockId: string,
      items: readonly (Pick<CloseItem, "id" | "title" | "row"> & {
        done: boolean;
      })[],
    ): boolean {
      if (!closesWithCard(items)) return false;
      const left = items
        .filter((item) => !item.done)
        .map((item): CloseItem => ({
          id: item.id,
          title: item.title,
          state: "left",
          movedTo: null,
          undo: null,
          row: item.row,
        }));
      const { closed } = current();
      put(key, {
        closed: closed.includes(blockId) ? closed : [...closed, blockId],
        card: { blockId, open: false, items: left, seeded: false },
      });
      return true;
    },
    toggle(open: boolean) {
      const { card } = current();
      if (card) put(key, { ...current(), card: { ...card, open } });
    },
    /** Later (D-USE-70): one slot at the end of the target, today only. */
    async later(item: CloseItem, closing: NowClosing) {
      if (closing.later === null) return;
      const undo = await writeLater(
        source.server,
        dateKey,
        closing.block.id,
        item.row,
        closing.later,
      );
      setItem(closing, item.id, {
        state: "moved",
        movedTo: closing.later.blockName,
        undo,
      });
      await settle();
    },
    /** Undo: back in its block exactly, not done; the slot Later wrote goes. */
    async undoLater(item: CloseItem, closing: NowClosing) {
      if (item.undo === null) return;
      await undoLaterWrite(source.server, item.undo);
      setItem(closing, item.id, { state: "left", movedTo: null, undo: null });
      await settle();
    },
    /** Leave: nothing is written; the row leaves the list. */
    leave(item: CloseItem, closing: NowClosing) {
      setItem(closing, item.id, { state: "leave" });
    },
    /**
     * × or Start <next>: the card goes and the next block is in focus
     * (USE-20's rule); after the last block, none, and Now is empty.
     */
    close(nextId: string | null) {
      put(key, { ...current(), card: null });
      if (nextId === null) blockFocus.endBreak(null);
      else blockFocus.start(nextId);
    },
  };
}
