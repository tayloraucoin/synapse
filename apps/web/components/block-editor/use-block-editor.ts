"use client";

import * as React from "react";

import type { BlockFlow, BlockKind, BlockStructure, SaveStatus, SlotView } from "@syn/types";
import { clockToMinutes, formatClockFromMinutes, stackBlock, type StackItem } from "@syn/utils";

import { trpc } from "@/lib/trpc/client";

/**
 * The block editor's state — UX v1.1 §3.11 (DYN-8).
 *
 * TWO THINGS LIVE HERE. The autosave queue for the template's own fields
 * (carried from TP-02: serial, merged, debounced, three attempts, one
 * status per burst — a canvas autosaves and never prompts to discard). And
 * the WALK: `stackBlock` over the `SlotView`s the page already has, so the
 * footer's *7:03 – 8:15 · 72 min · 0 min slack* is recomputed on the client
 * after every edit with no fetch (TD-4: one arithmetic, the same function
 * the server ran for the same slots).
 *
 * THE BOUND IS THE PROFILE'S. A morning is measured against work start, a
 * prep against wake, a wind-down against work end, an activity against
 * lights-out; the profile is read once (`user.me`) and the slack or overrun
 * is the walk's own report. Overrun is a number in muted text, never a colour
 * and never a clamp (R7, R21).
 */

const DEBOUNCE_MS = 400;
const MAX_ATTEMPTS = 3;

export type TemplatePatch = {
  name?: string;
  anchorTime?: string | null;
  weeklyTarget?: number | null;
  typicalDays?: number[] | null;
  flow?: BlockFlow;
  structure?: BlockStructure;
};

/** "8:00", "08:00", "8:00 AM", "8:00 pm" → minutes from midnight. */
export function parseClock(text: string | null): number | null {
  if (text === null) return null;
  const match = /^\s*(\d{1,2}):(\d{2})\s*([AaPp][Mm])?\s*$/.exec(text);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  return hour * 60 + minute;
}

/**
 * A `SlotView` as the walk sees it. Multitask brackets are runs of
 * `first · middle · last`, so a synthetic id is assigned per run; a one-of
 * group's chosen member is its default; pool slots are not on the walk.
 */
export function toStackItems(slots: readonly SlotView[]): StackItem[] {
  const items: StackItem[] = [];
  let bracket: string | null = null;
  for (const slot of slots) {
    if (slot.role === "pool") continue;
    if (slot.multitask === "first") bracket = `bracket-${slot.id}`;
    const multitaskId = slot.multitask === "none" ? null : bracket;
    items.push({
      id: slot.id,
      durationMin: slot.durationMin,
      gapBeforeMin: slot.pinnedClock === null ? slot.gapBeforeMin : 0,
      pinnedAtMin: parseClock(slot.pinnedClock),
      scheduling: slot.scheduling,
      priority: slot.priority,
      multitaskId,
      alternatesId: slot.alternates?.group ?? null,
      alternatesChosen: slot.alternates === null ? undefined : slot.alternates.isDefault,
    });
    if (slot.multitask === "last" || slot.multitask === "none") bracket = null;
  }
  return items;
}

export type WalkResult = {
  startMinById: ReadonlyMap<string, number>;
  endMinById: ReadonlyMap<string, number>;
  startMin: number | null;
  endMin: number | null;
  totalMin: number;
  slackMin: number;
  overrunMin: number;
  overrunPinIds: readonly string[];
  anchorMin: number | null;
  boundMin: number | null;
};

export type Profile = {
  usualWakeTime: string;
  workStartTime: string | null;
  workEndTime: string | null;
  lightsOutTime: string | null;
};

/** Which profile clock bounds a kind's walk (the far edge from its anchor). */
function boundFor(kind: BlockKind, profile: Profile): number | null {
  const minutes = (clock: string | null) => (clock === null ? null : clockToMinutes(clock.slice(0, 5)));
  switch (kind) {
    case "orient":
    case "morning":
      return minutes(profile.workStartTime);
    case "prep":
      return minutes(profile.usualWakeTime);
    case "work":
      return minutes(profile.workEndTime);
    case "activity":
      return minutes(profile.lightsOutTime);
    case "wind_down":
      return minutes(profile.workEndTime);
    case "training":
    case "break":
      return null;
  }
}

export function walkSlots(
  slots: readonly SlotView[],
  kind: BlockKind,
  flow: BlockFlow,
  anchorClock: string | null,
  profile: Profile | null,
): WalkResult {
  const anchorMin = parseClock(anchorClock);
  const bound = profile === null ? null : boundFor(kind, profile);
  const result = stackBlock({
    items: toStackItems(slots),
    flow,
    anchorMin: anchorMin ?? 0,
    bound,
  });
  const startMinById = new Map<string, number>();
  const endMinById = new Map<string, number>();
  if (anchorMin !== null) {
    for (const placed of result.placed) {
      startMinById.set(placed.id, placed.startMin);
      endMinById.set(placed.id, placed.endMin);
    }
  }
  return {
    startMinById,
    endMinById,
    startMin: anchorMin === null || result.placed.length === 0 ? null : result.startMin,
    endMin: anchorMin === null || result.placed.length === 0 ? null : result.endMin,
    totalMin: result.totalMin,
    slackMin: result.slackMin,
    overrunMin: result.overrunMin,
    overrunPinIds: result.overrunPinIds,
    anchorMin,
    boundMin: bound,
  };
}

export const clockLabel = (minutes: number): string => formatClockFromMinutes(minutes);

export function useBlockEditor(templateId: string) {
  const utils = trpc.useUtils();
  const detail = trpc.template.get.useQuery({ id: templateId });
  const me = trpc.user.me.useQuery();
  const update = trpc.template.update.useMutation();

  const [status, setStatus] = React.useState<SaveStatus | undefined>(undefined);
  const [failed, setFailed] = React.useState(false);

  const pending = React.useRef<TemplatePatch>({});
  const timer = React.useRef<number | null>(null);
  const inFlight = React.useRef(false);

  const flush = React.useCallback(async () => {
    if (inFlight.current) return;
    const patch = pending.current;
    if (Object.keys(patch).length === 0) return;

    pending.current = {};
    inFlight.current = true;
    setStatus("saving");

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        await update.mutateAsync({ id: templateId, patch });
        await utils.template.get.invalidate({ id: templateId });
        await utils.template.list.invalidate();
        setStatus("saved");
        setFailed(false);
        inFlight.current = false;
        if (Object.keys(pending.current).length > 0) void flush();
        return;
      } catch {
        if (attempt === MAX_ATTEMPTS) break;
        setStatus("retrying");
        await new Promise((resolve) => window.setTimeout(resolve, 300 * attempt));
      }
    }

    setStatus("failed");
    setFailed(true);
    inFlight.current = false;
  }, [templateId, update, utils]);

  const changed = React.useRef(false);
  const markChanged = React.useCallback(() => {
    changed.current = true;
  }, []);

  const patch = React.useCallback(
    (next: TemplatePatch) => {
      changed.current = true;
      pending.current = { ...pending.current, ...next };
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        timer.current = null;
        void flush();
      }, DEBOUNCE_MS);
    },
    [flush],
  );

  React.useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const template = detail.data?.template;
  const slots = React.useMemo(() => detail.data?.slots ?? [], [detail.data?.slots]);
  const usualWakeTime = me.data?.usualWakeTime ?? null;
  const workStartTime = me.data?.workStartTime ?? null;
  const workEndTime = me.data?.workEndTime ?? null;
  const lightsOutTime = me.data?.lightsOutTime ?? null;
  const profile = React.useMemo<Profile | null>(
    () =>
      usualWakeTime === null
        ? null
        : { usualWakeTime, workStartTime, workEndTime, lightsOutTime },
    [usualWakeTime, workStartTime, workEndTime, lightsOutTime],
  );

  const kind = template?.kind;
  const flow = template?.flow;
  const anchorClock = template?.anchorClock ?? null;
  const walk = React.useMemo(
    () =>
      kind === undefined || flow === undefined
        ? null
        : walkSlots(slots, kind, flow, anchorClock, profile),
    [slots, kind, flow, anchorClock, profile],
  );

  const heldOnce = React.useRef(false);
  const validateForLeave = React.useCallback((): boolean => {
    const name = template?.name.trim() ?? "";
    const hasSlots = slots.length > 0;
    if (name !== "" || !hasSlots) return true;
    if (heldOnce.current) return true;
    heldOnce.current = true;
    return false;
  }, [template?.name, slots.length]);

  const refresh = React.useCallback(async () => {
    changed.current = true;
    await utils.template.get.invalidate({ id: templateId });
    await utils.template.list.invalidate();
  }, [templateId, utils]);

  return {
    detail,
    template,
    slots,
    walk,
    profile,
    collisions: detail.data?.collisions ?? [],
    appliedDays: detail.data?.appliedDays ?? 0,
    archived: template?.archived ?? false,
    status,
    saveFailed: failed,
    patch,
    markChanged,
    refresh,
    hasChanged: () => changed.current,
    validateForLeave,
  };
}

export type BlockEditorApi = ReturnType<typeof useBlockEditor>;
