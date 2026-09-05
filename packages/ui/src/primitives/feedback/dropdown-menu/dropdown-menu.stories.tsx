import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../control/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const meta: Meta<typeof DropdownMenu> = {
  title: "Primitives/Feedback/DropdownMenu",
  component: DropdownMenu,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

/** Items are 44px — a menu is reached with a thumb as often as a cursor. */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="p-(--space-6)">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="More">
            …
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};
