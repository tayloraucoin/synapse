import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it } from "vitest";
import { linkFormSchema, passageFormSchema } from "@syn/validators";
import { refusalReason } from "../../errors";
import {
  deleteOffRow,
  listReading,
  normaliseLinkUrl,
  reorderReading,
  saveLink,
  savePassage,
  turnOff,
  turnOn,
  type ReadingListStore,
  type StoredLink,
  type StoredPassage,
} from "./reading-list";

/**
 * USE-150 C1 to C6: the morning reading's rules over rows in memory. The
 * rows belong to two people, and the store sees only the caller's, as the
 * policies do; `deleteOff` keeps the SQL's `archived_at IS NOT NULL` guard.
 */

const ME = "00000000-0000-4000-8000-000000000001";
const OTHER = "00000000-0000-4000-8000-000000000002";

let serial = 0;
const uuid = () =>
  `00000000-0000-4000-8000-${String(100 + ++serial).padStart(12, "0")}`;

type Owned<T> = T & { userId: string };

interface Tables {
  passages: Owned<StoredPassage>[];
  links: Owned<StoredLink>[];
}

const at = (minute: number) => new Date(Date.UTC(2026, 9, 20, 7, minute));

function passage(
  sortOrder: number,
  extra: Partial<Owned<StoredPassage>> = {},
): Owned<StoredPassage> {
  return {
    id: uuid(),
    createdAt: at(0),
    updatedAt: at(0),
    title: `Passage ${serial}`,
    bodyMd: "Words.",
    images: [],
    sortOrder,
    archivedAt: null,
    userId: ME,
    ...extra,
  };
}

function link(
  sortOrder: number,
  extra: Partial<Owned<StoredLink>> = {},
): Owned<StoredLink> {
  return {
    id: uuid(),
    createdAt: at(0),
    updatedAt: at(0),
    title: `Link ${serial}`,
    url: "https://example.org",
    kind: "other",
    sortOrder,
    archivedAt: null,
    userId: ME,
    ...extra,
  };
}

/** Tags live only on the table: the store's rows never carry them, so a save cannot reach them. */
type WithTags = { tags?: string[] };

function memoryStore(tables: Tables, userId = ME): ReadingListStore {
  const strip = <T extends { userId: string }>(owned: T) => {
    const row: Partial<T & WithTags> = structuredClone(owned);
    delete row.userId;
    delete row.tags;
    return row as Omit<T, "userId">;
  };
  const rows = (kind: "passage" | "link") =>
    (kind === "passage" ? tables.passages : tables.links) as (
      Owned<StoredPassage> | Owned<StoredLink>
    )[];
  const mine = (kind: "passage" | "link") =>
    rows(kind).filter((row) => row.userId === userId);
  return {
    passages: async () =>
      tables.passages.filter((r) => r.userId === userId).map(strip),
    links: async () =>
      tables.links.filter((r) => r.userId === userId).map(strip),
    async insertPassage(values) {
      const row = passage(values.sortOrder, { ...values, userId });
      tables.passages.push(row);
      return strip(row);
    },
    async updatePassage(id, values) {
      const row = tables.passages.find(
        (r) => r.id === id && r.userId === userId,
      );
      if (!row) return null;
      Object.assign(row, values, { updatedAt: at(30) });
      return strip(row);
    },
    async insertLink(values) {
      const row = link(values.sortOrder, { ...values, userId });
      tables.links.push(row);
      return strip(row);
    },
    async updateLink(id, values) {
      const row = tables.links.find((r) => r.id === id && r.userId === userId);
      if (!row) return null;
      Object.assign(row, values, { updatedAt: at(30) });
      return strip(row);
    },
    async setSortOrders(kind, orders) {
      for (const { id, sortOrder } of orders) {
        const row = mine(kind).find((r) => r.id === id);
        if (row) row.sortOrder = sortOrder;
      }
    },
    async setArchivedAt(kind, id, when, sortOrder) {
      const row = mine(kind).find((r) => r.id === id);
      if (!row) return;
      row.archivedAt = when;
      if (sortOrder !== undefined) row.sortOrder = sortOrder;
    },
    async deleteOff(kind, id) {
      const list = rows(kind);
      const index = list.findIndex(
        (r) => r.id === id && r.userId === userId && r.archivedAt !== null,
      );
      if (index < 0) return false;
      list.splice(index, 1);
      return true;
    },
  };
}

async function refusalOf(promise: Promise<unknown>) {
  const error = await promise.then(
    () => null,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(TRPCError);
  return refusalReason(error as TRPCError);
}

let tables: Tables;
let store: ReadingListStore;

beforeEach(() => {
  tables = { passages: [], links: [] };
  store = memoryStore(tables);
});

describe("C1: deleteOffRow", () => {
  it("removes an off passage and an off link", async () => {
    const p = passage(0, { archivedAt: at(5) });
    const l = link(0, { archivedAt: at(5) });
    tables.passages.push(p);
    tables.links.push(l);
    await deleteOffRow(store, { kind: "passage", id: p.id });
    await deleteOffRow(store, { kind: "link", id: l.id });
    expect(tables.passages).toEqual([]);
    expect(tables.links).toEqual([]);
  });

  it.each([
    ["an active row", () => passage(0)],
    [
      "a foreign off row",
      () => passage(0, { archivedAt: at(5), userId: OTHER }),
    ],
  ])("refuses %s as not_off and removes nothing", async (_name, make) => {
    const row = make();
    tables.passages.push(row);
    expect(
      await refusalOf(deleteOffRow(store, { kind: "passage", id: row.id })),
    ).toBe("not_off");
    expect(tables.passages).toHaveLength(1);
  });

  it("refuses a missing id as not_off", async () => {
    tables.links.push(link(0, { archivedAt: at(5) }));
    expect(
      await refusalOf(deleteOffRow(store, { kind: "link", id: uuid() })),
    ).toBe("not_off");
    expect(tables.links).toHaveLength(1);
  });

  it("does not reach across kinds: an off link's id is no passage", async () => {
    const l = link(0, { archivedAt: at(5) });
    tables.links.push(l);
    expect(
      await refusalOf(deleteOffRow(store, { kind: "passage", id: l.id })),
    ).toBe("not_off");
    expect(tables.links).toHaveLength(1);
  });
});

describe("C2: reorderReading", () => {
  it("writes 0..n-1 for the full active list; off rows keep theirs", async () => {
    const [a, b, c] = [passage(0), passage(1), passage(2)];
    const off = passage(7, { archivedAt: at(5) });
    tables.passages.push(a, b, c, off);
    await reorderReading(store, { kind: "passage", ids: [c.id, a.id, b.id] });
    expect([c, a, b].map((r) => r.sortOrder)).toEqual([0, 1, 2]);
    expect(off.sortOrder).toBe(7);
  });

  it.each([
    [
      "omits an active row",
      (ids: string[]) => ids.slice(1),
    ],
    ["names an off row", (ids: string[], off: string) => [...ids, off]],
    [
      "names a foreign row",
      (ids: string[], _off: string, foreign: string) => [
        ...ids.slice(1),
        foreign,
      ],
    ],
    ["names a row twice", (ids: string[]) => [ids[0]!, ...ids.slice(0, -1)]],
  ])("refuses a list that %s as incomplete_reorder", async (_name, make) => {
    const active = [link(0), link(1), link(2)];
    const off = link(3, { archivedAt: at(5) });
    const foreign = link(0, { userId: OTHER });
    tables.links.push(...active, off, foreign);
    const ids = make(
      active.map((r) => r.id),
      off.id,
      foreign.id,
    );
    expect(await refusalOf(reorderReading(store, { kind: "link", ids }))).toBe(
      "incomplete_reorder",
    );
    expect(active.map((r) => r.sortOrder)).toEqual([0, 1, 2]);
  });
});

describe("C3: turnOff and turnOn", () => {
  it("turnOff sets archived_at and leaves sort_order", async () => {
    const row = passage(4);
    tables.passages.push(passage(0), row);
    await turnOff(store, { kind: "passage", id: row.id });
    expect(row.archivedAt).toBeInstanceOf(Date);
    expect(row.sortOrder).toBe(4);
  });

  it("turnOn with restore keeps the row's sort_order", async () => {
    const row = link(1, { archivedAt: at(5) });
    tables.links.push(link(0), row, link(2));
    await turnOn(store, { kind: "link", id: row.id, restore: true });
    expect(row.archivedAt).toBeNull();
    expect(row.sortOrder).toBe(1);
  });

  it("turnOn without restore lands at max+1 of the active rows", async () => {
    const row = link(1, { archivedAt: at(5) });
    // An off row higher up does not count toward the end.
    tables.links.push(link(0), row, link(3), link(9, { archivedAt: at(6) }));
    await turnOn(store, { kind: "link", id: row.id });
    expect(row.archivedAt).toBeNull();
    expect(row.sortOrder).toBe(4);
  });

  it("turnOn into an empty section lands at 0", async () => {
    const row = passage(5, { archivedAt: at(5) });
    tables.passages.push(row);
    await turnOn(store, { kind: "passage", id: row.id });
    expect(row.sortOrder).toBe(0);
  });

  it("refuses a foreign or missing id as not_found", async () => {
    const foreign = passage(0, { userId: OTHER });
    tables.passages.push(foreign);
    expect(
      await refusalOf(turnOff(store, { kind: "passage", id: foreign.id })),
    ).toBe("not_found");
    expect(
      await refusalOf(turnOn(store, { kind: "passage", id: uuid() })),
    ).toBe("not_found");
    expect(foreign.archivedAt).toBeNull();
  });
});

describe("C4: saveLink", () => {
  it("stores spotify:playlist:abc as its open.spotify.com address, kind spotify", async () => {
    const input = linkFormSchema.parse({
      title: "Morning calm",
      url: "spotify:playlist:abc",
    });
    const saved = await saveLink(store, input);
    expect(saved.url).toBe("https://open.spotify.com/playlist/abc");
    expect(saved.kind).toBe("spotify");
    expect(tables.links[0]).toMatchObject({
      url: "https://open.spotify.com/playlist/abc",
      kind: "spotify",
    });
  });

  it("refuses spotify:abc as unopenable and writes nothing", async () => {
    const input = linkFormSchema.parse({
      title: "Morning calm",
      url: "spotify:abc",
    });
    expect(await refusalOf(saveLink(store, input))).toBe("unopenable");
    expect(tables.links).toEqual([]);
    expect(() => normaliseLinkUrl("spotify:abc")).toThrow(TRPCError);
  });

  it("keeps an https: address as sent, with kind other", async () => {
    const input = linkFormSchema.parse({
      title: "Stretch",
      url: "https://example.org/ten",
    });
    const saved = await saveLink(store, input);
    expect(saved).toMatchObject({
      url: "https://example.org/ten",
      kind: "other",
    });
  });

  it("an edit re-derives the kind and keeps the place", async () => {
    const row = link(3);
    tables.links.push(row);
    await saveLink(
      store,
      linkFormSchema.parse({
        id: row.id,
        title: "Now Spotify",
        url: "https://open.spotify.com/track/x",
      }),
    );
    expect(row).toMatchObject({
      kind: "spotify",
      sortOrder: 3,
      title: "Now Spotify",
    });
  });

  it("a new link lands at the end of the active order", async () => {
    tables.links.push(link(0), link(2), link(8, { archivedAt: at(5) }));
    const saved = await saveLink(
      store,
      linkFormSchema.parse({ title: "New", url: "https://example.org" }),
    );
    expect(saved.sortOrder).toBe(3);
  });
});

describe("C5: savePassage", () => {
  it("an edit leaves stored images and tags as they are", async () => {
    const row = {
      ...passage(2, { images: ["passages/me/a.jpg", "passages/me/b.jpg"] }),
      tags: ["slow"],
    };
    tables.passages.push(row);
    // The parsed form carries `images: []` and `tags: []` by default.
    const input = passageFormSchema.parse({
      id: row.id,
      title: "Edited",
      bodyMd: "New words.",
    });
    expect(input.images).toEqual([]);
    const saved = await savePassage(store, input);
    expect(row).toMatchObject({
      title: "Edited",
      bodyMd: "New words.",
      images: ["passages/me/a.jpg", "passages/me/b.jpg"],
      tags: ["slow"],
      sortOrder: 2,
    });
    expect(saved.images).toEqual(["passages/me/a.jpg", "passages/me/b.jpg"]);
  });

  it("a new passage lands at the end of the active order", async () => {
    tables.passages.push(
      passage(0),
      passage(4),
      passage(9, { archivedAt: at(5) }),
    );
    const saved = await savePassage(
      store,
      passageFormSchema.parse({
        title: "",
        bodyMd: "Before the kettle boils.",
      }),
    );
    expect(saved).toMatchObject({ title: null, sortOrder: 5, images: [] });
  });

  it("an edit of a foreign or missing passage is not_found", async () => {
    const foreign = passage(0, { userId: OTHER });
    tables.passages.push(foreign);
    const input = passageFormSchema.parse({
      id: foreign.id,
      title: null,
      bodyMd: "Mine now.",
    });
    expect(await refusalOf(savePassage(store, input))).toBe("not_found");
    expect(foreign.bodyMd).toBe("Words.");
  });
});

describe("C6: listReading", () => {
  it("returns active in Orient's order and off by archived_at, newest first", async () => {
    const p2 = passage(1, { createdAt: at(1) });
    const p1 = passage(1, { createdAt: at(0) });
    const p0 = passage(0, { createdAt: at(9) });
    const pOffOld = passage(0, { archivedAt: at(10) });
    const pOffNew = passage(3, { archivedAt: at(20) });
    const l1 = link(1);
    const l0 = link(0);
    const lOff = link(0, { archivedAt: at(15) });
    tables.passages.push(
      p2,
      pOffOld,
      p1,
      pOffNew,
      p0,
      passage(0, { userId: OTHER }),
    );
    tables.links.push(l1, lOff, l0, link(0, { userId: OTHER }));

    const list = await listReading(store);
    expect(list.passages.map((r) => r.id)).toEqual([p0.id, p1.id, p2.id]);
    expect(list.passagesOff.map((r) => r.id)).toEqual([pOffNew.id, pOffOld.id]);
    expect(list.passagesOff[0]!.archivedAt).toBe(at(20).toISOString());
    expect(list.links.map((r) => r.id)).toEqual([l0.id, l1.id]);
    expect(list.linksOff.map((r) => r.id)).toEqual([lOff.id]);
  });

  it("breaks a tie in sort_order and created_at by id", async () => {
    const [a, b] = [passage(0), passage(0)];
    tables.passages.push(b, a);
    const list = await listReading(store);
    expect(list.passages.map((r) => r.id)).toEqual([a.id, b.id]);
  });
});
