import { DEFAULT_JOURNAL_PROMPTS } from "@syn/constants";
import {
  addDays,
  checkEventTime,
  dayWindow,
  nextTodoDue,
  resolveDayKey,
} from "@syn/utils";
import {
  dayRecordRecord,
  displayNameSchema,
  journalEntryRecord,
  journalSaveInput,
  mealTopicInput,
  mealTopicRecord,
  morningLinesInput,
  morningLinesRecord,
  placeSlotInput,
  savedColourInput,
  savedColourRecord,
  slotEventInput,
  slotEventRecord,
  slotRecord,
  slotUpdateInput,
  todoInput,
  todoRecord,
  type DayRecordRecord,
  type JournalEntryRecord,
  type JournalSaveInput,
  type MealTopicInput,
  type MealTopicRecord,
  type MorningLinesInput,
  type MorningLinesRecord,
  type PlaceSlotInput,
  type SavedColourInput,
  type SavedColourRecord,
  type SlotEventInput,
  type SlotEventRecord,
  type SlotRecord,
  type SlotUpdateInput,
  type TodoInput,
  type TodoRecord,
} from "@syn/validators";
import type { JournalRecords } from "@/lib/data/journal-records";
import type {
  MorningDayRecords,
  MorningRecords,
  ReadingRecords,
} from "@/lib/data/morning-records";
import {
  AccountNameRefusal,
  FixtureOfflineError,
  JournalWriteRefusal,
  MealTopicRefusal,
  MorningLinesRefusal,
  SavedColourRefusal,
  SlotEventRefusal,
  SlotWriteRefusal,
  TodoWriteRefusal,
} from "@/lib/data/refusals";
import type { TodayRecords } from "@/lib/data/today-records";
import type { AccountView } from "@/lib/data/use-account";
import type { TodosRecords } from "@/lib/data/use-todos";
import {
  writeTodoSlot,
  type TodoSlotInput,
  type TodoSlotWrite,
} from "@/lib/data/write-todo-slot";
import {
  createIntegrationServer,
  type IntegrationServer,
} from "./integrations";
import {
  connectFixture,
  readGoogleCalendars,
  type ConnectKind,
  type GoogleCalendarsRecords,
} from "./integrations/connect";
import { googleEventsOnDate } from "./integrations/records";
import {
  byReadingOrder,
  createMorningReadingServer,
  type MorningReadingServer,
} from "./morning-reading";
import {
  ALREADY_PLACED,
  createPlannerServer,
  PlannerRefusal,
  slotClash,
  type PlannerServer,
} from "./planner";
import { createWriteLog } from "./planner/journal";
import { eventOn } from "./planner/read-week";
import type { FixtureRecords } from "./records";
import type { Scenario } from "./scenarios";
import { createWorkServer, type WorkServer } from "./work";

/**
 * The fixture server (USE-7): an in-memory fake of the routers, held per
 * scenario. Reads return records; writes take the routers' inputs and refuse
 * what the routers will refuse. It stands where tRPC will stand, behind a
 * TanStack Query hook, and is never a store the UI reads directly.
 */

// The refusals are the routers' as much as the fixtures' (USE-90).
export {
  AccountNameRefusal,
  FixtureOfflineError,
  JournalWriteRefusal,
  MealTopicRefusal,
  MorningLinesRefusal,
  SavedColourRefusal,
  SlotEventRefusal,
  SlotWriteRefusal,
  TodoWriteRefusal,
};
export type { SlotEventRefusalReason } from "@/lib/data/refusals";

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

/** A profile write that did not land (`profileWrites: "fail"`), as a server error. */
export class FixtureProfileError extends Error {
  constructor() {
    super("The profile could not be saved.");
    this.name = "FixtureProfileError";
  }
}

/** The to-dos' own read, failing on its own (`regions.todos`) until retried. */
export class FixtureTodosReadError extends Error {
  constructor() {
    super("The to-dos could not be read.");
    this.name = "FixtureTodosReadError";
  }
}

/** A write named in `failWrites`: it rejects once, then goes through. */
export class FixtureWriteError extends Error {
  constructor() {
    super("The write did not save.");
    this.name = "FixtureWriteError";
  }
}

/**
 * A deleted to-do with everything that went with it (USE-29): the slots that
 * took it and their events, as `slots.todo_id`'s cascade takes them. Undo
 * puts back exactly this.
 */
export interface RemovedTodo {
  todo: TodoRecord;
  slots: SlotRecord[];
  slotEvents: SlotEventRecord[];
}

export interface FixtureServer
  extends PlannerServer, WorkServer, IntegrationServer, MorningReadingServer {
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
  /** Meal topics in their order (lowest `sortOrder` first): the chips' order. */
  listMealTopics(): Promise<MealTopicRecord[]>;
  /** Adds a topic (`mealTopicInput`), or with `id` changes one. */
  writeMealTopic(
    input: MealTopicInput & { id?: string },
  ): Promise<MealTopicRecord>;
  removeMealTopic(id: string): Promise<void>;
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
  /**
   * Ready, go (USE-31; D-USE-71): `readyAt` is written once and a second
   * press keeps the first. A day with no record yet is oriented at the
   * same minute [ASSUMPTION: Review the day is only reached after Orient].
   */
  readyGo(dateKey: string, at: string): Promise<DayRecordRecord>;
  /**
   * Whether Ready, go was given on any date before this one (USE-43): the
   * welcome's first go ever is derived from it; nothing is stored for it.
   */
  readReadiedBefore(dateKey: string): Promise<boolean>;
  /**
   * Close the day (USE-44): the date's entry, the person's prompts (the
   * defaults when none are set) and the quote on its day.
   */
  readJournal(dateKey: string): Promise<JournalRecords>;
  /**
   * One answer (`journalSaveInput`): only its key changes, merged into the
   * date's entry as the router's jsonb merge does. Offline it waits.
   */
  writeJournalAnswer(input: JournalSaveInput): Promise<JournalEntryRecord>;
  /** Only the lines sent change. */
  writeMorningLines(patch: MorningLinesInput): Promise<MorningLinesRecord>;
  /**
   * The to-dos alone (USE-19): every to-do, the to-do slots on any date and
   * the blocks they sit in, so a slot's end is read as the day reads it.
   */
  readTodos(dateKey: string): Promise<TodosRecords>;
  /** A new to-do (`todoInput`). */
  writeTodo(input: TodoInput): Promise<TodoRecord>;
  /**
   * New to-do in a To-dos block (USE-111): the to-do, then its slot, as the
   * planner queue's one write.
   */
  writeTodoSlot(input: TodoSlotInput): Promise<TodoSlotWrite>;
  /**
   * The To-do sheet's change (USE-28): only the keys sent change, checked
   * against `todoInput` as the to-do will be after it.
   */
  updateTodo(input: {
    id: string;
    patch: Partial<TodoInput>;
  }): Promise<TodoRecord>;
  /** A to-do's box: `doneAt` set, or cleared by uncheck. */
  writeTodoDone(input: {
    id: string;
    doneAt: string | null;
  }): Promise<TodoRecord>;
  /**
   * Delete to-do (USE-29): the to-do, the slots that took it on any date and
   * their events, all at once. Returns what went, for Undo.
   */
  removeTodo(id: string): Promise<RemovedTodo>;
  /** Undo of a delete: the to-do and its slots back as they were. */
  restoreTodo(removed: RemovedTodo): Promise<TodoRecord>;
  /** The to-dos' own retry (`regions.todos: "error"`). */
  recoverTodos(): void;
  /**
   * A Set my days day's column, its own read (USE-39): it waits or fails
   * alone (`regions.setUpColumn`) while the header, chips and bounds paint.
   */
  readSetUpColumn(): Promise<void>;
  /** The `error` scenario's retry: reads succeed from here on. */
  recover(): void;
  /** The reading's own retry (`reading: "error"`). */
  recoverReading(): void;
  /** The connection is back: writes go through (`offline`). */
  reconnect(): void;
  /**
   * Settings' Google section alone (USE-85): it waits or fails on its own
   * (`regions.calendars`) while Linear and Clients read.
   */
  readGoogleCalendars(): Promise<GoogleCalendarsRecords>;
  /**
   * Add a Google account or Add a workspace, as the provider's sign-in
   * coming back (USE-85). Offline it is refused; `failWrites: ["connect"]`
   * fails it once; `connects: "hang"` leaves it away at the provider.
   */
  connect(kind: ConnectKind): Promise<void>;
  /** Connections' own retry (`regions.connections`). */
  recoverConnections(): void;
  /** The calendar list's own retry (`regions.calendars`). */
  recoverCalendars(): void;
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
    // Repeating events too, as the week reads them (USE-58).
    dayEvents: records.dayEvents.filter((event) => eventOn(event, dateKey)),
    slotEvents: records.slotEvents.filter((event) => slotIds.has(event.slotId)),
    dayRecord:
      records.dayRecords.find((record) => record.onDate === dateKey) ?? null,
    usualWakeTime: records.usualWakeTime,
    googleEvents: googleEventsOnDate(records, dateKey),
  });
}

function readReadingRecords(
  records: FixtureRecords,
  dateKey: string,
): ReadingRecords {
  return structuredClone({
    // Settings › Morning reading's order, so the two never differ (USE-151).
    passages: [...records.passages].sort(byReadingOrder),
    quote: records.quotes.find((quote) => quote.onDate === dateKey) ?? null,
    links: [...records.links].sort(byReadingOrder),
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
  let todosFail = scenario.regions?.todos === "error";
  // The Week's own read, failing alone while the pool reads (USE-72).
  let weekFails = scenario.regions?.week === "error";
  // Set my days' column, failing alone while the day's own controls read (USE-39).
  let columnFails = scenario.regions?.setUpColumn === "error";
  // Settings' Connections and its calendar list, failing alone (USE-85).
  let connectionsFail = scenario.regions?.connections === "error";
  let calendarsFail = scenario.regions?.calendars === "error";
  // Each id rejects its next write once (`failWrites`).
  const failNext = new Set(scenario.failWrites ?? []);

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
  const integrations = createIntegrationServer({
    records,
    now,
    isOffline,
    offlineError,
    options: {
      linearSends: scenario.linearSends,
      linearClosesOnSync: scenario.linearClosesOnSync,
    },
  });
  // Settings › Morning reading (USE-151), over the passages Orient reads.
  const morningReading = createMorningReadingServer({
    records,
    now,
    isOffline,
    read: {
      waits: scenario.regions?.morningReading === "loading",
      fails: scenario.regions?.morningReading === "error",
    },
    failOnce: (id) => (failNext.delete(id) ? new FixtureWriteError() : null),
  });

  const server: FixtureServer = {
    // The set-up area's reads and writes (USE-36).
    ...planner,
    // The work side's reads and writes (USE-55).
    ...work,
    // Linear, Google and the client mappings (USE-56).
    ...integrations,
    // Settings › Morning reading's list and writes (USE-151).
    ...morningReading,

    // Set my days' bounds (USE-39): `failWrites: ["bounds"]` fails the next
    // once; `setUp.save: "hang"` leaves it sending, for Saving's capture.
    writeBounds(input) {
      if (scenario.setUp?.save === "hang") return new Promise(() => {});
      if (failNext.delete("bounds")) {
        return Promise.reject(new FixtureWriteError());
      }
      return planner.writeBounds(input);
    },

    readSetUpColumn() {
      if (scenario.mode === "loading") return new Promise(() => {});
      if (scenario.regions?.setUpColumn === "loading") {
        return new Promise(() => {});
      }
      if (failing || columnFails) return Promise.reject(new FixtureReadError());
      return Promise.resolve();
    },

    // The New block sheet's add (USE-46): `failWrites: ["new-block"]` fails it once.
    createBlock(input, scope) {
      if (failNext.delete("new-block")) {
        return Promise.reject(new FixtureWriteError());
      }
      return planner.createBlock(input, scope);
    },

    createTransition(input, scope) {
      if (failNext.delete("new-block")) {
        return Promise.reject(new FixtureWriteError());
      }
      return planner.createTransition(input, scope);
    },

    readPool() {
      if (scenario.mode === "loading") return new Promise(() => {});
      if (failing) return Promise.reject(new FixtureReadError());
      return work.readPool();
    },

    readWeek(week) {
      if (scenario.mode === "loading" || scenario.regions?.week === "loading") {
        return new Promise(() => {});
      }
      if (failing || weekFails) return Promise.reject(new FixtureReadError());
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
      // A tick captured while its write is still out.
      if (scenario.slotWrites === "hang") return new Promise(() => {});
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
        // `failWrites` names the slot, or the set item or to-do it holds, so
        // a slot placed on first touch can fail too (USE-21). Offline, a slot
        // write lands as online; the queue is wave 3's.
        for (const key of [row.id, row.blockItemId, row.todoId]) {
          if (key !== null && failNext.delete(key)) {
            return Promise.reject(new FixtureWriteError());
          }
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
        notes: input.notes || null,
        atTime: input.atTime ?? null,
        icon: input.icon ?? null,
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

    listMealTopics() {
      return Promise.resolve(
        structuredClone(
          [...(records.mealTopics ?? [])].sort(
            (a, b) => a.sortOrder - b.sortOrder,
          ),
        ),
      );
    },

    writeMealTopic(raw) {
      const parsed = mealTopicInput.safeParse(raw);
      if (!parsed.success) {
        return Promise.reject(
          new MealTopicRefusal(
            "invalid",
            parsed.error.issues[0]?.message ?? "Invalid meal topic.",
          ),
        );
      }
      const input = { ...parsed.data, icon: parsed.data.icon ?? null };
      const topics = (records.mealTopics ??= []);
      const stamp = now().toISOString();
      if (raw.id !== undefined) {
        const row = topics.find((r) => r.id === raw.id);
        if (!row) {
          return Promise.reject(
            new MealTopicRefusal("unknown", "No meal topic with that id."),
          );
        }
        Object.assign(row, input, { updatedAt: stamp });
        return Promise.resolve(structuredClone(row));
      }
      const record = mealTopicRecord.parse({
        id: crypto.randomUUID(),
        createdAt: stamp,
        updatedAt: stamp,
        ...input,
      });
      topics.push(record);
      return Promise.resolve(structuredClone(record));
    },

    removeMealTopic(id) {
      const topics = records.mealTopics ?? [];
      const index = topics.findIndex((row) => row.id === id);
      if (index === -1) {
        return Promise.reject(
          new MealTopicRefusal("unknown", "No meal topic with that id."),
        );
      }
      topics.splice(index, 1);
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

    readReadiedBefore(dateKey) {
      return Promise.resolve(
        records.dayRecords.some(
          (row) => row.onDate < dateKey && row.readyAt !== null,
        ),
      );
    },

    readyGo(dateKey, at) {
      if (offline) return Promise.reject(new FixtureOfflineError());
      const stamp = now().toISOString();
      const row = records.dayRecords.find((r) => r.onDate === dateKey);
      if (row) {
        // A second press keeps the first.
        if (row.readyAt === null) {
          row.readyAt = at;
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
        readyAt: at,
        closedAt: null,
      });
      records.dayRecords.push(record);
      return Promise.resolve(structuredClone(record));
    },

    readJournal(dateKey) {
      const prompts =
        records.journalPrompts !== undefined &&
        records.journalPrompts.length > 0
          ? records.journalPrompts
          : DEFAULT_JOURNAL_PROMPTS.map(({ key, label }) => ({ key, label }));
      return Promise.resolve(
        structuredClone({
          entry:
            records.journalEntries.find((entry) => entry.onDate === dateKey) ??
            null,
          prompts,
          quote:
            records.quotes.find((quote) => quote.onDate === dateKey) ?? null,
        }),
      );
    },

    writeJournalAnswer(raw) {
      const parsed = journalSaveInput.safeParse(raw);
      if (!parsed.success) {
        return Promise.reject(
          new JournalWriteRefusal(
            parsed.error.issues[0]?.message ?? "Invalid answer.",
          ),
        );
      }
      if (offline) return Promise.reject(new FixtureOfflineError());
      const { date, key, value } = parsed.data;
      let row = records.journalEntries.find((entry) => entry.onDate === date);
      if (!row) {
        row = journalEntryRecord.parse({ onDate: date, answers: {} });
        records.journalEntries.push(row);
      }
      // One key per save: every other answer stays as it was.
      row.answers[key] = value;
      return Promise.resolve(structuredClone(row));
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

    readTodos(dateKey) {
      if (scenario.regions?.todos === "loading") return new Promise(() => {});
      if (todosFail) return Promise.reject(new FixtureTodosReadError());
      return Promise.resolve(
        structuredClone({
          date: dateKey,
          timeZone: records.timeZone,
          dayWindow: windowFor(records, dateKey),
          todos: records.todos,
          slots: records.slots.filter((slot) => slot.todoId !== null),
          blocks: records.blocks,
          blockChanges: records.blockChanges,
        }),
      );
    },

    writeTodo(raw) {
      const parsed = todoInput.safeParse(raw);
      if (!parsed.success) {
        return Promise.reject(
          new TodoWriteRefusal(
            "invalid",
            parsed.error.issues[0]?.message ?? "Invalid to-do.",
          ),
        );
      }
      const input = parsed.data;
      const stamp = now().toISOString();
      const record = todoRecord.parse({
        id: crypto.randomUUID(),
        createdAt: stamp,
        updatedAt: stamp,
        title: input.title,
        type: input.type,
        icon: input.icon ?? null,
        lengthMin: input.lengthMin ?? null,
        notes: input.notes ?? null,
        onDate: input.onDate ?? null,
        rrule: input.rrule ?? null,
        remindAt: input.remindAt ?? null,
        remindOn: input.remindOn ?? null,
        doneAt: null,
        archivedAt: null,
      });
      records.todos.push(record);
      return Promise.resolve(structuredClone(record));
    },

    writeTodoSlot(input) {
      return writeTodoSlot(server, input);
    },

    writeTodoDone({ id, doneAt }) {
      // Offline, the to-dos write as online here; their persistence is wave 3's.
      if (failNext.delete(id)) return Promise.reject(new FixtureWriteError());
      const row = records.todos.find((todo) => todo.id === id);
      if (!row) {
        return Promise.reject(
          new TodoWriteRefusal("unknown", "No to-do with that id."),
        );
      }
      const wasDone = row.doneAt !== null;
      row.doneAt = doneAt;
      row.updatedAt = now().toISOString();
      // A repeating one checked comes back on its next due date as a new
      // to-do; the done one stays done (repeats-open.md). The rule moves to
      // the new one, so the series has one open to-do and one live rule.
      if (doneAt !== null && !wasDone && row.rrule !== null) {
        const due = nextTodoDue({
          rrule: row.rrule,
          onDate: row.onDate,
          checkedOn: resolveDayKey(
            new Date(doneAt),
            records.timeZone,
            records.dayCloseTime,
          ),
        });
        if (due !== null) {
          records.todos.push(
            todoRecord.parse({
              ...row,
              id: crypto.randomUUID(),
              createdAt: row.updatedAt,
              onDate: due,
              remindOn: row.remindAt === null ? null : due,
              doneAt: null,
            }),
          );
          row.rrule = null;
        }
      }
      return Promise.resolve(structuredClone(todoRecord.parse(row)));
    },

    updateTodo({ id, patch }) {
      // Offline, the to-dos write as online here; their persistence is wave 3's.
      if (failNext.delete(id)) return Promise.reject(new FixtureWriteError());
      const row = records.todos.find((todo) => todo.id === id);
      if (!row) {
        return Promise.reject(
          new TodoWriteRefusal("unknown", "No to-do with that id."),
        );
      }
      const parsed = todoInput.safeParse({ ...row, ...patch });
      if (!parsed.success) {
        return Promise.reject(
          new TodoWriteRefusal(
            "invalid",
            parsed.error.issues[0]?.message ?? "Invalid to-do.",
          ),
        );
      }
      // A day given, or a reminder's day moved, is never before today
      // (USE-29); a day already stored and sent again is left alone.
      const todayKey = resolveDayKey(
        now(),
        records.timeZone,
        records.dayCloseTime,
      );
      for (const key of ["onDate", "remindOn"] as const) {
        const day = patch[key];
        if (typeof day === "string" && day !== row[key] && day < todayKey) {
          return Promise.reject(
            new TodoWriteRefusal("past-day", "A day before today."),
          );
        }
      }
      for (const key of Object.keys(patch) as (keyof TodoInput)[]) {
        Object.assign(row, { [key]: parsed.data[key] ?? null });
      }
      row.updatedAt = now().toISOString();
      return Promise.resolve(structuredClone(todoRecord.parse(row)));
    },

    removeTodo(id) {
      if (failNext.delete(id)) return Promise.reject(new FixtureWriteError());
      const todo = records.todos.find((row) => row.id === id);
      if (!todo) {
        return Promise.reject(
          new TodoWriteRefusal("unknown", "No to-do with that id."),
        );
      }
      const slots = records.slots.filter((slot) => slot.todoId === id);
      const slotIds = new Set(slots.map((slot) => slot.id));
      const slotEvents = records.slotEvents.filter((event) =>
        slotIds.has(event.slotId),
      );
      records.todos = records.todos.filter((row) => row.id !== id);
      records.slots = records.slots.filter((slot) => !slotIds.has(slot.id));
      records.slotEvents = records.slotEvents.filter(
        (event) => !slotIds.has(event.slotId),
      );
      return Promise.resolve(structuredClone({ todo, slots, slotEvents }));
    },

    restoreTodo(removed) {
      const { todo, slots, slotEvents } = structuredClone(removed);
      // Undo twice puts it back once.
      if (!records.todos.some((row) => row.id === todo.id)) {
        records.todos.push(todo);
      }
      const slotIds = new Set(records.slots.map((slot) => slot.id));
      records.slots.push(...slots.filter((slot) => !slotIds.has(slot.id)));
      const eventIds = new Set(records.slotEvents.map((event) => event.id));
      records.slotEvents.push(
        ...slotEvents.filter((event) => !eventIds.has(event.id)),
      );
      return Promise.resolve(structuredClone(todo));
    },

    recoverTodos() {
      todosFail = false;
    },

    recover() {
      failing = false;
      weekFails = false;
      columnFails = false;
    },

    recoverReading() {
      readingFails = false;
    },

    reconnect() {
      offline = false;
    },

    // Settings › Connections (USE-85). Nothing here reaches Google or Linear.
    readConnections() {
      if (scenario.regions?.connections === "loading") {
        return new Promise(() => {});
      }
      if (connectionsFail) return Promise.reject(new FixtureReadError());
      return integrations.readConnections();
    },

    readGoogleCalendars() {
      const wait =
        scenario.regions?.connections === "loading" ||
        scenario.regions?.calendars === "loading";
      if (wait) return new Promise(() => {});
      if (connectionsFail || calendarsFail) {
        return Promise.reject(new FixtureReadError());
      }
      return Promise.resolve(readGoogleCalendars(records));
    },

    // A switch saves on the phone offline (offline.md); `failWrites` names it.
    writeCalendar(input) {
      if (failNext.delete(input.calendarId)) {
        return Promise.reject(new FixtureWriteError());
      }
      return integrations.writeCalendar(input);
    },

    connect(kind) {
      if (offline) return Promise.reject(new FixtureOfflineError());
      if (scenario.connects === "hang") return new Promise(() => {});
      if (failNext.delete("connect")) {
        return Promise.reject(new FixtureWriteError());
      }
      connectFixture(records, kind, now().toISOString());
      return Promise.resolve();
    },

    // Disconnect needs Linear: refused offline (offline.md).
    disconnect(connectionId) {
      if (offline) return Promise.reject(new FixtureOfflineError());
      return integrations.disconnect(connectionId);
    },

    recoverConnections() {
      connectionsFail = false;
    },

    recoverCalendars() {
      calendarsFail = false;
    },
  };
  return server;
}
