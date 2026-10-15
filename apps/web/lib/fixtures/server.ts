import { addDays, checkEventTime, dayWindow } from "@syn/utils";
import {
  dayRecordRecord,
  displayNameSchema,
  morningLinesInput,
  morningLinesRecord,
  placeSlotInput,
  savedColourInput,
  savedColourRecord,
  slotEventInput,
  slotEventRecord,
  slotRecord,
  slotUpdateInput,
  type DayRecordRecord,
  type MorningLinesInput,
  type MorningLinesRecord,
  type PlaceSlotInput,
  type SavedColourInput,
  type SavedColourRecord,
  type SlotEventInput,
  type SlotEventRecord,
  type SlotRecord,
  type SlotUpdateInput,
} from "@syn/validators";
import type {
  MorningDayRecords,
  MorningRecords,
  ReadingRecords,
} from "@/lib/data/morning-records";
import type { TodayRecords } from "@/lib/data/today-records";
import type { AccountView } from "@/lib/data/use-account";
import {
  ALREADY_PLACED,
  createPlannerServer,
  PlannerRefusal,
  slotClash,
  type PlannerServer,
} from "./planner";
import { createWriteLog } from "./planner/journal";
import type { FixtureRecords } from "./records";
import type { Scenario } from "./scenarios";
import { createWorkServer, type WorkServer } from "./work";

/**
 * The fixture server (USE-7): an in-memory fake of the routers, held per
 * scenario. Reads return records; writes take the routers' inputs and refuse
 * what the routers will refuse. It stands where tRPC will stand, behind a
 * TanStack Query hook, and is never a store the UI reads directly.
 */

export type SlotEventRefusalReason =
  "invalid" | "unknown-slot" | "before-day" | "after-day" | "ahead-of-now";

/** A write the router would refuse, with the reason it would give. */
export class SlotEventRefusal extends Error {
  readonly reason: SlotEventRefusalReason;

  constructor(reason: SlotEventRefusalReason, message: string) {
    super(message);
    this.name = "SlotEventRefusal";
    this.reason = reason;
  }
}

/** A saved colour write the router would refuse (USE-11). */
export class SavedColourRefusal extends Error {
  readonly reason: "invalid" | "unknown" | "duplicate";

  constructor(reason: SavedColourRefusal["reason"], message: string) {
    super(message);
    this.name = "SavedColourRefusal";
    this.reason = reason;
  }
}

/** A slot write the router would refuse (USE-16). */
export class SlotWriteRefusal extends Error {
  readonly reason: "invalid" | "unknown" | "duplicate";

  constructor(reason: SlotWriteRefusal["reason"], message: string) {
    super(message);
    this.name = "SlotWriteRefusal";
    this.reason = reason;
  }
}

/** The `error` scenario's read, until retried. */
export class FixtureReadError extends Error {
  constructor() {
    super("The day could not be read.");
    this.name = "FixtureReadError";
  }
}

/** Orient's reading, failing on its own (`reading: "error"`) until retried. */
export class FixtureReadingError extends Error {
  constructor() {
    super("The morning's reading could not be read.");
    this.name = "FixtureReadingError";
  }
}

/** A write with no connection (`offline`): it waits on the device. */
export class FixtureOfflineError extends Error {
  constructor() {
    super("No connection.");
    this.name = "FixtureOfflineError";
  }
}

/** A profile write that did not land (`profileWrites: "fail"`), as a server error. */
export class FixtureProfileError extends Error {
  constructor() {
    super("The profile could not be saved.");
    this.name = "FixtureProfileError";
  }
}

/** A name the user router would refuse: empty, or past the cap. */
export class AccountNameRefusal extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountNameRefusal";
  }
}

/** A morning-lines write the router would refuse. */
export class MorningLinesRefusal extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MorningLinesRefusal";
  }
}

export interface FixtureServer extends PlannerServer, WorkServer {
  readToday(dateKey: string): Promise<TodayRecords>;
  writeSlotEvents(inputs: SlotEventInput[]): Promise<SlotEventRecord[]>;
  /**
   * Places a slot (`placeSlotInput`, a set item's slot on its first touch),
   * or with `id` changes one (`slotUpdateInput`). Returns the slot as stored.
   */
  writeSlots(input: PlaceSlotInput | SlotUpdateInput): Promise<SlotRecord>;
  /** Saved colours, newest (highest `sortOrder`) first. */
  listSavedColours(): Promise<SavedColourRecord[]>;
  /** Adds a colour, or with `id` changes one; a hex saved twice is refused. */
  writeSavedColour(
    input: SavedColourInput & { id?: string },
  ): Promise<SavedColourRecord>;
  removeSavedColour(id: string): Promise<void>;
  /** The account behind the avatar (USE-83); offline it is already on the device. */
  readAccount(): Promise<AccountView>;
  /**
   * The name, trimmed (USE-84). Not queued offline: the profile is not the
   * day's, so with no connection it fails at once (profile-sheet not-saved).
   */
  writeAccountName(name: string): Promise<AccountView>;
  /** The cropped photo, at once with no Save; the account as stored after. */
  uploadAccountPhoto(photo: Blob): Promise<AccountView>;
  /** The reading alone (USE-12): it may wait or fail while the rest reads. */
  readReading(dateKey: string): Promise<ReadingRecords>;
  /** The date's lines and the evening before's journal. */
  readMorningDay(dateKey: string): Promise<MorningDayRecords>;
  /** Both together: `{ passages, quote, links, lines, lastNight, prompts }`. */
  readMorning(dateKey: string): Promise<MorningRecords>;
  /** The open is the wake: `orientedAt` is written once, never moved. */
  stampOrient(dateKey: string, at: string): Promise<DayRecordRecord>;
  /** Only the lines sent change. */
  writeMorningLines(patch: MorningLinesInput): Promise<MorningLinesRecord>;
  /** The `error` scenario's retry: reads succeed from here on. */
  recover(): void;
  /** The reading's own retry (`reading: "error"`). */
  recoverReading(): void;
  /** The connection is back: writes go through (`offline`). */
  reconnect(): void;
}

function windowFor(records: FixtureRecords, dateKey: string) {
  return dayWindow(dateKey, records.timeZone, records.dayCloseTime);
}

function readRecords(records: FixtureRecords, dateKey: string): TodayRecords {
  const slots = records.slots.filter((slot) => slot.onDate === dateKey);
  const slotIds = new Set(slots.map((slot) => slot.id));
  // A copy, so a caller holding a read never sees a later write change it.
  return structuredClone({
    date: dateKey,
    timeZone: records.timeZone,
    dayWindow: windowFor(records, dateKey),
    blocks: records.blocks,
    blockChanges: records.blockChanges.filter(
      (change) => change.onDate === dateKey,
    ),
    blockItems: records.blockItems,
    slots,
    workItems: records.workItems,
    clients: records.clients,
    todos: records.todos,
    dayEvents: records.dayEvents.filter((event) => event.onDate === dateKey),
    slotEvents: records.slotEvents.filter((event) => slotIds.has(event.slotId)),
    dayRecord:
      records.dayRecords.find((record) => record.onDate === dateKey) ?? null,
    usualWakeTime: records.usualWakeTime,
  });
}

function readReadingRecords(
  records: FixtureRecords,
  dateKey: string,
): ReadingRecords {
  return structuredClone({
    passages: [...records.passages].sort((a, b) => a.sortOrder - b.sortOrder),
    quote: records.quotes.find((quote) => quote.onDate === dateKey) ?? null,
    links: [...records.links].sort((a, b) => a.sortOrder - b.sortOrder),
  });
}

function readMorningDayRecords(
  records: FixtureRecords,
  dateKey: string,
): MorningDayRecords {
  const yesterday = addDays(dateKey, -1);
  return structuredClone({
    lines: records.morningLines.find((row) => row.onDate === dateKey) ?? null,
    lastNight:
      records.journalEntries.find((entry) => entry.onDate === yesterday) ??
      null,
    prompts: records.journalPrompts ?? [],
  });
}

function refuseSlot(
  reason: SlotWriteRefusal["reason"],
  error: { issues: { message: string }[] },
): Promise<never> {
  return Promise.reject(
    new SlotWriteRefusal(reason, error.issues[0]?.message ?? "Invalid slot."),
  );
}

export function createFixtureServer(
  scenario: Scenario,
  now: () => Date,
): FixtureServer {
  const records = structuredClone(scenario.records);
  let failing = scenario.mode === "error";
  let readingFails = scenario.reading === "error";
  let offline = scenario.offline === true;

  function checkOne(raw: SlotEventInput): SlotEventInput {
    const parsed = slotEventInput.safeParse(raw);
    if (!parsed.success) {
      throw new SlotEventRefusal(
        "invalid",
        parsed.error.issues[0]?.message ?? "Invalid slot event.",
      );
    }
    const input = parsed.data;
    const slot = records.slots.find((row) => row.id === input.slotId);
    if (!slot) {
      throw new SlotEventRefusal("unknown-slot", "No slot with that id.");
    }
    const check = checkEventTime({
      at: input.at,
      dayWindow: windowFor(records, slot.onDate),
      serverNow: now(),
    });
    if (!check.ok) {
      throw new SlotEventRefusal(
        check.reason,
        `The event's time is ${check.reason}.`,
      );
    }
    return input;
  }

  const isOffline = () => offline;
  const offlineError = () => new FixtureOfflineError();
  // One Undo for planner and work writes alike (USE-36, USE-55).
  const log = createWriteLog({
    records,
    isOffline,
    offlineError,
    unknownUndo: () => new PlannerRefusal("unknown", "Nothing to undo."),
  });
  const planner = createPlannerServer({
    records,
    now,
    isOffline,
    offlineError,
    log,
  });
  const work = createWorkServer({ records, now, log });

  const server: FixtureServer = {
    // The set-up area's reads and writes (USE-36).
    ...planner,
    // The work side's reads and writes (USE-55).
    ...work,

    readPool() {
      if (scenario.mode === "loading") return new Promise(() => {});
      if (failing) return Promise.reject(new FixtureReadError());
      return work.readPool();
    },

    readWeek(week) {
      if (scenario.mode === "loading") return new Promise(() => {});
      if (failing) return Promise.reject(new FixtureReadError());
      return planner.readWeek(week);
    },

    readToday(dateKey) {
      if (scenario.mode === "loading") return new Promise(() => {});
      if (failing) return Promise.reject(new FixtureReadError());
      return Promise.resolve(readRecords(records, dateKey));
    },

    writeSlotEvents(inputs) {
      try {
        // All or nothing, as the router's transaction: check every event first.
        const known = new Map(
          records.slotEvents.map((event) => [event.clientEventId, event]),
        );
        const written: SlotEventRecord[] = [];
        const fresh: SlotEventRecord[] = [];
        for (const raw of inputs) {
          const replay = known.get(raw.clientEventId);
          if (replay) {
            // A replay keeps its first `at` and changes nothing.
            written.push(replay);
            continue;
          }
          const input = checkOne(raw);
          const stamp = now().toISOString();
          const record = slotEventRecord.parse({
            id: crypto.randomUUID(),
            createdAt: stamp,
            slotId: input.slotId,
            kind: input.kind,
            clientEventId: input.clientEventId,
            at: input.at,
            receivedAt: stamp,
            stepAwayId: input.stepAwayId ?? null,
          });
          known.set(record.clientEventId, record);
          fresh.push(record);
          written.push(record);
        }
        records.slotEvents.push(...fresh);
        return Promise.resolve(structuredClone(written));
      } catch (error) {
        return Promise.reject(error);
      }
    },

    readAccount() {
      return Promise.resolve(structuredClone(records.account));
    },

    writeAccountName(raw) {
      const parsed = displayNameSchema.safeParse(raw);
      if (!parsed.success) {
        return Promise.reject(
          new AccountNameRefusal(
            parsed.error.issues[0]?.message ?? "Invalid name.",
          ),
        );
      }
      if (offline) return Promise.reject(new FixtureOfflineError());
      if (scenario.profileWrites === "fail") {
        return Promise.reject(new FixtureProfileError());
      }
      records.account.name = parsed.data;
      return Promise.resolve(structuredClone(records.account));
    },

    uploadAccountPhoto(photo) {
      if (offline) return Promise.reject(new FixtureOfflineError());
      if (scenario.profileWrites === "fail") {
        return Promise.reject(new FixtureProfileError());
      }
      // The uploading capture: the upload is under way and stays so.
      if (scenario.profileWrites === "hang") return new Promise(() => {});
      // Stands for the asset router's URL; the page's life is the fixture's.
      records.account.photoUrl = URL.createObjectURL(photo);
      return Promise.resolve(structuredClone(records.account));
    },

    writeSlots(raw) {
      const stamp = now().toISOString();
      if ("id" in raw) {
        const parsed = slotUpdateInput.safeParse(raw);
        if (!parsed.success) return refuseSlot("invalid", parsed.error);
        // Sessions move a work item's tier (USE-8's); not a slot column.
        const { id, ...change } = parsed.data;
        delete change.sessions;
        const row = records.slots.find((slot) => slot.id === id);
        if (!row) {
          return Promise.reject(
            new SlotWriteRefusal("unknown", "No slot with that id."),
          );
        }
        // Only the keys sent change; `null` clears (doneAt, tookMin).
        for (const [key, value] of Object.entries(change)) {
          if (value !== undefined) Object.assign(row, { [key]: value });
        }
        row.updatedAt = stamp;
        return Promise.resolve(structuredClone(slotRecord.parse(row)));
      }
      const parsed = placeSlotInput.safeParse(raw);
      if (!parsed.success) return refuseSlot("invalid", parsed.error);
      const input = parsed.data;
      // One slot per set item and per work item on a date: a second place is refused.
      if (slotClash(records.slots, input)) {
        return Promise.reject(
          new SlotWriteRefusal("duplicate", ALREADY_PLACED),
        );
      }
      const record = slotRecord.parse({
        id: crypto.randomUUID(),
        createdAt: stamp,
        updatedAt: stamp,
        blockId: input.blockId,
        onDate: input.onDate,
        skipped: input.skipped ?? false,
        sortOrder: input.sortOrder,
        blockItemId: input.blockItemId ?? null,
        todoId: input.todoId ?? null,
        workItemId: input.workItemId ?? null,
        tier: input.tier ?? null,
        lengthMin: input.lengthMin ?? null,
        tookMin: null,
        doneAt: null,
      });
      records.slots.push(record);
      return Promise.resolve(structuredClone(record));
    },

    listSavedColours() {
      return Promise.resolve(
        structuredClone(
          [...records.savedColours].sort((a, b) => b.sortOrder - a.sortOrder),
        ),
      );
    },

    writeSavedColour(raw) {
      const parsed = savedColourInput.safeParse(raw);
      if (!parsed.success) {
        return Promise.reject(
          new SavedColourRefusal(
            "invalid",
            parsed.error.issues[0]?.message ?? "Invalid saved colour.",
          ),
        );
      }
      const input = parsed.data;
      // saved_colours_user_id_hex_key: one row per hex.
      const clash = records.savedColours.find(
        (row) => row.hex === input.hex && row.id !== raw.id,
      );
      if (clash) {
        return Promise.reject(
          new SavedColourRefusal("duplicate", "That colour is already saved."),
        );
      }
      const stamp = now().toISOString();
      if (raw.id !== undefined) {
        const row = records.savedColours.find((r) => r.id === raw.id);
        if (!row) {
          return Promise.reject(
            new SavedColourRefusal("unknown", "No saved colour with that id."),
          );
        }
        Object.assign(row, input, { updatedAt: stamp });
        return Promise.resolve(structuredClone(row));
      }
      const record = savedColourRecord.parse({
        id: crypto.randomUUID(),
        createdAt: stamp,
        updatedAt: stamp,
        ...input,
      });
      records.savedColours.push(record);
      return Promise.resolve(structuredClone(record));
    },

    removeSavedColour(id) {
      const index = records.savedColours.findIndex((row) => row.id === id);
      if (index === -1) {
        return Promise.reject(
          new SavedColourRefusal("unknown", "No saved colour with that id."),
        );
      }
      records.savedColours.splice(index, 1);
      return Promise.resolve();
    },

    readReading(dateKey) {
      if (scenario.reading === "loading") return new Promise(() => {});
      if (readingFails) return Promise.reject(new FixtureReadingError());
      return Promise.resolve(readReadingRecords(records, dateKey));
    },

    readMorningDay(dateKey) {
      return Promise.resolve(readMorningDayRecords(records, dateKey));
    },

    async readMorning(dateKey) {
      const [reading, day] = await Promise.all([
        server.readReading(dateKey),
        server.readMorningDay(dateKey),
      ]);
      return { ...reading, ...day };
    },

    stampOrient(dateKey, at) {
      if (offline) return Promise.reject(new FixtureOfflineError());
      const stamp = now().toISOString();
      const row = records.dayRecords.find((r) => r.onDate === dateKey);
      if (row) {
        // A second open keeps the first wake.
        if (row.orientedAt === null) {
          row.orientedAt = at;
          row.updatedAt = stamp;
        }
        return Promise.resolve(structuredClone(dayRecordRecord.parse(row)));
      }
      const record = dayRecordRecord.parse({
        id: crypto.randomUUID(),
        createdAt: stamp,
        updatedAt: stamp,
        onDate: dateKey,
        orientedAt: at,
        readyAt: null,
        closedAt: null,
      });
      records.dayRecords.push(record);
      return Promise.resolve(structuredClone(record));
    },

    writeMorningLines(raw) {
      const parsed = morningLinesInput.safeParse(raw);
      if (!parsed.success) {
        return Promise.reject(
          new MorningLinesRefusal(
            parsed.error.issues[0]?.message ?? "Invalid lines.",
          ),
        );
      }
      if (offline) return Promise.reject(new FixtureOfflineError());
      const { onDate, ...patch } = parsed.data;
      let row = records.morningLines.find((r) => r.onDate === onDate);
      if (!row) {
        row = morningLinesRecord.parse({
          onDate,
          grateful: null,
          intention: null,
          todayAsISeeIt: null,
        });
        records.morningLines.push(row);
      }
      // Only the keys sent change.
      for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined) Object.assign(row, { [key]: value });
      }
      return Promise.resolve(structuredClone(row));
    },

    recover() {
      failing = false;
    },

    recoverReading() {
      readingFails = false;
    },

    reconnect() {
      offline = false;
    },
  };
  return server;
}
