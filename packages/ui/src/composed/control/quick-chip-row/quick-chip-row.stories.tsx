import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { QuickChipRow } from "./quick-chip-row";

/**
 * Actions, not states: each tap applies a delta and nothing stays selected,
 * which is why these are buttons and not toggles.
 */
const meta: Meta<typeof QuickChipRow> = {
  title: "Composed/Control/QuickChipRow",
  component: QuickChipRow,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj<typeof QuickChipRow> = {
  args: {
    label: "Quick adjustments",
    onApply: () => {},
    chips: [
      { label: "−15", delta: -15 },
      { label: "−30", delta: -30 },
      { label: "−45", delta: -45 },
      { label: "−60", delta: -60 },
    ],
  },
};
