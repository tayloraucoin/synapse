import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { itemInState } from "../../__fixtures__/view-models";
import { GhostBlock, ShiftBand, WindowSpan } from "./schedule-overlays";

const meta: Meta<typeof WindowSpan> = {
  title: "Composed/Display/ScheduleOverlays",
  component: WindowSpan,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="relative h-64 w-80 p-(--space-6)">
        <Story />
      </div>
    ),
  ],
};

export default meta;

/** Room, not a thing: no fill, no focus. */
export const Window: StoryObj = {
  render: () => <WindowSpan topPx={0} heightPx={96} />,
};

/** Where the item was planned before the day moved it. Opens the live item. */
export const Ghost: StoryObj = {
  render: () => (
    <GhostBlock
      item={itemInState("done-off-schedule", { title: "Morning run" })}
      topPx={0}
      heightPx={40}
      onOpen={() => {}}
    />
  ),
};

/** The moment the day moved — violet, the product's one "this moved" colour. */
export const Band: StoryObj = {
  render: () => (
    <ShiftBand topPx={0} deltaMin={60} reasonLabel="slept in" onOpen={() => {}} />
  ),
};
