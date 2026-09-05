import type { Meta, StoryObj } from "@storybook/react";

import { Spinner } from "./spinner";

const meta: Meta<typeof Spinner> = {
  title: "Primitives/Feedback/Spinner",
  component: Spinner,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

/** Inherits currentColor, and stops under reduced motion (§9.6). */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex items-center gap-(--space-4) p-(--space-6)">
      <Spinner />
      <span className="text-text-secondary">
        <Spinner />
      </span>
      <span className="bg-primary text-primary-foreground rounded-(--radius) p-(--space-2)">
        <Spinner />
      </span>
    </div>
  ),
};
