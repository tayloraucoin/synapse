import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { LargeTargetRow } from "./large-target-row";

/**
 * SF-01 step 1, answered while running late, one-handed, probably walking:
 * four 56px targets, no scrolling, no typing. The selected one fills so the
 * answer is visible from arm's length.
 */
const meta: Meta<typeof LargeTargetRow> = {
  title: "Composed/Control/LargeTargetRow",
  component: LargeTargetRow,
  decorators: [(Story) => <div className="max-w-lg p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>(null);
    return (
      <LargeTargetRow
        label="How far behind?"
        value={value}
        onChange={setValue}
        options={[
          { value: "15", label: "15 min" },
          { value: "30", label: "30 min" },
          { value: "60", label: "1 h" },
          { value: "custom", label: "Other" },
        ]}
      />
    );
  },
};
