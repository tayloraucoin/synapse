import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { STORY_TIME_ZONE, BLOCK_WORK, BLOCK_MORNING } from "../../__fixtures__/view-models";
import { ScheduleAxis } from "../schedule-axis";
import { ScheduleBlock } from "../schedule-block";
import { BlockBand } from "./block-band";

const PX_PER_HOUR = 64;
const DAY_START_MIN = 7 * 60;
const toPx = (minutesFromMidnight: number) => ((minutesFromMidnight - DAY_START_MIN) / 60) * PX_PER_HOUR;

const meta: Meta<typeof BlockBand> = {
  title: "Composed/Display/BlockBand",
  component: BlockBand,
  decorators: [
    (Story) => (
      <ScheduleAxis startMin={DAY_START_MIN} endMin={18 * 60} pxPerHour={PX_PER_HOUR} timeZone={STORY_TIME_ZONE} className="h-[640px]">
        <Story />
      </ScheduleAxis>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof BlockBand>;

/** The morning behind its items — `bg-surface`, the name in the gutter (§6.5). */
export const Morning: Story = {
  render: () => (
    <BlockBand kind="morning" name="Morning" topPx={toPx(8 * 60 + 3)} heightPx={toPx(9 * 60 + 4) - toPx(8 * 60 + 3)}>
      {BLOCK_MORNING.items.map((item) => (
        <ScheduleBlock
          key={item.id}
          item={item}
          topPx={toPx(minutesOf(item.scheduledStart as Date)) - toPx(8 * 60 + 3)}
          heightPx={((item.durationMin ?? 0) / 60) * PX_PER_HOUR}
          timeZone={STORY_TIME_ZONE}
          onOpen={() => {}}
        />
      ))}
    </BlockBand>
  ),
};

/** The work band is the tallest; the fixture sits inside it as a pin. */
export const Work: Story = {
  render: () => (
    <BlockBand kind="work" name="Work" topPx={toPx(9 * 60)} heightPx={toPx(17 * 60 + 30) - toPx(9 * 60)}>
      {BLOCK_WORK.items
        .filter((item) => item.origin === "fixture")
        .map((item) => (
          <ScheduleBlock
            key={item.id}
            item={item}
            pinned
            topPx={toPx(minutesOf(item.scheduledStart as Date)) - toPx(9 * 60)}
            heightPx={((item.durationMin ?? 0) / 60) * PX_PER_HOUR}
            timeZone={STORY_TIME_ZONE}
            onOpen={() => {}}
          />
        ))}
    </BlockBand>
  ),
};

/** *Inside work*: the container visibly splits around the training band (§6.5). */
export const SplitWork: StoryObj = {
  render: () => (
    <>
      <BlockBand kind="work" name="Work" topPx={toPx(9 * 60)} heightPx={toPx(12 * 60 + 45) - toPx(9 * 60)} />
      <BlockBand kind="training" name={null} topPx={toPx(12 * 60 + 45)} heightPx={PX_PER_HOUR} />
      <BlockBand kind="work" name="Work" topPx={toPx(13 * 60 + 45)} heightPx={toPx(17 * 60 + 30) - toPx(13 * 60 + 45)} />
    </>
  ),
};

/** The header is a button — *Move Morning* — when the band can be dragged. */
export const Draggable: Story = {
  args: {
    kind: "morning",
    name: "Morning",
    topPx: toPx(8 * 60),
    heightPx: PX_PER_HOUR,
    draggable: true,
  },
};

/** A pooled block before the pick: the band, empty, *decide in the morning*. */
export const Pooled: Story = {
  args: {
    kind: "morning",
    name: null,
    topPx: toPx(8 * 60),
    heightPx: PX_PER_HOUR,
    pooled: true,
  },
};

/**
 * UX v1.2 §4.13i (RUN-7): a two-hour axis — the day builder's — puts every
 * label inside its band, 8px from the top-left, with the span beside the name;
 * nothing sits in the gutter and no label overlaps another.
 */
export const InsideLabelsUnderThreeHours: StoryObj = {
  decorators: [
    (Story) => (
      <ScheduleAxis startMin={7 * 60} endMin={9 * 60} pxPerHour={96} timeZone={STORY_TIME_ZONE} className="h-[240px]">
        <Story />
      </ScheduleAxis>
    ),
  ],
  render: () => (
    <>
      <BlockBand kind="orient" name={null} span="7:00–7:15" topPx={0} heightPx={24} />
      <BlockBand kind="prep" name="Getting ready" span="7:15–7:45" topPx={24} heightPx={48} />
      <BlockBand kind="morning" name="Morning" span="7:45–8:40" topPx={72} heightPx={88} />
      <BlockBand kind="training" name={null} span="8:40–9:00" topPx={160} heightPx={32} />
    </>
  ),
};

/** Four hours: the gutter, as before — the axis's word is *gutter* from three hours up. */
export const GutterLabelsAtFourHours: StoryObj = {
  decorators: [
    (Story) => (
      <ScheduleAxis startMin={7 * 60} endMin={11 * 60} pxPerHour={64} timeZone={STORY_TIME_ZONE} className="h-[300px]">
        <Story />
      </ScheduleAxis>
    ),
  ],
  render: () => (
    <>
      <BlockBand kind="prep" name="Getting ready" topPx={16} heightPx={40} />
      <BlockBand kind="morning" name="Morning" topPx={64} heightPx={72} />
      <BlockBand kind="work" name="Work" topPx={144} heightPx={112} />
    </>
  ),
};

/** UX v1.2 §4.13i (RUN-12): the review's read-only strip — the band's label is a button to its screen. */
export const TapToEdit: StoryObj = {
  decorators: [
    (Story) => (
      <ScheduleAxis startMin={7 * 60} endMin={9 * 60} pxPerHour={96} timeZone={STORY_TIME_ZONE} className="h-[220px]">
        <Story />
      </ScheduleAxis>
    ),
  ],
  render: () => (
    <>
      <BlockBand kind="morning" name="Morning routine A" topPx={16} heightPx={88} labelPlacement="inside" span="7:10–8:05" editLabel="Morning routine A, 7:10–8:05, edit" onEdit={() => {}} />
      <BlockBand kind="prep" name="Getting ready A" topPx={112} heightPx={72} labelPlacement="inside" span="8:15–9:00" editLabel="Getting ready A, 8:15–9:00, edit" onEdit={() => {}} />
    </>
  ),
};

/* ---- UX v1.3 R47, TD-29 (DAY-7): the kind's hue, planning surfaces only ---- */

/** The primer's example day (v1.3 §12.4), as spans from 7:00 — minutes from 7:00 and lengths. */
const EXAMPLE: ReadonlyArray<{ kind: React.ComponentProps<typeof BlockBand>["kind"]; name: string | null; from: number; to: number; span: string }> = [
  { kind: "orient", name: null, from: 0, to: 5, span: "7:00" },
  { kind: "morning", name: "Morning routine", from: 5, to: 60, span: "7:05" },
  { kind: "training", name: null, from: 60, to: 120, span: "8:00" },
  { kind: "prep", name: null, from: 120, to: 150, span: "9:00" },
  { kind: "work", name: null, from: 150, to: 480, span: "9:30" },
  { kind: "break", name: null, from: 480, to: 495, span: "15:00" },
  { kind: "break", name: "Lunch", from: 495, to: 525, span: "15:15" },
  { kind: "work", name: null, from: 525, to: 720, span: "15:45" },
  { kind: "transition", name: null, from: 720, to: 750, span: "19:00" },
  { kind: "activity", name: null, from: 750, to: 840, span: "19:30" },
  { kind: "wind_down", name: null, from: 840, to: 930, span: "21:00" },
];
const COMPACT = 28;
const px28 = (minutes: number) => (minutes / 60) * COMPACT;

/** Nine kinds, hued, on the compact 28px/h axis — the washes read as one family, labels inside. */
export const NineKindsHued: StoryObj = {
  decorators: [
    (Story) => (
      <ScheduleAxis startMin={7 * 60} endMin={31 * 60} pxPerHour={28} timeZone={STORY_TIME_ZONE} className="h-[700px] max-w-[375px]">
        <Story />
      </ScheduleAxis>
    ),
  ],
  render: () => (
    <>
      {EXAMPLE.map((band) => (
        <BlockBand
          key={`${band.kind}-${band.from}`}
          kind={band.kind}
          name={band.name}
          span={band.span}
          topPx={px28(band.from)}
          heightPx={Math.max(px28(band.to - band.from), 12)}
          hue
        />
      ))}
    </>
  ),
};

/** Hued and pooled: the dashed edge stays over the wash. */
export const HuedAndPooled: StoryObj = {
  decorators: [
    (Story) => (
      <ScheduleAxis startMin={18 * 60} endMin={21 * 60} pxPerHour={64} timeZone={STORY_TIME_ZONE} className="h-[220px]">
        <Story />
      </ScheduleAxis>
    ),
  ],
  render: () => (
    <>
      <BlockBand kind="transition" name="After work A" topPx={0} heightPx={32} hue labelPlacement="inside" span="18:00–18:30" />
      <BlockBand kind="activity" name="Evenings A" topPx={40} heightPx={140} hue pooled labelPlacement="inside" span="18:30–21:00" />
    </>
  ),
};

/** The rule: the Schedule's monochrome bands (left, no `hue`) beside the planning surfaces' hued ones. */
export const MonochromeBesideHued: StoryObj = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div className="grid grid-cols-2 gap-(--space-4)">
      {[false, true].map((hue) => (
        <ScheduleAxis key={String(hue)} startMin={7 * 60} endMin={10 * 60} pxPerHour={64} timeZone={STORY_TIME_ZONE} className="h-[220px]">
          <BlockBand kind="morning" name="Morning routine A" topPx={0} heightPx={64} hue={hue} labelPlacement="inside" span="7:00–8:00" />
          <BlockBand kind="prep" name="Getting ready A" topPx={72} heightPx={48} hue={hue} labelPlacement="inside" span="8:00–8:45" />
          <BlockBand kind="work" name={null} topPx={128} heightPx={64} hue={hue} labelPlacement="inside" span="9:00–" />
        </ScheduleAxis>
      ))}
    </div>
  ),
};

function minutesOf(date: Date): number {
  return ((date.getUTCHours() - 7 + 24) % 24) * 60 + date.getUTCMinutes();
}
