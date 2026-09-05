import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { CategoryBar } from "./category-bar";

/**
 * The bar is `role="img"` with a text summary; the legend beneath is the
 * accessible content. A person who cannot separate two hues reads the same
 * facts from the rows (official spec §9.3).
 */
const meta: Meta<typeof CategoryBar> = {
  title: "Composed/Display/CategoryBar",
  component: CategoryBar,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof CategoryBar>;

export const Week: Story = {
  args: {
    segments: [
      { key: "sky", name: "Deep work", minutes: 620 },
      { key: "leaf", name: "Health", minutes: 285 },
      { key: "clay", name: "Home", minutes: 140 },
      { key: null, name: "Uncategorised", minutes: 95 },
    ],
  },
};

/** Nothing tracked yet renders nothing — an empty bar is not information. */
export const Empty: Story = { args: { segments: [] } };
