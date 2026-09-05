import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { NumberUnitInput } from "./number-unit-input";

/**
 * The unit is the habit's own word, so it is text beside the field rather than
 * a select — there is nothing to choose. Chips apply a *delta*, which is how a
 * person thinks about trimming a day.
 */
const meta: Meta<typeof NumberUnitInput> = {
  title: "Composed/Control/NumberUnitInput",
  component: NumberUnitInput,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

export const Quantity: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<number | null>(12);
    return (
      <NumberUnitInput
        label="How many"
        unit="pages"
        value={value}
        onChange={setValue}
        min={0}
      />
    );
  },
};

export const WithChips: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<number | null>(90);
    return (
      <NumberUnitInput
        label="Time available"
        unit="min"
        value={value}
        onChange={setValue}
        min={0}
        max={720}
        chips={[
          { label: "−15", delta: -15 },
          { label: "−30", delta: -30 },
          { label: "−45", delta: -45 },
          { label: "−60", delta: -60 },
        ]}
      />
    );
  },
};

export const Decimal: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<number | null>(5.5);
    return (
      <NumberUnitInput
        label="Distance"
        unit="km"
        decimal
        value={value}
        onChange={setValue}
        min={0}
      />
    );
  },
};
