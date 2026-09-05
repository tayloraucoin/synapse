import type { CategoryKey } from "@syn/types";
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { CategoryChip } from "./category-chip";

const KEYS: readonly CategoryKey[] = [
  "leaf",
  "sky",
  "clay",
  "rose",
  "amber",
  "slate",
  "plum",
  "moss",
];

const meta: Meta<typeof CategoryChip> = {
  title: "Composed/Display/CategoryChip",
  component: CategoryChip,
  decorators: [(Story) => <div className="p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof CategoryChip>;

export const Default: Story = {
  args: { categoryKey: "leaf", name: "Health" },
};

/**
 * All eight pairings. Switch Storybook's theme to check the dark half — the
 * 800/200 steps are `color-mix()` derivations still marked
 * `[PROPOSED — needs sign-off]` in `preset.css` (§11 Q2).
 */
export const AllHues: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-(--space-2) p-(--space-6)">
      {KEYS.map((key) => (
        <CategoryChip key={key} categoryKey={key} name={key} />
      ))}
    </div>
  ),
};
