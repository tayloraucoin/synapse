"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MealTopicInput, MealTopicRecord } from "@syn/validators";
import { MealTopicRefusal, type FixtureServer } from "@/lib/fixtures/server";
import { useDataSource } from "./source";

/**
 * Meal topics (USE-22; D-USE-28, D-USE-30): what is worth watching while
 * eating, each with an icon and one link. The order is the chips' order on a
 * meal. On the fixture server's `listMealTopics`, `writeMealTopic` and
 * `removeMealTopic` now, the routers in wave 3.
 *
 * THE PICK is the device's, for one meal (D-USE-72): kept by date and block,
 * so the next meal, or the same block tomorrow, starts with none. No column
 * holds it [ASSUMPTION: per device, as the chosen item on Now].
 */

export function mealTopicsQueryKey(scenario: string) {
  return ["meal-topics", scenario] as const;
}

type MealTopicServer = Pick<
  FixtureServer,
  "listMealTopics" | "writeMealTopic" | "removeMealTopic"
>;

/** A topic's fields as the input takes them. */
export type MealTopicFields = Omit<MealTopicInput, "sortOrder">;

function inputOf(row: MealTopicRecord): MealTopicInput {
  return {
    name: row.name,
    icon: row.icon,
    linkKind: row.linkKind,
    linkValue: row.linkValue,
    sortOrder: row.sortOrder,
  };
}

/** The writes, apart from React so they can be proved against the server. */
export function mealTopicActions(server: MealTopicServer) {
  return {
    /** A new topic goes last: one past the highest `sortOrder`. */
    async add(fields: MealTopicFields): Promise<MealTopicRecord> {
      const rows = await server.listMealTopics();
      const top = rows.reduce((max, row) => Math.max(max, row.sortOrder), -1);
      return server.writeMealTopic({ ...fields, sortOrder: top + 1 });
    },
    /** A topic's icon, name or link; its place stays. */
    async update(
      id: string,
      fields: Partial<MealTopicFields>,
    ): Promise<MealTopicRecord> {
      const rows = await server.listMealTopics();
      const row = rows.find((r) => r.id === id);
      if (!row)
        throw new MealTopicRefusal("unknown", "No meal topic with that id.");
      return server.writeMealTopic({ ...inputOf(row), ...fields, id });
    },
    /** Removes it and hands back the row, so Undo can put it back in place. */
    async remove(id: string): Promise<MealTopicRecord | undefined> {
      const rows = await server.listMealTopics();
      await server.removeMealTopic(id);
      return rows.find((r) => r.id === id);
    },
    /** Undo of a remove: the same topic at the same place. */
    restore(row: MealTopicRecord): Promise<MealTopicRecord> {
      return server.writeMealTopic(inputOf(row));
    },
    /** The new order, every id: each topic takes its index. */
    async reorder(ids: readonly string[]): Promise<void> {
      const rows = await server.listMealTopics();
      for (const [sortOrder, id] of ids.entries()) {
        const row = rows.find((r) => r.id === id);
        if (row && row.sortOrder !== sortOrder) {
          await server.writeMealTopic({ ...inputOf(row), sortOrder, id });
        }
      }
    },
  };
}

export function useMealTopics() {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const queryKey = mealTopicsQueryKey(source.scenario.name);
  const query = useQuery({
    queryKey,
    queryFn: () => source.server.listMealTopics(),
  });
  const actions = mealTopicActions(source.server);
  const onSettled = () => queryClient.invalidateQueries({ queryKey });

  const add = useMutation({ mutationFn: actions.add, onSettled });
  const update = useMutation({
    mutationFn: ({
      id,
      fields,
    }: {
      id: string;
      fields: Partial<MealTopicFields>;
    }) => actions.update(id, fields),
    onSettled,
  });
  const remove = useMutation({ mutationFn: actions.remove, onSettled });
  const restore = useMutation({ mutationFn: actions.restore, onSettled });
  const reorder = useMutation({
    mutationFn: actions.reorder,
    // The new order shows at once; the writes follow.
    onMutate: async (ids: readonly string[]) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<MealTopicRecord[]>(queryKey, (rows) =>
        rows === undefined
          ? rows
          : ids.flatMap((id, sortOrder) => {
              const row = rows.find((r) => r.id === id);
              return row ? [{ ...row, sortOrder }] : [];
            }),
      );
    },
    onSettled,
  });

  return { query, add, update, remove, restore, reorder };
}

/*
 * ---- The pick: one topic for this meal, on this device ----
 */

/** Where a pick is kept: one entry, so a new meal's pick replaces the last. */
export const MEAL_PICK_STORAGE_KEY = "synapse:meal-topic-pick";

export interface MealPick {
  dateKey: string;
  blockId: string;
  topicId: string;
}

type PickStorage = Pick<Storage, "getItem" | "setItem">;

/** The pick for this meal, or null: a pick made on another meal is not this one's. */
export function readMealPick(
  storage: PickStorage,
  dateKey: string,
  blockId: string,
  key: string = MEAL_PICK_STORAGE_KEY,
): string | null {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return null;
    const pick = JSON.parse(raw) as Partial<MealPick>;
    return pick.dateKey === dateKey &&
      pick.blockId === blockId &&
      typeof pick.topicId === "string"
      ? pick.topicId
      : null;
  } catch {
    return null;
  }
}

export function writeMealPick(
  storage: PickStorage,
  pick: MealPick,
  key: string = MEAL_PICK_STORAGE_KEY,
): void {
  try {
    storage.setItem(key, JSON.stringify(pick));
  } catch {
    // Storage unavailable: the pick still holds while the screen is open.
  }
}

function deviceStorage(): PickStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * This meal's pick. `seed` (a scenario's) stands until the person picks;
 * read in an effect, so the first paint is no pick, never another meal's.
 */
export function useMealPick(
  dateKey: string,
  blockId: string,
  seed: string | null = null,
): [string | null, (topicId: string) => void] {
  const [picked, setPicked] = React.useState<string | null>(seed);
  // Per scenario on fixtures, so one `?state=`'s pick never shows on another's.
  const key = `${MEAL_PICK_STORAGE_KEY}:${useDataSource().scenario.name}`;

  React.useEffect(() => {
    if (seed !== null) {
      setPicked(seed);
      return;
    }
    const storage = deviceStorage();
    setPicked(storage ? readMealPick(storage, dateKey, blockId, key) : null);
  }, [dateKey, blockId, seed, key]);

  const pick = React.useCallback(
    (topicId: string) => {
      setPicked(topicId);
      const storage = deviceStorage();
      if (storage) writeMealPick(storage, { dateKey, blockId, topicId }, key);
    },
    [dateKey, blockId, key],
  );

  return [picked, pick];
}
