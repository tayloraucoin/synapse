import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";

import { parseAssetPath } from "@syn/constants";
import { passages, type RlsClient } from "@syn/db";
import type { PassageView } from "@syn/types";
import type { PassageFormInput } from "@syn/validators";

/**
 * Passages — the person's morning reading as a collection (UX v1.2 §3.12,
 * §4.6, §11.4; R36, TD-15).
 *
 * THE LIST'S ORDER IS THE CYCLE. `sort_order` is what the frame walks
 * (`cycleIndex`, RUN-4's orient read); `reorderPassages` rewrites it from the
 * full id list in one transaction and refuses a list that omits an active
 * row, so the cycle can never have a hole.
 *
 * MARKDOWN IS STORED AS SENT — trimmed and bounded by the validator, never
 * sanitised, because it is never rendered as HTML: the reader is the editor's
 * read-only mode (RUN-7). AN IMAGE PATH IS RE-CHECKED against the caller's
 * owner segment before it is stored; the validator only bounds the count.
 * The bucket is the one `ASSET_BUCKET_BY_KIND.passage` names.
 *
 * ARCHIVE, NEVER DELETE; an archived passage's images stay in the bucket.
 * A foreign id is `null` here and `NOT_FOUND` at the router — never a hint.
 */

export class PassageRuleError extends Error {
  readonly code: "foreign_image" | "incomplete_reorder";
  constructor(code: PassageRuleError["code"]) {
    super(code);
    this.name = "PassageRuleError";
    this.code = code;
  }
}

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

const COLUMNS = {
  id: passages.id,
  title: passages.title,
  bodyMd: passages.bodyMd,
  images: passages.images,
  tags: passages.tags,
  sortOrder: passages.sortOrder,
} as const;

type PassageRow = {
  id: string;
  title: string | null;
  bodyMd: string;
  images: string[];
  tags: string[];
  sortOrder: number;
};

export function toPassageView(row: PassageRow): PassageView {
  return {
    id: row.id,
    title: row.title,
    bodyMd: row.bodyMd,
    images: row.images,
    tags: row.tags,
    sortOrder: row.sortOrder,
  };
}

/** Active passages in cycle order — the one read the frame and screen 6 share. */
export async function readActivePassages(tx: Tx, userId: string): Promise<PassageView[]> {
  const rows = await tx
    .select(COLUMNS)
    .from(passages)
    .where(and(eq(passages.userId, userId), isNull(passages.archivedAt)))
    .orderBy(asc(passages.sortOrder), asc(passages.createdAt));
  return rows.map(toPassageView);
}

export async function listPassages(rls: RlsClient, userId: string): Promise<PassageView[]> {
  return rls.execute((tx) => readActivePassages(tx, userId));
}

/**
 * Every stored path must be in the `passages` bucket under the caller's own
 * segment. A path that is not is refused, never silently dropped — a client
 * that sends one is a client with a bug worth hearing about.
 */
function assertOwnImages(userId: string, images: readonly string[]): void {
  for (const path of images) {
    const parsed = parseAssetPath(path);
    if (!parsed || parsed.bucket !== "passages" || parsed.userId !== userId) {
      throw new PassageRuleError("foreign_image");
    }
  }
}

export async function savePassage(
  rls: RlsClient,
  userId: string,
  input: PassageFormInput,
): Promise<PassageView | null> {
  assertOwnImages(userId, input.images);

  return rls.execute(async (tx) => {
    const values = {
      title: input.title,
      bodyMd: input.bodyMd,
      images: [...input.images],
      tags: [...input.tags],
    };

    if (input.id) {
      const rows = await tx
        .update(passages)
        .set({ ...values, updatedAt: new Date() })
        .where(and(eq(passages.id, input.id), eq(passages.userId, userId)))
        .returning(COLUMNS);
      const row = rows[0];
      return row ? toPassageView(row) : null;
    }

    // A new passage lands at the end of the cycle.
    const [last] = await tx
      .select({ max: sql<number>`coalesce(max(${passages.sortOrder}), -1)` })
      .from(passages)
      .where(and(eq(passages.userId, userId), isNull(passages.archivedAt)));
    const sortOrder = Number(last?.max ?? -1) + 1;

    const rows = await tx
      .insert(passages)
      .values({ ...values, userId, sortOrder })
      .returning(COLUMNS);
    const row = rows[0];
    return row ? toPassageView(row) : null;
  });
}

export async function archivePassage(
  rls: RlsClient,
  userId: string,
  id: string,
  archived = true,
): Promise<boolean> {
  const rows = await rls.execute((tx) =>
    tx
      .update(passages)
      .set({ archivedAt: archived ? new Date() : null, updatedAt: new Date() })
      .where(and(eq(passages.id, id), eq(passages.userId, userId)))
      .returning({ id: passages.id }),
  );
  return rows.length > 0;
}

/**
 * The full ordered list becomes `sort_order` 0…n−1. Refused when it omits an
 * active row (a hole in the cycle) — extra or foreign ids are ignored, which
 * RLS would make a no-op anyway.
 */
export async function reorderPassages(
  rls: RlsClient,
  userId: string,
  ids: readonly string[],
): Promise<PassageView[]> {
  return rls.execute(async (tx) => {
    const active = await tx
      .select({ id: passages.id })
      .from(passages)
      .where(and(eq(passages.userId, userId), isNull(passages.archivedAt)));
    const wanted = new Set(ids);
    if (active.some((row) => !wanted.has(row.id))) {
      throw new PassageRuleError("incomplete_reorder");
    }

    const activeIds = new Set(active.map((row) => row.id));
    const ordered = ids.filter((id) => activeIds.has(id));
    for (const [index, id] of ordered.entries()) {
      await tx
        .update(passages)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(and(eq(passages.id, id), eq(passages.userId, userId)));
    }

    if (ordered.length === 0) return [];
    const rows = await tx
      .select(COLUMNS)
      .from(passages)
      .where(and(eq(passages.userId, userId), inArray(passages.id, ordered)))
      .orderBy(asc(passages.sortOrder));
    return rows.map(toPassageView);
  });
}
