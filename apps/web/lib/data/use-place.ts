"use client";

import * as React from "react";
import { UNDO_SHORT_MS } from "@syn/constants";
import { toast } from "@syn/ui";
import type { WorkTier } from "@syn/utils";
import type { PlannerWrite } from "@/lib/fixtures/planner";
import {
  weekPlaceSeedOf,
  type WeekPlaceSeed,
} from "@/lib/fixtures/scenarios/week";
import {
  PLACE_WORDS,
  sessionAfterPlacing,
  weekdayOf,
  writePlace,
  type PlaceSource,
  type PlaceTo,
} from "./place";
import { useDataSource } from "./source";
import { usePool } from "./use-pool";
import { refusalWords, useWorkWrites } from "./use-work-writes";

/**
 * Placing at the desk (USE-75): `place`, `move`, `unplace` and `undo` over
 * USE-55's work writes, for the Week now and the Block panel, the phone's
 * Place and Today's nothing-planned later (USE-76, USE-80, USE-82).
 *
 * The last placing is kept as `landed` for its surface to draw: the chip
 * ringed in ink, its line under it ("Added as session 2 of 3." and Undo),
 * until the next placing or the house Undo window. A refusal lands too, with
 * no Undo: the chip already on that day is ringed and the line says so. A
 * chip sent back to the pool has no chip to sit under: the toast says it,
 * with Undo. Every outcome is also `announcement`, for a polite live region.
 * Nothing here writes to Linear (D-USE-57).
 */

export interface Landed {
  kind: "placed" | "moved" | "refused";
  workItemId: string;
  dateKey: string;
  /** "Added as session 2 of 3.", "Added to Tuesday · Primary.", "… is already on Tuesday." */
  line: string;
  undo: PlannerWrite["undo"] | null;
}

export interface MoveTo {
  dateKey: string;
  tier: WorkTier;
  /** Left out, the session keeps its block (a tier change on its own day). */
  blockId?: string;
  sortOrder?: number;
}

export function usePlace({ holdMs = UNDO_SHORT_MS }: { holdMs?: number } = {}) {
  const writes = useWorkWrites();
  const pool = usePool();
  const [landed, setLanded] = React.useState<Landed | null>(null);
  const [announcement, setAnnouncement] = React.useState("");
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const land = (next: Landed | null, said: string) => {
    window.clearTimeout(timer.current);
    setLanded(next);
    setAnnouncement(said);
    if (next && Number.isFinite(holdMs)) {
      timer.current = window.setTimeout(() => setLanded(null), holdMs);
    }
  };

  const itemOf = (workItemId: string) =>
    pool.pool?.items.find((entry) => entry.item.id === workItemId) ?? null;

  const refuse = (workItemId: string, title: string, dateKey: string) => {
    const line = PLACE_WORDS.alreadyOn(title, weekdayOf(dateKey));
    land({ kind: "refused", workItemId, dateKey, line, undo: null }, line);
  };

  const failed = (error: unknown) => {
    const words = refusalWords(error);
    if (words) toast(words);
    else throw error;
  };

  async function place(
    source: PlaceSource & { title?: string },
    to: PlaceTo,
  ): Promise<void> {
    const entry = "workItemId" in source ? itemOf(source.workItemId) : null;
    const title = entry?.item.title ?? source.title ?? "";
    const dates = entry?.sessionDates ?? [];
    // One item sits once a day: refused before any write, its chip ringed.
    if ("workItemId" in source && dates.includes(to.dateKey)) {
      refuse(source.workItemId, title, to.dateKey);
      return;
    }
    const weekday = weekdayOf(to.dateKey);
    const session = sessionAfterPlacing(dates, to.dateKey);
    let write: PlannerWrite;
    try {
      write = await writePlace(writes, source, to, pool.slots ?? []);
    } catch (error) {
      return failed(error);
    }
    const workItemId =
      "workItemId" in source ? source.workItemId : (write.id ?? "");
    land(
      {
        kind: "placed",
        workItemId,
        dateKey: to.dateKey,
        line: session
          ? PLACE_WORDS.addedSession(session.n, session.of)
          : PLACE_WORDS.addedTo(weekday, to.tier),
        undo: write.undo,
      },
      PLACE_WORDS.announceAdded(title, weekday, to.tier, session),
    );
  }

  async function move(slotId: string, to: MoveTo): Promise<void> {
    const slot = pool.slots?.find((s) => s.id === slotId);
    if (!slot?.workItemId) return;
    const entry = itemOf(slot.workItemId);
    const title = entry?.item.title ?? "";
    if (
      to.dateKey !== slot.onDate &&
      (entry?.sessionDates ?? []).includes(to.dateKey)
    ) {
      refuse(slot.workItemId, title, to.dateKey);
      return;
    }
    if (to.dateKey === slot.onDate && to.tier === slot.tier) return;
    let write: PlannerWrite;
    try {
      write = await writes.moveWork({
        slotId,
        dateKey: to.dateKey,
        tier: to.tier,
        ...(to.blockId === undefined ? {} : { blockId: to.blockId }),
        ...(to.sortOrder === undefined ? {} : { sortOrder: to.sortOrder }),
      });
    } catch (error) {
      return failed(error);
    }
    const line = PLACE_WORDS.movedTo(weekdayOf(to.dateKey), to.tier);
    land(
      {
        kind: "moved",
        workItemId: slot.workItemId,
        dateKey: to.dateKey,
        line,
        undo: write.undo,
      },
      `${title}. ${line}`,
    );
  }

  async function unplace(slotId: string): Promise<void> {
    const slot = pool.slots?.find((s) => s.id === slotId);
    if (!slot?.workItemId) return;
    const title = itemOf(slot.workItemId)?.item.title ?? "";
    let write: PlannerWrite;
    try {
      write = await writes.unplaceWork({ slotId });
    } catch (error) {
      return failed(error);
    }
    const line = PLACE_WORDS.backInPool(title);
    land(null, line);
    toast(line, {
      duration: holdMs,
      action: {
        label: PLACE_WORDS.undo,
        onClick: () => void writes.undo(write.undo),
      },
    });
  }

  async function undo(): Promise<void> {
    if (!landed?.undo) return;
    const token = landed.undo;
    land(null, PLACE_WORDS.undone);
    await writes.undo(token);
  }

  /** Clears what the last placing shows (a new drag has started). */
  const settle = () => {
    window.clearTimeout(timer.current);
    setLanded(null);
  };

  return { place, move, unplace, undo, settle, landed, announcement };
}

/** What a capture stages on the Week (USE-75's `week-drop`, `week-add-popover`). */
export function usePlaceSeed(): WeekPlaceSeed | undefined {
  return weekPlaceSeedOf(useDataSource().scenario.name);
}
