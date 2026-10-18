import {
  dayBoundsRecord,
  dayEventRecord,
  type DayBoundsInput,
  type DayEventInput,
} from "@syn/validators";
import { refuse } from "../../errors";
import type { WriteJournal } from "./write-journal";
import type { PlanOut, WriteScope } from "./write-plan";

/**
 * Set my days' Up at and Lights out, and Add event's write (USE-92), as the
 * fixture server's `writeBounds` and `writeDayEvent`.
 */

/** A weekday's usual Up at and Lights out, or one date's own. */
export function planWriteBounds(
  journal: WriteJournal,
  input: DayBoundsInput,
): PlanOut {
  const { rows } = journal;
  const weekday = input.weekday ?? null;
  const onDate = input.onDate ?? null;
  const existing = rows.dayBounds.find((row) =>
    weekday !== null ? row.weekday === weekday : row.onDate === onDate,
  );
  const row = journal.put(
    "dayBounds",
    dayBoundsRecord.parse({
      ...(existing ?? journal.stamps()),
      updatedAt: journal.stamp(),
      weekday,
      onDate,
      upAt: input.upAt,
      lightsOut: input.lightsOut,
    }),
  );
  if (weekday === null) return { id: row.id };
  // A date with its own bounds keeps them.
  const own = new Set(
    rows.dayBounds.map((r) => r.onDate).filter((d): d is string => d !== null),
  );
  return { id: row.id, reach: { weekday, changedOn: own } };
}

/** A new event, or with `id` that event's edit; a repeating one names its reach. */
export function planWriteDayEvent(
  journal: WriteJournal,
  input: DayEventInput,
  id: string | undefined,
  scope?: WriteScope,
): PlanOut {
  const existing =
    id === undefined
      ? undefined
      : journal.rows.dayEvents.find((event) => event.id === id);
  if (id !== undefined && !existing) {
    throw refuse("unknown", "No event with that id.");
  }
  // A client is read through RLS, so another user's never joins an event.
  if (
    input.clientId != null &&
    !journal.rows.clients.some((client) => client.id === input.clientId)
  ) {
    throw refuse("unknown", "No client with that id.");
  }
  const row = journal.put(
    "dayEvents",
    dayEventRecord.parse({
      ...(existing ?? journal.stamps()),
      updatedAt: journal.stamp(),
      onDate: input.onDate ?? null,
      rrule: input.rrule ?? null,
      title: input.title,
      icon: input.icon ?? null,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      tag: input.tag,
      notes: input.notes ?? null,
      color: input.color ?? null,
      clientId: input.clientId ?? null,
    }),
  );
  return { id: row.id, reach: input.rrule != null ? scope : undefined };
}
