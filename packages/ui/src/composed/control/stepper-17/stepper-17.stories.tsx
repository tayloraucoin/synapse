import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Stepper17, type Stepper17Value } from "./stepper-17";

/**
 * Native radios, so arrow keys, Tab-as-one-stop and the announcement come from
 * the browser. Number keys 1–7 select directly (cross-cutting §3.3) — click
 * a cell, then press 4.
 *
 * Never the accent: in this product accent-500 means *now*, and a rating is
 * not a moment in the day.
 */
const meta: Meta<typeof Stepper17> = {
  title: "Composed/Control/Stepper17",
  component: Stepper17,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

function Controlled(props: {
  initial?: Stepper17Value | null;
  resting?: Stepper17Value | null;
  captions?: boolean;
  error?: string;
}) {
  const [value, setValue] = React.useState<Stepper17Value | null>(
    props.initial ?? null,
  );
  return (
    <Stepper17
      label="Importance"
      helperText="How much this matters, in general."
      value={value}
      onChange={setValue}
      resting={props.resting}
      onReset={
        props.resting === undefined ? undefined : () => setValue(null)
      }
      captions={props.captions}
      error={props.error}
    />
  );
}

export const Empty: StoryObj = { render: () => <Controlled /> };

export const Selected: StoryObj = { render: () => <Controlled initial={5} /> };

/** The dashed ring is the life default, shown while nothing is chosen. */
export const WithResting: StoryObj = {
  render: () => <Controlled resting={4} />,
};

export const NoCaptions: StoryObj = {
  render: () => <Controlled initial={3} captions={false} />,
};

/** The error is a sentence in ink — never a red field (official spec §9.3). */
export const Error: StoryObj = {
  render: () => <Controlled error="Pick a number from 1 to 7." />,
};

export const Disabled: StoryObj<typeof Stepper17> = {
  args: {
    label: "Importance",
    value: 5,
    onChange: () => {},
    disabled: true,
  },
};
