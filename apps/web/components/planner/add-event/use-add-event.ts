"use client";

import type { WorkTier } from "@syn/types";
import type { ClientHue } from "@/components/work/view";
import { usePlannerWrites } from "@/lib/data/use-planner-writes";
import { usePool } from "@/lib/data/use-pool";
import { useSetUpDay, type SetUpDay } from "@/lib/data/use-set-up-day";
import type { WeekRef } from "@/lib/data/week-records";
import {
  eventWrite,
  landingOf,
  type AddEventForm,
  type EventDay,
  type EventDayItem,
  type Landing,
} from "./form";

/**
 * Add event's data (USE-53): the dated day it adds to, read through
 * `useSetUpDay` and weighed as the form's `EventDay`, the clients the desk
 * offers, and the writes. `add` sends `writeDayEvent` and hands back what
 * moved and its Undo. The moves are the landing's: re-flow is read from
 * the items and the bands, so nothing else is written, and Undo, which
 * takes the event away, puts the work back as it was.
 *
 * Nothing is written to Google (D-USE-42); offline the add waits in the
 * queue like the day's other writes (D-USE-56).
 */

const TIERS: readonly WorkTier[] = [
  "urgent",
  "primary",
  "secondary",
  "stretch",
];

/** The set-up day as the landing weighs it: each block's items in order. */
export function toEventDay(day: SetUpDay): EventDay | null {
  if (!day.date) return null;
  const workItems = new Map(day.records.workItems.map((w) => [w.id, w]));
  return {
    date: day.date,
    weekday: day.weekday,
    events: day.events,
    blocks: day.blocks
      .filter((b) => b.block.kind !== "transition")
      .map((b) => {
        const items: EventDayItem[] =
          b.block.kind === "work"
            ? TIERS.flatMap((tier) =>
                b.slots
                  .filter(
                    (slot) =>
                      slot.workItemId !== null &&
                      (slot.tier ?? "primary") === tier,
                  )
                  .sort((x, y) => x.sortOrder - y.sortOrder)
                  .map((slot) => ({
                    id: slot.id,
                    title: workItems.get(slot.workItemId!)?.title ?? "",
                    lengthMin: slot.lengthMin,
                    atTime: null,
                    tier,
                  })),
              )
            : b.items.map((item) => ({
                id: item.id,
                title: item.title,
                lengthMin: item.lengthMin,
                atTime: item.atTime,
                tier: null,
              }));
        return {
          id: b.block.id,
          name: b.block.name,
          startsAt: b.startsAt,
          endsAt: b.endsAt,
          items,
        };
      }),
  };
}

export interface EventClient {
  id: string;
  name: string;
  letter: string;
  hue: ClientHue;
}

export interface EventAdded {
  id: string;
  undo: string;
  landing: Landing;
}

export function useAddEvent(target: { week: WeekRef; day: number } | null) {
  const writes = usePlannerWrites();
  const query = useSetUpDay({
    week: target?.week ?? "usual",
    day: target?.day ?? 0,
  });
  const pool = usePool().pool;
  const day = target === null || !query.day ? null : toEventDay(query.day);

  // Client shows when clients are on (D-USE-95), each with its letter tile.
  const clients: EventClient[] = (pool?.clientsEnabled ? pool.groups : [])
    .flatMap((group) => (group.client === null ? [] : [group.client]))
    .map((client) => ({
      id: client.id,
      name: client.name,
      letter: client.name.charAt(0).toUpperCase(),
      hue: client.colorKey,
    }));

  /** Adds or saves; resolves to the row, its Undo and where it landed. */
  async function add(form: AddEventForm): Promise<EventAdded> {
    if (day === null) throw new Error("The day is not read yet.");
    const landing = landingOf(form, day);
    const write = await writes.writeDayEvent(eventWrite(form, day.date));
    return { id: write.id ?? form.id ?? "", undo: write.undo, landing };
  }

  async function remove(id: string): Promise<{ undo: string }> {
    const write = await writes.removeDayEvent({ id });
    return { undo: write.undo };
  }

  return {
    day,
    events: query.day?.events ?? [],
    clients,
    add,
    remove,
    undo: writes.undo,
    online: writes.online,
  };
}
