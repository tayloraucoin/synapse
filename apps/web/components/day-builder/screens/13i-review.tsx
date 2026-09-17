"use client";

import * as React from "react";

import type { DayItemView, SlotView } from "@syn/types";
import {
  BlockBand,
  GapBand,
  SCHEDULE_GUTTER_PX,
  ScheduleAxis,
  ScheduleBlock,
  Text,
  cn,
} from "@syn/ui";

import { SlotSheet, toItemView } from "@/components/block-editor";

import { display } from "../clock";
import { DAY_BUILDER_COPY as COPY } from "../copy";
import { buildPreview, type PreviewBlock, type PreviewItem } from "../preview";
import { useTemplateSlots, type BuilderScreen, type DayBuilderApi } from "../use-day-builder";
import { JOURNAL_MIN } from "./13h-wind-down";

const PX_PER_HOUR = 96;
const PX_PER_MIN = PX_PER_HOUR / 60;

/**
 * 13i — the day as it stands (UX v1.2 §4.13i).
 *
 * READ-ONLY. `buildPreview` lays the plan's parts out through `stackBlock`
 * on the client; nothing here writes a block or an item. The axis runs from
 * *up at* to *lights out* at 96px/h with every band's name inside it
 * (S12.1); slack between blocks is labelled in the gutter; a workout's
 * travel is a thin end on its band; a fixture carries the anchor glyph.
 * Tap a band → its screen; tap an item → DYN-8's slot sheet for its list.
 */
export function ScreenReview({ api, onGo, disabled }: { api: DayBuilderApi; onGo: (screen: BuilderScreen) => void; disabled: boolean }) {
  const plan = api.plan;
  const prep = useTemplateSlots(plan?.gettingReady?.templateId ?? null);
  const morning = useTemplateSlots(plan?.morning?.templateId ?? null);
  const windDown = useTemplateSlots(plan?.windDown?.templateId ?? null);
  const [sheet, setSheet] = React.useState<{ templateId: string; slot: SlotView; slots: readonly SlotView[] } | null>(null);

  const journalOn = api.profile?.journalEnabled ?? true;
  const preview = React.useMemo(() => {
    if (plan === null) return null;
    const listOf = (ref: { templateId: string } | null, slots: SlotView[] | null) =>
      ref === null || slots === null ? null : { templateId: ref.templateId, slots };
    return buildPreview({
      plan,
      times: api.times,
      orientMin: api.orientMin,
      prep: listOf(plan.gettingReady, prep.slots),
      morning: listOf(plan.morning, morning.slots),
      windDown: listOf(plan.windDown, windDown.slots),
      habits: api.habits,
      fixtures: api.fixtures.filter((fixture) => !fixture.archived && !plan.excludedFixtureIds.includes(fixture.id) && fixture.weekdays.some((weekday) => plan.weekdays.includes(weekday))),
      journalMin: journalOn ? JOURNAL_MIN : 0,
    });
  }, [plan, api.times, api.orientMin, api.habits, api.fixtures, prep.slots, morning.slots, windDown.slots, journalOn]);

  if (plan === null || preview === null) return null;

  const topOf = (minutes: number) => (minutes - preview.startMin) * PX_PER_MIN;
  const spanOf = (block: PreviewBlock) => `${display(block.startMin % (24 * 60))}–${display(block.endMin % (24 * 60))}`;
  const nameOf = (block: PreviewBlock) => block.name ?? COPY.blocks[block.kind] ?? block.kind;

  const renderItem = (item: PreviewItem) => {
    if (item.travel !== undefined) {
      // A thin end: the travel's minutes as a hairline strip on the workout's band.
      return (
        <div
          key={item.id}
          aria-hidden="true"
          style={{ top: `${topOf(item.startMin)}px`, height: `${Math.max(2, (item.endMin - item.startMin) * PX_PER_MIN)}px`, insetInlineStart: `${SCHEDULE_GUTTER_PX}px` }}
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
    const slot = item.slot;
    return (
      <ScheduleBlock
        key={item.id}
        item={view}
        topPx={topOf(item.startMin)}
        heightPx={Math.max(2, (item.endMin - item.startMin) * PX_PER_MIN)}
        timeZone="UTC"
        pinned={item.pinned ?? false}
        onOpen={() => {
          if (disabled || slot === undefined) return;
          const slots = slot.templateId === plan.gettingReady?.templateId ? prep.slots : slot.templateId === plan.morning?.templateId ? morning.slots : windDown.slots;
          setSheet({ templateId: slot.templateId, slot: slot.slot, slots: slots ?? [] });
        }}
      />
    );
  };

  return (
    <div className="flex flex-col gap-(--space-4)">
      <ScheduleAxis
        startMin={preview.startMin}
        endMin={preview.endMin}
        pxPerHour={PX_PER_HOUR}
        timeZone="UTC"
        className="-mx-(--space-4)"
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
            name={block.name}
            topPx={topOf(block.startMin)}
            heightPx={Math.max(24, (block.endMin - block.startMin) * PX_PER_MIN)}
            labelPlacement="inside"
            span={spanOf(block)}
            editLabel={COPY.i.band(nameOf(block), spanOf(block))}
            onEdit={disabled ? undefined : () => onGo(block.screen)}
          />
        ))}
        {/* Items sit on the axis, not in the band, so their tops are the axis's (as the strip does). */}
        {preview.blocks.flatMap((block) => block.items.map(renderItem))}
      </ScheduleAxis>

      {sheet === null ? null : (
        <SlotSheet
          open
          templateId={sheet.templateId}
          structure="stack"
          slot={sheet.slot}
          slots={sheet.slots}
          onOpenChange={(open) => {
            if (!open) setSheet(null);
          }}
          onChanged={async () => {
            await Promise.all([prep.refresh(), morning.refresh(), windDown.refresh()]);
          }}
        />
      )}
    </div>
  );
}
