import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../control/button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta: Meta<typeof Popover> = {
  title: "Primitives/Feedback/Popover",
  component: Popover,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="p-(--space-6)">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Pick an icon</Button>
        </PopoverTrigger>
        <PopoverContent>Anchored surface over the page.</PopoverContent>
      </Popover>
    </div>
  ),
};
