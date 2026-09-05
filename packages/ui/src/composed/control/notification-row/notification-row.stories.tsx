import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { NotificationRow } from "./notification-row";

/**
 * The time control appears only while the switch is on. A disabled field under
 * an off switch is furniture; hiding it makes the row's state readable at a
 * glance.
 *
 * A failed save reads *That didn't save — flip it again to retry.* The switch
 * is the retry affordance, so there is no second button to find.
 */
const meta: Meta<typeof NotificationRow> = {
  title: "Composed/Control/NotificationRow",
  component: NotificationRow,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="divide-hairline max-w-xl divide-y p-(--space-6)">
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Off: StoryObj = {
  render: function Render() {
    const [checked, setChecked] = React.useState(false);
    return (
      <NotificationRow
        id="day-close"
        label="Day close"
        description="A nudge when the day is ready to review."
        checked={checked}
        onCheckedChange={setChecked}
        value={{ kind: "time", value: "21:30", onChange: () => {} }}
      />
    );
  },
};

export const OnWithTime: StoryObj = {
  render: function Render() {
    const [checked, setChecked] = React.useState(true);
    const [time, setTime] = React.useState("21:30");
    return (
      <NotificationRow
        id="day-close-on"
        label="Day close"
        description="A nudge when the day is ready to review."
        checked={checked}
        onCheckedChange={setChecked}
        value={{ kind: "time", value: time, onChange: setTime }}
      />
    );
  },
};

export const WeeklyDayAndTime: StoryObj = {
  render: function Render() {
    const [checked, setChecked] = React.useState(true);
    return (
      <NotificationRow
        id="week-review"
        label="Week review"
        checked={checked}
        onCheckedChange={setChecked}
        value={{ kind: "day-time", day: 0, time: "18:00", onChange: () => {} }}
      />
    );
  },
};

export const FailedSave: StoryObj<typeof NotificationRow> = {
  args: {
    id: "failed",
    label: "Day close",
    checked: false,
    onCheckedChange: () => {},
    error: "That didn't save — flip it again to retry.",
  },
};
