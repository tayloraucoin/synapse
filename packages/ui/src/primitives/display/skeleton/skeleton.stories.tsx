import type { Meta, StoryObj } from "@storybook/react";

import { Skeleton } from "./skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Primitives/Display/Skeleton",
  component: Skeleton,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

/** No shimmer, no pulse — identical under reduced motion (§5.9). */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex max-w-md flex-col gap-(--space-3) p-(--space-6)">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex min-h-(--row-min) items-center gap-(--space-3)">
          <Skeleton className="size-5" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-10" />
        </div>
      ))}
    </div>
  ),
};
