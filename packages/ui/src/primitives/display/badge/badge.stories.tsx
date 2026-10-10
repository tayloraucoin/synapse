import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "Primitives/Display/Badge",
  component: Badge,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Badge>;

/**
 * Two variants, and never a count — Epic 2 §0.1 rule 7 puts no numbers about
 * the day on a surface.
 */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex flex-wrap items-center gap-(--space-3) p-(--space-8)">
      <Badge variant="outline">Deep work</Badge>
      <Badge variant="outline">archived</Badge>
      <Badge variant="text">anytime</Badge>
      <Badge
        variant="outline"
        className="bg-category-leaf-chip text-foreground border-transparent"
      >
        Movement
      </Badge>
    </div>
  ),
};
