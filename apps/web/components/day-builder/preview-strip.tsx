"use client";

import type { DayItemView } from "@syn/types";
import { BlockBand, GapBand, SCHEDULE_GUTTER_PX, ScheduleAxis, ScheduleBlock, Text, cn } from "@syn/ui";

import { toItemView } from "@/components/block-editor";

import { display } from "./clock";
import { DAY_BUILDER_COPY as COPY } from "./copy";
import type { DayPreview, PreviewBlock, PreviewItem } from "./preview";
import type { BuilderScreen } from "./use-day-builder";

const PX_PER_HOUR = 96;
const PX_PER_MIN = PX_PER_HOUR / 60;

/**
 * The builder's strip — the day as `buildPreview` lays it out, drawn on the
 * `ScheduleAxis` at 96px an hour (UX v1.2 §4.13i; v1.3 R67, DAY-9). One
 * component for the review and for B7's cut, so the two cannot drift.
 *
 * READ-ONLY. Every band's name and span sit inside it (S12.1); slack between
 * blocks is labelled in the gutter; a travel end is a thin strip on its band;
 * a fixture carries the anchor glyph. A band is a button to its screen; an
 * item from a list opens the caller's slot sheet.
 *
 * `hue` IS FOR PLANNING SURFACES (TD-29): the builder's strips take the
 * kinds' washes; nothing on `/today` or the Schedule ever passes it. An OPEN
 * band (the routine before B11 has built it) is the pooled grammar — the
 * dashed hairline over the wash — labelled with `openLabel`.
 */
export function PreviewStrip({
  preview,
  hue = false,
  openLabel,
  disabled,
  onGo,
  onItem,
  className,
}: {
  preview: DayPreview;
  hue?: boolean;
  /** The open band's label — *Morning routine · not built yet*. */
  openLabel?: string;
  disabled: boolean;
  onGo: (screen: BuilderScreen) => void;
  /** A list's item was tapped; absent where items open nothing. */
  onItem?: (item: PreviewItem) => void;
  className?: string;
}) {
  const topOf = (minutes: number) => (minutes - preview.startMin) * PX_PER_MIN;
  const spanOf = (block: PreviewBlock) => `${display(block.startMin % (24 * 60))}–${display(block.endMin % (24 * 60))}`;
  const nameOf = (block: PreviewBlock) =>
    block.open === true && openLabel !== undefined ? openLabel : (block.name ?? COPY.blocks[block.kind] ?? block.kind);

  const renderItem = (item: PreviewItem) => {
    if (item.travel !== undefined) {
      // A thin end: the travel's minutes as a strip on the band.
      return (
        <div
          key={item.id}
          aria-hidden="true"
          style={{
            top: `${topOf(item.startMin)}px`,
            height: `${Math.max(2, (item.endMin - item.startMin) * PX_PER_MIN)}px`,
            insetInlineStart: `${SCHEDULE_GUTTER_PX}px`,
          }}
          className={cn("bg-edge absolute end-0 z-10 flex items-center rounded-(--radius) px-(--space-2) opacity-70")}
        >
          <Text as="span" variant="caption" tone="secondary" className="tabular-nums">
            {item.travel === "there" ? COPY.i.travelThere : COPY.i.travelBack}
          </Text>
        </div>
      );
    }
    const view: DayItemView =
      item.slot === undefined
        ? {
            ...toItemView(
              {
                id: item.id,
                habitId: item.id,
                title: item.title,
                icon: item.icon ?? { kind: "emoji", value: "" },
                timeMode: "fixed_time",
                startClock: null,
                endClock: null,
                durationMin: item.endMin - item.startMin,
                priority: 4,
                overridden: false,
                scheduling: "hard",
                multitask: "none",
                gapBeforeMin: 0,
                pinnedClock: item.pinned ? "00:00" : null,
                role: "stack",
                alternates: null,
              },
              item.startMin,
              item.endMin,
            ),
            origin: "fixture",
          }
        : toItemView(item.slot.slot, item.startMin, item.endMin);
    return (
      <ScheduleBlock
        key={item.id}
        item={view}
        topPx={topOf(item.startMin)}
        heightPx={Math.max(2, (item.endMin - item.startMin) * PX_PER_MIN)}
        timeZone="UTC"
        pinned={item.pinned ?? false}
        onOpen={() => {
          if (disabled || item.slot === undefined) return;
          onItem?.(item);
        }}
      />
    );
  };

  return (
    <ScheduleAxis
      startMin={preview.startMin}
      endMin={preview.endMin}
      pxPerHour={PX_PER_HOUR}
      timeZone="UTC"
      className={cn("-mx-(--space-4)", className)}
    >
      {preview.slack.map((gap) => (
        <GapBand
          key={gap.key}
          minutes={gap.endMin - gap.startMin}
          topPx={topOf(gap.startMin)}
          heightPx={(gap.endMin - gap.startMin) * PX_PER_MIN}
          label="slack"
          between={{ before: gap.before, after: gap.after }}
        />
      ))}
      {preview.blocks.map((block) => (
        <BlockBand
          key={block.key}
          kind={block.kind}
          name={nameOf(block)}
          topPx={topOf(block.startMin)}
          heightPx={Math.max(24, (block.endMin - block.startMin) * PX_PER_MIN)}
          labelPlacement="inside"
          span={block.open === true ? undefined : spanOf(block)}
          pooled={block.open === true}
          hue={hue}
          editLabel={COPY.i.band(nameOf(block), spanOf(block))}
          onEdit={disabled ? undefined : () => onGo(block.screen)}
        >
          {/* Not `undefined`: an open band is not a pool, so no *decide in the morning*. */}
          {null}
        </BlockBand>
      ))}
      {/* Items sit on the axis, not in the band, so their tops are the axis's (as the strip does). */}
      {preview.blocks.flatMap((block) => block.items.map(renderItem))}
    </ScheduleAxis>
  );
}
