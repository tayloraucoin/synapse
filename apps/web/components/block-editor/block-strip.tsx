"use client";

import * as React from "react";

import {
  DragLayer,
  EmptyState,
  GapBand,
  SCHEDULE_GUTTER_PX,
  ScheduleAxis,
  ScheduleBlock,
  SlotRow,
  StateWord,
  Text,
  type DragIntent,
  type DragLayerItem,
} from "@syn/ui";
import { GAP_MAX } from "@syn/constants";
import type { BlockKind, DayItemView, DragState, SlotView } from "@syn/types";
import { clockFromMinutes, formatClockFromMinutes } from "@syn/utils";

import { trpc } from "@/lib/trpc/client";

import { BLOCK_EDITOR_COPY as COPY } from "./copy";
import { parseClock, type WalkResult } from "./use-block-editor";

/**
 * The strip — UX v1.1 §3.11: "a vertical strip: the time gutter on the left
 * with hour and quarter-hour hairlines, and the items as blocks whose height
 * is their duration — the Schedule tab's own language, so the person learns
 * one visual grammar for planning and for the day. Between items, the gaps
 * render as thin empty bands with the minutes written in the gutter (*+5*);
 * a gap of zero is a hairline. A pin shows the anchor glyph and its clock
 * time; opener and closer rows … carry a small *opener* / *closer* caption,
 * and pool items sit in a lighter band labelled *decide in the morning*. A
 * one-of group is a single block with two tabs at its top; the default tab
 * is filled."
 *
 * 96 px/hour (§3.11). Every block is a `ScheduleBlock` fed a `DayItemView`
 * shaped from the slot — the same composite the Schedule draws, so the two
 * cannot look different.
 *
 * THE GESTURES ARE DYN-7'S LAYER, IN `editor` MODE (DYN-9): a lift and drop
 * reorders through `template.moveSlot` (the adjacent swap, `steps` times);
 * the bottom edge resizes through `template.saveSlot` with nothing clamped
 * (R21) and the habit's range drawn as a faint band; the seam between two
 * blocks — and `g` then a number — sets the lower slot's gap, bounded by the
 * validator's `GAP_MAX`. A pin never lifts, reorders, or takes a gap. Every
 * gesture has its keyboard path in the layer, and the slot sheet stays as
 * the fallback for all three (§13 #8).
 *
 * A PLACEABLE KIND (training, break) has no anchor of its own — it is placed
 * each morning — so its strip is the stack as rows, in order, with the gaps
 * written between them; the gutter would have nothing true to say, and no
 * layer is mounted.
 */

const PX_PER_HOUR = 96;
const PX_PER_MIN = PX_PER_HOUR / 60;

export interface BlockStripProps {
  templateId: string;
  kind: BlockKind;
  slots: readonly SlotView[];
  walk: WalkResult | null;
  onOpen: (slot: SlotView) => void;
  onAdd: () => void;
  /** After a gesture's write — the editor re-reads and the walk re-flows. */
  onChanged: () => Promise<void> | void;
  disabled?: boolean;
}

/** A slot as the block composite reads it: minutes into instants on a fixed day. Shared with the day builder's review (RUN-12). */
export function toItemView(slot: SlotView, startMin: number, endMin: number): DayItemView {
  const at = (minutes: number): Date => new Date(Date.UTC(2000, 0, 1, 0, minutes));
  return {
    id: slot.id,
    habitId: slot.habitId,
    title: slot.title,
    icon: slot.icon,
    type: "habit",
    category: null,
    timeMode: slot.timeMode,
    scheduledStart: at(startMin),
    scheduledEnd: at(endMin),
    originalScheduledStart: null,
    durationMin: slot.durationMin,
    priority: slot.priority,
    scheduling: slot.scheduling,
    origin: "template",
    carriedFromLabel: null,
    doneAt: null,
    quantityUnit: null,
    quantityValue: null,
    timerElapsedSec: null,
    state: "upcoming",
    multitask: slot.multitask,
    dayBlockId: null,
    blockKind: null,
    pinned: slot.pinnedClock !== null,
    gapBeforeMin: slot.gapBeforeMin,
    alternates:
      slot.alternates === null
        ? null
        : {
            id: slot.alternates.group,
            chosen: slot.alternates.isDefault,
            otherTitle: slot.alternates.otherTitle,
            otherDurationMin: slot.alternates.otherDurationMin,
          },
    versionKey: null,
    parentItemId: null,
  };
}

type Placed = { slot: SlotView; startMin: number; endMin: number };

export function BlockStrip({
  templateId,
  kind,
  slots,
  walk,
  onOpen,
  onAdd,
  onChanged,
  disabled = false,
}: BlockStripProps) {
  const gestures = useStripGestures(templateId, kind, slots, onChanged);
  const onWalk = slots.filter((slot) => slot.role !== "pool");
  const pool = slots.filter((slot) => slot.role === "pool");

  if (slots.length === 0) {
    return (
      <EmptyState
        text={COPY.empty}
        density="inline"
        actions={[{ label: COPY.add, onClick: onAdd }]}
      />
    );
  }

  const timed = walk !== null && walk.anchorMin !== null && walk.startMin !== null && walk.endMin !== null;

  const placed: Placed[] = [];
  if (walk !== null) {
    for (const slot of onWalk) {
      const startMin = walk.startMinById.get(slot.id);
      const endMin = walk.endMinById.get(slot.id);
      if (startMin !== undefined && endMin !== undefined) placed.push({ slot, startMin, endMin });
    }
  }
  placed.sort((a, b) => a.startMin - b.startMin);

  return (
    <div className="flex flex-col gap-(--space-4)">
      {timed ? (
        <TimedStrip
          placed={placed}
          walk={walk}
          disabled={disabled}
          onOpen={onOpen}
          gestures={gestures}
        />
      ) : (
        <ul className="flex flex-col">
          {onWalk.map((slot) => (
            <SlotRow key={slot.id} slot={slot} showGap onOpen={disabled ? undefined : onOpen} />
          ))}
        </ul>
      )}

      {pool.length === 0 ? null : (
        <div className="bg-surface/60 flex flex-col gap-(--space-2) rounded-(--radius) p-(--space-2)">
          <Text as="span" variant="caption" tone="secondary" className="px-(--space-2)">
            {COPY.decideInTheMorning}
          </Text>
          <ul className="flex flex-col">
            {pool.map((slot) => (
              <SlotRow key={slot.id} slot={slot} showGap={false} onOpen={disabled ? undefined : onOpen} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TimedStrip({
  placed,
  walk,
  disabled,
  onOpen,
  gestures,
}: {
  placed: Placed[];
  walk: WalkResult;
  disabled: boolean;
  onOpen: (slot: SlotView) => void;
  gestures: StripGestures;
}) {
  const anchorMin = walk.anchorMin as number;
  const startMin = walk.startMin as number;
  const endMin = walk.endMin as number;

  const spanStart = Math.floor(Math.min(startMin, anchorMin) / 60) * 60;
  const spanEnd = Math.max(Math.ceil(Math.max(endMin, anchorMin) / 60) * 60, spanStart + 60);
  const topOf = (minutes: number) => (minutes - spanStart) * PX_PER_MIN;

  /*
   * Gaps: the space the walk left between consecutive items. A seam sits on
   * every one — a zero gap is a hairline with a seam on it — except above a
   * pin, which has no gap to drag (§3.11).
   */
  const gaps = placed.flatMap((entry, index) => {
    const next = placed[index + 1];
    if (!next) return [];
    const gapMin = Math.max(0, next.startMin - entry.endMin);
    return [
      {
        id: `${entry.slot.id}-${next.slot.id}`,
        startMin: entry.endMin,
        minutes: gapMin,
        before: entry.slot.title,
        after: next.slot.title,
        afterId: next.slot.id,
        resizable: next.slot.pinnedClock === null,
      },
    ];
  });

  // The layer's geometry: the walk's placement, the pin flag, the range.
  const layerItems: DragLayerItem[] = placed.map(({ slot, startMin: s, endMin: e }) => ({
    id: slot.id,
    title: slot.title,
    startMin: s,
    durationMin: Math.max(0, e - s),
    pinned: slot.pinnedClock !== null,
    resizable: true,
    blockId: null,
    gapBeforeMin: slot.gapBeforeMin,
    ...gestures.rangeOf(slot),
  }));

  return (
    <DragLayer
      editor
      pxPerHour={PX_PER_HOUR}
      axisStartMin={spanStart}
      items={layerItems}
      state={gestures.state}
      disabled={disabled}
      onIntent={(intent) => void gestures.onIntent(intent, placed)}
      formatTime={formatClockFromMinutes}
    >
    <ScheduleAxis startMin={spanStart} endMin={spanEnd} pxPerHour={PX_PER_HOUR} timeZone="UTC">
      {gaps.map((gap) => (
        <GapBand
          key={gap.id}
          minutes={gap.minutes}
          topPx={topOf(gap.startMin)}
          heightPx={gap.minutes * PX_PER_MIN}
          between={{ before: gap.before, after: gap.after }}
          resizable={!disabled && gap.resizable}
          afterId={gap.afterId}
        />
      ))}
      {placed.map(({ slot, startMin: s, endMin: e }) => (
        <React.Fragment key={slot.id}>
          <ScheduleBlock
            item={toItemView(slot, s, e)}
            topPx={topOf(s)}
            heightPx={Math.max(2, (e - s) * PX_PER_MIN)}
            timeZone="UTC"
            pinned={slot.pinnedClock !== null}
            draggable={!disabled}
            resizable={!disabled}
            onOpen={() => {
              if (!disabled && !gestures.swallowClick()) onOpen(slot);
            }}
          />
          {/* The one-of tabs and the role caption ride on the block (§3.11). */}
          {slot.alternates !== null || slot.role === "opener" || slot.role === "closer" ? (
            <span
              aria-hidden="true"
              style={{ top: `${topOf(s) + 2}px`, insetInlineStart: `${SCHEDULE_GUTTER_PX}px` }}
              className="pointer-events-none absolute end-(--space-2) z-20 flex justify-end gap-(--space-2)"
            >
              {slot.alternates === null ? null : (
                <span className="border-hairline bg-paper inline-flex overflow-hidden rounded-(--radius) border text-(length:--fs-caption)">
                  <span
                    className={
                      slot.alternates.isDefault
                        ? "bg-primary text-primary-foreground px-(--space-2)"
                        : "text-text-secondary px-(--space-2)"
                    }
                  >
                    {`${slot.title} · ${slot.durationMin}`}
                  </span>
                  <span
                    className={
                      slot.alternates.isDefault
                        ? "text-text-secondary border-hairline border-s px-(--space-2)"
                        : "bg-primary text-primary-foreground border-hairline border-s px-(--space-2)"
                    }
                  >
                    {`${slot.alternates.otherTitle} · ${slot.alternates.otherDurationMin}`}
                  </span>
                </span>
              )}
              {slot.role === "opener" || slot.role === "closer" ? (
                <StateWord kind={slot.role} className="bg-paper rounded-(--radius) px-(--space-1)" />
              ) : null}
            </span>
          ) : null}
        </React.Fragment>
      ))}
      {/* The anchor itself: a hairline at the clock the block is measured from. */}
      <span
        aria-hidden="true"
        style={{ top: `${topOf(anchorMin)}px`, insetInlineStart: `${SCHEDULE_GUTTER_PX}px` }}
        className="border-edge pointer-events-none absolute end-0 border-t"
      />
    </ScheduleAxis>
    </DragLayer>
  );
}

/* ------------------------------------------------------------ gestures -- */

type StripGestures = {
  state: DragState;
  rangeOf: (slot: SlotView) => { rangeMin?: number; rangeMax?: number };
  onIntent: (intent: DragIntent, placed: readonly Placed[]) => Promise<void>;
  /** True once, right after a drop — the block's own click must not open the sheet. */
  swallowClick: () => boolean;
};

/**
 * The layer's intents as the editor's writes (DYN-9). Every gesture is
 * `template.saveSlot` or `template.moveSlot`; the range comes from the
 * kind's habit list, read once.
 */
function useStripGestures(
  templateId: string,
  kind: BlockKind,
  slots: readonly SlotView[],
  onChanged: () => Promise<void> | void,
): StripGestures {
  const saveSlot = trpc.template.saveSlot.useMutation();
  const moveSlot = trpc.template.moveSlot.useMutation();
  const habits = trpc.habit.list.useQuery({ includeArchived: true, blockKind: kind });
  const [state, setState] = React.useState<DragState>("idle");
  const dropped = React.useRef(false);

  const rangeByHabit = React.useMemo(
    () => new Map((habits.data?.habits ?? []).map((habit) => [habit.id, habit])),
    [habits.data?.habits],
  );

  const rangeOf = React.useCallback(
    (slot: SlotView) => {
      const habit = rangeByHabit.get(slot.habitId);
      if (!habit || habit.durationMin === null || habit.durationMax === null) return {};
      return { rangeMin: habit.durationMin, rangeMax: habit.durationMax };
    },
    [rangeByHabit],
  );

  /** The slot as `saveSlot` wants it, with one field changed. */
  const patch = React.useCallback(
    async (slot: SlotView, changes: { durationMin?: number; gapBeforeMin?: number }) => {
      const pinnedMin = parseClock(slot.pinnedClock);
      await saveSlot.mutateAsync({
        templateId,
        slotId: slot.id,
        habitId: slot.habitId,
        durationMin: changes.durationMin ?? slot.durationMin,
        gapBeforeMin: slot.pinnedClock === null ? (changes.gapBeforeMin ?? slot.gapBeforeMin) : 0,
        pinnedClock: pinnedMin === null ? null : clockFromMinutes(pinnedMin),
        role: slot.role,
        priorityOverride: slot.overridden ? slot.priority : null,
        scheduling: slot.scheduling,
      });
    },
    [saveSlot, templateId],
  );

  const settle = React.useCallback(async () => {
    setState("dropping");
    await onChanged();
    setState("idle");
  }, [onChanged]);

  const onIntent = React.useCallback(
    async (intent: DragIntent, placed: readonly Placed[]) => {
      dropped.current = true;
      window.setTimeout(() => {
        dropped.current = false;
      }, 0);

      const byId = new Map(slots.map((slot) => [slot.id, slot]));

      if (intent.kind === "resize") {
        const slot = byId.get(intent.id);
        if (!slot) return;
        // Nothing clamps to the range (R21); the validator's bounds are the day's.
        await patch(slot, { durationMin: intent.durationMin });
        await settle();
        return;
      }

      if (intent.kind === "gap") {
        const slot = byId.get(intent.id);
        if (!slot || slot.pinnedClock !== null) return;
        await patch(slot, { gapBeforeMin: Math.min(GAP_MAX, Math.max(0, intent.minutes)) });
        await settle();
        return;
      }

      if (intent.kind === "reorder") {
        /*
         * The layer's index is among the non-pinned placed slots in start
         * order; the service swaps adjacent positions in the template's
         * order, pins included. Map the target neighbour into that order and
         * step to it — swapping past a pin moves the pin's index, never its
         * time.
         */
        const order = placed.filter((entry) => entry.slot.pinnedClock === null).map((entry) => entry.slot);
        const from = slots.findIndex((slot) => slot.id === intent.id);
        const neighbour = order[intent.toIndex];
        if (from === -1 || neighbour === undefined || neighbour.id === intent.id) return;
        const to = slots.findIndex((slot) => slot.id === neighbour.id);
        if (to === -1 || to === from) return;
        await moveSlot.mutateAsync({
          id: intent.id,
          direction: to > from ? "down" : "up",
          steps: Math.abs(to - from),
        });
        await settle();
        return;
      }
      // `move` and `move-block` are the Schedule's; the editor never emits them.
    },
    [slots, patch, settle, moveSlot],
  );

  return {
    state,
    rangeOf,
    onIntent,
    swallowClick: () => dropped.current,
  };
}
