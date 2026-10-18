"use client";

import * as React from "react";
import { parseAsString, useQueryStates } from "nuqs";
import type { WorkTier } from "@syn/types";
import {
  ADD_SHEET_COPY,
  landingOf,
  openAddForm,
  planAdd,
  type AddForm,
  type AddLanding,
  type AddPlan,
  type AddStart,
} from "@/components/planner/add-sheet";
import { clockLabel } from "@/components/planner/day-column/copy";
import { useUndoToast } from "@/lib/hooks/use-undo-toast";
import { sendAdd, writeRailAdd } from "./rail-add";
import type { RoomAddition } from "./room";
import { roomDayWithRowsOf } from "./room-day";
import { useDataSource } from "./source";
import type { useDayEdits } from "./use-day-edits";
import { useToday } from "./use-today";
import { useWorkWrites } from "./use-work-writes";

/**
 * The add sheet's state over Review the day (USE-54): where it opened, read
 * from `?sheet=add&at=&tier=&block=`, a capture's seed, and the add itself,
 * a write with room (today only, Undo in the Toaster) or Make room.
 */
export function useRailAdd(
  dateKey: string,
  edits: ReturnType<typeof useDayEdits>,
  place: (addition: RoomAddition) => Promise<void>,
) {
  const source = useDataSource();
  const work = useWorkWrites();
  const showToast = useUndoToast();
  const { today } = useToday(dateKey);
  const day = React.useMemo(
    () => (today === undefined ? null : roomDayWithRowsOf(today)),
    [today],
  );
  const [query, setQuery] = useQueryStates({
    sheet: parseAsString,
    at: parseAsString,
    tier: parseAsString,
    block: parseAsString,
  });
  const seed = source.seeds.railAdd;

  const start: AddStart = {
    ...(query.at ? { at: query.at } : {}),
    ...(query.block ? { blockId: query.block } : {}),
    ...(query.tier ? { tier: query.tier as WorkTier } : {}),
  };

  const close = React.useCallback(() => {
    void setQuery({ sheet: null, at: null, tier: null, block: null });
  }, [setQuery]);

  async function write(landing: AddLanding, form: AddForm) {
    const { token } = await edits.write((server, records) =>
      writeRailAdd(
        { ...server, createTask: work.createTask },
        records,
        landing,
        form,
      ),
    );
    showToast({
      text: ADD_SHEET_COPY.added(
        form.title,
        form.startsAt === null ? null : clockLabel(form.startsAt),
        landing.name,
      ),
      onUndo: () => void edits.undo(token),
      undoOf: ADD_SHEET_COPY.undoOf(form.title),
      ...(seed?.added ? { durationMs: Infinity } : {}),
    });
  }

  async function add(plan: AddPlan) {
    await sendAdd(plan, { write, place });
  }

  // A capture opens on its sheet, once.
  const seededSheet = React.useRef(false);
  React.useEffect(() => {
    if (seededSheet.current || !seed?.sheet) return;
    seededSheet.current = true;
    void setQuery({
      sheet: "add",
      at: seed.sheet.at ?? null,
      tier: seed.sheet.tier ?? null,
      block: seed.sheet.blockId ?? null,
    });
  }, [seed, setQuery]);

  // A capture's add with room, run once the day reads, its Toaster held.
  const seededAdd = React.useRef(false);
  React.useEffect(() => {
    if (seededAdd.current || !seed?.added || day === null) return;
    const form = { ...openAddForm(seed.added), ...seed.added.fields };
    const landing = landingOf(day, form, seed.added.blockId);
    if (landing === null) return;
    seededAdd.current = true;
    void add(planAdd(day, landing, form));
  });

  return {
    open: query.sheet === "add",
    start,
    day,
    preset: seed?.sheet?.fields,
    heldAtMin:
      seed?.drag === undefined
        ? undefined
        : Number(seed.drag.slice(0, 2)) * 60 + Number(seed.drag.slice(3)),
    close,
    add,
    /** This screen's path and query, the add sheet's own keys left off. */
    hereWithoutAdd: () => {
      const query = new URLSearchParams(window.location.search);
      for (const key of ["sheet", "at", "tier", "block"]) query.delete(key);
      const search = query.toString();
      return `${window.location.pathname}${search ? `?${search}` : ""}`;
    },
  };
}
