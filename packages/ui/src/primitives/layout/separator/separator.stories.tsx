import type { Meta, StoryObj } from "@storybook/react";

import { Separator } from "./separator";

const meta: Meta<typeof Separator> = {
  title: "Primitives/Layout/Separator",
  component: Separator,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Separator>;

/** 1px hairline. On the List, separation is rhythm — cards carry no border. */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex max-w-md flex-col gap-(--space-3) p-(--space-6)">
      <span>Morning</span>
      <Separator />
      <span>Afternoon</span>
      <div className="flex h-8 items-center gap-(--space-3)">
        <span>7:20</span>
        <Separator orientation="vertical" />
        <span>15 min</span>
      </div>
    </div>
  ),
};
