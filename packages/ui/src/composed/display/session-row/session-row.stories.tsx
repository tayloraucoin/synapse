import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { SessionRow } from "./session-row";

const meta: Meta<typeof SessionRow> = {
  title: "Composed/Display/SessionRow",
  component: SessionRow,
  parameters: { layout: "fullscreen" },
  args: {
    startLabel: "7:22",
    endLabel: "7:31",
    minutes: 9,
    onEdit: () => {},
  },
  decorators: [
    (Story) => (
      <ul className="max-w-md p-(--space-6)">
        <Story />
      </ul>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SessionRow>;

export const FromTimer: Story = { args: { source: "timer" } };

/** *by hand* is not a warning — it says which kind of record this is. */
export const ByHand: Story = { args: { source: "manual" } };
