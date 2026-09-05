import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { ReviewRegion } from "./review-region";

/**
 * RV-00 is four of these. Each loads and fails on its own — one dead query
 * must not replace three panels that loaded fine.
 */
const meta: Meta<typeof ReviewRegion> = {
  title: "Composed/Display/ReviewRegion",
  component: ReviewRegion,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="max-w-2xl px-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof ReviewRegion>;

export const Ready: Story = {
  args: {
    title: "Yesterday",
    status: "3 items to decide.",
    action: { label: "Review", onClick: () => {}, emphasis: "default" },
  },
};

export const Nothing: Story = {
  args: { title: "This week", status: "Nothing waiting." },
};

export const Loading: Story = { args: { title: "Today", status: "", loading: true } };

export const Failed: Story = {
  args: {
    title: "History",
    status: "",
    error: { label: "History didn't load.", onRetry: () => {} },
  },
};
