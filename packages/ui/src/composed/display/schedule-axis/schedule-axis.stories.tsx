import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { STORY_TIME_ZONE, itemInState } from "../../__fixtures__/view-models";
import { NowLine } from "../now-line";
import { ScheduleBlock } from "../schedule-block";
import { GhostBlock, ShiftBand, WindowSpan } from "../schedule-overlays";
import { ScheduleAxis } from "./schedule-axis";

/**
 * Phase 2. The axis is a `role="grid"` with one row per 15-minute band, so a
 * screen-reader user moves through the day in order instead of meeting an
 * unordered pile of absolutely positioned buttons.
 */
const meta: Meta<typeof ScheduleAxis> = {
  title: "Composed/Display/ScheduleAxis",
  component: ScheduleAxis,
  parameters: { layout: "fullscreen" },
  args: {
    startMin: 6 * 60,
    endMin: 12 * 60,
    timeZone: STORY_TIME_ZONE,
  },
  decorators: [(Story) => <div className="h-[600px] max-w-lg"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof ScheduleAxis>;

const px = (min: number, pxPerHour = 64) => ((min - 360) / 60) * pxPerHour;

export const Empty: Story = { args: { children: null } };

export const WithBlocks: Story = {
  args: {
    children: (
      <>
        <WindowSpan topPx={px(480)} heightPx={128} />
        <ScheduleBlock
          item={itemInState("done", { title: "Morning run" })}
          topPx={px(420)}
          heightPx={42}
          timeZone={STORY_TIME_ZONE}
          onOpen={() => {}}
        />
        <GhostBlock
          item={itemInState("done-off-schedule", { title: "Stretch" })}
          topPx={px(465)}
          heightPx={16}
          onOpen={() => {}}
        />
        <ShiftBand
          topPx={px(500)}
          deltaMin={60}
          reasonLabel="slept in"
          onOpen={() => {}}
        />
        <ScheduleBlock
          item={itemInState("active", { title: "Deep work", timerElapsedSec: 900 })}
          topPx={px(540)}
          heightPx={96}
          timeZone={STORY_TIME_ZONE}
          onOpen={() => {}}
        />
        <NowLine atMin={585} topPx={px(585)} label="9:45" />
      </>
    ),
  },
};

/** 96px an hour is the ≥150% text-scale setting — the hairlines stay apart. */
export const LargeTextScale: Story = {
  args: { pxPerHour: 96, children: null },
};

export const Extendable: Story = {
  args: { children: null, onExtend: () => {} },
};

/**
 * UX v1.3 §4.2 (DAY-7): the compact 28px an hour — the primer's 24 hours,
 * 7:00 to 7:00, in 672px; every third hour labelled, half-hours unlined,
 * and every band's label inside it.
 */
export const Compact28px24Hours: Story = {
  decorators: [(Story) => <div className="h-[720px] max-w-[375px]"><Story /></div>],
  args: { startMin: 7 * 60, endMin: 31 * 60, pxPerHour: 28, children: null },
};
