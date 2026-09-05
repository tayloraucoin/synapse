import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Text } from "../../../primitives/typography/text";
import { ScreenFrame } from "./screen-frame";

/**
 * Two widths only. A third would be a decision made per screen, and screens
 * that disagree about their measure read as different applications.
 */
const meta: Meta<typeof ScreenFrame> = {
  title: "Composed/Layout/ScreenFrame",
  component: ScreenFrame,
  parameters: { layout: "fullscreen" },
  args: {
    children: (
      <Text as="p" variant="body">
        Content sits inside the frame at 16px on compact and 32px on wide, and
        is left-aligned on wide because the rail is on the left.
      </Text>
    ),
  },
  decorators: [
    (Story) => (
      <div className="bg-surface">
        <div className="bg-paper">
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ScreenFrame>;

export const TextWidth: Story = {};

export const CanvasWidth: Story = { args: { width: "canvas" } };

export const Prose: Story = { args: { prose: true } };

export const Unpadded: Story = { args: { padded: false } };
