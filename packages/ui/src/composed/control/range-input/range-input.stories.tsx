import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { RangeInput, type RangeValue } from "./range-input";

/**
 * The pair is one fact, so it shares one helper and one error, and both inputs
 * point at the same `aria-describedby` — whichever has focus hears the same
 * rule. Not a slider (official spec §9.7).
 */
const meta: Meta<typeof RangeInput> = {
  title: "Composed/Control/RangeInput",
  component: RangeInput,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj = {
  render: function Render() {
    const [range, setRange] = React.useState<RangeValue>({ from: 30, to: 45 });
    return (
      <RangeInput
        label="How long it usually takes"
        helperText="A range, not a target."
        from={range.from}
        to={range.to}
        onChange={setRange}
      />
    );
  },
};

export const Empty: StoryObj<typeof RangeInput> = {
  args: {
    label: "How long it usually takes",
    from: null,
    to: null,
    onChange: () => {},
    required: true,
  },
};

/** Validation belongs to the parent: a range is only wrong against its habit. */
export const WithError: StoryObj<typeof RangeInput> = {
  args: {
    label: "How long it usually takes",
    from: 60,
    to: 30,
    onChange: () => {},
    error: "The second number should be the longer one.",
  },
};
