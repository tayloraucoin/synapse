import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { TimeField } from "./time-field";

/**
 * The native picker on both platforms (Epic 1 §0.3) — the wheel on iOS, the
 * dial on Android. A custom picker would be a worse version of both plus a
 * keyboard story to write.
 *
 * The value is "HH:mm", a wall-clock string: a template slot has no date, so
 * it cannot be a `Date`.
 */
const meta: Meta<typeof TimeField> = {
  title: "Composed/Control/TimeField",
  component: TimeField,
  decorators: [(Story) => <div className="max-w-xs p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>("07:00");
    return <TimeField label="Starts at" value={value} onChange={setValue} />;
  },
};

export const Bounded: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>("07:20");
    return (
      <TimeField
        label="Started"
        helperText="Between waking and now."
        min="06:00"
        max="09:00"
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const WithError: StoryObj<typeof TimeField> = {
  args: {
    label: "Starts at",
    value: null,
    onChange: () => {},
    error: "Pick a time.",
  },
};
