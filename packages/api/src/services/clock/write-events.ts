import { checkEventTime, dayWindow } from "@syn/utils";
import {
  slotEventInput,
  type SlotEventInput,
  type SlotEventRecord,
} from "@syn/validators";
import { refuse } from "../../errors";

/**
 * The clock's write path (USE-94): Start, Pause, Prompt sent, Bring back,
 * Done and Step away, as slot events, the fixture server's `writeSlotEvents`
 * live. The clock is the events; nothing here stores a running total.
 *
 * APPEND-ONLY. A batch is parsed, every event checked against its slot's day
 * and the server's now, then inserted in one statement, a client event id
 * already stored being dropped (`slot_events_user_id_client_event_id_key`).
 * A replay is never checked again: it keeps the `at` it was first stored
 * with, as the fixture's does. Any refusal refuses the batch before anything
 * is inserted, and the caller runs it in one transaction: all or none.
 */

/** A slot's date, the day window's key. */
export interface SlotDay {
  id: string;
  onDate: string;
}

/** What a batch reads and inserts; the caller's rows only (RLS). */
export interface EventStore {
  /** The account's zone and close time, `HH:MM`. */
  zone(): Promise<{ timeZone: string; dayCloseTime: string }>;
  /** The caller's slots among `ids`; another user's reads as absent. */
  slotDays(ids: readonly string[]): Promise<SlotDay[]>;
  /** The caller's stored events among the client event ids. */
  eventsOf(clientEventIds: readonly string[]): Promise<SlotEventRecord[]>;
  /** Inserts each row, a stored client event id being a no-op. */
  insertNew(rows: readonly NewSlotEvent[]): Promise<void>;
}

/** An event as it is inserted: the device's fields and the server's stamp. */
export type NewSlotEvent = Omit<SlotEventRecord, "id" | "createdAt">;

function parseEvent(raw: unknown): SlotEventInput {
  const parsed = slotEventInput.safeParse(raw);
  if (!parsed.success) {
    throw refuse(
      "invalid",
      parsed.error.issues[0]?.message ?? "Invalid slot event.",
    );
  }
  return parsed.data;
}

/** By `at`, then `received_at`: `deriveClock`'s order, so a merge is stable. */
export function byEventTime(a: SlotEventRecord, b: SlotEventRecord): number {
  return (
    Date.parse(a.at) - Date.parse(b.at) ||
    Date.parse(a.receivedAt) - Date.parse(b.receivedAt)
  );
}

export async function writeEvents(
  store: EventStore,
  inputs: readonly unknown[],
  now: Date,
): Promise<SlotEventRecord[]> {
  const parsed = inputs.map(parseEvent);
  const ids = [...new Set(parsed.map((event) => event.clientEventId))];
  if (ids.length === 0) return [];

  const stored = new Set(
    (await store.eventsOf(ids)).map((event) => event.clientEventId),
  );
  // The batch's own first of each id; a stored one is a replay, dropped.
  const fresh = new Map<string, SlotEventInput>();
  for (const event of parsed) {
    if (!stored.has(event.clientEventId) && !fresh.has(event.clientEventId)) {
      fresh.set(event.clientEventId, event);
    }
  }

  if (fresh.size > 0) {
    const events = [...fresh.values()];
    const days = new Map(
      (await store.slotDays([...new Set(events.map((e) => e.slotId))])).map(
        (slot) => [slot.id, slot.onDate],
      ),
    );
    const { timeZone, dayCloseTime } = await store.zone();
    for (const event of events) {
      const onDate = days.get(event.slotId);
      if (onDate === undefined) {
        throw refuse("unknown-slot", "No slot with that id.");
      }
      const check = checkEventTime({
        at: event.at,
        dayWindow: dayWindow(onDate, timeZone, dayCloseTime),
        serverNow: now,
      });
      if (!check.ok) {
        throw refuse(check.reason, `The event's time is ${check.reason}.`);
      }
    }
    const receivedAt = now.toISOString();
    await store.insertNew(
      events.map((event) => ({
        slotId: event.slotId,
        kind: event.kind,
        clientEventId: event.clientEventId,
        at: event.at,
        receivedAt,
        stepAwayId: event.stepAwayId ?? null,
      })),
    );
  }

  return (await store.eventsOf(ids)).sort(byEventTime);
}
