import { checkEventTime, dayWindow } from "@syn/utils";
import {
  placeSlotInput,
  savedColourInput,
  savedColourRecord,
  slotEventInput,
  slotEventRecord,
  slotRecord,
  slotUpdateInput,
  type PlaceSlotInput,
  type SavedColourInput,
  type SavedColourRecord,
  type SlotEventInput,
  type SlotEventRecord,
  type SlotRecord,
  type SlotUpdateInput,
} from "@syn/validators";
import type { TodayRecords } from "@/lib/data/today-records";
import type { AccountView } from "@/lib/data/use-account";
import type { FixtureRecords } from "./records";
import type { Scenario } from "./scenarios";

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

export interface FixtureServer {
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
  /** The `error` scenario's retry: reads succeed from here on. */
  recover(): void;
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

  return {
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
      // One slot per set item on a date: a second place is refused.
      const clash =
        input.blockItemId != null &&
        records.slots.some(
          (slot) =>
            slot.blockItemId === input.blockItemId &&
            slot.onDate === input.onDate,
        );
      if (clash) {
        return Promise.reject(
          new SlotWriteRefusal("duplicate", "That item is already placed."),
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

    readAccount() {
      return Promise.resolve(structuredClone(records.account));
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

    recover() {
      failing = false;
    },
  };
}
