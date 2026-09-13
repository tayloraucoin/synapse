"use client";

import * as React from "react";

import {
  EmptyState,
  GapBand,
  SCHEDULE_GUTTER_PX,
  ScheduleAxis,
  ScheduleBlock,
  SlotRow,
  StateWord,
  Text,
} from "@syn/ui";
import type { DayItemView, SlotView } from "@syn/types";

import { BLOCK_EDITOR_COPY as COPY } from "./copy";
import type { WalkResult } from "./use-block-editor";

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
 * cannot look different. Drag is DYN-9's: every block is `draggable={false}`
 * here, and the slot sheet is the whole editing surface.
 *
 * A PLACEABLE KIND (training, break) has no anchor of its own — it is placed
 * each morning — so its strip is the stack as rows, in order, with the gaps
 * written between them; the gutter would have nothing true to say.
 */

const PX_PER_HOUR = 96;
const PX_PER_MIN = PX_PER_HOUR / 60;

export interface BlockStripProps {
  slots: readonly SlotView[];
  walk: WalkResult | null;
  onOpen: (slot: SlotView) => void;
  onAdd: () => void;
  disabled?: boolean;
}

/** A slot as the block composite reads it: minutes into instants on a fixed day. */
function toItemView(slot: SlotView, startMin: number, endMin: number): DayItemView {
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
  };
}

type Placed = { slot: SlotView; startMin: number; endMin: number };

export function BlockStrip({ slots, walk, onOpen, onAdd, disabled = false }: BlockStripProps) {
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
        <TimedStrip placed={placed} walk={walk} disabled={disabled} onOpen={onOpen} />
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
}: {
  placed: Placed[];
  walk: WalkResult;
  disabled: boolean;
  onOpen: (slot: SlotView) => void;
}) {
  const anchorMin = walk.anchorMin as number;
  const startMin = walk.startMin as number;
  const endMin = walk.endMin as number;

  const spanStart = Math.floor(Math.min(startMin, anchorMin) / 60) * 60;
  const spanEnd = Math.max(Math.ceil(Math.max(endMin, anchorMin) / 60) * 60, spanStart + 60);
  const topOf = (minutes: number) => (minutes - spanStart) * PX_PER_MIN;

  // Gaps: the space the walk left between consecutive items.
  const gaps = placed.flatMap((entry, index) => {
    const next = placed[index + 1];
    if (!next) return [];
    const gapMin = next.startMin - entry.endMin;
    if (gapMin <= 0) return [];
    return [
      {
        id: `${entry.slot.id}-${next.slot.id}`,
        startMin: entry.endMin,
        minutes: gapMin,
        before: entry.slot.title,
        after: next.slot.title,
      },
    ];
  });

  return (
    <ScheduleAxis startMin={spanStart} endMin={spanEnd} pxPerHour={PX_PER_HOUR} timeZone="UTC">
      {gaps.map((gap) => (
        <GapBand
          key={gap.id}
          minutes={gap.minutes}
          topPx={topOf(gap.startMin)}
          heightPx={gap.minutes * PX_PER_MIN}
          between={{ before: gap.before, after: gap.after }}
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
            onOpen={() => {
              if (!disabled) onOpen(slot);
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
  );
}
