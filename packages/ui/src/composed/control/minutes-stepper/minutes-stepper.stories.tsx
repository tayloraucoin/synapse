import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { MinutesStepper } from "./minutes-stepper";

/**
 * Buttons move by 5, typing allows 1 — the difference between adjusting and
 * specifying. Type 200 and blur: the value clamps to the habit's range and the
 * note says why, for two seconds. Silently rewriting the number is the thing
 * to avoid.
 */
const meta: Meta<typeof MinutesStepper> = {
  title: "Composed/Control/MinutesStepper",
  component: MinutesStepper,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<number | null>(30);
    return (
      <MinutesStepper
        label="Takes"
        helperText="Bounded to the habit's range."
        value={value}
        onChange={setValue}
        min={20}
        max={60}
      />
    );
  },
};

export const AtLowerBound: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<number | null>(20);
    return (
      <MinutesStepper
        label="Takes"
        value={value}
        onChange={setValue}
        min={20}
        max={60}
      />
    );
  },
};

export const WithError: StoryObj<typeof MinutesStepper> = {
  args: {
    label: "Takes",
    value: null,
    onChange: () => {},
    min: 20,
    max: 60,
    error: "Say how long this usually takes.",
  },
};
