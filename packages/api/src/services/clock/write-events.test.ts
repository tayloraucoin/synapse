import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import type { SlotEventRecord } from "@syn/validators";
import { refusalReason } from "../../errors";
import {
  writeEvents,
  type EventStore,
  type NewSlotEvent,
  type SlotDay,
} from "./write-events";

/**
 * USE-94 C1 to C3: `clock.writeEvents` over an in-memory store that honours
 * `slot_events_user_id_client_event_id_key` as Postgres does (a stored id is
 * dropped, never an error) and holds a batch's insert all or none.
 *
 * The account is Vancouver's, closing at 03:00: Saturday 17 October 2026
 * runs 10:00Z on the 17th to 10:00Z on the 18th.
 */

const DAY = "2026-10-17";
const NOW = new Date("2026-10-17T15:00:00.000Z");
const SLOT = "00000000-0000-4000-a000-0000000000a1";
const OTHER_SLOT = "00000000-0000-4000-a000-0000000000a2";

let n = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;

function memoryEvents(slots: SlotDay[] = [{ id: SLOT, onDate: DAY }]) {
  const rows: SlotEventRecord[] = [];
  let inserts = 0;
  const store: EventStore = {
    zone: () =>
      Promise.resolve({ timeZone: "America/Vancouver", dayCloseTime: "03:00" }),
    slotDays: (ids) =>
      Promise.resolve(slots.filter((slot) => ids.includes(slot.id))),
    eventsOf: (ids) =>
      Promise.resolve(
        structuredClone(rows.filter((row) => ids.includes(row.clientEventId))),
      ),
    insertNew: (fresh: readonly NewSlotEvent[]) => {
      inserts++;
      for (const row of fresh) {
        // ON CONFLICT (user_id, client_event_id) DO NOTHING.
        if (rows.some((r) => r.clientEventId === row.clientEventId)) continue;
        rows.push({ ...row, id: uuid(), createdAt: row.receivedAt });
      }
      return Promise.resolve();
    },
  };
  return { store, rows, inserts: () => inserts };
}

function event(over: Record<string, unknown> = {}) {
  return {
    slotId: SLOT,
    kind: "started",
    clientEventId: uuid(),
    at: "2026-10-17T14:59:00.000Z",
    ...over,
  };
}

async function refusal(run: () => Promise<unknown>) {
  const thrown = await run().then(
    () => null,
    (error: unknown) => error,
  );
  expect(thrown).toBeInstanceOf(TRPCError);
  return {
    reason: refusalReason(thrown as TRPCError),
    message: (thrown as TRPCError).message,
  };
}

describe("clock.writeEvents inserts each event once (C-USE-94-1)", () => {
  it("stores a batch, and the same batch again returns the stored rows and inserts nothing", async () => {
    const db = memoryEvents();
    const batch = [
      event({ kind: "started", at: "2026-10-17T14:00:00.000Z" }),
      event({ kind: "prompt_sent", at: "2026-10-17T14:30:00.000Z" }),
    ];
    const first = await writeEvents(db.store, batch, NOW);
    expect(first.map((e) => e.kind)).toEqual(["started", "prompt_sent"]);
    expect(first.every((e) => e.receivedAt === NOW.toISOString())).toBe(true);
    expect(db.rows).toHaveLength(2);

    const later = new Date("2026-10-17T15:01:00.000Z");
    const again = await writeEvents(db.store, batch, later);
    expect(again).toEqual(first);
    expect(db.rows).toHaveLength(2);
    expect(db.inserts()).toBe(1);
  });

  it("a replay keeps its first at, even sent with another", async () => {
    const db = memoryEvents();
    const tap = event();
    await writeEvents(db.store, [tap], NOW);
    const [replayed] = await writeEvents(
      db.store,
      [{ ...tap, at: "2026-10-17T14:59:30.000Z" }],
      NOW,
    );
    expect(replayed?.at).toBe(tap.at);
    expect(db.rows).toHaveLength(1);
  });

  it("an id twice in one batch is stored once", async () => {
    const db = memoryEvents();
    const tap = event();
    const out = await writeEvents(db.store, [tap, tap], NOW);
    expect(out).toHaveLength(1);
    expect(db.rows).toHaveLength(1);
  });

  it("returns the rows by at, then received_at", async () => {
    const db = memoryEvents();
    const early = event({ at: "2026-10-17T13:00:00.000Z" });
    const late = event({ kind: "paused", at: "2026-10-17T14:00:00.000Z" });
    await writeEvents(db.store, [early], NOW);
    const out = await writeEvents(db.store, [late, early], NOW);
    expect(out.map((e) => e.clientEventId)).toEqual([
      early.clientEventId,
      late.clientEventId,
    ]);
  });

  it("writes Step away's pauses with their one step_away_id", async () => {
    const db = memoryEvents([
      { id: SLOT, onDate: DAY },
      { id: OTHER_SLOT, onDate: DAY },
    ]);
    const stepAwayId = uuid();
    const out = await writeEvents(
      db.store,
      [
        event({ kind: "paused", stepAwayId }),
        event({ slotId: OTHER_SLOT, kind: "paused", stepAwayId }),
      ],
      NOW,
    );
    expect(out.map((e) => e.stepAwayId)).toEqual([stepAwayId, stepAwayId]);
  });
});

describe("an event outside its day or ahead of now is refused (C-USE-94-2)", () => {
  it("refuses an at before the slot's day opens", async () => {
    const db = memoryEvents();
    expect(
      await refusal(() =>
        writeEvents(db.store, [event({ at: "2026-10-17T09:59:59.000Z" })], NOW),
      ),
    ).toEqual({
      reason: "before-day",
      message: "The event's time is before-day.",
    });
  });

  it("refuses an at at or after the day's close", async () => {
    const db = memoryEvents();
    const close = new Date("2026-10-18T11:00:00.000Z");
    expect(
      await refusal(() =>
        writeEvents(
          db.store,
          [event({ at: "2026-10-18T10:00:00.000Z" })],
          close,
        ),
      ),
    ).toEqual({
      reason: "after-day",
      message: "The event's time is after-day.",
    });
  });

  it("refuses an at more than two minutes past the server's now, and takes one at two", async () => {
    const db = memoryEvents();
    expect(
      await refusal(() =>
        writeEvents(db.store, [event({ at: "2026-10-17T15:02:00.001Z" })], NOW),
      ),
    ).toEqual({
      reason: "ahead-of-now",
      message: "The event's time is ahead-of-now.",
    });
    await expect(
      writeEvents(db.store, [event({ at: "2026-10-17T15:02:00.000Z" })], NOW),
    ).resolves.toHaveLength(1);
  });

  it("accepts a replay sent hours later with its own in-window at", async () => {
    const db = memoryEvents();
    const tap = event({ at: "2026-10-17T11:00:00.000Z" });
    const hoursLater = new Date("2026-10-18T09:30:00.000Z");
    const [stored] = await writeEvents(db.store, [tap], hoursLater);
    expect(stored).toMatchObject({
      at: tap.at,
      receivedAt: hoursLater.toISOString(),
    });
  });

  it("refuses a slot not the caller's, and a malformed event, in the fixture's words", async () => {
    const db = memoryEvents();
    expect(
      await refusal(() =>
        writeEvents(db.store, [event({ slotId: OTHER_SLOT })], NOW),
      ),
    ).toEqual({ reason: "unknown-slot", message: "No slot with that id." });
    expect(
      await refusal(() =>
        writeEvents(
          db.store,
          [event({ kind: "started", stepAwayId: uuid() })],
          NOW,
        ),
      ),
    ).toEqual({
      reason: "invalid",
      message: "Only a pause or a resume carries a step away.",
    });
  });
});

describe("a batch lands whole or not at all (C-USE-94-3)", () => {
  it("one refused event writes none of the batch", async () => {
    const db = memoryEvents([
      { id: SLOT, onDate: DAY },
      { id: OTHER_SLOT, onDate: DAY },
    ]);
    const stepAwayId = uuid();
    const { reason } = await refusal(() =>
      writeEvents(
        db.store,
        [
          event({ kind: "paused", stepAwayId }),
          event({
            slotId: OTHER_SLOT,
            kind: "paused",
            stepAwayId,
            at: "2026-10-17T15:10:00.000Z",
          }),
        ],
        NOW,
      ),
    );
    expect(reason).toBe("ahead-of-now");
    expect(db.rows).toHaveLength(0);
    expect(db.inserts()).toBe(0);
  });
});
