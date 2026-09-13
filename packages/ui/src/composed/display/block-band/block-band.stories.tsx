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

function minutesOf(date: Date): number {
  return ((date.getUTCHours() - 7 + 24) % 24) * 60 + date.getUTCMinutes();
}
