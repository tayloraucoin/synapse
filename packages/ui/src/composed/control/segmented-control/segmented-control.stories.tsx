import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { SegmentedControl } from "./segmented-control";

/**
 * A VISIBLE label, unlike CC's `aria-label`-only version: a control whose name
 * is invisible is a control a sighted person has to infer. `helper` shows the
 * selected option's explanation, so the difference between two words is
 * readable without tapping.
 */
const meta: Meta<typeof SegmentedControl> = {
  title: "Composed/Control/SegmentedControl",
  component: SegmentedControl,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

export const When: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState("at");
    return (
      <SegmentedControl
        label="When"
        value={value}
        onChange={setValue}
        options={[
          { value: "at", label: "At a time", helper: "Starts at a set time." },
          {
            value: "window",
            label: "In a window",
            helper: "Any time inside a range.",
          },
          { value: "anytime", label: "Anytime", helper: "No time at all." },
        ]}
      />
    );
  },
};

export const TwoOptions: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState("soft");
    return (
      <SegmentedControl
        label="Timing"
        value={value}
        onChange={setValue}
        options={[
          { value: "soft", label: "Can move", helper: "Shifts with the day." },
          { value: "hard", label: "Fixed", helper: "Never moves." },
        ]}
      />
    );
  },
};

export const Disabled: StoryObj<typeof SegmentedControl<string>> = {
  args: {
    label: "When",
    value: "at",
    onChange: () => {},
    disabled: true,
    options: [
      { value: "at", label: "At a time" },
      { value: "anytime", label: "Anytime" },
    ],
  },
};

/**
 * UX v1.1 W5 (DYN-7): three segments stack under the label when they would
 * wrap — at 200% text, or in a narrow column. The container here is narrow
 * so the wrap shows without changing the browser's text size.
 */
export const ThreeSegmentsStacked: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState("work_waits");
    return (
      <div className="max-w-[240px]">
        <SegmentedControl
          label="When your morning runs long, what gives?"
          value={value}
          onChange={setValue}
          options={[
            { value: "work_waits", label: "Work waits" },
            { value: "routine_cut", label: "The routine gets cut" },
            { value: "depends", label: "Depends on the day" },
          ]}
        />
      </div>
    );
  },
};
