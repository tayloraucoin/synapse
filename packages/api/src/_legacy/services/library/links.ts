import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";

import { links, type RlsClient } from "@syn/db";
import type { LinkView } from "@syn/types";
import type { LinkFormInput } from "@syn/validators";
import { deriveLinkKind } from "@syn/utils";

/**
 * Links — a thing to open from the morning: a playlist, a track, a page
 * (UX v1.3 R53, §3.17, §11.4; TD-28). `passages.ts`' CRUD with the columns
 * swapped: owner-private, archive never delete, `sort_order` rewritten from
 * the full list on reorder.
 *
 * THE KIND IS DERIVED HERE, NEVER READ FROM INPUT. `linkFormSchema` has no
 * `kind`; `save` computes it with `deriveLinkKind` from the stored URL and
 * writes it, so the orient frame never parses a URL.
 *
 * ONE STORED SHAPE. A `spotify:{type}:{id}` URI (what the app's *Copy Spotify
 * URI* gives) is rewritten to `https://open.spotify.com/{type}/{id}` before it
 * is stored, so a callout is always an `https:` link the browser opens and
 * the Spotify app intercepts on a phone.
 *
 * NOTHING IS FETCHED. No preview, no title lookup, no favicon — the service
 * never contacts a host; the person opens the link.
 */

export class LinkRuleError extends Error {
  readonly code: "incomplete_reorder" | "unopenable";
  constructor(code: LinkRuleError["code"]) {
    super(code);
    this.name = "LinkRuleError";
    this.code = code;
  }
}

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

const COLUMNS = {
  id: links.id,
  title: links.title,
  url: links.url,
  kind: links.kind,
  sortOrder: links.sortOrder,
} as const;

type LinkRow = { id: string; title: string; url: string; kind: LinkView["kind"]; sortOrder: number };

export function toLinkView(row: LinkRow): LinkView {
  return { id: row.id, title: row.title, url: row.url, kind: row.kind, sortOrder: row.sortOrder };
}

/**
 * `spotify:playlist:abc` → `https://open.spotify.com/playlist/abc`; an
 * `https:` URL as sent. A `spotify:` URI with no `{type}:{id}` is refused —
 * the validator admits the scheme, this is where its shape is checked.
 */
export function normaliseLinkUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.toLowerCase().startsWith("spotify:")) return trimmed;
  const parts = trimmed.slice("spotify:".length).split(":").filter((part) => part !== "");
  if (parts.length < 2) throw new LinkRuleError("unopenable");
  return `https://open.spotify.com/${parts.map(encodeURIComponent).join("/")}`;
}

/** Active links in the frame's order — the read the orient frame and Settings share. */
export async function readActiveLinks(tx: Tx, userId: string): Promise<LinkView[]> {
  const rows = await tx
    .select(COLUMNS)
    .from(links)
    .where(and(eq(links.userId, userId), isNull(links.archivedAt)))
    .orderBy(asc(links.sortOrder), asc(links.createdAt));
  return rows.map(toLinkView);
}

export async function listLinks(
  rls: RlsClient,
  userId: string,
  options: { includeArchived?: boolean } = {},
): Promise<LinkView[]> {
  if (!options.includeArchived) return rls.execute((tx) => readActiveLinks(tx, userId));
  const rows = await rls.execute((tx) =>
    tx
      .select(COLUMNS)
      .from(links)
      .where(eq(links.userId, userId))
      .orderBy(asc(links.sortOrder), asc(links.createdAt)),
  );
  return rows.map(toLinkView);
}

export async function saveLink(
  rls: RlsClient,
  userId: string,
  input: LinkFormInput,
): Promise<LinkView | null> {
  const url = normaliseLinkUrl(input.url);
  const values = { title: input.title, url, kind: deriveLinkKind(url) };

  return rls.execute(async (tx) => {
    if (input.id) {
      const rows = await tx
        .update(links)
        .set({ ...values, updatedAt: new Date() })
        .where(and(eq(links.id, input.id), eq(links.userId, userId)))
        .returning(COLUMNS);
      const row = rows[0];
      return row ? toLinkView(row) : null;
    }

    // A new link lands at the end of the list.
    const [last] = await tx
      .select({ max: sql<number>`coalesce(max(${links.sortOrder}), -1)` })
      .from(links)
      .where(and(eq(links.userId, userId), isNull(links.archivedAt)));
    const sortOrder = Number(last?.max ?? -1) + 1;

    const rows = await tx.insert(links).values({ ...values, userId, sortOrder }).returning(COLUMNS);
    const row = rows[0];
    return row ? toLinkView(row) : null;
  });
}

export async function archiveLink(
  rls: RlsClient,
  userId: string,
  id: string,
  archived = true,
): Promise<boolean> {
  const rows = await rls.execute((tx) =>
    tx
      .update(links)
      .set({ archivedAt: archived ? new Date() : null, updatedAt: new Date() })
      .where(and(eq(links.id, id), eq(links.userId, userId)))
      .returning({ id: links.id }),
  );
  return rows.length > 0;
}

/**
 * The full ordered list becomes `sort_order` 0…n−1. Refused when it omits an
 * active row — extra or foreign ids are ignored, which RLS makes a no-op.
 */
export async function reorderLinks(
  rls: RlsClient,
  userId: string,
  ids: readonly string[],
): Promise<LinkView[]> {
  return rls.execute(async (tx) => {
    const active = await tx
      .select({ id: links.id })
      .from(links)
      .where(and(eq(links.userId, userId), isNull(links.archivedAt)));
    const wanted = new Set(ids);
    if (active.some((row) => !wanted.has(row.id))) throw new LinkRuleError("incomplete_reorder");

    const activeIds = new Set(active.map((row) => row.id));
    const ordered = ids.filter((id) => activeIds.has(id));
    for (const [index, id] of ordered.entries()) {
      await tx
        .update(links)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(and(eq(links.id, id), eq(links.userId, userId)));
    }

    if (ordered.length === 0) return [];
    const rows = await tx
      .select(COLUMNS)
      .from(links)
      .where(and(eq(links.userId, userId), inArray(links.id, ordered)))
      .orderBy(asc(links.sortOrder));
    return rows.map(toLinkView);
  });
}
