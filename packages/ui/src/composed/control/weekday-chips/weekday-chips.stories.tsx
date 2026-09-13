import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { WeekdayChips, type Weekday } from "./weekday-chips";

/**
 * The letters are decoration; the full weekday name is the accessible name.
 * "M T W T F S S" is unreadable to a screen reader and ambiguous even to a
 * person — two Ts, two Ss.
 *
 * Values are `Date.getDay()` (0 = Sunday); the display starts on Monday.
 */
const meta: Meta<typeof WeekdayChips> = {
  title: "Composed/Control/WeekdayChips",
  component: WeekdayChips,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

export const Weekdays: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<Weekday[]>([1, 2, 3, 4, 5]);
    return (
      <WeekdayChips
        label="Runs on"
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const None: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<Weekday[]>([]);
    return <WeekdayChips label="Runs on" value={value} onChange={setValue} />;
  },
};

/**
 * UX v1.1 §4.4 (DYN-7): a fixture picks a set of days, Monday-first — the
 * value here is `[0, 2, 4]` for Mon/Wed/Fri, as `fixtures.weekdays` stores it.
 */
export const FixtureDays: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<Weekday[]>([0, 2, 4]);
    return (
      <div className="flex flex-col gap-(--space-3)">
        <WeekdayChips label="Which days" indexing="monday" value={value} onChange={setValue} />
        <code className="text-text-secondary text-(length:--fs-caption)">{JSON.stringify(value)}</code>
      </div>
    );
  },
};
