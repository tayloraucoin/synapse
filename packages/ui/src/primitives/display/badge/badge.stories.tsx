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
    <div className="flex flex-wrap items-center gap-(--space-3) p-(--space-6)">
      <Badge variant="outline">Deep work</Badge>
      <Badge variant="outline">archived</Badge>
      <Badge variant="text">anytime</Badge>
      <Badge
        variant="outline"
        className="bg-cat-leaf-100 text-cat-leaf-700 dark:bg-cat-leaf-800 dark:text-cat-leaf-200 border-transparent"
      >
        Movement
      </Badge>
    </div>
  ),
};
