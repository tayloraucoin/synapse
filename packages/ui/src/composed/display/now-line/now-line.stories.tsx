import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { NowLine } from "./now-line";

/**
 * One of the three places accent-500 is permitted (official spec §9.3) — the
 * now line, the now/soon dot, and the active-timer border. Nothing else in
 * this package fills with it.
 */
const meta: Meta<typeof NowLine> = {
  title: "Composed/Display/NowLine",
  component: NowLine,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="relative h-32 w-80 ps-12 pe-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof NowLine>;

export const Now: Story = { args: { atMin: 585, topPx: 48, label: "9:45" } };

/** A closed day still shows where the line fell, in neutral, reading *closed*. */
export const Closed: Story = {
  args: { atMin: 1320, topPx: 48, label: "10:00", closed: true },
};
