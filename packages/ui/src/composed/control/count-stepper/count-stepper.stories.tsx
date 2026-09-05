import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { CountStepper } from "./count-stepper";

/**
 * TP-02's weekly target. Distinct from `MinutesStepper` because the units
 * differ in kind: minutes are a duration a person estimates, a target is a
 * count they decide.
 */
const meta: Meta<typeof CountStepper> = {
  title: "Composed/Control/CountStepper",
  component: CountStepper,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

function Controlled({ initial }: { initial: number }) {
  const [value, setValue] = React.useState(initial);
  return (
    <CountStepper
      label="Days this week"
      helperText="How often you mean to run this."
      value={value}
      onChange={setValue}
      min={0}
      max={7}
      zeroLabel="none"
    />
  );
}

export const Default: StoryObj = { render: () => <Controlled initial={3} /> };

/** Zero is a real choice — the word says so where the digit reads as empty. */
export const Zero: StoryObj = { render: () => <Controlled initial={0} /> };

export const AtMax: StoryObj = { render: () => <Controlled initial={7} /> };
