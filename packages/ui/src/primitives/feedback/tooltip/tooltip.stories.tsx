import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../control/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Primitives/Feedback/Tooltip",
  component: Tooltip,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

/**
 * WIDE ONLY. A tooltip needs a hover, and a phone has none — on compact the
 * same information is a visible line or an accessible label, never a tooltip.
 */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <TooltipProvider>
      <div className="p-(--space-6)">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">Monday</Button>
          </TooltipTrigger>
          <TooltipContent>done, moved</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};
