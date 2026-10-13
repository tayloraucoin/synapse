import { and, eq } from "drizzle-orm";

import { categories, type RlsClient } from "@syn/db";
import type { CategoryKey } from "@syn/types";

/**
 * Categories: create, rename, re-hue, delete.
 *
 * A CATEGORY IS ONE OF THE FOUR THINGS THE PRODUCT DELETES (cross-cutting
 * §8.4). It is safe to delete precisely because it carries no mechanic —
 * official spec §3.2: "Used for time-distribution reporting only, never for
 * any mechanic" — so removing one unassigns habits and changes nothing about
 * how a day runs. The FK is `ON DELETE set null`, which is what makes the
 * dialog's promise ("{n} habits will have no category") true without a second
 * write.
 *
 * UNIQUENESS IS THE DATABASE'S. `categories` has a unique index on
 * `(user_id, name)`; catching its violation is what makes the sentence
 * truthful under a race, where a pre-check alone would not be.
 */

export type SavedCategory = { id: string };

/** Postgres unique-violation. */
const UNIQUE_VIOLATION = "23505";

export class CategoryNameTakenError extends Error {
  constructor() {
    super("category name taken");
    this.name = "CategoryNameTakenError";
  }
}

function rethrowAsNameTaken(error: unknown): never {
  const code = (error as { code?: string } | null)?.code;
  if (code === UNIQUE_VIOLATION) throw new CategoryNameTakenError();
  throw error;
}

export async function createCategory(
  rls: RlsClient,
  userId: string,
  input: { name: string; colorKey: CategoryKey },
): Promise<SavedCategory> {
  try {
    const rows = await rls.execute((tx) =>
      tx
        .insert(categories)
        .values({ userId, name: input.name, colorKey: input.colorKey })
        .returning({ id: categories.id }),
    );
    const row = rows[0];
    if (!row) throw new Error("category insert returned no row");
    return row;
  } catch (error) {
    rethrowAsNameTaken(error);
  }
}

export async function updateCategory(
  rls: RlsClient,
  userId: string,
  input: { id: string; name: string; colorKey: CategoryKey },
): Promise<SavedCategory | null> {
  try {
    const rows = await rls.execute((tx) =>
      tx
        .update(categories)
        .set({
          name: input.name,
          colorKey: input.colorKey,
          updatedAt: new Date(),
        })
        .where(
          and(eq(categories.id, input.id), eq(categories.userId, userId)),
        )
        .returning({ id: categories.id }),
    );
    return rows[0] ?? null;
  } catch (error) {
    rethrowAsNameTaken(error);
  }
}

export async function deleteCategory(
  rls: RlsClient,
  userId: string,
  id: string,
): Promise<boolean> {
  const rows = await rls.execute((tx) =>
    tx
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning({ id: categories.id }),
  );
  return rows.length > 0;
}
