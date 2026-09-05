import type { Meta, StoryObj } from "@storybook/react";

import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

const meta: Meta<typeof ToggleGroup> = {
  title: "Primitives/Control/ToggleGroup",
  component: ToggleGroup,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex flex-col gap-(--space-5) p-(--space-6)">
      <ToggleGroup type="single" defaultValue="30" variant="outline">
        {["15", "30", "60"].map((amount) => (
          <ToggleGroupItem key={amount} value={amount} aria-label={`Plus ${amount} minutes`}>
            +{amount}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <ToggleGroup type="multiple" defaultValue={["mon"]} variant="outline">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <ToggleGroupItem key={day} value={day.toLowerCase()}>
            {day}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  ),
};
