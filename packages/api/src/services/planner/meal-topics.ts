import { and, asc, eq } from "drizzle-orm";

import { mealTopics, type RlsClient } from "@syn/db";
import type { IconValue, MealLinkKind } from "@syn/types";
import type { MealTopicRecord, MealTopicWriteInput } from "@syn/validators";

import { refuse } from "../../errors";

/**
 * Meal topics (USE-97; D-USE-28): the Meal topics sheet's saved topics, in
 * their order (lowest `sortOrder` first, the chips' order). A write with no
 * `id` adds one; with `id` it changes that one; an id the caller does not
 * hold is refused "unknown", as the fixture refuses it.
 *
 * The rules sit over a `MealTopicStore`, proved over rows in memory and run
 * over the table through `mealTopicStore(tx, userId)`.
 */

export type MealTopicValues = Omit<MealTopicRecord, "id" | "createdAt" | "updatedAt">;

export interface MealTopicStore {
  list(): Promise<MealTopicRecord[]>;
  insert(values: MealTopicValues): Promise<MealTopicRecord>;
  update(id: string, values: MealTopicValues): Promise<MealTopicRecord | null>;
  /** True when a row went. */
  remove(id: string): Promise<boolean>;
}

export function listMealTopics(store: MealTopicStore): Promise<MealTopicRecord[]> {
  return store.list();
}

export async function writeMealTopic(
  store: MealTopicStore,
  { id, icon, ...rest }: MealTopicWriteInput,
): Promise<MealTopicRecord> {
  const values: MealTopicValues = { ...rest, icon: icon ?? null };
  if (id === undefined) return store.insert(values);
  const updated = await store.update(id, values);
  if (!updated) throw refuse("unknown", "No meal topic with that id.");
  return updated;
}

export async function removeMealTopic(
  store: MealTopicStore,
  id: string,
): Promise<void> {
  if (!(await store.remove(id))) {
    throw refuse("unknown", "No meal topic with that id.");
  }
}

/* ------------------------------------------------------------ the table -- */

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

const COLUMNS = {
  id: mealTopics.id,
  createdAt: mealTopics.createdAt,
  updatedAt: mealTopics.updatedAt,
  name: mealTopics.name,
  icon: mealTopics.icon,
  linkKind: mealTopics.linkKind,
  linkValue: mealTopics.linkValue,
  sortOrder: mealTopics.sortOrder,
} as const;

type Row = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  icon: IconValue | null;
  linkKind: MealLinkKind;
  linkValue: string;
  sortOrder: number;
};

function toRecord(row: Row): MealTopicRecord {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** The store over `meal_topics`, inside the caller's RLS transaction. */
export function mealTopicStore(tx: Tx, userId: string): MealTopicStore {
  const mine = eq(mealTopics.userId, userId);
  return {
    async list() {
      const rows = await tx
        .select(COLUMNS)
        .from(mealTopics)
        .where(mine)
        .orderBy(asc(mealTopics.sortOrder), asc(mealTopics.createdAt));
      return rows.map(toRecord);
    },
    async insert(values) {
      const rows = await tx
        .insert(mealTopics)
        .values({ ...values, userId })
        .returning(COLUMNS);
      const row = rows[0];
      if (!row) throw new Error("meal_topics insert returned no row");
      return toRecord(row);
    },
    async update(id, values) {
      const rows = await tx
        .update(mealTopics)
        .set({ ...values, updatedAt: new Date() })
        .where(and(mine, eq(mealTopics.id, id)))
        .returning(COLUMNS);
      return rows[0] ? toRecord(rows[0]) : null;
    },
    async remove(id) {
      const rows = await tx
        .delete(mealTopics)
        .where(and(mine, eq(mealTopics.id, id)))
        .returning({ id: mealTopics.id });
      return rows.length > 0;
    },
  };
}
