"use client";

import * as React from "react";
import { parseAsString, useQueryStates } from "nuqs";
import { weekKeyOf, type WorkTier } from "@syn/utils";
import { BLOCK_PANEL_PARAMS } from "@/lib/routes";
import {
  blockPanelHead,
  blockPanelItems,
  blockPanelTiers,
  tierOrderWrites,
} from "./block-panel";
import { useDataSource } from "./source";
import { useBlockDayWrites } from "./use-block-day-writes";
import { useBlockView } from "./use-block-view";
import { useClients } from "./use-clients";
import { useLinear } from "./use-linear";
import { useWeek } from "./use-week";
import { useWeekView } from "./use-week-view";
import { useWorkWrites } from "./use-work-writes";

/**
 * The Block panel's place and data (USE-76): which block of which date is
 * open (`?panel=block&block=&on=`, `blockPanelRoute`; a capture's scenario
 * opens one on load), and what the panel draws for it, read from the week's
 * query so a placing or a check shows here and in the week at once.
 */

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export interface OpenedBlock {
  blockId: string;
  dateKey: string;
}

export function useBlockPanelParams(): {
  opened: OpenedBlock | null;
  close: () => void;
} {
  const source = useDataSource();
  const [params, setParams] = useQueryStates({
    [BLOCK_PANEL_PARAMS.panel]: parseAsString,
    [BLOCK_PANEL_PARAMS.block]: parseAsString,
    [BLOCK_PANEL_PARAMS.on]: parseAsString,
  });

  // A capture's panel, once: closing it leaves it closed.
  const seed = source.seeds.blockPanel;
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (seeded.current || !seed) return;
    seeded.current = true;
    if (params.panel !== null) return;
    void setParams({ panel: "block", block: seed.blockId, on: seed.dateKey });
  }, [seed, params.panel, setParams]);

  const { panel, block, on } = params;
  const opened =
    panel === "block" && block && on && DATE_KEY.test(on)
      ? { blockId: block, dateKey: on }
      : null;
  const close = React.useCallback(
    () => void setParams({ panel: null, block: null, on: null }),
    [setParams],
  );
  return { opened, close };
}

export function useBlockPanel(opened: OpenedBlock, fromToday: boolean) {
  const { blockId, dateKey } = opened;
  const weekKey = weekKeyOf(dateKey);
  const week = useWeek(weekKey);
  const { view } = useWeekView(weekKey);
  const { clientFor } = useClients();
  const { issueFor } = useLinear();
  const items = useBlockView({ blockId, date: dateKey });
  const dayWrites = useBlockDayWrites({ blockId, date: dateKey });
  const work = useWorkWrites();

  const day = view?.days.find((entry) => entry.dateKey === dateKey) ?? null;
  const head = week.week
    ? blockPanelHead({
        week: week.week,
        dateKey,
        blockId,
        fromToday,
        items: items.view ?? null,
      })
    : null;
  const tiers =
    week.week && day && head?.kind === "work"
      ? blockPanelTiers({ week: week.week, day, blockId, clientFor, issueFor })
      : null;
  const rows = items.view ? blockPanelItems(items.view) : null;

  /** A tier's grip dropped: the date's order within the tier, slot by slot. */
  const reorderTier = async (tier: WorkTier, ids: readonly string[]) => {
    const slots =
      week.week?.days
        .find((entry) => entry.date === dateKey)
        ?.blocks.find((b) => b.block.id === blockId)
        ?.slots.filter((slot) => (slot.tier ?? "primary") === tier) ?? [];
    for (const change of tierOrderWrites(slots, ids)) {
      await work.moveWork(change);
    }
  };

  return {
    head,
    tiers,
    rows,
    /** Block view's read: the items' times and where free time starts. */
    items: items.view ?? null,
    isError: week.isError || items.isError,
    retry: () => {
      void week.retry();
      void items.retry();
    },
    dayWrites,
    reorderTier,
  };
}
