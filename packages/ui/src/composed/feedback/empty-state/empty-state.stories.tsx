import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { EmptyState } from "./empty-state";

/**
 * One sentence, no illustration (official spec §9.7). An empty list is a
 * fact, not an occasion.
 */
const meta: Meta<typeof EmptyState> = {
  title: "Composed/Feedback/EmptyState",
  component: EmptyState,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="max-w-xl"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof EmptyState>;

export const TextOnly: Story = {
  args: { text: "Nothing on today's list yet." },
};

export const OneAction: Story = {
  args: {
    text: "No habits yet.",
    actions: [{ label: "Add a habit", onClick: () => {} }],
  },
};

/** The third reads as a ghost — a screen offering three equal buttons hasn't decided. */
export const ThreeActions: Story = {
  args: {
    text: "No template for this day.",
    actions: [
      { label: "Choose a template", onClick: () => {} },
      { label: "Add a one-off", onClick: () => {} },
      { label: "Leave it empty", onClick: () => {} },
    ],
  },
};

export const Inline: Story = {
  args: { text: "Nothing archived.", density: "inline" },
};
