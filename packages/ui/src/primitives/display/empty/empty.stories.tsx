import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../control/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "./empty";

const meta: Meta<typeof Empty> = {
  title: "Primitives/Display/Empty",
  component: Empty,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Empty>;

/**
 * Two lines and at most two actions. No illustrations in v1 (official spec
 * §9.7), and the register is hospitality, not apology (§5.9).
 */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <Empty className="p-(--space-6)">
      <EmptyHeader>
        <EmptyTitle>Nothing planned today.</EmptyTitle>
        <EmptyDescription>Plan the day, or add one thing.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-(--space-3)">
          <Button>Plan this day</Button>
          <Button variant="secondary">Add a one-off</Button>
        </div>
      </EmptyContent>
    </Empty>
  ),
};
