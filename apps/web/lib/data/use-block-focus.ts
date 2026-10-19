"use client";

import * as React from "react";
import type { NowFocus } from "@syn/utils";
import { useDataSource } from "./source";

/**
 * The block put in focus early on a date (USE-20): Start <Block> on the
 * all-done footer, or End break. Nothing in 0012 records it. It lives as
 * long as the day's data source does, as `useChosenItem`'s item does
 * [ASSUMPTION: the contract names device storage for the day; while every
 * source is a fixture, whose writes go with a reload, a stored focus would
 * outlive the rows it was started from and break a `?state=` capture. The
 * blocks-and-days wiring gives it a home, on the device or the server].
 */

const focuses = new Map<string, NowFocus | null>();
const listeners = new Set<() => void>();

export function useBlockFocus(dateKey: string) {
  const source = useDataSource();
  const key = `${source.scenario.name}:${dateKey}`;

  const focus = React.useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => focuses.get(key) ?? null,
    () => null,
  );

  const write = React.useCallback(
    (blockId: string | null) => {
      focuses.set(key, { blockId, at: source.now() });
      listeners.forEach((listener) => listener());
    },
    [key, source],
  );

  return {
    focus,
    /** Start <Block>: that block from now until its own end. */
    start: React.useCallback((blockId: string) => write(blockId), [write]),
    /** End break: the next block, or none when nothing follows. */
    endBreak: React.useCallback(
      (nextId: string | null) => write(nextId),
      [write],
    ),
  };
}
