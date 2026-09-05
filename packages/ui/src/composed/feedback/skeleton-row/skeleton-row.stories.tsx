import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { SkeletonBlock, SkeletonRow } from "./skeleton-row";

/**
 * No shimmer. The official spec's motion rule (§9.6 — digits change, nothing
 * else moves) applies to waiting as much as to running.
 */
const meta: Meta<typeof SkeletonRow> = {
  title: "Composed/Feedback/SkeletonRow",
  component: SkeletonRow,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof SkeletonRow>;

export const TwoLines: Story = {};

export const OneLine: Story = { args: { lines: 1 } };

export const NoLeading: Story = { args: { leading: false } };

/** A loading list keeps the height the real list will have. */
export const List: StoryObj = {
  render: () => (
    <>
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </>
  ),
};

export const Block: StoryObj = {
  render: () => <SkeletonBlock heightPx={160} />,
};
