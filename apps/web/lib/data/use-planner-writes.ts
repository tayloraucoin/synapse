"use client";

import { useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BlockItemRecord } from "@syn/validators";
import type { PlannerServer, PlannerWrite } from "@/lib/fixtures/planner";
import type { SplitPatch } from "@/lib/fixtures/planner/split-block";
import type { FixtureServer } from "@/lib/fixtures/server";
import { offlineWrite } from "@/lib/offline/writes";
import { applyOptimistic } from "./optimistic-week";
import { FixtureOfflineError, PlannerRefusal } from "./refusals";
import { useDataSource } from "./source";
import { useConnection } from "./use-connection";
import { todayQueryKey } from "./use-today";
import { weekQueryKey } from "./use-week";
import type { WeekRecords } from "./week-records";

/**
 * The set-up area's writes (USE-36): every planner write through one queue
 * and one mutation, saved as made (C-USE-set-my-days-3) with one
 * `saveStatus` for the header. Offline (D-USE-82) the day's own writes are
 * refused at once; block and item writes wait and land in the order made.
 * The hook runs them through TanStack's one write scope (USE-106), found by
 * key, so a write made offline survives a reload; `createPlannerQueue` is the
 * order rule as its tests prove it, over a server.
 *
 * Writes are optimistic (USE-148): `onMutate` writes the change into every
 * cached week through `applyOptimistic`, an error puts each one back as it
 * was, and the server's answer settles them on every outcome.
 */

/**
 * What the queue sends: the planner's writes, and a To-dos block's two that
 * the planner server has no method for (USE-111): a to-do slot's order
 * (`writeSlots`) and New to-do with its slot (`writeTodoSlot`).
 */
export type QueuedServer = PlannerServer &
  Pick<FixtureServer, "writeSlots" | "writeTodoSlot">;

export type PlannerMethod = Exclude<keyof QueuedServer, "readWeek">;

export type PlannerCall = {
  [M in PlannerMethod]: { method: M; args: Parameters<QueuedServer[M]> };
}[PlannerMethod];

/** D-USE-82: the day's own controls (Up at, Lights out, the ···, the +). */
const DAY_WRITES = new Set<PlannerMethod>([
  "writeBounds",
  "createBlock",
  "writeDayEvent",
  "removeDayEvent",
  "copyDay",
  "copyBlock",
  "clearDay",
  "resetDay",
]);

export function isDayWrite(call: PlannerCall): boolean {
  if (call.method === "createTransition") {
    return call.args[0].placement === "between_blocks";
  }
  return DAY_WRITES.has(call.method);
}

/** A day's own write tried offline: the control is read-only until back. */
export class PlannerOfflineRefusal extends Error {
  constructor() {
    super("No connection. The day's own settings wait until it is back.");
    this.name = "PlannerOfflineRefusal";
  }
}

interface Waiting {
  call: PlannerCall;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}

export interface PlannerQueue {
  run(call: PlannerCall): Promise<unknown>;
  /** Back online sends what waits, in order; offline holds it. */
  setOnline(online: boolean): Promise<void>;
  waiting(): number;
}

/** The writes in the order made; one at a time, so they land in that order. */
export function createPlannerQueue(
  server: QueuedServer,
  online: boolean,
): PlannerQueue {
  let isOnline = online;
  let flushing: Promise<void> | null = null;
  const waiting: Waiting[] = [];

  function send(call: PlannerCall): Promise<unknown> {
    const method = server[call.method] as (
      ...args: unknown[]
    ) => Promise<unknown>;
    return method(...call.args);
  }

  async function drain() {
    while (isOnline && waiting.length > 0) {
      const head = waiting[0]!;
      try {
        const result = await send(head.call);
        waiting.shift();
        head.resolve(result);
      } catch (error) {
        // The connection went: it waits at the head, still first.
        if (error instanceof FixtureOfflineError) {
          isOnline = false;
          return;
        }
        waiting.shift();
        head.reject(error);
      }
    }
  }

  function flush(): Promise<void> {
    flushing ??= drain().finally(() => {
      flushing = null;
    });
    return flushing;
  }

  return {
    run(call) {
      if (!isOnline && isDayWrite(call)) {
        return Promise.reject(new PlannerOfflineRefusal());
      }
      const done = new Promise<unknown>((resolve, reject) => {
        waiting.push({ call, resolve, reject });
      });
      void flush();
      return done;
    },
    async setOnline(next) {
      isOnline = next;
      if (next) {
        await flushing;
        await flush();
      }
    },
    waiting: () => waiting.length,
  };
}

/** D-USE-81: a new item is 5 minutes, after the last in its block. */
export function nextItemInput({
  blockId,
  title,
  items,
  date,
}: {
  blockId: string;
  title: string;
  items: readonly Pick<BlockItemRecord, "sortOrder">[];
  date?: string;
}) {
  const last = items.reduce((top, item) => Math.max(top, item.sortOrder), -1);
  return {
    blockId,
    title,
    lengthMin: 5,
    sortOrder: last + 1,
    ...(date === undefined ? {} : { onDate: date }),
  };
}

export type SaveStatus = "idle" | "saving" | "saved" | "failed";

/** A refusal is the form's to show in the schema's words; it is not a failed save. */
function isRefusal(error: unknown): boolean {
  return (
    error instanceof PlannerRefusal || error instanceof PlannerOfflineRefusal
  );
}

/**
 * A change to a repeating block from a dated day (USE-47). A block change
 * holds times or a skip, so This one takes the times
 * [ASSUMPTION: a name or look for one date waits on USE-88's columns].
 */
export interface EditRepeating {
  id: string;
  date: string;
  patch: { startsAt: string; endsAt: string } & Omit<
    SplitPatch,
    "startsAt" | "endsAt"
  >;
  scope: "this" | "following" | "all";
}

/** The one write a scope answer sends. */
export function repeatingCall({
  id,
  date,
  patch,
  scope,
}: EditRepeating): PlannerCall {
  if (scope === "this") {
    return {
      method: "writeBlockChange",
      args: [
        {
          blockId: id,
          onDate: date,
          startsAt: patch.startsAt,
          endsAt: patch.endsAt,
        },
      ],
    };
  }
  if (scope === "following") {
    return { method: "splitBlock", args: [{ id, fromDate: date, patch }] };
  }
  return { method: "editBlock", args: [{ id, ...patch }] };
}

export function usePlannerWrites() {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const { online } = useConnection();
  const scenario = source.scenario.name;

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: weekQueryKey(scenario) });
    void queryClient.invalidateQueries({ queryKey: todayQueryKey(scenario) });
  }, [queryClient, scenario]);

  useEffect(() => {
    if (online) invalidate();
  }, [online, invalidate]);

  type Snapshot = [readonly unknown[], WeekRecords | undefined][];
  const mutation = useMutation<unknown, Error, PlannerCall, Snapshot>({
    ...offlineWrite("planner", scenario),
    onMutate: async (planned) => {
      const weeks = weekQueryKey(scenario);
      await queryClient.cancelQueries({ queryKey: weeks });
      const before = queryClient.getQueriesData<WeekRecords>({
        queryKey: weeks,
      });
      const now = source.now();
      for (const [key, week] of before) {
        if (week === undefined) continue;
        const next = applyOptimistic(planned, week, now);
        if (next !== null) queryClient.setQueryData(key, next);
      }
      return before;
    },
    onError: (_error, _planned, before) => {
      for (const [key, week] of before ?? []) {
        queryClient.setQueryData(key, week);
      }
    },
    onSettled: invalidate,
  });

  /** Offline, the day's own write is refused before it is made (D-USE-82). */
  function send(planned: PlannerCall): Promise<unknown> {
    if (!online && isDayWrite(planned)) {
      return Promise.reject(new PlannerOfflineRefusal());
    }
    return mutation.mutateAsync(planned);
  }

  function call<M extends PlannerMethod>(
    method: M,
    ...args: Parameters<QueuedServer[M]>
  ): ReturnType<QueuedServer[M]> {
    return send({ method, args } as PlannerCall) as ReturnType<QueuedServer[M]>;
  }

  const saveStatus: SaveStatus = mutation.isPending
    ? "saving"
    : mutation.isError
      ? isRefusal(mutation.error)
        ? "idle"
        : "failed"
      : mutation.isSuccess
        ? "saved"
        : "idle";

  /** The failed write again, as it was made. */
  function retry(): Promise<unknown> | undefined {
    if (!mutation.isError || mutation.variables === undefined) return undefined;
    return send(mutation.variables);
  }

  type Args<M extends PlannerMethod> = Parameters<QueuedServer[M]>;
  const write =
    <M extends PlannerMethod>(method: M) =>
    (...args: Args<M>) =>
      call(method, ...args);

  return {
    writeBounds: write("writeBounds"),
    createBlock: write("createBlock"),
    createTransition: write("createTransition"),
    editBlock: write("editBlock"),
    writeBlockChange: write("writeBlockChange"),
    splitBlock: write("splitBlock"),
    /**
     * A repeating block changed from a dated day, at the scope RepeatScope
     * asked (USE-47): This one is the date's change, This and following
     * splits the block, All edits it.
     */
    editRepeating: (edit: EditRepeating) =>
      send(repeatingCall(edit)) as Promise<PlannerWrite>,
    writeBlockItem: write("writeBlockItem"),
    editBlockItem: write("editBlockItem"),
    removeBlockItem: write("removeBlockItem"),
    reorderItems: write("reorderItems"),
    placeSlot: write("placeSlot"),
    removeSlot: write("removeSlot"),
    /** A to-do slot's place in its block (USE-111). */
    writeSlots: write("writeSlots"),
    /** New to-do and its slot, one write (USE-111). */
    writeTodoSlot: write("writeTodoSlot"),
    writeDayEvent: write("writeDayEvent"),
    removeDayEvent: write("removeDayEvent"),
    copyDay: write("copyDay"),
    copyBlock: write("copyBlock"),
    clearDay: write("clearDay"),
    resetDay: write("resetDay"),
    /** A write's Undo, from its `PlannerWrite.undo`. */
    undo: (token: PlannerWrite["undo"]) => call("undo", token),
    saveStatus,
    retry,
    /** Offline, the day's own controls are read-only (D-USE-82). */
    online,
  };
}
