import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { links, passages, type RlsClient } from "@syn/db";
import { deriveLinkKind } from "@syn/utils";
import {
  UNOPENABLE_LINK,
  type LinkFormInput,
  type LinkRecord,
  type PassageFormInput,
  type PassageRecord,
  type ReadingKind,
  type ReadingListRecord,
  type ReadingRowInput,
  type ReorderReadingInput,
  type TurnOnInput,
} from "@syn/validators";
import { refuse } from "../../errors";

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

/**
 * Settings › Morning reading's list and writes (USE-150; D-USE-120 to
 * D-USE-125), over the `passages` and `links` Orient reads.
 *
 * The rules sit over a `ReadingListStore`, so they are proved over rows in
 * memory and run over the tables through `readingListStore(tx, userId)`,
 * inside the one RLS transaction the router opens: a refusal thrown anywhere
 * rolls it all back.
 *
 * Off is `archived_at`, and an off row keeps its `sort_order` for the
 * toast's Undo. Delete is a hard delete (R1), and only of an off row. A
 * passage's save writes its title and body and nothing else, so its stored
 * images and tags stay. Nothing here fetches a link.
 */

/** The refusals' reasons; the client maps them by these words, so they stay as they are. */
export type ReadingRuleCode =
  "not_off" | "incomplete_reorder" | "unopenable" | "not_found";

const REFUSAL: Record<ReadingRuleCode, string> = {
  not_off: "Only a row that is off can be deleted.",
  incomplete_reorder: "Each row in the section, once.",
  unopenable: UNOPENABLE_LINK,
  not_found: "No row with that id.",
};

export function readingRefusal(code: ReadingRuleCode) {
  return refuse(code, REFUSAL[code]);
}

type Stamps = { id: string; createdAt: Date; updatedAt: Date };

export type StoredPassage = Stamps & {
  title: string | null;
  bodyMd: string;
  images: string[];
  sortOrder: number;
  archivedAt: Date | null;
};

export type StoredLink = Stamps & {
  title: string;
  url: string;
  kind: "spotify" | "other";
  sortOrder: number;
  archivedAt: Date | null;
};

export interface ReadingSortOrder {
  id: string;
  sortOrder: number;
}

export interface ReadingListStore {
  /** Every passage of the caller's, off too, in no promised order. */
  passages(): Promise<StoredPassage[]>;
  links(): Promise<StoredLink[]>;
  insertPassage(values: {
    title: string | null;
    bodyMd: string;
    sortOrder: number;
  }): Promise<StoredPassage>;
  /** Title and body only; null when there is no such row. */
  updatePassage(
    id: string,
    values: { title: string | null; bodyMd: string },
  ): Promise<StoredPassage | null>;
  insertLink(values: {
    title: string;
    url: string;
    kind: StoredLink["kind"];
    sortOrder: number;
  }): Promise<StoredLink>;
  updateLink(
    id: string,
    values: { title: string; url: string; kind: StoredLink["kind"] },
  ): Promise<StoredLink | null>;
  /** Every pair in one statement, so an order is never half written. */
  setSortOrders(kind: ReadingKind, orders: ReadingSortOrder[]): Promise<void>;
  /** Off (a date) or on (null); with `sortOrder` the row moves too. */
  setArchivedAt(
    kind: ReadingKind,
    id: string,
    at: Date | null,
    sortOrder?: number,
  ): Promise<void>;
  /** Removes the row only while it is off; true when one went. */
  deleteOff(kind: ReadingKind, id: string): Promise<boolean>;
}

/* ---------------------------------------------------------------- reads -- */

type Row = {
  sortOrder: number;
  createdAt: Date;
  id: string;
  archivedAt: Date | null;
};

/** Orient's order: `sort_order`, then `created_at`, then `id` (as `activePassages`). */
function byOrient(a: Row, b: Row): number {
  return (
    a.sortOrder - b.sortOrder ||
    a.createdAt.getTime() - b.createdAt.getTime() ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  );
}

function byOffNewest(a: Row, b: Row): number {
  return b.archivedAt!.getTime() - a.archivedAt!.getTime() || byOrient(a, b);
}

function split<T extends Row>(rows: T[]) {
  return {
    active: rows.filter((row) => row.archivedAt === null).sort(byOrient),
    off: rows.filter((row) => row.archivedAt !== null).sort(byOffNewest),
  };
}

function stampsOf(row: Stamps) {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function passageRecordOf(row: StoredPassage): PassageRecord {
  return {
    ...stampsOf(row),
    title: row.title,
    bodyMd: row.bodyMd,
    images: row.images,
    sortOrder: row.sortOrder,
  };
}

function linkRecordOf(row: StoredLink): LinkRecord {
  return {
    ...stampsOf(row),
    title: row.title,
    url: row.url,
    kind: row.kind,
    sortOrder: row.sortOrder,
  };
}

const offOf = <T extends { archivedAt: Date | null }>(row: T) => ({
  archivedAt: row.archivedAt!.toISOString(),
});

/** One read for the screen: both sections, active and off (D-USE-133). */
export async function listReading(
  store: ReadingListStore,
): Promise<ReadingListRecord> {
  // One transaction's connection: the reads go in turn, never in parallel.
  const passageRows = split(await store.passages());
  const linkRows = split(await store.links());
  return {
    passages: passageRows.active.map(passageRecordOf),
    passagesOff: passageRows.off.map((row) => ({
      ...passageRecordOf(row),
      ...offOf(row),
    })),
    links: linkRows.active.map(linkRecordOf),
    linksOff: linkRows.off.map((row) => ({
      ...linkRecordOf(row),
      ...offOf(row),
    })),
  };
}

function rowsOf(store: ReadingListStore, kind: ReadingKind): Promise<Row[]> {
  return kind === "passage" ? store.passages() : store.links();
}

/** One past the last active row: where a new row and a row turned on land (D-USE-123). */
function endOf(rows: readonly Row[]): number {
  return (
    rows
      .filter((row) => row.archivedAt === null)
      .reduce((max, row) => Math.max(max, row.sortOrder), -1) + 1
  );
}

/* --------------------------------------------------------------- writes -- */

/** A new passage at the end, or with `id` its title and body; images and tags stay (D-USE-121). */
export async function savePassage(
  store: ReadingListStore,
  input: PassageFormInput,
): Promise<PassageRecord> {
  // Never spread the form: its defaulted `images: []` would clear a row's.
  const values = { title: input.title, bodyMd: input.bodyMd };
  if (input.id === undefined) {
    const sortOrder = endOf(await store.passages());
    return passageRecordOf(await store.insertPassage({ ...values, sortOrder }));
  }
  const row = await store.updatePassage(input.id, values);
  if (!row) throw readingRefusal("not_found");
  return passageRecordOf(row);
}

/**
 * `spotify:playlist:abc` → `https://open.spotify.com/playlist/abc`; an
 * `https:` URL as sent. A `spotify:` URI with no type and id is refused: the
 * validator admits the scheme, this is where its shape is checked. Ported
 * from the legacy library service, not imported.
 */
export function normaliseLinkUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.toLowerCase().startsWith("spotify:")) return trimmed;
  const parts = trimmed
    .slice("spotify:".length)
    .split(":")
    .filter((part) => part !== "");
  if (parts.length < 2) throw readingRefusal("unopenable");
  return `https://open.spotify.com/${parts.map(encodeURIComponent).join("/")}`;
}

/** A new link at the end, or with `id` a change to one; the kind is derived, nothing fetched (D-USE-120). */
export async function saveLink(
  store: ReadingListStore,
  input: LinkFormInput,
): Promise<LinkRecord> {
  const url = normaliseLinkUrl(input.url);
  const values = { title: input.title, url, kind: deriveLinkKind(url) };
  if (input.id === undefined) {
    const sortOrder = endOf(await store.links());
    return linkRecordOf(await store.insertLink({ ...values, sortOrder }));
  }
  const row = await store.updateLink(input.id, values);
  if (!row) throw readingRefusal("not_found");
  return linkRecordOf(row);
}

/** A section's whole order: every active row once, written 0 to n−1; off rows keep theirs. */
export async function reorderReading(
  store: ReadingListStore,
  { kind, ids }: ReorderReadingInput,
): Promise<void> {
  const active = (await rowsOf(store, kind)).filter(
    (row) => row.archivedAt === null,
  );
  const named = new Set(ids);
  if (
    named.size !== ids.length ||
    ids.length !== active.length ||
    !active.every((row) => named.has(row.id))
  ) {
    throw readingRefusal("incomplete_reorder");
  }
  await store.setSortOrders(
    kind,
    ids.map((id, sortOrder) => ({ id, sortOrder })),
  );
}

async function rowFor(store: ReadingListStore, kind: ReadingKind, id: string) {
  const row = (await rowsOf(store, kind)).find((r) => r.id === id);
  if (!row) throw readingRefusal("not_found");
  return row;
}

/** Off: `archived_at` is set and the place kept for Undo (D-USE-124). Off already is left as it is. */
export async function turnOff(
  store: ReadingListStore,
  { kind, id }: ReadingRowInput,
): Promise<void> {
  const row = await rowFor(store, kind, id);
  if (row.archivedAt !== null) return;
  await store.setArchivedAt(kind, id, new Date());
}

/** On: with `restore` (Undo) back where it was; otherwise at the end (D-USE-123). */
export async function turnOn(
  store: ReadingListStore,
  { kind, id, restore }: TurnOnInput,
): Promise<void> {
  const rows = await rowsOf(store, kind);
  const row = rows.find((r) => r.id === id);
  if (!row) throw readingRefusal("not_found");
  if (row.archivedAt === null) return;
  if (restore) await store.setArchivedAt(kind, id, null);
  else await store.setArchivedAt(kind, id, null, endOf(rows));
}

/** For good (R1), and only an off row: an active, missing or foreign id is `not_off` (D-USE-125). */
export async function deleteOffRow(
  store: ReadingListStore,
  { kind, id }: ReadingRowInput,
): Promise<void> {
  if (!(await store.deleteOff(kind, id))) throw readingRefusal("not_off");
}

/* ---------------------------------------------------------------- store -- */

const PASSAGE_COLUMNS = {
  id: passages.id,
  createdAt: passages.createdAt,
  updatedAt: passages.updatedAt,
  title: passages.title,
  bodyMd: passages.bodyMd,
  images: passages.images,
  sortOrder: passages.sortOrder,
  archivedAt: passages.archivedAt,
};

const LINK_COLUMNS = {
  id: links.id,
  createdAt: links.createdAt,
  updatedAt: links.updatedAt,
  title: links.title,
  url: links.url,
  kind: links.kind,
  sortOrder: links.sortOrder,
  archivedAt: links.archivedAt,
};

/** The store over `passages` and `links`, inside the caller's RLS transaction. */
export function readingListStore(tx: Tx, userId: string): ReadingListStore {
  const table = (kind: ReadingKind) => (kind === "passage" ? passages : links);
  const mine = (kind: ReadingKind) => eq(table(kind).userId, userId);

  return {
    passages() {
      return tx
        .select(PASSAGE_COLUMNS)
        .from(passages)
        .where(eq(passages.userId, userId));
    },

    links() {
      return tx
        .select(LINK_COLUMNS)
        .from(links)
        .where(eq(links.userId, userId));
    },

    async insertPassage(values) {
      const [row] = await tx
        .insert(passages)
        .values({ ...values, userId })
        .returning(PASSAGE_COLUMNS);
      return row!;
    },

    async updatePassage(id, { title, bodyMd }) {
      const [row] = await tx
        .update(passages)
        .set({ title, bodyMd, updatedAt: new Date() })
        .where(and(eq(passages.id, id), eq(passages.userId, userId)))
        .returning(PASSAGE_COLUMNS);
      return row ?? null;
    },

    async insertLink(values) {
      const [row] = await tx
        .insert(links)
        .values({ ...values, userId })
        .returning(LINK_COLUMNS);
      return row!;
    },

    async updateLink(id, values) {
      const [row] = await tx
        .update(links)
        .set({ ...values, updatedAt: new Date() })
        .where(and(eq(links.id, id), eq(links.userId, userId)))
        .returning(LINK_COLUMNS);
      return row ?? null;
    },

    async setSortOrders(kind, orders) {
      if (orders.length === 0) return;
      const t = table(kind);
      const order = sql.join(
        orders.map(
          ({ id, sortOrder }) =>
            sql`when ${id}::uuid then ${sortOrder}::smallint`,
        ),
        sql` `,
      );
      await tx
        .update(t)
        .set({
          sortOrder: sql`case ${t.id} ${order} end`,
          updatedAt: new Date(),
        })
        .where(
          and(
            mine(kind),
            inArray(
              t.id,
              orders.map((o) => o.id),
            ),
          ),
        );
    },

    async setArchivedAt(kind, id, at, sortOrder) {
      const t = table(kind);
      await tx
        .update(t)
        .set({
          archivedAt: at,
          updatedAt: new Date(),
          ...(sortOrder === undefined ? {} : { sortOrder }),
        })
        .where(and(eq(t.id, id), mine(kind)));
    },

    async deleteOff(kind, id) {
      const t = table(kind);
      const gone = await tx
        .delete(t)
        .where(and(eq(t.id, id), mine(kind), isNotNull(t.archivedAt)))
        .returning({ id: t.id });
      return gone.length > 0;
    },
  };
}
