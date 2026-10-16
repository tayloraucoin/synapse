"use client";

import * as React from "react";
import { UNDO_SHORT_MS } from "@syn/constants";
import { toast } from "@syn/ui";
import {
  instantToWallClockMinutes,
  spreadBlockOf,
  spreadPreview,
  type SpreadPick,
  type SpreadReason,
  type WorkTier,
} from "@syn/utils";
import type { WorkItemRecord } from "@syn/validators";
import { useDataSource } from "./source";
import {
  daysWords,
  SPREAD_WORDS,
  spreadDaysOf,
  workLeftOf,
  writeSpread,
} from "./spread";
import { usePool } from "./use-pool";
import { useWeek } from "./use-week";
import { refusalWords, useWorkWrites } from "./use-work-writes";
import { thisWeekKey } from "./week-records";

/**
 * Spread across the week at the desk (USE-77): the dialog's fields over this
 * week, the preview from `spreadPreview`, and Add <n> sessions. The sessions
 * land through the work writes' `spreadWork`, one write for all of them, so
 * the toast's one Undo removes every one [ASSUMPTION: rather than `usePlace`'s
 * one placing at a time, whose Undo takes back only the last]. Nothing here
 * writes to Linear (D-USE-57).
 *
 * Opened with the item's work left, Morning Work, the days left with that
 * block and Primary [ASSUMPTION: the board's sample]. "Carry on next week" is
 * kept on the device for the item until the work pool wiring (wave 3) places
 * next week's sessions [ASSUMPTION: no column holds it yet].
 */

export type EachSession = number | "whole";
export type WhichBlock = "morning" | "afternoon" | "pick";

export interface SpreadDayChip {
  dateKey: string;
  offered: boolean;
  reason: SpreadReason | null;
  picked: boolean;
  /** The day's Work blocks, for Pick blocks. */
  blocks: { id: string; start: string; end: string; begun: boolean }[];
}

const carryKey = (scenario: string, id: string) =>
  `syn.spread.carry-on.${scenario}.${id}`;

function readCarryOn(key: string): boolean {
  try {
    return window.localStorage.getItem(key) !== "off";
  } catch {
    return true;
  }
}

function storeCarryOn(key: string, on: boolean) {
  try {
    window.localStorage.setItem(key, on ? "on" : "off");
  } catch {
    // A private window keeps it for this dialog only.
  }
}

export function useSpread(workItemId: string | null) {
  const source = useDataSource();
  const { timeZone } = source.scenario.records;
  const now = source.now();
  const todayKey = source.todayKey();
  const pool = usePool();
  const week = useWeek(thisWeekKey(now, timeZone)).week;
  const writes = useWorkWrites();

  const item: WorkItemRecord | null =
    pool.pool?.items.find((entry) => entry.item.id === workItemId)?.item ??
    null;
  const slots = React.useMemo(() => pool.slots ?? [], [pool.slots]);
  const nowMin = instantToWallClockMinutes(now, timeZone);

  const days = React.useMemo(() => {
    if (!week || !workItemId) return [];
    const workItems = new Map<string, WorkItemRecord>();
    for (const day of week.days) {
      for (const w of day.records.workItems) workItems.set(w.id, w);
    }
    for (const entry of pool.pool?.items ?? []) {
      workItems.set(entry.item.id, entry.item);
    }
    return spreadDaysOf({
      week,
      slots,
      workItems: [...workItems.values()],
      workItemId,
      todayKey,
      nowMin,
    });
  }, [week, slots, pool.pool, workItemId, todayKey, nowMin]);

  const [workLeftMin, setWorkLeftMin] = React.useState<number | null>(null);
  const [which, setWhich] = React.useState<WhichBlock>("morning");
  const [blockPicks, setBlockPicks] = React.useState<Record<string, string>>(
    {},
  );
  const [picked, setPicked] = React.useState<string[] | null>(null);
  const [eachMin, setEachMin] = React.useState<EachSession>("whole");
  const [tier, setTier] = React.useState<WorkTier>("primary");
  const [carryOn, setCarryOnState] = React.useState(true);
  const [announcement, setAnnouncement] = React.useState("");

  // A new item opens on its own defaults.
  React.useEffect(() => {
    setWorkLeftMin(null);
    setWhich("morning");
    setBlockPicks({});
    setPicked(null);
    setEachMin("whole");
    setTier("primary");
    setCarryOnState(
      workItemId
        ? readCarryOn(carryKey(source.scenario.name, workItemId))
        : true,
    );
  }, [workItemId, source.scenario.name]);

  const pick: SpreadPick = which === "pick" ? { blocks: blockPicks } : which;
  const offeredOf = (p: SpreadPick) =>
    days
      .filter((day) => typeof spreadBlockOf(day, p) !== "string")
      .map((day) => day.dateKey);
  // Until the person picks, the days left with the chosen block.
  const pickedDays = picked ?? offeredOf(pick);
  const left = workLeftMin ?? (item ? workLeftOf(item, slots) : 0);

  const preview = spreadPreview({
    workLeftMin: left,
    days,
    picked: pickedDays,
    pick,
    eachMin,
  });

  const reasons = new Map(preview.notOffered.map((d) => [d.dateKey, d.reason]));
  const chips: SpreadDayChip[] = days
    // A day with no Work block at all is not drawn (the board's M to F).
    .filter((day) => day.blocks.length > 0)
    .map((day) => ({
      dateKey: day.dateKey,
      offered: !reasons.has(day.dateKey),
      reason: reasons.get(day.dateKey) ?? null,
      picked: !reasons.has(day.dateKey) && pickedDays.includes(day.dateKey),
      blocks: [...day.blocks]
        .sort((a, b) => a.start.localeCompare(b.start))
        .map(({ id, start, end, begun }) => ({ id, start, end, begun })),
    }));

  const toggleDay = (dateKey: string) =>
    setPicked(
      pickedDays.includes(dateKey)
        ? pickedDays.filter((d) => d !== dateKey)
        : [...pickedDays, dateKey].sort(),
    );

  const chooseBlock = (next: WhichBlock) => {
    setWhich(next);
    // The days follow the block until the person has picked their own.
    if (picked === null) return;
    const offered = new Set(
      offeredOf(next === "pick" ? { blocks: blockPicks } : next),
    );
    setPicked(picked.filter((d) => offered.has(d)));
  };

  const setCarryOn = (on: boolean) => {
    setCarryOnState(on);
    if (workItemId)
      storeCarryOn(carryKey(source.scenario.name, workItemId), on);
  };

  async function add(): Promise<boolean> {
    if (!item || preview.rows.length === 0) return false;
    let undo;
    try {
      ({ undo } = await writeSpread(writes, {
        item,
        slots,
        tier,
        rows: preview.rows,
        workLeftMin: left,
      }));
    } catch (error) {
      const words = refusalWords(error);
      if (words) {
        toast(words);
        return false;
      }
      throw error;
    }
    const line = SPREAD_WORDS.added(
      preview.rows.length,
      daysWords(preview.rows.map((row) => row.dateKey)),
    );
    setAnnouncement(line);
    toast(line, {
      duration: UNDO_SHORT_MS,
      action: {
        label: SPREAD_WORDS.undo,
        onClick: () => void writes.undo(undo),
      },
    });
    return true;
  }

  return {
    ready: item !== null && week !== undefined,
    item,
    workLeftMin: left,
    setWorkLeftMin,
    which,
    chooseBlock,
    blockPicks,
    setBlockPick: (dateKey: string, blockId: string) =>
      setBlockPicks((current) => ({ ...current, [dateKey]: blockId })),
    chips,
    toggleDay,
    eachMin,
    setEachMin,
    tier,
    setTier,
    carryOn,
    setCarryOn,
    preview,
    add,
    isPending: writes.isPending,
    announcement,
  };
}
