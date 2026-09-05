import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "./label";

const meta: Meta<typeof Label> = {
  title: "Primitives/Display/Label",
  component: Label,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex flex-col gap-(--space-3) p-(--space-6)">
      <Label htmlFor="a">Habit name</Label>
      <input id="a" className="border-hairline h-(--target) rounded-(--radius) border px-(--space-3)" />
    </div>
  ),
};
