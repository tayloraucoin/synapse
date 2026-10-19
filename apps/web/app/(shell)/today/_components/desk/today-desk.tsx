"use client";

import type * as React from "react";
import { DragToPlace, toastUndo } from "@syn/ui";
import { BlockPanelHost } from "@/components/work/block-panel";
import { PoolPanel } from "@/components/work/pool";
import { readPlaceId } from "@/lib/data/place";
import { readTodayDrag } from "@/lib/data/tier-drop";
import { useTierDrop } from "@/lib/data/use-tier-drop";
import { useTodayPlacing } from "@/lib/data/use-today-work";
import { TIER_WORDS } from "@/lib/data/week-view";
import { WORK_COPY } from "../work/copy";
import { DeskDay } from "./desk-day";
import { DeskStrip } from "./desk-strip";
import { OpenedDay } from "./opened-day";
import { useShownDate } from "./use-shown-date";

/**
 * The desk's Today frame (USE-58; today/index.md, C-USE-today-1): the week
 * strip across the top, then the main column (720) and the day column (340)
 * 48 px apart, the content (1108) centred right of the rail. From 1024 the
 * day column keeps 340 and the main column shrinks; under 1728 the strip
 * scrolls sideways. Desk-only: the page mounts it inside `hidden split:flex`,
 * switched in CSS, never by a width read (D-USE-55).
 *
 * `main` is today's main column (USE-57's); another date (`?date=`) shows
 * the opened day in its place, planning (D-USE-41).
 *
 * Nothing planned (USE-82, D-USE-42): the pool panel docks between the rail
 * and the content, the Week's own (USE-74), and a pool row let go over one
 * of today's tiers lands there through USE-75's placing, announced politely.
 *
 * A block in the day column opens its Block panel at the right (USE-76):
 * today's checks, another date's plans.
 *
 * A row dragged between today's tiers (USE-71) lands before the row it is
 * let go over, or at the tier's end (a tier's empty drop zone too), this
 * session only, with the work menu's toast and Undo.
 */
export function TodayDesk({ main }: { main: React.ReactNode }) {
  const { todayKey, dateKey, opened } = useShownDate();
  const placing = useTodayPlacing(todayKey);
  const docked = !opened && placing.empty?.kind === "nothing-planned";
  const tierDrop = useTierDrop(todayKey);
  const onPlace = (sourceId: string, targetId: string, label: string) => {
    const dragged = readTodayDrag(sourceId);
    if (dragged?.kind === "row") {
      void dropRow(dragged.slotId, targetId, label);
      return;
    }
    const from = readPlaceId(sourceId);
    const to = readPlaceId(targetId);
    if (from?.kind !== "row" || to?.kind !== "cell") return;
    if (to.dateKey !== todayKey) return;
    void placing.placeAt({ ...from.source, title: label }, to.tier);
  };
  async function dropRow(slotId: string, targetId: string, title: string) {
    const over = readTodayDrag(targetId);
    const cell = readPlaceId(targetId);
    const before = over?.kind === "before" ? over.slotId : null;
    const tier =
      over?.kind === "end"
        ? over.tier
        : cell?.kind === "cell" && cell.dateKey === todayKey
          ? cell.tier
          : before
            ? tierDrop.tierOf(before)
            : null;
    if (!tier) return;
    const written = await tierDrop.drop({ slotId, tier, beforeId: before });
    if (written.length === 0) return;
    toastUndo({
      text: WORK_COPY.menu.movedTo(title, TIER_WORDS[tier]),
      onUndo: () => void tierDrop.undo(written),
    });
  }
  return (
    <DragToPlace onPlace={onPlace}>
      <div className="flex">
        {docked ? <PoolPanel mode="today" /> : null}
        <div className="min-w-0 flex-1">
          <TodayFrame
            todayKey={todayKey}
            dateKey={dateKey}
            opened={opened}
            main={main}
          />
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {placing.announcement}
      </p>
      <BlockPanelHost from="today" />
    </DragToPlace>
  );
}

function TodayFrame({
  todayKey,
  dateKey,
  opened,
  main,
}: {
  todayKey: string;
  dateKey: string;
  opened: boolean;
  main: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="border-b border-border px-(--space-6) py-(--space-4)">
        <div className="mx-auto w-full max-w-(--desk-w)">
          <DeskStrip dateKey={dateKey} todayKey={todayKey} />
        </div>
      </div>
      <div className="px-(--space-6) py-(--space-8)">
        <div className="mx-auto flex w-full max-w-(--desk-w) gap-(--space-12)">
          <div className="min-w-0 max-w-(--content-text) flex-1">
            {opened ? <OpenedDay key={dateKey} dateKey={dateKey} /> : main}
          </div>
          <DeskDay
            dateKey={dateKey}
            isToday={!opened}
            className="w-(--day-col-w) shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
