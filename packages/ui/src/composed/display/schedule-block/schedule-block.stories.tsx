import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { STORY_TIME_ZONE, itemInState } from "../../__fixtures__/view-models";
import { ScheduleBlock } from "./schedule-block";

/**
 * The size is derived from the block's own height, not chosen by the caller:
 * a 15-minute item at 64px an hour is 16px tall and cannot hold a title, and
 * a caller that guessed would render unreadable text.
 */
const meta: Meta<typeof ScheduleBlock> = {
  title: "Composed/Display/ScheduleBlock",
  component: ScheduleBlock,
  parameters: { layout: "fullscreen" },
  args: { timeZone: STORY_TIME_ZONE, onOpen: () => {} },
  decorators: [
    (Story) => (
      <div className="relative h-64 w-80 p-(--space-6)">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ScheduleBlock>;

export const Full: Story = {
  args: { item: itemInState("upcoming"), topPx: 0, heightPx: 64 },
};

export const Compact: Story = {
  args: { item: itemInState("upcoming"), topPx: 0, heightPx: 20 },
};

export const Hairline: Story = {
  args: { item: itemInState("upcoming"), topPx: 0, heightPx: 8 },
};

export const Active: Story = {
  args: { item: itemInState("active"), topPx: 0, heightPx: 64 },
};

export const Moved: Story = {
  args: { item: itemInState("done-off-schedule"), topPx: 0, heightPx: 64 },
};

/** A hard anchor carries its glyph before the title. */
export const FixedAnchor: Story = {
  args: {
    item: itemInState("upcoming", { scheduling: "hard", title: "Dentist" }),
    topPx: 0,
    heightPx: 64,
  },
};

/** Two things at once share the band with 4px gutters. */
export const Multitask: StoryObj = {
  render: () => (
    <>
      <ScheduleBlock
        item={itemInState("upcoming", { title: "Podcast" })}
        topPx={0}
        heightPx={64}
        multitask={{ index: 0, count: 2 }}
        timeZone={STORY_TIME_ZONE}
        onOpen={() => {}}
      />
      <ScheduleBlock
        item={itemInState("upcoming", { title: "Dishes" })}
        topPx={0}
        heightPx={64}
        multitask={{ index: 1, count: 2 }}
        timeZone={STORY_TIME_ZONE}
        onOpen={() => {}}
      />
    </>
  ),
};
