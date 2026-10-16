"use client";

import * as React from "react";
import { UNDO_SHORT_MS } from "@syn/constants";
import { toast } from "@syn/ui";
import { weekKeyOf, type WorkTier } from "@syn/utils";
import type { PlannerWrite } from "@/lib/fixtures/planner";
import {
  weekPlaceSeedOf,
  type WeekPlaceSeed,
} from "@/lib/fixtures/scenarios/week";
import {
  PLACE_WORDS,
  sessionAfterPlacing,
  timeDropTier,
  weekdayOf,
  workBlocksOf,
  writePlace,
  type PlaceSource,
  type PlaceTo,
} from "./place";
import {
  placeItemOf,
  placeSheetView,
  type PlaceSheetItem,
} from "./place-sheet";
import { useDataSource } from "./source";
import { usePool } from "./use-pool";
import { useWeek } from "./use-week";
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

  /**
   * The phone's Place (USE-80): the one item on every picked day, a session
   * on each (D-USE-40), in order, a Linear issue joining the pool on the
   * first. One toast with one Undo takes every one back
   * (C-USE-place-from-the-pool-placed-undo-2); a refusal part way undoes
   * what landed, so nothing is left half placed. The item's id once it
   * landed, else null.
   */
  async function placeAll(
    source: PlaceSource,
    targets: readonly PlaceTo[],
    said: string,
  ): Promise<string | null> {
    const undos: PlannerWrite["undo"][] = [];
    let from: PlaceSource = source;
    try {
      for (const to of targets) {
        const write = await writePlace(writes, from, to, pool.slots ?? []);
        undos.push(write.undo);
        // The issue is a work item now: the next days are its sessions.
        if ("issueId" in from && write.id) from = { workItemId: write.id };
      }
    } catch (error) {
      for (const token of undos.reverse()) await writes.undo(token);
      failed(error);
      return null;
    }
    const workItemId = "workItemId" in from ? from.workItemId : "";
    const takeBack = async () => {
      for (const token of [...undos].reverse()) await writes.undo(token);
      land(null, PLACE_WORDS.undone);
    };
    land(
      {
        kind: "placed",
        workItemId,
        dateKey: targets[0]?.dateKey ?? "",
        line: said,
        undo: null,
      },
      said,
    );
    toast(said, {
      duration: holdMs,
      action: { label: PLACE_WORDS.undo, onClick: () => void takeBack() },
    });
    return workItemId;
  }

  /** Clears what the last placing shows (a new drag has started). */
  const settle = () => {
    window.clearTimeout(timer.current);
    setLanded(null);
  };

  return {
    place,
    placeAll,
    move,
    unplace,
    undo,
    settle,
    landed,
    announcement,
    isPending: writes.isPending,
  };
}

/** What a capture stages on the Week (USE-75's `week-drop`, `week-add-popover`). */
export function usePlaceSeed(): WeekPlaceSeed | undefined {
  return weekPlaceSeedOf(useDataSource().scenario.name);
}

/** What Place on a pool sheet row hands the place sheet (USE-79's onPlace). */
export type PlaceSheetSource =
  | { kind: "item"; workItemId: string; title: string }
  | {
      kind: "issue";
      connectionId: string;
      issueId: string;
      title: string;
      identifier: string | null;
      size: PlaceSheetItem["size"];
      clientName: string | null;
    };

/**
 * The phone's place sheet (USE-80): its picks and tier over the week the
 * sheet's day sits in, `placeSheetView` over them, and Place through
 * `placeAll`. Opens with the day being viewed picked and its first tier with
 * room, else Primary [ASSUMPTION, as place-sheet.md]; a capture may open on
 * its own picks. Nothing moves until `place` (C-USE-this-week-2).
 */
export function usePlaceSheet(
  source: PlaceSheetSource | null,
  dateKey: string,
  initial: { picked?: readonly string[]; tier?: WorkTier } = {},
) {
  const data = useDataSource();
  const todayKey = data.todayKey();
  const pool = usePool();
  const week = useWeek(weekKeyOf(dateKey)).week;
  const placing = usePlace();
  const workItemId = source?.kind === "item" ? source.workItemId : null;
  const entry = workItemId
    ? (pool.pool?.items.find((e) => e.item.id === workItemId) ?? null)
    : null;

  const item: PlaceSheetItem | null =
    source === null
      ? null
      : source.kind === "item"
        ? entry
          ? placeItemOf(entry.item, entry.client?.name ?? null)
          : null
        : {
            workItemId: null,
            title: source.title,
            size: source.size,
            lengthMinMin: null,
            lengthMaxMin: null,
            identifier: source.identifier,
            clientName: source.clientName,
            dueOn: null,
          };

  const [picked, setPicked] = React.useState<string[] | null>(null);
  const [tier, setTier] = React.useState<WorkTier | null>(null);
  const key = source
    ? source.kind === "item"
      ? source.workItemId
      : source.issueId
    : null;

  // A new item opens on its own defaults.
  React.useEffect(() => {
    setPicked(initial.picked ? [...initial.picked] : null);
    setTier(initial.tier ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per item
  }, [key]);

  const opening = week?.days.find((day) => day.date === dateKey);
  const firstBlock = opening ? workBlocksOf(opening)[0] : undefined;
  const openingTier =
    opening && firstBlock && item
      ? timeDropTier({
          day: opening,
          blockId: firstBlock.block.id,
          item: { size: item.size, lengthMaxMin: item.lengthMaxMin },
        })
      : null;

  const view =
    week && item
      ? placeSheetView({
          week,
          item,
          holds: entry?.sessionDates ?? [],
          picked: picked ?? [dateKey],
          tier: tier ?? openingTier ?? "primary",
          todayKey,
          dateKey,
          from: source?.kind === "issue" ? "linear" : "pool",
        })
      : null;

  const toggleDay = (day: string) => {
    if (!view) return;
    setPicked(
      view.picked.includes(day)
        ? view.picked.filter((d) => d !== day)
        : [...view.picked, day].sort(),
    );
  };

  const placeSource = (): PlaceSource | null =>
    source === null
      ? null
      : source.kind === "item"
        ? { workItemId: source.workItemId }
        : { issueId: source.issueId };

  /** Place on the picked days; `only` places on that one day instead (Use Thu). */
  async function place(only?: string): Promise<string[] | null> {
    const from = placeSource();
    if (!view || !week || !item || !from) return null;
    const targets = only
      ? (() => {
          const one = placeSheetView({
            week,
            item,
            holds: entry?.sessionDates ?? [],
            picked: [only],
            tier: view.tier,
            todayKey,
            dateKey,
            from: source?.kind === "issue" ? "linear" : "pool",
          });
          return { targets: one.targets, toast: one.toast };
        })()
      : { targets: view.targets, toast: view.toast };
    if (targets.targets.length === 0) return null;
    const landed = await placing.placeAll(from, targets.targets, targets.toast);
    return landed === null ? null : targets.targets.map((t) => t.dateKey);
  }

  return {
    ready: view !== null,
    view,
    workItemId,
    toggleDay,
    setTier,
    place,
    isPending: placing.isPending,
    announcement: placing.announcement,
  };
}
