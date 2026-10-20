import type { ZodType, ZodTypeDef } from "zod";
import { deriveLinkKind } from "@syn/utils";
import {
  linkFormSchema,
  linkRecord,
  passageFormSchema,
  passageRecord,
  readingRowInput,
  reorderReadingInput,
  turnOnInput,
  UNOPENABLE_LINK,
  type LinkRecord,
  type PassageRecord,
  type ReadingKind,
  type ReadingListRecord,
  type ReadingRowInput,
  type ReorderReadingInput,
  type TurnOnInput,
} from "@syn/validators";
import {
  FixtureOfflineError,
  MorningReadingRefusal,
} from "@/lib/data/refusals";
import type { FixtureRecords } from "./records";

/**
 * Settings › Morning reading on fixtures (USE-151): the list and the writes
 * USE-150's `morning.*` procedures answer, over the same `passages` and
 * `links` Orient reads. Off rows sit in `passagesOff` and `linksOff`, so
 * Orient's read stays the active rows and nothing else. The rules are the
 * service's (`reading-list.ts`), restated over rows in memory: an off row
 * keeps its `sortOrder` for Undo; Turn on from the Off list lands at the
 * end; delete takes only an off row; a reorder names every active row once.
 */

/** A passage's save, as the sheet sends it; the form's images and tags are never written. */
export interface ReadingPassageSave {
  id?: string;
  title: string | null;
  bodyMd: string;
}

/** A link's save, as the sheet sends it; the kind is derived, never sent. */
export interface ReadingLinkSave {
  id?: string;
  title: string;
  url: string;
}

export interface MorningReadingServer {
  /** One read, both sections (D-USE-133): active in Orient's order, off newest first. */
  readMorningReading(): Promise<ReadingListRecord>;
  /** A new passage at the end, or with `id` its title and body. */
  saveReadingPassage(input: ReadingPassageSave): Promise<PassageRecord>;
  /** A new link at the end, or with `id` a change to one. */
  saveReadingLink(input: ReadingLinkSave): Promise<LinkRecord>;
  /** A section's whole order, every active id once. */
  reorderReading(input: ReorderReadingInput): Promise<void>;
  /** Off: out of Orient, kept under Off with its place. */
  turnReadingOff(input: ReadingRowInput): Promise<void>;
  /** On: `restore` (Undo) back where it was; otherwise at the end. */
  turnReadingOn(input: TurnOnInput): Promise<void>;
  /** For good, and only an off row (R1). */
  deleteReadingRow(input: ReadingRowInput): Promise<void>;
  /** The list's own retry (`regions.morningReading: "error"`). */
  recoverMorningReading(): void;
}

interface Ordered {
  id: string;
  createdAt: string;
  sortOrder: number;
}

/** Orient's order and this screen's: `sort_order`, then `created_at`, then `id`. */
export function byReadingOrder(a: Ordered, b: Ordered): number {
  return (
    a.sortOrder - b.sortOrder ||
    a.createdAt.localeCompare(b.createdAt) ||
    a.id.localeCompare(b.id)
  );
}

type OffOrdered = Ordered & { archivedAt: string };

function byOffNewest(a: { archivedAt: string }, b: { archivedAt: string }) {
  return b.archivedAt.localeCompare(a.archivedAt);
}

/** The service's `normaliseLinkUrl`: a `spotify:` URI as its open.spotify.com address. */
function normaliseLinkUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.toLowerCase().startsWith("spotify:")) return trimmed;
  const parts = trimmed
    .slice("spotify:".length)
    .split(":")
    .filter((part) => part !== "");
  if (parts.length < 2) {
    throw new MorningReadingRefusal("unopenable", UNOPENABLE_LINK);
  }
  return `https://open.spotify.com/${parts.map(encodeURIComponent).join("/")}`;
}

/** The router's input check, refused in the schema's words before anything lands. */
function parse<T>(schema: ZodType<T, ZodTypeDef, unknown>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new MorningReadingRefusal(
      "invalid",
      parsed.error.issues[0]?.message ?? "Invalid input.",
    );
  }
  return parsed.data;
}

export function createMorningReadingServer({
  records,
  now,
  isOffline,
  read,
  failOnce,
}: {
  records: FixtureRecords;
  now: () => Date;
  isOffline: () => boolean;
  /** The scenario's region: waits, fails until retried, or reads. */
  read: { waits: boolean; fails: boolean };
  /** A write named in the scenario's `failWrites` rejects once. */
  failOnce: (id: string) => Error | null;
}): MorningReadingServer {
  let fails = read.fails;
  const passagesOff = (records.passagesOff ??= []);
  const linksOff = (records.linksOff ??= []);

  // Either kind's rows, by what the rules read: the id, the place, the stamp.
  function lists(kind: ReadingKind): { active: Ordered[]; off: OffOrdered[] } {
    return kind === "passage"
      ? { active: records.passages, off: passagesOff }
      : { active: records.links, off: linksOff };
  }

  function endOf(rows: readonly Ordered[]): number {
    return rows.reduce((max, row) => Math.max(max, row.sortOrder), -1) + 1;
  }

  /** Offline, or a write the scenario fails once: refused before it lands. */
  function gate(id: string) {
    if (isOffline()) throw new FixtureOfflineError();
    const failed = failOnce(id);
    if (failed) throw failed;
  }

  const stamp = () => now().toISOString();

  function run<T>(write: () => T): Promise<T> {
    try {
      return Promise.resolve(structuredClone(write()));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  return {
    readMorningReading() {
      if (read.waits) return new Promise(() => {});
      if (fails)
        return Promise.reject(new Error("The reading list could not be read."));
      return Promise.resolve(
        structuredClone({
          passages: [...records.passages].sort(byReadingOrder),
          passagesOff: [...passagesOff].sort(byOffNewest),
          links: [...records.links].sort(byReadingOrder),
          linksOff: [...linksOff].sort(byOffNewest),
        }),
      );
    },

    saveReadingPassage(raw) {
      return run(() => {
        const input = parse(passageFormSchema, raw);
        gate(input.id ?? "save-passage");
        const at = stamp();
        if (input.id === undefined) {
          const row = passageRecord.parse({
            id: crypto.randomUUID(),
            createdAt: at,
            updatedAt: at,
            title: input.title,
            bodyMd: input.bodyMd,
            images: [],
            sortOrder: endOf(records.passages),
          });
          records.passages.push(row);
          return row;
        }
        const row = [...records.passages, ...passagesOff].find(
          (r) => r.id === input.id,
        );
        if (!row)
          throw new MorningReadingRefusal("not_found", "No row with that id.");
        // Title and body only: a stored passage keeps its images (D-USE-121).
        Object.assign(row, {
          title: input.title,
          bodyMd: input.bodyMd,
          updatedAt: at,
        });
        return passageRecord.parse(row);
      });
    },

    saveReadingLink(raw) {
      return run(() => {
        const input = parse(linkFormSchema, raw);
        gate(input.id ?? "save-link");
        const url = normaliseLinkUrl(input.url);
        const values = { title: input.title, url, kind: deriveLinkKind(url) };
        const at = stamp();
        if (input.id === undefined) {
          const row = linkRecord.parse({
            id: crypto.randomUUID(),
            createdAt: at,
            updatedAt: at,
            ...values,
            sortOrder: endOf(records.links),
          });
          records.links.push(row);
          return row;
        }
        const row = [...records.links, ...linksOff].find(
          (r) => r.id === input.id,
        );
        if (!row)
          throw new MorningReadingRefusal("not_found", "No row with that id.");
        Object.assign(row, { ...values, updatedAt: at });
        return linkRecord.parse(row);
      });
    },

    reorderReading(raw) {
      return run(() => {
        const { kind, ids } = parse(reorderReadingInput, raw);
        gate(`reorder-${kind}`);
        const { active } = lists(kind);
        const named = new Set(ids);
        if (
          named.size !== ids.length ||
          ids.length !== active.length ||
          !active.every((row) => named.has(row.id))
        ) {
          throw new MorningReadingRefusal(
            "incomplete_reorder",
            "Each row in the section, once.",
          );
        }
        for (const row of active) row.sortOrder = ids.indexOf(row.id);
      });
    },

    turnReadingOff(raw) {
      return run(() => {
        const { kind, id } = parse(readingRowInput, raw);
        gate(id);
        const { active, off } = lists(kind);
        const index = active.findIndex((row) => row.id === id);
        if (index === -1) {
          if (off.some((row) => row.id === id)) return;
          throw new MorningReadingRefusal("not_found", "No row with that id.");
        }
        const [row] = active.splice(index, 1);
        // The place is kept for Undo (D-USE-124).
        off.push({ ...row!, archivedAt: stamp() });
      });
    },

    turnReadingOn(raw) {
      return run(() => {
        const { kind, id, restore } = parse(turnOnInput, raw);
        gate(id);
        const { active, off } = lists(kind);
        const index = off.findIndex((row) => row.id === id);
        if (index === -1) {
          if (active.some((row) => row.id === id)) return;
          throw new MorningReadingRefusal("not_found", "No row with that id.");
        }
        const row: Ordered & { archivedAt?: string } = off.splice(index, 1)[0]!;
        delete row.archivedAt;
        if (!restore) row.sortOrder = endOf(active);
        active.push(row);
      });
    },

    deleteReadingRow(raw) {
      return run(() => {
        const { kind, id } = parse(readingRowInput, raw);
        gate(id);
        const { off } = lists(kind);
        const index = off.findIndex((row) => row.id === id);
        if (index === -1) {
          throw new MorningReadingRefusal(
            "not_off",
            "Only a row that is off can be deleted.",
          );
        }
        off.splice(index, 1);
      });
    },

    recoverMorningReading() {
      fails = false;
    },
  };
}
