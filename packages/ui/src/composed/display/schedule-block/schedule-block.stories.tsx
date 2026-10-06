import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { BLOCK_WORK, STORY_TIME_ZONE, itemInState } from "../../__fixtures__/view-models";
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

/*
 * ---- UX v1.1 (DYN-7) ----
 */

/** A pin: the anchor glyph, and `data-pinned` so the layer never lifts it (§6.5). */
export const Pinned: Story = {
  args: {
    item: itemInState("upcoming", { title: "Stand-up", pinned: true, scheduling: "hard" }),
    topPx: 0,
    heightPx: 32,
    pinned: true,
  },
};

/** The bottom-edge handle for today's length (§6.5). */
export const Resizable: Story = {
  args: { item: itemInState("upcoming"), topPx: 0, heightPx: 64, draggable: true, resizable: true },
};

/** The layer's ghost: 0.9 opacity, 1.5px accent border, scaled 1.02 (§6.5, §10.1). */
export const Lifted: Story = {
  args: { item: itemInState("upcoming"), topPx: 0, heightPx: 64, draggable: true, lifted: true },
};

/** The work container with two fixtures pinned inside it (§6.1, §6.5). */
export const Container: StoryObj = {
  render: () => {
    const [focus, ...fixtures] = BLOCK_WORK.items;
    return (
      <ScheduleBlock
        item={focus as (typeof BLOCK_WORK.items)[number]}
        topPx={0}
        heightPx={224}
        container
        timeZone={STORY_TIME_ZONE}
        onOpen={() => {}}
      >
        {fixtures.map((fixture, index) => (
          <ScheduleBlock
            key={fixture.id}
            item={fixture}
            topPx={40 + index * 48}
            heightPx={24}
            pinned
            timeZone={STORY_TIME_ZONE}
            onOpen={() => {}}
            className="inset-x-(--space-2) w-auto"
          />
        ))}
      </ScheduleBlock>
    );
  },
};

/** *Not confirmed* on the Schedule: a ghost outline, no fill (§10.1). */
export const GhostOutline: Story = {
  args: { item: itemInState("not-confirmed", { title: "Stretch" }), topPx: 0, heightPx: 40 },
};

/** After devices-off: the block at default; the sheet opens read-only (§10.1). */
export const ConfirmLater: Story = {
  args: { item: itemInState("confirm-later", { title: "Read" }), topPx: 0, heightPx: 40 },
};
