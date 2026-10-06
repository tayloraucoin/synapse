import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { GapBand } from "./gap-band";

const meta: Meta<typeof GapBand> = {
  title: "Composed/Display/GapBand",
  component: GapBand,
  decorators: [
    (Story) => (
      <div className="relative h-40 w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof GapBand>;

/** A five-minute gap between two slots: a thin empty band, *+5* in the gutter (§3.11). */
export const Gap: Story = { args: { minutes: 5, topPx: 40, heightPx: 8 } };

/** A gap of zero is a hairline. */
export const Hairline: Story = { args: { minutes: 0, topPx: 40, heightPx: 0 } };

/** Slack between two blocks on the Schedule — *12 min*, never coloured (§10.1). */
export const Slack: Story = { args: { minutes: 12, topPx: 40, heightPx: 13, label: "slack" } };

/** The seam is a separator whose value is the minutes; drag or `g` then a number. */
export const Resizable: Story = {
  args: {
    minutes: 5,
    topPx: 40,
    heightPx: 8,
    resizable: true,
    between: { before: "Breath work", after: "Meditate" },
  },
};
